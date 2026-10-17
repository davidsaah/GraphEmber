// Checks the web-research safeguards without calling Claude or the internet.
// A fake model returns findings; a local web server plays the cited pages.
// Usage: node scripts/check-research.mjs
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runModel, screenFindings } from '../server/research.mjs';
import { createStore, applyDecision } from '../server/proposalsStore.mjs';
import { personalInfo, sourceTier, assess, canApprove } from '../server/researchPolicy.mjs';
import { matchQuote, fetchPage } from '../server/verify.mjs';

const PAGES = {
  '/cwi/news': '<html><body><h1>News</h1><p>CWI and CAL FIRE signed a data&nbsp;sharing agreement in March 2025 to support fire risk mapping.</p></body></html>',
  '/press/grant': '<p>The foundation awarded $2.4 million to the Resilient Home Fund in 2025.</p>',
};
const site = createServer((req, res) => {
  const page = PAGES[req.url];
  if (!page) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': 'text/html' }).end(page);
}).listen(0);
await new Promise((r) => site.once('listening', r));
const base = `http://127.0.0.1:${site.address().port}`;

let passed = 0;
const check = async (name, fn) => {
  await fn();
  passed++;
  console.log(`ok - ${name}`);
};

// ---------- policy ----------
await check('personal details are caught', () => {
  assert.equal(personalInfo('Contact jane.doe@example.org for details'), 'an email address');
  assert.equal(personalInfo('Call (415) 555-0134'), 'a phone number');
  assert.equal(personalInfo('She lives in Oakland with her husband'), 'private personal details');
  assert.equal(personalInfo('CWI partners with CAL FIRE on risk mapping'), null);
});

await check('sources are tiered', () => {
  assert.equal(sourceTier('https://www.fire.ca.gov/news'), 'primary');
  assert.equal(sourceTier('https://news.berkeley.edu/x'), 'primary');
  assert.equal(sourceTier('https://cwi.org/about', ['cwi.org']), 'primary');
  assert.equal(sourceTier('https://www.reuters.com/x'), 'secondary');
  assert.equal(sourceTier('https://someblog.net/post'), 'weak');
});

await check('quotes are matched loosely but honestly', () => {
  const page = 'CWI and CAL FIRE signed a data sharing agreement in March 2025 to support fire risk mapping.';
  assert.equal(matchQuote('CWI and CAL FIRE signed a data-sharing agreement', page.replace('data sharing', 'data-sharing')), 'verified');
  assert.equal(matchQuote('“signed a data sharing agreement in March 2025”', page), 'verified');
  assert.equal(matchQuote('CWI and CAL FIRE signed a funding agreement worth millions', page), 'missing');
});

await check('impact needs corroboration', () => {
  const one = { kind: 'impact', sources: [{ url: 'https://reuters.com/a', tier: 'secondary', verification: 'verified' }] };
  assert.ok(assess(one).flags.includes('needs-corroboration'));
  assert.equal(assess(one).confidence, 'low');
  const primary = { kind: 'impact', sources: [{ url: 'https://fire.ca.gov/a', tier: 'primary', verification: 'verified' }] };
  assert.equal(assess(primary).confidence, 'high');
});

await check('private addresses are refused when fetching sources', async () => {
  await assert.rejects(() => fetchPage(`${base}/cwi/news`), /private address/);
});

// ---------- the full screen ----------
const request = {
  targets: [{ id: 'inst-cwi', type: 'institution', name: 'Climate & Wildfire Institute', website: 'https://cwi.org' }],
  catalog: [
    { id: 'inst-cwi', type: 'institution', name: 'Climate & Wildfire Institute' },
    { id: 'inst-calfire', type: 'institution', name: 'CAL FIRE' },
    { id: 'prog-rhf', type: 'program', name: 'Resilient Home Fund' },
  ],
  existing: [{ s: 'inst-cwi', t: 'prog-rhf', type: 'OPERATES' }],
};
const src = (path, quote) => ({ url: `${base}${path}`, title: 't', publisher: 'p', published: null, quote });
const blank = { targetId: null, targetName: null, targetType: null, relation: null, direction: null, how: null, field: null, value: null, metric: null, unit: null, date: null };
const findings = [
  { ...blank, kind: 'connection', subjectId: 'inst-cwi', summary: 'CWI and CAL FIRE share data for risk mapping (2025).', targetId: 'inst-calfire', relation: 'COLLABORATES_WITH', direction: 'subject_to_target', how: 'data sharing agreement', date: '2025-03', sources: [src('/cwi/news', 'CWI and CAL FIRE signed a data sharing agreement in March 2025')] },
  { ...blank, kind: 'connection', subjectId: 'inst-cwi', summary: 'Already known.', targetId: 'prog-rhf', relation: 'OPERATES', sources: [src('/cwi/news', 'CWI')] },
  { ...blank, kind: 'impact', subjectId: 'inst-cwi', summary: 'A grant of $2.4M went to the fund.', metric: 'funding awarded', value: '2400000', unit: 'USD', date: '2025', sources: [src('/press/grant', 'The foundation awarded $2.4 million to the Resilient Home Fund in 2025.')] },
  { ...blank, kind: 'entity', subjectId: 'inst-cwi', summary: 'CWI works with Acme Fire Labs; email ceo@acme.example for more.', targetName: 'Acme Fire Labs', relation: 'PARTNERS_IN', sources: [src('/cwi/news', 'CWI')] },
  { ...blank, kind: 'entity', subjectId: 'inst-cwi', summary: 'CWI works with a made-up partner.', targetName: 'Imaginary Org', relation: 'PARTNERS_IN', sources: [{ url: 'https://not-in-search.example/x', title: 'x', publisher: 'x', published: null, quote: 'made up' }] },
  { ...blank, kind: 'connection', subjectId: 'inst-calfire', summary: 'Not a selected entity.', targetId: 'inst-cwi', relation: 'FUNDS', sources: [src('/cwi/news', 'CWI')] },
  { ...blank, kind: 'connection', subjectId: 'inst-cwi', summary: 'Quote is wrong.', targetId: 'inst-calfire', relation: 'FUNDS', direction: 'target_to_subject', sources: [src('/cwi/news', 'CAL FIRE gave CWI ten million dollars for new satellites')] },
];

