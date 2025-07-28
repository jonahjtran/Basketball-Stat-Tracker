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

