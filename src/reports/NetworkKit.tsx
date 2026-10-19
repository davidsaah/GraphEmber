/**
 * Shared pieces for the network-strength reports: the reading guide, the
 * side-by-side layer table, the convenor inputs panel and small SVG charts.
 */
import React, { useContext } from 'react';
import { ExplainContext } from './explain';
import { fmt } from './reportData';
import { convenorInputs, share, sign } from './network';
import type { ReportModel } from './reportData';

/** Explains network terms once, at the top of every network report. */
export const NetworkReadingGuide: React.FC = () => {
  const explain = useContext(ExplainContext);
  if (!explain) return null;
  return (
    <details className="rp-reading" open>
      <summary>How to read this report</summary>
      <dl>
        <div>
          <dt>Tie</dt>
          <dd>Two partners listed on the same CWI activity. It shows who was in the room or on the roster together, not who works together or trusts each other.</dd>
        </div>
        <div>
          <dt>Two layers</dt>
          <dd>
            <strong>Co-attended</strong> ties come from convenings; <strong>co-delivered</strong> ties come from programs and products. Every measure is shown for all activities
            and for delivery only, so you can see what holds together without CWI's events.
          </dd>
        </div>
        <div>
          <dt>Largest linked group</dt>
          <dd>The biggest set of partners who can all reach each other through ties. If it covers most partners, the network is one piece.</dd>
        </div>
        <div>
          <dt>Isolate</dt>
          <dd>A partner with no tie on that layer. In these records an isolate may simply be a partner whose other work is not recorded, so it is not a judgement on them.</dd>
        </div>
        <div>
          <dt>Density</dt>
          <dd>The share of all possible partner pairs that are tied. Large networks are naturally sparse, so compare it across layers and over time rather than to a target.</dd>
        </div>
        <div>
          <dt>Mixing (E-I index)</dt>
          <dd>From −1 (every tie within a sector) to +1 (every tie across sectors), compared with what random mixing would give for the same sector sizes.</dd>
        </div>
        <div>
          <dt>Brokerage</dt>
          <dd>How often a partner lies on the shortest route between two others. A network where a few partners carry most routes is fragile.</dd>
        </div>
        <div>
          <dt>Convenor inputs</dt>
          <dd>CWI's own effort, kept apart from the network measures because CWI is part of everything it runs and would otherwise look central by construction.</dd>
        </div>
      </dl>
    </details>
  );
};

export interface TwinRow {
  label: string;
  all: React.ReactNode;
  delivery: React.ReactNode;
  means: string;
  flag?: boolean; // the gap between layers is worth noticing
}

