import pandas as pd
import numpy as np
from datetime import datetime
from enum import Enum, auto

from analytics import calculate_fg_percentage, define_shot_zone
from event import Action


class ShotZone(Enum):
    MID_L = auto()
    MID_LC = auto()
    MID_C = auto()
    MID_RC = auto()
    MID_R = auto()
    THREE_L = auto()
    THREE_LC = auto()
    THREE_C = auto()
    THREE_RC = auto()
    THREE_R = auto()
    REST_AREA = auto()
    PAINT_L = auto()
    PAINT_C = auto()
    PAINT_R = auto()

# holds game stats for specific player during specific game
class Game():
    def __init__(self, player_id, game_id):
        self.player_id = player_id
        game_id = game_id
        self.shot_att = 0
        self.shot_avr = None
        self.points = 0
        self.off_reb = 0
        self.def_reb = 0
        self.steal = 0
        self.block = 0
        self.turnover = 0
        self.events = []
        self.df_zone_stats =  pd.DataFrame(
            0,
            index=list(ShotZone),
            columns=['attempts', 'makes'],
            dtype=float
        )

    def add_event(self, event):
        self.events.append(event)
        three_zones = [ShotZone.THREE_C, ShotZone.THREE_L, ShotZone.THREE_LC, ShotZone.THREE_R, ShotZone.THREE_RC]

        if event.action == Action.MADE_SHOT:
            zone = define_shot_zone(event)      # organize shot into shotzone
            self.shot_att += 1

            if zone in three_zones:             # check if player made a 3
                points += 3
            else:
                points += 2

            self.df_zone_stats.loc[self.df_zone_stats["index"] == zone, "attempts"] += 1        # update attempts in shotzone
            self.df_zone_stats.loc[self.df_zone_stats["index"] == zone, "makes"] += 1           # update makes in shotzone

        elif event.action == Action.MISSED_SHOT:
            zone = define_shot_zone(event)
            self.df_zone_stats.loc[self.df_zone_stats["index"] == zone, "attempts"] += 1        # update attempts in shotzone

        elif event.action == Action.OFFENSIVE_REBOUND:
            self.off_reb += 1
        elif event.action == Action.DEFENSIVE_REBOUND:
            self.def_reb += 1
        elif event.action == Action.STEAL:
            self.steal += 1
        elif event.action == Action.BLOCK:
            self.block += 1
        elif event.action == Action.TURNOVER:
            self.turnover += 1


            
            
            




