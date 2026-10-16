# Session Chronicles & Architectural Decision Record (ADR)
## Project: GraphEmber
**Location**: `c:\Users\David\Projects\GraphEmber\ai-memory\06_SESSION_CHRONICLES_AND_DECISION_LOG.md`  
**Date of Record**: October 16, 2026

---

## 1. Forensic Chronicle of Development Sessions

All development on GraphEmber was executed on **October 16, 2026** across five interconnected agentic sessions:

```mermaid
timeline
    title GraphEmber Development Trajectory (October 16, 2026)
    section Morning / Early Afternoon
        Session 1 (12:06 - 12:26) : System Genesis & Planning
                                  : 8 Entity Types & D3 Force Canvas
                                  : Scaffolding Vite + React 19 + TS
        Session 2 (12:37)         : Application Inspection
        Session 3 (12:54)         : Live Prototype Demonstration
    section Mid Afternoon
        Session 4 (12:57 - 14:36) : Git Remote Setup & Sync
                                  : Firelines Ontology Integration
                                  : Topic Node Type & Edge Attributes
                                  : CWI Branding & Logo Extraction
                                  : Sheet 1 Ingestion (172 Entities)
                                  : Sheet 2 Diagnostic
    section Late Afternoon
        Session 5 (14:47 - Present) : AI-Memory Repository Creation
```

---

### Session 1: Genesis & Scaffolding
* **Conversation ID**: `3ac02762-b61e-459d-9e74-a123dbbe3e8e`
* **Prompts Handled**:
  1. *"Ok start building this thing"*
  2. *"add colobrative, "*
  3. *"add product as well to the data model"*
  4. *"get branding inspriation from this: https://www.climateandwildfire.org/"*
