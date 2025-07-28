from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import PlayerGame, PlayerSeason
from .serializers import PlayerGameSerializer, PlayerSeasonSerializer
from .utility.process_data_util import process_game




# Create your views here.

@api_view(["GET"])
def get_player_game(request, game_id, player_id):
    pg = PlayerGame.objects.get(game_id=game_id, player_id=player_id)
    serializer = PlayerGameSerializer(pg)
    return Response(serializer.data)

@api_view(["[GET]"])
def get_player_season(request, season_id, player_id):
    player_season = PlayerSeason.objects.get(season_id=season_id, player_id=player_id)
    serializer = PlayerSeasonSerializer(player_season)
    return Response(serializer.data)

@api_view("[Post]")
def post_events(request, game_id):
    events = request.data.get("events", [])
    process_game(events, game_id)
    return Response({"message" : "Events processed succesfully"})