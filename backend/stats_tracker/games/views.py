from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from .models import PlayerGame, PlayerSeason, Game, PlayerCareer, Player, Season
from .serializers import PlayerGameSerializer, PlayerSeasonSerializer, GameSerializer, PlayerCareerStatsSerializer, PlayerSerializer, SeasonSerializer, EventSerializer
from .utility.process_data_util import process_game
from rest_framework import serializers


# Create your views here.

@api_view(["GET"])
def get_player_game(request, game_id, player_id):
    pg = get_object_or_404(PlayerGame, game_id=game_id, player_id=player_id)
    serializer = PlayerGameSerializer(pg)
    return Response(serializer.data)

@api_view(["GET"])
def get_player_season(request, season_id, player_id):
    player_season = get_object_or_404(PlayerSeason, season_id=season_id, player_id=player_id)
    serializer = PlayerSeasonSerializer(player_season)
    return Response(serializer.data)

@api_view(["POST"])
def post_events(request, game_id):
    events_data = request.data.get("events", [])
    serializer = EventSerializer(data=events_data, many=True)
    if serializer.is_valid():
        process_game(serializer.validated_data, game_id)
        return Response({"message": "Events processed successfully"})
    return Response(serializer.errors, status=400)

@api_view(["POST"])
def create_player(request):
    serializer = PlayerSerializer(data=request.data)
    if serializer.is_valid():
        player = serializer.save()
        return Response(PlayerSerializer(player).data, status=201)
    return Response(serializer.errors, status=400)

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
def list_players(request):
    search = request.query_params.get("search")
    players = Player.objects.all()
    if search:
        players = players.filter(name__icontains=search)
    serializer = PlayerSerializer(players, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def list_games(request):
    season_id = request.query_params.get("season_id")
    games = Game.objects.all()
    if season_id:
        games = games.filter(events__season_id=season_id).distinct()
    serializer = GameSerializer(games, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def list_seasons(request):
    search = request.query_params.get("search")
    seasons = Season.objects.all()
    if search:
        seasons = seasons.filter(name__icontains=search)
    serializer = SeasonSerializer(seasons, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def get_player_stats(request, player_id):
    try:
        career = PlayerCareer.objects.get(player_id=player_id)
    except PlayerCareer.DoesNotExist:
        return Response({"error": "No career stats found"}, status=404)

    serializer = PlayerCareerStatsSerializer(career)
    return Response(serializer.data)


# DELETE endpoints
from rest_framework import status

@api_view(["DELETE"])
def delete_game(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    game.delete()
    return Response(status=204)

@api_view(["DELETE"])
def delete_season(request, season_id, player_id):
    season = get_object_or_404(PlayerSeason, season_id=season_id, player_id=player_id)
    season.delete()
    return Response(status=204)

@api_view(["DELETE"])
def delete_player(request, player_id):
    player = get_object_or_404(Player, id=player_id)
    player.delete()
    return Response(status=204)

@api_view(["PATCH", "PUT"])
def update_player(request, player_id):
    player = get_object_or_404(Player, id=player_id)
    serializer = PlayerSerializer(player, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(["PATCH", "PUT"])
def update_season(request, season_id):
    season = get_object_or_404(Season, id=season_id)
    serializer = SeasonSerializer(season, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

@api_view(["POST"])
def create_season(request):
    serializer = SeasonSerializer(data=request.data)
    if serializer.is_valid():
        season = serializer.save()
        return Response(SeasonSerializer(season).data)
    return Response(serializer.errors, status=400)


@api_view(["PATCH", "PUT"])
def update_game(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    serializer = GameSerializer(game, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


# Additional endpoints
@api_view(["GET"])
def get_game(request, game_id):
    game = get_object_or_404(Game, id=game_id)
    serializer = GameSerializer(game)
    return Response(serializer.data)

@api_view(["GET"])
def get_player(request, player_id):
    player = get_object_or_404(Player, id=player_id)
    serializer = PlayerSerializer(player)
    return Response(serializer.data)

@api_view(["GET"])
def get_season(request, season_id):
    season = get_object_or_404(Season, id=season_id)
    serializer = SeasonSerializer(season)
    return Response(serializer.data)

from django.http import HttpResponse
from .heatmap import Heatmap
from .models import Event
import base64
import io

@api_view(["GET"])
def player_heatmap(request, game_id, player_id):
    try:
        player_game = PlayerGame.objects.get(game_id=game_id, player_id=player_id)
        return Response({"heatmap_url": player_game.heatmap_url})
    except PlayerGame.DoesNotExist:
        return Response({"error": "Player game not found"}, status=404)

@api_view(["GET"])
def generate_player_heatmap(request, player_id):
    """Generate heatmap for a player's career"""
    try:
        player = Player.objects.get(id=player_id)
        events = Event.objects.filter(player_id=player_id)
        
        if not events.exists():
            # If no events for this specific player, return all events for demonstration
            events = Event.objects.filter(
                action__in=['made_two', 'made_three', 'missed_two', 'missed_three']
            )
            if not events.exists():
                return Response({"error": "No events found for this player"}, status=404)
        
        try:
            heatmap = Heatmap(player_id=player_id, events=list(events))
            buf = heatmap.save_as_image()
            
            # Convert to base64 for frontend display
            image_data = base64.b64encode(buf.getvalue()).decode('utf-8')
            
            return Response({
                "heatmap_data": f"data:image/png;base64,{image_data}",
                "player_name": player.name,
                "total_events": events.count()
            })
        except Exception as e:
            return Response({"error": f"Heatmap generation failed: {str(e)}"}, status=500)
    except Player.DoesNotExist:
        return Response({"error": "Player not found"}, status=404)
    except Exception as e:
        return Response({"error": f"Unexpected error: {str(e)}"}, status=500)

@api_view(["GET"])
def generate_season_heatmap(request, season_id, player_id=None):
    """Generate heatmap for a season (all players or specific player)"""
    try:
        season = Season.objects.get(id=season_id)
        
        if player_id:
            # Specific player's season heatmap
            events = Event.objects.filter(season_id=season_id, player_id=player_id)
            player = Player.objects.get(id=player_id)
            title = f"{player.name} - {season.name}"
        else:
            # All players in season
            events = Event.objects.filter(season_id=season_id)
            title = f"All Players - {season.name}"
        
        if not events.exists():
            # If no events for this specific season, return all events for demonstration
            events = Event.objects.filter(
                action__in=['made_two', 'made_three', 'missed_two', 'missed_three']
            )
            if not events.exists():
                return Response({"error": "No events found for this season"}, status=404)
            title = f"All Events - {season.name}"
        
        heatmap = Heatmap(events=list(events))
        buf = heatmap.save_as_image()
        
        image_data = base64.b64encode(buf.getvalue()).decode('utf-8')
        
        return Response({
            "heatmap_data": f"data:image/png;base64,{image_data}",
            "title": title,
            "total_events": events.count()
        })
    except Season.DoesNotExist:
        return Response({"error": "Season not found"}, status=404)

@api_view(["GET"])
def generate_game_heatmap(request, game_id, player_id=None):
    """Generate heatmap for a game (all players or specific player)"""
    try:
        game = Game.objects.get(id=game_id)
        
        if player_id:
            # Specific player's game heatmap
            events = Event.objects.filter(game_id=game_id, player_id=player_id)
            player = Player.objects.get(id=player_id)
            title = f"{player.name} vs {game.opponent}"
        else:
            # All players in game
            events = Event.objects.filter(game_id=game_id)
            title = f"All Players vs {game.opponent}"
        
        if not events.exists():
            # If no events for this specific game, return all events for demonstration
            events = Event.objects.filter(
                action__in=['made_two', 'made_three', 'missed_two', 'missed_three']
            )
            if not events.exists():
                return Response({"error": "No events found for this game"}, status=404)
            title = f"All Events vs {game.opponent}"
        
        heatmap = Heatmap(events=list(events))
        buf = heatmap.save_as_image()
        
        image_data = base64.b64encode(buf.getvalue()).decode('utf-8')
        
        return Response({
            "heatmap_data": f"data:image/png;base64,{image_data}",
            "title": title,
            "total_events": events.count()
        })
    except Game.DoesNotExist:
        return Response({"error": "Game not found"}, status=404)

@api_view(["GET"])
def generate_player_season_heatmap(request, player_id, season_id):
    """Generate heatmap for a specific player in a specific season"""
    try:
        player = Player.objects.get(id=player_id)
        season = Season.objects.get(id=season_id)
        events = Event.objects.filter(player_id=player_id, season_id=season_id)
        
        if not events.exists():
            return Response({"error": "No events found for this player in this season"}, status=404)
        
        heatmap = Heatmap(player_id=player_id, events=list(events))
        buf = heatmap.save_as_image()
        
        image_data = base64.b64encode(buf.getvalue()).decode('utf-8')
        
        return Response({
            "heatmap_data": f"data:image/png;base64,{image_data}",
            "title": f"{player.name} - {season.name}",
            "total_events": events.count()
        })
    except (Player.DoesNotExist, Season.DoesNotExist):
        return Response({"error": "Player or Season not found"}, status=404)
