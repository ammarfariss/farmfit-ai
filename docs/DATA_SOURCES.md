# Data Sources

This register reflects the code currently in the repository.

| Source | Current use in code | Variables / output | Status |
|---|---|---|---|
| NASA POWER climatology API | Site-context API + ranking input | Temperature and wind influence site-fit; solar/humidity are displayed | **Implemented** |
| OpenStreetMap / Overpass API | Site-context API | nearby supermarket/greengrocer/market features; primary/secondary/tertiary roads within 3 km | **Implemented as context; not yet scored** |
| SoilGrids REST API | Site-context API + ranking input | pH at 0–5 cm when available; production systems have different soil dependence | **Implemented with graceful fallback** |
| Qatar Open Data catalog API | Dataset discovery only | dataset IDs/titles from a catalog search | **Implemented, but no dataset values are ingested** |
| CARTO Positron basemap | Map visualization | basemap tiles/style | **Implemented** |
| Demo Al Khor plot polygons | Plot selection and map demo | 3 representative polygons and declared areas | **Implemented demo data** |
| Qatar cadastral FeatureServer | Optional adapter in `qatar-gis.ts` | GeoJSON parcels | **Prepared but not wired into UI** |

## Critical interpretation

Temperature, wind and soil pH are passed into `optimizePortfolio()` as an explainable site-context adjustment. This means site conditions can change the ranking of otherwise identical crop/system options.

Current boundary:
- **Scored:** temperature, wind and soil pH.
- **Displayed only:** solar irradiation, humidity, nearby markets/roads and Qatar Open Data catalog results.

Safe pitch wording:

> “FarmFit combines farm economics and resource constraints with explainable site suitability from live/open environmental context.”

## Source provenance in code

- NASA POWER endpoint: `src/app/api/site-data/route.ts`
- Overpass API: `src/app/api/site-data/route.ts`
- SoilGrids endpoint: `src/app/api/site-data/route.ts`
- Qatar Open Data catalog: `src/app/api/site-data/route.ts`
- Demo plot polygons: `src/lib/data/demo-plots.ts`
- Optional cadastral adapter: `src/lib/data/qatar-gis.ts`

## Submission rule

Any source named in the presentation must match an actual code path or be explicitly labelled “future integration”.
