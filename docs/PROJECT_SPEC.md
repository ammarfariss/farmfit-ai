# FarmFit AI — Implemented MVP Specification

**Challenge:** Reboot the Earth 2026 — Challenge 1  
**Status:** Working hackathon prototype

## Implemented user journey

1. Select one or more demo Al Khor plots.
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
8. View site-context data from available external sources.

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

FarmFit currently uses a deterministic scoring + greedy-allocation heuristic.

It is transparent and resource-constrained, but it is not currently a global mathematical optimizer.

See [MODEL_CARD.md](MODEL_CARD.md).

## Implemented site context

- NASA POWER climatology;
- OSM/Overpass market and road proximity;
- SoilGrids pH when available;
- Qatar Open Data catalog discovery.

The current optimizer does not yet use these site variables in its score.

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
- GLPK-based solver in the current optimization path.

## MVP value proposition

**FarmFit designs a constrained farm portfolio rather than recommending one crop in isolation.**

The current prototype demonstrates the end-to-end workflow and makes assumptions visible enough to be challenged and improved.
