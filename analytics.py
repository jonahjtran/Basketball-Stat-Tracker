import numpy as np

# parameters: average (float), attempts (int), make (boolean)
# returns: new claculated average
def calculate_fg_percentage(average, attempts, made_shot):
    new_makes = (average/100) * attempts
    if made_shot:
        new_makes += 1
    new_attempts = attempts + 1
    new_average = float(new_makes)/float(new_attempts)
    return round(new_average * 100)

# parameters: x_coord and y_coord of shot
# returns ShotZone of shot
def define_shot_zone(x, y):
    
