/**
 * Calculations behind the stakeholder reports.
 *
 * Reports follow forensic-accounting conventions: every figure traces to
 * graph records and, for the CWI sheet, to spreadsheet row numbers; the
 * sheet is reconciled to the graph; data problems are listed in an
 * exceptions register rather than silently fixed.
 */
import type { GraphNode, GraphEdge } from '../types/graph';
import { RAW_SHEETS } from '../data/rawSheets';

export const CWI_ID = 'inst-cwi';
const CWI_TAG = 'CWI Network';
const PROJECT_TAG = 'CWI project';

export const endpointId = (end: string | GraphNode) => (typeof end === 'string' ? end : end.id);

// ---------- Classification ----------

export type Sector =
  | 'Tribal'
  | 'Fire service'
  | 'Local government'
  | 'State agency'
  | 'Federal agency'
  | 'Academic & research'
  | 'Utility'
  | 'Philanthropy'
  | 'Industry'
  | 'Community & nonprofit'
  | 'Individual'
  | 'Unclassified';

export const SECTOR_ORDER: Sector[] = [
  'Community & nonprofit',
  'Industry',
  'Academic & research',
  'Local government',
  'Fire service',
  'State agency',
  'Federal agency',
  'Philanthropy',
  'Utility',
  'Tribal',
  'Individual',
  'Unclassified',
];

// Ordered rules: the first match wins. The sheet has no sector column, so this is inferred from names.
const SECTOR_RULES: [Sector, RegExp][] = [
  ['Tribal', /\btribe\b|tribal|indian heritage|cultural fire management/i],
  ['Fire service', /fire protection district|fire rescue|^cal fire|fire chiefs|incident management|firefighters|wildfire prevention authority/i],
  ['Federal agency', /forest service|^usfs|^usda|^us department|nasa|geological survey|national park service|national laboratory|^jpl/i],
  ['State agency', /^ca (?!forward)|^california (air|natural|state|council|tahoe)|state parks|wildlife conservation board|dept of conservation|sierra nevada conservancy|santa monica mountains conservancy|tahoe conservancy|energy infrastructure|taskforce|indian heritage/i],
  ['Local government', /^city of|county office|board of supervisors|^inyo county$|^mono county$|air (pollution )?district|regional planning agency|regional parks|^capcoa$|rural county|resource conservation district|\brcd\b|environmental improvement program|environmental protection department/i],
  ['Academic & research', /universit|^uc\b|^ucla|^ucsb|cal poly|chico state|college|desert research|ecological analysis|cooperative extension|supercomputer|wui fire institute|research station|usda-ars|data commons|science and technology commons/i],
  ['Utility', /pg&e|liberty utilities|nv energy/i],
  ['Philanthropy', /foundation|tahoe fund|google\.org/i],
  ['Industry', /\binc\b|llc|\bco\.|consulting|group\b|winery|vineyard|long meadow ranch|labs\b|\.ai\b|\bai\b|company|brokers|insurance|verisk|milliman|^planet$|pyrologix|burnbot|technosylva|xyloplan|watch duty|vibrant planet|opalai|3pointx|timmons|rockrose|silver oak|opus one|constellation brands|wildfire services|wildland resource management|vegetation management|jones family|applied earthworks|advisors|willow|the triangle|deer creek resources|clarity movement|spatial informatics|firewerx|schramsberg|resiliency company|home hardening solutions|fire safe people tv/i],
  ['Community & nonprofit', /firewise|fire safe|coalition|alliance|council|association|network|collaborative|\bhoa\b|cooperative|conservancy|trust|preserve|initiative|commons|institute|center|league|treepeople|forward|action|restoration|ecology|metrolab|carbon ?plan|reshape|wuuii|grapegrowers|vintners|burn association|research and training|ors impact|blue forest|planscape|environmental defense|environmental policy|american wildfire experience|dinkey|cultural resources facility|fire aside|endangered habitats|land trust|ag \+ open space|taskforce|ca forward|tahoe central sierra|earth fire alliance|climate & wildfire/i],
];

