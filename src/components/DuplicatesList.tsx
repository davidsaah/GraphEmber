import React, { useMemo, useState } from 'react';
import { GitMerge, Undo2, Inbox as InboxIcon } from 'lucide-react';
import type { GraphEdge, GraphNode } from '../types/graph';
import type { DuplicateCandidate } from '../curation/findDuplicates';
import { useCuration } from '../curation/CurationContext';
import type { DismissEntry, MergeEntry } from '../curation/types';
import '../curation/curation.css';

const endId = (end: string | GraphNode) => (typeof end === 'string' ? end : end.id);
const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });

interface Props {
  duplicates: DuplicateCandidate[];
  edges: GraphEdge[];
  onSelectNode: (node: GraphNode) => void;
}

// The Inbox's Duplicates tab: pairs that may be the same entity. A person merges or dismisses each one.
export const DuplicatesList: React.FC<Props> = ({ duplicates, edges, onSelectNode }) => {
  const ctx = useCuration();
  const [error, setError] = useState('');

  const degree = useMemo(() => {
    const d = new Map<string, number>();
    for (const e of edges) for (const id of [endId(e.source), endId(e.target)]) d.set(id, (d.get(id) || 0) + 1);
    return d;
  }, [edges]);

  const past = useMemo(
    () => (ctx?.log?.entries || []).filter((e): e is MergeEntry | DismissEntry => e.type === 'merge' || e.type === 'dismiss').slice().reverse(),
    [ctx?.log],
  );

  if (!ctx) return null;
  const needsName = !ctx.reviewer.trim();

  const run = async (input: Parameters<typeof ctx.save>[0]) => {
    setError('');
    try {
      await ctx.save(input);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    }
  };

  const side = (n: GraphNode) => (
    <div className="dup-side">
      <button className="inbox-link" onClick={() => onSelectNode(n)}>
        {n.label}
      </button>
      <span>
        {n.type} · {degree.get(n.id) || 0} {degree.get(n.id) === 1 ? 'connection' : 'connections'}
      </span>
      {n.acronym && <span>Acronym: {n.acronym}</span>}
      {n.website && <span className="dup-clip">{n.website.replace(/^https?:\/\/(www\.)?/, '')}</span>}
      {n.location && <span>{n.location}</span>}
    </div>
  );

  return (
    <div className="inbox-list">
      <p className="inbox-muted">
        These pairs look like the same entity. Merging keeps the first entity's details, fills its gaps from the other, and moves every
        connection across. You can undo a merge at any time.
      </p>
      {ctx.mode === 'local' && <p className="inbox-muted">Without the GraphEmber server, merges are saved in this browser only.</p>}
      {needsName && <p className="inbox-error">Add your name above to merge or dismiss.</p>}
      {error && <p className="inbox-error">{error}</p>}

      {duplicates.length ? (
        duplicates.map(({ a, b, score, reasons }) => (
          <div key={`${a.id}|${b.id}`} className="dup-card">
            <div className="dup-head">
              <GitMerge size={13} /> Possible duplicate <span className="dup-score">{Math.round(score * 100)}% match</span>
            </div>
            <div className="dup-pair">
              {side(a)}
              {side(b)}
            </div>
            <ul className="dup-reasons">
              {reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <div className="dup-actions">
              <button
                className="btn"
                disabled={needsName}
                onClick={() => run({ type: 'dismiss', aId: a.id, bId: b.id, aLabel: a.label, bLabel: b.label })}
              >
                Not the same
              </button>
              <button
                className="btn"
                disabled={needsName}
                onClick={() => run({ type: 'merge', keepId: b.id, mergeId: a.id, keepLabel: b.label, mergeLabel: a.label, reasons })}
                title={`Keep "${b.label}" and merge "${a.label}" into it`}
              >
                Keep right
              </button>
              <button
                className="btn btn-primary"
                disabled={needsName}
                onClick={() => run({ type: 'merge', keepId: a.id, mergeId: b.id, keepLabel: a.label, mergeLabel: b.label, reasons })}
                title={`Keep "${a.label}" and merge "${b.label}" into it`}
              >
                Keep left
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="inbox-empty">
          <InboxIcon size={20} />
          <p>No likely duplicates right now.</p>
        </div>
      )}

      {past.length > 0 && (
        <details className="inbox-run">
          <summary>Past merges and dismissals ({past.length})</summary>
          <ul className="dossier-history">
            {past.map((e) => (
              <li key={e.id} className={e.undoneAt ? 'undone' : ''}>
                <div className="dossier-history-head">
                  <span>
                    {e.type === 'merge' ? `${e.mergeLabel || e.mergeId} merged into ${e.keepLabel || e.keepId}` : `${e.aLabel} and ${e.bLabel} marked as different`}
                  </span>
                  {!e.undoneAt && (
                    <button className="icon-btn" onClick={() => run({ type: 'undo', entryId: e.id })} title="Undo" aria-label="Undo" disabled={needsName}>
                      <Undo2 size={13} />
                    </button>
                  )}
                </div>
                <div className="dossier-tools-note">
                  {e.by} · {when(e.at)}
                  {e.undoneAt && ` · undone by ${e.undoneBy}`}
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};
