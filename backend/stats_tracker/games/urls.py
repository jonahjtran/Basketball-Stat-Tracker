from django.urls import path
from . import views

urlpatterns = [
    # Heatmap endpoints
    path('heatmap/<int:game_id>/<int:player_id>/', views.player_heatmap, name='player_heatmap'),
    path('heatmap/player/<int:player_id>/', views.generate_player_heatmap, name='generate_player_heatmap'),
    path('heatmap/season/<int:season_id>/', views.generate_season_heatmap, name='generate_season_heatmap'),
    path('heatmap/season/<int:season_id>/player/<int:player_id>/', views.generate_season_heatmap, name='generate_season_player_heatmap'),
    path('heatmap/game/<int:game_id>/', views.generate_game_heatmap, name='generate_game_heatmap'),
    path('heatmap/game/<int:game_id>/player/<int:player_id>/', views.generate_game_heatmap, name='generate_game_player_heatmap'),
    path('heatmap/player/<int:player_id>/season/<int:season_id>/', views.generate_player_season_heatmap, name='generate_player_season_heatmap'),

    # GET endpoints
    path('players/', views.list_players, name='list_players'),
    path('seasons/', views.list_seasons, name='list_seasons'),
    path('player-game/<int:game_id>/<int:player_id>/', views.get_player_game, name='get_player_game'),
    path('player-season/<int:season_id>/<int:player_id>/', views.get_player_season, name='get_player_season'),
    path('player-stats/<int:player_id>/', views.get_player_stats, name='get_player_stats'),
    path('games/', views.list_games, name='list_games'),
    path('games/<int:game_id>/players/', views.get_all_players_game, name='get_all_players_game'),
    path('seasons/<int:season_id>/players/', views.get_all_players_season, name='get_all_players_season'),

    # POST endpoints
    path('events/<int:game_id>/', views.post_events, name='post_events'),
    path('games/create/', views.create_game, name='create_game'),
    path('seasons/create/', views.create_season, name='create_season'),
    path('players/create/', views.create_player, name='create_player'),

    # DELETE endpoints
    path('games/<int:game_id>/delete/', views.delete_game, name='delete_game'),
    path('seasons/<int:season_id>/<int:player_id>/delete/', views.delete_season, name='delete_season'),
    path('players/<int:player_id>/delete/', views.delete_player, name='delete_player'),

    # PATCH/PUT endpoints
    path('players/<int:player_id>/update/', views.update_player, name='update_player'),
    path('seasons/<int:season_id>/update/', views.update_season, name='update_season'),
    path('games/<int:game_id>/update/', views.update_game, name='update_game'),

    # GET single resource endpoints
    path('games/<int:game_id>/', views.get_game, name='get_game'),
    path('players/<int:player_id>/', views.get_player, name='get_player'),
    path('seasons/<int:season_id>/', views.get_season, name='get_season'),
]