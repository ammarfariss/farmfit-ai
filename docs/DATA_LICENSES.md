# Data Licences and Attribution

FarmFit AI source code is licensed under the **MIT License**.

External data, APIs, map data and third-party libraries keep their own licences and terms.

## Current Licence / Terms Register

| Resource | Type | Licence / Terms | Attribution / Action | Status |
|---|---|---|---|---|
| FarmFit AI code | Software | MIT | Keep LICENSE and copyright notice | Active |
| Leaflet | Software library | BSD-2-Clause | Retain licence/attribution if used | Verify after code push |
| OpenStreetMap data | Open data | ODbL | Credit “© OpenStreetMap contributors” and link licence | Verify after code push |
| NASA POWER | Scientific data/API | Open NASA data; follow dataset-specific notices | Cite POWER service/version/access date per POWER referencing guide | Verify after code push |
| NASA MERRA-2 | Scientific data | NASA Earth-science data terms / dataset citation | Cite exact collection + DOI if used | Verify after code push |
| FAO GloSIS / GSASmap | Data platform/datasets | Dataset-specific FAO terms must be checked | Record exact layer licence before redistribution | Verify after code push |
| Qatar public/open data | Data | Dataset-specific terms | Record exact portal dataset + licence | TBD |
| Mapbox | Commercial API | Proprietary service terms | Requires valid access token; not an open-source dependency | Only if actually used |

## Open-Source Notes

- MIT is an **OSI-approved** open-source licence.
- OpenStreetMap data are open data, but ODbL obligations still apply.
- Leaflet is open-source software under BSD-2-Clause.
- “Publicly accessible” does **not** automatically mean “openly redistributable.”
- A commercial API can be technically useful without being open source. If one is used, disclose it rather than presenting the entire stack as open.

## NASA Attribution

If NASA POWER data are used, record:

- service name;
- version;
- date accessed;
- variables requested.

NASA POWER explicitly requests citation of the project and data service.

## Before Submission

Once dependencies and APIs are visible in the final code, update this table with exact package versions and licences.