// A fake Anthropic client: one search turn that pauses, then the submit call.
let calls = 0;
const fakeAnthropic = {
  beta: {
    messages: {
      stream: (params) => ({
        finalMessage: async () => {
          calls++;
          assert.ok(params.tools.some((t) => t.type === 'web_search_20260209' && t.max_uses === 5));
          if (calls === 1)
            return {
              stop_reason: 'pause_turn',
              content: [
                { type: 'server_tool_use', name: 'web_search', input: { query: 'Climate & Wildfire Institute partnership' } },
                { type: 'web_search_tool_result', content: [{ url: `${base}/cwi/news`, title: 'News' }, { url: `${base}/press/grant`, title: 'Grant' }] },
              ],
            };
          return { stop_reason: 'tool_use', content: [{ type: 'tool_use', name: 'submit_findings', input: { findings } }] };
        },
      }),
    },
  },
};

const model = await runModel('TARGET ENTITIES ...', { targetCount: 1, anthropic: fakeAnthropic });
await check('the model loop resumes after a pause and collects searches', () => {
  assert.equal(calls, 2);
  assert.deepEqual(model.queries, ['Climate & Wildfire Institute partnership']);
  assert.equal(model.findings.length, findings.length);
});

const { proposals, dropped } = await screenFindings(model.findings, {
  request,
  seen: model.seen,
  existingFingerprints: new Set(),
  verifyOpts: { allowPrivate: true },
});
const reasons = dropped.map((d) => d.reason);

await check('rule-breaking findings are dropped with a reason', () => {
  assert.ok(reasons.includes('already connected'));
  assert.ok(reasons.includes('contained an email address'));
  assert.ok(reasons.includes('no usable source'), 'a URL the search never returned is not accepted');
  assert.ok(reasons.includes('not about a selected entity'));
  assert.equal(proposals.length, 3);
});

const [conn, impact, wrong] = proposals;
await check('quotes are verified against the real page', () => {
  assert.equal(conn.sources[0].verification, 'verified');
  assert.equal(wrong.sources[0].verification, 'missing');
  assert.ok(wrong.flags.includes('unverified'));
  assert.equal(impact.sources[0].verification, 'verified');
  assert.ok(impact.flags.includes('needs-corroboration'), 'a single weak source cannot back an impact number');
});

await check('approval needs a verified source or an explicit override', async () => {
  assert.equal(canApprove(wrong), false);
  const store = createStore(join(await mkdtemp(join(tmpdir(), 'ge-')), 'proposals.json'));
  await store.update((d) => d.proposals.push(conn, wrong));
  await assert.rejects(() => store.update((d) => applyDecision(d, { id: wrong.id, decision: 'approve', reviewer: 'David' })), /verified/);
  await assert.rejects(() => store.update((d) => applyDecision(d, { id: conn.id, decision: 'approve' })), /who is reviewing/);
  const ok = await store.update((d) => applyDecision(d, { id: conn.id, decision: 'approve', reviewer: 'David', edits: { how: 'data sharing for risk maps' } }));
  assert.equal(ok.status, 'approved');
  assert.equal(ok.edits.how.to, 'data sharing for risk maps');
  const rej = await store.update((d) => applyDecision(d, { id: wrong.id, decision: 'reject', reviewer: 'David', reason: 'Quote not on page' }));
  assert.equal(rej.rejectReason, 'Quote not on page');
  const back = await store.update((d) => applyDecision(d, { id: conn.id, decision: 'revert', reviewer: 'David' }));
  assert.equal(back.status, 'pending');
  assert.equal(back.history.length, 1);
});

await check('the same finding is not proposed twice', async () => {
  const again = await screenFindings(model.findings, { request, seen: model.seen, existingFingerprints: new Set(proposals.map((p) => p.fingerprint)), verifyOpts: { allowPrivate: true } });
  assert.equal(again.proposals.length, 0);
});

site.close();
console.log(`\n${passed} checks passed`);
