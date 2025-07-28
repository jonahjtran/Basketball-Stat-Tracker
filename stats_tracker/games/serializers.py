from rest_framework import serializers
from .models import PlayerGame, PlayerSeason, Game

class PlayerGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerGame
        fields = "__all__"

class PlayerSeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerSeason
        fields = "__all__"

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'
