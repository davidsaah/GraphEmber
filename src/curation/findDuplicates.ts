import type { GraphEdge, GraphNode } from '../types/graph';

// Suggests pairs of entities that may be the same thing, with the reasons. A person decides:
// nothing is merged automatically.

export interface DuplicateCandidate {
  a: GraphNode;
  b: GraphNode;
  score: number; // 0..1
  reasons: string[];
}

const STOP = new Set(['the', 'of', 'and', 'for', 'a', 'an', 'in', 'at', 'on', 'inc', 'llc', 'ltd', 'co', 'corp', 'corporation', 'company']);

const words = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);

const core = (s: string) => words(s).filter((w) => !STOP.has(w));
const squash = (s: string) => words(s).join('');
const initials = (s: string) => core(s).map((w) => w[0]).join('');

const host = (url?: string) => {
  if (!url) return '';
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
};
// Shared platforms say nothing about identity
const GENERIC_HOSTS = new Set(['google.com', 'sites.google.com', 'github.com', 'linkedin.com', 'facebook.com', 'twitter.com', 'x.com', 'youtube.com', 'medium.com', 'docs.google.com', 'drive.google.com']);

// 1 - edit distance / length, for catching typos
const similarity = (a: string, b: string) => {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return 1 - prev[b.length] / Math.max(a.length, b.length);
};

const names = (n: GraphNode) => [n.label, ...(n.acronym ? [n.acronym] : []), ...(n.aliases || [])].filter(Boolean);

export const findDuplicates = (nodes: GraphNode[], edges: GraphEdge[], dismissed: Set<string>, minScore = 0.6): DuplicateCandidate[] => {
  const neighbours = new Map<string, Set<string>>();
  for (const e of edges) {
    const s = typeof e.source === 'string' ? e.source : e.source.id;
    const t = typeof e.target === 'string' ? e.target : e.target.id;
    if (!neighbours.has(s)) neighbours.set(s, new Set());
    if (!neighbours.has(t)) neighbours.set(t, new Set());
    neighbours.get(s)!.add(t);
    neighbours.get(t)!.add(s);
  }

  const prepared = nodes.map((n) => ({
    n,
    squashed: names(n).map(squash).filter((x) => x.length >= 2),
    core: core(n.label),
    initials: initials(n.label),
    host: host(n.website),
  }));

  const out: DuplicateCandidate[] = [];
  for (let i = 0; i < prepared.length; i++) {
    for (let j = i + 1; j < prepared.length; j++) {
      const A = prepared[i];
      const B = prepared[j];
      const key = A.n.id < B.n.id ? `${A.n.id}|${B.n.id}` : `${B.n.id}|${A.n.id}`;
      if (dismissed.has(key)) continue;

      const reasons: string[] = [];
      let score = 0;
      const bump = (s: number, why: string) => {
        if (s > score) score = s;
        reasons.push(why);
      };

      if (A.squashed.some((x) => B.squashed.includes(x))) bump(0.92, 'Same name once spacing and punctuation are ignored');
      else {
        if (A.n.acronym && B.squashed.includes(squash(A.n.acronym))) bump(0.8, `"${A.n.acronym}" is the other's name`);
        if (B.n.acronym && A.squashed.includes(squash(B.n.acronym))) bump(0.8, `"${B.n.acronym}" is the other's name`);
        if (A.initials.length >= 3 && B.squashed.includes(A.initials)) bump(0.7, `"${B.n.label}" matches the initials of "${A.n.label}"`);
        if (B.initials.length >= 3 && A.squashed.includes(B.initials)) bump(0.7, `"${A.n.label}" matches the initials of "${B.n.label}"`);
        // A typo: the words that differ are near-misspellings of each other ("Environmmental").
        // Different years or places ("2025" / "2026", "Napa" / "Sonoma") are siblings, not typos.
        const onlyA = A.core.filter((w) => !B.core.includes(w));
        const onlyB = B.core.filter((w) => !A.core.includes(w));
        if (
          onlyA.length && onlyA.length === onlyB.length && A.core.length >= 2 &&
          ![...onlyA, ...onlyB].some((w) => /\d/.test(w)) &&
          similarity(onlyA.join(''), onlyB.join('')) >= 0.8
        )
          bump(0.85, 'Nearly the same spelling');
        // One name's words all appear in the other: as a phrase ("CAL FIRE" / "CAL FIRE NEU") or
        // scattered in a longer name ("North Tahoe Fire Protection District" / "North Lake Tahoe ...").
        const [fewer, more] = A.core.length <= B.core.length ? [A, B] : [B, A];
        if (fewer.core.length >= 2 && fewer.core.length < more.core.length && fewer.core.every((w) => more.core.includes(w))) {
          const phrase = ` ${more.core.join(' ')} `.includes(` ${fewer.core.join(' ')} `);
          if (phrase) bump(0.62, `"${more.n.label}" contains "${fewer.n.label}" (may be a part of it rather than the same)`);
          else if (fewer.core.length >= 3) bump(0.58, `Every word of "${fewer.n.label}" is in "${more.n.label}"`);
        }
      }
      // A shared website backs up a name match; alone it often means a shared programme page
      if (A.host && A.host === B.host && !GENERIC_HOSTS.has(A.host)) {
        if (score) score = Math.min(0.99, score + 0.15);
        else score = 0.5;
        reasons.push(`Same website (${A.host})`);
      }
      if (!score) continue;

      if (A.n.type !== B.n.type) {
        score *= 0.75;
        reasons.push(`Different types (${A.n.type}, ${B.n.type})`);
      }
      const na = neighbours.get(A.n.id);
      const nb = neighbours.get(B.n.id);
      if (na && nb) {
        let shared = 0;
        for (const x of na) if (nb.has(x)) shared++;
        if (shared) {
          score += Math.min(0.12, shared * 0.04);
          reasons.push(`${shared} shared connection${shared === 1 ? '' : 's'}`);
        }
      }
      score = Math.min(0.99, score);
      if (score >= minScore) out.push({ a: A.n, b: B.n, score, reasons });
    }
  }
  return out.sort((x, y) => y.score - x.score);
};
