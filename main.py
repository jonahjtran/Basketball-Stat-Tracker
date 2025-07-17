import matplotlib.pyplot as plt
from heatmap import Heatmap


if __name__ == "__main__":
        heatmap = Heatmap()
        fig, ax = plt.subplots(figsize=(6, 11))
        heatmap.plot(ax=ax)
        plt.show()