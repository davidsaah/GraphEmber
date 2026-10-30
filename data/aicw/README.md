# AIC:W network for GraphEmber

Built 30 Oct 2026 for David. Generator: `build.py` (run `python3 build.py source/cwi-landscape-initialData.ts`).

## What is here
| File | Use |
|---|---|
| `merged/initialData.ts` | Drop-in for GraphEmber `src/data/initialData.ts`: the 183-node CWI landscape plus the AIC:W network (301 nodes, 458 edges). This is what the `aicw-network` branch ships. |
| `aicw-network.json` | AIC:W network alone (150 nodes, 395 edges) in GraphEmber's `NetworkDataset` JSON. |
| `snapshots/aicw-2025-03.json`, `-2026-05.json`, `-2026-10.json` (+ `.ts` drop-ins) | What existed at each rating date, carrying that date's ratings. |
| `aicw-impact-timeseries.csv` | One row per rating: entity, indicator (capability / used / collaboration / linkage / score), lens (own goal or North Star), period, level, 0-3 number, evidence. Pivot this in Sheets to measure change. |
| `aicw-nodes.csv`, `aicw-edges.csv` | Flat copies for Sheets, Gephi or Kumu. |

## What the network holds
- AIC:W core, WS1-WS4 (in the fixed workstream colours), PMO, M&E, Sandbox Fund, benchmarking initiative.
- 45 organisations with tier, join date and how the date is known (`MEMBER_OF` edges), workstream participation, and leads (tentative ones marked).
- 34 people and their affiliations.
- Partner networks: Wildfire Commons, FAO Fire Hub, WGFD, WEF GWLN, Pyregence/PyreCast, FIRE ADAPT / Fire Tech U, Red Sky, FireSat, EFFIS, SAFF.
- Funding: Google.org ($38.2M tracker), Sandbox ($4M + $4M), PMO annex, NSF, USFS-Planscape, Bezos-EFA, SAFF.
- Sandbox Round 1: 6 received and 5 in development, tagged "Internal only".
- 21 rated projects with Capability / Used / Collaboration at Mar 2025, May 2026 and Oct 2026, the Oct 2026 North Star test, launch-to-now scores, and North Star lever and outcome topics.
- 6 workstream linkages (L1-L6) rated per period, and 22 member-to-member collaboration links with the date first seen.
- 7 convenings from the first call (Aug 2024) to AIC:W Day and Red Sky (Nov 2026).

## How time works
Every node and edge has a `startDate` where known. The GraphEmber branch adds an "Impact over time" bar (All time, Mar 2025, May 2026, Oct 2026). It hides what did not exist yet, draws a three-part ring on each rated project (capability, used, collaboration; grey/pale/orange/green for none/planned/emerging/live), relabels the L1-L6 links, and counts live ratings. Oct 2026 shows 20 of 63 live, matching the framework file. To add a rating date, add a code column in `PROJ`, `WSIND` and `LINKS` in `build.py` and a period in `ImpactTimeline.tsx`.

## Caveats
- Ratings are PMO drafts until each group corrects them on 3 Nov 2026.
- Join dates for about 15 organisations are unknown and set to Oct 2026, so they appear only from the Oct 2026 view. The basis is stored on each `MEMBER_OF` edge.
- The co-funder is labelled "Anonymous Sandbox co-funder". It reuses landscape id `land-3`, and in the merged file the landscape's own label stays.
- The CWI landscape has duplicate ids: `land-171` (RTI Exploration and UC Irvine) and `land-172` (Canadian Interagency Forest Fire Centre and Google Research). AIC:W uses new ids for those two.
- Sandbox bid names and amounts are internal. Remove the `Internal only` nodes before sharing outside the PMO.
