import pytest
import sys
sys.path.append('/Users/jonahtran/Desktop/Github/Basketball Stat Tracker')

from event import Event, Action

class TestEvent:
    def test_event_initialization(self):
        """Test that Event objects are initialized correctly."""
        event = Event(1001, 2001, Action.MADE_SHOT, 100, 200)
        
        assert event.player_id == 1001
        assert event.game_id == 2001
        assert event.action == Action.MADE_SHOT
        assert event.x_coord == 100
        assert event.y_coord == 200

    def test_event_with_zero_coordinates(self):
        """Test event at center court (0,0)."""
        event = Event(1002, 2002, Action.MISSED_SHOT, 0, 0)
        
        assert event.x_coord == 0
        assert event.y_coord == 0
        assert event.action == Action.MISSED_SHOT

    def test_event_with_negative_coordinates(self):
        """Test event with negative coordinates."""
        event = Event(1003, 2003, Action.STEAL, -150, -50)
        
        assert event.x_coord == -150
        assert event.y_coord == -50

    def test_all_action_types(self):
        """Test that all Action enum values can be used."""
        actions = [
            Action.MADE_SHOT,
            Action.MISSED_SHOT,
            Action.OFFENSIVE_REBOUND,
            Action.DEFENSIVE_REBOUND,
            Action.STEAL,
            Action.ASSIST,
            Action.BLOCK,
            Action.TURNOVER
        ]
        
        for i, action in enumerate(actions):
            event = Event(1000 + i, 2000, action, 0, 0)
            assert event.action == action

class TestAction:
    def test_action_enum_values(self):
        """Test that Action enum has all expected values."""
        expected_actions = {
            'MADE_SHOT',
            'MISSED_SHOT',
            'OFFENSIVE_REBOUND',
            'DEFENSIVE_REBOUND',
            'STEAL',
            'ASSIST',
            'BLOCK',
            'TURNOVER'
        }
        
        actual_actions = {action.name for action in Action}
        assert actual_actions == expected_actions

    def test_action_uniqueness(self):
        """Test that each Action enum value is unique."""
        action_values = [action.value for action in Action]
        assert len(action_values) == len(set(action_values))
