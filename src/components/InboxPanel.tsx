import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Globe, Check, Pencil, Undo2, ExternalLink, Loader2, ShieldCheck, Ban, History, Inbox as InboxIcon, GitMerge } from 'lucide-react';
import type { GraphEdge, GraphNode } from '../types/graph';
import type { DecisionInput, Proposal, ProposalSource, ResearchRun, ReviewQueue } from '../research/types';
import { describeResearchError, runResearch } from '../research/api';
import { LIMITS, canApprove } from '../../server/researchPolicy.mjs';
import { useCuration } from '../curation/CurationContext';
import type { DuplicateCandidate } from '../curation/findDuplicates';
import { DuplicatesList } from './DuplicatesList';
import '../research/inbox.css';

type Tab = 'pending' | 'approved' | 'rejected' | 'activity' | 'duplicates';

interface InboxPanelProps {
  isOpen: boolean;
  onClose: () => void;
  queue: ReviewQueue | null;
  available: boolean;
  // Entities picked for research (the selection or the highlighted set); empty for review only
  scope: GraphNode[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  onResearched: (run: ResearchRun, proposals: Proposal[]) => void;
  onDecide: (input: DecisionInput) => Promise<void>;
  onSelectNode: (node: GraphNode) => void;
  // Entities that may be the same, for a person to merge or dismiss
  duplicates: DuplicateCandidate[];
  // Set when something asks the Inbox to open on a given tab
  requestedTab: { tab: 'pending' | 'duplicates' } | null;
}

const KIND_LABEL: Record<Proposal['kind'], string> = {
  connection: 'New connection',
  entity: 'New entity',
  update: 'Update',
  impact: 'Impact',
};

const FLAG_LABEL: Record<string, string> = {
  unverified: 'Quote not found on the page',
  'weak-sources-only': 'Weak sources only',
  'needs-corroboration': 'Needs a second source',
  'possibly-out-of-date': 'May be out of date',
};

const VERIFY_LABEL: Record<ProposalSource['verification'], string> = {
  verified: 'Quote found on page',
  partial: 'Quote partly found',
  missing: 'Quote not found',
  pdf: 'PDF: check by hand',
  unreachable: 'Page unreachable',
};

const relationText = (r?: string) => (r || '').replace(/_/g, ' ').toLowerCase();
const when = (iso?: string) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '');

