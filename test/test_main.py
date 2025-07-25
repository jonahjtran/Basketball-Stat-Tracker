import pytest
import numpy as np
import matplotlib.pyplot as plt
import sys
sys.path.append('/Users/jonahtran/Desktop/Github/Basketball Stat Tracker')

from main import DummyEvent, main
from event import Action

class TestDummyEvent:
    def test_dummy_event_initialization(self):
        """Test that DummyEvent objects are initialized correctly."""
        dummy = DummyEvent(100, 200, Action.MADE_SHOT)
        
        assert dummy.x_coord == 100
        assert dummy.y_coord == 200
        assert dummy.action == Action.MADE_SHOT

    def test_dummy_event_with_negative_coordinates(self):
        """Test DummyEvent with negative coordinates."""
        dummy = DummyEvent(-150, -75, Action.MISSED_SHOT)
        
        assert dummy.x_coord == -150
        assert dummy.y_coord == -75
        assert dummy.action == Action.MISSED_SHOT

    def test_dummy_event_zero_coordinates(self):
        """Test DummyEvent at origin."""
        dummy = DummyEvent(0, 0, Action.BLOCK)
        
        assert dummy.x_coord == 0
        assert dummy.y_coord == 0
        assert dummy.action == Action.BLOCK

class TestMainFunction:
    def test_main_runs_without_error(self, monkeypatch):
        """Test that main function runs without throwing errors."""
        # Mock plt.show to prevent GUI window from opening during tests
        def mock_show():
            pass
        
        monkeypatch.setattr(plt, 'show', mock_show)
        
        # This should run without raising an exception
        try:
            main()
            success = True
        except Exception:
            success = False
        
        assert success

    def test_main_creates_events(self, monkeypatch):
        """Test that main function creates the expected number of events."""
        # Mock plt.show to prevent GUI window
        def mock_show():
            pass
        monkeypatch.setattr(plt, 'show', mock_show)
        
        # Mock the random functions to have predictable behavior
        def mock_uniform(low, high):
            return (low + high) / 2  # Return middle value
        
        monkeypatch.setattr(np.random, 'uniform', mock_uniform)
        
        # Capture the heatmap created in main
        original_init = None
        captured_heatmap = None
        
        from heatmap import Heatmap
        
        def capture_heatmap_init(self, player_id=None, events=[]):
            nonlocal captured_heatmap
            original_init(self, player_id, events)
            captured_heatmap = self
        
        # Store original __init__ and replace it
        original_init = Heatmap.__init__
        monkeypatch.setattr(Heatmap, '__init__', capture_heatmap_init)
        
        main()
        
        # Verify that events were created
        assert captured_heatmap is not None
        assert len(captured_heatmap.events) == 200  # 100 made + 100 missed
        
        # Count made vs missed shots
        made_shots = sum(1 for event in captured_heatmap.events 
                        if event.action == Action.MADE_SHOT)
        missed_shots = sum(1 for event in captured_heatmap.events 
                          if event.action == Action.MISSED_SHOT)
        
        assert made_shots == 100
        assert missed_shots == 100

    def test_main_event_coordinates_in_range(self, monkeypatch):
        """Test that generated events have coordinates within expected ranges."""
        def mock_show():
            pass
        monkeypatch.setattr(plt, 'show', mock_show)
        
        # Use actual random but set seed for reproducibility
        np.random.seed(42)
        
        captured_heatmap = None
        
        from heatmap import Heatmap
        original_init = Heatmap.__init__
        
        def capture_heatmap_init(self, player_id=None, events=[]):
            nonlocal captured_heatmap
            original_init(self, player_id, events)
            captured_heatmap = self
        
        monkeypatch.setattr(Heatmap, '__init__', capture_heatmap_init)
        
        main()
        
        # Check coordinate ranges
        x_coords = [event.x_coord for event in captured_heatmap.events]
        y_coords = [event.y_coord for event in captured_heatmap.events]
        
        # X coordinates should be between -220 and 220
        assert all(-220 <= x <= 220 for x in x_coords)
        
        # Y coordinates should be between 0 and 470
        assert all(0 <= y <= 470 for y in y_coords)

    def test_main_uses_heatmap_render(self, monkeypatch):
        """Test that main function calls the heatmap render method."""
        def mock_show():
            pass
        monkeypatch.setattr(plt, 'show', mock_show)
        
        render_called = False
        
        from heatmap import Heatmap
        original_render = Heatmap.render_with_hex
        
        def mock_render(self, gridsize=20, mincnt=1):
            nonlocal render_called
            render_called = True
            return original_render(self, gridsize, mincnt)
        
        monkeypatch.setattr(Heatmap, 'render_with_hex', mock_render)
        
        main()
        
        assert render_called

    def test_main_with_specific_parameters(self, monkeypatch):
        """Test that main function uses correct parameters for heatmap rendering."""
        def mock_show():
            pass
        monkeypatch.setattr(plt, 'show', mock_show)
        
        render_params = {}
        
        from heatmap import Heatmap
        original_render = Heatmap.render_with_hex
        
        def capture_render_params(self, gridsize=20, mincnt=1):
            nonlocal render_params
            render_params['gridsize'] = gridsize
            render_params['mincnt'] = mincnt
            return original_render(self, gridsize, mincnt)
        
        monkeypatch.setattr(Heatmap, 'render_with_hex', capture_render_params)
        
        main()
        
        assert render_params['gridsize'] == 20
        assert render_params['mincnt'] == 1
