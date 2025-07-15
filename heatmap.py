import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle, Arc, Polygon, Wedge
from matplotlib.colors import LinearSegmentedColormap, Normalize
import numpy as np
import pandas as pd
from enum import Enum, auto


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


class Heatmap:
    def __init__(self):
        # 1) stats table
        self.stats = pd.DataFrame(
            0,
            index=list(ShotZone),
            columns=['attempts', 'makes', 'pct'],
            dtype=float
        )

    # parameters: zone of shot, boolean indicating whether shot was a make or miss
    # adds events to self.stats
    def add_event(self, zone: ShotZone, made: bool):
        self.stats.at[zone, 'attempts'] += 1     # increment attempts column for zone
        if made:
            self.stats.at[zone, 'makes'] += 1    # increment makes column for zone

        new_attempts = self.stats.at[zone, 'attempts']
        new_makes = self.stats.at[zone, 'makes']

        if new_attempts != 0:
            self.stats.at[zone, 'pct'] = (new_makes/new_attempts) * 100
        else:
            self.stats.at[zone, 'pct'] = new_makes/new_attempts
        



    @staticmethod
    def _draw_court(ax, color='black', lw=2, outer_lines=False):
        # --- paste your draw_court body here, but rename to _draw_court and remove plt.gca() logic ---
        hoop = Circle((0, 0), radius=7.5, linewidth=lw, color=color, fill=False)
        backboard = Rectangle((-30, -7.5), 60, -1, linewidth=lw, color=color)
        outer_box = Rectangle((-80, -47.5), 160, 190, linewidth=lw, color=color, fill=False)
        inner_box = Rectangle((-60, -47.5), 120, 190, linewidth=lw, color=color, fill=False)
        top_ft = Arc((0, 142.5), 120, 120, theta1=0, theta2=180, linewidth=lw, color=color, fill=False)
        bot_ft = Arc((0, 142.5), 120, 120, theta1=180, theta2=0, linewidth=lw, color=color, linestyle='dashed')
        restricted = Arc((0, 0), 80, 80, theta1=0, theta2=180, linewidth=lw, color=color)
        corner_a = Rectangle((-220, -47.5), 0, 140, linewidth=lw, color=color)
        corner_b = Rectangle((220, -47.5), 0, 140, linewidth=lw, color=color)
        three_arc = Arc((0, 0), 475, 475, theta1=22, theta2=158, linewidth=lw, color=color)
        center_outer = Arc((0, 422.5), 120, 120, theta1=180, theta2=0, linewidth=lw, color=color)
        center_inner = Arc((0, 422.5), 40, 40, theta1=180, theta2=0, linewidth=lw, color=color)

        elems = [hoop, backboard, outer_box, inner_box,
                 top_ft, bot_ft, restricted,
                 corner_a, corner_b, three_arc,
                 center_outer, center_inner]
        if outer_lines:
            outer = Rectangle((-250, -47.5), 500, 470, linewidth=lw, color=color, fill=False)
            elems.append(outer)

        for e in elems:
            ax.add_patch(e)
        return ax

    def plot(self, ax=None, cmap='Reds', alpha=0.6):
        """Draw court + overlay heatmap based on self.stats['pct']."""
        if ax is None:
            fig, ax = plt.subplots(figsize=(6, 11))
        # 1) draw court
        self._draw_court(ax, color='grey', lw=1, outer_lines=True)

        # 2) Define the shot zones as polygons or bounding boxes
        self.zone_polygons = {
            'MID_L': np.array([[-250, 140], [-80, 140], [-80, 47.5], [-250, 47.5]]),
            'MID_LC': np.array([[-80, 140], [-40, 140], [-40, 47.5], [-80, 47.5]]),
            'MID_C': np.array([[-40, 140], [40, 140], [40, 47.5], [-40, 47.5]]),
            'MID_RC': np.array([[40, 140], [80, 140], [80, 47.5], [40, 47.5]]),
            'MID_R': np.array([[80, 140], [250, 140], [250, 47.5], [80, 47.5]]),
            'THREE_L': np.array([[-250, 422.5], [-220, 422.5], [-220, 140], [-250, 140]]),
            'THREE_LC': np.array([[-220, 422.5], [-80, 422.5], [-80, 140], [-220, 140]]),
            'THREE_C': np.array([[-80, 422.5], [80, 422.5], [80, 140], [-80, 140]]),
            'THREE_RC': np.array([[80, 422.5], [220, 422.5], [220, 140], [80, 140]]),
            'THREE_R': np.array([[220, 422.5], [250, 422.5], [250, 140], [220, 140]]),
            'REST_AREA': np.array([[-80, 47.5], [80, 47.5], [80, -47.5], [-80, -47.5]]),
            'PAINT_L': np.array([[-80, 47.5], [-60, 47.5], [-60, -47.5], [-80, -47.5]]),
            'PAINT_C': np.array([[-60, 47.5], [60, 47.5], [60, -47.5], [-60, -47.5]]),
            'PAINT_R': np.array([[60, 47.5], [80, 47.5], [80, -47.5], [60, -47.5]])
        }

        for zone_name, verts in self.zone_polygons.items():
            pct = self.stats.at[zone_name, 'pct']
            poly = plt.Polygon(verts, facecolor=plt.cm.get_cmap(cmap)(pct), alpha=alpha)
            ax.add_patch(poly)

        # 3) set your axes limits and aspect
        ax.set_xlim(-250, 250)
        ax.set_ylim(-47.5, 422.5)
        ax.set_aspect('equal')
        ax.axis('off')
        return ax