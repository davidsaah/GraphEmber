import React from 'react';
import {
  X,
  ExternalLink,
  Flame,
  Shield,
  Home,
  Network,
  Users,
  Award,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { CwiLogo } from './CwiLogo';
import type { GraphNode } from '../types/graph';

interface CwiBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFocusCwiEcosystem: () => void;
  onFocusResilientHomeFund: () => void;
  nodes: GraphNode[];
}

export const CwiBrandModal: React.FC<CwiBrandModalProps> = ({
  isOpen,
  onClose,
  onFocusCwiEcosystem,
  onFocusResilientHomeFund,
  nodes,
}) => {
  if (!isOpen) return null;

  const cwiNode = nodes.find((n) => n.id === 'inst-cwi');
  const rhfNode = nodes.find((n) => n.id === 'prog-rhf');
  const efaNode = nodes.find((n) => n.id === 'collab-efa');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 16, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 20,
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: 860,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0d1322',
          border: '1px solid rgba(246, 186, 19, 0.35)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 32px rgba(235, 124, 38, 0.25)',
          overflow: 'hidden',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Banner */}
        <div
          style={{
            position: 'relative',
            padding: '28px 32px 24px',
            background: 'linear-gradient(135deg, rgba(246, 186, 19, 0.12) 0%, rgba(235, 124, 38, 0.18) 50%, rgba(226, 62, 29, 0.12) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          {/* Subtle background glow */}
          <div
            style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(246, 186, 19, 0.25) 0%, transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <CwiLogo variant="mark" size={54} glow={true} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-brand, "Poppins", sans-serif)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#f6ba13',
                  }}
                >
                  Climate & Wildfire Institute
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(246, 186, 19, 0.15)',
                    color: '#fed7aa',
                    border: '1px solid rgba(246, 186, 19, 0.35)',
                  }}
                >
                  501(c)(3) Boundary Organization
                </span>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                  marginTop: 4,
                  lineHeight: 1.2,
                }}
              >
                GraphEmber & Firelines Ecosystem
              </h2>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginTop: 6,
                  maxWidth: 620,
                  lineHeight: 1.5,
                }}
              >
                Connecting science to public policy and frontline practice to accelerate solutions to a fast-changing climate.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Close"
            style={{
              padding: 8,
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: '24px 32px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          {/* Official Portals Quick Links */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: 16,
            }}
          >
            {/* Climate & Wildfire Institute Card */}
            <div
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(246, 186, 19, 0.04)',
                border: '1px solid rgba(246, 186, 19, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(246, 186, 19, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Flame size={18} color="#f6ba13" />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f6ba13', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Official Portal
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    climateandwildfire.org
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                  Climate & Wildfire Institute
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  As a boundary organization, CWI weaves together science, policy, and practice to integrate collective knowledge and implement cohesive wildfire resilience solutions.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <a
                  href="https://www.climateandwildfire.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(246, 186, 19, 0.15)',
                    border: '1px solid rgba(246, 186, 19, 0.4)',
                    color: '#fed7aa',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(246, 186, 19, 0.25)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(246, 186, 19, 0.15)';
                    e.currentTarget.style.color = '#fed7aa';
                  }}
                >
                  <span>Visit CWI Website</span>
                  <ExternalLink size={14} />
                </a>

                <button
                  onClick={() => {
                    onFocusCwiEcosystem();
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#f8fafc',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#f6ba13';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <Network size={14} color="#f6ba13" />
                  <span>Highlight in Canvas</span>
                </button>
              </div>
            </div>

            {/* Resilient Home Fund Card */}
            <div
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Home size={18} color="#34d399" />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Grant Initiative
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    resilienthomefund.org
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                  Resilient Home Fund (RHF)
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Wildfire risk reduction grant program for California homeowners. Connecting public action and financial resources directly to home hardening and defensible space.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <a
                  href="https://www.resilienthomefund.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#a7f3d0',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.25)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                    e.currentTarget.style.color = '#a7f3d0';
                  }}
                >
                  <span>Explore Grants App</span>
                  <ExternalLink size={14} />
                </a>

                <button
                  onClick={() => {
                    onFocusResilientHomeFund();
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: '#f8fafc',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <Shield size={14} color="#34d399" />
                  <span>Highlight RHF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Three Core CWI Strategic Pillars */}
          <div>
            <h4
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                marginBottom: 12,
              }}
            >
              CWI Operational Pillars in the Graph
            </h4>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 14,
              }}
            >
              {/* Pillar 1: Data & Innovation (Firelines) */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Sparkles size={16} color="#fb923c" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                    Data & Innovation
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  The <strong>Firelines</strong> knowledge graph architecture maps consortia, satellites (FireSat / EFA), AI models, and sensor streams into actionable decision assets.
                </p>
              </div>

              {/* Pillar 2: Frontline Demonstration (RHF & Pilots) */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Award size={16} color="#34d399" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                    Frontline Demonstration
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Translating risk models into homeowner defense via the <strong>Resilient Home Fund</strong> and the Nevada County Wildfire Resilience Coalition pilots.
                </p>
              </div>

              {/* Pillar 3: Education & Policy Influence */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Users size={16} color="#38bdf8" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                    Policy & Coalition Boundary
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Bridging state leadership (CAL FIRE, Governor's Office), federal agencies (NASA, USFS), academic researchers, and philanthropic foundations.
                </p>
              </div>
            </div>
          </div>

          {/* Active Key Ecosystem Nodes */}
          <div
            style={{
              padding: 16,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fed7aa', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Key CWI Entities In GraphEmber
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {nodes.length} total nodes mapped
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {cwiNode && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(246, 186, 19, 0.15)',
                    border: '1px solid rgba(246, 186, 19, 0.35)',
                    color: '#fed7aa',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <Flame size={12} color="#f6ba13" />
                  {cwiNode.label}
                </span>
              )}
              {rhfNode && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#a7f3d0',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <Home size={12} color="#34d399" />
                  {rhfNode.label}
                </span>
              )}
              {efaNode && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(249, 115, 22, 0.15)',
                    border: '1px solid rgba(249, 115, 22, 0.35)',
                    color: '#fb923c',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  <Network size={12} color="#fb923c" />
                  {efaNode.label} (FireSat)
                </span>
              )}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.35)',
                  color: '#93c5fd',
                  fontSize: '0.75rem',
                }}
              >
                CAL FIRE
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  color: '#d8b4fe',
                  fontSize: '0.75rem',
                }}
              >
                Google.org & Google Research
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(14, 165, 233, 0.15)',
                  border: '1px solid rgba(14, 165, 233, 0.35)',
                  color: '#7dd3fc',
                  fontSize: '0.75rem',
                }}
              >
                Muon Space (Satellites)
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 32px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(10, 15, 26, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CwiLogo variant="mark" size={22} glow={false} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              © 2026 Climate & Wildfire Institute · 501(c)(3) Nonprofit
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              Close
            </button>
            <button
              onClick={() => {
                onFocusCwiEcosystem();
                onClose();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 18px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #f6ba13 0%, #eb7c26 100%)',
                color: '#0f172a',
                fontSize: '0.85rem',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(246, 186, 19, 0.3)',
              }}
            >
              <span>Explore CWI Ecosystem</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
