#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { adapters, resolveBinary } from './dogfood/hosts.mjs';
import { assessmentDir, attemptDir, buildHash, campaignDir, campaignsRoot, evidenceHash, fail, id, loadCatalog, loadCampaignCatalog, loadConfig, matrixCaseDir, matrixState, readJson, repoRoot, resolveSelection, run, sha, toolIds, writeJson } from './dogfood/lib.mjs';
import { startServer } from './dogfood/server.mjs';
import { importReview, importLegacy, report } from './dogfood/review.mjs';
import { assessmentState } from './dogfood/assessment.mjs';

const exec = promisify(execFile);
const command = process.argv[2];
const args = parse(process.argv.slice(3));
const root = campaignsRoot;
const orca = process.platform === 'linux' && !process.env.ORCA_CLI_COMMAND ? 'orca-ide' : process.env.ORCA_CLI_COMMAND || 'orca';

function parse(values) {
  const result = { host: [], scenario: [], model: [] };
  const map = { '--config': 'config', '--host': 'host', '--behavior-host': 'behaviorHost', '--scenario': 'scenario', '--suite': 'suite', '--repeat': 'repeat', '--jobs': 'jobs', '--timeout-sec': 'timeoutSec', '--model': 'model', '--assessor-host': 'assessorHost', '--assessor-model': 'assessorModel', '--assess-jobs': 'assessJobs', '--session': 'session', '--campaign': 'campaign', '--file': 'file', '--port': 'port', '--raw-root': 'rawRoot' };
  for (let i = 0; i < values.length; i++) {
    const key = values[i];
    if (['--full', '--no-ui', '--open-ui', '--write', '--help', '-h'].includes(key)) result[{ '--full': 'full', '--no-ui': 'noUi', '--open-ui': 'openUi', '--write': 'write', '--help': 'help', '-h': 'help' }[key]] = true;
    else if (map[key]) {
      const value = values[++i];
      if (!value || value.startsWith('--')) fail(`Missing value for ${key}`);
      if (key === '--behavior-host' && result.behaviorHost !== undefined) fail('Select exactly one --behavior-host');
      if (Array.isArray(result[map[key]])) result[map[key]].push(value);
      else result[map[key]] = value;
    } else fail(`Unknown option: ${key}`);
  }
  return result;
}
async function orcaJson(argv, timeout = 30000) {
  const { stdout } = await exec(orca, [...argv, '--json'], { cwd: repoRoot, timeout, maxBuffer: 4 * 1024 * 1024 });
  const result = JSON.parse(stdout);
  if (!result.ok) fail(`${orca} ${argv.join(' ')}: ${JSON.stringify(result.error || result)}`);
  return result.result;
}
function selectionSummary(selection) {
  const attempts = selection.hosts.length * selection.scenarios.length * selection.repeat;
  return { ...selection, init_calls: selection.matrix.targets.length * selection.matrix.modes.length, behavior_attempts: attempts, assessor_calls: attempts };
}
function verifyPrerequisites(selection, config) {
  if (!selection.hosts.length) return { binaries: {}, host_versions: {} };
  if (process.platform !== 'linux') fail('The formal dogfooding runner currently supports Linux only');
  run('bwrap', ['--version']);
  run('bwrap', ['--ro-bind', '/', '/', '--tmpfs', '/tmp', '--proc', '/proc', '--dev', '/dev', '--', '/bin/true']);
  if (selection.hosts.includes('oh-my-pi') || selection.assessor.host === 'oh-my-pi') run('sqlite3', ['--version']);
  const binaries = {};
  const host_versions = {};
  for (const host of new Set([...selection.hosts, selection.assessor.host])) {
    const binary = resolveBinary(config.hosts[host]?.binary || adapters[host].binary);
    if (!binary) fail(`Host binary missing: ${host}`);
    binaries[host] = binary;
    host_versions[host] = run(binary, ['--version']).trim().split('\n')[0];
  }
  return { binaries, host_versions };
}
async function context() {
  const status = await orcaJson(['status']);
  if (status.runtime?.state !== 'ready') fail('Orca runtime is not ready');
  const current = await orcaJson(['worktree', 'current']);
  if (path.resolve(current.worktree?.path || '') !== repoRoot) fail('Run from the Orca-registered ResearchSpec worktree');
  return { version: status.runtime?.appVersion || '', worktree: current.worktree.id };
}
function attemptId(host, scenario, ordinal) { return `${host}--${scenario.toLowerCase()}--${String(ordinal).padStart(2, '0')}`; }
function newAttempt(campaign, host, scenario, ordinal, replacementOf = null) {
  const key = attemptId(host, scenario, ordinal);
  const existing = campaign.sessions.filter(s => s.id.startsWith(key));
  const sessionId = existing.length ? `${key}-retry-${existing.length}` : key;
  const session = { id: sessionId, host, scenario, ordinal, state: 'planned', requested_model: campaign.selection.models[host], replacement_of: replacementOf, review_status: 'unreviewed' };
  writeJson(path.join(attemptDir(root, campaign.id, sessionId), 'session.json'), session);
  campaign.sessions.push({ id: sessionId, host, scenario, ordinal });
  writeJson(path.join(campaignDir(root, campaign.id), 'campaign.json'), campaign);
  return session;
}
function lock(campaign) {
  const file = path.join(campaignDir(root, campaign.id), '.running.lock');
  try { fs.writeFileSync(file, String(process.pid), { flag: 'wx' }); }
  catch {
    const old = Number(fs.readFileSync(file, 'utf8'));
    try { process.kill(old, 0); fail(`Campaign already running in process ${old}`); }
    catch (error) { if (error.message.startsWith('Campaign already')) throw error; fs.unlinkSync(file); fs.writeFileSync(file, String(process.pid), { flag: 'wx' }); }
  }
  return () => { if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === String(process.pid)) fs.unlinkSync(file); };
}
let stopping = false;
const active = new Map();
const matrixChildren = new Set();
let standaloneServer;
process.on('SIGINT', () => {
  stopping = true;
  if (standaloneServer) standaloneServer.close();
  for (const handle of active.values()) void orcaJson(['terminal', 'send', '--terminal', handle, '--interrupt']).catch(() => {});
  for (const child of matrixChildren) child.kill('SIGINT');
});
async function runMatrix(campaign) {
  const pending = campaign.selection.matrix.targets.flatMap(target => campaign.selection.matrix.modes.map(mode => ({ target, mode }))).filter(({ target, mode }) => !['pass', 'fail'].includes(matrixState(root, campaign.id, target, mode).status));
  async function one({ target, mode }) {
    if (stopping) return;
    const child = spawn(process.execPath, [path.join(repoRoot, 'scripts/dogfood/matrix-worker.mjs'), root, campaign.id, target, mode], { cwd: repoRoot, stdio: 'ignore' });
    matrixChildren.add(child);
    const result = await new Promise(resolve => { child.once('error', error => resolve({ error })); child.once('close', code => resolve({ code })); });
    matrixChildren.delete(child);
    const state = matrixState(root, campaign.id, target, mode);
    if (state.status === 'running' || state.status === 'pending') writeJson(path.join(matrixCaseDir(root, campaign.id, target, mode), 'state.json'), { status: stopping ? 'interrupted' : 'fail', target, mode, issue: result.error?.message || `Matrix worker exited ${result.code}` });
  }
  await Promise.all(Array.from({ length: campaign.selection.matrix.jobs }, async () => {
    while (!stopping && pending.length) await one(pending.shift());
  }));
  return campaign.selection.matrix.targets.every(target => campaign.selection.matrix.modes.every(mode => matrixState(root, campaign.id, target, mode).status === 'pass'));
}
async function execute(campaign, session) {
  if (stopping) return;
  const worker = path.join(repoRoot, 'scripts/dogfood/worker.mjs');
  const shellQuote = value => `'${String(value).replaceAll("'", "'\\''")}'`;
  const cmd = [process.execPath, worker, root, campaign.id, session.id].map(shellQuote).join(' ');
  const created = await orcaJson(['terminal', 'create', '--worktree', `id:${campaign.orca.worktree}`, '--title', `Dogfood ${session.host} ${session.scenario}`, '--command', cmd]);
  const handle = created.terminal?.handle || created.handle || created.terminalHandle;
  if (!handle) fail(`Orca did not return a terminal handle: ${JSON.stringify(created)}`);
  active.set(session.id, handle);
  const file = path.join(attemptDir(root, campaign.id, session.id), 'session.json');
  writeJson(file, { ...readJson(file), terminal_handle: handle });
  try {
    const deadline = Date.now() + (campaign.selection.timeout_sec + 120) * 1000;
    while (Date.now() < deadline && !stopping) {
      if (['sealed', 'blocked', 'invalid', 'interrupted'].includes(readJson(file).state)) return;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    throw new Error(stopping ? 'Campaign interrupted' : 'Orca worker did not seal evidence before the deadline');
  } catch (error) {
    await orcaJson(['terminal', 'send', '--terminal', handle, '--interrupt']).catch(() => {});
    const current = readJson(file);
    if (!['sealed', 'blocked'].includes(current.state)) writeJson(file, { ...current, state: 'interrupted', issue: error.message, completed_at: new Date().toISOString() });
  } finally {
    active.delete(session.id);
    await orcaJson(['terminal', 'close', '--terminal', handle, '--tab']).catch(() => {});
  }
}
async function executeAssessment(campaign, session) {
  if (stopping || assessmentState(root, campaign.id, session.id).status === 'ready') return;
  writeJson(path.join(assessmentDir(root, campaign.id, session.id), 'state.json'), { status: 'queued', session_id: session.id, updated_at: new Date().toISOString() });
  const worker = path.join(repoRoot, 'scripts/dogfood/assessment-worker.mjs');
  const quote = value => `'${String(value).replaceAll("'", "'\\''")}'`;
  const cmd = [process.execPath, worker, root, campaign.id, session.id].map(quote).join(' ');
  const created = await orcaJson(['terminal', 'create', '--worktree', `id:${campaign.orca.worktree}`, '--title', `Assess ${session.host} ${session.scenario}`, '--command', cmd]);
  const handle = created.terminal?.handle || created.handle || created.terminalHandle;
  if (!handle) fail('Orca did not return an assessment terminal handle');
  active.set(`assess-${session.id}`, handle);
  try {
    const deadline = Date.now() + ((campaign.selection.assessor || readJson(path.join(campaignDir(root, campaign.id), 'assessor.json'))).timeout_sec + 120) * 1000;
    while (Date.now() < deadline && !stopping) {
      const status = assessmentState(root, campaign.id, session.id).status;
      if (status === 'ready' || status === 'failed') return;
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    throw new Error(stopping ? 'Assessment interrupted' : 'Assessor did not finish before deadline');
  } catch (error) {
    await orcaJson(['terminal', 'send', '--terminal', handle, '--interrupt']).catch(() => {});
    writeJson(path.join(assessmentDir(root, campaign.id, session.id), 'state.json'), { status: 'failed', issue: error.message, updated_at: new Date().toISOString() });
  } finally {
    active.delete(`assess-${session.id}`);
    await orcaJson(['terminal', 'close', '--terminal', handle, '--tab']).catch(() => {});
  }
}
async function assessQueue(campaign, pending, jobs, isDone = () => true) {
  let rateLimited = false;
  await Promise.all(Array.from({ length: jobs }, async () => {
    while (!stopping) {
      if (rateLimited) break;
      const session = pending.shift();
      if (!session) { if (isDone()) break; await new Promise(resolve => setTimeout(resolve, 100)); continue; }
      try { await executeAssessment(campaign, session); }
      catch (error) { writeJson(path.join(assessmentDir(root, campaign.id, session.id), 'state.json'), { status: 'failed', issue: error.message, updated_at: new Date().toISOString() }); }
      if (/429|Too Many Requests|rate.?limit/i.test(assessmentState(root, campaign.id, session.id).issue || '')) rateLimited = true;
    }
  }));
  return { rateLimited };
}
async function drive(campaign, ui = true) {
  const unlock = lock(campaign);
  let server;
  try {
    if (ui) {
      const opened = await startServer(root, campaign.id, Number(args.port || 0));
      server = opened.server;
      process.stdout.write(`Review: ${opened.url}\n`);
      if (args.openUi) {
        const worktree = campaign.orca?.worktree || (await context().catch(() => null))?.worktree;
        if (worktree) await orcaJson(['tab', 'create', '--worktree', `id:${worktree}`, '--url', opened.url]).catch(error => process.stderr.write(`Could not open Orca review tab: ${error.message}\n`));
      }
    }
    campaign.status = 'matrix-running'; writeJson(path.join(campaignDir(root, campaign.id), 'campaign.json'), campaign);
    const matrixOk = await runMatrix(campaign);
    if (stopping || !matrixOk) {
      campaign.status = stopping ? 'interrupted' : 'matrix-failed';
      writeJson(path.join(campaignDir(root, campaign.id), 'campaign.json'), campaign);
      if (!stopping) process.exitCode = 1;
      return;
    }
    if (!campaign.selection.hosts.length) {
      campaign.status = 'complete';
      writeJson(path.join(campaignDir(root, campaign.id), 'campaign.json'), campaign);
      return;
    }
    campaign.status = 'running'; writeJson(path.join(campaignDir(root, campaign.id), 'campaign.json'), campaign);
    const planned = campaign.sessions.map(x => readJson(path.join(attemptDir(root, campaign.id, x.id), 'session.json'))).filter(x => x.state === 'planned');
    const queue = [...planned];
    const assessmentQueue = [];
    let testingDone = false;
    const assessing = assessQueue(campaign, assessmentQueue, campaign.selection.assess_jobs || 1, () => testingDone);
    const busyHosts = new Set();
    async function job() {
      while (!stopping) {
        const index = queue.findIndex(x => !busyHosts.has(x.host));
        if (index < 0) { if (!queue.length) break; await new Promise(resolve => setTimeout(resolve, 100)); continue; }
        const session = queue.splice(index, 1)[0]; busyHosts.add(session.host);
        try { await execute(campaign, session); }
        catch (error) {
          const file = path.join(attemptDir(root, campaign.id, session.id), 'session.json');
          writeJson(file, { ...readJson(file), state: 'blocked', issue: `Orca dispatch failed: ${error.message}`, completed_at: new Date().toISOString(), evidence_hash: evidenceHash(path.dirname(file)) });
        } finally { busyHosts.delete(session.host); if (['sealed', 'blocked', 'interrupted'].includes(readJson(path.join(attemptDir(root, campaign.id, session.id), 'session.json')).state)) assessmentQueue.push(session); }
      }
    }
    await job();
    testingDone = true;
    const assessmentResult = await assessing;
    const failedAssessments = campaign.sessions.filter(x => assessmentState(root, campaign.id, x.id).status === 'failed').length;
    campaign.status = stopping ? 'interrupted' : failedAssessments || assessmentResult.rateLimited ? 'awaiting-assessment' : 'awaiting-review';
    writeJson(path.join(campaignDir(root, campaign.id), 'campaign.json'), campaign);
    process.stdout.write(`Campaign ${campaign.id}: ${campaign.status}\n`);
    if (failedAssessments) process.exitCode = 1;
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    unlock();
  }
}

async function main() {
  if (command === 'help' || command === '--help' || args.help) {
    process.stdout.write('Usage: pnpm dogfood <plan|run|resume|retry|assess|serve|import-review|report|legacy-import> [options]\n\nAll 36 registered targets are checked in skills, commands and both modes.\n--behavior-host ID [--config FILE] [--scenario ID | --suite ID] [--model ID=MODEL]\n--assessor-host ID --assessor-model MODEL --assess-jobs N\n--repeat N  --jobs N (matrix concurrency)  --timeout-sec N  --no-ui  --open-ui  --port N\n--campaign ID  --session ID  --file REVIEW.json  --raw-root DIR  --write\nCampaigns: .dogfood/campaigns/\nSee playbooks/dogfooding/README.md for command examples.\n');
    return;
  }
  if (command === 'plan' || command === 'run') {
    if (command === 'run') run('pnpm', ['build'], repoRoot, 300000);
    const config = args.config ? loadConfig(args.config) : { schema_version: '1', hosts: {} };
    const ids = await toolIds();
    const { catalog, hash } = loadCatalog();
    const selection = resolveSelection(args, config, catalog, ids, adapters);
    process.stdout.write(`${JSON.stringify(selectionSummary(selection), null, 2)}\n`);
    if (command === 'plan') { verifyPrerequisites(selection, config); return; }
    const prerequisite = verifyPrerequisites(selection, config);
    const orcaContext = selection.hosts.length ? await context() : null;
    const campaign = { id: id(), schema_version: '2', status: 'planned', created_at: new Date().toISOString(), selection, catalog_hash: hash, build_hash: buildHash(), orca: orcaContext, ...prerequisite, sessions: [] };
    fs.mkdirSync(path.join(campaignDir(root, campaign.id), 'sessions'), { recursive: true });
    const catalogBytes = fs.readFileSync(path.join(repoRoot, 'playbooks/dogfooding/scenarios.yaml'));
    if (sha(catalogBytes) !== hash) fail('Scenario catalog changed during campaign creation');
    fs.writeFileSync(path.join(campaignDir(root, campaign.id), 'catalog.yaml'), catalogBytes, { flag: 'wx' });
    writeJson(path.join(campaignDir(root, campaign.id), 'campaign.json'), campaign);
    for (const host of selection.hosts) for (const scenario of selection.scenarios) for (let ordinal = 1; ordinal <= selection.repeat; ordinal++) newAttempt(campaign, host, scenario, ordinal);
    process.stdout.write(`Campaign: ${campaign.id}\n`);
    await drive(campaign, !args.noUi);
  } else if (command === 'serve') {
    if (!args.campaign) fail('--campaign is required');
    const opened = await startServer(root, args.campaign, Number(args.port || 0));
    standaloneServer = opened.server;
    process.stdout.write(`Review: ${opened.url}\n`);
    if (args.openUi) { const c = readJson(path.join(campaignDir(root, args.campaign), 'campaign.json')); const worktree = c.orca?.worktree || (await context()).worktree; await orcaJson(['tab', 'create', '--worktree', `id:${worktree}`, '--url', opened.url]).catch(error => process.stderr.write(`Could not open Orca review tab: ${error.message}\n`)); }
  } else if (command === 'resume' || command === 'retry') {
    if (!args.campaign) fail('--campaign is required');
    const c = readJson(path.join(campaignDir(root, args.campaign), 'campaign.json'));
    if (c.schema_version !== '2') fail('Historical campaign is read-only; start a new campaign');
    if (c.catalog_hash !== loadCatalog().hash || c.build_hash !== buildHash()) fail('Campaign source changed; start a new campaign');
    if (command === 'retry') {
      if (!c.selection.hosts.length) fail('Matrix-only campaign has no behaviour attempts to retry');
      if (args.host.length !== 1 || args.scenario.length !== 1) fail('Retry requires one --host and one --scenario');
      const prior = c.sessions.map(s => readJson(path.join(attemptDir(root, c.id, s.id), 'session.json'))).filter(s => s.host === args.host[0] && s.scenario === args.scenario[0]);
      if (!prior.length || !prior.some(s => ['blocked', 'invalid', 'interrupted'].includes(s.state))) fail('Retry is reserved for blocked, invalid or interrupted attempts');
      newAttempt(c, args.host[0], args.scenario[0], prior.length + 1, prior.at(-1).id);
    } else {
      for (const item of [...c.sessions]) {
        const s = readJson(path.join(attemptDir(root, c.id, item.id), 'session.json'));
        if (['staging', 'running', 'capturing'].includes(s.state)) {
          writeJson(path.join(attemptDir(root, c.id, item.id), 'session.json'), { ...s, state: 'interrupted', issue: 'Coordinator restarted before evidence was sealed' });
          newAttempt(c, s.host, s.scenario, s.ordinal, s.id);
        }
      }
    }
    await drive(c, !args.noUi);
  } else if (command === 'import-review') {
    if (!args.campaign || !args.file) fail('import-review requires --campaign and --file');
    process.stdout.write(`${JSON.stringify(importReview(root, args.campaign, args.file), null, 2)}\n`);
  } else if (command === 'assess') {
    if (!args.campaign) fail('assess requires --campaign');
    const c = readJson(path.join(campaignDir(root, args.campaign), 'campaign.json'));
    if (c.schema_version !== '2' || !c.selection.hosts.length) fail('Assessment requires a current campaign with one behaviour host');
    loadCampaignCatalog(root, c.id);
    const jobs = Number(args.assessJobs ?? 1);
    if (!Number.isInteger(jobs) || jobs < 1 || jobs > 4) fail('--assess-jobs must be 1..4');
    const assessor = c.selection.assessor;
    run('bwrap', ['--version']);
    if (assessor.host === 'oh-my-pi') run('sqlite3', ['--version']);
    if (!resolveBinary(assessor.binary || adapters[assessor.host].binary)) fail(`Assessor binary missing: ${assessor.host}`);
    c.orca = c.orca || await context();
    if (args.session && !c.sessions.some(x => x.id === args.session)) fail(`Unknown session: ${args.session}`);
    const pending = c.sessions.map(x => readJson(path.join(attemptDir(root, c.id, x.id), 'session.json'))).filter(s => (!args.session || s.id === args.session) && ['sealed', 'blocked', 'interrupted'].includes(s.state) && assessmentState(root, c.id, s.id).status !== 'ready');
    const scheduled = [...pending];
    let server;
    try {
      if (!args.noUi) { const opened = await startServer(root, c.id, Number(args.port || 0)); server = opened.server; process.stdout.write(`Review: ${opened.url}\n`); if (args.openUi) await orcaJson(['tab', 'create', '--worktree', `id:${c.orca.worktree}`, '--url', opened.url]).catch(() => {}); }
      const assessmentResult = await assessQueue(c, pending, jobs);
      const ready = c.sessions.filter(x => assessmentState(root, c.id, x.id).status === 'ready').length;
      const failed = scheduled.filter(x => assessmentState(root, c.id, x.id).status === 'failed').length;
      const final = c.sessions.every(x => ['sealed', 'blocked', 'interrupted'].includes(readJson(path.join(attemptDir(root, c.id, x.id), 'session.json')).state));
      if (final) { c.status = ready === c.sessions.length ? 'awaiting-review' : 'awaiting-assessment'; writeJson(path.join(campaignDir(root, c.id), 'campaign.json'), c); }
      process.stdout.write(`Assessment complete: ${c.sessions.length} attempts; ${ready} reports ready; ${failed} failed in this batch\n`);
      if (failed || assessmentResult.rateLimited) process.exitCode = 1;
    } finally { if (server) await new Promise(resolve => server.close(resolve)); }
  } else if (command === 'report') {
    if (!args.campaign) fail('report requires --campaign');
    process.stdout.write(`${report(root, args.campaign, !!args.write)}\n`);
  } else if (command === 'legacy-import') {
    process.stdout.write(`${JSON.stringify(importLegacy(root, args.rawRoot), null, 2)}\n`);
  } else fail('Usage: pnpm dogfood <plan|run|resume|retry|serve|import-review|report|legacy-import> [options]');
}
main().catch(error => { process.stderr.write(`${error.stack || error.message}\n`); process.exitCode = 1; });
