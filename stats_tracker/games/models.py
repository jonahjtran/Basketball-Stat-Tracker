from django.db import models
from .shotzone import ShotZone, define_shot_zone

# Create your models here.
class Player(models.Model):
    external_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)

class PlayerCareer(models.Model):
    player_id = models.OneToOneField(blank=True, null=True)

    heatmap_url = models.URLField(blank=True, null=True)

    point = models.FloatField(default=0.0)
    assist = models.FloatField(default=0.0)
    steal = models.FloatField(default=0.0)
    block = models.FloatField(default=0.0)
    off_reb = models.FloatField(default=0.0)
    def_reb = models.FloatField(default=0.0)
    turnover = models.FloatField(default=0.0)

    shot_zone_stats = models.JSONField(default=dict)

class Season(models.Model):
    external_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()

class PlayerSeason(models.Model):
    player_id = models.ForeignKey(Player, on_delete=models.CASCADE)
    season_id = models.ForeignKey(Season, on_delete=models.CASCADE)

    heatmap_url = models.URLField(blank=True, null=True)

    games_played = models.IntegerField(default=0)

    point = models.FloatField(default=0.0)           
    assist = models.FloatField(default=0.0)                
    steal = models.FloatField(default=0.0)                
    block = models.FloatField(default=0.0)                      
    off_reb = models.FloatField(default=0.0)           
    def_reb = models.FloatField(default=0.0)           
    turnover = models.FloatField(default=0.0)          

    shot_zone_stats = models.JSONField(default=dict)

    class Meta:
        unique_together = ("player_id", "season_id")


class Game(models.Model):
    external_id = models.CharField(max_length=50, unique=True)
    opponent = models.CharField(max_length=100)
    date = models.DateField()

class PlayerGame(models.Model):
    player_id = models.ForeignKey(Player, on_delete=models.CASCADE)
    game_id   = models.ForeignKey(Game, on_delete=models.CASCADE)

    # heatmap
    heatmap_url = models.URLField(blank=True, null=True)

    # basic stats
    point = models.IntegerField(default=0)
    assist = models.IntegerField(default=0)
    steal = models.IntegerField(default=0)
    block = models.IntegerField(default=0)
    off_reb = models.IntegerField(default=0)
    def_reb = models.IntegerField(default=0)
    turnover = models.IntegerField(default=0)

    # shotzone averages and attempts
    shot_zone_stats = models.JSONField(default=dict)

    class Meta:
        unique_together = ("player_id", "game_id")


class Event(models.Model):
    class Action(models.TextChoices):
        MADE_SHOT = "made_shot"
        MISSED_SHOT = "missed_shot"
        OFFENSIVE_REBOUND = "off_reb"
        DEFENSIVE_REBOUND = "def_reb"
        STEAL = "steal"
        ASSIST = "assist"
        BLOCK = "block"
        TURNOVER = "turnover"
        MADE_TWO = "made_two"
        MADE_THREE = "made_three"
        MISSED_TWO = "missed_two"
        MISSED_THREE = "missed_three"

    game       = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="events", db_index=True)
    season     = models.ForeignKey(Season, on_delete=models.CASCADE, related_name="events", db_index=True)
    player     = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="events", db_index=True)
    timestamp  = models.DateTimeField()
    action     = models.CharField(max_length=36, choices=Action.choices)
    x          = models.FloatField()
    y          = models.FloatField()
    shot_zone   = models.CharField(max_length=100, choices= ShotZone.choices, blank=True, null=True, db_index=True)

    def save(self, *args, **kwargs):
        if self.action in {
            self.Action.MADE_SHOT, self.Action.MISSED_SHOT,
        }:
            self.shot_zone = define_shot_zone(self.x, self.y).name
            if self.action == self.Action.MADE_SHOT and  self.shot_zone in {ShotZone.THREE_C, ShotZone.THREE_L, ShotZone.THREE_LC, ShotZone.THREE_R, ShotZone.THREE_RC}:
                self.action = self.Action.MADE_THREE
            elif self.action == self.Action.MISSED_SHOT and  self.shot_zone in {ShotZone.THREE_C, ShotZone.THREE_L, ShotZone.THREE_LC, ShotZone.THREE_R, ShotZone.THREE_RC}:
                self.action = self.Action.MISSED_THREE
            elif self.action == self.Action.MISSED_SHOT:
                self.action = self.Action.MISSED_TWO
            else:
                self.action = self.Action.MADE_TWO
        else:
            self.shot_zone = None
        super().save(*args, **kwargs)

