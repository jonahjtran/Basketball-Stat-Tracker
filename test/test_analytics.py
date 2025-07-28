import pytest
import math
import sys
sys.path.append('/Users/jonahtran/Desktop/Github/Basketball Stat Tracker')

from analytics import calculate_fg_percentage, define_shot_zone
from event import Event, Action
from stats_tracker.games.game import ShotZone

class TestCalculateFgPercentage:
    def test_first_shot_made(self):
        """Test field goal percentage calculation for first shot made."""
        # Starting with 0% on 0 attempts, making first shot
        result = calculate_fg_percentage(0, 0, True)
        assert result == 100  # 1/1 = 100%

    def test_first_shot_missed(self):
        """Test field goal percentage calculation for first shot missed."""
        # Starting with 0% on 0 attempts, missing first shot
        result = calculate_fg_percentage(0, 0, False)
        assert result == 0  # 0/1 = 0%

    def test_improving_percentage(self):
        """Test improving field goal percentage."""
        # Starting with 50% on 2 attempts (1 make), making next shot
        result = calculate_fg_percentage(50, 2, True)
        assert result == 67  # 2/3 = 66.67% rounded to 67%

    def test_declining_percentage(self):
        """Test declining field goal percentage."""
        # Starting with 50% on 2 attempts (1 make), missing next shot
        result = calculate_fg_percentage(50, 2, False)
        assert result == 33  # 1/3 = 33.33% rounded to 33%

    def test_perfect_shooter(self):
        """Test maintaining perfect shooting percentage."""
        # Starting with 100% on 5 attempts (5 makes), making next shot
        result = calculate_fg_percentage(100, 5, True)
        assert result == 100  # 6/6 = 100%

    def test_perfect_shooter_first_miss(self):
        """Test perfect shooter missing for first time."""
        # Starting with 100% on 5 attempts (5 makes), missing next shot
        result = calculate_fg_percentage(100, 5, False)
        assert result == 83  # 5/6 = 83.33% rounded to 83%

    def test_zero_percentage_first_make(self):
        """Test shooter with 0% making first shot."""
        # Starting with 0% on 5 attempts (0 makes), making next shot
        result = calculate_fg_percentage(0, 5, True)
        assert result == 17  # 1/6 = 16.67% rounded to 17%

    def test_high_volume_shooter(self):
        """Test calculation with high number of attempts."""
        # Starting with 45% on 100 attempts (45 makes), making next shot
        result = calculate_fg_percentage(45, 100, True)
        assert result == 46  # 46/101 = 45.54% rounded to 46%

