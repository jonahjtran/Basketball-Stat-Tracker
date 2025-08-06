#!/usr/bin/env python3
"""
Script to populate PlayerSeason records with calculated statistics from Event data.
This will enable season statistics functionality.
"""

import os
import django
from django.conf import settings

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stats_tracker.settings')
django.setup()

from games.models import Player, PlayerSeason, Event, Game, Season
from games.utility.process_data_util import process_season
from django.db.models import Count

def create_test_season():
    """Create a test season if none exists"""
    season, created = Season.objects.get_or_create(
        external_id="2024-season",
        defaults={
            "name": "2024 Season",
            "start_date": "2024-01-01",
            "end_date": "2024-12-31"
        }
    )
    
    if created:
        print(f"✅ Created test season: {season.name}")
    else:
        print(f"✅ Using existing season: {season.name}")
    
    return season

def update_games_with_season(season):
    """Update all games to belong to the test season"""
    games = Game.objects.all()
    games_updated = 0
    
    for game in games:
        # Update events for this game to include the season
        events_updated = Event.objects.filter(game_id=game.id).update(season_id=season.id)
        games_updated += 1
        print(f"  Updated game {game.id} with {events_updated} events")
    
    print(f"✅ Updated {games_updated} games with season {season.name}")

def populate_player_season_stats():
    """Populate PlayerSeason records for all players and seasons"""
    print("🏀 Populating Player Season Statistics")
    print("=" * 50)
    
    # Create test season
    season = create_test_season()
    
    # Update games with season
    update_games_with_season(season)
    
    players = Player.objects.all()
    print(f"Found {players.count()} players")
    
    for player in players:
        print(f"\nProcessing player: {player.name} (ID: {player.id}) for season {season.name}")
        
        # Count events for this player in this season
        events_count = Event.objects.filter(player_id=player.id, season_id=season.id).count()
        print(f"  Events found: {events_count}")
        
        if events_count == 0:
            print(f"  ⚠️  No events found for {player.name} in {season.name}, skipping...")
            continue
        
        # Calculate statistics from events
        events = Event.objects.filter(player_id=player.id, season_id=season.id)
        
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
        print(f"     Games: {stats['games_played']}")
        
        # Update or create PlayerSeason record
        try:
            player_season, created = PlayerSeason.objects.update_or_create(
                player_id_id=player.id,
                season_id_id=season.id,
                defaults={
                    **stats,
                    "shot_zone_stats": {},  # We'll add this later if needed
                    "heatmap_url": None
                }
            )
            
            if created:
                print(f"  ✅ Created new season record")
            else:
                print(f"  ✅ Updated existing season record")
                
        except Exception as e:
            print(f"  ❌ Error updating season record: {e}")

def verify_season_stats():
    """Verify that PlayerSeason records have been created and populated"""
    print("\n🔍 Verifying Player Season Records")
    print("=" * 50)
    
    seasons = PlayerSeason.objects.all()
    print(f"Total PlayerSeason records: {seasons.count()}")
    
    for season_record in seasons:
        print(f"\n{season_record.player_id.name} - {season_record.season_id.name}:")
        print(f"  Points: {season_record.point}")
        print(f"  Assists: {season_record.assist}")
        print(f"  Games Played: {season_record.games_played}")
        
        # Check if stats are all 0
        if all([
            season_record.point == 0, season_record.assist == 0, season_record.steal == 0,
            season_record.block == 0, season_record.off_reb == 0, season_record.def_reb == 0,
            season_record.turnover == 0
        ]):
            print(f"  ⚠️  All stats are 0 - this might indicate an issue")
        else:
            print(f"  ✅ Statistics look good!")

def main():
    """Main function to run the population script"""
    print("🏀 Basketball Stat Tracker - Season Statistics Population")
    print("=" * 60)
    
    # Populate the season statistics
    populate_player_season_stats()
    
    # Verify the results
    verify_season_stats()
    
    print("\n✅ Season statistics population complete!")
    print("\nNext steps:")
    print("1. Navigate to Analytics → Seasons")
    print("2. Click on a season card to view detailed statistics")

if __name__ == "__main__":
    main()