export const InboxPanel: React.FC<InboxPanelProps> = ({
  isOpen,
  onClose,
  queue,
  available,
  scope,
  nodes,
  edges,
  onResearched,
  onDecide,
  onSelectNode,
  duplicates,
  requestedTab,
}) => {
  const [tab, setTab] = useState<Tab>(available ? 'pending' : 'duplicates');
  const curation = useCuration();
  const reviewer = curation?.reviewer || '';
  const [withNeighbours, setWithNeighbours] = useState(false);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState('');
  const [lastRun, setLastRun] = useState<ResearchRun | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // A new research scope starts a fresh run panel
  const [seenScope, setSeenScope] = useState(scope);
  if (scope !== seenScope) {
    setSeenScope(scope);
    setLastRun(null);
    setRunError('');
    if (scope.length) setTab('pending');
  }
  const [seenRequest, setSeenRequest] = useState(requestedTab);
  if (requestedTab !== seenRequest) {
    setSeenRequest(requestedTab);
    if (requestedTab) setTab(requestedTab.tab);
  }

  useEffect(() => () => abortRef.current?.abort(), []);

  // A single selected entity can bring its direct connections along, up to the per-run cap.
  const targets = useMemo(() => {
    if (!(withNeighbours && scope.length === 1)) return scope.slice(0, LIMITS.maxTargets);
    const id = scope[0].id;
    const ids = new Set<string>([id]);
    for (const e of edges) {
      const s = typeof e.source === 'object' ? e.source.id : e.source;
      const t = typeof e.target === 'object' ? e.target.id : e.target;
      if (s === id) ids.add(t);
      if (t === id) ids.add(s);
    }
    return [...ids].map((x) => byId.get(x)).filter((n): n is GraphNode => !!n && n.type !== 'topic').slice(0, LIMITS.maxTargets);
  }, [scope, withNeighbours, edges, byId]);
  const capped = scope.length > LIMITS.maxTargets;

  const start = async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setRunError('');
    setLastRun(null);
    try {
      const { run, proposals } = await runResearch(targets, nodes, edges, controller.signal);
      setLastRun(run);
      onResearched(run, proposals);
    } catch (e) {
      if (!controller.signal.aborted) setRunError(describeResearchError(e));
    } finally {
      setRunning(false);
    }
  };

  if (!isOpen) return null;

  const proposals = queue?.proposals || [];
  const lists = {
    pending: proposals.filter((p) => p.status === 'pending'),
    approved: proposals.filter((p) => p.status === 'approved').reverse(),
    rejected: proposals.filter((p) => p.status === 'rejected').reverse(),
  };
  const shown = tab === 'activity' || tab === 'duplicates' ? [] : lists[tab];
  // Strongest findings first
  const rank = { high: 0, medium: 1, low: 2 };
  if (tab === 'pending') shown.sort((a, b) => rank[a.confidence] - rank[b.confidence]);

  return (
    <aside className="glass-panel inbox" aria-label="Research inbox">
      <div className="inbox-head">
        <div>
          <span className="eyebrow">Review</span>
          <h2>Inbox</h2>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close inbox">
          <X size={16} />
        </button>
      </div>

      {!available && tab !== 'duplicates' && (
        <p className="inbox-note">
          Web research and review need the GraphEmber server. Run <code>npm run dev</code> (or <code>npm start</code>) with <code>ANTHROPIC_API_KEY</code> set.
        </p>
      )}

      {available && scope.length > 0 && (
        <section className="inbox-research">
          <div className="inbox-research-title">
            <Globe size={15} />
            <strong>
              Research {targets.length} {targets.length === 1 ? 'entity' : 'entities'} on the web
            </strong>
          </div>
          <p className="inbox-targets">{targets.map((t) => t.label).join(', ')}</p>
          {capped && <p className="inbox-muted">Only the first {LIMITS.maxTargets} are researched in one run.</p>}
          {scope.length === 1 && (
            <label className="inbox-check">
              <input type="checkbox" checked={withNeighbours} onChange={(e) => setWithNeighbours(e.target.checked)} disabled={running} />
              Include its direct connections (up to {LIMITS.maxTargets} in total)
            </label>
          )}
          <p className="inbox-muted">
            <ShieldCheck size={12} /> Only names and websites are searched. Every finding needs a source and waits here for your approval.
          </p>
          <div className="inbox-row">
            {running ? (
              <>
                <span className="inbox-running">
                  <Loader2 size={14} className="spin" /> Searching and checking sources…
                </span>
                <button className="btn" onClick={() => abortRef.current?.abort()}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={start} disabled={!targets.length}>
                <Globe size={14} /> Start research
              </button>
            )}
          </div>
          {runError && <p className="inbox-error">{runError}</p>}
          {lastRun && <RunSummary run={lastRun} />}
        </section>
      )}

      <label className="inbox-reviewer">
        Reviewing as
        <input value={reviewer} onChange={(e) => curation?.setReviewer(e.target.value)} placeholder="Your name" maxLength={80} />
      </label>

      <div className="segmented inbox-tabs" role="tablist">
        {(['pending', 'approved', 'rejected'] as const).map((t) => (
          <button key={t} role="tab" aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t === 'pending' ? 'To review' : t === 'approved' ? 'Approved' : 'Rejected'} <span className="count">{lists[t].length}</span>
          </button>
        ))}
        <button role="tab" aria-pressed={tab === 'duplicates'} onClick={() => setTab('duplicates')} title="Entities that may be the same">
          <GitMerge size={13} /> <span className="count">{duplicates.length}</span>
        </button>
        <button role="tab" aria-pressed={tab === 'activity'} onClick={() => setTab('activity')} title="Research runs and searches made">
          <History size={13} />
        </button>
      </div>

      {tab === 'duplicates' ? (
        <DuplicatesList duplicates={duplicates} edges={edges} onSelectNode={onSelectNode} />
      ) : (
        available && (
          <div className="inbox-list">
            {tab === 'activity' ? (
              (queue?.runs || []).length ? (
                queue!.runs.map((r) => <RunSummary key={r.id} run={r} detailed />)
              ) : (
                <Empty text="No research has been run yet." />
              )
            ) : shown.length ? (
              shown.map((p) => <ProposalCard key={p.id} proposal={p} byId={byId} reviewer={reviewer} onDecide={onDecide} onSelectNode={onSelectNode} />)
            ) : (
              <Empty
                text={
                  tab === 'pending'
                    ? 'Nothing to review. Select an entity on the graph and choose Research to look for new learnings.'
                    : `No ${tab} findings yet.`
                }
              />
            )}
          </div>
        )
      )}
    </aside>
  );
};

