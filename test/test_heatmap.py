import pytest
import matplotlib
matplotlib.use('Agg')
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

import sys
sys.path.append('/Users/jonahtran/Desktop/Github/Basketball Stat Tracker')
from heatmap import Heatmap, ShotZone

def test_shotzone_count():
    # There should be 14 shot zones
    assert len(ShotZone) == 14

    expected_names = [
        'MID_L','MID_LC','MID_C','MID_RC','MID_R',
        'THREE_L','THREE_LC','THREE_C','THREE_RC','THREE_R',
        'REST_AREA','PAINT_L','PAINT_C','PAINT_R'
    ]
    assert [z.name for z in ShotZone] == expected_names


def test_init_stats_dataframe():
    h = Heatmap()
    # Stats should be a DataFrame with zeros
    assert isinstance(h.stats, pd.DataFrame)
    assert list(h.stats.columns) == ['attempts', 'makes', 'pct']
    assert list(h.stats.index) == list(ShotZone)
    assert (h.stats.values == 0).all()


def test_draw_court_patches_count_without_outer():
    fig, ax = plt.subplots()
    ax.clear()
    ax = Heatmap._draw_court(ax, outer_lines=False)
    # Should add 12 court elements (without outer lines)
    assert len(ax.patches) == 12


def test_draw_court_patches_count_with_outer():
    fig, ax = plt.subplots()
    ax = Heatmap._draw_court(ax, outer_lines=True)
    # Should add 13 court elements (with outer lines)
    assert len(ax.patches) == 13


def test_add_event():
    heatmap = Heatmap()
    heatmap.add_event(ShotZone.MID_C, True)
    #print(heatmap.stats.at[ShotZone.MID_C, 'attempts'])
    assert(heatmap.stats.at[ShotZone.MID_C, 'attempts'] == 1)
    assert(heatmap.stats.at[ShotZone.MID_C, 'makes'] == 1)
    assert(heatmap.stats.at[ShotZone.MID_C, 'pct'] == 100)