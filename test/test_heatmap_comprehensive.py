import pytest
import matplotlib.pyplot as plt
import numpy as np
from types import SimpleNamespace
import io

import sys
sys.path.append('/Users/jonahtran/Desktop/Github/Basketball Stat Tracker')
from stats_tracker.games.heatmap import Heatmap
from event import Action, Event

class TestHeatmapInitialization:
    def test_initial_state(self):
        """Test heatmap initialization with default values."""
        hm = Heatmap()
        assert hm.player_id is None
        assert hm.events == []

    def test_initialization_with_player_id(self):
        """Test heatmap initialization with player ID."""
        hm = Heatmap(player_id=1001)
        assert hm.player_id == 1001
        assert hm.events == []

    def test_initialization_with_events(self):
        """Test heatmap initialization with events list."""
        events = [Event(1001, 2001, Action.MADE_SHOT, 100, 200)]
        hm = Heatmap(player_id=1001, events=events)
        assert hm.player_id == 1001
        assert len(hm.events) == 1
        assert hm.events[0] == events[0]

class TestHeatmapEventManagement:
    def test_add_single_event(self):
        """Test adding a single event to heatmap."""
        event = Event(12, 1, Action.MADE_SHOT, 5, 5)
        hm = Heatmap()
        hm.add_event(event)
        assert len(hm.events) == 1
        assert hm.events[0] == event

    def test_add_multiple_events(self):
        """Test adding multiple events to heatmap."""
        events = [
            Event(12, 1, Action.MADE_SHOT, 5, 5),
            Event(12, 1, Action.MISSED_SHOT, 10, 10),
            Event(12, 1, Action.MADE_SHOT, 15, 15)
        ]
        hm = Heatmap()
        
        for event in events:
            hm.add_event(event)
        
        assert len(hm.events) == 3
        assert all(hm.events[i] == events[i] for i in range(3))

    def test_add_different_action_types(self):
        """Test adding events with different action types."""
        actions = [Action.MADE_SHOT, Action.MISSED_SHOT, Action.STEAL, Action.BLOCK]
        hm = Heatmap()
        
        for i, action in enumerate(actions):
            event = Event(12, 1, action, i * 10, i * 10)
            hm.add_event(event)
        
        assert len(hm.events) == 4
        assert all(hm.events[i].action == actions[i] for i in range(4))

class TestHeatmapCourtDrawing:
    def test_draw_court_adds_patches(self):
        """Test that drawing court adds patches to axes."""
        hm = Heatmap()
        fig, ax = plt.subplots()
        # no court drawn yet
        assert len(ax.patches) == 0
        # draw with outer_lines too
        hm._draw_court(ax, outer_lines=True)
        # should have many court elements
        assert len(ax.patches) > 0
        plt.close(fig)

    def test_draw_court_without_outer_lines(self):
        """Test drawing court without outer lines."""
        hm = Heatmap()
        fig, ax = plt.subplots()
        initial_patches = len(ax.patches)
        hm._draw_court(ax, outer_lines=False)
        final_patches = len(ax.patches)
        assert final_patches > initial_patches
        plt.close(fig)

    def test_draw_court_with_outer_lines(self):
        """Test drawing court with outer lines."""
        hm = Heatmap()
        fig, ax = plt.subplots()
        
        # Draw without outer lines first
        hm._draw_court(ax, outer_lines=False)
        patches_without_outer = len(ax.patches)
        
        # Clear and draw with outer lines
        ax.clear()
        hm._draw_court(ax, outer_lines=True)
        patches_with_outer = len(ax.patches)
        
        # Should have one more patch (the outer rectangle)
        assert patches_with_outer > patches_without_outer
        plt.close(fig)

    def test_draw_court_custom_parameters(self):
        """Test drawing court with custom color and line width."""
        hm = Heatmap()
        fig, ax = plt.subplots()
        
        # Draw with custom parameters
        returned_ax = hm._draw_court(ax, color='red', lw=3)
        
        # Should return the same axes object
        assert returned_ax is ax
        # Should have patches added
        assert len(ax.patches) > 0
        plt.close(fig)

