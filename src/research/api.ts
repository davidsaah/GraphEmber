import type { GraphEdge, GraphNode } from '../types/graph';
import type { DecisionInput, Proposal, ResearchRun, ReviewQueue } from './types';

// The review queue lives on the app server (server/research.mjs, data/research/proposals.json).
// Without a server (a static host or the claude.ai demo) the Inbox still opens, but research is off.

export class ResearchError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const MESSAGES: Record<string, string> = {
  unavailable: 'Web research needs the GraphEmber server. Start it with npm run dev or npm start and set ANTHROPIC_API_KEY.',
  rate_limited: 'Too many searches at once. Give it a moment and try again.',
  invalid_decision: '',
};

export const describeResearchError = (err: unknown): string => {
  if (err instanceof ResearchError && err.message.includes('ANTHROPIC_API_KEY'))
    return 'Web research is off on this server. Set ANTHROPIC_API_KEY where GraphEmber runs, then restart it.';
  if (err instanceof ResearchError) return MESSAGES[err.code] || err.message || 'Something went wrong. Try again.';
  return 'Something went wrong. Try again.';
};

const call = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  let res: Response;
  try {
    res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  } catch (e) {
    if (init?.signal?.aborted) throw new ResearchError('cancelled', 'Stopped');
    throw new ResearchError('unavailable', String(e));
  }
  const type = res.headers.get('content-type') || '';
  if (res.status === 404 || res.status === 405 || !type.includes('json')) throw new ResearchError('unavailable', 'No research server');
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ResearchError(body.code || 'upstream_error', body.error || `Request failed (${res.status})`);
  return body as T;
};

export const loadQueue = () => call<ReviewQueue>('./api/proposals');

export const decide = (input: DecisionInput) =>
  call<{ proposal: Proposal }>('./api/proposals/decide', { method: 'POST', body: JSON.stringify(input) }).then((r) => r.proposal);

const endId = (end: string | GraphNode) => (typeof end === 'string' ? end : end.id);

// Only names and public identifiers are sent. Descriptions, notes and tags stay in the app.
export const runResearch = (targets: GraphNode[], allNodes: GraphNode[], edges: GraphEdge[], signal: AbortSignal) =>
  call<{ run: ResearchRun; proposals: Proposal[] }>('./api/research', {
    method: 'POST',
    signal,
    body: JSON.stringify({
      targets: targets.map(({ id, type, label, acronym, website, location }) => ({ id, type, label, acronym, website, location })),
      catalog: allNodes.map(({ id, type, label }) => ({ id, type, label })),
      existing: edges.map((e) => ({ s: endId(e.source), t: endId(e.target), type: e.type })),
    }),
  });
