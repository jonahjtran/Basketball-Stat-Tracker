#!/usr/bin/env python3
"""
Simple test to check if heatmap functionality works
"""
import sys
import os
import django

# Add the backend/stats_tracker directory to the path
sys.path.append('/Users/jonahtran/Desktop/Github/Basketball Stat Tracker/backend/stats_tracker')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stats_tracker.settings')

# Load environment variables from .env.local
from dotenv import load_dotenv
load_dotenv('.env.local')

django.setup()

from games.heatmap import Heatmap
from games.models import Event, Player, Game, Season
from datetime import datetime

def test_heatmap():
    print("Testing heatmap functionality...")
    
    try:
        # Create test data with unique IDs
        import time
        timestamp = int(time.time())
        player = Player.objects.create(name="Test Player", external_id=f"test_player_{timestamp}")
        game = Game.objects.create(date="2025-01-01", external_id=f"test_game_{timestamp}", opponent="Test Team")
        season = Season.objects.create(
            name="Test Season",
            start_date="2025-01-01",
            end_date="2025-12-31",
            external_id=f"test_season_{timestamp}"
        )
        
        # Create some test events
        events = []
        for i in range(5):
            event = Event.objects.create(
                game=game,
                season=season,
                player=player,
                timestamp=datetime.now(),
                action="made_shot",
                x=float(i * 10),
                y=float(i * 10)
            )
            events.append(event)
        
        # Create heatmap
        heatmap = Heatmap(player_id=player.id, events=events)
        
        # Try to save as image
        image_buffer = heatmap.save_as_image()
        
        print(f"✅ Heatmap created successfully!")
        print(f"   - Player: {player.name}")
        print(f"   - Events processed: {len(events)}")
        print(f"   - Image buffer size: {len(image_buffer.getvalue())} bytes")
        
        # Upload to Supabase
        try:
            from games.utility.supabase_utility import upload_heatmap_to_supabase
            import os
            
            # Check environment variables
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_KEY")
            print(f"   - Supabase URL: {supabase_url}")
            print(f"   - Supabase Key: {'Set' if supabase_key else 'Not set'}")
            
            # Upload the heatmap
            heatmap_url = upload_heatmap_to_supabase(game.id, player.id, image_buffer)
            
            if "placeholder.com" in heatmap_url:
                print(f"⚠️  Using placeholder URL (Supabase client not initialized)")
                print(f"   - Heatmap URL: {heatmap_url}")
            else:
                print(f"✅ Heatmap uploaded to Supabase successfully!")
                print(f"   - Heatmap URL: {heatmap_url}")
            
            # Update the PlayerGame record with the heatmap URL
            from games.models import PlayerGame
            player_game, created = PlayerGame.objects.get_or_create(
                player_id=player,
                game_id=game,
                defaults={
                    "point": 0,
                    "assist": 0,
                    "steal": 0,
                    "block": 0,
                    "off_reb": 0,
                    "def_reb": 0,
                    "turnover": 0,
                    "shot_zone_stats": {},
                    "heatmap_url": heatmap_url
                }
            )
            
            if not created:
                player_game.heatmap_url = heatmap_url
                player_game.save()
            
            print(f"   - PlayerGame record updated with heatmap URL")
            
        except Exception as e:
            print(f"⚠️  Supabase upload failed: {e}")
            print("   - This might be due to missing environment variables or network issues")
            print("   - The heatmap was still created successfully locally")
        
        return True
        
    except Exception as e:
        print(f"❌ Heatmap test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_heatmap()
    sys.exit(0 if success else 1) 