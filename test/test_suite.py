import pytest
import sys
import os

# Add the project root to the Python path
project_root = '/Users/jonahtran/Desktop/Github/Basketball Stat Tracker'
if project_root not in sys.path:
    sys.path.insert(0, project_root)

class TestSuite:
    """Comprehensive test suite for the Basketball Stat Tracker application."""
    
    def test_all_modules_importable(self):
        """Test that all main modules can be imported without errors."""
        try:
            import event
            import game
            import analytics
            import heatmap
            import db
            import main
            success = True
        except ImportError as e:
            print(f"Import error: {e}")
            success = False
        
        assert success, "All modules should be importable"

    def test_all_classes_instantiable(self):
        """Test that all main classes can be instantiated."""
        from event import Event, Action
        from game import Game, ShotZone
        from heatmap import Heatmap
        
        # Test Event instantiation
        event = Event(1001, 2001, Action.MADE_SHOT, 100, 200)
        assert event is not None
        
        # Test Game instantiation
        game = Game(1001, 2001)
        assert game is not None
        
        # Test Heatmap instantiation
        heatmap = Heatmap()
        assert heatmap is not None

    def test_enum_completeness(self):
        """Test that all enums have expected values."""
        from event import Action
        from game import ShotZone
        
        # Test Action enum
        expected_actions = {
            'MADE_SHOT', 'MISSED_SHOT', 'OFFENSIVE_REBOUND', 'DEFENSIVE_REBOUND',
            'STEAL', 'ASSIST', 'BLOCK', 'TURNOVER'
        }
        actual_actions = {action.name for action in Action}
        assert actual_actions == expected_actions
        
        # Test ShotZone enum
        expected_zones = {
            'MID_L', 'MID_LC', 'MID_C', 'MID_RC', 'MID_R',
            'THREE_L', 'THREE_LC', 'THREE_C', 'THREE_RC', 'THREE_R',
            'REST_AREA', 'PAINT_L', 'PAINT_C', 'PAINT_R'
        }
        actual_zones = {zone.name for zone in ShotZone}
        assert actual_zones == expected_zones

if __name__ == "__main__":
    # Run all tests
    pytest.main([
        __file__,
        "test_event.py",
        "test_game.py", 
        "test_analytics.py",
        "test_heatmap.py",
        "test_heatmap_comprehensive.py",
        "test_db.py",
        "test_main.py",
        "-v",  # verbose output
        "--tb=short",  # shorter traceback format
        "--disable-warnings"  # disable warnings for cleaner output
    ])
