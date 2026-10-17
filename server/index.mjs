// Production server: serves the built app from dist/ and the /api/chat, /api/research and /api/proposals endpoints.
// Usage: npm run build && ANTHROPIC_API_KEY=... npm start
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleChat } from './chat.mjs';
import { handleResearch, handleProposals } from './research.mjs';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};

createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/api/chat') return handleChat(req, res);
  if (path === '/api/research') return handleResearch(req, res);
  if (path.startsWith('/api/proposals')) return handleProposals(req, res);

  const file = normalize(join(DIST, path === '/' ? 'index.html' : path));
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    // Single-page app: unknown paths get the shell
    const html = await readFile(join(DIST, 'index.html'));
    res.writeHead(200, { 'Content-Type': TYPES['.html'] }).end(html);
  }
}).listen(PORT, () => console.log(`GraphEmber on http://localhost:${PORT}`));
