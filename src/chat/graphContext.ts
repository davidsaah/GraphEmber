import type { GraphNode, GraphEdge } from '../types/graph';

const endpointId = (end: string | GraphNode) => (typeof end === 'string' ? end : end.id);

const clip = (text: string | undefined, max: number) => {
  if (!text) return '';
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
};

// Compact plain-text dump of the graph that the model answers from.
export const buildGraphContext = (nodes: GraphNode[], edges: GraphEdge[]): string => {
  const nodeLines = nodes.map((n) => {
    const parts = [n.id, n.type, n.label];
    if (n.acronym) parts.push(`aka ${n.acronym}`);
    if (n.location) parts.push(`in ${clip(n.location, 60)}`);
    const tags = (n.tags || []).filter((t) => !t.startsWith('Works with:'));
    if (tags.length) parts.push(`tags: ${tags.slice(0, 8).join(', ')}`);
    if (n.description) parts.push(clip(n.description, 220));
    return parts.join(' | ');
  });

  const edgeLines = edges.map((e) => {
    const line = `${endpointId(e.source)} -${e.type}-> ${endpointId(e.target)}`;
    const detail = clip(e.how || e.description || e.label, 120);
    return detail ? `${line} (${detail})` : line;
  });

  return [
    `NODES (${nodes.length}) — id | type | name | details`,
    ...nodeLines,
    '',
    `RELATIONSHIPS (${edges.length}) — source -TYPE-> target (how)`,
    ...edgeLines,
  ].join('\n');
};
