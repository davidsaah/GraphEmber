import React from 'react';
import { X, ExternalLink, ArrowRight } from 'lucide-react';
import type { GraphNode } from '../types/graph';
import { LEVEL_COLORS } from './ImpactTimeline';

interface AicwAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFocusAicw: () => void;
  nodes: GraphNode[];
}

const WORKSTREAMS = [
  { id: 'aicw-ws1', name: 'WS1 Earth observation', color: '#FFE066' },
  { id: 'aicw-ws2', name: 'WS2 Fuels, weather and fire behaviour', color: '#CBE2AF' },
  { id: 'aicw-ws3', name: 'WS3 Decision support and adoption', color: '#F8CBA0' },
  { id: 'aicw-ws4', name: 'WS4 Ecosystem and financing', color: '#C3D3DC' },
];

const SCALE: [keyof typeof LEVEL_COLORS, string][] = [
  ['none', 'Nothing exists yet.'],
  ['planned', 'In a workplan, not built or used.'],
  ['emerging', 'Built or in use by early adopters.'],
  ['live', 'Operating and used by decision makers.'],
];

export const AicwAboutModal: React.FC<AicwAboutModalProps> = ({ isOpen, onClose, onFocusAicw, nodes }) => {
  if (!isOpen) return null;
  const members = nodes.filter((n) => n.tags?.some((t) => t.startsWith('AIC:W tier'))).length;
  const projects = nodes.filter((n) => n.tags?.includes('Rated project')).length;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{ width: 'min(620px, 100%)', maxHeight: '90vh', overflowY: 'auto', borderRadius: 'var(--radius-lg)', padding: 24, border: '1px solid rgba(255,159,64,0.35)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <img src={`${import.meta.env.BASE_URL}aicw-logo.png`} alt="AI Collaborative: Wildfires" style={{ height: 56 }} />
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>with support from Google.org</div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginTop: 18, color: '#202124', textTransform: 'uppercase', letterSpacing: '0.04em', borderLeft: '3px solid #FF9F40', paddingLeft: 8 }}>North Star</h2>
        <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
          More good fire, less bad fire: shift acreage to beneficial fire and reduce catastrophic wildfire damage (as adjusted at Tahoe, May 2026).
        </p>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginTop: 18, color: '#202124', textTransform: 'uppercase', letterSpacing: '0.04em', borderLeft: '3px solid #FF9F40', paddingLeft: 8 }}>Workstreams</h2>
        <div style={{ display: 'grid', gap: 6 }}>
          {WORKSTREAMS.map((w) => (
            <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: w.color }} />
              {w.name}
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginTop: 18, color: '#202124', textTransform: 'uppercase', letterSpacing: '0.04em', borderLeft: '3px solid #FF9F40', paddingLeft: 8 }}>How impact is rated</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Each project is rated on Capability, Used and Collaboration; the six linkages between workstreams are rated too. Ratings are PMO drafts at
          Mar 2025, May 2026 and Oct 2026, corrected by each group on 3 Nov 2026. Pick a date in "Impact over time" to see the network and ratings then.
        </p>
        <div style={{ display: 'grid', gap: 4, marginTop: 6 }}>
          {SCALE.map(([lvl, text]) => (
            <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: 10, background: LEVEL_COLORS[lvl] }} />
              <strong style={{ width: 70 }}>{lvl}</strong>
              <span style={{ color: 'var(--text-secondary)' }}>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              onFocusAicw();
              onClose();
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 'var(--radius-full)', background: '#FF9F40', color: '#202124', border: 'none', fontWeight: 700, fontSize: '0.8rem' }}
          >
            Highlight the AIC:W core ({members} organisations, {projects} rated projects) <ArrowRight size={14} />
          </button>
          <a
            href="https://aicw.wildfirecommons.org/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontSize: '0.8rem', textDecoration: 'none' }}
          >
            aicw.wildfirecommons.org <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};