/** One measure per row, taken twice: with convenings and without. */
export const TwinTable: React.FC<{ rows: TwinRow[] }> = ({ rows }) => (
  <table className="rp-table rp-twin">
    <thead>
      <tr>
        <th>Measure</th>
        <th className="num">All activities</th>
        <th className="num">Delivery only</th>
        <th>What it means</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((r) => (
        <tr key={r.label} className={r.flag ? 'twin-flag' : undefined}>
          <td>{r.label}</td>
          <td className="num">{r.all}</td>
          <td className="num rp-twin-del">{r.delivery}</td>
          <td className="rp-muted">{r.means}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

/** CWI's effort in maintaining the network, framed as an input rather than a result. */
export const ConvenorInputs: React.FC<{ m: ReportModel }> = ({ m }) => {
  const c = convenorInputs(m);
  const items = [
    { v: c.programs, l: 'Programs and products run' },
    { v: c.convenings, l: 'Convenings held' },
    { v: c.partnersReached, l: 'Partners reached' },
    { v: c.listings, l: 'Partner listings recorded' },
    { v: c.conveningOnly, l: 'Partners reached only through convenings' },
  ];
  return (
    <div className="rp-inputs">
      {items.map((x) => (
        <div key={x.l}>
          <span className="rp-inputs-v">{fmt(x.v)}</span>
          <span className="rp-inputs-l">{x.l}</span>
        </div>
      ))}
    </div>
  );
};

// ---------- Charts ----------

export interface Series {
  name: string;
  values: number[];
  tone: 'gold' | 'ember' | 'slate' | 'ink';
  dashed?: boolean;
}

const TONE: Record<Series['tone'], string> = { gold: '#b7791f', ember: '#c2410c', slate: '#8a93a3', ink: '#1a2130' };

/** A line chart with x = 0..n-1 and y as a share from 0 to 1. */
export const LineChart: React.FC<{ series: Series[]; xLabel: string; yLabel: string }> = ({ series, xLabel, yLabel }) => {
  const W = 660,
    H = 260,
    L = 44,
    R = 180,
    T = 12,
    B = 36;
  const n = Math.max(...series.map((s) => s.values.length));
  const x = (i: number) => L + (i / (n - 1 || 1)) * (W - L - R);
  const y = (v: number) => T + (1 - v) * (H - T - B);
  const ends = series.map((s) => ({ s, y: y(s.values[s.values.length - 1]) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) ends[i].y = Math.max(ends[i].y, ends[i - 1].y + 13); // keep end labels apart
  return (
    <svg className="rp-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${yLabel} by ${xLabel}`}>
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="rp-grid" />
          <text x={L - 6} y={y(v) + 3} textAnchor="end" className="rp-axis">
            {share(v)}
          </text>
        </g>
      ))}
      {Array.from({ length: n }, (_, i) => i)
        .filter((i) => i % 5 === 0)
        .map((i) => (
          <text key={i} x={x(i)} y={H - B + 14} textAnchor="middle" className="rp-axis">
            {i}
          </text>
        ))}
      <text x={(L + W - R) / 2} y={H - 4} textAnchor="middle" className="rp-axis-title">
        {xLabel}
      </text>
      <text transform={`translate(11 ${(T + H - B) / 2}) rotate(-90)`} textAnchor="middle" className="rp-axis-title">
        {yLabel}
      </text>
      {series.map((s) => (
        <polyline
          key={s.name}
          fill="none"
          stroke={TONE[s.tone]}
          strokeWidth={2}
          strokeDasharray={s.dashed ? '5 4' : undefined}
          points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
        />
      ))}
      {ends.map(({ s, y: ly }) => (
        <text key={s.name} x={W - R + 8} y={ly + 3} className="rp-axis" fill={TONE[s.tone]}>
          {s.name}
        </text>
      ))}
    </svg>
  );
};

export interface Dot {
  id: string;
  label: string;
  x: number; // 0..1
  y: number; // 0..1
  size: number;
}

/** A labelled scatter of programs on two 0–1 measures, dot area by size. */
export const DotPlot: React.FC<{ dots: Dot[]; xLabel: string; yLabel: string; onPick?: (id: string) => void }> = ({ dots, xLabel, yLabel, onPick }) => {
  const W = 640,
    H = 320,
    L = 48,
    R = 20,
    T = 14,
    B = 40;
  const x = (v: number) => L + v * (W - L - R);
  const y = (v: number) => T + (1 - v) * (H - T - B);
  const max = Math.max(...dots.map((d) => d.size), 1);
  return (
    <svg className="rp-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${yLabel} against ${xLabel}`}>
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={v}>
          <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} className="rp-grid" />
          <line x1={x(v)} x2={x(v)} y1={T} y2={H - B} className="rp-grid" />
          <text x={L - 6} y={y(v) + 3} textAnchor="end" className="rp-axis">
            {share(v)}
          </text>
          <text x={x(v)} y={H - B + 14} textAnchor="middle" className="rp-axis">
            {v.toFixed(2)}
          </text>
        </g>
      ))}
      <text x={(L + W - R) / 2} y={H - 4} textAnchor="middle" className="rp-axis-title">
        {xLabel}
      </text>
      <text transform={`translate(12 ${(T + H - B) / 2}) rotate(-90)`} textAnchor="middle" className="rp-axis-title">
        {yLabel}
      </text>
      {(() => {
        // Place labels top to bottom, nudging any that would overlap one already placed on the same side
        const placed: { x0: number; x1: number; y: number }[] = [];
        const labelY = new Map<string, number>();
        for (const d of [...dots].sort((a, b) => b.y - a.y || a.x - b.x)) {
          const r = 4 + 14 * Math.sqrt(d.size / max);
          const right = x(d.x) > W - 200;
          const w = Math.min(d.label.length, 34) * 5.4;
          const x0 = right ? x(d.x) - r - 4 - w : x(d.x) + r + 4;
          let ly = y(d.y) + 3;
          while (placed.some((p) => p.x0 < x0 + w && x0 < p.x1 && Math.abs(p.y - ly) < 12)) ly += 12;
          placed.push({ x0, x1: x0 + w, y: ly });
          labelY.set(d.id, ly);
        }
        return [...dots]
          .sort((a, b) => b.size - a.size)
          .map((d) => {
            const r = 4 + 14 * Math.sqrt(d.size / max);
            const right = x(d.x) > W - 200;
            return (
              <g key={d.id} className={onPick ? 'rp-dot is-link' : 'rp-dot'} onClick={() => onPick?.(d.id)}>
                <title>{`${d.label}: ${d.size} partners`}</title>
                <circle cx={x(d.x)} cy={y(d.y)} r={r} />
                <text x={x(d.x) + (right ? -r - 4 : r + 4)} y={labelY.get(d.id)} textAnchor={right ? 'end' : 'start'} className="rp-dot-label">
                  {d.label.length > 34 ? `${d.label.slice(0, 32)}…` : d.label}
                </text>
              </g>
            );
          });
      })()}
    </svg>
  );
};

/** Where an observed value sits against the range random mixing would give. */
export const ChanceBand: React.FC<{ value: number; low: number; high: number; mean: number }> = ({ value, low, high, mean }) => {
  const W = 640,
    H = 54,
    L = 16,
    R = 16;
  // Zoom to 0..+1 when everything is positive, so the band is readable
  const lo = Math.min(value, low) >= 0 ? 0 : -1;
  const x = (v: number) => L + ((v - lo) / (1 - lo)) * (W - L - R);
  return (
    <svg className="rp-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Mixing index against chance">
      <line x1={x(lo)} x2={x(1)} y1={24} y2={24} className="rp-grid" />
      {(lo === 0 ? [0, 0.25, 0.5, 0.75, 1] : [-1, -0.5, 0, 0.5, 1]).map((v) => (
        <text key={v} x={x(v)} y={48} textAnchor="middle" className="rp-axis">
          {sign(v)}
        </text>
      ))}
      <rect x={x(low)} y={16} width={Math.max(2, x(high) - x(low))} height={16} fill="#e2ddd0" />
      <line x1={x(mean)} x2={x(mean)} y1={14} y2={34} stroke="#8a93a3" strokeWidth={1.5} />
      <circle cx={x(value)} cy={24} r={6} fill="#c2410c" />
      <text x={x(value)} y={10} textAnchor="middle" className="rp-axis" fill="#c2410c">
        observed {sign(value)}
      </text>
    </svg>
  );
};
