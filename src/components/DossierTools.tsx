import React, { useMemo, useState } from 'react';
import { Pencil, Globe, History, Undo2, Inbox as InboxIcon, GitMerge } from 'lucide-react';
import type { GraphNode } from '../types/graph';
import { useCuration } from '../curation/CurationContext';
import type { CurationEntry, EditableField } from '../curation/types';
import '../curation/curation.css';

const FIELDS: { key: EditableField; label: string; multiline?: boolean }[] = [
  { key: 'label', label: 'Name' },
  { key: 'acronym', label: 'Acronym' },
  { key: 'website', label: 'Website' },
  { key: 'location', label: 'Location' },
  { key: 'description', label: 'Description', multiline: true },
  { key: 'tags', label: 'Tags (comma separated)' },
];

const fieldValue = (node: GraphNode, key: EditableField) => {
  const v = (node as unknown as Record<string, unknown>)[key];
  if (key === 'tags') return ((v as string[]) || []).join(', ');
  return (v as string) || '';
};

const show = (v: string | string[]) => (Array.isArray(v) ? v.join(', ') : v) || '(empty)';
const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });

// Edit, research and history controls at the top of an entity's dossier.
export const DossierTools: React.FC<{ node: GraphNode }> = ({ node }) => {
  const ctx = useCuration();
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const history = useMemo(() => {
    const entries = ctx?.log?.entries || [];
    const ids = new Set([node.id, ...(node.mergedFrom || []).map((m) => m.id)]);
    return entries
      .filter((e): e is Exclude<CurationEntry, { type: 'dismiss' }> => (e.type === 'edit' && ids.has(e.nodeId)) || (e.type === 'merge' && (ids.has(e.keepId) || ids.has(e.mergeId))))
      .slice()
      .reverse();
  }, [ctx?.log, node.id, node.mergedFrom]);

  if (!ctx) return null;
  const pending = ctx.pendingFor(node.id);
  const needsName = !ctx.reviewer.trim();

  const startEdit = () => {
    setDraft(Object.fromEntries(FIELDS.map((f) => [f.key, fieldValue(node, f.key)])));
    setNote('');
    setError('');
    setEditing(true);
  };

  const save = async () => {
    const changes: Record<string, { from: string | string[]; to: string | string[] }> = {};
    for (const f of FIELDS) {
      const before = fieldValue(node, f.key);
      const after = (draft[f.key] ?? '').trim();
      if (after === before.trim()) continue;
      changes[f.key] =
        f.key === 'tags'
          ? { from: node.tags || [], to: after.split(',').map((t) => t.trim()).filter(Boolean) }
          : { from: before, to: after };
    }
    if (!Object.keys(changes).length) return setEditing(false);
    setBusy(true);
    setError('');
    try {
      await ctx.save({ type: 'edit', nodeId: node.id, changes, note: note.trim() || undefined });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  const undo = async (entryId: string) => {
    setError('');
    try {
      await ctx.save({ type: 'undo', entryId });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not undo');
    }
  };

  return (
    <div className="dossier-tools">
      <div className="dossier-tools-row">
        <button className="btn" onClick={editing ? () => setEditing(false) : startEdit}>
          <Pencil size={13} /> {editing ? 'Cancel edit' : 'Edit'}
        </button>
        <button
          className="btn"
          onClick={() => ctx.research([node])}
          title={ctx.researchAvailable ? 'Search the web for new findings about this entity' : 'Web research needs the GraphEmber server'}
        >
          <Globe size={13} /> Research
        </button>
        {pending > 0 && (
          <button className="btn dossier-pending" onClick={() => ctx.openInbox('pending')} title="Findings about this entity waiting for review">
            <InboxIcon size={13} /> {pending} new
          </button>
        )}
        {history.length > 0 && (
          <button className="btn" onClick={() => setShowHistory((v) => !v)} aria-pressed={showHistory}>
            <History size={13} /> {history.length}
          </button>
        )}
      </div>

      {(node.mergedFrom?.length || node.aliases?.length) && !editing ? (
        <p className="dossier-tools-note">
          {node.aliases?.length ? <>Also known as {node.aliases.join(', ')}. </> : null}
          {node.mergedFrom?.length ? (
            <>
              <GitMerge size={11} /> Merged from {node.mergedFrom.map((m) => m.label).join(', ')}.
            </>
          ) : null}
        </p>
      ) : null}

      {editing && (
        <div className="dossier-edit">
          {FIELDS.map((f) => (
            <label key={f.key}>
              <span>{f.label}</span>
              {f.multiline ? (
                <textarea rows={4} value={draft[f.key] ?? ''} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
              ) : (
                <input value={draft[f.key] ?? ''} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
              )}
            </label>
          ))}
          <label>
            <span>Why (optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. corrected from their website" />
          </label>
          {needsName && (
            <label>
              <span>Your name</span>
              <input value={ctx.reviewer} onChange={(e) => ctx.setReviewer(e.target.value)} placeholder="Recorded with the change" />
            </label>
          )}
          <div className="dossier-edit-actions">
            {ctx.mode === 'local' && <span className="dossier-tools-note">Saved in this browser only.</span>}
            <button className="btn btn-primary" onClick={save} disabled={busy || needsName}>
              Save changes
            </button>
          </div>
        </div>
      )}

      {showHistory && !editing && (
        <ul className="dossier-history">
          {history.map((e) => (
            <li key={e.id} className={e.undoneAt ? 'undone' : ''}>
              <div className="dossier-history-head">
                <span>
                  {e.type === 'edit' ? 'Edited' : 'Merged'} by {e.by} · {when(e.at)}
                  {e.undoneAt && ` · undone by ${e.undoneBy}`}
                </span>
                {!e.undoneAt && (
                  <button className="icon-btn" onClick={() => undo(e.id)} title="Undo this change" aria-label="Undo this change" disabled={needsName}>
                    <Undo2 size={13} />
                  </button>
                )}
              </div>
              {e.type === 'edit' ? (
                Object.entries(e.changes).map(([field, c]) => (
                  <div key={field} className="dossier-history-change">
                    <strong>{FIELDS.find((f) => f.key === field)?.label || field}:</strong> <s>{show(c!.from)}</s> → {show(c!.to)}
                  </div>
                ))
              ) : (
                <div className="dossier-history-change">
                  {e.mergeLabel || e.mergeId} merged into {e.keepLabel || e.keepId}
                </div>
              )}
              {e.note && <div className="dossier-tools-note">{e.note}</div>}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="dossier-tools-error">{error}</p>}
    </div>
  );
};
