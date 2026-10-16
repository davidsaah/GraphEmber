import React from 'react';
import { X, Network, ArrowRight, ShieldCheck, Sparkles, Building2, Flame, Layers, Box, Tag } from 'lucide-react';
import type { GraphNode } from '../types/graph';

interface OntologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFocusEcosystem?: () => void;
  nodes?: GraphNode[];
}

export const OntologyModal: React.FC<OntologyModalProps> = ({
  isOpen,
  onClose,
  onFocusEcosystem,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.82)',
        backdropFilter: 'blur(10px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 920,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: '#0c101d',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.75), 0 0 40px rgba(249, 115, 22, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(249, 115, 22, 0.08) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(249, 115, 22, 0.4)',
              }}
            >
              <Network size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Firelines Knowledge Graph Ontology
                </h2>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(249, 115, 22, 0.2)',
                    color: '#fb923c',
                    border: '1px solid rgba(249, 115, 22, 0.35)',
                  }}
                >
                  Schema Blueprint
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                The formal blueprint defining entities, typed relationships, and semantic metadata properties
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: 8,
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Definition Banner */}
          <div
            style={{
              padding: 16,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-subtle)',
              borderLeft: '4px solid var(--accent-ember)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fb923c', fontSize: '0.8rem', fontWeight: 600 }}>
              <Sparkles size={16} />
              <span>Ontological Foundation</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: 1.5 }}>
              <strong>Firelines</strong> is based on a graph database that stores interconnected intelligence data, organized strictly by an ontology:
            </p>
            <ul style={{ paddingLeft: 20, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li><strong>Entities (Boxes)</strong>: Primary domain objects including Organizations, Consortia/Coalitions, Products, and Topics.</li>
              <li><strong>Relationships (Arrows)</strong>: Typed directional links describing interactions (<code style={{ color: '#cbd5e1' }}>PartnersIn</code>, <code style={{ color: '#cbd5e1' }}>Produces</code>, <code style={{ color: '#cbd5e1' }}>HasTopic</code>, <code style={{ color: '#cbd5e1' }}>Funds</code>).</li>
              <li><strong>Properties (Metadata)</strong>: Rich attributes attached both to entities (e.g., location, status) and to relationships (e.g., <code style={{ color: '#fb923c' }}>how</code>, <code style={{ color: '#fb923c' }}>modality</code>).</li>
            </ul>
          </div>

          {/* Core Ontology Pipeline Diagram (Matching the Slide) */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Layers size={16} color="var(--accent-ember)" />
              <span>Core Ontology Relationship Chain</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                position: 'relative',
              }}
            >
              {/* Box 1: Organization */}
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Building2 size={16} color="#34d399" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#34d399' }}>Organization</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Properties:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>• location</span>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>• type</span>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>• description</span>
                </div>
              </div>

              {/* Box 2: Consortium / Coalition */}
              <div
                style={{
                  backgroundColor: 'rgba(249, 115, 22, 0.1)',
                  border: '1px solid rgba(249, 115, 22, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldCheck size={16} color="#fb923c" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fb923c' }}>Consortium</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Properties:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>• location</span>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>• description</span>
                </div>
              </div>

              {/* Box 3: Product */}
              <div
                style={{
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Box size={16} color="#a5b4fc" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#a5b4fc' }}>Product</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Properties:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>• location</span>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>• type</span>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>• description</span>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>• status</span>
                </div>
              </div>

              {/* Box 4: Topic */}
              <div
                style={{
                  backgroundColor: 'rgba(225, 29, 72, 0.1)',
                  border: '1px solid rgba(225, 29, 72, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Flame size={16} color="#fb7185" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fb7185' }}>Topic</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Properties:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>• domain</span>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>• modalities</span>
                  <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>• scope</span>
                </div>
              </div>
            </div>

            {/* Edge Link Connectors */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                }}
              >
                <ArrowRight size={13} color="#f97316" />
                <span><strong>PartnersIn</strong> [property: <span style={{ color: '#fb923c' }}>how</span>]</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                }}
              >
                <ArrowRight size={13} color="#f97316" />
                <span><strong>Produces / HasProject</strong></span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                }}
              >
                <ArrowRight size={13} color="#f97316" />
                <span><strong>HasTopic</strong> [property: <span style={{ color: '#fb7185' }}>modality</span>]</span>
              </div>
            </div>
          </div>

          {/* Reference Implementation: Earth Fire Alliance Case Study */}
          <div
            style={{
              padding: 16,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(249, 115, 22, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Tag size={13} color="var(--accent-ember)" />
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f8fafc' }}>
                  Mock Data Case Study: Earth Fire Alliance (EFA) & FireSat
                </span>
              </div>

              {onFocusEcosystem && (
                <button
                  onClick={() => {
                    onFocusEcosystem();
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(249, 115, 22, 0.15)',
                    border: '1px solid rgba(249, 115, 22, 0.35)',
                    color: '#fb923c',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.25)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.15)')}
                >
                  <span>Highlight EFA Network in Canvas</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
              The schema in the slide directly models the multi-stakeholder wildfire coalition:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, fontSize: '0.78rem' }}>
              <div style={{ padding: 10, backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>Coalition: </span>
                <span style={{ color: '#e2e8f0' }}>Earth Fire Alliance (SF)</span>
              </div>
              <div style={{ padding: 10, backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: '#a5b4fc', fontWeight: 600 }}>Product: </span>
                <span style={{ color: '#e2e8f0' }}>FireSat (global wildfire satellite constellation)</span>
              </div>
              <div style={{ padding: 10, backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: '#34d399', fontWeight: 600 }}>ParticipatesIn (Role): </span>
                <span style={{ color: '#e2e8f0' }}>Muon Space (makes satellites), Google.org (analyzes data), EDF (policy work)</span>
              </div>
              <div style={{ padding: 10, backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: '#fb7185', fontWeight: 600 }}>Topic Modalities: </span>
                <span style={{ color: '#e2e8f0' }}>Fire monitoring [satellite via FireSat, manual via CWI]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--border-subtle)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-elevated)')}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default OntologyModal;
