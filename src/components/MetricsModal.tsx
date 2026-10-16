import React from 'react';
import type { GraphNode, GraphEdge } from '../types/graph';
import { calculateNodeMetrics } from '../utils/graphMetrics';
import { BarChart3, X, Trophy, Network } from 'lucide-react';

interface MetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (node: GraphNode) => void;
}

export const MetricsModal: React.FC<MetricsModalProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  onSelectNode,
}) => {
  if (!isOpen) return null;

  const metricsMap = calculateNodeMetrics(nodes, edges);

  // Top nodes by degree centrality
  const rankedNodes = [...nodes]
    .map((n) => ({
      node: n,
      degree: metricsMap.get(n.id)?.degree || 0,
    }))
    .sort((a, b) => b.degree - a.degree)
    .slice(0, 10);

  // Categorical stats
  const typeCounts = nodes.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalGrants = nodes.filter((n) => n.type === 'grant');
  const totalFunding = totalGrants.reduce((sum, g) => sum + ((g as any).amount || 0), 0);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 680,
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: 24,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart3 size={18} color="var(--color-program)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>Ecosystem Network Intelligence</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Centrality rankings, bridge entities, and multi-institutional flows
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Overview Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          <div
            style={{
              padding: 14,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Entities</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginTop: 4 }}>{nodes.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>{edges.length} active relationships</div>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Funding</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399', marginTop: 4 }}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(totalFunding)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>across {totalGrants.length} major grants</div>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Collaboratives & Prods</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fb923c', marginTop: 4 }}>
              {(typeCounts.collaborative || 0) + (typeCounts.product || 0)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>alliances and open tools</div>
          </div>
        </div>

        {/* Top Central Connectors Table */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Trophy size={16} color="var(--color-institution)" />
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Top Network Connectors (Degree Centrality)
            </h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rankedNodes.map(({ node, degree }, index) => (
              <div
                key={node.id}
                onClick={() => {
                  onSelectNode(node);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: index < 3 ? '#fbbf24' : 'var(--text-muted)', width: 16 }}>
                    #{index + 1}
                  </span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`badge badge-${node.type}`}>{node.type}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {node.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Network size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-collaborative)' }}>
                    {degree} connections
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
