// The curation log: hand edits to entities, merges of duplicate entities, and pairs marked
// "not the same". Shared by the /api/curation server and the browser's local fallback.
// Entries are only ever added or marked undone, so the full history stays readable.

export const EDITABLE_FIELDS = ['label', 'description', 'acronym', 'website', 'location', 'tags'];

export const emptyLog = () => ({ version: 1, entries: [] });

export class CurationError extends Error {}

const ID = /^[\w.:-]{1,120}$/;
const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+$/g, '').slice(0, max) : undefined);

const active = (data) => data.entries.filter((e) => !e.undoneAt);

// Ids that have been merged away, mapped to the entity that absorbed them.
export const mergedAway = (data) => new Map(active(data).filter((e) => e.type === 'merge').map((e) => [e.mergeId, e.keepId]));

export const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

const newId = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export const applyCuration = (data, input) => {
  const by = clean(input?.by, 80)?.trim();
  if (!by) throw new CurationError('Say who is making the change');
  const at = new Date().toISOString();
  const gone = mergedAway(data);

  if (input.type === 'edit') {
    if (!ID.test(input.nodeId || '')) throw new CurationError('Unknown entity');
    if (gone.has(input.nodeId)) throw new CurationError('That entity was merged into another one');
    const changes = {};
    for (const [field, change] of Object.entries(input.changes || {})) {
      if (!EDITABLE_FIELDS.includes(field)) continue;
      const to = field === 'tags'
        ? (Array.isArray(change?.to) ? change.to.map((t) => clean(String(t), 80)?.trim()).filter(Boolean).slice(0, 40) : undefined)
        : clean(change?.to, field === 'description' ? 4000 : 300);
      if (to === undefined) continue;
      if (field === 'label' && !String(to).trim()) throw new CurationError('The name cannot be empty');
      if (field === 'website' && to && !/^https?:\/\//i.test(to)) throw new CurationError('Websites start with http:// or https://');
      const from = field === 'tags' ? (Array.isArray(change?.from) ? change.from : []) : clean(change?.from ?? '', 4000);
      if (JSON.stringify(from) === JSON.stringify(to)) continue;
      changes[field] = { from, to };
    }
    if (!Object.keys(changes).length) throw new CurationError('Nothing changed');
    const entry = { id: newId(), type: 'edit', nodeId: input.nodeId, changes, note: clean(input.note, 300) || undefined, by, at };
    data.entries.push(entry);
    return entry;
  }

  if (input.type === 'merge') {
    const { keepId, mergeId } = input;
    if (!ID.test(keepId || '') || !ID.test(mergeId || '') || keepId === mergeId) throw new CurationError('Pick two different entities');
    if (gone.has(keepId) || gone.has(mergeId)) throw new CurationError('One of these was already merged');
    const entry = {
      id: newId(), type: 'merge', keepId, mergeId,
      keepLabel: clean(input.keepLabel, 300), mergeLabel: clean(input.mergeLabel, 300),
      reasons: Array.isArray(input.reasons) ? input.reasons.slice(0, 8).map((r) => clean(String(r), 160)) : undefined,
      note: clean(input.note, 300) || undefined, by, at,
    };
    data.entries.push(entry);
    return entry;
  }

  if (input.type === 'dismiss') {
    const { aId, bId } = input;
    if (!ID.test(aId || '') || !ID.test(bId || '') || aId === bId) throw new CurationError('Pick two different entities');
    const entry = { id: newId(), type: 'dismiss', pair: pairKey(aId, bId), aLabel: clean(input.aLabel, 300), bLabel: clean(input.bLabel, 300), by, at };
    data.entries.push(entry);
    return entry;
  }

  if (input.type === 'undo') {
    const entry = data.entries.find((e) => e.id === input.entryId);
    if (!entry) throw new CurationError('No such change');
    if (entry.undoneAt) throw new CurationError('Already undone');
    Object.assign(entry, { undoneBy: by, undoneAt: at });
    return entry;
  }

  throw new CurationError('Unknown change');
};