const Empty: React.FC<{ text: string }> = ({ text }) => (
  <div className="inbox-empty">
    <InboxIcon size={20} />
    <p>{text}</p>
  </div>
);

const RunSummary: React.FC<{ run: ResearchRun; detailed?: boolean }> = ({ run, detailed }) => (
  <div className="inbox-run">
    <div>
      <strong>
        {run.found} new {run.found === 1 ? 'finding' : 'findings'}
      </strong>
      {run.dropped.length > 0 && <span> · {run.dropped.length} left out by the safeguards</span>}
      {run.refused && <span> · Claude declined this search</span>}
      {run.incomplete && <span> · stopped before finishing</span>}
    </div>
    {detailed && (
      <div className="inbox-muted">
        {when(run.at)} · {run.targets.map((t) => t.name).join(', ')}
      </div>
    )}
    {(detailed || run.dropped.length > 0) && (
      <details>
        <summary>What was searched and left out</summary>
        {run.queries.length > 0 && (
          <ul>
            {run.queries.map((q, i) => (
              <li key={i}>
                <code>{q}</code>
              </li>
            ))}
          </ul>
        )}
        {run.dropped.length > 0 && (
          <ul>
            {run.dropped.map((d, i) => (
              <li key={i}>
                {d.summary} <em>({d.reason})</em>
              </li>
            ))}
          </ul>
        )}
      </details>
    )}
  </div>
);

interface CardProps {
  proposal: Proposal;
  byId: Map<string, GraphNode>;
  reviewer: string;
  onDecide: (input: DecisionInput) => Promise<void>;
  onSelectNode: (node: GraphNode) => void;
}

