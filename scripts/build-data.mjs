// Regenerates src/data/initialData.ts from the AI Wildfire Landscape sheet (sheet1.csv)
// plus the hand-curated Firelines/CWI records in data/curated.json.
// Usage: node scripts/build-data.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHEET = path.join(root, 'sheet1.csv');
const CURATED = path.join(root, 'data/curated.json');
const OUT = path.join(root, 'src/data/initialData.ts');

// ---------- CSV ----------
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Column indexes (row 2 of the sheet is the header; row 1 is blank).
const C = {
  id: 0, label: 1, link: 2, nodeType: 3, orgType: 4, gwfc: 5, gwfcLink: 6,
  location: 8, partnerFunction: 9, charter: 10, gcd: 11, gcdType: 12, role: 13,
  roleClass: 14, location2: 15, phase: 16, collaborators: 17, deliverables: 18,
  stages: 19, geo: 20, intervention: 32, convening: 36,
};

// Tech-flag columns -> topic hubs (Firelines: Product -HasTopic-> Topic, with modality).
const TOPIC_FLAGS = [
  [22, 'topic-firesat', 'satellite data integration'],
  [23, 'topic-decision-support', 'integrated fire management tools'],
  [24, 'topic-remote-sensing', 'remote sensing development'],
  [25, 'topic-remote-sensing', 'retrieval development'],
  [26, 'topic-risk-mapping', 'risk mapping'],
  [27, 'topic-spread-modeling', 'spread modeling'],
  [28, 'topic-data-commons', 'data stores'],
  [29, 'topic-data-commons', 'earth system data tools'],
  [30, 'topic-decision-support', 'end-user applications'],
  [31, 'topic-remote-sensing', 'remote sensing tech'],
];

// Sheet rows that are the same entity as a curated record.
const ALIASES = {
  'google.org': 'inst-google-org',
  'google research': 'inst-google-org',
  'earth fire alliance': 'collab-efa',
  'muon space': 'inst-muon-space',
  'calfire': 'inst-calfire',
  'cal fire': 'inst-calfire',
  'firesat': 'prod-firesat',
  'climate & wildfire institute': 'inst-cwi',
};

// Rows with no tech flags still name a fire stage and deliverables; use them as weaker topic links.
const STAGE_TOPICS = [
  [/detect|validate/i, 'topic-fire-monitoring'],
  [/pre-fire risk/i, 'topic-risk-mapping'],
  [/respond|monitor/i, 'topic-decision-support'],
  [/damage|restore|recovery/i, 'topic-remote-sensing'],
];
const DELIVERABLE_TOPICS = [
  [/detect|alert|early warning|camera|sensor/i, 'topic-fire-monitoring'],
  [/risk|hazard|vulnerab/i, 'topic-risk-mapping'],
  [/spread|behavio(u)?r|simulat|model/i, 'topic-spread-modeling'],
  [/satellite|remote sensing|imagery|lidar/i, 'topic-remote-sensing'],
  [/data|platform|repositor|information/i, 'topic-data-commons'],
  [/home|structure|defensible|ember/i, 'topic-home-hardening'],
  [/decision|response|management|suppression|communication|coordination/i, 'topic-decision-support'],
];

const HUB_ID = 'collab-ai-wildfire';

// Repairs UTF-8 text that was decoded as Latin-1 somewhere upstream ("ConcepciÃ³n").
const fixMojibake = (s) => (/[ÃÂ]/.test(s) ? Buffer.from(s, 'latin1').toString('utf8') : s);
const clean = (v) => fixMojibake((v ?? '').trim());
const present = (v) => { const s = clean(v); return s && !/^(n|no|n\/a)$/i.test(s); };
const norm = (s) => clean(s).toLowerCase().replace(/\s+/g, ' ');
const acronymOf = (label) => (label.match(/\(([^)]+)\)\s*$/) || [])[1];
const uniq = (a) => [...new Set(a.filter(Boolean))];

const INSTITUTION_TYPE = {
  'Government': 'Federal Agency',
  'Nonprofit': 'NGO',
  'Philanthropic': 'NGO',
  'Academic': 'University',
  'NGO / Private / Public Partnership': 'Consortium',
};
const COLLAB_RE = /\b(alliance|network|task force|coalition|consortium|partnership|collaborative|cooperative|council|initiative)\b/i;

function classify(r) {
  const label = clean(r[C.label]);
  if (clean(r[C.nodeType]) === 'System/Tool/Program') return 'product';
  if (COLLAB_RE.test(label)) return 'collaborative';
  return 'institution';
}

// ---------- build ----------
const curated = JSON.parse(fs.readFileSync(CURATED, 'utf8'));
const rows = parseCsv(fs.readFileSync(SHEET, 'utf8'));
const headerIdx = rows.findIndex((r) => clean(r[0]) === 'NodeID');
const data = rows.slice(headerIdx + 1).filter((r) => clean(r[C.label]));

