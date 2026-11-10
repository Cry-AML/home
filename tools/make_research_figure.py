#!/usr/bin/env python3
"""Regenerate assets/images/research-figure-1.jpg (site figure showcase).

Source data
-----------
Single-cell UMAP coordinates exported by the Wenyan_SC (HPK1-scRNA-atlas) repo:

    Wenyan_SC/results/latest_feedback_en_native/gfphigh_umaps/tables/
        gfphigh_umap_coords_labels.csv

Columns: UMAP1, UMAP2, cell_type_L1, group2, sample_ID
(25,252 GFPhigh cells; 5 treatment arms; 3 myeloid states).

Design intent
-------------
"Least ink" rendering: no title, no cell count, no grid, no numeric ticks and
no legend title — only three coloured states plus a compact legend. Colours
follow the Wong (2011) colour-blind-safe palette used by the originating
plotting script (pipelines/gfp/plotting/plot_gfphigh_umap_nature.py).

Usage
-----
    python3 tools/make_research_figure.py \
        --coords /path/to/gfphigh_umap_coords_labels.csv \
        --out assets/images/research-figure-1.jpg
"""

from __future__ import annotations

import argparse
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402
from matplotlib.lines import Line2D  # noqa: E402

PALETTE = {
    "Myeloblast": "#0072B2",
    "Monocyte": "#009E73",
    "Immature neutrophil": "#D55E00",
}
ORDER = ["Myeloblast", "Monocyte", "Immature neutrophil"]

DEFAULT_COORDS = (
    "/home/fallingstar10/shire/Wenyan_SC/results/latest_feedback_en_native/"
    "gfphigh_umaps/tables/gfphigh_umap_coords_labels.csv"
)


def build(coords: Path, out: Path) -> None:
    df = pd.read_csv(coords)

    plt.rcParams.update(
        {
            "font.family": "sans-serif",
            "font.sans-serif": ["Arial", "Helvetica", "DejaVu Sans"],
            "pdf.fonttype": 42,
        }
    )

    fig, ax = plt.subplots(figsize=(7.6, 5.9))
    for ct in ORDER:
        sub = df[df["cell_type_L1"] == ct]
        ax.scatter(
            sub["UMAP1"],
            sub["UMAP2"],
            s=3.0,
            c=PALETTE[ct],
            linewidths=0,
            edgecolors="none",
            rasterized=True,
            alpha=0.95,
        )

    # trim a handful of extreme outliers so the manifold fills the frame
    lo_x, hi_x = np.percentile(df["UMAP1"], [0.05, 99.9])
    lo_y, hi_y = np.percentile(df["UMAP2"], [0.05, 99.9])
    ax.set_xlim(lo_x, hi_x)
    ax.set_ylim(lo_y, hi_y)
    ax.set_aspect("equal", adjustable="box")
    ax.set_axis_off()

    handles = [
        Line2D(
            [],
            [],
            marker="o",
            linestyle="none",
            markersize=8,
            markerfacecolor=PALETTE[ct],
            markeredgewidth=0,
            label=ct,
        )
        for ct in ORDER
    ]
    leg = ax.legend(
        handles=handles,
        loc="center left",
        bbox_to_anchor=(1.01, 0.5),
        frameon=False,
        fontsize=10.5,
        handletextpad=0.45,
        labelspacing=0.7,
        borderaxespad=0.0,
    )
    for text in leg.get_texts():
        text.set_color("#2b2b2b")

    fig.subplots_adjust(left=0.01, right=0.79, bottom=0.01, top=0.99)
    fig.savefig(out, dpi=240, facecolor="white", bbox_inches="tight", pad_inches=0.04)
    plt.close(fig)
    print(f"saved {out} ({len(df):,} cells)")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--coords", default=DEFAULT_COORDS, type=Path)
    ap.add_argument("--out", default=Path("assets/images/research-figure-1.jpg"), type=Path)
    args = ap.parse_args()
    args.out.parent.mkdir(parents=True, exist_ok=True)
    build(args.coords, args.out)


if __name__ == "__main__":
    main()
