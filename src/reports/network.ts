/**
 * Network-strength measures for the stakeholder network.
 *
 * Partners are linked when the CWI sheet lists them on the same activity, so
 * a tie means "listed together", not "collaborates". Every measure can be
 * taken on two layers: all activities, and delivery only (programs and
 * products, with convenings removed), because CWI's own events would
 * otherwise hold the network together by construction. CWI itself is never
 * a partner here.
 */
import type { GraphNode } from '../types/graph';
import { type ReportModel, type Sector, SECTOR_ORDER, sectorOf, yearOf } from './reportData';

export type Layer = 'all' | 'delivery';
export const LAYER_LABEL: Record<Layer, string> = { all: 'All activities', delivery: 'Delivery only' };
export const LAYER_TIE: Record<Layer, string> = { all: 'co-attended or co-delivered', delivery: 'co-delivered' };

/** The caption every network exhibit carries. */
export const DATA_BASIS = 'From co-participation records in the CWI sheet; a tie shows who was listed together, not who collaborates or trusts each other.';

export interface Projection {
  layer: Layer;
  nodes: GraphNode[]; // every partner, so isolates on this layer still count
  adj: Map<string, Set<string>>;
  shared: Map<string, GraphNode[]>; // pair key -> activities they share on this layer
}

export const sign = (x: number) => `${x >= 0 ? '+' : '−'}${Math.abs(x).toFixed(2)}`;
export const share = (x: number) => `${Math.round(x * 100)}%`;

export const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

export const activitiesOf = (m: ReportModel, layer: Layer) => (layer === 'all' ? m.projects : m.workProjects);

export const project = (m: ReportModel, layer: Layer): Projection => {
  const adj = new Map(m.partners.map((p) => [p.id, new Set<string>()]));
  const shared = new Map<string, GraphNode[]>();
  for (const act of activitiesOf(m, layer)) {
    const ids = [...new Set((m.partnersOf.get(act.id) || []).map((x) => x.partner.id))];
    for (let i = 0; i < ids.length; i++)
      for (let j = i + 1; j < ids.length; j++) {
        adj.get(ids[i])!.add(ids[j]);
        adj.get(ids[j])!.add(ids[i]);
        const k = pairKey(ids[i], ids[j]);
        shared.set(k, [...(shared.get(k) || []), act]);
      }
  }
  return { layer, nodes: m.partners, adj, shared };
};

/** Connected groups among the partners still present, largest first. */
export const components = (adj: Map<string, Set<string>>, alive?: Set<string>) => {
  const seen = new Set<string>();
  const groups: string[][] = [];
  for (const start of adj.keys()) {
    if (seen.has(start) || (alive && !alive.has(start))) continue;
    const group = [start];
    seen.add(start);
    for (let i = 0; i < group.length; i++)
      for (const nb of adj.get(group[i])!)
        if (!seen.has(nb) && (!alive || alive.has(nb))) {
          seen.add(nb);
          group.push(nb);
        }
    groups.push(group);
  }
  return groups.sort((a, b) => b.length - a.length);
};

// ---------- Vital signs ----------

export interface Vitals {
  partners: number;
  ties: number;
  density: number;
  avgLinks: number;
  groups: number; // connected groups with 2+ partners
  largest: string[];
  largestShare: number;
  isolates: number;
  multiTies: number; // pairs listed together on 2+ activities
  crossTies: number; // pairs from different sectors
}

export const vitals = (m: ReportModel, p: Projection): Vitals => {
  const n = p.nodes.length;
  const ties = p.shared.size;
  const comps = components(p.adj);
  let multi = 0;
  let cross = 0;
  for (const [k, acts] of p.shared) {
    if (acts.length > 1) multi++;
    const [a, b] = k.split('|');
    if (sectorOf(m.byId.get(a)!) !== sectorOf(m.byId.get(b)!)) cross++;
  }
  return {
    partners: n,
    ties,
    density: n > 1 ? ties / ((n * (n - 1)) / 2) : 0,
    avgLinks: n ? (2 * ties) / n : 0,
    groups: comps.filter((c) => c.length > 1).length,
    largest: comps[0] || [],
    largestShare: n ? (comps[0]?.length || 0) / n : 0,
    isolates: comps.filter((c) => c.length === 1).length,
    multiTies: multi,
    crossTies: cross,
  };
};

