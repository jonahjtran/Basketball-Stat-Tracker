import pytest
import matplotlib.pyplot as plt
from types import SimpleNamespace


import sys
sys.path.append('/Users/jonahtran/Desktop/Github/Basketball Stat Tracker')
from stats_tracker.games.heatmap import Heatmap, ShotZone
from event import Action, Event

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

def test_render_with_hex_counts_made_and_missed():
    hm = Heatmap()
    # two “made” events at the same spot, one “missed” elsewhere
    events = [
        SimpleNamespace(x=0, y=0, action="made layup"),
        SimpleNamespace(x=0, y=0, action="made 3"),
        SimpleNamespace(x=1, y=1, action="missed jumper"),
    ]
    for e in events:
        hm.add_event(e)

    # with gridsize=1, all points fall into a single hex each
    fig = hm.render_with_hex(gridsize=1, mincnt=1)
    ax = fig.axes[0]
    cols = ax.collections
    # first collection = makes, second = misses
    made_counts = cols[0].get_array()
    missed_counts = cols[1].get_array()

    assert made_counts.sum() == 2
    assert missed_counts.sum() == 1

