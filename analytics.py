import numpy as np

# parameters: average (float), attempts (int), make (boolean)
# returns: new claculated average
def calculate_fg_percentage(average, attempts, made_shot):
    new_makes = (average/100) * attempts
    if made_shot:
        new_makes += 1
    new_attempts = attempts + 1
    new_average = new_makes / new_attempts

def calculate_zone_
