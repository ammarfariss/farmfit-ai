# Model and Financial Assumptions

The current MVP uses explicit prototype assumptions stored in:

`src/lib/model/assumptions.ts`

These values are scenario inputs for comparison, not guaranteed Qatar farm economics.

## Default constraints

| Parameter | Current default |
|---|---:|
| Budget | QAR 500,000 |
| Annual water limit | 22,000 m³ |
| Annual energy limit | 130,000 kWh |
| Usable-area factor | 94% of selected declared area |
| Water cost | QAR 2.50 / m³ |
| Electricity cost | QAR 0.22 / kWh |
| Concentration-risk threshold | 55% |
| Concentration-risk penalty | 0.06 on 5-year ROI |
| Shared infrastructure discount | 18% |
| Economic ranking weight | 60% |
| Site-fit ranking weight | 40% |

## Shared infrastructure assumptions

| Item | Prototype value |
|---|---:|
| Water infrastructure | QAR 24,000 |
| Energy infrastructure | QAR 42,000 |
| Cooling infrastructure | QAR 35,000 |

## Crop assumptions

The code currently contains scenario values for:

- tomato;
- cucumber;
- lettuce;
- bell pepper;
- strawberry.

For each crop, the prototype stores:

- baseline yield per m²;
- water use per kg;
- season;
- temperature range;
- salinity-tolerance category;
- QAR/kg price;
- harvest-cycle days.

Several values are explicitly labelled **prototype assumptions** in code.

## Technique assumptions

The code currently contains:

- open field;
- conventional greenhouse;
- hydroponic greenhouse;
- vertical hydroponics.

For each technique, it stores:

- CapEx / m²;
- OpEx / m²;
- water multiplier;
- energy use / m²;
- yield multiplier;
- compatible crops;
- minimum area;
- infrastructure category.

## Interpretation

These parameters are useful for a transparent MVP because judges can see how the calculation works. The ranking weights and 94% usable-area factor are explicit prototype assumptions rather than hidden model behaviour.

They must not be presented as audited engineering quotations or guaranteed commercial performance.

## Before real deployment

A production version would require:

- Qatar-specific supplier quotations;
- crop-specific farm trials;
- verified utility tariffs;
- cultivar and seasonal yield ranges;
- site-specific water quality;
- actual climate-control loads;
- sensitivity analysis and uncertainty ranges.
