# Limitations

FarmFit AI is a hackathon decision-support prototype.

## Current implementation limitations

- The selectable land parcels are **demo polygons near Al Khor**, not verified cadastral parcels.
- An optional cadastral FeatureServer adapter exists but is not wired into the current UI.
- NASA POWER, SoilGrids and OpenStreetMap context is shown to the user but does **not currently alter optimizer scoring**.
- Qatar Open Data integration currently searches the catalog; it does not ingest agricultural dataset records into the model.
- Soil integration is currently limited to **pH**, not salinity.
- Wind is available from NASA POWER, but there is no implemented dust-risk model.
- There is no implemented water-availability GIS layer.
- Market access is represented by nearby OSM markets/roads, not a full transport-cost model.
- The optimizer is a **greedy heuristic**, not a proof of the globally best solution.
- The current risk treatment is only a simple concentration penalty.
- Crop yield, price, water, CapEx, OpEx and energy parameters contain prototype assumptions.
- The 2D layout uses simple rectangular allocation blocks and is not an engineering layout.
- When multiple plots are selected, the current map visual applies the same portfolio proportions to each selected plot rather than separately optimizing each parcel.
- Site context is fetched for a selected plot centroid rather than performing full parcel-level spatial analysis.
- Outputs are scenario estimates, not guaranteed yields, profit or payback.

## Data-resolution limitations

Remote or model-derived data should not be treated as equivalent to:

- field soil testing;
- irrigation-water testing;
- surveyed parcel boundaries;
- engineering studies;
- audited market-price forecasts.

## Responsible use

FarmFit should support human decision-making, not replace agronomists, engineers, regulators, farmers or investment professionals.
