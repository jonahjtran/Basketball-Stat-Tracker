#!/usr/bin/env python3
"""
Script to populate PlayerCareer records with calculated statistics from Event data.
This will fix the issue where player statistics show as 0 despite having events.
"""

import os
import django
from django.conf import settings

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stats_tracker.settings')
django.setup()

from games.models import Player, PlayerCareer, Event, PlayerGame, PlayerSeason
from games.utility.process_data_util import process_player
from django.db.models import Count, Sum

def populate_player_careers():
    """Populate PlayerCareer records for all players"""
    print("🏀 Populating Player Career Statistics")
    print("=" * 50)
    
    players = Player.objects.all()
    print(f"Found {players.count()} players")
    
    for player in players:
        print(f"\nProcessing player: {player.name} (ID: {player.id})")
        
        # Count events for this player
        events_count = Event.objects.filter(player_id=player.id).count()
        print(f"  Events found: {events_count}")
        
        if events_count == 0:
            print(f"  ⚠️  No events found for {player.name}, skipping...")
            continue
        
        try:
            # Use the existing process_player function to calculate and create career stats
            process_player(player.id)
            print(f"  ✅ Career stats created/updated for {player.name}")
            
            # Verify the career record was created
            try:
                career = PlayerCareer.objects.get(player_id=player.id)
                print(f"  📊 Stats: {career.point} pts, {career.assist} ast, {career.games_played} games")
            except PlayerCareer.DoesNotExist:
                print(f"  ❌ Career record not found after processing")
                
        except Exception as e:
            print(f"  ❌ Error processing {player.name}: {e}")

def verify_player_careers():
    """Verify that PlayerCareer records have been created and populated"""
    print("\n🔍 Verifying Player Career Records")
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

def calculate_stats_from_events():
    """Calculate statistics directly from Event data to verify"""
    print("\n🧮 Calculating Statistics from Event Data")
    print("=" * 50)
    
    players = Player.objects.all()
    
    for player in players:
        print(f"\n{player.name}:")
        
        # Get all events for this player
        events = Event.objects.filter(player_id=player.id)
        
        # Calculate stats from events
        points = 0
        assists = 0
        steals = 0
        blocks = 0
        off_rebs = 0
        def_rebs = 0
        turnovers = 0
        
        for event in events:
            if event.action in ['made_two', 'made_three']:
                points += 2 if event.action == 'made_two' else 3
            elif event.action == 'assist':
                assists += 1
            elif event.action == 'steal':
                steals += 1
            elif event.action == 'block':
                blocks += 1
            elif event.action == 'off_reb':
                off_rebs += 1
            elif event.action == 'def_reb':
                def_rebs += 1
            elif event.action == 'turnover':
                turnovers += 1
        
        # Count unique games
        games_played = events.values('game_id').distinct().count()
        
        print(f"  Events: {events.count()}")
        print(f"  Games: {games_played}")
        print(f"  Points: {points}")
        print(f"  Assists: {assists}")
        print(f"  Steals: {steals}")
        print(f"  Blocks: {blocks}")
        print(f"  Off Reb: {off_rebs}")
        print(f"  Def Reb: {def_rebs}")
        print(f"  Turnovers: {turnovers}")

def main():
    """Main function to run the population script"""
    print("🏀 Basketball Stat Tracker - Player Career Population")
    print("=" * 60)
    
    # First, calculate stats from events to see what we should have
    calculate_stats_from_events()
    
    # Then populate the career records
    populate_player_careers()
    
    # Finally, verify the results
    verify_player_careers()
    
    print("\n✅ Population complete!")

if __name__ == "__main__":
    main() 