class TestDefineShotZone:
    def test_restricted_area(self):
        """Test shots in the restricted area."""
        # Shot at the rim (0, 0)
        event = Event(1001, 2001, Action.MADE_SHOT, 0, 0)
        print("area calculated: ", define_shot_zone(event))
        assert define_shot_zone(event) == ShotZone.REST_AREA
        
        # Shot just inside restricted area
        event = Event(1001, 2001, Action.MADE_SHOT, 30, 30)
        print("area calculated: ", define_shot_zone(event))
        assert define_shot_zone(event) != ShotZone.REST_AREA

    def test_paint_center(self):
        """Test shots in the center of the paint."""
        # Shot in center paint
        event = Event(1001, 2001, Action.MADE_SHOT, 0, 100)
        assert define_shot_zone(event) == ShotZone.PAINT_C
        
        # Another center paint shot
        event = Event(1001, 2001, Action.MADE_SHOT, 30, 120)
        assert define_shot_zone(event) == ShotZone.PAINT_C

    def test_paint_left_and_right(self):
        """Test shots in left and right sides of paint."""
        # Left paint
        event = Event(1001, 2001, Action.MADE_SHOT, -70, 100)
        assert define_shot_zone(event) == ShotZone.PAINT_L
        
        # Right paint
        event = Event(1001, 2001, Action.MADE_SHOT, 70, 100)
        assert define_shot_zone(event) == ShotZone.PAINT_R

    def test_mid_range_center(self):
        """Test mid-range shots in the center."""
        # Mid-range center shot
        event = Event(1001, 2001, Action.MADE_SHOT, 0, 200)
        assert define_shot_zone(event) == ShotZone.MID_C

    def test_mid_range_sides(self):
        """Test mid-range shots on the sides."""
        # Mid-range left
        event = Event(1001, 2001, Action.MADE_SHOT, -150, 200)
        print(define_shot_zone(event))
        assert define_shot_zone(event) != ShotZone.MID_L
        
        # Mid-range left-center
        event = Event(1001, 2001, Action.MADE_SHOT, -50, 200)
        assert define_shot_zone(event) == ShotZone.MID_LC
        
        # Mid-range right-center
        event = Event(1001, 2001, Action.MADE_SHOT, 50, 200)
        assert define_shot_zone(event) == ShotZone.MID_RC
        
        # Mid-range right
        event = Event(1001, 2001, Action.MADE_SHOT, 156, 143)
        assert define_shot_zone(event) == ShotZone.MID_R
        
    def test_three_point_center(self):
        """Test three-point shots in the center."""
        # Three-point center
        event = Event(1001, 2001, Action.MADE_SHOT, 0, 300)
        assert define_shot_zone(event) == ShotZone.THREE_C

    def test_three_point_sides(self):
        """Test three-point shots on the sides."""
        # Three-point left
        event = Event(1001, 2001, Action.MADE_SHOT, -200, 300)
        assert define_shot_zone(event) == ShotZone.THREE_L
        
        # Three-point right
        event = Event(1001, 2001, Action.MADE_SHOT, 200, 300)
        assert define_shot_zone(event) == ShotZone.THREE_R

    def test_corner_threes(self):
        """Test corner three-point shots."""
        # Left corner three
        event = Event(1001, 2001, Action.MADE_SHOT, -225, 100)
        assert define_shot_zone(event) == ShotZone.THREE_L
        
        # Right corner three
        event = Event(1001, 2001, Action.MADE_SHOT, 225, 100)
        assert define_shot_zone(event) == ShotZone.THREE_R

    def test_boundary_cases(self):
        """Test shots near zone boundaries."""
        # Just inside three-point line
        event = Event(1001, 2001, Action.MADE_SHOT, 0, 235)
        assert define_shot_zone(event) == ShotZone.MID_C
        
        # Just outside three-point line
        event = Event(1001, 2001, Action.MADE_SHOT, 0, 240)
        assert define_shot_zone(event) == ShotZone.THREE_C

    def test_angle_calculations(self):
        """Test that angle calculations work correctly for zone assignment."""
        # Test specific angles for mid-range shots
        
        # -35 degrees (should be MID_L)
        x = -100 * math.sin(math.radians(35))
        y = 100 * math.cos(math.radians(35))
        event = Event(1001, 2001, Action.MADE_SHOT, x, y)
        assert define_shot_zone(event) == ShotZone.MID_L
        
        # -15 degrees (should be MID_LC)
        x = -100 * math.sin(math.radians(15))
        y = 100 * math.cos(math.radians(15))
        event = Event(1001, 2001, Action.MADE_SHOT, x, y)
        assert define_shot_zone(event) == ShotZone.MID_LC
        
        # 0 degrees (should be MID_C)
        event = Event(1001, 2001, Action.MADE_SHOT, 0, 200)
        assert define_shot_zone(event) == ShotZone.MID_C
        
        # 15 degrees (should be MID_RC)
        x = 100 * math.sin(math.radians(15))
        y = 100 * math.cos(math.radians(15))
        event = Event(1001, 2001, Action.MADE_SHOT, x, y)
        assert define_shot_zone(event) == ShotZone.MID_RC
        
        # 35 degrees (should be MID_R)
        x = 100 * math.sin(math.radians(35))
        y = 100 * math.cos(math.radians(35))
        event = Event(1001, 2001, Action.MADE_SHOT, x, y)
        assert define_shot_zone(event) == ShotZone.MID_R

    def test_negative_coordinates(self):
        """Test shots with negative coordinates."""
        # Shot on left side of court
        event = Event(1001, 2001, Action.MADE_SHOT, -100, 200)
        zone = define_shot_zone(event)
        assert zone in [ShotZone.MID_L, ShotZone.MID_LC]  # Should be left side zone

    def test_edge_of_court_shots(self):
        """Test shots near the edge of the court."""
        # Far left court
        event = Event(1001, 2001, Action.MADE_SHOT, -240, 400)
        zone = define_shot_zone(event)
        assert zone == ShotZone.THREE_L
        
        # Far right court
        event = Event(1001, 2001, Action.MADE_SHOT, 240, 400)
        zone = define_shot_zone(event)
        assert zone == ShotZone.THREE_R
