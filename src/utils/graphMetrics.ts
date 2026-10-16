import type { GraphNode, GraphEdge, NodeMetrics } from '../types/graph';

export function calculateNodeMetrics(nodes: GraphNode[], edges: GraphEdge[]): Map<string, NodeMetrics> {
  const metricsMap = new Map<string, NodeMetrics>();

  nodes.forEach((n) => {
    metricsMap.set(n.id, { degree: 0, inDegree: 0, outDegree: 0 });
  });

  edges.forEach((edge) => {
    const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
    const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;

    const sourceMetrics = metricsMap.get(sourceId);
    if (sourceMetrics) {
      sourceMetrics.outDegree += 1;
      sourceMetrics.degree += 1;
    }

    const targetMetrics = metricsMap.get(targetId);
    if (targetMetrics) {
      targetMetrics.inDegree += 1;
      targetMetrics.degree += 1;
    }
  });

  return metricsMap;
}

export function findShortestPath(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startNodeId: string,
  endNodeId: string
): { pathNodeIds: string[]; pathEdgeIds: string[] } | null {
  if (startNodeId === endNodeId) {
    return { pathNodeIds: [startNodeId], pathEdgeIds: [] };
  }

  // Build adjacency list
  const adj = new Map<string, Array<{ neighborId: string; edgeId: string }>>();
  nodes.forEach((n) => adj.set(n.id, []));

  edges.forEach((e) => {
    const s = typeof e.source === 'object' ? e.source.id : e.source;
    const t = typeof e.target === 'object' ? e.target.id : e.target;
    adj.get(s)?.push({ neighborId: t, edgeId: e.id });
    adj.get(t)?.push({ neighborId: s, edgeId: e.id });
  });

  // BFS
  const queue: string[] = [startNodeId];
  const visited = new Set<string>([startNodeId]);
  const parentNode = new Map<string, string>();
  const parentEdge = new Map<string, string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === endNodeId) {
      // Reconstruct path
      const pathNodes: string[] = [];
      const pathEdges: string[] = [];
      let curr = endNodeId;

      while (curr !== startNodeId) {
        pathNodes.unshift(curr);
        const edge = parentEdge.get(curr);
        if (edge) pathEdges.unshift(edge);
        curr = parentNode.get(curr)!;
      }
      pathNodes.unshift(startNodeId);

      return { pathNodeIds: pathNodes, pathEdgeIds: pathEdges };
    }

    const neighbors = adj.get(current) || [];
    for (const { neighborId, edgeId } of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        parentNode.set(neighborId, current);
        parentEdge.set(neighborId, edgeId);
        queue.push(neighborId);
      }
    }
  }

  return null;
}

export function getNeighborhood(
  nodeId: string,
  edges: GraphEdge[],
  hops: 1 | 2 = 1
): { nodeIds: Set<string>; edgeIds: Set<string> } {
  const nodeIds = new Set<string>([nodeId]);
  const edgeIds = new Set<string>();

  const currentLevel = new Set<string>([nodeId]);

  for (let h = 0; h < hops; h++) {
    const nextLevel = new Set<string>();
    edges.forEach((e) => {
      const s = typeof e.source === 'object' ? e.source.id : e.source;
      const t = typeof e.target === 'object' ? e.target.id : e.target;

      if (currentLevel.has(s)) {
        nodeIds.add(t);
        edgeIds.add(e.id);
        nextLevel.add(t);
      }
      if (currentLevel.has(t)) {
        nodeIds.add(s);
        edgeIds.add(e.id);
        nextLevel.add(s);
      }
    });

    currentLevel.clear();
    nextLevel.forEach((id) => currentLevel.add(id));
  }

  return { nodeIds, edgeIds };
}
