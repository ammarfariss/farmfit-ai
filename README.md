# FarmFit AI

**AI-Optimized Farm Portfolio & Spatial Layout**

Built for **Reboot the Earth Global Tech Challenge 2026 — Doha, Qatar**  
Challenge 1: **AI for Site/Facility Suitability and Crop/System Recommendation**

## What FarmFit Solves

Farmers and agricultural investors with limited land must decide more than simply **what crop to grow**. They must also decide:

- how much land to allocate to each crop;
- which production technique to use;
- how to stay within budget, water and energy constraints;
- how to balance expected yield, revenue, CapEx, OpEx and risk; and
- where each farm component should be placed.

FarmFit AI treats this as a **farm-portfolio optimization problem** rather than a collection of isolated recommendations.

## Challenge Scope

FarmFit is deliberately scoped to **Challenge 1**.

It is designed around the three Challenge 1 themes:

1. **Site suitability intelligence** — geographic and environmental context.
2. **Crop / production-system recommendation** — open field, greenhouse, hydroponic, vertical farming and other supported systems.
3. **Farm investment scenario planning** — yield, resources, CapEx, OpEx, revenue, payback and risk.

**Cold-chain monitoring, shelf-life prediction and spoilage ML are not part of the canonical FarmFit scope.** Those belong to Challenge 2 and are excluded unless the team explicitly changes challenge.

## Core Workflow

```text
Select land plot(s)
        ↓
Choose crops + production techniques
        ↓
Set budget / water / energy / return constraints
        ↓
Load available site + scenario data
        ↓
Check feasibility and suitability
        ↓
Evaluate crop × technique × land-allocation combinations
        ↓
Portfolio optimization
        ↓
2D farm-management plan
        ↓
Yield | Revenue | CapEx | OpEx | Water/Energy | Payback | Risk
```

## Intended Inputs

- One or multiple land plots
- Candidate crops
- Available production techniques
- Budget
- Water constraint
- Energy constraint
- Optional return/risk preferences
- Environmental and geographic inputs where available
- Explicit financial and agronomic assumptions

## Intended Outputs

- Recommended crop/system portfolio
- Land allocation by crop/system
- 2D farm-management layout
- Expected yield estimate
- Revenue estimate
- CapEx estimate
- OpEx estimate
- Water and energy-use estimates
- Payback estimate
- Risk indicators
- Assumptions and trade-offs used to produce the result

## Differentiation

Many agricultural tools focus on crop suitability or evaluate one production option at a time.

FarmFit is designed to optimize the **whole farm as a portfolio**, combining crop choice, production technique, area allocation, site constraints, resources and economics in one decision workflow.

## Responsible Decision Support

FarmFit is a hackathon prototype and should be treated as **decision support**, not agricultural, engineering, regulatory or investment advice.

The project does not claim guaranteed yield, profit, payback, regulatory approval or parcel-level accuracy where source data are coarse. Implementation-specific claims must match the final code.

## Open Source

FarmFit AI is released under the **MIT License**, an OSI-approved open-source licence.

The repository is structured for inspection, reuse and adaptation. External datasets, APIs, map data and libraries keep their own licences and attribution requirements.

See:

- [Open Source & DPG Readiness](docs/OPEN_SOURCE_AND_DPG.md)
- [Data Licences & Attribution](docs/DATA_LICENSES.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## Documentation

- [Project Specification](docs/PROJECT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Model Card](docs/MODEL_CARD.md)
- [Data Sources](docs/DATA_SOURCES.md)
- [Data Licences](docs/DATA_LICENSES.md)
- [Evidence Base](docs/EVIDENCE_BASE.md)
- [Assumptions](docs/ASSUMPTIONS.md)
- [Limitations](docs/LIMITATIONS.md)
- [Sustainability](docs/SUSTAINABILITY.md)
- [Judging Alignment](docs/JUDGING_ALIGNMENT.md)

## Prototype Status

**Active hackathon development.**

The documentation distinguishes between:

- **verified external facts**;
- **intended product behavior**; and
- **features actually implemented in the prototype**.

Before submission, the README, model card, data register and run instructions must be reconciled against the final code.

## Hackathon

**Reboot the Earth Global Tech Challenge 2026**  
Doha, Qatar — Carnegie Mellon University in Qatar  
September 23–26, 2026