export const sectorOf = (n: GraphNode): Sector => {
  if (n.type === 'person') return 'Individual';
  const label = n.label;
  for (const [sector, re] of SECTOR_RULES) if (re.test(label)) return sector;
  return 'Unclassified';
};

export type Region = 'California' | 'Nevada' | 'Other Western US' | 'Rest of US' | 'International' | 'Not recorded';
export const REGION_ORDER: Region[] = ['California', 'Nevada', 'Other Western US', 'Rest of US', 'International', 'Not recorded'];

const STATE_ALIASES: Record<string, string> = { colorado: 'CO', maryland: 'MD', oregon: 'OR' };
const WEST = new Set(['OR', 'WA', 'ID', 'MT', 'WY', 'UT', 'CO', 'AZ', 'NM', 'AK', 'HI']);
const INTERNATIONAL = new Set(['canada', 'bc', 'global']);

export const stateOf = (location?: string): string | undefined => {
  if (!location) return undefined;
  const last = location.split(',').pop()!.trim();
  if (/^[A-Z]{2}$/.test(last)) return last;
  return STATE_ALIASES[last.toLowerCase()];
};

export const regionOf = (location?: string): Region => {
  if (!location) return 'Not recorded';
  const last = location.split(',').pop()!.trim().toLowerCase();
  if (INTERNATIONAL.has(last)) return 'International';
  const st = stateOf(location);
  if (st === 'CA') return 'California';
  if (st === 'NV') return 'Nevada';
  if (st && WEST.has(st)) return 'Other Western US';
  if (st || last === 'us' || last === 'usa') return 'Rest of US';
  return 'Not recorded';
};

export const yearOf = (label: string) => Number(label.match(/\b(20\d\d)\b/)?.[1]) || undefined;

export const kindOf = (n: GraphNode) => (n.type === 'meeting' ? 'Convening' : n.type === 'product' ? 'Product' : 'Program');

// ---------- The core model ----------

export interface Engagement {
  edge: GraphEdge;
  partner: GraphNode;
  project: GraphNode;
  rows: number[];
  sheetName?: string;
}

export interface ReportModel {
  byId: Map<string, GraphNode>;
  projects: GraphNode[]; // all 17 rows of the sheet's project column
  workProjects: GraphNode[]; // programs and products (not convenings)
  convenings: GraphNode[];
  partners: GraphNode[];
  engagements: Engagement[];
  partnersOf: Map<string, Engagement[]>; // project id -> engagements
  projectsOf: Map<string, Engagement[]>; // partner id -> engagements
  fundingIn: GraphEdge[]; // FUNDS edges touching the CWI network
  landscape: GraphNode[];
  topics: GraphNode[];
  degree: Map<string, number>;
  edges: GraphEdge[];
}

export const buildModel = (nodes: GraphNode[], edges: GraphEdge[]): ReportModel => {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const projects = nodes.filter((n) => n.tags?.includes(PROJECT_TAG));
  const projectIds = new Set(projects.map((p) => p.id));
  const engagements: Engagement[] = [];
  for (const e of edges) {
    const t = endpointId(e.target);
    const s = endpointId(e.source);
    if (!projectIds.has(t) || s === CWI_ID) continue;
    if (e.type !== 'PARTICIPATES_IN' && e.type !== 'ATTENDED') continue;
    const partner = byId.get(s);
    const project = byId.get(t);
    if (!partner || !project) continue;
    engagements.push({ edge: e, partner, project, rows: e.properties?.sheetRows || [], sheetName: e.properties?.sheetName });
  }
  const group = (key: (x: Engagement) => string) => {
    const m = new Map<string, Engagement[]>();
    for (const x of engagements) m.set(key(x), [...(m.get(key(x)) || []), x]);
    return m;
  };
  const partnersOf = group((x) => x.project.id);
  const projectsOf = group((x) => x.partner.id);
  const partners = [...projectsOf.keys()].map((id) => byId.get(id)!).sort((a, b) => a.label.localeCompare(b.label));
  const cwiIds = new Set(nodes.filter((n) => n.tags?.includes(CWI_TAG)).map((n) => n.id));
  const fundingIn = edges.filter((e) => e.type === 'FUNDS' && (cwiIds.has(endpointId(e.source)) && cwiIds.has(endpointId(e.target))));
  const degree = new Map<string, number>();
  for (const e of edges) for (const id of [endpointId(e.source), endpointId(e.target)]) degree.set(id, (degree.get(id) || 0) + 1);
  return {
    byId,
    projects: [...projects].sort((a, b) => (a.sheetRow || 0) - (b.sheetRow || 0)),
    workProjects: projects.filter((p) => p.type !== 'meeting'),
    convenings: projects.filter((p) => p.type === 'meeting').sort((a, b) => (yearOf(a.label) || 9999) - (yearOf(b.label) || 9999)),
    partners,
    engagements,
    partnersOf,
    projectsOf,
    fundingIn,
    landscape: nodes.filter((n) => !n.tags?.includes(CWI_TAG)),
    topics: nodes.filter((n) => n.type === 'topic'),
    degree,
    edges,
  };
};

