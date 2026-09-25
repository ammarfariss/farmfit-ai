# FarmFit AI — Model Card

## Purpose

FarmFit AI is designed to optimize an agricultural land portfolio across candidate crops, production techniques and land allocations under resource, site and financial constraints.

## Problem Formulation

Instead of asking only:

> Which crop is best?

FarmFit asks:

> Given this land, these candidate crops/systems and these constraints, what combination of crops, production systems and area allocations provides the strongest overall farm portfolio?

## Intended Inputs

- selected plot(s);
- candidate crops;
- candidate production systems;
- budget;
- water limit;
- energy limit;
- environmental/site indicators;
- market-access context where available;
- financial and production assumptions;
- optional risk/return preferences.

## Intended Outputs

- crop/system portfolio;
- area allocation;
- expected yield estimate;
- revenue estimate;
- CapEx;
- OpEx;
- water and energy use;
- payback estimate;
- risk/uncertainty indicators;
- 2D farm-management layout;
- visible assumptions and constraints.

## Reference Mathematical Formulation

Let:

- (S) = candidate sub-plots;
- (C) = candidate crops;
- (T) = candidate production techniques;
- (x_{s,c,t}) = area assigned to sub-plot (s), crop (c), technique (t).

A transparent implementation can optimize a score such as:

[
\text{Score} =
w_p \cdot \text{Profit}
- w_w \cdot \text{WaterUse}
- w_e \cdot \text{EnergyUse}
- w_r \cdot \text{RiskPenalty}
]

subject to constraints including:

[
\sum_{s,c,t} x_{s,c,t} \le A_{total}
]

[
\sum_{s,c,t} CapEx_{s,c,t} \le Budget_{max}
]

[
\sum_{s,c,t} WaterUse_{s,c,t} \le Water_{max}
]

[
\sum_{s,c,t} EnergyUse_{s,c,t} \le Energy_{max}
]

and any minimum suitability / feasibility rules required by the implementation.

ROI and payback are preferably reported as output metrics rather than used as the only objective, because maximizing a ratio can produce unstable or misleading choices when investment is very small.

## Algorithm Status

The exact solver must match the final code.

Do **not** claim:

- “thousands of scenarios” unless the program actually evaluates that scale;
- Pareto optimization unless a Pareto/multi-objective method is implemented;
- machine learning unless an ML model is actually present;
- trained Qatar-farm AI unless a real training dataset and evaluation exist.

A deterministic constrained search can still be a valid, explainable decision engine if accurately described.

## Explainability

For every recommended scenario, the interface should make it possible to understand:

- which constraints were active;
- which assumptions were used;
- why alternatives were rejected or scored lower;
- the main financial/resource trade-offs;
- uncertainty or data-resolution limitations.

## Responsible AI / Decision Support

FarmFit should:

- minimize collection of personal information;
- keep API credentials outside source control;
- expose assumptions;
- avoid false precision;
- distinguish measured data from scenario assumptions;
- avoid claiming guarantees;
- allow human users to override candidate crops/systems and constraints.

## Challenge Boundary

Cold-chain spoilage prediction is not part of this model card because FarmFit is scoped to Challenge 1.

## Intended Use

Exploratory farm planning, comparative scenario analysis and hackathon demonstration.

## Not Intended For

- guaranteed investment returns;
- engineering certification;
- regulatory approval;
- farm-level agronomic prescription without field validation;
- autonomous farm management.
