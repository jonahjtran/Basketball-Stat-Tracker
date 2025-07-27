from django.db import models
from .shotzone import ShotZone, define_shot_zone

# Create your models here.
class Player(models.Model):
    supabase_id = models.CharField(unique=True)
    name = models.CharField(max_length=100)

class Season(models.Model):
    supabase_id = models.CharField(unique=True)
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()

class Game(models.Model):
    supabase_id = models.CharField(unique=True)
    opponent = models.CharField(max_length=100)
    date = models.DateField()

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

