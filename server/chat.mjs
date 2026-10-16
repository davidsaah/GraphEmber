// POST /api/chat handler: streams Claude's answer back as plain text.
// Body: { context: string (graph data), messages: [{ role, content }] }
import Anthropic from '@anthropic-ai/sdk';
import { CHAT_RULES } from './rules.mjs';

const MAX_CONTEXT_CHARS = 200_000;
const MAX_TURNS = 20;
const MAX_TURN_CHARS = 4_000;

let client;
const getClient = () => (client ??= new Anthropic());

const readJson = (req) =>
  new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > MAX_CONTEXT_CHARS * 2) reject(new Error('Body too large'));
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });

const fail = (res, status, code, error) => {
  if (res.headersSent) return res.end();
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ code, error }));
};

const validTurns = (messages) =>
  Array.isArray(messages) &&
  messages.length > 0 &&
  messages.length <= MAX_TURNS &&
  messages.every(
    (m, i) =>
      m &&
      m.role === (i % 2 === 0 ? 'user' : 'assistant') &&
      typeof m.content === 'string' &&
      m.content.length > 0 &&
      m.content.length <= MAX_TURN_CHARS,
  ) &&
  messages[messages.length - 1].role === 'user';

export const handleChat = async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'method_not_allowed', 'Use POST');
  if (!process.env.ANTHROPIC_API_KEY) return fail(res, 503, 'unavailable', 'ANTHROPIC_API_KEY is not set');

  let body;
  try {
    body = await readJson(req);
  } catch {
    return fail(res, 400, 'invalid_request', 'Invalid JSON body');
  }
  const { context, messages } = body;
  if (typeof context !== 'string' || context.length > MAX_CONTEXT_CHARS || !validTurns(messages)) {
    return fail(res, 400, 'invalid_request', 'Invalid chat request');
  }

  const stream = getClient().beta.messages.stream({
    model: 'claude-opus-5-5',
    max_tokens: 4000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low' },
    system: [{ type: 'text', text: `${CHAT_RULES}\n\n${context}`, cache_control: { type: 'ephemeral' } }],
    messages: messages.map(({ role, content }) => ({ role, content })),
  });
  req.on('close', () => {
    if (!res.writableEnded) stream.abort();
  });

  stream.on('text', (delta) => {
    if (!res.headersSent) res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.write(delta);
  });

  try {
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal' && !res.headersSent) return fail(res, 422, 'refused', 'Claude declined to answer');
    if (!res.headersSent) res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end();
  } catch (err) {
    if (err instanceof Anthropic.APIUserAbortError) return res.end();
    if (err instanceof Anthropic.RateLimitError) return fail(res, 429, 'rate_limited', 'Rate limited');
    if (err instanceof Anthropic.AuthenticationError) return fail(res, 503, 'unavailable', 'Invalid ANTHROPIC_API_KEY');
    if (err instanceof Anthropic.BadRequestError) return fail(res, 400, 'invalid_request', err.message);
    console.error('[chat]', err);
    return fail(res, 502, 'upstream_error', 'Claude request failed');
  }
};
