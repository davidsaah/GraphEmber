import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import type { GraphEdge, GraphNode, WebProvenance } from '../types/graph';

// Approved web findings about one entity, each with its sources and who approved it.
export const WebFindings: React.FC<{ node: GraphNode; edges: GraphEdge[] }> = ({ node, edges }) => {
  const items: (WebProvenance & { heading: string })[] = [];
  if (node.webSource) items.push({ ...node.webSource, heading: 'Added from the web' });
  for (const f of node.webFacts || []) {
    const heading = f.kind === 'impact' ? `${f.metric}: ${f.value}${f.unit ? ` ${f.unit}` : ''}` : `${f.field}: ${f.value}`;
    items.push({ ...f, heading: f.date ? `${heading} (${f.date})` : heading });
  }
  for (const e of edges) {
    const s = typeof e.source === 'object' ? e.source.id : e.source;
    const t = typeof e.target === 'object' ? e.target.id : e.target;
    if (e.webSource && (s === node.id || t === node.id)) items.push({ ...e.webSource, heading: e.type.replace(/_/g, ' ').toLowerCase() });
  }
  if (!items.length) return null;

  return (
    <div className="web-findings">
      <div className="web-findings-title">
        <Globe size={13} /> From the web ({items.length})
      </div>
      {items.map((it) => (
        <div key={`${it.proposalId}-${it.heading}`} className="web-finding">
          <div className="web-finding-heading">{it.heading}</div>
          <p>{it.summary}</p>
          <div className="web-finding-sources">
            {it.sources.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer nofollow" title={s.title}>
                {s.publisher} <ExternalLink size={10} />
              </a>
            ))}
          </div>
          <div className="web-finding-meta">
            Approved by {it.approvedBy} · {new Date(it.approvedAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  );
};