const ProposalCard: React.FC<CardProps> = ({ proposal: p, byId, reviewer, onDecide, onSelectNode }) => {
  const [mode, setMode] = useState<'view' | 'edit' | 'reject'>('view');
  const [summary, setSummary] = useState(p.summary);
  const [how, setHow] = useState(p.how || '');
  const [value, setValue] = useState(p.value || '');
  const [reason, setReason] = useState('');
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const subject = byId.get(p.subjectId);
  const target = p.targetId ? byId.get(p.targetId) : undefined;
  const approvable = canApprove(p, checked);
  const needsName = !reviewer.trim();

  const act = async (input: Omit<DecisionInput, 'id' | 'reviewer'>) => {
    setBusy(true);
    setError('');
    try {
      await onDecide({ id: p.id, reviewer: reviewer.trim(), ...input });
      setMode('view');
    } catch (e) {
      setError(describeResearchError(e));
    } finally {
      setBusy(false);
    }
  };

  const approve = () => {
    const edits = mode === 'edit' ? { summary, how: how || undefined, value: value || undefined } : undefined;
    void act({ decision: 'approve', edits, override: !canApprove(p) && checked });
  };

  const entity = (node: GraphNode | undefined, fallback: string) =>
    node ? (
      <button className="inbox-link" onClick={() => onSelectNode(node)}>
        {node.label}
      </button>
    ) : (
      <strong>{fallback}</strong>
    );

  const [left, right] =
    p.direction === 'target_to_subject'
      ? [entity(target, p.targetName || '?'), entity(subject, p.subjectId)]
      : [entity(subject, p.subjectId), entity(target, p.targetName || '?')];

  return (
    <article className={`inbox-card conf-${p.confidence}`}>
      <div className="inbox-card-top">
        <span className="inbox-kind">{KIND_LABEL[p.kind]}</span>
        <span className={`inbox-conf conf-${p.confidence}`} title="Set by the source checks, not by Claude">
          {p.confidence} confidence
        </span>
        {p.date && <span className="inbox-muted">{p.date}</span>}
      </div>

      {mode === 'edit' ? (
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} aria-label="Summary" />
      ) : (
        <p className="inbox-summary">{p.summary}</p>
      )}

      <div className="inbox-fact">
        {(p.kind === 'connection' || p.kind === 'entity') && (
          <>
            {left} <span className="inbox-rel">{relationText(p.relation)}</span> {right}
            {p.kind === 'entity' && <span className="inbox-new"> new {p.targetType}</span>}
            {mode === 'edit' ? (
              <input value={how} onChange={(e) => setHow(e.target.value)} placeholder="How they work together" aria-label="How" />
            ) : (
              p.how && <div className="inbox-muted">How: {p.how}</div>
            )}
          </>
        )}
        {p.kind === 'update' && (
          <>
            {entity(subject, p.subjectId)} <span className="inbox-rel">{p.field}</span>{' '}
            {mode === 'edit' ? <input value={value} onChange={(e) => setValue(e.target.value)} aria-label="Value" /> : <q>{p.value}</q>}
          </>
        )}
        {p.kind === 'impact' && (
          <>
            {entity(subject, p.subjectId)} <span className="inbox-rel">{p.metric}</span>{' '}
            {mode === 'edit' ? (
              <input value={value} onChange={(e) => setValue(e.target.value)} aria-label="Value" />
            ) : (
              <strong>
                {p.value} {p.unit}
              </strong>
            )}
          </>
        )}
      </div>

      {p.flags.length > 0 && (
        <div className="inbox-flags">
          {p.flags.map((f) => (
            <span key={f} className="inbox-flag">
              {FLAG_LABEL[f] || f}
            </span>
          ))}
        </div>
      )}

      <ul className="inbox-sources">
        {p.sources.map((s, i) => (
          <li key={i}>
            <div className="inbox-source-head">
              <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" title={s.url}>
                {s.publisher || s.title} <ExternalLink size={11} />
              </a>
              <span className={`inbox-tier tier-${s.tier}`}>{s.tier}</span>
              <span className={`inbox-verify v-${s.verification}`} title={s.verificationNote}>
                {s.verification === 'verified' ? <Check size={11} /> : null}
                {VERIFY_LABEL[s.verification]}
              </span>
            </div>
            <blockquote>
              {s.quote}
              {s.quoteTrimmed ? '…' : ''}
            </blockquote>
            {s.published && <div className="inbox-muted">Published {s.published}</div>}
          </li>
        ))}
      </ul>

      {p.status === 'pending' ? (
        <>
          {!canApprove(p) && (
            <label className="inbox-check">
              <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              I opened the source and checked this myself
            </label>
          )}
          {mode === 'reject' && (
            <input className="inbox-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why? (so it isn't proposed again)" autoFocus />
          )}
          <div className="inbox-row">
            {mode === 'reject' ? (
              <>
                <button className="btn" onClick={() => setMode('view')} disabled={busy}>
                  Back
                </button>
                <button className="btn inbox-reject" onClick={() => act({ decision: 'reject', reason })} disabled={busy || needsName}>
                  <Ban size={13} /> Reject
                </button>
              </>
            ) : (
              <>
                <button className="btn" onClick={() => setMode('reject')} disabled={busy}>
                  <Ban size={13} /> Reject
                </button>
                <button className="btn" onClick={() => setMode(mode === 'edit' ? 'view' : 'edit')} disabled={busy}>
                  <Pencil size={13} /> {mode === 'edit' ? 'Cancel edit' : 'Edit'}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={approve}
                  disabled={busy || !approvable || needsName}
                  title={needsName ? 'Enter your name above first' : approvable ? 'Add to the network' : 'No source quote was verified'}
                >
                  <Check size={13} /> {mode === 'edit' ? 'Save and approve' : 'Approve'}
                </button>
              </>
            )}
          </div>
          {needsName && <p className="inbox-muted">Enter your name above to review.</p>}
        </>
      ) : (
        <div className="inbox-decided">
          <span>
            {p.status === 'approved' ? 'Approved' : 'Rejected'} by {p.decidedBy} · {when(p.decidedAt)}
            {p.override && ' · checked by hand'}
            {p.rejectReason && ` · ${p.rejectReason}`}
          </span>
          <button className="btn" onClick={() => act({ decision: 'revert' })} disabled={busy || needsName} title="Move back to To review">
            <Undo2 size={13} /> {p.status === 'approved' ? 'Revert' : 'Reconsider'}
          </button>
        </div>
      )}
      {error && <p className="inbox-error">{error}</p>}
    </article>
  );
};

export default InboxPanel;
