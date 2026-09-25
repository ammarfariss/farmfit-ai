# FarmFit AI

**AI-Optimized Farm Portfolio & Spatial Layout**

Built for **Reboot the Earth Global Tech Challenge 2026 — Doha, Qatar**  
Challenge 1: **AI for Site/Facility Suitability and Crop/System Recommendation**

## The Problem

Farmers and agricultural investors with limited land must decide more than simply **what crop to grow**. They must also decide:

- how much land to allocate to each crop;
- which production technique to use;
- how to stay within budget, water and energy constraints;
- how to balance expected yield, revenue, operating cost, capital cost and risk; and
- where each farm component should be placed.

Optimizing every crop or technique independently can miss important interactions across the whole farm.

## Our Solution

**FarmFit AI** treats the farm as a **portfolio optimization problem**.

The user selects one or more land plots, chooses crops and production techniques they can use, and defines constraints such as budget, water availability, energy availability and target return.

The system is designed to evaluate feasible **crop × production-technique × land-allocation combinations** and return a portfolio-level farm plan rather than a single crop recommendation.

## Core Workflow

```text
Select land plot(s)
        ↓
Choose crops + production techniques
        ↓
Set budget / water / energy / return constraints
        ↓
Combine GIS, weather, soil, water and market inputs
        ↓
Evaluate feasible crop × technique × area combinations
        ↓
Portfolio optimization
        ↓
2D spatial farm-management plan
        ↓
Yield | Revenue | CapEx | OpEx | Water/Energy | Payback | Risk
```

## User Inputs

- One or multiple land plots
- Candidate crops
- Available production techniques
- Budget
- Water constraint
- Energy constraint
- Optional return/risk preferences

## Intended Outputs

- Recommended crop portfolio
- Recommended production-system mix
- Land allocation by crop/system
- 2D farm-management layout
- Expected yield estimate
- Revenue estimate
- CapEx estimate
- OpEx estimate
- Water and energy-use estimates
- Payback estimate
- Risk indicators

## Why It Is Different

Many agricultural decision tools focus on **crop suitability** or assess one production option at a time.

FarmFit AI is designed to optimize the **entire farm as a portfolio**, including the interactions between crop choice, production technique, land allocation, resource limits and economics.

## Responsible Decision Support

FarmFit AI is a hackathon prototype and should be treated as **decision support**, not as agricultural, engineering, regulatory or financial advice.

Outputs depend on the quality and spatial resolution of input data and on documented model assumptions. The project does not claim guaranteed yield, profit, payback, regulatory approval or farm-level accuracy where source data is coarse.

See:

- [Model Card](docs/MODEL_CARD.md)
- [Assumptions](docs/ASSUMPTIONS.md)
- [Limitations](docs/LIMITATIONS.md)

## Data & Attribution

The prototype may combine open/public geographic, weather, soil, water, market and agricultural datasets. Only sources actually integrated into the final prototype should be described as implemented.

See:

- [Data Sources](docs/DATA_SOURCES.md)
- [Data Licences](docs/DATA_LICENSES.md)

## Sustainability

FarmFit is intended to make resource constraints visible during farm planning rather than optimizing financial return in isolation.

Relevant themes include:

- food production and food security;
- water efficiency;
- resource-aware agricultural planning;
- innovation in agricultural infrastructure; and
- transparent trade-offs between profitability, water use, energy use and risk.

See [Sustainability](docs/SUSTAINABILITY.md).

## Open Source

FarmFit AI is released under the **MIT License**.

The project is being documented so that other teams, researchers and developers can inspect, adapt and extend the work.

## Architecture

See [Architecture](docs/ARCHITECTURE.md).

## Prototype Status

**Active hackathon development.**

Implementation-specific claims in this repository will be updated to match the final working prototype before submission.

## Repository Structure

```text
farmfit-ai/
├── README.md
├── LICENSE
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATA_SOURCES.md
│   ├── DATA_LICENSES.md
│   ├── ASSUMPTIONS.md
│   ├── LIMITATIONS.md
│   ├── MODEL_CARD.md
│   └── SUSTAINABILITY.md
└── ... prototype code added by the development team
```

## Hackathon

**Reboot the Earth Global Tech Challenge 2026**  
Doha, Qatar — Carnegie Mellon University in Qatar  
September 23–26, 2026
