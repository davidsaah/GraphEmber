import React from 'react';
import type { ImpactLevel } from '../types/graph';

// Rating dates for the AIC:W impact framework; 'all' shows every dated node with the latest ratings
export const PERIODS = [
  { key: 'all', label: 'All time', cutoff: '9999-12-31' },
  { key: '2025-03', label: 'Mar 2025 · launch', cutoff: '2025-03-31' },
  { key: '2026-05', label: 'May 2026 · Tahoe', cutoff: '2026-05-31' },
  { key: '2026-10', label: 'Oct 2026 · now', cutoff: '2026-10-31' },
] as const;

export type PeriodKey = (typeof PERIODS)[number]['key'];

export const LEVEL_COLORS: Record<ImpactLevel, string> = {
  none: '#5F6368',
  planned: '#FFE8A5',
  emerging: '#FF9F40',
  live: '#34d399',
};

export const IMPACT_INDICATORS = ['capability', 'used', 'collaboration'] as const;

interface ImpactTimelineProps {
  period: PeriodKey;
  onChange: (p: PeriodKey) => void;
  shownCount: number;
  liveCells: number;
  ratedCells: number;
}

export const ImpactTimeline: React.FC<ImpactTimelineProps> = ({ period, onChange, shownCount, liveCells, ratedCells }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 20,
      left: 20,
      zIndex: 25,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 14px',
      borderRadius: 'var(--radius-lg)',
      background: 'rgba(13, 19, 34, 0.9)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 159, 64, 0.35)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
      flexWrap: 'wrap',
      maxWidth: 'calc(100vw - 40px)',
    }}
  >
    <img src="/aicw-flame.svg" alt="" style={{ height: 22, width: 'auto' }} />
    <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FFBE5F' }}>
      Impact over time
    </span>
    <div style={{ display: 'flex', gap: 4 }}>
      {PERIODS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            border: `1px solid ${period === p.key ? '#FF9F40' : 'var(--border-subtle)'}`,
            background: period === p.key ? 'rgba(255, 159, 64, 0.22)' : 'transparent',
            color: period === p.key ? '#FFE8A5' : 'var(--text-secondary)',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
      {shownCount} shown · <strong style={{ color: LEVEL_COLORS.live }}>{liveCells}</strong> of {ratedCells} project ratings live
    </span>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {(Object.keys(LEVEL_COLORS) as ImpactLevel[]).map((lvl) => (
        <span key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
          <span style={{ width: 9, height: 9, borderRadius: 9, background: LEVEL_COLORS[lvl] }} />
          {lvl}
        </span>
      ))}
      <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>ring: capability · used · collaboration</span>
    </div>
  </div>
);
