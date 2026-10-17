// The review queue: every web finding, its review decision, and a log of research runs.
// Saved to data/research/proposals.json so approved learnings travel with the repo.
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { canApprove } from './researchPolicy.mjs';

const DEFAULT_FILE = fileURLToPath(new URL('../data/research/proposals.json', import.meta.url));
const EMPTY = () => ({ version: 1, proposals: [], runs: [] });

export const createStore = (file = process.env.GRAPHEMBER_PROPOSALS_FILE || DEFAULT_FILE, empty = EMPTY) => {
  let queue = Promise.resolve();
  const read = async () => {
    try {
      return { ...empty(), ...JSON.parse(await readFile(file, 'utf8')) };
    } catch (e) {
      if (e.code === 'ENOENT') return empty();
      throw e;
    }
  };
  const write = async (data) => {
    await mkdir(dirname(file), { recursive: true });
    await writeFile(`${file}.tmp`, `${JSON.stringify(data, null, 2)}\n`);
    await rename(`${file}.tmp`, file);
  };
  // Serialise read-modify-write so two reviews never overwrite each other.
  const update = (fn) => {
    const run = queue.then(async () => {
      const data = await read();
      const result = await fn(data);
      await write(data);
      return result;
    });
    queue = run.catch(() => {});
    return run;
  };
  return { read, update };
};

export class DecisionError extends Error {}

const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined);

// decision: approve | reject | revert (back to pending). edits: reviewer's corrections to the wording.
export const applyDecision = (data, { id, decision, reviewer, reason, edits, override }) => {
  const p = data.proposals.find((x) => x.id === id);
  if (!p) throw new DecisionError('No such finding');
  const who = clean(reviewer, 80);
  if (!who) throw new DecisionError('Say who is reviewing');
  const now = new Date().toISOString();

  if (decision === 'approve') {
    if (p.status !== 'pending') throw new DecisionError('Only pending findings can be approved');
    if (!canApprove(p, override === true)) throw new DecisionError('No source quote could be verified. Check the source and approve with the override.');
    if (edits && typeof edits === 'object') {
      const changed = {};
      for (const key of ['summary', 'how', 'value', 'metric', 'unit', 'targetName']) {
        const v = clean(edits[key], 600);
        if (v !== undefined && v !== p[key]) changed[key] = { from: p[key] ?? null, to: v };
      }
      for (const [key, { to }] of Object.entries(changed)) p[key] = to;
      if (Object.keys(changed).length) p.edits = changed;
    }
    Object.assign(p, { status: 'approved', decidedBy: who, decidedAt: now, override: override === true || undefined });
  } else if (decision === 'reject') {
    if (p.status !== 'pending') throw new DecisionError('Only pending findings can be rejected');
    Object.assign(p, { status: 'rejected', decidedBy: who, decidedAt: now, rejectReason: clean(reason, 300) || 'Not specified' });
  } else if (decision === 'revert') {
    if (p.status === 'pending') throw new DecisionError('Already pending');
    p.history = [...(p.history || []), { status: p.status, by: p.decidedBy, at: p.decidedAt, revertedBy: who, revertedAt: now }];
    Object.assign(p, { status: 'pending', decidedBy: undefined, decidedAt: undefined, rejectReason: undefined, override: undefined });
  } else {
    throw new DecisionError('Unknown decision');
  }
  return p;
};