/** Of the pairs who met at a dated convening, the share who were listed together at a later one. */
export const conveningPersistence = (m: ReportModel) => {
  const dated = m.convenings.filter((c) => yearOf(c.label));
  const latest = Math.max(...dated.map((c) => yearOf(c.label)!));
  const years = new Map<string, Set<number>>();
  for (const c of dated) {
    const y = yearOf(c.label)!;
    const ids = [...new Set((m.partnersOf.get(c.id) || []).map((x) => x.partner.id))];
    for (let i = 0; i < ids.length; i++)
      for (let j = i + 1; j < ids.length; j++) {
        const k = pairKey(ids[i], ids[j]);
        years.set(k, (years.get(k) || new Set()).add(y));
      }
  }
  let eligible = 0;
  let kept = 0;
  for (const ys of years.values()) {
    const first = Math.min(...ys);
    if (first >= latest) continue;
    eligible++;
    if ([...ys].some((y) => y > first)) kept++;
  }
  return { eligible, kept, rate: eligible ? kept / eligible : 0 };
};

// ---------- Robustness ----------

// Small seeded generator so the random-removal line is the same on every render
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export interface RemovalStep {
  k: number;
  removed?: GraphNode;
  targeted: number; // largest-group share after removing the k best-connected partners
  random: number; // mean share after removing k partners at random
}