// ---------- Reconciliation ----------

export interface ReconLine {
  label: string;
  value: number;
  note?: string;
  kind?: 'add' | 'less' | 'total' | 'check';
}

/** Sheet rows -> graph links -> distinct partners, with every difference explained. */
export const reconcile = (m: ReportModel): ReconLine[] => {
  const sheet = RAW_SHEETS.find((s) => s.title.startsWith('CWI'));
  const rows = sheet?.rows || [];
  const partnerCol = sheet ? sheet.columns.indexOf('PARTNERS') : 2;
  const projectCol = sheet ? sheet.columns.indexOf('PROJECTS') : 0;
  const withPartner = rows.filter((r) => (r[partnerCol] || '').trim()).length;
  const projectRows = rows.filter((r) => (r[projectCol] || '').trim()).length;
  const repeatRows = m.engagements.reduce((s, x) => s + Math.max(0, x.rows.length - 1), 0);
  const traced = m.engagements.reduce((s, x) => s + x.rows.length, 0);
  const untraced = withPartner - traced;
  const links = m.engagements.length;
  const aliasMerged = new Set(m.engagements.filter((x) => x.sheetName).map((x) => x.sheetName!.toLowerCase())).size;
  return [
    { label: 'Non-blank rows in the CWI Projects and Collaborators sheet', value: rows.length },
    { label: 'Rows that name a project', value: projectRows, note: 'Each starts a project block' },
    { label: 'Rows that name a partner', value: withPartner, kind: 'total' },
    { label: 'Repeat rows (same partner listed twice on one project)', value: -repeatRows, kind: 'less', note: 'Merged into one link; row numbers kept' },
    { label: 'Rows not traced to a link', value: -untraced, kind: 'less', note: untraced ? 'Investigate: see exceptions register' : 'None' },
    { label: 'Partner-to-project links in the graph', value: links, kind: 'total' },
    { label: 'Check: rows named = links + repeats + untraced', value: withPartner - (links + repeatRows + untraced), kind: 'check' },
    { label: 'Distinct partners after name matching', value: m.partners.length, note: `${aliasMerged} spelling variant${aliasMerged === 1 ? '' : 's'} merged` },
    { label: 'Projects and convenings', value: m.projects.length },
  ];
};

// ---------- Exceptions register ----------

export type Severity = 'High' | 'Medium' | 'Low' | 'Info';
export interface Exception {
  ref: string;
  severity: Severity;
  category: string;
  node?: GraphNode;
  detail: string;
  rows?: number[];
  action: string;
}

const normName = (s: string) =>
  s
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '');

const editDistance = (a: string, b: string) => {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};

