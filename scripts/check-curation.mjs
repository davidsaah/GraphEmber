// Checks hand edits, merges and duplicate detection without a browser.
// Usage: node scripts/check-curation.mjs (Node 22.18+ reads the TypeScript helpers directly)
import assert from 'node:assert/strict';
import { applyCuration as record, emptyLog } from '../server/curationLog.mjs';
import { applyCuration } from '../src/curation/applyCuration.ts';
import { findDuplicates } from '../src/curation/findDuplicates.ts';

let passed = 0;
const check = (name, fn) => {
  fn();
  passed++;
  console.log(`ok - ${name}`);
};

const nodes = [
  { id: 'a', type: 'institution', label: 'Climate & Wildfire Institute', tags: ['CWI Network'], website: 'https://cwi.org' },
  { id: 'b', type: 'institution', label: 'Climate and Wildfire Institute', tags: ['Funder'], location: 'Berkeley, CA' },
  { id: 'c', type: 'institution', label: 'CAL FIRE', tags: [] },
  { id: 'd', type: 'program', label: 'Resilient Home Fund', tags: [] },
];
const edges = [
  { id: 'e1', source: 'a', target: 'd', type: 'HAS_PROJECT' },
  { id: 'e2', source: 'b', target: 'd', type: 'HAS_PROJECT' },
  { id: 'e3', source: 'b', target: 'c', type: 'PARTNERS_IN' },
  { id: 'e4', source: 'a', target: 'b', type: 'RELATED_TO' },
];

check('every change needs a name, a real change and valid values', () => {
  const log = emptyLog();
  assert.throws(() => record(log, { type: 'edit', nodeId: 'c', changes: { label: { from: 'CAL FIRE', to: 'X' } } }), /who/);
  assert.throws(() => record(log, { type: 'edit', nodeId: 'c', by: 'D', changes: { label: { from: 'CAL FIRE', to: 'CAL FIRE' } } }), /Nothing changed/);
  assert.throws(() => record(log, { type: 'edit', nodeId: 'c', by: 'D', changes: { website: { from: '', to: 'fire.ca.gov' } } }), /http/);
  assert.throws(() => record(log, { type: 'merge', keepId: 'a', mergeId: 'a', by: 'D' }), /two different/);
  assert.equal(log.entries.length, 0);
});

check('edits apply and can be undone', () => {
  const log = emptyLog();
  const e = record(log, { type: 'edit', nodeId: 'c', by: 'David', note: 'from their site', changes: { website: { from: '', to: 'https://www.fire.ca.gov' }, id: { from: 'c', to: 'z' } } });
  assert.deepEqual(Object.keys(e.changes), ['website']); // only editable fields are kept
  let out = applyCuration(nodes, edges, log);
  assert.equal(out.nodes.find((n) => n.id === 'c').website, 'https://www.fire.ca.gov');
  assert.equal(nodes[2].website, undefined); // the curated data is never changed
  record(log, { type: 'undo', entryId: e.id, by: 'David' });
  out = applyCuration(nodes, edges, log);
  assert.equal(out.nodes.find((n) => n.id === 'c').website, undefined);
  assert.equal(log.entries[0].undoneBy, 'David'); // the log keeps the entry
});

check('a merge keeps one entity, fills gaps and moves connections', () => {
  const log = emptyLog();
  record(log, { type: 'merge', keepId: 'a', mergeId: 'b', keepLabel: 'Climate & Wildfire Institute', mergeLabel: 'Climate and Wildfire Institute', by: 'David' });
  const out = applyCuration(nodes, edges, log);
  assert.equal(out.nodes.length, 3);
  const kept = out.nodes.find((n) => n.id === 'a');
  assert.equal(kept.location, 'Berkeley, CA');
  assert.deepEqual(kept.tags, ['CWI Network', 'Funder']);
  assert.deepEqual(kept.aliases, ['Climate and Wildfire Institute']);
  assert.equal(kept.mergedFrom[0].id, 'b');
  // e2 duplicates e1 after rewiring, e4 becomes a loop: both dropped. e3 now starts at a.
  assert.deepEqual(out.edges.map((e) => `${e.source}>${e.target}`), ['a>d', 'a>c']);
  assert.throws(() => record(log, { type: 'edit', nodeId: 'b', by: 'D', changes: { label: { from: 'x', to: 'y' } } }), /merged/);
  record(log, { type: 'undo', entryId: log.entries[0].id, by: 'David' });
  assert.equal(applyCuration(nodes, edges, log).nodes.length, 4);
});

check('likely duplicates are suggested with reasons, and dismissed pairs stay hidden', () => {
  const found = findDuplicates(nodes, edges, new Set());
  assert.equal(found.length, 1);
  assert.deepEqual([found[0].a.id, found[0].b.id].sort(), ['a', 'b']);
  assert.ok(found[0].score > 0.9 && found[0].reasons.length > 0);
  const log = emptyLog();
  const d = record(log, { type: 'dismiss', aId: 'b', bId: 'a', aLabel: 'x', bLabel: 'y', by: 'David' });
  assert.equal(findDuplicates(nodes, edges, new Set([d.pair])).length, 0);
});

console.log(`\n${passed} checks passed`);
