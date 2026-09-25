# FarmFit AI — Implemented MVP Specification

**Challenge:** Reboot the Earth 2026 — Challenge 1  
**Status:** Working hackathon prototype

## Implemented user journey

1. Select one representative demo Al Khor plot.
2. Select crops.
3. Select production techniques.
4. Enter:
   - budget;
   - annual water limit;
   - annual energy limit.
5. Run the portfolio optimizer.
6. View:
   - crop/system allocation;
   - annual yield;
   - annual revenue;
   - annual profit;
   - CapEx;
   - annual OpEx;
   - water;
   - energy;
   - payback;
   - 5-year ROI.
7. View the allocation on a MapLibre map.
8. View site-context data, source readiness, site fit and the tightest binding constraint.

## Implemented crops

- Tomato
- Cucumber
- Lettuce
- Bell pepper
- Strawberry

## Implemented systems

- Open field
- Conventional greenhouse
- Hydroponic greenhouse
- Vertical hydroponics

## Implemented constraints

- land area;
- CapEx budget;
- annual water limit;
- annual energy limit;
- crop/system compatibility;
- minimum technique area.

## Implemented optimization method

FarmFit currently uses a deterministic site-aware ranking + minimum-viable-zone allocation heuristic.

It directly enforces land, budget, water and energy limits, preserves minimum technique areas, reports the binding constraint, and remains transparent rather than claiming global mathematical optimality.

See [MODEL_CARD.md](MODEL_CARD.md).

## Implemented site context

- NASA POWER climatology;
- OSM/Overpass market and road proximity;
- SoilGrids pH when available;
- Qatar Open Data catalog discovery.

The current optimizer uses NASA temperature/wind and SoilGrids pH in an explainable site-fit adjustment. OSM market/road context and Qatar Open Data catalog results are currently informational only.

## Implemented spatial output

The app renders crop-allocation blocks over representative plot polygons.

This is a **management visualization**, not construction-ready spatial planning.

## Prepared but not active

- environment-variable adapter for a Qatar cadastral FeatureServer.

## Not implemented

- official cadastral parcel selection;
- salinity scoring;
- dust-risk modelling;
- water-availability GIS;
- live market-price feeds;
- transport-cost optimization;
- ML training;
- spoilage prediction;
- Pareto optimization;
- exhaustive thousands-of-layout search;
- mathematical-programming solver / global-optimality proof.

## MVP value proposition

**FarmFit designs a constrained farm portfolio rather than recommending one crop in isolation.**

The current prototype demonstrates the end-to-end workflow and makes assumptions visible enough to be challenged and improved.
