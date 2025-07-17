import pandas as pd
import numpy as np
from datetime import datetime
from enum import Enum, auto
from analytics import calculate_fg_percentage


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


class Game():
    def __init__(self):
        self.shot_att = 0
        self.shot_avr = None
        self.points = 0
        self.off_reb = 0
        self.def_reb = 0
        self.steal = 0
        self.block = 0
        self.turnover = 0
        self.df_events = pd.DataFrame(columns=['player_id', 'game_id', 'action', 'x_coord', 'y_coord'])
        self.df_zone_stats =  pd.DataFrame(
            0,
            index=list(ShotZone),
            columns=['attempts', 'makes', 'pct'],
            dtype=float
        )

    def add_event(self, event):
        if event.action == Action.MADE_TWO:
            calculate_fg_percentage(self.shot_avr, self.shot_att, True)
            self.shot_att += 1
            self.points += 2
        elif event.action == Action.MADE_THREE:
            calculate_fg_percentage(self.shot_avr, self.shot_att, True)
            self.shot_att += 1
            self.points += 3
        elif event.action == Action.MISSED_SHOT:
            calculate_fg_percentage(self.shot_avr, self.shot_att, False)
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


            
            
            




