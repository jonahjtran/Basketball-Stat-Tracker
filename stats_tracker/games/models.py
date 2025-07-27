from django.db import models

# Create your models here.
class Player(models.Model):
    supabase_id = models.IntegerField(unique=True)
    name = models.CharField(max_length=100)

class Season(models.Model):
    supabase_id = models.IntegerField(unqiue=True)
    name = models.CharField(max_length=100)
    start_date = models.DateField
    end_date = models.DateField

class Game(models.Model):
    supabase_id = models.IntegerField(unique=True)
    opponent = models.CharField(max_length=100)
    date = models.DateField

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

    game       = models.ForeignKey(Game, on_delete=models.CASCADE, related_name="events")
    season     = models.ForeignKey(Season, on_delete=models.CASCADE, related_name="events")
    player     = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="events")
    timestamp  = models.DateTimeField()
    action     = models.CharField(max_length=10, choices=Action.choices)
    x          = models.FloatField()
    y          = models.FloatField()

