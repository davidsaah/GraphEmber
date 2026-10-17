import type { GraphEdge, GraphNode } from '../types/graph';
import type { CurationLog, EditEntry, MergeEntry } from './types';

const endId = (end: string | GraphNode) => (typeof end === 'string' ? end : end.id);
const isEmpty = (v: unknown) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

// Layers hand edits, then merges, over the graph. Undone entries are skipped, so undo is just a re-run.
export const applyCuration = (inNodes: GraphNode[], inEdges: GraphEdge[], log: CurationLog | null) => {
  const entries = (log?.entries || []).filter((e) => !e.undoneAt);
  if (!entries.length) return { nodes: inNodes, edges: inEdges };

  const nodes = new Map(inNodes.map((n) => [n.id, n]));
  const copy = (id: string) => {
    const n = nodes.get(id);
    if (!n) return undefined;
    const c = { ...n } as GraphNode;
    nodes.set(id, c);
    return c;
  };

  // --- edits ---
  for (const e of entries.filter((x): x is EditEntry => x.type === 'edit')) {
    const node = copy(e.nodeId);
    if (!node) continue;
    const record = node as unknown as Record<string, unknown>;
    for (const [field, change] of Object.entries(e.changes)) record[field] = change!.to;
    node.editCount = (node.editCount || 0) + 1;
  }

  // --- merges, in order; later merges follow earlier ones ---
  const into = new Map<string, string>();
  const resolve = (id: string) => {
    let cur = id;
    for (let i = 0; i < 50 && into.has(cur); i++) cur = into.get(cur)!;
    return cur;
  };
  for (const m of entries.filter((x): x is MergeEntry => x.type === 'merge')) {
    const keepId = resolve(m.keepId);
    const loseId = resolve(m.mergeId);
    const lose = nodes.get(loseId);
    if (keepId === loseId || !lose || !nodes.has(keepId)) continue;
    const keep = copy(keepId)!;
    const k = keep as unknown as Record<string, unknown>;
    for (const [field, value] of Object.entries(lose)) {
      if (['id', 'type', 'x', 'y', 'vx', 'vy', 'fx', 'fy', 'index', 'radius'].includes(field)) continue;
      if (isEmpty(k[field]) && !isEmpty(value)) k[field] = value;
    }
    keep.tags = [...new Set([...(keep.tags || []), ...(lose.tags || [])])];
    keep.aliases = [...new Set([...(keep.aliases || []), lose.label, ...(lose.acronym ? [lose.acronym] : []), ...(lose.aliases || [])])].filter(
      (a) => a && a !== keep.label,
    );
    keep.webFacts = [...(keep.webFacts || []), ...(lose.webFacts || [])];
    keep.mergedFrom = [...(keep.mergedFrom || []), ...(lose.mergedFrom || []), { id: lose.id, label: lose.label, by: m.by, at: m.at }];
    into.set(loseId, keepId);
    nodes.delete(loseId);
  }

  // --- rewire edges onto the surviving entities, dropping loops and repeats ---
  const seen = new Set<string>();
  const edges: GraphEdge[] = [];
  for (const e of inEdges) {
    const s0 = endId(e.source);
    const t0 = endId(e.target);
    const s = resolve(s0);
    const t = resolve(t0);
    if (s === t || !nodes.has(s) || !nodes.has(t)) continue;
    const key = `${s}|${t}|${e.type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push(s === s0 && t === t0 ? e : { ...e, source: s, target: t });
  }

  const order = inNodes.map((n) => n.id).filter((id) => nodes.has(id));
  return { nodes: order.map((id) => nodes.get(id)!), edges };
};
