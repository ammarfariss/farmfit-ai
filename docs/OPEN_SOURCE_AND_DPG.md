# Open Source & Digital Public Good Readiness

FarmFit is **open-source**, but it should not claim to already be an officially recognised Digital Public Good.

The correct framing is:

> FarmFit is being developed **toward DPG-aligned practices**.

## Open-Source Licence

FarmFit uses the **MIT License**.

MIT is an OSI-approved licence:
https://opensource.org/license/mit

## DPG Standard

The Digital Public Goods Alliance currently describes nine indicator areas:

1. SDG relevance
2. Open licensing
3. Clear ownership
4. Platform independence
5. Documentation
6. Non-PII data extraction
7. Privacy & applicable laws
8. Open standards & best practices
9. Do-no-harm / safety areas, including data privacy and security, inappropriate/illegal content and protection from harassment

Source:
https://www.digitalpublicgoods.net/standard

## FarmFit Readiness Matrix

| Area | FarmFit Position | Submission Action |
|---|---|---|
| SDG relevance | Strong alignment with SDG 2, 6, 9, 12 | Keep mappings evidence-based |
| Open licensing | MIT licence present | Keep LICENSE in root |
| Clear ownership | Repository owner/team visible in Git history | Add final team names before submission |
| Platform independence | Intended to run from source | Add exact local run instructions after code push |
| Documentation | README + docs directory | Reconcile docs with final code |
| Non-PII extraction | Farm planning should not require personal data | Do not collect unnecessary PII |
| Privacy/law | Low-PII design; external APIs may have terms | Document services and privacy implications |
| Open standards/best practices | Prefer GeoJSON, JSON, CSV and standard web formats | Record actual formats in architecture |
| Security/do-no-harm | Secrets ignored; limitations documented | Audit repo for keys, credentials and risky claims |

## Open-Source Dependency Rules

Before submission:

- list every third-party package actually imported;
- record licence and version where practical;
- attribute map/data sources;
- remove unused proprietary dependencies;
- never commit API secrets;
- provide a reproducible run command;
- use open data where possible;
- disclose non-open services honestly.

## Open Mapping

If the final app uses:

- **Leaflet** — BSD-2-Clause open-source library;
- **OpenStreetMap data** — ODbL open data with attribution requirements.

Do not confuse the software library, the underlying map data and the tile-hosting service; they can have different terms.

## DPG Claim Language

### Safe
“Open-source and designed toward DPG-aligned practices.”

### Avoid
“FarmFit is a certified Digital Public Good.”

Official recognition requires a separate DPGA review process.
