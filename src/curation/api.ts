import { applyCuration, emptyLog } from '../../server/curationLog.mjs';
import type { CurationEntry, CurationInput, CurationLog } from './types';

// Saved on the GraphEmber server (data/curation.json) when there is one. Otherwise, as on a
// static host or in the claude.ai demo, edits are kept in this browser only.

export type CurationMode = 'server' | 'local';

const LOCAL_KEY = 'graphember.curation';

const readLocal = (): CurationLog => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? { ...emptyLog(), ...JSON.parse(raw) } : (emptyLog() as CurationLog);
  } catch {
    return emptyLog() as CurationLog;
  }
};

export const loadCuration = async (): Promise<{ log: CurationLog; mode: CurationMode }> => {
  try {
    const res = await fetch('./api/curation');
    if (res.ok && (res.headers.get('content-type') || '').includes('json')) return { log: await res.json(), mode: 'server' };
  } catch {
    /* no server: fall through to local */
  }
  return { log: readLocal(), mode: 'local' };
};

export const saveCuration = async (mode: CurationMode, input: CurationInput & { by: string }): Promise<CurationEntry> => {
  if (mode === 'local') {
    const log = readLocal();
    const entry = applyCuration(log, input) as CurationEntry; // throws CurationError with a readable message
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(log));
    } catch {
      /* storage unavailable: the change still applies for this visit */
    }
    return entry;
  }
  const res = await fetch('./api/curation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Save failed (${res.status})`);
  return body.entry as CurationEntry;
};
