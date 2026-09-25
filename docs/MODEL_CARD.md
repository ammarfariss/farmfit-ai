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
- optional crop-price overrides.

## Compatibility filtering

Only crop/system pairs listed as compatible in `src/lib/model/assumptions.ts` are considered.

## Pair scoring

For each valid crop/system pair, the code calculates a per-square-metre five-year economic score:

```text
(5 × annual revenue - CapEx - 5 × annual OpEx) / CapEx
```

Pairs are sorted from highest to lowest score.

## Allocation heuristic

The implementation then:

1. treats 94% of selected area as usable;
2. allocates land greedily to ranked crop/system pairs;
3. limits the portfolio to at most four allocations;
4. applies system-specific minimum-area assumptions;
5. assigns remaining land to the first-ranked allocation;
6. uniformly scales allocations down if budget, water or energy limits would be exceeded.

This is a heuristic. It should not be described as a proof of global optimality.

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

Current risk handling is limited to a **portfolio concentration penalty**.

If one allocation exceeds the configured concentration threshold, a fixed penalty is subtracted from five-year ROI.

The current MVP does not contain a full climate-risk, salinity-risk, market-volatility or probabilistic risk model.

## Site-data relationship

NASA POWER, SoilGrids, OpenStreetMap and Qatar Open Data context is displayed in the interface after optimization.

These values are **not currently used by the optimizer**.

## Explainability

The optimizer is intentionally transparent: all major crop/system assumptions and calculations are readable in source code.

## Claims to avoid

Do not describe the current MVP as:

- machine learning;
- AI trained on Qatar farm data;
- Pareto optimization;
- linear programming / GLPK optimization;
- exhaustive search across thousands of layouts;
- guaranteed optimal;
- driven by real-time parcel-level soil/water measurements.

## Intended use

Hackathon demonstration and exploratory farm-planning decision support.
