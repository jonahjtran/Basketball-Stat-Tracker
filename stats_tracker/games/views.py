from django.shortcuts import render
from django.http import FileResponse, Http404
from django.db import transaction

from collections import defaultdict
from .models import PlayerGame, Event, ShotZone, Game
from .heatmap import Heatmap
from .utility.supabase_utility import upload_heatmap_to_supabase



# Create your views here.

def player_heatmap(request, game_id, player_id):
    try:
        game   = Game.objects.get(supabase_id=game_id)
        events = game.events.filter(player__supabase_id=player_id)
    except Game.DoesNotExist:
        raise Http404("Game not found")

    hm = Heatmap(events)
    img_bytes = hm.save_as_image()  # modify to return BytesIO

    return FileResponse(img_bytes, content_type='image/png')

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
