# FarmFit AI — Model Card

## Model type

The current FarmFit MVP uses a **deterministic, rule-based portfolio heuristic**.

It is not a trained ML model and it is not currently a mathematical-programming solver.

## Inputs

`optimizePortfolio()` receives:

- total selected area;
- budget limit;
- annual water limit;
- annual energy limit;
- selected crops;
- selected production techniques;
- optional crop-price overrides;
- optional site context: temperature, wind speed and soil pH.

## Compatibility filtering

Only crop/system pairs listed as compatible in `src/lib/model/assumptions.ts` are considered.

## Pair scoring

For each valid crop/system pair, the code calculates a per-square-metre five-year economic score:

```text
(5 × annual revenue - CapEx - 5 × annual OpEx) / CapEx
```

Economic scores are normalized across the candidate set. When live site context is available, an explainable site-fit score is calculated from:
- crop temperature range versus NASA POWER climatology;
- system-specific protection from temperature and wind exposure;
- soil pH mismatch, with open-field systems treated as more soil-dependent than hydroponic/vertical systems.

The final ranking combines:
- 60% normalized economic score;
- 40% site-fit score.

Within site fit, temperature / soil pH / wind are weighted only when that factor is actually available. Missing factors are removed and the remaining weights are renormalized, so an unavailable source does not receive a hidden perfect score.

These weights are prototype assumptions declared in `src/lib/model/assumptions.ts`.

## Allocation heuristic

The final implementation:

1. treats 94% of the selected plot as usable;
2. ranks compatible crop/system pairs;
3. attempts to seed the minimum viable area for the best-ranked pairs, up to four zones;
4. skips any candidate whose minimum viable block would violate land, budget, water or energy constraints;
5. grows retained zones in rank order while enforcing all hard limits directly;
6. applies the documented concentration threshold when more than one zone is feasible;
7. reports the tightest binding constraint and unallocated reserve land.

The optimizer does **not** shrink already-selected zones below their technique-specific minimum area.

This remains a transparent heuristic, not a proof of global mathematical optimality.

## Financial calculations

The model calculates:

- annual yield;
- annual revenue;
- annual operating cost;
- CapEx;
- annual water use;
- annual energy use;
- annual profit;
- payback period;
- five-year ROI.

Annual profit also subtracts prototype utility-cost assumptions for water and electricity.

## Shared infrastructure

The model includes prototype costs for shared:

- water infrastructure;
- energy infrastructure;
- cooling infrastructure.

A prototype shared-infrastructure discount is applied.

## Risk treatment

Current risk handling includes a diversification cap during allocation where multiple zones are feasible, plus a concentration penalty when one strategy still dominates the allocated portfolio.

The current MVP does not contain a full climate-risk, salinity-risk, market-volatility or probabilistic risk model.

## Site-data relationship

NASA POWER temperature/wind and SoilGrids pH can influence the ranking through the site-fit adjustment.

NASA solar/humidity, OpenStreetMap market/road context and Qatar Open Data catalog results are currently displayed for context but do not yet change the optimizer score.

## Explainability

The optimizer is intentionally transparent: all major crop/system assumptions and calculations are readable in source code.

## Claims to avoid

Do not describe the current MVP as:

- machine learning;
- AI trained on Qatar farm data;
- Pareto optimization;
- linear or mixed-integer mathematical programming;
- exhaustive search across thousands of layouts;
- guaranteed optimal;
- driven by real-time parcel-level soil/water measurements.

## Revenue downside sensitivity

The results screen also reports a simple **-20% revenue stress ROI**. It keeps the selected farm layout, CapEx, OpEx and resource use unchanged and reduces annual revenue by 20%. This is a sensitivity indicator, not a re-optimized forecast.

## Intended use

Hackathon demonstration and exploratory farm-planning decision support.
