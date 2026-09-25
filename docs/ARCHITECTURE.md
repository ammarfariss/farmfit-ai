# Architecture

FarmFit AI is designed as a **Challenge 1 agricultural decision-support and portfolio-optimization system**.

## Canonical Flow

```text
1. Plot Selection
   ↓
2. Candidate Crops + Production Systems
   ↓
3. Budget / Water / Energy / Return Constraints
   ↓
4. Site & Scenario Data
   ↓
5. Feasibility / Suitability Checks
   ↓
6. Portfolio Optimization
   ↓
7. Financial + Resource Calculations
   ↓
8. Spatial Allocation
   ↓
9. Explainable 2D Plan + Metrics
```

## Logical Components

### 1. Map / Plot Selection
Captures the land considered by the user. Prefer open geospatial formats such as GeoJSON.

### 2. Data Layer
Potential inputs include:

- solar and meteorological conditions;
- dust / aerosol exposure;
- soil / salinity indicators;
- water constraints;
- roads / market-access context;
- crop/system parameters;
- financial assumptions.

Only sources actually used by the final code should be described as implemented.

### 3. Constraint Engine
Tests whether a candidate allocation violates constraints such as:

- total area;
- CapEx budget;
- water use;
- energy use;
- suitability thresholds;
- user-selected system/crop availability.

### 4. Portfolio Optimizer
Evaluates combinations across the **whole farm**, rather than selecting a single crop independently.

The exact final algorithm must be documented after the prototype code is integrated. Acceptable implementations may include enumeration/search, mathematical programming, heuristics or another transparent constrained optimizer.

### 5. Finance / Resource Engine
Produces scenario estimates for:

- expected yield;
- revenue;
- CapEx;
- OpEx;
- water demand;
- energy demand;
- payback;
- risk / uncertainty indicators.

### 6. Layout Engine
Converts the selected portfolio into a 2D allocation plan. The layout is a planning visualization, not an engineering design.

### 7. UI / Reporting
Shows:

- selected assumptions;
- chosen portfolio;
- constraints;
- trade-offs;
- outputs;
- warnings and limitations.

## Open-Source Architecture Principle

Core decision logic should not depend on a proprietary service where an open alternative is practical.

For mapping, **Leaflet + OpenStreetMap** is an appropriate open foundation if used by the prototype. A commercial routing API such as Mapbox may be used only if clearly disclosed and should not be described as open source.

## Challenge Boundary

Cold-chain sensor ingestion, spoilage prediction and shelf-life ML are excluded from this architecture because they are Challenge 2 features.

## Implementation Status

This document describes the canonical target architecture. It must be reconciled against the final repository code before submission.
