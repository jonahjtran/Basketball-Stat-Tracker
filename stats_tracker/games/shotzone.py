from enum import Enum, auto
import math

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

    # parameters: x_coord and y_coord of shot
# returns ShotZone of shot
def define_shot_zone(event):

    REST_RADIUS        =   40     # 4 ft
    PAINT_X_OUTER      =   80     # 16 ft box half-width
    PAINT_X_INNER      =   60     # 12 ft inner box half-width
    PAINT_Y_MAX        =  142.5   # free-throw line
    THREE_POINT_RADIUS =  237.5   # 23.75 ft
    THREE_CORNER_X     =  220     # corner 3 x
    THREE_CORNER_Y     =  140     # corner 3 y
    r = math.hypot(event.x_coord, event.y_coord)

    # 1) restricted area
    if r <= REST_RADIUS:
        return ShotZone.REST_AREA

    # 2) paint box
    if event.y_coord <= PAINT_Y_MAX and abs(event.x_coord) <= PAINT_X_OUTER:
        if abs(event.x_coord) <= PAINT_X_INNER:
            return ShotZone.PAINT_C
        return ShotZone.PAINT_L if event.x_coord < 0 else ShotZone.PAINT_R

    # 3) mid-range vs 3-pointer
    is_two = r <= THREE_POINT_RADIUS

    # 4) corner threes are a special case of 3-pt
    if not is_two and abs(event.x_coord) >= THREE_CORNER_X and event.y_coord <= THREE_CORNER_Y:
        return ShotZone.THREE_L if event.x_coord < 0 else ShotZone.THREE_R

    # 5) bucket into L, LC, C, RC, R by angle from y-axis
    θ = math.degrees(math.atan2(event.x_coord, event.y_coord))
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
