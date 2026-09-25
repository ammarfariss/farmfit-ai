# FarmFit AI

**AI-Optimized Farm Portfolio & Spatial Layout**

Built for **Reboot the Earth Global Tech Challenge 2026 — Doha, Qatar**  
Challenge 1: **AI for Site/Facility Suitability and Crop/System Recommendation**

## What the current MVP actually does

FarmFit lets a user:

1. select one or more **demo farm plots near Al Khor**;
2. choose candidate crops;
3. choose production systems;
4. set budget, annual water and annual energy limits;
5. run a transparent portfolio-allocation heuristic;
6. receive crop/system allocations, CapEx, OpEx, revenue, annual profit, water use, energy use, payback and 5-year ROI;
7. view the resulting crop zones on a 2D map;
8. load a site-context snapshot from external open/public services.

The current prototype is a **decision-support MVP**, not a production agronomy or investment system.

## Implemented crop and system choices

### Crops
- Tomato
- Cucumber
- Lettuce
- Bell pepper
- Strawberry

### Production systems
- Open field
- Conventional greenhouse
- Hydroponic greenhouse
- Vertical hydroponics

## Implemented site-context sources

The current API route attempts to retrieve:

- **NASA POWER climatology** — temperature, solar irradiation, humidity and wind;
- **OpenStreetMap via Overpass API** — nearby markets and major roads;
- **SoilGrids** — 0–5 cm soil pH when available;
- **Qatar Open Data** — catalog search results only, used for dataset discovery.

If external requests fail, the prototype falls back to a clearly labelled demo climate baseline.

**Current site-aware behavior:** temperature and wind from NASA POWER plus soil pH from SoilGrids are passed into an explainable site-fit adjustment that can change crop/system ranking. Solar irradiation, humidity, nearby-road/market counts and Qatar Open Data catalog results are currently displayed as context but do not yet affect the score.

## Land / GIS status

The map currently uses representative **demo polygons near Al Khor**.

An adapter for a future Qatar cadastral FeatureServer is present in the code, but it is not currently wired into the main user interface. The prototype must therefore be described as using **demo GIS plots**, not official cadastral parcels.

## How the optimizer works

The current MVP uses an explainable **deterministic heuristic**, not machine learning.

It:

1. filters incompatible crop/system pairs;
2. scores valid pairs using a five-year economic score per unit area;
3. applies an explainable site-fit adjustment using temperature, wind and soil pH when available;
4. ranks the adjusted crop/system pairs;
5. greedily allocates area to up to four crop/system combinations;
6. scales the portfolio down when necessary to respect budget, water and energy limits;
7. calculates shared infrastructure cost, annual profit, payback and 5-year ROI;
8. applies a simple concentration-risk penalty when one allocation becomes too dominant.

It does **not** currently use:
- ML training;
- Pareto optimization;
- a mathematical-programming solver;
- thousands of exhaustively evaluated layouts;
- parcel-level sensor measurements or a full agronomic simulation.

## Run locally

Requirements:
- Node.js
- npm

```bash
git clone https://github.com/ammarfariss/farmfit-ai.git
cd farmfit-ai
npm install
npm run dev
```

Open the local URL shown by Next.js, normally:

```text
http://localhost:3000
```

Run the model tests with:

```bash
npm test
```

Build a production bundle with:

```bash
npm run build
```

## Main technology stack

- Next.js
- React
- TypeScript
- MapLibre GL
- Turf
- Recharts
- Vitest

## Responsible-use note

Financial, agronomic and infrastructure values in the prototype include scenario assumptions. Outputs are estimates for comparison and demonstration, not guaranteed yield, profit, payback, regulatory approval or engineering design.

## Open source

FarmFit AI is released under the **MIT License**.

See:
- [Project Specification](docs/PROJECT_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Model Card](docs/MODEL_CARD.md)
- [Data Sources](docs/DATA_SOURCES.md)
- [Data Licences](docs/DATA_LICENSES.md)
- [Assumptions](docs/ASSUMPTIONS.md)
- [Limitations](docs/LIMITATIONS.md)
- [Sustainability](docs/SUSTAINABILITY.md)
- [Open Source & DPG Readiness](docs/OPEN_SOURCE_AND_DPG.md)
- [Judging Alignment](docs/JUDGING_ALIGNMENT.md)

## Hackathon

**Reboot the Earth Global Tech Challenge 2026**  
Doha, Qatar — Carnegie Mellon University in Qatar  
September 23–26, 2026
