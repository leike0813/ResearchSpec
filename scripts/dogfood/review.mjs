import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { assessmentDir, attemptDir, buildHash, campaignDir, evidenceHash, fail, id, loadCatalog, matrixCaseDir, matrixState, playbookRoot, readJson, repoRoot, rubricKeys, sha, writeJson } from './lib.mjs';

function sessions(root, campaign) {
  return campaign.sessions.map(x => readJson(path.join(attemptDir(root, campaign.id, x.id), 'session.json')));
}
function validScores(scores) { return rubricKeys.every(key => Number.isInteger(scores?.[key]) && scores[key] >= 0 && scores[key] <= 3); }

export function importReview(root, campaignId, file) {
  const imported = readJson(path.resolve(file));
  if (imported.schema_version !== '2' || imported.campaign_id !== campaignId || !Array.isArray(imported.reviews)) fail('Review campaign/schema mismatch');
  return acceptReviews(root, campaignId, imported.reviews);
}

export function acceptReviews(root, campaignId, reviews, { allowAmend = false } = {}) {
  const campaign = readJson(path.join(campaignDir(root, campaignId), 'campaign.json'));
  if (campaign.schema_version !== '2') fail('Historical campaign is read-only');
  const { catalog, hash } = loadCatalog();
  if (campaign.catalog_hash && campaign.catalog_hash !== hash) fail('Scenario catalog changed since campaign creation');
  const scenarios = new Map(catalog.scenarios.map(s => [s.scenario_id, s]));
  const accepted = [];
  const seen = new Set();
  for (const review of reviews) {
    if (!campaign.sessions.some(s => s.id === review.session_id)) fail(`Unknown session: ${review.session_id}`);
    if (seen.has(review.session_id)) fail(`Duplicate review: ${review.session_id}`);
    seen.add(review.session_id);
    const dir = attemptDir(root, campaignId, review.session_id);
    const session = readJson(path.join(dir, 'session.json'));
    if (!['sealed', 'blocked'].includes(session.state)) fail(`Session evidence is incomplete: ${review.session_id}`);
    if (session.evidence_hash !== review.evidence_hash || evidenceHash(dir) !== review.evidence_hash) fail(`Stale or modified evidence: ${review.session_id}`);
    const priorFile = path.join(dir, 'review.json');
    const prior = fs.existsSync(priorFile) ? readJson(priorFile) : null;
    if (prior && (!allowAmend || !review.amend_reason?.trim() || review.expected_review_hash !== sha(JSON.stringify(prior)))) fail(`Already reviewed or stale amendment: ${review.session_id}`);
    const reportFile = path.join(assessmentDir(root, campaignId, review.session_id), 'report.json');
    if (review.report_hash && (!fs.existsSync(reportFile) || sha(fs.readFileSync(reportFile)) !== review.report_hash)) fail(`Stale assessment report: ${review.session_id}`);
    if (typeof review.reviewer !== 'string' || !review.reviewer.trim() || !['pass', 'fail', 'blocked', 'invalid'].includes(review.verdict)) fail(`Incomplete reviewer/verdict: ${review.session_id}`);
    const assertions = scenarios.get(session.scenario)?.hard_assertions || [];
    if (!Array.isArray(review.assertions) || review.assertions.length !== assertions.length || review.assertions.some((x, i) => x.index !== i || !['yes', 'no', 'unknown'].includes(x.result))) fail(`Incomplete assertions: ${review.session_id}`);
    if (!['yes', 'no', 'unknown'].includes(review.precondition)) fail(`Missing precondition: ${review.session_id}`);
    if (!Number.isInteger(review.human_corrections) || review.human_corrections < 0 || !Number.isInteger(review.resume_attempts) || review.resume_attempts < 0 || !Number.isInteger(review.successful_resumes) || review.successful_resumes < 0 || review.successful_resumes > review.resume_attempts) fail(`Invalid counters: ${review.session_id}`);
    if (review.verdict === 'pass') {
      if (session.state !== 'sealed') fail(`Blocked session cannot pass: ${review.session_id}`);
      if (review.precondition !== 'yes' || review.assertions.some(x => x.result !== 'yes' || typeof x.evidence !== 'string' || !x.evidence.trim()) || !validScores(review.scores) || rubricKeys.some(key => review.scores[key] === 0) || rubricKeys.reduce((sum, key) => sum + review.scores[key], 0) < 9) fail(`Pass violates rubric: ${review.session_id}`);
      const before = session.legacy ? 'before-status.json' : 'before-status.stdout';
      const after = session.legacy ? 'after-status.json' : 'after-status.stdout';
      if (session.exit_code !== 0 || session.diagnostics_error || session.evidence_gaps?.length || !fs.existsSync(path.join(dir, 'trace.jsonl')) || !fs.existsSync(path.join(dir, before)) || !fs.existsSync(path.join(dir, after))) fail(`Pass lacks complete evidence: ${review.session_id}`);
    } else if (!review.reason?.trim()) fail(`Reason required: ${review.session_id}`);
    if (review.verdict === 'invalid' && review.precondition === 'yes') fail(`Invalid verdict contradicts precondition: ${review.session_id}`);
    if (review.verdict === 'blocked' && session.state === 'sealed' && session.exit_code === 0) fail(`Blocked verdict contradicts successful host exit: ${review.session_id}`);
    accepted.push({ dir, session, prior, review: { ...review, reviewed_at: review.reviewed_at || new Date().toISOString() } });
  }
  for (const item of accepted) {
    if (item.prior) {
      const history = path.join(item.dir, 'reviews');
      fs.mkdirSync(history, { recursive: true });
      writeJson(path.join(history, `${Date.now()}-${sha(JSON.stringify(item.prior)).slice(0, 8)}.json`), item.prior);
    }
    writeJson(path.join(item.dir, 'review.json'), item.review);
    writeJson(path.join(item.dir, 'session.json'), { ...item.session, review_status: item.review.verdict });
  }
  return { imported: accepted.length, campaign_id: campaignId };
}

