# Data Sources

This register reflects the code currently in the repository.

| Source | Current use in code | Variables / output | Status |
|---|---|---|---|
| NASA POWER climatology API | Site-context API | T2M, ALLSKY_SFC_SW_DWN, RH2M, WS2M | **Implemented** |
| OpenStreetMap / Overpass API | Site-context API | nearby supermarket/greengrocer/market features; primary/secondary/tertiary roads within 3 km | **Implemented** |
| SoilGrids REST API | Site-context API | pH at 0–5 cm when available | **Implemented with graceful fallback** |
| Qatar Open Data catalog API | Dataset discovery only | dataset IDs/titles from a catalog search | **Implemented, but no dataset values are ingested** |
| CARTO Positron basemap | Map visualization | basemap tiles/style | **Implemented** |
| Demo Al Khor plot polygons | Plot selection and map demo | 3 representative polygons and declared areas | **Implemented demo data** |
| Qatar cadastral FeatureServer | Optional adapter in `qatar-gis.ts` | GeoJSON parcels | **Prepared but not wired into UI** |

## Critical interpretation

The external climate, soil and market-access context is currently **display-only**. It is not yet passed into `optimizePortfolio()`.

Therefore the final pitch should say:

> “FarmFit combines a working portfolio optimizer with live site-context data.”

Do **not** yet say:

> “The optimizer changes its recommendation based on NASA/soil/market data.”

That would require connecting these variables directly to the decision engine.

## Source provenance in code

- NASA POWER endpoint: `src/app/api/site-data/route.ts`
- Overpass API: `src/app/api/site-data/route.ts`
- SoilGrids endpoint: `src/app/api/site-data/route.ts`
- Qatar Open Data catalog: `src/app/api/site-data/route.ts`
- Demo plot polygons: `src/lib/data/demo-plots.ts`
- Optional cadastral adapter: `src/lib/data/qatar-gis.ts`

## Submission rule

Any source named in the presentation must match an actual code path or be explicitly labelled “future integration”.
