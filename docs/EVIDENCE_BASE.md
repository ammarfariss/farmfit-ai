# Evidence Base & Claim Audit

This register records claims inherited from the earlier research specification and whether they are safe to use in the FarmFit submission.

## Status Legend

- **VERIFIED** — supported by a credible source.
- **VERIFIED WITH CAVEAT** — source supports the claim, but context/limits matter.
- **OUT OF SCOPE** — factual claim may be true but belongs to Challenge 2 or does not support FarmFit directly.
- **EXCLUDED** — not adequately supported for submission use.

## Claim Register

### 1. Qatar crop-loss values in 2017
**Status: VERIFIED WITH CAVEAT**

A 2025 peer-reviewed Qatar sustainability study reports, using Ministry of Municipality data:

- tomato crop loss value: **QAR 7.5 million** in 2017;
- cucumber: **QAR 7.5 million**;
- squash: **QAR 3.1 million**;
- cantaloupe: **QAR 3.9 million**.

Source:
https://www.mdpi.com/2071-1050/17/15/7106

Use only as **background context on agricultural loss**. Do not claim FarmFit directly prevents those historical losses unless the prototype models that causal pathway.

### 2. 526 million tonnes / 12% lost due to insufficient refrigeration
**Status: VERIFIED, BUT OUT OF SCOPE**

UNEP/FAO sources report that lack of effective refrigeration directly contributes to loss of about **526 million tonnes**, around **12% of global food production**.

Sources:
- https://www.unep.org/topics/food-systems/food-loss-and-waste/sustainable-cold-chains
- https://www.fao.org/newsroom/detail/amid-food-and-climate-crises-investing-in-sustainable-food-cold-chains-crucial/

This belongs to **Challenge 2 cold-chain monitoring**. It should not be a core FarmFit claim.

### 3. Hydroponics can use up to 90% less water
**Status: VERIFIED WITH CAVEAT**

FAO published a 2026 example stating hydroponics can use **up to 90% less water** than conventional cultivation.

Source:
https://www.fao.org/newsroom/story/no-soil-no-problem/en

This is an upper-bound/context-specific comparison, not a guaranteed result for Qatar or for every crop/system.

### 4. NASA POWER provides solar and meteorological data by API
**Status: VERIFIED**

NASA POWER’s official Daily API returns analysis-ready daily solar and meteorological data.

Source:
https://power.larc.nasa.gov/docs/services/api/temporal/daily/

If used, cite the service/version/access date:
https://power.larc.nasa.gov/docs/referencing/

### 5. MERRA-2 M2T1NXAER can support dust/aerosol context
**Status: VERIFIED WITH CAVEAT**

NASA documents **M2T1NXAER** as a one-hourly 2D aerosol-diagnostics collection.

Source:
https://gmao.gsfc.nasa.gov/gmao-products/merra-2/

Its grid is much coarser than a farm parcel, so FarmFit should describe it as a **regional dust/aerosol exposure indicator**, not an exact plot sensor.

### 6. FAO GloSIS / GSASmap for salinity
**Status: VERIFIED WITH MAJOR COVERAGE CAVEAT**

FAO GloSIS is a real global soil-information platform. FAO’s GSASmap includes salt-affected-soil indicators such as EC, ESP and pH.

Sources:
- https://data.apps.fao.org/glosis/
- https://www.fao.org/global-soil-partnership/soil-data/global-map-of-salt-affected-soils-gsasmap/en

FAO explicitly notes coverage challenges in the **Near East and North Africa** region. Therefore, do not claim Qatar parcel-level salinity from GSASmap without confirming the exact layer and coverage.

### 7. Mapbox traffic-aware routing
**Status: TECHNICALLY VERIFIED, NOT OPEN SOURCE**

Mapbox Directions, Matrix and Isochrone APIs support traffic-aware routing profiles.

Sources:
- https://docs.mapbox.com/api/navigation/directions/
- https://docs.mapbox.com/api/navigation/matrix/
- https://docs.mapbox.com/api/navigation/isochrone/

However, these are commercial APIs requiring an access token and are not an open-source dependency. If used, disclose them and avoid making the core optimizer dependent on them where practical.

### 8. “Qatar imports approximately USD 3.0B of food & beverage annually”
**Status: EXCLUDED**

This audit did not confirm that exact figure from a sufficiently clear authoritative source using the same category definition and year.

Do not use the USD 3.0B claim in the final pitch or README unless the team supplies a direct authoritative source and definition.

### 9. “Qatar health/wellness food market = USD 778.9M”
**Status: EXCLUDED**

No authoritative public source was confirmed in this audit. It is not necessary to prove the Challenge 1 problem.

### 10. “88% accurate spoilage ML”
**Status: EXCLUDED**

No FarmFit training dataset, evaluation protocol, model artifact or reproducible result supports this number.

It also belongs to Challenge 2.

### 11. Hard-coded municipality → technology recommendations
**Status: EXCLUDED FROM CANONICAL MODEL**

The earlier spec mapped municipalities directly to predetermined technologies.

FarmFit’s differentiation is stronger when **data + constraints drive the portfolio**. Municipality can be contextual input, but it should not automatically determine the answer without evidence.

## Submission Principle

Use fewer strong claims rather than many impressive-sounding claims that the team cannot reproduce or defend.
