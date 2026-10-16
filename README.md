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

## Views

The header switch moves between **Network**, **Map** and **Data**. The Data view lists every entity (type, location, connection count, tags) and every relationship (from, relationship, to, how), with sortable columns and CSV download. Filters and search apply to all three views. Clicking a name anywhere opens its dossier. **Clear** in the bottom bar, or Esc, clears the selection and any highlighted path or chat answer.

## Map

The **Network / Map** switch in the header shows the same entities on a world map (MapLibre GL, with a Natural Earth basemap bundled in the app, so there's no tile server or API key). Entities are placed from their `location` text by the lookup in `src/map/places.ts`. The sheet records places at country or region level, so entities sharing a place fan out around one point. Entities marked Global, or with no location, aren't drawn, and the map says how many. Selecting an entity draws its connections to other mapped entities. Filters, search and the dossier work the same in both views.

## Chat

The chat panel docked on the right answers questions from the graph data and links every entity it mentions (clicking one opens its dossier; the entities in an answer light up on the map).

The chat calls Claude (`claude-opus-5-5`) through `server/chat.mjs`, which needs an Anthropic API key. Put it in a `.env.local` file (git-ignored) or the environment:

```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev                                   # chat served at /api/chat by the dev server
npm run build && ANTHROPIC_API_KEY=... npm start   # production: serves dist/ + /api/chat on $PORT (default 3000)
```

A plain static host has no `/api/chat`, so the chat explains it isn't set up there. When the app runs as a claude.ai artifact it uses the viewer's own Claude account instead (no key needed). The model has server-side refusal fallbacks enabled (`fallbacks: "default"`).

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
