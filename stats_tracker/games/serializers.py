from rest_framework import serializers
from .models import PlayerGame, PlayerSeason

class PlayerGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerGame
        fields = "__all__"

class PlayerSeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerSeason
        fields = "__all__"