from django.urls import path
from . import views

urlpatterns = [
    path('heatmap/<int:game_id>/<int:player_id>/', views.player_heatmap, name='player_heatmap'),

    # GET endpoints
    path('player-game/<int:game_id>/<int:player_id>/', views.get_player_game, name='get_player_game'),
    path('player-season/<int:season_id>/<int:player_id>/', views.get_player_season, name='get_player_season'),
    path('player-stats/<int:player_id>/', views.get_player_stats, name='get_player_stats'),
    path('games/', views.list_games, name='list_games'),
    path('games/<int:game_id>/players/', views.get_all_players_game, name='get_all_players_game'),
    path('seasons/<int:season_id>/players/', views.get_all_players_season, name='get_all_players_season'),

    # POST endpoints
    path('events/<int:game_id>/', views.post_events, name='post_events'),
    path('games/create/', views.create_game, name='create_game'),

    # DELETE endpoints
    path('games/<int:game_id>/delete/', views.delete_game, name='delete_game'),
    path('seasons/<int:season_id>/<int:player_id>/delete/', views.delete_season, name='delete_season'),
    path('players/<int:player_id>/delete/', views.delete_player, name='delete_player'),
]