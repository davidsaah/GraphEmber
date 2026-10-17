// GET /api/curation: the curation log.  POST /api/curation: add an edit, merge, "not the same" or undo.
import { fileURLToPath } from 'node:url';
import { createStore } from './proposalsStore.mjs';
import { applyCuration, CurationError, emptyLog } from './curationLog.mjs';

const FILE = fileURLToPath(new URL('../data/curation.json', import.meta.url));
let store;
const getStore = () => (store ??= createStore(process.env.GRAPHEMBER_CURATION_FILE || FILE, emptyLog));

const readJson = (req) =>
  new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 100_000) reject(new SyntaxError('Body too large'));
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

const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};

export const handleCuration = async (req, res) => {
  try {
    if (req.method === 'GET') return send(res, 200, await getStore().read());
    if (req.method === 'POST') {
      const body = await readJson(req);
      const entry = await getStore().update((data) => applyCuration(data, body));
      return send(res, 200, { entry });
    }
    return send(res, 405, { code: 'method_not_allowed', error: 'Use GET or POST' });
  } catch (err) {
    if (err instanceof CurationError) return send(res, 400, { code: 'invalid_change', error: err.message });
    if (err instanceof SyntaxError) return send(res, 400, { code: 'invalid_request', error: 'Invalid JSON body' });
    console.error('[curation]', err);
    return send(res, 500, { code: 'store_error', error: 'Could not read or save the curation log' });
  }
};