export const exceptions = (m: ReportModel): Exception[] => {
  const out: Omit<Exception, 'ref'>[] = [];
  const rowsOf = (id: string) => (m.projectsOf.get(id) || []).flatMap((x) => x.rows).sort((a, b) => a - b);

  // Probable duplicates the name matching did not catch
  const names = m.partners.map((p) => ({ p, k: normName(p.label) }));
  for (let i = 0; i < names.length; i++)
    for (let j = i + 1; j < names.length; j++) {
      const a = names[i], b = names[j];
      if (a.k.length < 6 || b.k.length < 6) continue;
      // "Pacific Northwest" vs "Pacific Southwest" are different units, not typos
      const strip = (k: string) => k.replace(/north|south|east|west/g, '');
      if (strip(a.k) === strip(b.k)) continue;
      if (editDistance(a.k, b.k) / Math.min(a.k.length, b.k.length) <= 0.1)
        out.push({
          severity: 'High',
          category: 'Probable duplicate',
          node: a.p,
          detail: `"${a.p.label}" and "${b.p.label}" look like the same organisation, so partner counts may be overstated by one.`,
          rows: [...rowsOf(a.p.id), ...rowsOf(b.p.id)],
          action: 'Confirm and correct the spelling in the sheet',
        });
    }
  for (const p of m.projects) {
    if (p.type !== 'meeting' && !(m.partnersOf.get(p.id) || []).length)
      out.push({ severity: 'Medium', category: 'No partners recorded', node: p, detail: `${p.label} has no partners listed.`, rows: p.sheetRow ? [p.sheetRow] : [], action: 'Add partners or confirm the project is CWI-only' });
    else if (p.type === 'meeting' && !(m.partnersOf.get(p.id) || []).length)
      out.push({ severity: 'Low', category: 'No attendance recorded', node: p, detail: `${p.label} has no attendees listed${yearOf(p.label) && yearOf(p.label)! > 2026 ? ' (future event)' : ''}.`, rows: p.sheetRow ? [p.sheetRow] : [], action: 'Add attendees after the event' });
    if (!p.location) out.push({ severity: 'Low', category: 'Project location missing', node: p, detail: `${p.label} has no project location.`, rows: p.sheetRow ? [p.sheetRow] : [], action: 'Add the county or region' });
  }
  for (const f of m.fundingIn)
    if (!f.properties?.amount) {
      const s = m.byId.get(endpointId(f.source)), t = m.byId.get(endpointId(f.target));
      out.push({ severity: 'Medium', category: 'Funding amount not recorded', node: t, detail: `${s?.label} funds ${t?.label}, but no amount or period is recorded.`, action: 'Record amount, period and source document' });
    }
  for (const p of m.partners) {
    if (p.sheetNote) out.push({ severity: 'Medium', category: 'Reviewer note in sheet', node: p, detail: `${p.label}: "${p.sheetNote}"`, rows: rowsOf(p.id), action: 'Resolve the note and clear it' });
    if (!p.location) out.push({ severity: 'Low', category: 'Partner location missing', node: p, detail: `${p.label} has no location.`, rows: rowsOf(p.id), action: 'Add city and state' });
    else if (!p.coordinates) out.push({ severity: 'Low', category: 'Location not mapped', node: p, detail: `"${p.location}" could not be placed on the map.`, rows: rowsOf(p.id), action: 'Use a "City, ST" location' });
    if (sectorOf(p) === 'Unclassified') out.push({ severity: 'Low', category: 'Sector not inferred', node: p, detail: `${p.label} could not be assigned a sector from its name.`, rows: rowsOf(p.id), action: 'Add a sector column to the sheet' });
  }
  for (const x of m.engagements) {
    if (x.rows.length > 1) out.push({ severity: 'Low', category: 'Repeat row', node: x.partner, detail: `${x.partner.label} is listed ${x.rows.length} times on ${x.project.label}.`, rows: x.rows, action: 'Delete the repeat row' });
    if (x.sheetName) out.push({ severity: 'Info', category: 'Spelling variant merged', node: x.partner, detail: `Sheet says "${x.sheetName}", matched to "${x.partner.label}".`, rows: x.rows, action: 'Standardise the name in the sheet' });
  }
  const rank: Record<Severity, number> = { High: 0, Medium: 1, Low: 2, Info: 3 };
  return out
    .sort((a, b) => rank[a.severity] - rank[b.severity] || a.category.localeCompare(b.category))
    .map((e, i) => ({ ...e, ref: `X-${String(i + 1).padStart(2, '0')}` }));
};

// ---------- Concentration ----------

