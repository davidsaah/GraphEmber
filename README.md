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

## Web research and the Inbox

Select an entity (or highlight a set, for example from a chat answer) and choose **Research** in the selection bar. Claude searches the public web for what those entities are doing and what impact it is having: new connections, new partners, updates and impact numbers. Findings never change the graph directly. They land in the **Inbox** (header button, with a count), the entities they're about get an ember dot, and proposed connections are drawn dashed. A reviewer approves, edits or rejects each one; approved findings appear in the graph and in the entity's dossier under "From the web" with their sources and who approved them.

Safeguards (full reasoning in the plan, `web-research-plan.md` in the project files):

- **Scope:** at most 10 entities per run and 5 searches each. Only names, acronyms, websites and locations are sent; descriptions, notes and tags never leave the app. Social networks and people-search sites are blocked.
- **Citations:** every finding needs a source the search actually returned, with a quote. The server re-fetches each page (public addresses only) and checks the quote is on it. A finding with no verified quote can only be approved by ticking "I checked this myself".
- **Confidence is computed, not claimed:** high needs a verified primary source (the entity's own site, government, grant databases, journals), medium a verified established outlet. Impact numbers need two independent sources or one primary. Older claims are flagged.
- **Privacy:** findings mentioning emails, phone numbers, street addresses or private details are dropped. People appear only in their professional role.
- **Record:** decisions (who, when, edits, reasons) and every run's searches and dropped findings are kept in `data/research/proposals.json`. Rejected findings aren't proposed again, and approvals can be reverted.

Research uses the same `ANTHROPIC_API_KEY` as the chat (`server/research.mjs`, `/api/research` and `/api/proposals`). On a static host or in the claude.ai demo the Inbox explains that research needs the server. `npm run check:research` tests the safeguards offline.

## Data

The graph is generated, not hand-edited:

- `data/cwi-projects.csv` is the **CWI Projects and Collaborators** Google Sheet, exported as CSV: one row per project and partner, with city-level partner locations. This is the default scope of the app (the **CWI network** filter).
- `data/places.json` has coordinates for every city and project area in that sheet, so the map can place partners exactly.
- `sheet1.csv` is the AI Wildfire Landscape sheet export (172 rows). It shows when the CWI network filter is turned off.
- `data/curated.json` holds the hand-curated Firelines/CWI records (topics, CWI, Resilient Home Fund, Earth Fire Alliance, FireSat).
- `npm run data` runs `scripts/build-data.mjs`, which merges them into `src/data/initialData.ts` and writes the source rows to `src/data/rawSheets.ts` for the Data view's **Raw sheets** tab.

What the script does with the CWI sheet:

- Each project becomes a program, convening (meeting) or tool node, led or convened by CWI (`LEADS` / `ORGANIZES`). Each partner `PARTICIPATES_IN` the project, or `ATTENDED` it for convenings.
- Spelling variants of the same partner are merged (see `PARTNER_ALIASES`), and partners that already exist in the landscape data (CAL FIRE, Google.org, Earth Fire Alliance and others) are linked to the existing entity rather than duplicated. Everything from this sheet is tagged `CWI Network`.
- Two location typos are corrected (Fort Collins, CA → CO; Gardnerville, CA → NV).

To refresh it, export the sheet as CSV over `data/cwi-projects.csv` and run `npm run data`. Any new city needs an entry in `data/places.json`.

What the script does with the landscape sheet:

- Merges sheet rows that duplicate a curated record or an earlier row (for example "CalFIRE" into CAL FIRE).
- Links each organization in the sheet's collaborative design to the **AI Wildfire Collaborative** with `PARTNERS_IN` (how = delivery role).
- Turns the technology columns into `HAS_TOPIC` links to the topic hubs. Rows with no technology flags fall back to their fire stage and deliverables (marked `modality: fire stage` or `inferred from deliverables`).
- Adds `FUNDS` links from Google.org for rows marked GWFC funded.
- Resolves "Key Collaborators" names to existing nodes as `COLLABORATES_WITH`. Names that aren't entities (such as "Fire Agencies") are kept on the node and shown as "Also works with".

Run `node scripts/build-data.mjs --verbose` to list isolated nodes and unresolved collaborator names.