function aggregate(campaign, records) {
  const rows = [];
  for (const host of campaign.selection.hosts) for (const scenario of campaign.selection.scenarios) {
    const relevant = records.filter(s => s.host === host && s.scenario === scenario);
    const reviewed = relevant.filter(s => fs.existsSync(path.join(attemptDir(campaign.state_root, campaign.id, s.id), 'review.json'))).map(s => ({ session: s, review: readJson(path.join(attemptDir(campaign.state_root, campaign.id, s.id), 'review.json')) }));
    const failures = reviewed.filter(x => x.review.verdict === 'fail');
    const passes = reviewed.filter(x => x.review.verdict === 'pass');
    rows.push({ host, scenario, attempts: relevant.length, passes: passes.length, failures: failures.length, blocked: reviewed.filter(x => x.review.verdict === 'blocked').length, invalid: reviewed.filter(x => x.review.verdict === 'invalid').length, status: failures.length ? 'fail' : passes.length >= 2 ? 'pass' : 'incomplete', reviewed });
  }
  return rows;
}
function redact(value, campaign) {
  return String(value).replaceAll(repoRoot, '[ResearchSpec source]').replaceAll(campaign.state_root, '[evidence]').replace(/\/home\/[^\s'"`<>)]*/g, '[user path]');
}
export function report(root, campaignId, write = false) {
  const campaign = readJson(path.join(campaignDir(root, campaignId), 'campaign.json'));
  if (write && campaign.schema_version !== '2') fail('Historical campaign is read-only');
  if (write && campaign.build_hash !== buildHash()) fail('Campaign source changed; start a new campaign before publishing evidence');
  const { catalog, hash } = loadCatalog();
  if (campaign.catalog_hash && campaign.catalog_hash !== hash) fail('Scenario catalog changed since campaign creation');
  campaign.state_root = root;
  const records = sessions(root, campaign);
  for (const session of records) if (session.review_status && session.review_status !== 'unreviewed' && evidenceHash(attemptDir(root, campaign.id, session.id)) !== session.evidence_hash) fail(`Reviewed evidence changed: ${session.id}`);
  const rows = aggregate(campaign, records);
  const matrix = campaign.schema_version === '2' ? campaign.selection.matrix.targets.flatMap(target => campaign.selection.matrix.modes.map(mode => ({ target, mode, ...matrixState(root, campaign.id, target, mode) }))) : [];
  const matrixPass = matrix.length > 0 && matrix.every(item => item.status === 'pass');
  const behaviorPass = rows.length > 0 && catalog.suites['natural-18'].length === campaign.selection.scenarios.length && catalog.suites['natural-18'].every(x => campaign.selection.scenarios.includes(x)) && rows.every(row => row.status === 'pass');
  const text = ['# Dogfooding campaign ' + campaign.id, '', ...(campaign.schema_version === '2' ? [`Init projection: ${matrix.filter(x => x.status === 'pass').length}/${matrix.length} passed; ${matrix.filter(x => x.status === 'fail').length} failed.`, `Behavior host: ${campaign.selection.hosts[0] || 'none'}; full natural-18 result: ${rows.length ? behaviorPass ? 'pass' : 'incomplete or failed' : 'not run'}.`, `Combined release gate: ${matrixPass && behaviorPass ? 'pass' : 'not met'}.`, '', '| Target | skills | commands | both |', '| --- | --- | --- | --- |', ...campaign.selection.matrix.targets.map(target => `| ${target} | ${campaign.selection.matrix.modes.map(mode => { const item = matrix.find(x => x.target === target && x.mode === mode); return `[${item.status}](matrix/${target}/${mode}/report.json)`; }).join(' | ')} |`), '', '## Single-host behavior', ''] : ['Historical per-host behavior records; read-only.', '']), '| Host | Scenario | Pass | Fail | Blocked | Invalid | Status | Reviewed attempts |', '| --- | --- | ---: | ---: | ---: | ---: | --- | --- |', ...rows.map(r => `| ${r.host} | ${r.scenario} | ${r.passes} | ${r.failures} | ${r.blocked} | ${r.invalid} | ${r.status} | ${r.reviewed.map(x => `[${x.session.id}](${r.host}/${r.scenario}/${x.session.id}/manifest.json)`).join(', ') || '—'} |`), ''].join('\n');
  if (!write) return text;
  if (!matrixPass) fail('Cannot publish a release report until every init projection check passes');
  if (rows.length && !records.some(s => s.review_status && s.review_status !== 'unreviewed')) fail('No imported human reviews to report');
  const evidenceRoot = path.join(playbookRoot, 'evidence', campaign.id);
  if (fs.existsSync(evidenceRoot)) fail(`Curated evidence already exists: ${evidenceRoot}`);
  const tableFile = path.join(playbookRoot, 'host-verification.md');
  let table = fs.readFileSync(tableFile, 'utf8');
  const natural = catalog.suites['natural-18'];
  for (const host of campaign.schema_version === '2' ? [] : campaign.selection.hosts) {
    const hostRows = rows.filter(r => r.host === host);
    const verified = natural.length === campaign.selection.scenarios.length && natural.every(x => campaign.selection.scenarios.includes(x)) && hostRows.every(r => r.status === 'pass');
    const line = table.split('\n').find(x => x.startsWith(`| \`${host}\` |`));
    if (!line) fail(`Host verification row missing: ${host}`);
    const reviewed = records.filter(s => s.host === host && s.review_status && s.review_status !== 'unreviewed');
    const corrections = reviewed.reduce((sum, s) => sum + (readJson(path.join(attemptDir(root, campaign.id, s.id), 'review.json')).human_corrections || 0), 0);
    const reviews = reviewed.map(s => readJson(path.join(attemptDir(root, campaign.id, s.id), 'review.json')));
    const attempts = reviews.reduce((sum, r) => sum + r.resume_attempts, 0);
    const successes = reviews.reduce((sum, r) => sum + r.successful_resumes, 0);
    const scores = reviews.filter(r => rubricKeys.every(key => Number.isInteger(r.scores?.[key])));
    const observed = [...new Set(reviewed.map(s => s.observed_model).filter(Boolean))];
    const average = key => scores.length ? (scores.reduce((sum, r) => sum + r.scores[key], 0) / scores.length).toFixed(2) : '—';
    const cols = line.split('|');
    cols[5] = ` ${verified ? 'verified' : 'unverified'} `;
    cols[6] = ` \`${campaign.host_versions?.[host] || '—'}\` `;
    cols[7] = observed.length === 1 ? ` \`${observed[0]}\` (调用参数 \`${campaign.selection.models?.[host] || '—'}\`) ` : ` \`${campaign.selection.models?.[host] || '—'}\` `;
    cols[8] = ` ${reviewed.length} `;
    cols[9] = ` ${corrections} `;
    cols[10] = ` ${attempts} / ${successes} / ${attempts ? `${Math.round(successes / attempts * 100)}%` : 'N/A'} `;
    cols[11] = ` ${rubricKeys.map(average).join(' / ')} `;
    cols[12] = ` [campaign evidence](evidence/${campaign.id}/summary.md) `;
    table = table.replace(line, cols.join('|'));
  }
  if (campaign.schema_version === '2') {
    for (const item of matrix) {
      const from = matrixCaseDir(root, campaign.id, item.target, item.mode);
      const to = path.join(evidenceRoot, 'matrix', item.target, item.mode);
      fs.mkdirSync(to, { recursive: true });
      for (const file of sessionFilesForExport(from)) {
        const destination = path.join(to, file);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        const source = path.join(from, file);
        if (/\.(md|txt|json|jsonl|ndjson|yaml|yml|csv|tsv|stdout|stderr)$/i.test(file)) fs.writeFileSync(destination, redact(fs.readFileSync(source, 'utf8'), campaign));
        else fs.copyFileSync(source, destination);
      }
    }
    table += `\n\n## Current acceptance campaign\n\n- Init projection: ${matrix.filter(x => x.status === 'pass').length}/${matrix.length} checks passed ([evidence](evidence/${campaign.id}/summary.md)).\n- Single-host behavior: ${campaign.selection.hosts[0] || 'not selected'}; natural-18 ${behaviorPass ? 'passed' : 'not yet passed'} after human review.\n- Other hosts' Agent behavior: unverified by this campaign.\n`;
  }
  for (const s of records) {
    if (!s.review_status || s.review_status === 'unreviewed') continue;
    const from = attemptDir(root, campaign.id, s.id);
    const to = path.join(evidenceRoot, s.host, s.scenario, s.id);
    fs.mkdirSync(to, { recursive: true });
    for (const name of ['prompts.md', 'events.ndjson', 'file-diff.json', 'before-files.json', 'after-files.json', 'before-status.stdout', 'after-status.stdout', 'before-check.stdout', 'after-check.stdout', 'review.json']) {
      const source = path.join(from, name);
      if (fs.existsSync(source)) fs.writeFileSync(path.join(to, name), redact(fs.readFileSync(source, 'utf8'), campaign));
    }
    const assessment = assessmentDir(root, campaign.id, s.id);
    const assessmentJson = path.join(assessment, 'report.json');
    if (fs.existsSync(assessmentJson)) fs.writeFileSync(path.join(to, 'assessment.json'), redact(fs.readFileSync(assessmentJson, 'utf8'), campaign));
    const assessmentMarkdown = path.join(assessment, 'report.md');
    if (fs.existsSync(assessmentMarkdown)) {
      const localLinks = fs.readFileSync(assessmentMarkdown, 'utf8').replace(/\[([^\]]+)\]\((?:\.\.\/\.\.\/sessions\/[^)]+|packet\.json#[^)]+)\)/g, '`$1`');
      fs.writeFileSync(path.join(to, 'assessment.md'), redact(localLinks, campaign));
    }
    function copyTree(sourceDir, targetDir) {
      if (!fs.existsSync(sourceDir)) return;
      fs.mkdirSync(targetDir, { recursive: true });
      for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
        const source = path.join(sourceDir, entry.name);
        const target = path.join(targetDir, entry.name);
        if (entry.isDirectory()) copyTree(source, target);
        else if (entry.isFile()) {
          if (/\.(md|txt|json|jsonl|ndjson|yaml|yml|csv|tsv)$/i.test(entry.name)) fs.writeFileSync(target, redact(fs.readFileSync(source, 'utf8'), campaign));
          else fs.copyFileSync(source, target);
        }
      }
    }
    for (const subtree of ['deliverables', 'authority']) copyTree(path.join(from, subtree), path.join(to, subtree));
    writeJson(path.join(to, 'manifest.json'), { host: s.host, scenario: s.scenario, model: s.requested_model, observed_model: s.observed_model, host_version: s.host_version, result: s.review_status, evidence_hash: s.evidence_hash, raw_trace_location: 'local campaign archive' });
  }
  fs.writeFileSync(path.join(evidenceRoot, 'summary.md'), text);
  fs.writeFileSync(tableFile, table);
  return `${text}\nWritten ${evidenceRoot} and host-verification.md`;
}

function sessionFilesForExport(root) {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.push(path.relative(root, full));
    }
  }
  walk(root);
  return files;
}

