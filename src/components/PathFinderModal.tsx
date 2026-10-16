import React, { useState } from 'react';
import type { GraphNode, GraphEdge } from '../types/graph';
import { findShortestPath } from '../utils/graphMetrics';
import { Route, X, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface PathFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: GraphNode[];
  edges: GraphEdge[];
  onApplyPathHighlight: (pathNodeIds: string[], pathEdgeIds: string[]) => void;
  onClearPathHighlight: () => void;
}

export const PathFinderModal: React.FC<PathFinderModalProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  onApplyPathHighlight,
  onClearPathHighlight,
}) => {
  const [sourceId, setSourceId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [resultPath, setResultPath] = useState<{ pathNodeIds: string[]; pathEdgeIds: string[] } | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCompute = () => {
    if (!sourceId || !targetId) return;
    setHasSearched(true);
    const res = findShortestPath(nodes, edges, sourceId, targetId);
    setResultPath(res);
    if (res) {
      onApplyPathHighlight(res.pathNodeIds, res.pathEdgeIds);
    }
  };

  const handleReset = () => {
    setSourceId('');
    setTargetId('');
    setResultPath(null);
    setHasSearched(false);
    onClearPathHighlight();
  };

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
          maxWidth: 580,
          backgroundColor: 'var(--bg-surface-elevated)',
          padding: 24,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(249, 115, 22, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Route size={18} color="var(--color-collaborative)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Ecosystem Path Finder</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Discover shortest collaboration bridges and degrees of separation
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Source Entity
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              style={{
                width: '100%',
                height: 40,
                padding: '0 12px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="">Select origin entity...</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  [{n.type.toUpperCase()}] {n.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Target Entity
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              style={{
                width: '100%',
                height: 40,
                padding: '0 12px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="">Select target destination...</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  [{n.type.toUpperCase()}] {n.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <button
            onClick={handleCompute}
            disabled={!sourceId || !targetId || sourceId === targetId}
            style={{
              flex: 1,
              height: 40,
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: !sourceId || !targetId || sourceId === targetId ? 0.5 : 1,
            }}
          >
            <Sparkles size={16} />
            <span>Trace Connection Path</span>
          </button>

          {hasSearched && (
            <button
              onClick={handleReset}
              style={{
                height: 40,
                padding: '0 14px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
              }}
            >
              Reset
            </button>
          )}
        </div>

        {/* Results */}
        {hasSearched && (
          <div
            style={{
              padding: 16,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {resultPath ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399', fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>
                  <CheckCircle2 size={16} />
                  <span>
                    Shortest Path Found ({resultPath.pathNodeIds.length - 1} degrees of separation)
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {resultPath.pathNodeIds.map((nodeId, idx) => {
                    const node = nodes.find((n) => n.id === nodeId);
                    if (!node) return null;

                    const isLast = idx === resultPath.pathNodeIds.length - 1;
                    const nextEdgeId = resultPath.pathEdgeIds[idx];
                    const nextEdge = edges.find((e) => e.id === nextEdgeId);

                    return (
                      <div key={nodeId} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={`badge badge-${node.type}`}>{node.type}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                            {node.label}
                          </span>
                        </div>

                        {!isLast && nextEdge && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 18, color: '#fb923c', fontSize: '0.75rem' }}>
                            <ArrowRight size={13} />
                            <span>
                              {nextEdge.label || nextEdge.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '12px 0' }}>
                No active connection path between these entities was found in the current network.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
