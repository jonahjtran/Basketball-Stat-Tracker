import pandas as pd
import numpy as np
from datetime import datetime
from enum import Enum, auto
from analytics import calculate_fg_percentage

class Action(Enum):
    MADE_TWO = auto()
    MADE_THREE = auto()
    MISSED_SHOT = auto()
    OFFENSIVE_REBOUND = auto()
    DEFENSIVE_REBOUND = auto()
    STEAL = auto()
    ASSIST = auto()
    BLOCK = auto()
    TURNOVER = auto()


class Event():
    def __init__(self, player_id, game_id, action, x_coord, y_coord):
        self.player_id = player_id
        self.game_id = game_id
        self.action = action
        self.x_coord = x_coord
        self.y_coord = y_coord

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


            
            
            




