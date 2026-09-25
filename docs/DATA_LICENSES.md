# Data Licences and Attribution

FarmFit AI source code is licensed under the **MIT License**.

External datasets, APIs, map data, tiles/styles and software libraries retain their own licences and terms.

## Current Register

| Resource | Current role | Licence / terms note | Status |
|---|---|---|---|
| FarmFit AI code | Application source | MIT | Active |
| Next.js / React / Recharts | Web application UI | Open-source package licences; keep package metadata/notices | Active |
| MapLibre GL JS | Interactive map rendering | Open-source; retain required notices | Active |
| Turf | Geometry helpers | Open-source package licence | Active |
| OpenStreetMap data | Market/road context and map attribution | ODbL; retain “© OpenStreetMap contributors” attribution | Active |
| CARTO Positron | Basemap style/tiles | CARTO service/attribution terms apply in addition to OSM attribution | Active |
| NASA POWER | Climate data/API | Follow NASA POWER data-service citation and referencing guidance | Active |
| SoilGrids / ISRIC | Soil pH service | Dataset/service-specific licence and attribution apply | Active when available |
| Qatar Open Data portal | Dataset-catalog discovery | Dataset-specific portal terms apply | Active for catalog discovery |

## Not Used in the Current MVP

The final code does **not** use Leaflet, Mapbox, MERRA-2 or FAO GloSIS/GSASmap in the active application path.

## Attribution Rule

Publicly accessible data are not automatically unrestricted. The repository and presentation should name the actual source used and preserve source-specific attribution.

## NASA POWER

For a production/public deployment, record:
- POWER service used;
- variables requested;
- date accessed;
- applicable version/referencing guidance.

## Submission Check

The final dependency list is represented by `package.json` / `package-lock.json`. Unused GLPK was removed from the project before submission.
