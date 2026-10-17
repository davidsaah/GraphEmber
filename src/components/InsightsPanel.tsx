import React, { useMemo, useState } from 'react';
import { PanelLeftClose } from 'lucide-react';
import type { GraphNode, GraphEdge, NodeType } from '../types/graph';

interface InsightsPanelProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  cwiOnly: boolean;
  selectedNodeId: string | null;
  onSelectNode: (node: GraphNode) => void;
  onHoverNode: (nodeId: string | null) => void;
  onHighlight: (nodeIds: string[], edgeIds: string[]) => void;
  onClose: () => void;
}

const CWI_ID = 'inst-cwi';
const endpointId = (end: string | GraphNode) => (typeof end === 'string' ? end : end.id);

const TYPE_NOUN: Partial<Record<NodeType, string>> = {
  meeting: 'Convening',
  program: 'Program',
  product: 'Product',
};

// "Sacramento, CA" -> "CA"; free-text or global locations have no state
const stateOf = (location?: string) => location?.match(/,\s*([A-Z]{2})\s*$/)?.[1];

const STATE_NAMES: Record<string, string> = {
  CA: 'California',
  NV: 'Nevada',
  OR: 'Oregon',
  WA: 'Washington',
  CO: 'Colorado',
  NY: 'New York',
  DC: 'Washington DC',
  VA: 'Virginia',
  MD: 'Maryland',
  NM: 'New Mexico',
  MT: 'Montana',
  TX: 'Texas',
  TN: 'Tennessee',
  NJ: 'New Jersey',
  AK: 'Alaska',
  BC: 'British Columbia',
};

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  nodes,
  edges,
  cwiOnly,
  selectedNodeId,
  onSelectNode,
  onHoverNode,
  onHighlight,
  onClose,
}) => {
  const [showAllProjects, setShowAllProjects] = useState(false);

  const stats = useMemo(() => {
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const neighbors = new Map<string, Set<string>>();
    const link = (a: string, b: string) => {
      if (!neighbors.has(a)) neighbors.set(a, new Set());
      neighbors.get(a)!.add(b);
    };
    edges.forEach((e) => {
      const s = endpointId(e.source);
      const t = endpointId(e.target);
      link(s, t);
      link(t, s);
    });

    const projects = nodes
      .filter((n) => n.tags?.includes('CWI project'))
      .map((n) => ({ node: n, partners: [...(neighbors.get(n.id) || [])].filter((id) => id !== CWI_ID).length }))
      .sort((a, b) => b.partners - a.partners);
    const projectIds = new Set(projects.map((p) => p.node.id));

    // A partner is anyone working on at least one CWI project
    const partnerProjects = new Map<string, number>();
    projects.forEach((p) =>
      neighbors.get(p.node.id)?.forEach((id) => {
        if (id !== CWI_ID && !projectIds.has(id)) partnerProjects.set(id, (partnerProjects.get(id) || 0) + 1);
      }),
    );
    const partners = [...partnerProjects.entries()]
      .map(([id, count]) => ({ node: byId.get(id)!, count }))
      .filter((p) => p.node)
      .sort((a, b) => b.count - a.count || a.node.label.localeCompare(b.node.label));

    const states = new Map<string, string[]>();
    partners.forEach(({ node }) => {
      const st = stateOf(node.location);
      if (st) states.set(st, [...(states.get(st) || []), node.id]);
    });
    const places = new Set(partners.map((p) => p.node.location).filter(Boolean));

    return {
      projects,
      partners,
      states: [...states.entries()].map(([code, ids]) => ({ code, ids })).sort((a, b) => b.ids.length - a.ids.length),
      places: places.size,
      returning: partners.filter((p) => p.count > 1).length,
    };
  }, [nodes, edges]);

  const maxProject = stats.projects[0]?.partners || 1;
  const maxState = stats.states[0]?.ids.length || 1;
  const projects = showAllProjects ? stats.projects : stats.projects.slice(0, 7);

  const kpis = [
    { label: 'Projects', value: stats.projects.length },
    { label: 'Partners', value: stats.partners.length },
    { label: 'Places', value: stats.places },
    { label: 'Links', value: edges.length },
  ];

  const row = (node: GraphNode, children: React.ReactNode, key?: string) => (
    <button
      key={key || node.id}
      className="insight-row"
      aria-current={node.id === selectedNodeId}
      onClick={() => onSelectNode(node)}
      onMouseEnter={() => onHoverNode(node.id)}
      onMouseLeave={() => onHoverNode(null)}
    >
      {children}
    </button>
  );

  return (
    <aside className="insights" aria-label="Network overview">
      <div className="insights-head">
        <div>
          <div className="eyebrow">{cwiOnly ? 'CWI network' : 'Full network'}</div>
          <div className="insights-title">At a glance</div>
        </div>
        <button className="icon-btn" onClick={onClose} title="Hide overview" aria-label="Hide overview">
          <PanelLeftClose size={16} />
        </button>
      </div>

      <div className="insights-body">
        <div className="kpi-grid">
          {kpis.map((k) => (
            <div key={k.label} className="kpi">
              <div className="kpi-value">{k.value.toLocaleString()}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          ))}
        </div>
        {stats.partners.length > 0 && (
          <p className="insight-note">
            <strong>{stats.returning}</strong> of {stats.partners.length} partners work on more than one CWI project.
          </p>
        )}

        {stats.projects.length > 0 && (
          <section>
            <h3 className="insight-h">Projects by number of partners</h3>
            {projects.map(({ node, partners }) =>
              row(
                node,
                <>
                  <span className="insight-label">
                    <span className="dot" style={{ background: `var(--color-${node.type})` }} />
                    <span className="clip">{node.label}</span>
                    <span className="insight-value">{partners}</span>
                  </span>
                  <span className="bar">
                    <span style={{ width: `${(partners / maxProject) * 100}%`, background: `var(--color-${node.type})` }} />
                  </span>
                  <span className="insight-sub">
                    {TYPE_NOUN[node.type] || 'Project'}
                    {node.location ? ` · ${node.location}` : ''}
                  </span>
                </>,
              ),
            )}
            {stats.projects.length > 7 && (
              <button className="insight-more" onClick={() => setShowAllProjects((v) => !v)}>
                {showAllProjects ? 'Show fewer' : `Show all ${stats.projects.length}`}
              </button>
            )}
          </section>
        )}

        {stats.partners.length > 0 && (
          <section>
            <h3 className="insight-h">Partners on the most projects</h3>
            {stats.partners.slice(0, 6).map(({ node, count }) =>
              row(
                node,
                <span className="insight-label">
                  <span className="dot" style={{ background: `var(--color-${node.type})` }} />
                  <span className="clip">{node.label}</span>
                  <span className="pips" aria-label={`${count} projects`}>
                    {Array.from({ length: Math.min(count, 8) }, (_, i) => (
                      <i key={i} />
                    ))}
                  </span>
                  <span className="insight-value">{count}</span>
                </span>,
              ),
            )}
          </section>
        )}

        {stats.states.length > 0 && (
          <section>
            <h3 className="insight-h">Where partners are based</h3>
            {stats.states.slice(0, 6).map(({ code, ids }) => (
              <button
                key={code}
                className="insight-row"
                onClick={() => onHighlight(ids, [])}
                title={`Highlight the ${ids.length} partners in ${STATE_NAMES[code] || code}`}
              >
                <span className="insight-label">
                  <span className="clip">{STATE_NAMES[code] || code}</span>
                  <span className="insight-value">{ids.length}</span>
                </span>
                <span className="bar">
                  <span style={{ width: `${(ids.length / maxState) * 100}%` }} />
                </span>
              </button>
            ))}
          </section>
        )}
      </div>
    </aside>
  );
};
