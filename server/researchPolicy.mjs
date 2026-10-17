// Safeguards for web research, shared by the /api/research server and the browser Inbox.
// See /mnt/project-files/graphember/web-research-plan.md (Safeguards) for the reasoning.

export const LIMITS = {
  maxTargets: 10, // entities researched per run
  searchesPerTarget: 5,
  maxSearches: 25,
  maxFetches: 10,
  maxFindings: 30,
  maxQuoteWords: 30,
  staleYears: 3,
};

// Relationship types the research step may propose (the Firelines ontology plus the app's existing edge types).
export const RELATIONS = [
  'PARTNERS_IN', 'HAS_PROJECT', 'HAS_TOPIC', 'FUNDS', 'AWARDED_TO', 'DEVELOPS', 'PRODUCES', 'OPERATES',
  'DEPLOYED_IN', 'INTEGRATES_WITH', 'POWERS', 'COLLABORATES_WITH', 'MEMBER_OF', 'LEADS', 'HOSTS', 'ORGANIZES',
  'ADMINISTERS', 'SUBSIDIARY_OF', 'INVOLVED_IN', 'PARTICIPATES_IN', 'RELATED_TO',
];

export const NODE_TYPES = ['institution', 'collaborative', 'program', 'product', 'grant', 'research', 'meeting', 'topic', 'person'];

export const UPDATE_FIELDS = ['description', 'location', 'website', 'status'];

// ---------- Source tiers ----------

// Primary: the organisation's own site (checked per finding), government, grant databases, journals.
const PRIMARY_DOMAINS = [
  'fire.ca.gov', 'fs.usda.gov', 'usda.gov', 'nifc.gov', 'doi.gov', 'nasa.gov', 'noaa.gov', 'nsf.gov', 'energy.gov',
  'usaspending.gov', 'grants.gov', 'congress.gov', 'ca.gov', 'europa.eu', 'cordis.europa.eu', 'un.org',
  'doi.org', 'nature.com', 'science.org', 'sciencedirect.com', 'springer.com', 'wiley.com', 'mdpi.com',
  'agu.org', 'pnas.org', 'iopscience.iop.org', 'arxiv.org', 'zenodo.org', 'github.com',
];
const PRIMARY_SUFFIXES = ['.gov', '.mil', '.gov.au', '.gc.ca', '.gov.uk', '.edu', '.ac.uk', '.edu.au'];

// Reputable secondary: established news and trade press. Anything else is "weak".
const SECONDARY_DOMAINS = [
  'apnews.com', 'reuters.com', 'nytimes.com', 'washingtonpost.com', 'latimes.com', 'sfchronicle.com',
  'calmatters.org', 'npr.org', 'kqed.org', 'bbc.co.uk', 'bbc.com', 'theguardian.com', 'bloomberg.com',
  'wsj.com', 'axios.com', 'politico.com', 'eenews.net', 'grist.org', 'insideclimatenews.org',
  'wildfiretoday.com', 'firehouse.com', 'govtech.com', 'techcrunch.com', 'spacenews.com', 'wired.com',
  'scientificamerican.com', 'nationalgeographic.com', 'businesswire.com', 'prnewswire.com',
];

// Never used: content farms, aggregators, social platforms and sites that require a login.
export const BLOCKED_DOMAINS = [
  'facebook.com', 'instagram.com', 'tiktok.com', 'x.com', 'twitter.com', 'reddit.com', 'quora.com',
  'pinterest.com', 'linkedin.com', 'zoominfo.com', 'rocketreach.co', 'crunchbase.com', 'apollo.io',
  'signalhire.com', 'contactout.com', 'spokeo.com', 'whitepages.com', 'beenverified.com', 'peoplefinders.com',
  'radaris.com', 'truepeoplesearch.com', 'fastpeoplesearch.com', 'medium.com', 'scribd.com', 'coursehero.com',
];

export const hostOf = (url) => {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
};

const matchesDomain = (host, domain) => host === domain || host.endsWith(`.${domain}`);

export const isBlocked = (url) => {
  const host = hostOf(url);
  return !host || BLOCKED_DOMAINS.some((d) => matchesDomain(host, d));
};

// ownSites: website hosts of the entities the finding is about (their own pages count as primary).
export const sourceTier = (url, ownSites = []) => {
  const host = hostOf(url);
  if (!host) return 'weak';
  if (ownSites.some((s) => s && matchesDomain(host, s))) return 'primary';
  if (PRIMARY_DOMAINS.some((d) => matchesDomain(host, d)) || PRIMARY_SUFFIXES.some((s) => host.endsWith(s))) return 'primary';
  if (SECONDARY_DOMAINS.some((d) => matchesDomain(host, d))) return 'secondary';
  return 'weak';
};

// ---------- Personal information ----------

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE = /(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{3}\)|\d{3})[\s.-]\d{3}[\s.-]\d{4}\b/;
const STREET = /\b\d{1,6}\s+(?:[A-Z][a-z]+\s){1,3}(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Lane|Ln|Dr|Drive|Ct|Court|Way)\b\.?/;
const PRIVATE_TOPICS = /\b(home address|lives in|his wife|her husband|his children|her children|divorce|diagnos|medical condition|religio|political affiliation|arrest|lawsuit against him|lawsuit against her)\b/i;

export const personalInfo = (text) => {
  if (!text) return null;
  if (EMAIL.test(text)) return 'an email address';
  if (PHONE.test(text)) return 'a phone number';
  if (STREET.test(text)) return 'a street address';
  if (PRIVATE_TOPICS.test(text)) return 'private personal details';
  return null;
};

export const redactPersonalInfo = (text) =>
  (text || '').replace(new RegExp(EMAIL, 'gi'), '[email removed]').replace(new RegExp(PHONE, 'g'), '[phone removed]');

// ---------- Review rules ----------

const verified = (s) => s.verification === 'verified';

// Computed on the server from the checked sources, never taken from the model.
export const assess = (proposal, nowYear = new Date().getFullYear()) => {
  const flags = [];
  const good = proposal.sources.filter(verified);
  const primary = good.filter((s) => s.tier === 'primary');
  const domains = new Set(good.map((s) => hostOf(s.url)));

  let confidence = 'low';
  if (primary.length) confidence = 'high';
  else if (good.some((s) => s.tier === 'secondary')) confidence = 'medium';

  if (!good.length) flags.push('unverified');
  if (proposal.sources.length && proposal.sources.every((s) => s.tier === 'weak')) flags.push('weak-sources-only');
  if (proposal.kind === 'impact' && !primary.length && domains.size < 2) {
    flags.push('needs-corroboration');
    confidence = 'low';
  }
  const year = Number(String(proposal.date || '').slice(0, 4));
  if (year && nowYear - year > LIMITS.staleYears) flags.push('possibly-out-of-date');
  return { confidence, flags };
};

// A finding can be approved once at least one source quote was found on its page,
// or when the reviewer says they checked the source themselves.
export const canApprove = (proposal, override = false) =>
  override || proposal.sources.some(verified);

export const fingerprint = (p) =>
  [p.kind, p.subjectId, p.targetId || (p.targetName || '').toLowerCase().trim(), p.relation || '', p.field || '', (p.metric || '').toLowerCase()]
    .join('|');