* **Accomplishments**:
  * Generated and approved the initial master architecture plan ([`graphember_plan.md`](file:///c:/Users/David/.gemini/antigravity-ide/brain/3ac02762-b61e-459d-9e74-a123dbbe3e8e/graphember_plan.md)).
  * Scaffolded the project using Vite, React 19, TypeScript, and Vanilla CSS.
  * Formulated the initial 8 entity types (`person`, `institution`, `collaborative`, `program`, `product`, `grant`, `research`, `meeting`).
  * Implemented the HTML5 2D Canvas rendering engine with `d3-force` physics.
  * Authored the core UI suite: `Header.tsx`, `FilterBar.tsx`, `DossierDrawer.tsx`, `PathFinderModal.tsx`, `MetricsModal.tsx`, `AddEntityModal.tsx`.
  * Verified build passes cleanly (`npm run build`) and launched Vite dev server on port `5173`.

---

### Session 2: Application Inspection
* **Conversation ID**: `2d62c719-dfc0-4533-9a02-7864eab3e643`
* **Prompts Handled**: *"Can you show mw thw application"*
* **Accomplishments**: Verified dev server health and visual layout integrity via browser automation.

---

### Session 3: Prototype Demonstration
* **Conversation ID**: `b25c9653-1c1c-419e-a9f0-a554ce59d1e4`
* **Prompts Handled**: *"show me a prototype"*
* **Accomplishments**: Validated physics forces, node dragging, zoom/pan navigation, and sidecar drawer interactions.

---

### Session 4: Firelines Ontology, CWI Brand & Google Sheets Ingestion
* **Conversation ID**: `0d95eeb9-d655-4fea-aa94-af5853994357`
* **Prompts Handled**:
  1. *"This thing keep failing to fetch"*: Resolved git tracking failure, set upstream origin to `https://github.com/davidsaah/GraphEmber.git`, and pushed branch `main`.
  2. *"CAn you learn anything from this"* & *"please update"*: David uploaded slide [`media_1792181706813.png`](file:///c:/Users/David/.gemini/antigravity-ide/brain/0d95eeb9-d655-4fea-aa94-af5853994357/.user_uploaded/media_1792181706813.png) defining the **Firelines Graph Database Ontology**.
     * Elevated `Topic` to a 9th first-class node type.
     * Introduced edge semantic attributes: `how`, `modality`, and `properties`.
     * Implemented [`OntologyModal.tsx`](file:///c:/Users/David/Projects/GraphEmber/src/components/OntologyModal.tsx) showcasing the blueprint and EFA case study.
     * Enhanced canvas rendering to draw orientation-aware text badges along curved edges.
  3. *"This is a CWI tool, can you please add CWI brand and logos https://www.climateandwildfire.org/ https://www.resilienthomefund.org/ Use the latest professiona design critera and uiux design elements"*:
     * Extracted official CWI logos: faceted flame icon mark ([`public/cwi-logo.png`](file:///c:/Users/David/Projects/GraphEmber/public/cwi-logo.png)) and horizontal lockup ([`public/cwi-horizontal-logo.jpg`](file:///c:/Users/David/Projects/GraphEmber/public/cwi-horizontal-logo.jpg)).
     * Loaded Google Fonts (`Poppins`, `Nunito`, `Outfit`, `JetBrains Mono`).
     * Added CWI color tokens, breathing ember pulse animation (`.cwi-flame-pulse`), `CwiLogo.tsx`, `CwiBrandModal.tsx`, brand header lockup, institutional watermark, and Resilient Home Fund links.
  4. *"Load this data in to begin with https://docs.google.com/spreadsheets/d/1bw2XNGHbQXSmz2UCveUSq8TLgGJGXpnUIrjVmOCIOvE/edit https://docs.google.com/spreadsheets/d/16byGxXobEVl8YKtmImO7UMR-95ZsmLYFjY7qjSyY_LY/edit?gid=0#gid=0"*:
     * Downloaded and parsed Sheet 1: ingested 172 landscape entities, expanding `initialData.ts` to 183 nodes and 63+ edges.
     * Identified Sheet 2 private permission lock (Google OAuth 302 login redirect).
  5. *"has this been completed"* & *"did you finish"*: Delivered comprehensive status reports, verified zero lint errors, and confirmed git synchronization.
  6. *"ingest it"*: Executed automated curl download of Sheet 2, confirming persistent OAuth challenge and saving [`sheet2_new.csv`](file:///c:/Users/David/Projects/GraphEmber/sheet2_new.csv).

---

### Session 5: AI-Memory Suite Extraction & Formalization
* **Conversation ID**: `65066606-144a-4ab6-89d5-725f893d1735`
* **Prompt Handled**: *"LEan everything from the attached chats including all the links and methods and place in an AI-Memory folder in the projects folder"*
* **Accomplishments**: Complete forensic synthesis of all conversations, mathematical algorithms, data schemas, spreadsheet ingestion protocols, link directories, and creation of the unified `ai-memory/` suite.

---

## 2. Architectural Decision Records (ADRs)

### ADR-01: HTML5 2D Canvas vs DOM SVG Rendering
* **Status**: Accepted (Session 1)
* **Context**: Network visualization platforms can suffer severe DOM tree bloat and GPU stutter when rendering 200+ nodes, hundreds of curved links, labels, and glowing halos in SVG.
* **Decision**: Implement rendering via an HTML5 2D `<canvas>` element managed by a single D3 force simulation loop, using High-DPI scaling (`window.devicePixelRatio`).
* **Consequences**:
  * Positive: Fluid 60fps simulation, instantaneous zoom/pan response, sub-millisecond render cycles.
  * Negative: Requires custom mathematical hit-detection and screen-to-canvas coordinate unprojection (`transform.invert()`).

---

### ADR-02: Elevation of `Topic` to a First-Class Entity
* **Status**: Accepted (Session 4, in response to Firelines slide)
* **Context**: Initially, thematic tags were stored as flat string arrays (`tags?: string[]`) on nodes.
* **Decision**: Add `'topic'` as a 9th first-class `NodeType` with dedicated attributes (`domain`, `modalities`, `scope`) and visual tokens (`#e11d48`, 🎯).
* **Consequences**:
  * Positive: Allows diverse institutions, products, and research initiatives to cluster visually around shared missions (e.g., *Fire Monitoring*, *Smoke Retrieval*), and allows the linking edge to declare the technical *modality* of interaction.
  * Negative: Increases node count by 10-20 topic nodes.

---

### ADR-03: Edge-Level Semantic Attributes (`how`, `modality`, `properties`)
* **Status**: Accepted (Session 4)
* **Context**: Real-world collaborations cannot be represented by simple directed arrows without losing critical domain context (e.g., distinguishing between a partner that builds hardware vs one that writes policy).
* **Decision**: Extend `GraphEdge` with `how?: string`, `modality?: string`, and `properties?: Record<string, any>`, rendering dynamic text pill annotations directly on canvas curves.
* **Consequences**:
  * Positive: Expresses the exact operational mechanism (e.g., `PartnersIn (makes satellites)`).
  * Negative: Requires canvas text rotation and geometry math to ensure labels do not overlap node perimeters.

---

### ADR-04: Climate & Wildfire Institute (CWI) as Core Institutional Identity
* **Status**: Accepted (Session 4)
* **Context**: David clarified that GraphEmber is officially a CWI tool and requested CWI branding, logos, and links.
* **Decision**: Restructure the application design system around CWI brand tokens (`--color-cwi-gold`, `--color-cwi-amber`, `--color-cwi-flame`), set the official flame prism mark as favicon, incorporate the horizontal lockup, and provide direct portal links to CWI and the Resilient Home Fund.
* **Consequences**:
  * Positive: Professional institutional polish, clear ownership, seamless integration with CWI's boundary organization mission.

---

### ADR-05: Breadth-First Search (BFS) for Shortest Path Navigation
* **Status**: Accepted (Session 1)
* **Context**: Users need to trace relationships and discover the degrees of separation between any two entities in the ecosystem.
* **Decision**: Implement an unweighted bidirectional BFS traversal with parent-node and parent-edge backtracking.
* **Consequences**:
  * Positive: Guarantees finding the minimum number of institutional hops in $O(|V| + |E|)$ time without external graph library dependencies.
  * Negative: Does not account for edge weights unless upgraded to Dijkstra's algorithm.

---

### ADR-06: Tabular-to-Graph ETL Deduplication & Slugification
* **Status**: Accepted (Session 4)
* **Context**: Ingesting spreadsheet rows with variations in company naming and formatting could cause duplicate or disjoint nodes.
* **Decision**: Implement a canonical slugification function (`slugifyEntity`) prefixing nodes by entity type (`inst-`, `prod-`, `topic-`) with sanitized alphanumeric lowercase tokens, matching existing nodes prior to instantiation.
* **Consequences**:
  * Positive: Clean, deterministic graph generation without orphan duplicate nodes.
