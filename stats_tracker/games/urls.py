from django.urls import path
from . import views

urlpatterns = [
    path('heatmap/<int:game_id>/<int:player_id>/', views.player_heatmap, name='player_heatmap'),
]