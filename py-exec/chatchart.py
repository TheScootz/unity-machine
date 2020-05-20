import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import json
import sys
import uuid
import warnings

# Ignore warnings about glyphs
warnings.filterwarnings("ignore")

# Parse JSON sent as arguments
data = json.loads(' '.join(sys.argv[1:len(sys.argv)]))

# Sort data["messages-by-account"] by size of value from largest to smallest
data["messages-by-account"] = {k: v for k, v in sorted(data["messages-by-account"].items(), key=lambda item: -item[1])}


if len(data["messages-by-account"]) > 20:
	data["messages-by-account"]["Other"] = 0
	for i in range(len(data["messages-by-account"])-1, 19, -1):
		# Get data["messages-by-account"][i] and pop it, then add it to data["messages-by-account"]["Other"]
		data["messages-by-account"]["Other"] += data["messages-by-account"].pop(list(data["messages-by-account"].keys())[i])

# Colours to use for pie chart
colours = [
	"r",
	"darkorange",
	"gold",
	"y",
	"olivedrab",
	"green",
	"darkcyan",
	"mediumblue",
	"darkblue",
	"blueviolet",
	"indigo",
	"orchid",
	"mediumvioletred",
	"crimson",
	"chocolate",
	"yellow",
	"limegreen",
	"forestgreen",
	"dodgerblue",
	"slateblue",
	"gray",
]

numMessages = sum(data["messages-by-account"].values()) # Total number of messages sent

channel = data["channel"]
title = plt.title(f"Stats in #{channel} (last 1000 messages)", color="white", fontsize=10)
title.set_va("top")
title.set_ha("center")

pieWedgeSlices = [i/numMessages for i in data["messages-by-account"].values()]

pieChart = plt.pie(pieWedgeSlices, colors=colours)

# Make labels for each slice of the pie
labels = [mpatches.Patch(color=colours[i], label=f"{v[0]}: {v[1]*100/numMessages:.1f}%") for i, v in enumerate(data["messages-by-account"].items())]
plt.legend(handles=labels, loc="upper left", bbox_to_anchor=(1,1.1), fontsize=7)
plt.subplots_adjust(left=0.0, bottom=0.1, right=0.6) # Move pie chart to the left, so there is place to put the legend

# Randomly generate name so the picture is not saved to an existing file
pltName = f"{uuid.uuid4().hex}.png"
plt.savefig(pltName, transparent=True, dpi=300)
print(pltName)
sys.stdout.flush()