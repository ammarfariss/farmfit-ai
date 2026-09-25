# Reboot the Earth 2026 — Judging Alignment

## 1. Problem & Functionality

### Present in the MVP
- plot selection;
- crop selection;
- production-system selection;
- budget/water/energy inputs;
- portfolio generation;
- financial/resource outputs;
- map visualization;
- site-context API route.

### Demo priority
Show one complete flow without switching away from the app.

## 2. Innovation & Originality

The strongest differentiation is **portfolio-level allocation**:

> FarmFit does not only ask “which crop?” It asks how limited land should be divided across crops and production systems under financial and resource limits.

Site intelligence now affects ranking through an explainable temperature/wind/soil-pH site-fit adjustment. Be precise that market access, solar/humidity and Qatar catalog data remain contextual rather than scored.

## 3. Ambition & Scope

The prototype combines:
- land;
- crop/system selection;
- financial constraints;
- water/energy constraints;
- portfolio economics;
- spatial visualization;
- external site context.

That is sufficient ambition for an MVP without adding Challenge 2 cold-chain features.

## 4. Technical Feasibility

Repository evidence now includes:
- Next.js/React/TypeScript implementation;
- optimizer source;
- explicit assumptions;
- automated Vitest tests;
- live API integrations with fallbacks;
- explainable site-aware ranking using temperature, wind and soil pH;
- MapLibre/Turf geospatial rendering;
- exact local run instructions.

### Verified build health — 25 Sep 2026
- `npm test`: **5/5 tests passing** after consistency fixes.
- `npm run build`: **production build compiled successfully** after the consistency patch.

## 5. Communication & Impact

Pitch the working flow, not the future roadmap.

Strong phrase:

> “FarmFit designs the farm portfolio, not just the crop.”

## 6. Open Source & Adaptability

Present:
- MIT licence;
- readable source;
- package lock;
- README;
- model card;
- data-source register;
- limitations;
- contribution and security docs.

Before submission, confirm:
- latest `npm test` passes;
- latest `npm run build` passes;
- no credentials are committed.

## 7. Sustainability & SDGs

Use:
- SDG 2.4;
- SDG 6.4;
- SDG 9;
- SDG 12.2.

Explain the trade-off:
controlled-environment systems may save water while increasing energy and capital demand.

## Final submission gate

- [x] latest `npm test` passes after final patch — 5/5 tests passed on 25 Sep 2026
- [x] latest `npm run build` passes after final patch — production build compiled successfully on 25 Sep 2026
- [x] previous test run passed 4/4 before the consistency patch
- [x] previous production build compiled successfully before the consistency patch
- [x] MIT licence present
- [x] README run instructions present
- [x] Challenge 2 claims removed from core story
- [x] Actual optimizer method documented
- [x] Implemented data sources documented
- [x] Demo-vs-official GIS distinction documented
- [x] Financial outputs labelled scenario estimates
- [ ] Final presentation screenshots/numbers match the current app
