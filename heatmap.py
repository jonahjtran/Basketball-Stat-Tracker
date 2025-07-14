import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Rectangle, Arc, Polygon, Wedge
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

class Heatmap():
    def __init__(self):
        self.stats = pd.DataFrame(
            0,
            index=list(ShotZone),
            columns=['attempts', 'makes', 'pct'],
            dtype=float
        )

         #    coordinates are in feet, origin at hoop, y→half-court
        self.zone_shapes = {
            # three-point baseline strips
            ShotZone.THREE_L:  Polygon([(-25,0),(-22,0),(-22,14),(-25,14)]),
            ShotZone.THREE_LC: Polygon([(-22,0),(-8,0),(-8,14),(-22,14)]),
            ShotZone.THREE_C:  Polygon([(-8,0),(8,0),(8,14),(-8,14)]),
            ShotZone.THREE_RC: Polygon([(8,0),(22,0),(22,14),(8,14)]),
            ShotZone.THREE_R:  Polygon([(22,0),(25,0),(25,14),(22,14)]),

            # mid-range (between 3-pt line and free-throw line)
            ShotZone.MID_L:   Polygon([(-25,14),(-8,14),(-8,19),(-25,19)]),
            ShotZone.MID_LC:  Polygon([(-8,14),(-3,14),(-3,19),(-8,19)]),
            ShotZone.MID_C:   Polygon([(-3,14),(3,14),(3,19),(-3,19)]),
            ShotZone.MID_RC:  Polygon([(3,14),(8,14),(8,19),(3,19)]),
            ShotZone.MID_R:   Polygon([(8,14),(25,14),(25,19),(8,19)]),

            # paint area subdivisions
            ShotZone.PAINT_L: Polygon([(-8,0),(-3,0),(-3,19),(-8,19)]),
            ShotZone.PAINT_C: Polygon([(-3,0),(3,0),(3,19),(-3,19)]),
            ShotZone.PAINT_R: Polygon([(3,0),(8,0),(8,19),(3,19)]),

            # restricted area (under the basket)
            ShotZone.REST_AREA: Wedge((0,0), 4, 0, 180)
        }

        # returns color of a shot zone given a field-goal percentage
        def cmap(pct):
            if pct >= 0.45: return '#D62728'   # hot
            if pct <= 0.35: return '#1F77B4'   # cold
            return '#7F7F7F'                   # neutral
        self.cmap = cmap

         # 4) build Matplotlib fig/ax and draw the court lines
        self.fig, self.ax = plt.subplots(figsize=(12,8))
        self.ax.set_facecolor('#222222')
        self._draw_base_court()

        # 5) turn each shape into a patch, color it, and add to axes
        self.zone_patches = {}
        for zone, shape in self.zone_shapes.items():
            # set initial facecolor = neutral (pct=0)
            shape.set_facecolor(self.cmap(0.0))
            shape.set_edgecolor('white')
            shape.set_linewidth(1)
            self.ax.add_patch(shape)
            self.zone_patches[zone] = shape

        # 6) finalize
        self.ax.set_xlim(-25,25)
        self.ax.set_ylim(0,47)
        self.ax.axis('off')
        plt.tight_layout()


    def _draw_base_court(self):
        """Overlay all the standard white court lines once."""
        lw, lc = 2, 'white'
        ax = self.ax
        ax.add_patch(Circle((0,0), 0.75, fill=False, color=lc, linewidth=lw))            # hoop
        ax.add_patch(Rectangle((-3,-0.75), 6, -0.125, color=lc, linewidth=lw))           # backboard
        ax.add_patch(Rectangle((-8,0), 16,19, fill=False, color=lc, linewidth=lw))       # outer paint
        ax.add_patch(Rectangle((-6,0), 12,19, fill=False, color=lc, linewidth=lw))       # inner paint
        ax.add_patch(Arc((0,19), 12,12, theta1=0,   theta2=180, color=lc, linewidth=lw))
        ax.add_patch(Arc((0,19), 12,12, theta1=180, theta2=360, color=lc, linewidth=lw, linestyle='dashed'))
        ax.add_patch(Arc((0,0),   8, 8,  theta1=0,   theta2=180, color=lc, linewidth=lw))  # restricted arc
        ax.add_patch(Rectangle((-22,0), 0,14, color=lc, linewidth=lw))                    # 3-pt side lines
        ax.add_patch(Rectangle((22,0),  0,14, color=lc, linewidth=lw))
        ax.add_patch(Arc((0,0), 95,95, theta1=22, theta2=158, color=lc, linewidth=lw))    # 3-pt arc


    def update_shot(self, zone: ShotZone, made: bool):
        """Record one shot in `zone` (True=make, False=miss)."""
        s = self.stats[zone]
        s['attempts'] += 1
        s['makes']    += int(made)
        s['pct']       = s['makes'] / s['attempts']


    def render(self):
        """Recolor all zones by their current pct and redraw."""
        for zone, patch in self.zone_patches.items():
            pct = self.stats[zone]['pct']
            patch.set_facecolor(self.cmap(pct))
        self.fig.canvas.draw()  


    def get_image(self) -> np.ndarray:
        """Return an (H, W, 3) uint8 RGB array of the current court+heatmap."""
        self.fig.canvas.draw()
        w,h = self.fig.canvas.get_width_height()
        buf = self.fig.canvas.tostring_rgb()
        return np.frombuffer(buf, dtype=np.uint8).reshape(h, w, 3)

