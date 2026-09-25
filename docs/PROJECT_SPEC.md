# FarmFit AI — Project Specification

**Project:** FarmFit AI  
**Challenge:** Reboot the Earth 2026 — Challenge 1  
**Status:** Hackathon MVP specification  
**Scope:** Site suitability + crop/system recommendation + farm investment scenario planning

## 1. Problem

Farm planning is a coupled decision problem.

A farmer or investor must simultaneously consider:

- land area and spatial layout;
- crop choice;
- production system;
- site suitability;
- water;
- energy;
- investment budget;
- operating cost;
- expected yield;
- market context;
- risk.

Optimizing each decision independently can produce a locally attractive option that is poor for the farm as a whole.

## 2. Core Value Proposition

**FarmFit designs the best farm portfolio, not just the best crop.**

The system evaluates combinations of crops, production systems and land allocations under explicit constraints, then presents a portfolio-level plan and scenario metrics.

## 3. User Journey

### Inputs

1. Select one or more plots.
2. Select candidate crops.
3. Select available production systems.
4. Set constraints:
   - CapEx budget;
   - water limit;
   - energy limit;
   - optional payback / return / risk preferences.
5. Review or adjust scenario assumptions.

### Decision Engine

The engine should:

- load available site/context data;
- reject infeasible combinations;
- evaluate crop × technique × area allocations;
- calculate financial and resource consequences;
- rank or optimize feasible portfolios;
- preserve enough intermediate information to explain the recommendation.

### Outputs

- 2D land-allocation visual;
- crop/system mix;
- expected annual yield;
- projected revenue;
- CapEx;
- OpEx;
- water demand;
- energy demand;
- estimated payback;
- risk / uncertainty indicators;
- assumptions and constraints.

## 4. Supported Production-System Categories

The product concept can support:

- open field;
- shade house;
- greenhouse;
- hydroponics / substrate systems;
- vertical farming.

The final list in the presentation must match the prototype.

## 5. Site-Suitability Dimensions

The official Challenge 1 framing makes the following dimensions relevant:

- solar exposure;
- wind / dust risk;
- soil salinity;
- water availability;
- market access.

The final prototype does not have to implement every possible data layer, but the presentation must clearly distinguish **implemented**, **approximated** and **future** layers.

## 6. Portfolio Optimization

### Decision Variables

The central decision is the area allocated to crop/system combinations.

### Constraints

At minimum, the model may include:

- land area;
- budget;
- water;
- energy;
- suitability/feasibility.

### Objective

A final implementation may maximize annual net benefit or a transparent weighted score while reporting ROI/payback separately.

The exact objective function must match the code.

See [MODEL_CARD.md](MODEL_CARD.md).

## 7. Spatial Output

The 2D layout should communicate **management allocation**, not engineering design.

It may show:

- crop/system zones;
- area shares;
- labels;
- resource/economic summary.

Do not call it a construction-ready design.

## 8. Data Philosophy

1. Prefer authoritative/open sources.
2. Record exact provenance.
3. Treat coarse environmental layers as indicators, not parcel measurements.
4. Separate measured/source-derived data from scenario assumptions.
5. Keep external service lock-in low where practical.

See [DATA_SOURCES.md](DATA_SOURCES.md).

## 9. Challenge Boundary / Non-Goals

FarmFit is **not** a Challenge 2 cold-chain product.

The canonical scope excludes:

- cold-storage sensors;
- spoilage prediction;
- shelf-life prediction;
- shipment rerouting;
- “88% accurate” spoilage ML.

These features appeared in an earlier research specification but were removed because they belong to the separate cold-chain challenge and were not supported by FarmFit implementation evidence.

## 10. MVP Success Test

A convincing MVP should demonstrate this end-to-end path:

1. user selects/defines land;
2. user chooses crops and systems;
3. user sets constraints;
4. engine evaluates feasible alternatives;
5. engine returns an optimized portfolio;
6. UI shows the allocation and financial/resource outputs;
7. user can explain why the output was chosen.

## 11. Submission Truth Rule

**What the pitch says, what the README says, and what the code does must agree.**

Any feature not present in code should be labelled planned/future rather than demonstrated.
