#!/usr/bin/env python3
"""
Script to fix player statistics by calculating them directly from Event data.
This will ensure that PlayerCareer records have the correct statistics.
"""

import os
import django
from django.conf import settings

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stats_tracker.settings')
django.setup()

from games.models import Player, PlayerCareer, Event, PlayerGame
from games.heatmap import Heatmap
from games.utility.supabase_utility import upload_heatmap_to_supabase
from django.db.models import Count

def calculate_player_stats_from_events():
    """Calculate player statistics directly from Event data and update PlayerCareer"""
    print("🏀 Calculating Player Statistics from Events")
    print("=" * 50)
    
    players = Player.objects.all()
    print(f"Found {players.count()} players")
    
    for player in players:
        print(f"\nProcessing player: {player.name} (ID: {player.id})")
        
        # Get all events for this player
        events = Event.objects.filter(player_id=player.id)
        events_count = events.count()
        print(f"  Events found: {events_count}")
        
        if events_count == 0:
            print(f"  ⚠️  No events found for {player.name}, skipping...")
            continue
        
        # Calculate statistics from events
        stats = {
            "point": 0.0,
            "assist": 0.0,
            "steal": 0.0,
            "block": 0.0,
            "off_reb": 0.0,
            "def_reb": 0.0,
            "turnover": 0.0,
            "games_played": 0
        }
        
        # Count unique games
        games_played = events.values('game_id').distinct().count()
        stats["games_played"] = games_played
        
        # Calculate stats from each event
        for event in events:
            if event.action in ['made_two', 'made_three']:
                stats["point"] += 2 if event.action == 'made_two' else 3
            elif event.action == 'assist':
                stats["assist"] += 1
            elif event.action == 'steal':
                stats["steal"] += 1
            elif event.action == 'block':
                stats["block"] += 1
            elif event.action == 'off_reb':
                stats["off_reb"] += 1
            elif event.action == 'def_reb':
                stats["def_reb"] += 1
            elif event.action == 'turnover':
                stats["turnover"] += 1
        
        print(f"  📊 Calculated stats:")
        print(f"     Points: {stats['point']}")
        print(f"     Assists: {stats['assist']}")
        print(f"     Steals: {stats['steal']}")
        print(f"     Blocks: {stats['block']}")
        print(f"     Off Reb: {stats['off_reb']}")
        print(f"     Def Reb: {stats['def_reb']}")
        print(f"     Turnovers: {stats['turnover']}")
        print(f"     Games: {stats['games_played']}")
        
        # Generate heatmap
        try:
            player_heatmap = Heatmap(player_id=player.id, events=list(events))
            image = player_heatmap.save_as_image()
            heatmap_url = upload_heatmap_to_supabase("career", player.id, image)
            print(f"  🗺️  Heatmap generated")
        except Exception as e:
            print(f"  ⚠️  Heatmap generation failed: {e}")
            heatmap_url = None
        
        # Update or create PlayerCareer record
        try:
            career, created = PlayerCareer.objects.update_or_create(
                player_id_id=player.id,
                defaults={
                    **stats,
                    "shot_zone_stats": {},  # We'll add this later if needed
                    "heatmap_url": heatmap_url
                }
            )
            
            if created:
                print(f"  ✅ Created new career record")
            else:
                print(f"  ✅ Updated existing career record")
                
        except Exception as e:
            print(f"  ❌ Error updating career record: {e}")

def verify_fixed_stats():
    """Verify that the statistics are now correct"""
    print("\n🔍 Verifying Fixed Statistics")
    print("=" * 50)
    
    careers = PlayerCareer.objects.all()
    print(f"Total PlayerCareer records: {careers.count()}")
    
    for career in careers:
        print(f"\n{career.player_id.name}:")
        print(f"  Points: {career.point}")
        print(f"  Assists: {career.assist}")
        print(f"  Steals: {career.steal}")
        print(f"  Blocks: {career.block}")
        print(f"  Off Reb: {career.off_reb}")
        print(f"  Def Reb: {career.def_reb}")
        print(f"  Turnovers: {career.turnover}")
        print(f"  Games Played: {career.games_played}")
        
        # Check if stats are all 0
        if all([
            career.point == 0, career.assist == 0, career.steal == 0,
            career.block == 0, career.off_reb == 0, career.def_reb == 0,
            career.turnover == 0
        ]):
            print(f"  ⚠️  All stats are 0 - this might indicate an issue")
        else:
            print(f"  ✅ Statistics look good!")

def test_api_endpoint():
    """Test the API endpoint to make sure it returns the correct data"""
    print("\n🧪 Testing API Endpoint")
    print("=" * 50)
    
    # Test the get_player_stats endpoint
    from django.test import RequestFactory
    from games.views import get_player_stats
    
    factory = RequestFactory()
    
    players = Player.objects.all()[:3]  # Test first 3 players
    
    for player in players:
        print(f"\nTesting API for {player.name}:")
        
        try:
            request = factory.get(f'/games/players/{player.id}/stats/')
            response = get_player_stats(request, player.id)
            
            if response.status_code == 200:
                data = response.data
                print(f"  ✅ API Response:")
                print(f"     Points: {data.get('points', 0)}")
                print(f"     Assists: {data.get('assists', 0)}")
                print(f"     Games: {data.get('games_played', 0)}")
            else:
                print(f"  ❌ API Error: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ API Test failed: {e}")

def main():
    """Main function to run the fix"""
    print("🏀 Basketball Stat Tracker - Fix Player Statistics")
    print("=" * 60)
    
    # Calculate and update player statistics
    calculate_player_stats_from_events()
    
    # Verify the results
    verify_fixed_stats()
    
    # Test the API endpoint
    test_api_endpoint()
    
    print("\n✅ Fix complete!")
    print("\nNext steps:")
    print("1. Update the frontend to use real API data instead of mock data")
    print("2. Test the player detail page to see the correct statistics")

if __name__ == "__main__":
    main() 