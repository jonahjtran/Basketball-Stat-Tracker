from rest_framework import serializers

class EventSerializer(serializers.Serializer):
    player_id = serializers.IntegerField()
    season_id = serializers.IntegerField()
    action = serializers.CharField()
    x = serializers.FloatField()
    y = serializers.FloatField()

    def validate_action(self, value):
        valid_actions = [
            "made_shot", "missed_shot", "off_reb", "def_reb",
            "steal", "assist", "block", "turnover",
            "made_two", "made_three", "missed_two", "missed_three"
        ]
        if value not in valid_actions:
            raise serializers.ValidationError("Invalid action type.")
        return value
from rest_framework import serializers
from .models import PlayerGame, PlayerSeason, Game, PlayerCareer, Player, Season

class PlayerGameSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source="player_id.name", read_only=True)
    points = serializers.IntegerField(source="point", read_only=True)
    assists = serializers.IntegerField(source="assist", read_only=True)
    steals = serializers.IntegerField(source="steal", read_only=True)
    blocks = serializers.IntegerField(source="block", read_only=True)
    offensive_rebounds = serializers.IntegerField(source="off_reb", read_only=True)
    defensive_rebounds = serializers.IntegerField(source="def_reb", read_only=True)
    turnovers = serializers.IntegerField(source="turnover", read_only=True)

    class Meta:
        model = PlayerGame
        fields = "__all__"

class PlayerSeasonSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source="player_id.name", read_only=True)
    points = serializers.FloatField(source="point", read_only=True)
    assists = serializers.FloatField(source="assist", read_only=True)
    steals = serializers.FloatField(source="steal", read_only=True)
    blocks = serializers.FloatField(source="block", read_only=True)
    offensive_rebounds = serializers.FloatField(source="off_reb", read_only=True)
    defensive_rebounds = serializers.FloatField(source="def_reb", read_only=True)
    turnovers = serializers.FloatField(source="turnover", read_only=True)

    class Meta:
        model = PlayerSeason
        fields = "__all__"

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'


class PlayerCareerStatsSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source="player_id.name", read_only=True)
    points = serializers.FloatField(source="point", read_only=True)
    assists = serializers.FloatField(source="assist", read_only=True)
    steals = serializers.FloatField(source="steal", read_only=True)
    blocks = serializers.FloatField(source="block", read_only=True)
    offensive_rebounds = serializers.FloatField(source="off_reb", read_only=True)
    defensive_rebounds = serializers.FloatField(source="def_reb", read_only=True)
    turnovers = serializers.FloatField(source="turnover", read_only=True)
    averages = serializers.SerializerMethodField()

    class Meta:
        model = PlayerCareer
        fields = [
            "player_name",
            "games_played",
            "points", "assists", "steals", "blocks",
            "offensive_rebounds", "defensive_rebounds", "turnovers",
            "shot_zone_stats", "averages"
        ]

    def get_averages(self, obj):
        gp = obj.games_played or 0
        if gp == 0:
            return {}
        return {
            "ppg": round(obj.point / gp, 1),
            "apg": round(obj.assist / gp, 1),
            "spg": round(obj.steal / gp, 1),
            "bpg": round(obj.block / gp, 1),
            "off_reb_per_game": round(obj.off_reb / gp, 1),
            "def_reb_per_game": round(obj.def_reb / gp, 1),
            "turnovers_per_game": round(obj.turnover / gp, 1),
        }

class SeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Season
        fields = "__all__"