export function importLegacy(root, rawRoot) {
  const source = path.join(playbookRoot, 'evidence');
  const legacyId = `legacy-${id()}`;
  const target = campaignDir(root, legacyId);
  const manifests = [];
  function walk(at) {
    for (const entry of fs.readdirSync(at, { withFileTypes: true })) {
      if (entry.name === 'summary.md' || entry.name === 'index.md') continue;
      const full = path.join(at, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'manifest.yaml' && !full.includes('/legacy-')) manifests.push(full);
    }
  }
  walk(source);
  const formal = manifests.filter(file => ['pass', 'fail', 'blocked', 'invalid'].includes(YAML.parse(fs.readFileSync(file, 'utf8')).result));
  const campaign = { id: legacyId, schema_version: '1', status: 'legacy', created_at: new Date().toISOString(), catalog_hash: loadCatalog().hash, selection: { hosts: [...new Set(formal.map(p => path.relative(source, p).split(path.sep)[0]))], scenarios: [...new Set(formal.map(p => path.relative(source, p).split(path.sep)[1]))], repeat: 2, jobs: 1, timeout_sec: 600, models: {} }, sessions: [], legacy: true };
  campaign.host_versions = {};
  fs.mkdirSync(path.join(target, 'sessions'), { recursive: true });
  for (const file of formal) {
    const [host, scenario, oldSession] = path.relative(source, file).split(path.sep);
    const old = YAML.parse(fs.readFileSync(file, 'utf8'));
    if (old.agent?.model_version && !campaign.selection.models[host]) campaign.selection.models[host] = old.agent.model_version;
    if (old.agent?.host_version && !campaign.host_versions[host]) campaign.host_versions[host] = old.agent.host_version;
    const attemptId = `${host}--${scenario.toLowerCase()}--${oldSession}`;
    const dir = attemptDir(root, legacyId, attemptId);
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(file, path.join(dir, 'legacy-manifest.yaml'));
    for (const entry of fs.readdirSync(path.dirname(file), { withFileTypes: true })) if (entry.name !== 'manifest.yaml') fs.cpSync(path.join(path.dirname(file), entry.name), path.join(dir, entry.name), { recursive: true });
    const toolSummary = path.join(dir, 'tool-calls.md');
    if (fs.existsSync(toolSummary)) fs.writeFileSync(path.join(dir, 'events.ndjson'), `${JSON.stringify({ seq: 1, type: 'legacy-summary', label: '旧工具调用摘要；完整记录见 tool-calls.md', detail: fs.readFileSync(toolSummary, 'utf8').slice(0, 12000) })}\n`);
    const raw = rawRoot ? path.join(path.resolve(rawRoot), host, scenario, oldSession, 'trace.jsonl') : old.raw_trace;
    const gaps = [];
    if (raw && fs.existsSync(raw)) fs.copyFileSync(raw, path.join(dir, 'trace.jsonl')); else gaps.push('raw_trace_missing');
    for (const relative of old.evidence_paths || []) if (!path.isAbsolute(relative) && !relative.startsWith('..') && !fs.existsSync(path.join(dir, relative))) gaps.push(`missing:${relative}`);
    const session = { id: attemptId, host, scenario, ordinal: Number(oldSession.replace(/\D/g, '')) || 1, state: 'sealed', legacy: true, review_status: 'unreviewed', provisional_verdict: old.result, provisional_scores: old.scores, provisional_failures: old.hard_failures, requested_model: old.agent?.model_version, host_version: old.agent?.host_version, evidence_gaps: gaps, exit_code: old.result === 'blocked' ? null : 0, started_at: old.started_at, completed_at: old.completed_at };
    writeJson(path.join(dir, 'session.json'), session);
    writeJson(path.join(dir, 'session.json'), { ...session, evidence_hash: evidenceHash(dir) });
    campaign.sessions.push({ id: attemptId, host, scenario, ordinal: session.ordinal });
  }
  writeJson(path.join(target, 'campaign.json'), campaign);
  return { campaign_id: legacyId, imported: campaign.sessions.length, raw_missing: campaign.sessions.map(x => readJson(path.join(attemptDir(root, legacyId, x.id), 'session.json'))).filter(x => x.evidence_gaps.includes('raw_trace_missing')).length };
}
