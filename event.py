import math
from enum import Enum, auto
#from game import ShotZone

class Action(Enum):
    MADE_SHOT = auto()
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

