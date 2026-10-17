import type { GraphEdge, GraphNode, WebProvenance } from '../types/graph';
import type { Proposal } from './types';

export const WEB_TAG = 'Web-sourced';

const provenance = (p: Proposal): WebProvenance => ({
  proposalId: p.id,
  summary: p.summary,
  sources: p.sources.map(({ url, title, publisher }) => ({ url, title, publisher })),
  approvedBy: p.decidedBy || 'unknown',
  approvedAt: p.decidedAt || p.foundAt,
});

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

// Layers approved findings over the curated data. Curated values are never overwritten:
// a web update fills an empty field, and is otherwise kept beside it as a web fact.
export const applyApproved = (baseNodes: GraphNode[], baseEdges: GraphEdge[], proposals: Proposal[]) => {
  const approved = proposals.filter((p) => p.status === 'approved');
  if (!approved.length) return { nodes: baseNodes, edges: baseEdges };

  const nodes = new Map(baseNodes.map((n) => [n.id, n]));
  const touched = new Map<string, GraphNode>();
  const edit = (id: string) => {
    if (!touched.has(id)) {
      const n = nodes.get(id);
      if (!n) return undefined;
      touched.set(id, { ...n, webFacts: [...(n.webFacts || [])] } as GraphNode);
    }
    return touched.get(id)!;
  };
  const added: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const p of approved) {
    if (!nodes.has(p.subjectId)) continue;
    const prov = provenance(p);

    if (p.kind === 'connection' || p.kind === 'entity') {
      let otherId = p.targetId;
      if (p.kind === 'entity' && p.targetName) {
        otherId = `web-${slug(p.targetName)}`;
        if (!nodes.has(otherId)) {
          const node = { id: otherId, type: p.targetType || 'institution', label: p.targetName, description: p.summary, tags: [WEB_TAG], webSource: prov } as GraphNode;
          nodes.set(otherId, node);
          added.push(node);
        }
      }
      if (!otherId || !nodes.has(otherId) || !p.relation) continue;
      const [source, target] = p.direction === 'target_to_subject' ? [otherId, p.subjectId] : [p.subjectId, otherId];
      edges.push({ id: `web-edge-${p.id}`, source, target, type: p.relation, how: p.how, description: p.summary, label: p.relation, webSource: prov });
    } else {
      const node = edit(p.subjectId);
      if (!node) continue;
      node.webFacts!.push({ ...prov, kind: p.kind, date: p.date, field: p.field, value: p.value, metric: p.metric, unit: p.unit });
      if (p.kind === 'update' && p.field && p.value) {
        const record = node as unknown as Record<string, unknown>;
        if (!record[p.field]) record[p.field] = p.value;
      }
    }
  }

  return {
    nodes: [...baseNodes.map((n) => touched.get(n.id) || n), ...added],
    edges: [...baseEdges, ...edges],
  };
};