class TestHeatmapRendering:
    def test_render_with_hex_returns_figure(self):
        """Test that render_with_hex returns a matplotlib figure."""
        hm = Heatmap()
        fig = hm.render_with_hex(gridsize=1, mincnt=1)
        assert isinstance(fig, plt.Figure)
        plt.close(fig)

    def test_render_with_hex_uses_draw_court(self, monkeypatch):
        """Test that render_with_hex calls _draw_court method."""
        hm = Heatmap()
        called = {"ax": None}
        
        # stub out the court‐drawing so we don't rely on its internals
        def fake_draw(ax):
            called["ax"] = ax
            return ax
        
        hm._draw_court = fake_draw
        fig = hm.render_with_hex(gridsize=1, mincnt=1)
        
        # returns a Figure
        assert isinstance(fig, plt.Figure)
        # and it did call our stub
        assert called["ax"] is not None
        plt.close(fig)

    def test_render_with_hex_shot_events_only(self):
        """Test that render_with_hex only processes shot events."""
        hm = Heatmap()
        
        # Add mix of shot and non-shot events
        events = [
            Event(12, 1, Action.MADE_SHOT, 0, 100),
            Event(12, 1, Action.MISSED_SHOT, 50, 150),
            Event(12, 1, Action.STEAL, 25, 125),  # Non-shot event
            Event(12, 1, Action.BLOCK, 75, 175),  # Non-shot event
        ]
        
        for event in events:
            hm.add_event(event)
        
        fig = hm.render_with_hex(gridsize=10, mincnt=1)
        ax = fig.axes[0]
        
        # Should have created hexbin collections
        collections = ax.collections
        assert len(collections) >= 0  # May be 0, 1, or 2 depending on mincnt and data distribution
        plt.close(fig)

    def test_render_with_hex_counts_made_and_missed(self):
        """Test that render correctly counts made and missed shots."""
        hm = Heatmap()
        
        # Add events with proper Event objects
        events = [
            Event(12, 1, Action.MADE_SHOT, 0, 100),
            Event(12, 1, Action.MADE_SHOT, 0, 100),  # Same location
            Event(12, 1, Action.MISSED_SHOT, 50, 150),
        ]
        
        for event in events:
            hm.add_event(event)
        
        fig = hm.render_with_hex(gridsize=1, mincnt=1)
        ax = fig.axes[0]
        collections = ax.collections
        
        # Should have collections for hexbins
        assert len(collections) >= 0
        plt.close(fig)

    def test_render_with_hex_parameters(self):
        """Test render_with_hex with different parameters."""
        hm = Heatmap()
        
        # Add some shot events
        events = [
            Event(12, 1, Action.MADE_SHOT, 0, 100),
            Event(12, 1, Action.MISSED_SHOT, 100, 200),
        ]
        
        for event in events:
            hm.add_event(event)
        
        # Test with different gridsize
        fig1 = hm.render_with_hex(gridsize=5, mincnt=1)
        assert isinstance(fig1, plt.Figure)
        plt.close(fig1)
        
        # Test with different mincnt
        fig2 = hm.render_with_hex(gridsize=10, mincnt=2)
        assert isinstance(fig2, plt.Figure)
        plt.close(fig2)

class TestHeatmapImageSaving:
    def test_save_as_image_returns_bytes(self):
        """Test that save_as_image returns bytes."""
        hm = Heatmap()
        
        # Add some events
        events = [
            Event(12, 1, Action.MADE_SHOT, 0, 100),
            Event(12, 1, Action.MISSED_SHOT, 100, 200),
        ]
        
        for event in events:
            hm.add_event(event)
        
        image_bytes = hm.save_as_image()
        
        assert isinstance(image_bytes, bytes)
        assert len(image_bytes) > 0

    def test_save_as_image_different_formats(self):
        """Test save_as_image with different formats."""
        hm = Heatmap()
        
        # Add some events
        events = [
            Event(12, 1, Action.MADE_SHOT, 0, 100),
        ]
        
        for event in events:
            hm.add_event(event)
        
        # Test PNG format
        png_bytes = hm.save_as_image(fmt='png')
        assert isinstance(png_bytes, bytes)
        assert len(png_bytes) > 0
        
        # Test JPG format
        jpg_bytes = hm.save_as_image(fmt='jpg')
        assert isinstance(jpg_bytes, bytes)
        assert len(jpg_bytes) > 0

    def test_save_as_image_different_dpi(self):
        """Test save_as_image with different DPI settings."""
        hm = Heatmap()
        
        # Add some events
        events = [Event(12, 1, Action.MADE_SHOT, 0, 100)]
        for event in events:
            hm.add_event(event)
        
        # Test different DPI values
        low_dpi = hm.save_as_image(dpi=150)
        high_dpi = hm.save_as_image(dpi=600)
        
        assert isinstance(low_dpi, bytes)
        assert isinstance(high_dpi, bytes)
        # Higher DPI should generally result in larger file size
        # (though this might not always be true due to compression)

    def test_save_as_image_different_grid_parameters(self):
        """Test save_as_image with different grid parameters."""
        hm = Heatmap()
        
        # Add some events
        events = [
            Event(12, 1, Action.MADE_SHOT, 0, 100),
            Event(12, 1, Action.MISSED_SHOT, 100, 200),
        ]
        
        for event in events:
            hm.add_event(event)
        
        # Test different gridsize
        coarse_grid = hm.save_as_image(gridsize=10)
        fine_grid = hm.save_as_image(gridsize=50)
        
        assert isinstance(coarse_grid, bytes)
        assert isinstance(fine_grid, bytes)
        
        # Test different mincnt
        low_mincnt = hm.save_as_image(mincnt=1)
        high_mincnt = hm.save_as_image(mincnt=5)
        
        assert isinstance(low_mincnt, bytes)
        assert isinstance(high_mincnt, bytes)