/** Largest-group share as partners are removed, best-connected first, against random removal. */
export const robustness = (p: Projection, maxK = 20, runs = 60): RemovalStep[] => {
  const n = p.nodes.length;
  const order = [...p.nodes].sort((a, b) => p.adj.get(b.id)!.size - p.adj.get(a.id)!.size || a.label.localeCompare(b.label));
  const share = (removed: string[]) => {
    const alive = new Set(p.adj.keys());
    removed.forEach((id) => alive.delete(id));
    return (components(p.adj, alive)[0]?.length || 0) / n;
  };
  const random = new Array(maxK + 1).fill(0);
  const next = rng(17);
  for (let r = 0; r < runs; r++) {
    const ids = p.nodes.map((x) => x.id);
    for (let i = 0; i < maxK; i++) {
      const j = i + Math.floor(next() * (ids.length - i));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    for (let k = 0; k <= maxK; k++) random[k] += share(ids.slice(0, k)) / runs;
  }
  return Array.from({ length: maxK + 1 }, (_, k) => ({
    k,
    removed: k ? order[k - 1] : undefined,
    targeted: share(order.slice(0, k).map((x) => x.id)),
    random: random[k],
  }));
};

// ---------- Bridges and silos ----------

export interface SectorMix {
  sectors: Sector[];
  matrix: number[][]; // ties between sector i and sector j
  size: Map<Sector, number>;
  ei: number; // (external - internal) / all ties, from -1 (all within sector) to +1 (all across)
  eiChance: number; // mean E-I when sector labels are shuffled among partners
  eiLow: number; // 5th and 95th percentile of the shuffled E-I
  eiHigh: number;
}

const eiOf = (p: Projection, sectorOfId: Map<string, Sector>) => {
  let ext = 0;
  for (const k of p.shared.keys()) {
    const [a, b] = k.split('|');
    if (sectorOfId.get(a) !== sectorOfId.get(b)) ext++;
  }
  const all = p.shared.size;
  return all ? (2 * ext - all) / all : 0;
};

export const sectorMix = (p: Projection, runs = 300): SectorMix => {
  const sectorOfId = new Map(p.nodes.map((x) => [x.id, sectorOf(x)]));
  const size = new Map<Sector, number>();
  for (const s of sectorOfId.values()) size.set(s, (size.get(s) || 0) + 1);
  const sectors = SECTOR_ORDER.filter((s) => size.has(s));
  const idx = new Map(sectors.map((s, i) => [s, i]));
  const matrix = sectors.map(() => sectors.map(() => 0));
  for (const k of p.shared.keys()) {
    const [a, b] = k.split('|');
    const i = idx.get(sectorOfId.get(a)!)!;
    const j = idx.get(sectorOfId.get(b)!)!;
    matrix[i][j]++;
    if (i !== j) matrix[j][i]++;
  }
  const ids = p.nodes.map((x) => x.id);
  const labels = ids.map((id) => sectorOfId.get(id)!);
  const next = rng(29);
  const shuffled: number[] = [];
  for (let r = 0; r < runs; r++) {
    for (let i = labels.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [labels[i], labels[j]] = [labels[j], labels[i]];
    }
    shuffled.push(eiOf(p, new Map(ids.map((id, i) => [id, labels[i]]))));
  }
  shuffled.sort((a, b) => a - b);
  return {
    sectors,
    matrix,
    size,
    ei: eiOf(p, sectorOfId),
    eiChance: shuffled.reduce((a, b) => a + b, 0) / (runs || 1),
    eiLow: shuffled[Math.floor(runs * 0.05)] ?? 0,
    eiHigh: shuffled[Math.floor(runs * 0.95)] ?? 0,
  };
};

/** Brandes betweenness: how often each partner lies on the shortest route between two others. */
export const betweenness = (p: Projection) => {
  const ids = [...p.adj.keys()];
  const bc = new Map(ids.map((id) => [id, 0]));
  for (const s of ids) {
    const stack: string[] = [];
    const preds = new Map<string, string[]>();
    const sigma = new Map<string, number>([[s, 1]]);
    const dist = new Map<string, number>([[s, 0]]);
    const queue = [s];
    for (let qi = 0; qi < queue.length; qi++) {
      const v = queue[qi];
      stack.push(v);
      for (const w of p.adj.get(v)!) {
        if (!dist.has(w)) {
          dist.set(w, dist.get(v)! + 1);
          queue.push(w);
        }
        if (dist.get(w) === dist.get(v)! + 1) {
          sigma.set(w, (sigma.get(w) || 0) + sigma.get(v)!);
          preds.set(w, [...(preds.get(w) || []), v]);
        }
      }
    }
    const delta = new Map<string, number>();
    while (stack.length) {
      const w = stack.pop()!;
      for (const v of preds.get(w) || []) delta.set(v, (delta.get(v) || 0) + (sigma.get(v)! / sigma.get(w)!) * (1 + (delta.get(w) || 0)));
      if (w !== s) bc.set(w, bc.get(w)! + (delta.get(w) || 0));
    }
  }
  for (const id of ids) bc.set(id, bc.get(id)! / 2); // each pair was counted from both ends
  return bc;
};

export interface Bridge {
  node: GraphNode;
  sector: Sector;
  sectorsReached: number; // other sectors among its ties
  crossTies: number;
  activities: number;
  share: number; // share of all brokerage in the network
}

export const bridges = (m: ReportModel, p: Projection) => {
  const bc = betweenness(p);
  const total = [...bc.values()].reduce((a, b) => a + b, 0);
  const acts = new Set(activitiesOf(m, p.layer).map((a) => a.id));
  const list: Bridge[] = p.nodes.map((n) => {
    const sector = sectorOf(n);
    const others = [...p.adj.get(n.id)!].map((id) => sectorOf(m.byId.get(id)!)).filter((s) => s !== sector);
    return {
      node: n,
      sector,
      sectorsReached: new Set(others).size,
      crossTies: others.length,
      activities: (m.projectsOf.get(n.id) || []).filter((x) => acts.has(x.project.id)).length,
      share: total ? bc.get(n.id)! / total : 0,
    };
  });
  list.sort((a, b) => b.share - a.share || b.sectorsReached - a.sectorsReached);
  return { list, top3: list.slice(0, 3).reduce((a, b) => a + b.share, 0) };
};

// ---------- Program collaboration profiles ----------

export interface ProgramProfile {
  program: GraphNode;
  partners: GraphNode[];
  sectors: number;
  diversity: number; // Blau index: chance two partners picked at random are from different sectors
  outside: number; // share of its partners also listed on other activities
  outsideDelivery: number; // share also on another program or product
  unique: GraphNode[]; // partners on no other activity
  pairs: number;
  newPairs: number; // pairs listed together nowhere else
}

export const programProfiles = (m: ReportModel, programs: GraphNode[] = m.workProjects): ProgramProfile[] => {
  const all = project(m, 'all');
  const work = new Set(m.workProjects.map((p) => p.id));
  return programs
    .map((program) => {
      const partners = [...new Map((m.partnersOf.get(program.id) || []).map((x) => [x.partner.id, x.partner])).values()];
      const n = partners.length;
      const counts = new Map<Sector, number>();
      partners.forEach((x) => counts.set(sectorOf(x), (counts.get(sectorOf(x)) || 0) + 1));
      const others = (id: string) => (m.projectsOf.get(id) || []).filter((x) => x.project.id !== program.id);
      let newPairs = 0;
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) if ((all.shared.get(pairKey(partners[i].id, partners[j].id)) || []).length === 1) newPairs++;
      return {
        program,
        partners,
        sectors: counts.size,
        diversity: n ? 1 - [...counts.values()].reduce((a, c) => a + (c / n) ** 2, 0) : 0,
        outside: n ? partners.filter((x) => others(x.id).length).length / n : 0,
        outsideDelivery: n ? partners.filter((x) => others(x.id).some((o) => work.has(o.project.id))).length / n : 0,
        unique: partners.filter((x) => !others(x.id).length),
        pairs: (n * (n - 1)) / 2,
        newPairs,
      };
    })
    .filter((x) => x.partners.length)
    .sort((a, b) => b.partners.length - a.partners.length);
};

/** CWI's own effort, reported apart from network measures because CWI is central to everything it runs. */
export const convenorInputs = (m: ReportModel) => ({
  programs: m.workProjects.length,
  convenings: m.convenings.length,
  partnersReached: m.partners.length,
  listings: m.engagements.length,
  conveningOnly: m.partners.filter((p) => (m.projectsOf.get(p.id) || []).every((x) => x.project.type === 'meeting')).length,
});