/** Herfindahl-Hirschman index on shares (0-10,000), as used for market concentration. */
export const hhi = (counts: number[]) => {
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  return Math.round(counts.reduce((s, c) => s + ((c / total) * 100) ** 2, 0));
};
export const hhiBand = (h: number) => (h < 1500 ? 'Unconcentrated' : h < 2500 ? 'Moderately concentrated' : 'Highly concentrated');

export const countBy = <T,>(items: T[], key: (t: T) => string) => {
  const m = new Map<string, T[]>();
  for (const it of items) m.set(key(it), [...(m.get(key(it)) || []), it]);
  return m;
};

// ---------- Convening cohorts ----------

export interface CohortRow {
  convening: GraphNode;
  year?: number;
  attendees: number;
  returning: number; // attended an earlier convening
  firstTime: number;
}

export const cohorts = (m: ReportModel): CohortRow[] => {
  const seen = new Set<string>();
  return m.convenings
    .filter((c) => yearOf(c.label))
    .sort((a, b) => yearOf(a.label)! - yearOf(b.label)! || a.label.localeCompare(b.label))
    .map((c) => {
      const ids = (m.partnersOf.get(c.id) || []).map((x) => x.partner.id);
      const returning = ids.filter((id) => seen.has(id)).length;
      ids.forEach((id) => seen.add(id));
      return { convening: c, year: yearOf(c.label), attendees: ids.length, returning, firstTime: ids.length - returning };
    });
};

// ---------- Coordination ----------

export const sharedPartners = (m: ReportModel, a: string, b: string) => {
  const sa = new Set((m.partnersOf.get(a) || []).map((x) => x.partner.id));
  return (m.partnersOf.get(b) || []).filter((x) => sa.has(x.partner.id)).map((x) => x.partner);
};

export interface TopicCoverage {
  topic: GraphNode;
  actors: GraphNode[];
  inNetwork: GraphNode[];
  coverage: number;
}

export const topicCoverage = (m: ReportModel): TopicCoverage[] =>
  m.topics
    .map((topic) => {
      const ids = new Set(
        m.edges
          .filter((e) => e.type === 'HAS_TOPIC' && endpointId(e.target) === topic.id)
          .map((e) => endpointId(e.source)),
      );
      const actors = [...ids].map((id) => m.byId.get(id)!).filter(Boolean);
      const inNetwork = actors.filter((a) => a.tags?.includes(CWI_TAG));
      return { topic, actors, inNetwork, coverage: actors.length ? inNetwork.length / actors.length : 0 };
    })
    .sort((a, b) => a.coverage - b.coverage || b.actors.length - a.actors.length);

export const prospects = (m: ReportModel, limit = 12) =>
  m.landscape
    .filter((n) => n.type === 'institution')
    .map((n) => ({
      node: n,
      degree: m.degree.get(n.id) || 0,
      topics: m.edges
        .filter((e) => e.type === 'HAS_TOPIC' && endpointId(e.source) === n.id)
        .map((e) => m.byId.get(endpointId(e.target))?.label)
        .filter(Boolean) as string[],
    }))
    .sort((a, b) => b.degree - a.degree)
    .slice(0, limit);

// ---------- Partner one-pagers ----------

const km = (a: [number, number], b: [number, number]) => {
  const r = Math.PI / 180;
  const dLat = (b[1] - a[1]) * r, dLng = (b[0] - a[0]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * r) * Math.cos(b[1] * r) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
};

export const coPartners = (m: ReportModel, id: string) => {
  const counts = new Map<string, GraphNode[]>();
  for (const x of m.projectsOf.get(id) || [])
    for (const y of m.partnersOf.get(x.project.id) || [])
      if (y.partner.id !== id) counts.set(y.partner.id, [...(counts.get(y.partner.id) || []), x.project]);
  return [...counts.entries()]
    .map(([pid, projects]) => ({ partner: m.byId.get(pid)!, projects }))
    .sort((a, b) => b.projects.length - a.projects.length || a.partner.label.localeCompare(b.partner.label));
};

