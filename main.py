import sys
import numpy as np
import matplotlib.pyplot as plt

# make sure your project folder is on the path
sys.path.insert(0, ".")

from stats_tracker.games.heatmap import Heatmap
from event import Event, Action

# A tiny helper so we don't have to import your full Event class
class DummyEvent:
    def __init__(self, x, y, action):
        self.x_coord = x
        self.y_coord = y
        self.action = action

def main():
    # 1) Create the heatmap
    hm = Heatmap()

    # 2) Generate some sample data
    #   50 “made” shots, 25 “missed” shots, scattered randomly
    for _ in range(100):
        x = np.random.uniform(-220, 220)
        y = np.random.uniform(0, 470)
        hm.events.append(DummyEvent(x, y, Action.MADE_SHOT))
    for _ in range(100):
        x = np.random.uniform(-220, 220)
        y = np.random.uniform(0, 470)
        hm.events.append(DummyEvent(x, y, Action.MISSED_SHOT))

    # 3) Render and show the hex‐bin heatmap
    fig = hm.render_with_hex(gridsize=20, mincnt=1)
    plt.show()

if __name__ == "__main__":
    main()