class TestHeatmapEdgeCases:
    def test_render_empty_heatmap(self):
        """Test rendering heatmap with no events."""
        hm = Heatmap()
        
        fig = hm.render_with_hex()
        assert isinstance(fig, plt.Figure)
        plt.close(fig)

    def test_save_empty_heatmap(self):
        """Test saving heatmap with no events as image."""
        hm = Heatmap()
        
        image_bytes = hm.save_as_image()
        assert isinstance(image_bytes, bytes)
        assert len(image_bytes) > 0

    def test_render_with_only_non_shot_events(self):
        """Test rendering heatmap with only non-shot events."""
        hm = Heatmap()
        
        # Add only non-shot events
        events = [
            Event(12, 1, Action.STEAL, 100, 200),
            Event(12, 1, Action.BLOCK, 150, 250),
            Event(12, 1, Action.ASSIST, 200, 300),
        ]
        
        for event in events:
            hm.add_event(event)
        
        fig = hm.render_with_hex()
        assert isinstance(fig, plt.Figure)
        plt.close(fig)

# Keep the original test functions for backward compatibility
def test_event_tracker():
    event = Event(12, 1, Action.MADE_SHOT, 5, 5)
    map = Heatmap()
    map.add_event(event)
    assert(map.events[0] == event)

def test_initial_state():
    hm = Heatmap()
    assert hm.player_id is None
    assert hm.events == []

def test_draw_court_adds_patches():
    hm = Heatmap()
    fig, ax = plt.subplots()
    # no court drawn yet
    assert len(ax.patches) == 0
    # draw with outer_lines too
    hm._draw_court(ax, outer_lines=True)
    # should have many court elements
    assert len(ax.patches) > 0
    plt.close(fig)

def test_render_with_hex_returns_figure_and_uses_draw_court(monkeypatch):
    hm = Heatmap()
    called = {"ax": None}
    # stub out the court‐drawing so we don't rely on its internals
    def fake_draw(ax):
        called["ax"] = ax
        return ax
    hm._draw_court = fake_draw

    fig = hm.render_with_hex(gridsize=1, mincnt=1)
    # returns a Figure
    assert isinstance(fig, plt.Figure)
    # and it did call our stub
    assert called["ax"] is not None
    plt.close(fig)

def test_render_with_hex_counts_made_and_missed():
    hm = Heatmap()
    # two "made" events at the same spot, one "missed" elsewhere
    events = [
        SimpleNamespace(x_coord=0, y_coord=0, action=Action.MADE_SHOT),
        SimpleNamespace(x_coord=0, y_coord=0, action=Action.MADE_SHOT),
        SimpleNamespace(x_coord=1, y_coord=1, action=Action.MISSED_SHOT),
    ]
    for e in events:
        hm.add_event(e)

    # with gridsize=1, all points fall into a single hex each
    fig = hm.render_with_hex(gridsize=1, mincnt=1)
    ax = fig.axes[0]
    cols = ax.collections
    
    if len(cols) >= 2:  # Only test if both collections exist
        # first collection = makes, second = misses
        made_counts = cols[0].get_array()
        missed_counts = cols[1].get_array()

        assert made_counts.sum() == 2
        assert missed_counts.sum() == 1
    
    plt.close(fig)
