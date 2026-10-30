import React, { useEffect, useMemo, useState } from 'react';
import { Play, Pause, BarChart3, ChevronDown } from 'lucide-react';
import type { ImpactLevel } from '../types/graph';

// Rating dates of the AIC:W impact framework. Between them, the latest earlier rating applies.
export const RATING_DATES = [
  { key: '2025-03', label: 'Launch' },
  { key: '2026-05', label: 'Tahoe' },
  { key: '2026-10', label: 'Now' },
] as const;

export const LEVEL_COLORS: Record<ImpactLevel, string> = {
  none: '#DADDE2',
  planned: '#FFBE5F',
  emerging: '#FFBE5F',
  live: '#FF9F40',
};

export const IMPACT_INDICATORS = ['capability', 'used', 'collaboration'] as const;

export const ALL_TIME = 'all';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const monthLabel = (m: string) => (m === ALL_TIME ? 'All time' : `${MONTH_NAMES[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`);

export function monthRange(first: string, last: string): string[] {
  const out: string[] = [];
  let y = Number(first.slice(0, 4));
  let m = Number(first.slice(5, 7));
  const end = last.slice(0, 7);
  for (;;) {
    const key = `${y}-${String(m).padStart(2, '0')}`;
    out.push(key);
    if (key >= end) break;
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

// The rating that applies at a month: the latest rating date on or before it
export function ratingKeyAt(month: string, keys: string[]): string | undefined {
  const sorted = [...keys].sort();
  if (month === ALL_TIME) return sorted[sorted.length - 1];
  return sorted.filter((k) => k <= month).pop();
}

export interface TimePoint {
  month: string;
  organisations: number;
  links: number;
  live: number;
  rated: number;
}

interface ImpactTimelineProps {
  months: string[];
  month: string;
  onChange: (m: string) => void;
  series: TimePoint[];
  shownCount: number;
  newCount: number;
  highlightNew: boolean;
  onToggleHighlightNew: () => void;
}

const SERIES = [
  { key: 'organisations', label: 'Organisations', color: '#5F6368' },
  { key: 'links', label: 'Dated links', color: '#C0D1D8' },
  { key: 'live', label: 'Live project ratings', color: '#FF9F40' },
] as const;

const Chart: React.FC<{ series: TimePoint[]; month: string }> = ({ series, month }) => {
  const W = 560;
  const H = 150;
  const pad = { l: 34, r: 12, t: 10, b: 22 };
  const n = series.length;
  const x = (i: number) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(n - 1, 1);
  const cursor = month === ALL_TIME ? n - 1 : series.findIndex((p) => p.month === month);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H * 2 + 16}`} style={{ display: 'block' }}>
      {[
        { keys: ['organisations', 'links'] as const, top: 0, title: 'NETWORK SIZE' },
        { keys: ['live'] as const, top: H + 16, title: 'LIVE PROJECT RATINGS (OF 63 AT FULL MEMBERSHIP)' },
      ].map((panel) => {
        const max = Math.max(1, ...series.flatMap((p) => panel.keys.map((k) => p[k])));
        const y = (v: number) => panel.top + pad.t + (1 - v / max) * (H - pad.t - pad.b);
        return (
          <g key={panel.title}>
            <text x={pad.l} y={panel.top + 8} fontSize={9} fontFamily="Antonio, sans-serif" fontWeight={700} fill="#5F6368" letterSpacing="0.06em">
              {panel.title}
            </text>
            {[0, 0.5, 1].map((f) => (
              <g key={f}>
                <line x1={pad.l} x2={W - pad.r} y1={y(max * f)} y2={y(max * f)} stroke="#EDEBE6" />
                <text x={pad.l - 6} y={y(max * f) + 3} fontSize={9} textAnchor="end" fill="#80868B">
                  {Math.round(max * f)}
                </text>
              </g>
            ))}
            {panel.keys.map((k) => {
              const s = SERIES.find((x) => x.key === k)!;
              const d = series.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join('');
              return <path key={k} d={d} fill="none" stroke={s.color} strokeWidth={k === 'live' ? 2.25 : 1.75} />;
            })}
            {cursor >= 0 &&
              panel.keys.map((k) => (
                <circle key={k} cx={x(cursor)} cy={y(series[cursor][k])} r={3} fill="#FFFFFF" stroke={SERIES.find((s) => s.key === k)!.color} strokeWidth={1.75} />
              ))}
          </g>
        );
      })}
      {cursor >= 0 && <line x1={x(cursor)} x2={x(cursor)} y1={4} y2={H * 2 + 10} stroke="#202124" strokeWidth={0.75} strokeDasharray="2 2" />}
      {series.map((p, i) =>
        p.month.endsWith('-01') || i === 0 || i === n - 1 ? (
          <text key={p.month} x={x(i)} y={H * 2 + 14} fontSize={9} textAnchor="middle" fill="#80868B">
            {monthLabel(p.month)}
          </text>
        ) : null
      )}
      {RATING_DATES.map((r) => {
        const i = series.findIndex((p) => p.month === r.key);
        return i < 0 ? null : (
          <g key={r.key}>
            <line x1={x(i)} x2={x(i)} y1={H + 22} y2={H * 2 - 6} stroke="#FFBE5F" strokeWidth={1} />
            <text x={x(i) + 3} y={H + 30} fontSize={8.5} fill="#B85C00" fontFamily="Antonio, sans-serif">
              {r.label.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export const ImpactTimeline: React.FC<ImpactTimelineProps> = ({
  months,
  month,
  onChange,
  series,
  shownCount,
  newCount,
  highlightNew,
  onToggleHighlightNew,
}) => {
  const [playing, setPlaying] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const index = month === ALL_TIME ? months.length - 1 : months.indexOf(month);
  const point = series.find((p) => p.month === month) || series[series.length - 1];

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      const next = index + 1;
      if (next >= months.length) {
        setPlaying(false);
        return;
      }
      onChange(months[next]);
    }, 700);
    return () => window.clearInterval(id);
  }, [playing, index, months, onChange]);

  const ratingLabel = useMemo(() => {
    const k = ratingKeyAt(month, RATING_DATES.map((r) => r.key));
    const r = RATING_DATES.find((x) => x.key === k);
    return r ? `${r.label} ratings (${monthLabel(r.key)})` : 'No ratings yet';
  }, [month]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 40,
        left: 16,
        zIndex: 25,
        width: 'min(640px, calc(100vw - 32px))',
        background: '#FFFFFF',
        border: '1px solid #E6E2DA',
        borderTop: '3px solid #FF9F40',
        borderRadius: 6,
        boxShadow: 'var(--shadow-md)',
        padding: '10px 14px 12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', color: '#5F6368' }}>
          TIME · NODES AND LINKS AS OF
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: '#202124' }}>{monthLabel(month)}</span>
        <span style={{ fontSize: '0.72rem', color: '#5F6368' }}>{ratingLabel}</span>
        <button
          onClick={() => setShowChart((v) => !v)}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#202124', border: '1px solid #E6E2DA', borderRadius: 4, padding: '3px 8px' }}
        >
          <BarChart3 size={13} /> Trend <ChevronDown size={12} style={{ transform: showChart ? 'rotate(180deg)' : undefined }} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <button
          onClick={() => {
            if (!playing && index >= months.length - 1) onChange(months[0]);
            setPlaying((p) => !p);
          }}
          title={playing ? 'Pause' : 'Play month by month'}
          style={{ width: 28, height: 28, borderRadius: 14, background: '#202124', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          {playing ? <Pause size={13} /> : <Play size={13} style={{ marginLeft: 2 }} />}
        </button>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="range"
            min={0}
            max={months.length - 1}
            value={index}
            onChange={(e) => {
              setPlaying(false);
              onChange(months[Number(e.target.value)]);
            }}
            style={{ width: '100%', accentColor: '#FF9F40' }}
            aria-label="Month"
          />
          <div style={{ position: 'relative', height: 14 }}>
            {RATING_DATES.map((r) => {
              const i = months.indexOf(r.key);
              if (i < 0) return null;
              return (
                <button
                  key={r.key}
                  onClick={() => {
                    setPlaying(false);
                    onChange(r.key);
                  }}
                  style={{
                    position: 'absolute',
                    left: `calc(${(i / (months.length - 1)) * 100}% - 30px)`,
                    width: 60,
                    whiteSpace: 'nowrap',
                    fontFamily: 'var(--font-label)',
                    fontSize: '0.62rem',
                    letterSpacing: '0.05em',
                    color: month === r.key ? '#B85C00' : '#80868B',
                  }}
                >
                  ▲ {r.label.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => {
            setPlaying(false);
            onChange(ALL_TIME);
          }}
          style={{
            fontSize: '0.72rem',
            padding: '4px 9px',
            borderRadius: 4,
            border: `1px solid ${month === ALL_TIME ? '#FF9F40' : '#E6E2DA'}`,
            background: month === ALL_TIME ? '#FFF4E2' : '#FFFFFF',
            color: '#202124',
            flexShrink: 0,
          }}
        >
          All time
        </button>
      </div>

      <div style={{ display: 'flex', gap: 18, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          ['Shown', shownCount],
          ['Organisations', point?.organisations ?? 0],
          ['Dated links', point?.links ?? 0],
          ['Live ratings', `${point?.live ?? 0} / ${point?.rated ?? 0}`],
        ].map(([k, v]) => (
          <div key={k as string}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: k === 'Live ratings' ? '#B85C00' : '#202124' }}>{v}</div>
            <div style={{ fontSize: '0.62rem', color: '#80868B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
          </div>
        ))}
        <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#202124', cursor: 'pointer' }}>
          <input type="checkbox" checked={highlightNew} onChange={onToggleHighlightNew} style={{ accentColor: '#FF9F40' }} />
          Outline what is new in the 3 months to this date ({newCount})
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid #EDEBE6', paddingTop: 6 }}>
        <span style={{ fontSize: '0.62rem', color: '#80868B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project ring · capability, used, collaboration</span>
        {(
          [
            ['none', '#DADDE2', false],
            ['planned', '#FFBE5F', true],
            ['emerging', '#FFBE5F', false],
            ['live', '#FF9F40', false],
          ] as const
        ).map(([lvl, c, dashed]) => (
          <span key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.68rem', color: '#5F6368' }}>
            <svg width={18} height={6}>
              <line x1={1} x2={17} y1={3} y2={3} stroke={c} strokeWidth={lvl === 'live' ? 4 : 3} strokeDasharray={dashed ? '3 2' : undefined} />
            </svg>
            {lvl}
          </span>
        ))}
      </div>

      {showChart && (
        <div style={{ marginTop: 10, borderTop: '1px solid #EDEBE6', paddingTop: 8 }}>
          <div style={{ display: 'flex', gap: 14, marginBottom: 4 }}>
            {SERIES.map((s) => (
              <span key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', color: '#5F6368' }}>
                <span style={{ width: 14, height: 2.5, background: s.color, display: 'inline-block' }} />
                {s.label}
              </span>
            ))}
          </div>
          <Chart series={series} month={month} />
          <div style={{ fontSize: '0.64rem', color: '#80868B', marginTop: 4 }}>
            Organisations count dated memberships; about 15 join dates are unknown and are placed at Oct 2026. Ratings are PMO drafts, corrected on 3 Nov 2026.
          </div>
        </div>
      )}
    </div>
  );
};
