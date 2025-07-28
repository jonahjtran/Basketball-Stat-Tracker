from django.db import transaction
from django.db.models import Sum, Count

from collections import defaultdict
from stats_tracker.games.models import PlayerSeason, PlayerGame, Event, ShotZone, Game
from stats_tracker.games.heatmap import Heatmap
from .supabase_utility import upload_heatmap_to_supabase


def process_game(events, game_id):
    player_game = defaultdict(list)

    for event in events:
        player_game[event.player_id].append(event)

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
            if e.action in [Event.Action.MADE_TWO, Event.Action.MADE_THREE]:
                stats["point"] += 2 if e.action == Event.Action.MADE_TWO else 3
                shot_zone_stats[e.shot_zone]["makes"] += 1
                shot_zone_stats[e.shot_zone]["attempts"] += 1
            elif e.action in [Event.Action.MISSED_TWO, Event.Action.MISSED_THREE]:
                shot_zone_stats[e.shot_zone]["attempts"] += 1

            if e.action == Event.Action.ASSIST:
                stats["assist"] += 1
            elif e.action == Event.Action.STEAL:
                stats["steal"] += 1
            elif e.action == Event.Action.BLOCK:
                stats["block"] += 1
            elif e.action == Event.Action.OFFENSIVE_REBOUND:
                stats["off_reb"] += 1
            elif e.action == Event.Action.DEFENSIVE_REBOUND:
                stats["def_reb"] += 1
            elif e.action == Event.Action.TURNOVER:
                stats["turnover"] += 1

        for zone, zstats in shot_zone_stats.items():
            if zstats["attempts"] > 0:
                zstats["fg_pct"] = zstats["makes"] / zstats["attempts"]
            else:
                zstats["fg_pct"] = 0.0

        heatmap = Heatmap(player_id, evts)
        image = heatmap.save_as_image()
        heatmap_url = upload_heatmap_to_supabase(game_id, player_id, image)  # Implement this separately


        with transaction.atomic():
            pg, _ = PlayerGame.objects.update_or_create(
                player_id=player_id,
                game_id=game_id,
                defaults={
                    **stats,
                    "shot_zone_stats": shot_zone_stats,
                    "heatmap_url": heatmap_url,
                },
            )
        process_season(player_id, Game.objects.get(id=game_id).season_id_id)

def process_season(player_id, season_id):
    # get PlayerGame rows for specific player and season
    player_games = PlayerGame.objects.filter(
        player_id = player_id,
        game_id__season_id = season_id
    )

    totals = player_games.aggregate(
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

    # stat averages
    gp = totals["games_played"] or 1
    averages = {
        "ppg" : (totals["points"] or 0) / gp,
        "apg" : (totals["assists"] or 0) / gp,
        "spg" : (totals["steals"] or 0) / gp,
        "bpg" : (totals["blocks"] or 0) / gp,
        "off_reb_per_game" : (totals["off_rebs"] or 0) / gp,
        "def_reb_per_game" : (totals["def_rebs"] or 0) / gp,
        "turnover_per_game": (totals["turnovers"] or 0) / gp,
    }

    events = list(Event.objects.filter(player_id=player_id, game_id__season_id=season_id))
    heatmap = Heatmap(player_id, events)
    image = heatmap.save_as_image()
    heatmap_url = upload_heatmap_to_supabase(season_id, player_id, image)

    PlayerSeason.objects.update_or_create(
        player_id=player_id,
        season_id=season_id,
        defaults={
            **averages,
            "shot_zone_stats": combined_shot_zones,
            "heatmap_url": heatmap_url,
        },
    )