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
    
    @classmethod
    def choices(cls):
        return [(member.name, member.name) for member in cls]

# parameters: x_coord and y_coord of shot
# returns ShotZone of shot
def define_shot_zone(event):
    # Robustly extract x/y
    x = getattr(event, "x", None)
    y = getattr(event, "y", None)
    if x is None or y is None:
        x = getattr(event, "x_coord", 0)
        y = getattr(event, "y_coord", 0)

    REST_RADIUS        =   40     # 4 ft
    PAINT_X_OUTER      =   80     # 16 ft box half-width
    PAINT_X_INNER      =   60     # 12 ft inner box half-width
    PAINT_Y_MAX        =  142.5   # free-throw line
    THREE_POINT_RADIUS =  237.5   # 23'9"
    THREE_CORNER_X     =  220     # corner 3 x
    THREE_CORNER_Y     =   92.5   # corner 3 y (matches court lines)

    r = math.hypot(x, y)

    # 1) restricted area
    if r <= REST_RADIUS:
        return ShotZone.REST_AREA

    # 2) paint box
    if y <= PAINT_Y_MAX and abs(x) <= PAINT_X_OUTER:
        if abs(x) <= PAINT_X_INNER:
            return ShotZone.PAINT_C
        return ShotZone.PAINT_L if x < 0 else ShotZone.PAINT_R

    # 3) Corner threes first (independent of distance)
    if abs(x) >= THREE_CORNER_X and y <= THREE_CORNER_Y:
        return ShotZone.THREE_L if x < 0 else ShotZone.THREE_R

    # 4) Above-the-break three if outside the 23'9" arc
    is_three = r >= THREE_POINT_RADIUS

    # 5) bucket into L, LC, C, RC, R by angle from y-axis
    theta = math.degrees(math.atan2(x, y))  # angle relative to positive y-axis
    if theta < -30:
        side = "L"
    elif theta < -10:
        side = "LC"
    elif theta <= 10:
        side = "C"
    elif theta <= 30:
        side = "RC"
    else:
        side = "R"

    if is_three:
        return getattr(ShotZone, f"THREE_{side}")
    else:
        return getattr(ShotZone, f"MID_{side}")