/** Partners nearby that have never shared a project or convening with this one. */
export const introductions = (m: ReportModel, id: string, limit = 6) => {
  const me = m.byId.get(id);
  if (!me?.coordinates) return [];
  const known = new Set(coPartners(m, id).map((c) => c.partner.id));
  return m.partners
    .filter((p) => p.id !== id && p.id !== CWI_ID && !known.has(p.id) && p.coordinates)
    .map((p) => ({ partner: p, km: km(me.coordinates!, p.coordinates!), projects: (m.projectsOf.get(p.id) || []).length }))
    .filter((x) => x.km <= 80)
    .sort((a, b) => b.projects - a.projects || a.km - b.km)
    .slice(0, limit);
};

export const fmt = (n: number) => n.toLocaleString('en-US');
export const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)}%` : '–');

/** Stable reference codes (P-01…) in sheet order, used across exhibits. */
export const projectCodes = (m: ReportModel) => new Map(m.projects.map((p, i) => [p.id, `P-${String(i + 1).padStart(2, '0')}`]));

// ---------- Any-node reports ----------

export const relationLabel = (t: string) => t.toLowerCase().replace(/_/g, ' ');

/** Every link touching a node, with the node at the other end. */
export const connections = (m: ReportModel, id: string) =>
  m.edges.flatMap((e) => {
    const s = endpointId(e.source), t = endpointId(e.target);
    if (s !== id && t !== id) return [];
    const other = m.byId.get(s === id ? t : s);
    return other ? [{ edge: e, other, outgoing: s === id }] : [];
  });

/** Shortest chain of links between two nodes, ignoring direction (breadth-first). */
export const shortestPath = (m: ReportModel, from: string, to: string): GraphNode[] => {
  if (from === to) return [m.byId.get(from)!].filter(Boolean);
  const adj = new Map<string, string[]>();
  for (const e of m.edges) {
    const s = endpointId(e.source), t = endpointId(e.target);
    adj.set(s, [...(adj.get(s) || []), t]);
    adj.set(t, [...(adj.get(t) || []), s]);
  }
  const prev = new Map<string, string>([[from, from]]);
  const queue = [from];
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === to) break;
    for (const nx of adj.get(cur) || []) if (!prev.has(nx)) { prev.set(nx, cur); queue.push(nx); }
  }
  if (!prev.has(to)) return [];
  const path = [to];
  while (path[0] !== from) path.unshift(prev.get(path[0])!);
  return path.map((id) => m.byId.get(id)!).filter(Boolean);
};

/** Organisations that share topics with this node, ranked by topics in common. */
export const topicPeers = (m: ReportModel, id: string, limit = 10) => {
  const topicsOf = (nid: string) =>
    new Set(m.edges.filter((e) => e.type === 'HAS_TOPIC' && endpointId(e.source) === nid).map((e) => endpointId(e.target)));
  const mine = topicsOf(id);
  if (!mine.size) return [];
  const counts = new Map<string, number>();
  for (const e of m.edges)
    if (e.type === 'HAS_TOPIC' && mine.has(endpointId(e.target)) && endpointId(e.source) !== id)
      counts.set(endpointId(e.source), (counts.get(endpointId(e.source)) || 0) + 1);
  return [...counts]
    .map(([nid, shared]) => ({ node: m.byId.get(nid)!, shared, inNetwork: !!m.byId.get(nid)?.tags?.includes(CWI_TAG) }))
    .filter((x) => x.node)
    .sort((a, b) => b.shared - a.shared || Number(b.inNetwork) - Number(a.inNetwork) || a.node.label.localeCompare(b.node.label))
    .slice(0, limit);
};

export const inCwiNetwork = (n: GraphNode) => !!n.tags?.includes(CWI_TAG);
export const isCwiProject = (n: GraphNode) => !!n.tags?.includes(PROJECT_TAG);

/** Which report a node gets: CWI partners a one-pager, CWI projects a project report, anything else an entity report. */
export const reportKind = (m: ReportModel, n: GraphNode): 'project' | 'partner' | 'entity' =>
  isCwiProject(n) ? 'project' : n.id !== CWI_ID && m.projectsOf.has(n.id) ? 'partner' : 'entity';

