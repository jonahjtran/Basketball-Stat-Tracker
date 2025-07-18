import numpy as np
import math


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
def define_shot_zone(self):
    from game import ShotZone

    REST_RADIUS        =   40     # 4 ft
    PAINT_X_OUTER      =   80     # 16 ft box half-width
    PAINT_X_INNER      =   60     # 12 ft inner box half-width
    PAINT_Y_MAX        =  142.5   # free-throw line
    THREE_POINT_RADIUS =  237.5   # 23.75 ft
    THREE_CORNER_X     =  220     # corner 3 x
    THREE_CORNER_Y     =  140     # corner 3 y
    r = math.hypot(self.x_coord, self.y_coord)

    # 1) restricted area
    if r <= REST_RADIUS:
        return ShotZone.REST_AREA

    # 2) paint box
    if self.y_coord <= PAINT_Y_MAX and abs(self.x_coord) <= PAINT_X_OUTER:
        if abs(self.x_coord) <= PAINT_X_INNER:
            return ShotZone.PAINT_C
        return ShotZone.PAINT_L if self.x_coord < 0 else ShotZone.PAINT_R

    # 3) mid-range vs 3-pointer
    is_two = r <= THREE_POINT_RADIUS

    # 4) corner threes are a special case of 3-pt
    if not is_two and abs(self.x_coord) >= THREE_CORNER_X and self.y_coord <= THREE_CORNER_Y:
        return ShotZone.THREE_L if self.x_coord < 0 else ShotZone.THREE_R

    # 5) bucket into L, LC, C, RC, R by angle from y-axis
    θ = math.degrees(math.atan2(self.x_coord, self.y_coord))
    if θ < -30:
        side = "L"
    elif θ < -10:
        side = "LC"
    elif θ <= 10:
        side = "C"
    elif θ <= 30:
        side = "RC"
    else:
        side = "R"

    if is_two:
        return getattr(ShotZone, f"MID_{side}")
    else:
        return getattr(ShotZone, f"THREE_{side}")
