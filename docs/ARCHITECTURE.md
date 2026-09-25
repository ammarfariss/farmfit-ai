# Architecture

FarmFit AI is designed as an agricultural portfolio-optimization workflow rather than a single-crop recommendation tool.

## Intended Flow

```text
User selects one or more plots
        ↓
User chooses candidate crops and production techniques
        ↓
User enters constraints
(budget, water, energy, return/risk preferences)
        ↓
Site and contextual data layer
(GIS, weather, soil, water, market)
        ↓
Feasibility and constraint checks
        ↓
Portfolio optimizer
(crop × technique × land allocation)
        ↓
Economic/resource calculations
        ↓
Spatial allocation
        ↓
2D farm-management plan + metrics
```

## Core Modules

- **Map / Plot Selection** — identifies the land considered by the user.
- **Data Layer** — gathers or reads environmental and geographic inputs.
- **Constraint Engine** — rejects or penalizes infeasible combinations.
- **Portfolio Optimizer** — evaluates combinations across the whole farm.
- **Finance / Resource Engine** — estimates yield, revenue, CapEx, OpEx, water, energy and payback.
- **Layout Engine** — turns the chosen portfolio into a 2D land-allocation plan.
- **UI / Reporting** — presents assumptions, outputs and trade-offs.

## Implementation Status

This document describes the target architecture. Before final submission, implementation-specific details must be updated to match the code that is actually present in the repository.
