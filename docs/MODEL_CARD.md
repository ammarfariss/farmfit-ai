# FarmFit AI — Model Card

## Model Purpose

FarmFit AI is designed to optimize an agricultural land portfolio across candidate crops, production techniques and land allocations under resource and financial constraints.

## Problem Formulation

Rather than asking:

> Which single crop or farming technique is best?

FarmFit asks:

> Given this land and these constraints, what combination of crops, production systems and area allocations produces the strongest overall portfolio?

## Intended Inputs

- selected plot(s);
- candidate crops;
- candidate production systems;
- budget;
- water availability/constraint;
- energy availability/constraint;
- environmental/site characteristics;
- market/context variables;
- financial and production assumptions.

## Intended Outputs

- crop/system portfolio;
- land allocation;
- expected yield estimate;
- revenue estimate;
- CapEx;
- OpEx;
- water and energy use;
- payback estimate;
- risk indicators;
- 2D farm-management layout.

## Optimization

The final submission must document the exact implemented optimization method used by the development team.

Possible implementation elements may include:

- feasibility constraints;
- weighted objectives;
- multi-objective optimization;
- enumeration/search over feasible combinations;
- mathematical programming;
- heuristics.

Do not claim a machine-learning method unless it is actually implemented.

## Explainability

The preferred output should make constraints and trade-offs visible rather than presenting only a single unexplained answer.

## Limitations

See [LIMITATIONS.md](LIMITATIONS.md).

## Intended Use

Decision support for exploratory farm planning and hackathon demonstration.

## Not Intended For

- guaranteed investment returns;
- engineering certification;
- regulatory approval;
- precision agronomy without field validation;
- autonomous farm management.
