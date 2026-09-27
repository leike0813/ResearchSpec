import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { assessmentDir, attemptDir, campaignDir, loadCatalog, matrixCaseDir, matrixState, readJson, sha, toolIds } from './lib.mjs';
import { adapters } from './hosts.mjs';
import { assessmentState } from './assessment.mjs';
import { acceptReviews } from './review.mjs';

const publicRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../harness/dogfood/public');
const headers = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Cache-Control': 'no-store',
};
function send(res, code, body, type = 'application/json; charset=utf-8') {
  res.writeHead(code, { ...headers, 'Content-Type': type });
  res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
}
function sessionFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  function walk(at) {
    for (const entry of fs.readdirSync(at, { withFileTypes: true })) {
      const full = path.join(at, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.push({ path: path.relative(dir, full), size: fs.statSync(full).size, kind: /\.(json|jsonl|ndjson|yaml|yml|md|txt|stdout|stderr)$/i.test(full) ? 'text' : 'binary' });
    }
  }
  walk(dir);
  return files;
}
function sessions(root, campaignId) {
  const dir = path.join(campaignDir(root, campaignId), 'sessions');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter(x => x.isDirectory()).flatMap(x => {
    const file = path.join(dir, x.name, 'session.json');
    return fs.existsSync(file) ? [readJson(file)] : [];
  }).sort((a, b) => a.host.localeCompare(b.host) || a.scenario.localeCompare(b.scenario) || a.ordinal - b.ordinal);
}
function serveFile(res, dir, relative, download) {
  const entry = sessionFiles(dir).find(x => x.path === relative);
  if (!entry) return send(res, 404, { error: 'unknown_file' });
  const actual = fs.realpathSync(path.join(dir, relative));
  if (!actual.startsWith(`${fs.realpathSync(dir)}${path.sep}`)) return send(res, 403, { error: 'unsafe_file' });
  if (download) {
    res.writeHead(200, { ...headers, 'Content-Type': 'application/octet-stream', 'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(path.basename(relative))}`, 'Content-Length': entry.size });
    fs.createReadStream(actual).on('error', () => res.destroy()).pipe(res);
    return;
  }
  if (entry.size > 1024 * 1024) return send(res, 413, { error: 'preview_too_large' });
  if (entry.kind !== 'text') return send(res, 415, { error: 'binary_preview_unavailable' });
  return send(res, 200, fs.readFileSync(actual), 'text/plain; charset=utf-8');
}
export async function startServer(root, campaignId, port = 0) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid review port');
  const registered = await toolIds();
  const reviewToken = crypto.randomBytes(24).toString('hex');
  let origin;
  async function receiveReview(req, res, sessionId) {
    try {
      if (readJson(path.join(campaignDir(root, campaignId), 'campaign.json')).schema_version !== '2') return send(res, 403, { error: 'historical_campaign_read_only' });
      if (req.headers.origin !== origin || req.headers.host !== new URL(origin).host || req.headers['x-dogfood-review-token'] !== reviewToken || req.headers['content-type'] !== 'application/json') return send(res, 403, { error: 'review_request_forbidden' });
      const chunks = []; let size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > 128 * 1024) return send(res, 413, { error: 'review_too_large' }); chunks.push(chunk); }
      const review = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (review.session_id !== sessionId || assessmentState(root, campaignId, sessionId).status !== 'ready') return send(res, 409, { error: 'report_not_ready' });
      const reportFile = path.join(assessmentDir(root, campaignId, sessionId), 'report.json');
      if (review.report_hash !== sha(fs.readFileSync(reportFile))) return send(res, 409, { error: 'stale_report' });
      return send(res, 200, acceptReviews(root, campaignId, [review], { allowAmend: true }));
    } catch (error) { return send(res, 400, { error: error.message }); }
  }
  const server = createServer((req, res) => {
    try {
      if (req.headers.host !== new URL(origin || 'http://127.0.0.1').host) return send(res, 403, { error: 'invalid_host' });
      const url = new URL(req.url, 'http://127.0.0.1');
      const pathname = url.pathname;
      const reviewMatch = /^\/api\/sessions\/([a-z0-9-]+)\/review$/.exec(pathname);
      if (req.method === 'POST' && reviewMatch) return void receiveReview(req, res, reviewMatch[1]);
      if (req.method !== 'GET') return send(res, 405, { error: 'method_not_allowed' });
      if (pathname === '/api/campaign') {
        const campaign = readJson(path.join(campaignDir(root, campaignId), 'campaign.json'));
        const matrix = campaign.schema_version === '2' ? campaign.selection.matrix.targets.flatMap(target => campaign.selection.matrix.modes.map(mode => ({ target, mode, ...matrixState(root, campaignId, target, mode) }))) : [];
        return send(res, 200, { ...campaign, historical: campaign.schema_version !== '2', matrix, review_token: campaign.schema_version === '2' ? reviewToken : null, sessions: sessions(root, campaignId).map(s => ({ ...s, assessment: assessmentState(root, campaignId, s.id) })), registered_targets: registered.map(id => ({ id, runnable: !!adapters[id] && id !== 'agents' })) });
      }
      if (pathname === '/api/scenarios') {
        const { catalog } = loadCatalog();
        return send(res, 200, { scenarios: catalog.scenarios.map(x => ({ scenario_id: x.scenario_id, title: x.title, intent: x.intent, fixture_variant: x.fixture_variant, hard_assertions: x.hard_assertions })) });
      }
      const matrixMatch = /^\/api\/matrix\/([a-z0-9-]+)\/(skills|commands|both)(?:\/(.*))?$/.exec(pathname);
      if (matrixMatch) {
        const campaign = readJson(path.join(campaignDir(root, campaignId), 'campaign.json'));
        const [, target, mode, tail] = matrixMatch;
        if (campaign.schema_version !== '2' || !campaign.selection.matrix.targets.includes(target) || !campaign.selection.matrix.modes.includes(mode)) return send(res, 404, { error: 'unknown_matrix_case' });
        const dir = matrixCaseDir(root, campaignId, target, mode);
        if (!tail) return send(res, 200, { state: matrixState(root, campaignId, target, mode), report: fs.existsSync(path.join(dir, 'report.json')) ? readJson(path.join(dir, 'report.json')) : null, files: sessionFiles(dir) });
        if (tail.startsWith('files/')) return serveFile(res, dir, decodeURIComponent(tail.slice(6)), url.searchParams.get('download') === '1');
        return send(res, 404, { error: 'not_found' });
      }
      const sessionMatch = /^\/api\/sessions\/([a-z0-9-]+)(?:\/(.*))?$/.exec(pathname);
      if (sessionMatch) {
        const dir = attemptDir(root, campaignId, sessionMatch[1]);
        const file = path.join(dir, 'session.json');
        if (!fs.existsSync(file)) return send(res, 404, { error: 'unknown_session' });
        const tail = sessionMatch[2];
        if (!tail) return send(res, 200, { session: readJson(file), files: sessionFiles(dir), assessment: assessmentState(root, campaignId, sessionMatch[1]) });
        if (tail === 'report') {
          const reportFile = path.join(assessmentDir(root, campaignId, sessionMatch[1]), 'report.json');
          if (!fs.existsSync(reportFile)) return send(res, 404, { error: 'report_not_ready' });
          return send(res, 200, { report: readJson(reportFile), hash: sha(fs.readFileSync(reportFile)) });
        }
        if (tail === 'review') {
          const reviewFile = path.join(dir, 'review.json');
          return fs.existsSync(reviewFile) ? send(res, 200, { review: readJson(reviewFile), hash: sha(JSON.stringify(readJson(reviewFile))) }) : send(res, 404, { error: 'unreviewed' });
        }
        if (tail === 'evidence') {
          const event = Number(url.searchParams.get('event'));
          const from = Number(url.searchParams.get('from'));
          const to = Number(url.searchParams.get('to'));
          if (Number.isSafeInteger(event) && event > 0 || Number.isSafeInteger(from) && from > 0 && Number.isSafeInteger(to) && to >= from) {
            const eventsFile = path.join(dir, 'events.ndjson');
            if (!fs.existsSync(eventsFile) || fs.statSync(eventsFile).size > 20 * 1024 * 1024) return send(res, 404, { error: 'events_unavailable' });
            const values = fs.readFileSync(eventsFile, 'utf8').split('\n').filter(Boolean).map(x => JSON.parse(x)).filter(x => event > 0 ? x.seq === event : x.seq >= from && x.seq <= to).slice(0, 50);
            return send(res, 200, { events: values, truncated: !event && to - from + 1 > 50 });
          }
          const relative = url.searchParams.get('file'); const line = Number(url.searchParams.get('line'));
          if (!relative || !Number.isSafeInteger(line) || line < 1 || relative !== 'packet.json' && !sessionFiles(dir).some(x => x.path === relative && x.kind === 'text')) return send(res, 404, { error: 'unknown_evidence' });
          const rootDir = relative === 'packet.json' ? assessmentDir(root, campaignId, sessionMatch[1]) : dir;
          const target = fs.realpathSync(path.join(rootDir, relative));
          if (!target.startsWith(`${fs.realpathSync(rootDir)}${path.sep}`) || fs.statSync(target).size > 20 * 1024 * 1024) return send(res, 403, { error: 'unsafe_evidence' });
          const lines = fs.readFileSync(target, 'utf8').split('\n');
          if (line > lines.length) return send(res, 404, { error: 'unknown_line' });
          const start = Math.max(1, line - 4), end = Math.min(lines.length, line + 7);
          return send(res, 200, { file: relative, line, start, lines: lines.slice(start - 1, end).map(x => x.slice(0, 5000)) });
        }
        if (tail === 'events') {
          const eventFile = path.join(dir, 'events.ndjson');
          const requested = Number(url.searchParams.get('offset') || 0);
          const offset = Number.isSafeInteger(requested) && requested >= 0 ? requested : 0;
          if (!fs.existsSync(eventFile)) return send(res, 200, { events: [], next: 0 });
          const size = fs.statSync(eventFile).size;
          const start = Math.min(offset, size);
          const bytes = Buffer.allocUnsafe(Math.min(256 * 1024, size - start));
          const fd = fs.openSync(eventFile, 'r');
          let count;
          try { count = fs.readSync(fd, bytes, 0, bytes.length, start); } finally { fs.closeSync(fd); }
          const chunk = bytes.subarray(0, count);
          const events = [];
          let consumed = 0;
          while (events.length < 200) {
            const end = chunk.indexOf(10, consumed);
            if (end < 0) break;
            try { events.push(JSON.parse(chunk.subarray(consumed, end).toString('utf8'))); } catch { /* keep raw trace for audit */ }
            consumed = end + 1;
          }
          return send(res, 200, { events, next: start + consumed });
        }
        if (tail.startsWith('files/')) {
          const relative = decodeURIComponent(tail.slice(6));
          return serveFile(res, dir, relative, url.searchParams.get('download') === '1');
        }
      }
      const assets = { '/': ['index.html', 'text/html; charset=utf-8'], '/app.js': ['app.js', 'text/javascript; charset=utf-8'], '/styles.css': ['styles.css', 'text/css; charset=utf-8'], '/matrix.css': ['matrix.css', 'text/css; charset=utf-8'] };
      const asset = assets[pathname] || (/^\/campaign\/[A-Za-z0-9-]+$/.test(pathname) ? assets['/'] : null);
      if (!asset) return send(res, 404, { error: 'not_found' });
      return send(res, 200, fs.readFileSync(path.join(publicRoot, asset[0])), asset[1]);
    } catch (error) { return send(res, 500, { error: error.message }); }
  });
  await new Promise((resolve, reject) => server.once('error', reject).listen(port, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  return { server, url: `http://127.0.0.1:${server.address().port}/campaign/${campaignId}` };
}
