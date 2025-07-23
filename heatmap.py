import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle, Arc, Polygon, Wedge
from matplotlib.colors import LinearSegmentedColormap, Normalize
import io

from game import ShotZone
from event import Event, Action

class Heatmap:
    def __init__(self, player_id = None, events = []):
        self.player_id = player_id
        self.events = events

    # adds events to events record
    def add_event(self, event):
        self.events.append(event)


    def _draw_court(self, ax=None, color='black', lw=2, outer_lines=False):
        # If an axes object isn't provided to plot onto, just get current one
        if ax is None:
            ax = plt.gca()

        # Create the various parts of an NBA basketball court

        # Create the basketball hoop
        # Diameter of a hoop is 18" so it has a radius of 9", which is a value
        # 7.5 in our coordinate system
        hoop = Circle((0, 0), radius=7.5, linewidth=lw, color=color, fill=False)

        # Create backboard
        backboard = Rectangle((-30, -7.5), 60, -1, linewidth=lw, color=color)

        # The paint
        # Create the outer box 0f the paint, width=16ft, height=19ft
        outer_box = Rectangle((-80, -47.5), 160, 190, linewidth=lw, color=color,
                            fill=False)
        # Create the inner box of the paint, widt=12ft, height=19ft
        inner_box = Rectangle((-60, -47.5), 120, 190, linewidth=lw, color=color,
                            fill=False)

        # Create free throw top arc
        top_free_throw = Arc((0, 142.5), 120, 120, theta1=0, theta2=180,
                            linewidth=lw, color=color, fill=False)
        # Create free throw bottom arc
        bottom_free_throw = Arc((0, 142.5), 120, 120, theta1=180, theta2=0,
                                linewidth=lw, color=color, linestyle='dashed')
        # Restricted Zone, it is an arc with 4ft radius from center of the hoop
        restricted = Arc((0, 0), 80, 80, theta1=0, theta2=180, linewidth=lw,
                        color=color)

        # Three point line
        # Create the side 3pt lines, they are 14ft long before they begin to arc
        corner_three_a = Rectangle((-220, -47.5), 0, 140, linewidth=lw,
                                color=color)
        corner_three_b = Rectangle((220, -47.5), 0, 140, linewidth=lw, color=color)
        # 3pt arc - center of arc will be the hoop, arc is 23'9" away from hoop
        # I just played around with the theta values until they lined up with the 
        # threes
        three_arc = Arc((0, 0), 475, 475, theta1=22, theta2=158, linewidth=lw,
                        color=color)

        # Center Court
        center_outer_arc = Arc((0, 422.5), 120, 120, theta1=180, theta2=0,
                            linewidth=lw, color=color)
        center_inner_arc = Arc((0, 422.5), 40, 40, theta1=180, theta2=0,
                            linewidth=lw, color=color)

        # List of the court elements to be plotted onto the axes
        court_elements = [hoop, backboard, outer_box, inner_box, top_free_throw,
                        bottom_free_throw, restricted, corner_three_a,
                        corner_three_b, three_arc, center_outer_arc,
                        center_inner_arc]

        if outer_lines:
            # Draw the half court line, baseline and side out bound lines
            outer_lines = Rectangle((-250, -47.5), 500, 470, linewidth=lw,
                                    color=color, fill=False)
            court_elements.append(outer_lines)

        # Add the court elements onto the axes
        for element in court_elements:
            ax.add_patch(element)

        return ax
    

    def render_with_hex(self, gridsize=20, mincnt=1):
        # 1. Draw your court as you already do
        fig, ax = plt.subplots(figsize=(6, 5))
        self._draw_court(ax)

        ax.set_xlim(-250, 250)
        ax.set_ylim(-47.5, 422.5)

        x_min, x_max = ax.get_xlim()
        y_min, y_max = ax.get_ylim()
        extent = (x_min, x_max, y_min, y_max)

        ax.invert_yaxis()

        # 2. Filter out only the shot events and split makes vs. misses
        xs_made   = [e.x_coord for e in self.events if e.action == Action.MADE_SHOT]
        ys_made   = [e.y_coord for e in self.events if e.action == Action.MADE_SHOT]
        xs_missed = [e.x_coord for e in self.events if e.action == Action.MISSED_SHOT]
        ys_missed = [e.y_coord for e in self.events if e.action == Action.MISSED_SHOT]

        # 3. Grab the exact court extents so your hexbins line up perfectly
       
        # 4a. Plot made‐shot density in reds
        hb_made = ax.hexbin(
            xs_made, ys_made,
            gridsize=gridsize,
            extent=extent,
            cmap="Reds",
            mincnt=mincnt,
            alpha=0.6
        )

        # 4b. Plot missed‐shot density in blues (on top)
        hb_missed = ax.hexbin(
            xs_missed, ys_missed,
            gridsize=gridsize,
            extent=extent,
            cmap="Blues",
            mincnt=mincnt,
            alpha=0.6
        )

        ax.axis("off")
        plt.tight_layout()
        return fig
    
    def save_as_image(self, fmt: str = "png", dpi: int = 300, gridsize: int = 30, mincnt: int = 1) -> bytes:
        fig = self.render_with_hex(gridsize=gridsize, mincnt=mincnt)

        buf = io.BytesIO()
        fig.savefig(buf, format=fmt, dpi=dpi, bbox_inches="tight")
        plt.close(fig)          # avoid memory leak / GUI backend pop-ups
        buf.seek(0)

        # 3. Return raw bytes
        return buf.getvalue()

