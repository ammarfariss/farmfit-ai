# Architecture

## Current MVP flow

```text
User
  ↓
Next.js client UI
  ├─ Demo plot selection
  ├─ Crop selection
  ├─ Technique selection
  └─ Budget / water / energy limits
        ↓
Deterministic portfolio optimizer
  ├─ Compatibility filter
  ├─ Economic pair scoring
  ├─ Explainable site-fit adjustment (temperature / wind / pH)
  ├─ Minimum-viable zone seeding
  ├─ Direct constrained growth (land / budget / water / energy)
  ├─ Shared-infrastructure calculation
  └─ ROI / payback / explanation generation
        ↓
Results UI
  ├─ Financial metrics
  ├─ Resource metrics
  ├─ Portfolio shares
  └─ 2D MapLibre allocation visualization

Selected plot centroid
        ↓
Next.js /api/site-data
  ├─ NASA POWER climatology
  ├─ OSM Overpass
  ├─ SoilGrids pH
  └─ Qatar Open Data catalog search
        ↓
  ├─ temperature / wind / pH → optimizer site-fit adjustment
  └─ full context → site-context panel
```

## Important architectural boundary

The site-context API now feeds **temperature, wind and soil pH** into the optimizer's explainable ranking step.

Solar irradiation, humidity, OpenStreetMap market/road counts and Qatar Open Data catalog results remain informational context only.

## Front end

- Next.js
- React
- TypeScript
- Recharts
- MapLibre GL

## Geospatial

- Demo GeoJSON plot polygons
- MapLibre rendering
- Turf area/helpers for layout geometry

## Optimizer

File:

`src/lib/model/optimizer.ts`

Current method:
- compatibility filtering;
- deterministic economic ranking;
- explainable temperature/wind/pH site-fit adjustment;
- minimum-viable zone seeding;
- direct constrained growth without post-scaling below minimum areas;
- binding-constraint reporting.

## External data route

File:

`src/app/api/site-data/route.ts`

External requests are server-side, independently timeout, preserve partial successes, and expose source-readiness status to the UI.

## Optional cadastral adapter

`src/lib/data/qatar-gis.ts` contains an environment-variable-based FeatureServer adapter.

It is currently not used by the main page or map component.

## Testing

`src/lib/model/optimizer.test.ts` tests:
- positive financial outputs;
- usable-area constraints;
- budget/water/energy limits;
- contiguous simple geometry blocks.