const nodes = new Map(curated.nodes.map((n) => [n.id, structuredClone(n)]));
const edges = new Map(curated.edges.map((e) => [e.id, structuredClone(e)]));
const byName = new Map(); // normalized name -> node id
const register = (name, id) => { if (name && !byName.has(norm(name))) byName.set(norm(name), id); };
for (const n of nodes.values()) { register(n.label, n.id); register(n.acronym, n.id); }
for (const [k, id] of Object.entries(ALIASES)) register(k, id);

// Exact name, acronym, or a unique node whose label starts with the name ("NASA" -> "NASA Disasters").
function resolveName(name) {
  const key = norm(name).replace(/\d+$/, '');
  if (byName.has(key)) return byName.get(key);
  if (key.length < 4) return undefined;
  const hits = uniq([...byName.entries()].filter(([k]) => k.startsWith(key + ' ') || k.startsWith(key + '/')).map(([, id]) => id));
  return hits.length === 1 ? hits[0] : undefined;
}

const rowNode = new Map(); // row -> node id
const stats = { merged: 0, duplicates: 0 };

for (const r of data) {
  const label = clean(r[C.label]);
  const key = norm(label);
  const existing = byName.get(key);
  const tags = uniq([
    clean(r[C.orgType]),
    present(r[C.gcdType]) && clean(r[C.gcdType]),
    present(r[C.role]) && clean(r[C.role]),
    present(r[C.roleClass]) && clean(r[C.roleClass]),
    present(r[C.geo]) && clean(r[C.geo]),
    present(r[C.phase]) && `Phase: ${clean(r[C.phase])}`,
    present(r[C.stages]) && clean(r[C.stages]),
    clean(r[C.charter]) === 'Y' && 'AI Charter',
    clean(r[C.gwfc]) === 'Y' && 'GWFC Funded',
    present(r[C.convening]) && 'Convening',
    present(r[C.intervention]) && clean(r[C.intervention]).replace(/^\d\.\s*/, ''),
  ]);

  if (existing) {
    // Same entity as a curated record or an earlier row: enrich it instead of duplicating.
    const n = nodes.get(existing);
    n.website ??= clean(r[C.link]) || undefined;
    n.tags = uniq([...(n.tags || []), ...tags]);
    if (existing.startsWith('land-')) stats.duplicates++; else stats.merged++;
    rowNode.set(r, existing);
    continue;
  }

  // The sheet reuses a few NodeIDs for different entities; disambiguate with a slug.
  let id = `land-${clean(r[C.id])}`;
  if (nodes.has(id)) id = `${id}-${key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  const type = classify(r);
  const deliverables = clean(r[C.deliverables]);
  const role = present(r[C.role]) ? clean(r[C.role]) : '';
  const roleClass = present(r[C.roleClass]) ? clean(r[C.roleClass]) : '';
  const description = deliverables
    ? `${deliverables}.`
    : [role && `${role} in the AI wildfire landscape`, roleClass && `(${roleClass})`].filter(Boolean).join(' ') + '.';
  const node = {
    id, type, label,
    description: description === '.' ? undefined : description,
    website: clean(r[C.link]) || undefined,
    location: clean(r[C.location]) || clean(r[C.location2]) || clean(r[C.geo]) || undefined,
    tags,
  };
  const acr = acronymOf(label);
  if (acr) node.acronym = acr;
  if (type === 'institution') node.institutionType = INSTITUTION_TYPE[clean(r[C.orgType])] || 'Private Sector';
  if (type === 'collaborative') { node.governanceModel = 'Consortium'; node.focusAreas = uniq([deliverables]); }
  if (type === 'product') node.status = 'Operational';
  nodes.set(id, node);
  register(label, id);
  register(acr, id);
  register(label.replace(/\s*\([^)]*\)\s*$/, ''), id);
  rowNode.set(r, id);
}

// Collaborative hub for the sheet's collaborative design (GCD) column.
nodes.set(HUB_ID, {
  id: HUB_ID,
  type: 'collaborative',
  label: 'AI Wildfire Collaborative',
  description: 'The collaborative design mapped in the AI Wildfire Landscape sheet: who delivers, advises, decides and funds.',
  governanceModel: 'Public-Private Partnership',
  tags: ['Collaborative', 'AI Charter'],
});

const addEdge = (e) => {
  if (e.source === e.target) return;
  const dup = [...edges.values()].some((x) => x.source === e.source && x.target === e.target && x.type === e.type);
  if (!dup) edges.set(e.id, e);
};

let seq = 0;
const nextId = (kind) => `edge-${kind}-${++seq}`;
const unresolved = new Map();

for (const r of data) {
  const id = rowNode.get(r);

  // Org -PartnersIn-> collaborative (how = delivery role)
  if (clean(r[C.gcd]) === 'Yes') {
    const how = [clean(r[C.gcdType]), present(r[C.role]) && clean(r[C.role])].filter((v) => present(v)).join(' · ');
    addEdge({
      id: nextId('gcd'), source: id, target: HUB_ID, type: 'PARTNERS_IN', label: 'partners in',
      how: how || undefined,
      properties: { charterSignatory: clean(r[C.charter]) === 'Y' },
    });
  }

  // Product/Org -HasTopic-> topic
  const seen = new Set();
  for (const [col, topic, modality] of TOPIC_FLAGS) {
    if (!present(r[col]) || seen.has(topic)) continue;
    seen.add(topic);
    addEdge({ id: nextId('topic'), source: id, target: topic, type: 'HAS_TOPIC', label: 'has topic', how: clean(r[col]), modality });
  }

  if (seen.size === 0) {
    const stage = clean(r[C.stages]);
    const deliverables = clean(r[C.deliverables]) || clean(r[C.label]);
    for (const [re, topic] of STAGE_TOPICS) {
      if (re.test(stage) && !seen.has(topic)) {
        seen.add(topic);
        addEdge({ id: nextId('topic'), source: id, target: topic, type: 'HAS_TOPIC', label: 'has topic', how: stage, modality: 'fire stage' });
      }
    }
    for (const [re, topic] of DELIVERABLE_TOPICS) {
      if (re.test(deliverables) && !seen.has(topic)) {
        seen.add(topic);
        addEdge({ id: nextId('topic'), source: id, target: topic, type: 'HAS_TOPIC', label: 'has topic', how: deliverables, modality: 'inferred from deliverables' });
        break;
      }
    }
  }

  // Google.org -Funds-> grantee
  if (clean(r[C.gwfc]) === 'Y') {
    addEdge({
      id: nextId('fund'), source: 'inst-google-org', target: id, type: 'FUNDS', label: 'funds',
      how: 'GWFC funding', properties: clean(r[C.gwfcLink]) ? { link: clean(r[C.gwfcLink]) } : undefined,
    });
  }

  // Key Collaborators -> COLLABORATES_WITH when the name resolves to a node
  for (const name of clean(r[C.collaborators]).split(';').map(clean).filter(Boolean)) {
    const target = resolveName(name);
    if (target) {
      addEdge({
        id: nextId('collab'), source: id, target, type: 'COLLABORATES_WITH', label: 'collaborates with',
        how: clean(r[C.deliverables]) || undefined,
        modality: present(r[C.phase]) ? `Phase: ${clean(r[C.phase])}` : undefined,
      });
    } else {
      unresolved.set(name, (unresolved.get(name) || 0) + 1);
      const n = nodes.get(id);
      n.tags = uniq([...(n.tags || []), `Works with: ${name}`]);
    }
  }
}

// EFA funders and partners from the Firelines ontology slide (ai-memory/01 case study).
const efa = [
  ['gordon and betty moore foundation', 'FUNDS', 'funds', 'philanthropic funding'],
  ['minderoo foundation', 'FUNDS', 'funds', 'philanthropic funding'],
  ['google.org', 'FUNDS', 'funds', 'AI and cloud funding'],
  ['environmental defense fund (edf)', 'PARTNERS_IN', 'partners in', 'policy work'],
];
for (const [name, type, label, how] of efa) {
  const source = byName.get(name);
  if (source) addEdge({ id: nextId('efa'), source, target: 'collab-efa', type, label, how });
}
addEdge({ id: nextId('efa'), source: 'inst-cwi', target: 'topic-fire-monitoring', type: 'HAS_TOPIC', label: 'has topic', how: 'boundary translation', modality: 'manual / boundary' });

// ---------- write ----------
const strip = (o) => JSON.parse(JSON.stringify(o));
const nodeList = strip([...nodes.values()]);
const edgeList = strip([...edges.values()]);
const ids = new Set(nodeList.map((n) => n.id));
for (const e of edgeList) {
  if (!ids.has(e.source) || !ids.has(e.target)) throw new Error(`Dangling edge ${e.id}: ${e.source} -> ${e.target}`);
}
const degree = new Map();
for (const e of edgeList) { degree.set(e.source, 1); degree.set(e.target, 1); }
const isolated = nodeList.filter((n) => !degree.has(n.id));

const dataset = {
  metadata: {
    title: 'Climate & Wildfire Institute (CWI) - Wildfire Intelligence Landscape',
    version: '2.1.0',
    description: 'Wildfire intelligence knowledge graph connecting organizations, systems, collaboratives, funders and topics. Generated by scripts/build-data.mjs from sheet1.csv and data/curated.json.',
    lastUpdated: new Date().toISOString().slice(0, 10),
  },
  nodes: nodeList,
  edges: edgeList,
};

fs.writeFileSync(OUT, `import type { NetworkDataset } from '../types/graph';

/**
 * Climate & Wildfire Institute (CWI) - GraphEmber Wildfire Intelligence Landscape Dataset.
 * GENERATED FILE: edit data/curated.json or sheet1.csv, then run \`npm run data\`.
 */
export const INITIAL_DATASET: NetworkDataset = ${JSON.stringify(dataset, null, 2)};
`);

console.log(`nodes ${nodeList.length}, edges ${edgeList.length}, isolated ${isolated.length}`);
console.log(`merged into curated ${stats.merged}, duplicate rows merged ${stats.duplicates}`);
console.log(`unresolved collaborator names ${unresolved.size} (kept as "Works with" tags)`);
if (process.argv.includes('--verbose')) {
  console.log('isolated:', isolated.map((n) => n.label).join('; '));
  console.log('unresolved:', [...unresolved.keys()].join('; '));
}
