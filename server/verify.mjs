// Re-fetches each cited page and checks the quoted passage is really on it.
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const TIMEOUT_MS = 8000;
const MAX_BYTES = 3_000_000;
const MAX_REDIRECTS = 3;

// Refuse anything that resolves to this machine or a private network.
const isPrivateAddress = (ip) => {
  if (ip.includes(':')) {
    const v6 = ip.toLowerCase();
    if (v6.startsWith('::ffff:')) return isPrivateAddress(v6.slice(7));
    return v6 === '::1' || v6 === '::' || v6.startsWith('fc') || v6.startsWith('fd') || v6.startsWith('fe80');
  }
  const [a, b] = ip.split('.').map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
};

const assertPublicUrl = async (raw) => {
  const url = new URL(raw);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('not http(s)');
  if (url.username || url.password) throw new Error('credentials in URL');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (!addrs.length || addrs.some(({ address }) => isPrivateAddress(address))) throw new Error('private address');
  return url;
};

const readCapped = async (res) => {
  const reader = res.body?.getReader();
  if (!reader) return '';
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_BYTES) {
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
};

// Fetch with manual redirects so every hop is checked. Exported for tests.
export const fetchPage = async (raw, { allowPrivate = false } = {}) => {
  let url = allowPrivate ? new URL(raw) : await assertPublicUrl(raw);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'User-Agent': 'GraphEmber-citation-check/1.0 (+https://github.com/davidsaah/GraphEmber)', Accept: 'text/html,text/plain;q=0.9,*/*;q=0.1' },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      const next = new URL(res.headers.get('location'), url);
      url = allowPrivate ? next : await assertPublicUrl(next.href);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = res.headers.get('content-type') || '';
    if (/pdf/i.test(type)) return { type: 'pdf', text: '' };
    return { type: 'html', text: await readCapped(res) };
  }
  throw new Error('too many redirects');
};

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: "'", lsquo: "'", rdquo: '"', ldquo: '"', ndash: '-', mdash: '-' };

export const pageText = (html) =>
  html
    .replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e) => {
      if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
      return ENTITIES[e.toLowerCase()] ?? m;
    });

// Lowercase, straight quotes, single dashes, words only, so formatting differences don't matter.
export const normalize = (text) =>
  (text || '')
    .toLowerCase()
    .replace(/[‘’‛′]/g, "'")
    .replace(/[“”″]/g, '"')
    .replace(/[‐-―]/g, '-')
    .replace(/[^a-z0-9$%.'-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// verified: the quote appears on the page. partial: most of its 5-word runs do. missing: neither.
export const matchQuote = (quote, text) => {
  const q = normalize(quote).replace(/\.$/, '');
  const page = normalize(text);
  if (!q) return 'missing';
  if (page.includes(q)) return 'verified';
  const words = q.split(' ');
  if (words.length < 6) return 'missing';
  let hits = 0, total = 0;
  for (let i = 0; i + 5 <= words.length; i++) {
    total++;
    if (page.includes(words.slice(i, i + 5).join(' '))) hits++;
  }
  return hits / total >= 0.6 ? 'partial' : 'missing';
};

// Returns 'verified' | 'partial' | 'missing' | 'pdf' | 'unreachable' for each source.
export const verifySources = async (sources, opts) => {
  const pages = new Map();
  const load = (url) => {
    if (!pages.has(url)) pages.set(url, fetchPage(url, opts).then((p) => ({ ...p, text: p.type === 'html' ? pageText(p.text) : '' })).catch((e) => ({ type: 'error', error: String(e.message || e) })));
    return pages.get(url);
  };
  return Promise.all(
    sources.map(async (s) => {
      const page = await load(s.url);
      if (page.type === 'error') return { ...s, verification: 'unreachable', verificationNote: page.error };
      if (page.type === 'pdf') return { ...s, verification: 'pdf', verificationNote: 'PDF: check the quote by hand' };
      return { ...s, verification: matchQuote(s.quote, page.text) };
    }),
  );
};
