from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import PlayerGame, PlayerSeason, Game
from .serializers import PlayerGameSerializer, PlayerSeasonSerializer, GameSerializer
from .utility.process_data_util import process_game
from rest_framework import serializers


# Create your views here.

@api_view(["GET"])
def get_player_game(request, game_id, player_id):
    pg = PlayerGame.objects.get(game_id=game_id, player_id=player_id)
    serializer = PlayerGameSerializer(pg)
    return Response(serializer.data)

@api_view(["GET"])
def get_player_season(request, season_id, player_id):
    player_season = PlayerSeason.objects.get(season_id=season_id, player_id=player_id)
    serializer = PlayerSeasonSerializer(player_season)
    return Response(serializer.data)

@api_view(["POST"])
def post_events(request, game_id):
    events = request.data.get("events", [])
    process_game(events, game_id)
    return Response({"message" : "Events processed succesfully"})

@api_view(["GET"])
def get_all_players_game(request, game_id):
    player_games = PlayerGame.objects.filter(game_id=game_id)
    serializer = PlayerGameSerializer(player_games, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def get_all_players_season(request, season_id):
    player_seasons = PlayerSeason.objects.filter(season_id=season_id)
    serializer = PlayerSeasonSerializer(player_seasons, many=True)
    return Response(serializer.data)

@api_view(["POST"])
def create_game(request):
    serializer = GameSerializer(data=request.data)
    if serializer.is_valid():
        game = serializer.save()
        return Response(GameSerializer(game).data)
    return Response(serializer.errors, status=400)

@api_view(["GET"])
def list_games(request):
    games = Game.objects.all()
    serializer = GameSerializer(games, many=True)
    return Response(serializer.data)