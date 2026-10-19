/**
 * Building blocks for forensic-style reports: numbered findings that cite
 * exhibits, exhibits that cite their source, a reconciliation schedule and
 * an exceptions register.
 */
import React, { useContext, useState } from 'react';
import { ExplainContext } from './explain';
import type { GraphNode } from '../types/graph';
import { fmt, type Exception, type ReconLine, type Severity } from './reportData';

export interface ReportNav {
  onSelectNode: (node: GraphNode) => void;
  onShowInNetwork: (ids: string[]) => void;
}

const PREPARED = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export const EntityLink: React.FC<{ node?: GraphNode; nav: ReportNav; children?: React.ReactNode }> = ({ node, nav, children }) =>
  node ? (
    <button className="rp-link" onClick={() => nav.onSelectNode(node)} title={`Open ${node.label}`}>
      {children ?? node.label}
    </button>
  ) : (
    <>{children}</>
  );

export const ExhibitRef: React.FC<{ id: string }> = ({ id }) => (
  <a className="rp-ref" href={`#exhibit-${id}`} onClick={(e) => {
    e.preventDefault();
    document.getElementById(`exhibit-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }}>
    Exhibit {id}
  </a>
);

export const Rows: React.FC<{ rows?: number[] }> = ({ rows }) => {
  if (!rows?.length) return <span className="rp-muted">–</span>;
  const shown = rows.slice(0, 4).join(', ');
  return <span className="rp-mono" title={`Sheet rows ${rows.join(', ')}`}>{rows.length > 4 ? `${shown} +${rows.length - 4}` : shown}</span>;
};

export const ReportHeader: React.FC<{
  code: string;
  title: string;
  audience: string;
  purpose: string;
  sources: string[];
  mandate: string;
}> = ({ code, title, audience, purpose, sources, mandate }) => (
  <header className="rp-header">
    <div className="rp-header-top">
      <span className="rp-eyebrow">Climate & Wildfire Institute · GraphEmber</span>
      <span className="rp-mono rp-muted">
        {code} · Prepared {PREPARED}
      </span>
    </div>
    <h1 className="rp-title">{title}</h1>
    <p className="rp-lede">{purpose}</p>
    <dl className="rp-meta">
      <div>
        <dt>Prepared for</dt>
        <dd>{audience}</dd>
      </div>
      <div>
        <dt>CWI mandate addressed</dt>
        <dd>{mandate}</dd>
      </div>
      <div>
        <dt>Sources</dt>
        <dd>{sources.join('; ')}</dd>
      </div>
    </dl>
  </header>
);

export const Kpis: React.FC<{ items: { value: React.ReactNode; label: string; exhibit?: string; hint?: string }[] }> = ({ items }) => {
  const explain = useContext(ExplainContext);
  return (
    <div className="rp-kpis">
      {items.map((k) => (
        <div className="rp-kpi" key={k.label} title={k.hint}>
          <div className="rp-kpi-value">{k.value}</div>
          <div className="rp-kpi-label">{k.label}</div>
          {explain && k.hint && <div className="rp-kpi-hint">{k.hint}</div>}
          {k.exhibit && <ExhibitRef id={k.exhibit} />}
        </div>
      ))}
    </div>
  );
};

/** A plain-language note: what an element shows, how to read it, and why it matters. */
export interface Guide {
  what: React.ReactNode;
  read?: React.ReactNode;
  why?: React.ReactNode;
}

export const GuideNote: React.FC<{ guide?: Guide }> = ({ guide }) => {
  const explain = useContext(ExplainContext);
  if (!explain || !guide) return null;
  return (
    <div className="rp-guide">
      <p>
        <strong>What it shows.</strong> {guide.what}
      </p>
      {guide.read && (
        <p>
          <strong>How to read it.</strong> {guide.read}
        </p>
      )}
      {guide.why && (
        <p>
          <strong>Why it matters.</strong> {guide.why}
        </p>
      )}
    </div>
  );
};

/** Explains the report's building blocks once, at the top of every report. */
export const ReadingGuide: React.FC = () => {
  const explain = useContext(ExplainContext);
  if (!explain) return null;
  return (
    <details className="rp-reading" open>
      <summary>How to read this report</summary>
      <dl>
        <div>
          <dt>Headline figures</dt>
          <dd>The numbers in the boxes below. Each one names the exhibit that proves it.</dd>
        </div>
        <div>
          <dt>Findings (F1, F2…)</dt>
          <dd>Short conclusions in plain words. Each ends with "Evidence", linking to the exhibits that support it, so no finding stands on its own say-so.</dd>
        </div>
        <div>
          <dt>Exhibits (A, B…)</dt>
          <dd>The tables behind the findings. Each says what source it comes from. Click any name to open its details, or "Show in network" to see those entities on the graph.</dd>
        </div>
        <div>
          <dt>Sheet rows</dt>
          <dd>Row numbers in the CWI Projects and Collaborators spreadsheet, so anyone can check a figure against the original.</dd>
        </div>
        <div>
          <dt>Reconciliation</dt>
          <dd>A check, as an auditor would do, that every row in the spreadsheet is accounted for in the graph and nothing was lost or double counted.</dd>
        </div>
        <div>
          <dt>Exceptions register</dt>
          <dd>
            A numbered list (X-01…) of problems found in the records, from High (could change a headline figure) to Info (cosmetic), each with a suggested fix.
          </dd>
        </div>
        <div>
          <dt>Concentration (HHI)</dt>
          <dd>
            A standard measure, borrowed from finance, of whether activity is spread out or dependent on a few. It runs from 0 to 10,000: under 1,500 is spread out, over 2,500
            is concentrated.
          </dd>
        </div>
      </dl>
    </details>
  );
};

export const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="rp-section">
    <h2 className="rp-h2">{title}</h2>
    {children}
  </section>
);

export const Finding: React.FC<{ n: number; title: string; evidence: string[]; children: React.ReactNode }> = ({ n, title, evidence, children }) => (
  <div className="rp-finding">
    <div className="rp-finding-n">F{n}</div>
    <div>
      <h3 className="rp-finding-title">{title}</h3>
      <div className="rp-finding-body">{children}</div>
      <div className="rp-evidence">
        Evidence:{' '}
        {evidence.map((id, i) => (
          <React.Fragment key={id}>
            {i > 0 && ', '}
            <ExhibitRef id={id} />
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

export const Exhibit: React.FC<{
  id: string;
  title: string;
  source: string;
  ids?: string[];
  nav: ReportNav;
  guide?: Guide;
  children: React.ReactNode;
}> = ({ id, title, source, ids, nav, guide, children }) => (
  <figure className="rp-exhibit" id={`exhibit-${id}`}>
    <figcaption className="rp-exhibit-head">
      <span className="rp-exhibit-id">Exhibit {id}</span>
      <span className="rp-exhibit-title">{title}</span>
      {ids && ids.length > 0 && (
        <button className="rp-action no-print" onClick={() => nav.onShowInNetwork(ids)}>
          Show in network
        </button>
      )}
    </figcaption>
    <GuideNote guide={guide} />
    <div className="rp-exhibit-body">{children}</div>
    <div className="rp-source">Source: {source}</div>
  </figure>
);

export const Bar: React.FC<{ value: number; max: number; tone?: 'gold' | 'ember' | 'slate' }> = ({ value, max, tone = 'gold' }) => (
  <span className="rp-bar">
    <span className={`rp-bar-fill tone-${tone}`} style={{ width: `${max ? Math.max(2, (value / max) * 100) : 0}%` }} />
  </span>
);

export const ReconTable: React.FC<{ lines: ReconLine[] }> = ({ lines }) => (
  <table className="rp-table rp-recon">
    <tbody>
      {lines.map((l) => (
        <tr key={l.label} className={l.kind ? `recon-${l.kind}` : undefined}>
          <td>{l.label}</td>
          <td className="num">
            {l.kind === 'check' ? (
              l.value === 0 ? <span className="rp-ok">Reconciled</span> : <span className="rp-bad">Difference {fmt(l.value)}</span>
            ) : l.kind === 'less' ? (
              l.value === 0 ? '–' : `(${fmt(Math.abs(l.value))})`
            ) : (
              fmt(l.value)
            )}
          </td>
          <td className="rp-muted">{l.note}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const SEV_ORDER: Severity[] = ['High', 'Medium', 'Low', 'Info'];

export const ExceptionsRegister: React.FC<{ items: Exception[]; nav: ReportNav }> = ({ items, nav }) => {
  const [showInfo, setShowInfo] = useState(false);
  const counts = SEV_ORDER.map((s) => [s, items.filter((x) => x.severity === s).length] as const);
  const visible = showInfo ? items : items.filter((x) => x.severity !== 'Info');
  return (
    <>
      <div className="rp-sevs">
        {counts.map(([s, c]) => (
          <span key={s} className={`rp-sev sev-${s.toLowerCase()}`}>
            {s} <strong>{c}</strong>
          </span>
        ))}
        {counts[3][1] > 0 && (
          <button className="rp-action no-print" onClick={() => setShowInfo((v) => !v)}>
            {showInfo ? 'Hide' : 'Show'} information items
          </button>
        )}
      </div>
      <table className="rp-table">
        <thead>
          <tr>
            <th style={{ width: 52 }}>Ref</th>
            <th style={{ width: 70 }}>Severity</th>
            <th style={{ width: 150 }}>Category</th>
            <th>Detail</th>
            <th style={{ width: 80 }}>Sheet rows</th>
            <th style={{ width: 170 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((x) => (
            <tr key={x.ref}>
              <td className="rp-mono">{x.ref}</td>
              <td>
                <span className={`rp-sev sev-${x.severity.toLowerCase()}`}>{x.severity}</span>
              </td>
              <td>{x.category}</td>
              <td>
                <EntityLink node={x.node} nav={nav}>
                  {x.detail}
                </EntityLink>
              </td>
              <td>
                <Rows rows={x.rows} />
              </td>
              <td className="rp-muted">{x.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export const Basis: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Section title="Basis of preparation and limitations">
    <div className="rp-basis">{children}</div>
  </Section>
);
