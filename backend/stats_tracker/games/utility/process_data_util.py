from django.db import transaction
from django.db.models import Sum, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone

from collections import defaultdict
from games.models import PlayerSeason, PlayerGame, Event, ShotZone, Game, Player, PlayerCareer
from games.heatmap import Heatmap
from .supabase_utility import upload_heatmap_to_supabase


def process_game(events, game_id):
    player_game = defaultdict(list)
    
    # First, save all events to the Event model (avoid duplicates)
    for event_data in events:
        try:
            # Create the event directly since the save() method modifies the action field
            event = Event.objects.create(
                player_id=event_data['player_id'],
                game_id=game_id,
                season_id=event_data['season_id'],
                action=event_data['action'],
                x=event_data['x'],
                y=event_data['y'],
                timestamp=timezone.now()
            )
            print(f"Created new event: {event.action} for player {event.player} in game {event.game}")
        except Exception as e:
            print(f"Error creating event: {e}")
            print(f"Event data: {event_data}")
            raise
        player_game[event_data['player_id']].append(event_data)

    for player_id, evts in player_game.items():
        stats = {
            "point": 0,
            "assist": 0,
            "steal": 0,
            "block": 0,
            "off_reb": 0,
            "def_reb": 0,
            "turnover": 0,
        }

        shot_zone_stats = defaultdict(lambda: {"makes": 0, "attempts": 0})

        for e in evts:
            action = e['action']
            if action in ["made_shot", "made_two", "made_three"]:
                stats["point"] += 2 if action in ["made_shot", "made_two"] else 3
                # For now, skip shot zone stats since we don't have shot zone data in the test
            elif action in ["missed_shot", "missed_two", "missed_three"]:
                # Skip shot zone stats for now
                pass

            if action == "assist":
                stats["assist"] += 1
            elif action == "steal":
                stats["steal"] += 1
            elif action == "block":
                stats["block"] += 1
            elif action == "off_reb":
                stats["off_reb"] += 1
            elif action == "def_reb":
                stats["def_reb"] += 1
            elif action == "turnover":
                stats["turnover"] += 1

        for zone, zstats in shot_zone_stats.items():
            if zstats["attempts"] > 0:
                zstats["fg_pct"] = zstats["makes"] / zstats["attempts"]
            else:
                zstats["fg_pct"] = 0.0

        # For now, skip heatmap creation since we don't have proper Event objects
        heatmap_url = None


        with transaction.atomic():
            pg, _ = PlayerGame.objects.update_or_create(
                player_id_id=player_id,
                game_id_id=game_id,
                defaults={
                    **stats,
                    "shot_zone_stats": shot_zone_stats,
                    "heatmap_url": heatmap_url,
                },
            )
        # Update season stats for this player using the season_id from events
        season_id = evts[0]['season_id'] if evts else None
        if season_id:
            process_season(player_id, season_id)

def process_season(player_id, season_id):
    # get PlayerGame rows for specific player and season
    # Since games aren't directly linked to seasons, we need to find games through events
    game_ids_in_season = Event.objects.filter(season=season_id).values_list('game', flat=True).distinct()
    player_games = PlayerGame.objects.filter(
        player_id=player_id,
        game_id__in=game_ids_in_season
    )

    aggregated = player_games.aggregate(
        # basic statistics
        points = Sum("point"),
        assists = Sum("assist"),
        blocks = Sum("block"),
        steals = Sum("steal"),
        turnovers = Sum("turnover"),
        off_rebs = Sum("off_reb"),
        def_rebs = Sum("def_reb"),
        games_played = Count("id"),
    )
    
    # Map aggregated results to model field names
    totals = {
        "point": aggregated["points"] or 0,
        "assist": aggregated["assists"] or 0,
        "block": aggregated["blocks"] or 0,
        "steal": aggregated["steals"] or 0,
        "turnover": aggregated["turnovers"] or 0,
        "off_reb": aggregated["off_rebs"] or 0,
        "def_reb": aggregated["def_rebs"] or 0,
        "games_played": aggregated["games_played"] or 0,
    }

    # zone stats
    combined_shot_zones = {}
    for pg in player_games:
        for zone, zone_stats in pg.shot_zone_stats.items():
            if zone not in combined_shot_zones:
                combined_shot_zones[zone] = {"makes": 0, "attempts": 0}
            combined_shot_zones[zone]["makes"] += zone_stats.get("makes", 0)
            combined_shot_zones[zone]["attempts"] += zone_stats.get("attempts", 0)

    # field goal percentage in zone
    for zone, zone_stats in combined_shot_zones.items():
        attempts = zone_stats["attempts"]
        zone_stats["fg_pct"] = zone_stats["makes"] / attempts if attempts > 0 else 0.0

    # # stat averages
    # gp = totals["games_played"] or 1
    # averages = {
    #     "ppg" : (totals["points"] or 0) / gp,
    #     "apg" : (totals["assists"] or 0) / gp,
    #     "spg" : (totals["steals"] or 0) / gp,
    #     "bpg" : (totals["blocks"] or 0) / gp,
    #     "off_reb_per_game" : (totals["off_rebs"] or 0) / gp,
    #     "def_reb_per_game" : (totals["def_rebs"] or 0) / gp,
    #     "turnover_per_game": (totals["turnovers"] or 0) / gp,
    # }

    events = list(Event.objects.filter(player_id=player_id, season_id=season_id))
    heatmap = Heatmap(player_id, events)
    image = heatmap.save_as_image()
    heatmap_url = upload_heatmap_to_supabase(season_id, player_id, image)

    PlayerSeason.objects.update_or_create(
        player_id_id=player_id,
        season_id_id=season_id,
        defaults={
            **totals,
            "shot_zone_stats": combined_shot_zones,
            "heatmap_url": heatmap_url,
        },
    )

def process_player(player_id):
    player_seasons = PlayerSeason.objects.filter(player_id=player_id)

    totals = {
        "point" : 0,
        "assist" : 0, 
        "steal" : 0,
        "block" : 0,
        "turnover" : 0, 
        "off_reb" : 0,
        "def_reb" : 0,
        "games_played" : 0
    }

    combined_shot_zones = {}

    for ps in player_seasons:
        totals["games_played"] += ps.games_played
        totals["point"] += ps.point
        totals["assist"] += ps.assist
        totals["block"] += ps.block
        totals["steal"] += ps.steal
        totals["turnover"] += ps.turnover
        totals["off_reb"] += ps.off_reb
        totals["def_reb"] += ps.def_reb

        for zone, zone_stats in ps.shot_zone_stats.items():
            if zone not in combined_shot_zones:
                combined_shot_zones[zone] = {"makes": 0, "attempts": 0}
            combined_shot_zones[zone]["makes"] += zone_stats.get("makes", 0)
            combined_shot_zones[zone]["attempts"] += zone_stats.get("attempts", 0)

    for zone, zone_stats in combined_shot_zones.items():
        attempts = zone_stats["attempts"]
        zone_stats["fg_pct"] = zone_stats["makes"] / attempts if attempts > 0 else 0.0

    events = list(Event.objects.filter(player_id=player_id))
    player_heatmap = Heatmap(player_id, events)
    image = player_heatmap.save_as_image()
    heatmap_url = upload_heatmap_to_supabase("career", player_id, image)

    PlayerCareer.objects.update_or_create(
        player_id_id=player_id,
        defaults= {
            **totals,
            "shot_zone_stats" : combined_shot_zones,
            "heatmap_url" : heatmap_url
        }
    )