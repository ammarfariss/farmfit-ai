# Data Sources

This file separates **verified candidate sources** from **sources actually implemented**.

## Rule

A source is only marked **Implemented** when the final prototype code actually calls, reads or embeds it.

## Verified Candidate Source Register

| Source | Potential Use | What is Verified | Important Caveat | Final Status |
|---|---|---|---|---|
| NASA POWER Daily API | Solar / meteorological context | Official API returns analysis-ready daily solar and meteorological data | Grid data are not farm sensors; document parameter and resolution used | Verify after code push |
| NASA MERRA-2 M2T1NXAER | Regional dust / aerosol indicator | Official MERRA-2 aerosol-diagnostics collection exists | Coarse reanalysis; use only as a **regional exposure indicator**, not parcel-level dust measurement | Verify after code push |
| FAO GloSIS | Soil-information discovery | Official FAO Global Soil Information System exists | Dataset coverage varies by country and layer | Verify after code push |
| FAO GSASmap | Salinity context | Includes EC/ESP/pH salt-affected-soil information | FAO notes data gaps in the Near East and North Africa region; do not assume Qatar parcel coverage | Verify after code push |
| OpenStreetMap | Roads / geographic / market-access context | Open map data under ODbL | Attribution required; tile-service terms are separate | Verify after code push |
| Qatar public/open data | Qatar-specific agricultural or GIS context | Potentially valuable for local calibration | Exact dataset URL, licence and variable must be recorded before claiming use | TBD |
| User-entered / scenario parameters | CapEx, OpEx, crop price, system assumptions | Transparent editable assumptions can be used where verified local data are unavailable | Must be labelled assumptions, not measured facts | Likely |

## Commercial / Non-Open Services

### Mapbox
Mapbox Directions, Matrix and Isochrone APIs can provide traffic-aware travel-time information, but Mapbox is a commercial token-based service.

If Mapbox is used:

- disclose it explicitly;
- document its terms separately;
- do not describe it as an open-source dependency;
- keep the FarmFit core optimizer portable where practical.

## Candidate Source References

- NASA POWER Daily API: https://power.larc.nasa.gov/docs/services/api/temporal/daily/
- NASA POWER referencing guide: https://power.larc.nasa.gov/docs/referencing/
- NASA MERRA-2 product documentation: https://gmao.gsfc.nasa.gov/gmao-products/merra-2/
- FAO GloSIS: https://data.apps.fao.org/glosis/
- FAO GSASmap: https://www.fao.org/global-soil-partnership/soil-data/global-map-of-salt-affected-soils-gsasmap/en
- OpenStreetMap licence: https://www.openstreetmap.org/copyright
- Mapbox navigation APIs: https://docs.mapbox.com/api/navigation/

## Final Submission Checklist

For every implemented source record:

1. exact source name;
2. direct source/API link;
3. exact variables used;
4. access date;
5. spatial/temporal resolution;
6. preprocessing;
7. licence / terms;
8. attribution text;
9. uncertainty / limitations;
10. code file where the source is used.

The presentation, README and code must use the same source list.
