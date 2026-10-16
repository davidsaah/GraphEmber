# GraphEmber

A Climate & Wildfire Institute (CWI) tool that maps the wildfire intelligence landscape as an interactive network: organizations, tools and systems, collaboratives, programs and the topics that connect them.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check and build to dist/
npm run lint
```

The build uses relative asset paths, so `dist/` can be served from any static host or subfolder.

## Data

The graph is generated, not hand-edited:

- `sheet1.csv` is the AI Wildfire Landscape sheet export (172 rows).
- `data/curated.json` holds the hand-curated Firelines/CWI records (topics, CWI, Resilient Home Fund, Earth Fire Alliance, FireSat).
- `npm run data` runs `scripts/build-data.mjs`, which merges the two into `src/data/initialData.ts`.

What the script does:

- Merges sheet rows that duplicate a curated record or an earlier row (for example "CalFIRE" into CAL FIRE).
- Links each organization in the sheet's collaborative design to the **AI Wildfire Collaborative** with `PARTNERS_IN` (how = delivery role).
- Turns the technology columns into `HAS_TOPIC` links to the topic hubs. Rows with no technology flags fall back to their fire stage and deliverables (marked `modality: fire stage` or `inferred from deliverables`).
- Adds `FUNDS` links from Google.org for rows marked GWFC funded.
- Resolves "Key Collaborators" names to existing nodes as `COLLABORATES_WITH`. Names that aren't entities (such as "Fire Agencies") are kept on the node and shown as "Also works with".

Run `node scripts/build-data.mjs --verbose` to list isolated nodes and unresolved collaborator names.

To add the second sheet, export it as CSV (it's private, so a plain download returns a Google sign-in page) and extend the script.
