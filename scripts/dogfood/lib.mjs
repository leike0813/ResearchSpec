import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const playbookRoot = path.join(repoRoot, 'playbooks/dogfooding');
export const defaultStateDir = path.join(process.env.XDG_STATE_HOME || path.join(os.homedir(), '.local/state'), 'researchspec/dogfooding');
export const rubricKeys = ['routing_clarity', 'user_control', 'evidence_discipline', 'artifact_usability'];
export const matrixModes = ['skills', 'commands', 'both'];

export function fail(message) { throw new Error(message); }
export function sha(data) { return crypto.createHash('sha256').update(data).digest('hex'); }
export function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
export function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const next = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(next, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(next, file);
}
export function id() { return `${new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, 'Z')}-${crypto.randomBytes(3).toString('hex')}`; }
export function stateRoot(value) { return path.resolve(value || defaultStateDir); }
export function campaignDir(root, campaignId) {
  if (!/^[0-9TZ]+-[a-f0-9]{6}$/.test(campaignId) && !/^legacy-[0-9TZ]+-[a-f0-9]{6}$/.test(campaignId)) fail(`Invalid campaign ID: ${campaignId}`);
  return path.join(root, campaignId);
}
export function attemptDir(root, campaignId, attemptId) {
  if (!/^[a-z0-9-]+$/.test(attemptId)) fail(`Invalid attempt ID: ${attemptId}`);
  return path.join(campaignDir(root, campaignId), 'sessions', attemptId);
}
export function assessmentDir(root, campaignId, attemptId) {
  attemptDir(root, campaignId, attemptId);
  return path.join(campaignDir(root, campaignId), 'assessments', attemptId);
}
export function matrixCaseDir(root, campaignId, target, mode) {
  if (!/^[a-z0-9-]+$/.test(target) || !matrixModes.includes(mode)) fail('Invalid matrix target or delivery mode');
  return path.join(campaignDir(root, campaignId), 'matrix', target, mode);
}
export function matrixState(root, campaignId, target, mode) {
  const file = path.join(matrixCaseDir(root, campaignId, target, mode), 'state.json');
  return fs.existsSync(file) ? readJson(file) : { status: 'pending' };
}
export function loadCatalog() {
  const bytes = fs.readFileSync(path.join(playbookRoot, 'scenarios.yaml'));
  const catalog = YAML.parse(bytes.toString('utf8'));
  if (catalog.schema_version !== '1' || !catalog.scenarios?.length) fail('Invalid dogfooding scenario catalog');
  return { catalog, hash: sha(bytes) };
}
export function loadConfig(file) {
  if (!file) fail('--config is required');
  const config = YAML.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  if (config?.schema_version !== '1' || !config.hosts || typeof config.hosts !== 'object' || Array.isArray(config.hosts)) fail('Invalid harness config');
  for (const [host, value] of Object.entries(config.hosts)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`Invalid host config for ${host}`);
    if (value.model !== undefined && (typeof value.model !== 'string' || !value.model.trim())) fail(`Invalid model for ${host}`);
    if (value.binary !== undefined && (typeof value.binary !== 'string' || !value.binary.trim())) fail(`Invalid binary for ${host}`);
    if (value.enabled !== undefined) fail(`Config host ${host}: select behavior with --behavior-host, not enabled`);
  }
  if (config.assessor !== undefined && (!config.assessor || typeof config.assessor !== 'object' || Array.isArray(config.assessor) || typeof config.assessor.host !== 'string' || typeof config.assessor.model !== 'string' || !config.assessor.host || !config.assessor.model)) fail('Invalid assessor config');
  return config;
}
export function run(command, args, cwd = repoRoot, timeout = 30000) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', timeout, maxBuffer: 10 * 1024 * 1024 });
  if (result.error) fail(`${command}: ${result.error.message}`);
  if (result.status !== 0) fail(`${command} ${args.join(' ')}: ${result.stderr?.trim() || result.stdout?.trim() || `exit ${result.status}`}`);
  return result.stdout;
}
export function toolCatalog() {
  const file = path.join(repoRoot, 'dist/src/adapters/tools.js');
  if (!fs.existsSync(file)) fail('Build ResearchSpec first: pnpm build');
  return import(new URL(`file://${file}`).href).then(module => module.TOOLS);
}
export async function toolIds() { return (await toolCatalog()).map(tool => tool.id); }
export function buildHash() {
  const roots = ['dist', 'skills', 'literature-adapters', 'review-workspace', 'scripts/dogfood', 'harness/dogfood/public', 'playbooks/dogfooding/benchmark'];
  if (!fs.existsSync(path.join(repoRoot, 'dist'))) fail('Build ResearchSpec first: pnpm build');
  const entries = [];
  function walk(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) walk(full);
      else if (item.isFile()) entries.push(`${path.relative(repoRoot, full)} ${sha(fs.readFileSync(full))}`);
    }
  }
  for (const relative of roots) walk(path.join(repoRoot, relative));
  entries.push(`scripts/dogfood.mjs ${sha(fs.readFileSync(path.join(repoRoot, 'scripts/dogfood.mjs')))}`);
  entries.push(`package.json ${sha(fs.readFileSync(path.join(repoRoot, 'package.json')))}`);
  return sha(entries.join('\n'));
}
export function resolveSelection(args, config, catalog, ids, adapters) {
  const known = new Set(ids);
  for (const key of Object.keys(config.hosts)) if (!known.has(key)) fail(`Unknown ResearchSpec target in config: ${key}`);
  if (args.full || args.host?.length) fail('Multi-host behaviour runs are retired; use --behavior-host ID. The init matrix always covers every registered target.');
  const host = args.behaviorHost;
  if (!host && (args.scenario?.length || args.suite || args.model?.length || args.assessorHost || args.assessorModel)) fail('Behaviour options require --behavior-host');
  const hosts = host ? [host] : [];
  const scenarioIds = host ? args.suite ? catalog.suites?.[args.suite] : args.scenario?.length ? args.scenario : catalog.suites?.['natural-18'] : [];
  const byId = new Map(catalog.scenarios.map(s => [s.scenario_id, s]));
  if (host) {
    if (!known.has(host) || host === 'agents') fail(`Not a runnable ResearchSpec target: ${host}`);
    if (!adapters[host]) fail(`No dogfooding execution adapter for ${host}`);
    if (!config.hosts[host]?.model && !(args.model || []).some(value => value.startsWith(`${host}=`) && value.length > host.length + 1)) fail(`No configured model for ${host}`);
    if (!scenarioIds?.length) fail('Select a declared behaviour scenario or suite');
  }
  for (const scenario of scenarioIds) if (!byId.has(scenario)) fail(`Unknown scenario: ${scenario}`);
  const assessor = host ? { host: args.assessorHost || config.assessor?.host, model: args.assessorModel || config.assessor?.model, timeout_sec: Number(config.assessor?.timeout_sec ?? 600) } : null;
  if (host && (!known.has(assessor.host) || !adapters[assessor.host] || !assessor.model || !Number.isInteger(assessor.timeout_sec) || assessor.timeout_sec < 30 || assessor.timeout_sec > 3600)) fail('Select a runnable assessor host/model and timeout');
  const repeat = Number(args.repeat ?? 2);
  const jobs = Number(args.jobs ?? 4);
  const assessJobs = Number(args.assessJobs ?? 1);
  const timeoutSec = Number(args.timeoutSec ?? 600);
  if (!Number.isInteger(repeat) || repeat < 1 || repeat > 10) fail('--repeat must be 1..10');
  if (!Number.isInteger(jobs) || jobs < 1 || jobs > 8) fail('--jobs must be 1..8');
  if (!Number.isInteger(assessJobs) || assessJobs < 1 || assessJobs > 4) fail('--assess-jobs must be 1..4');
  if (!Number.isInteger(timeoutSec) || timeoutSec < 30 || timeoutSec > 3600) fail('--timeout-sec must be 30..3600');
  const models = {};
  for (const host of hosts) models[host] = config.hosts[host]?.model;
  for (const value of args.model || []) {
    const split = value.indexOf('=');
    const host = value.slice(0, split);
    const model = value.slice(split + 1);
    if (split < 1 || !hosts.includes(host) || !model) fail(`Invalid --model override: ${value}`);
    models[host] = model;
  }
  return { matrix: { targets: [...ids], modes: matrixModes, jobs }, hosts, scenarios: [...new Set(scenarioIds)], repeat, jobs: 1, timeout_sec: timeoutSec, models, assessor, assess_jobs: assessJobs };
}
export function evidenceHash(dir) {
  const files = [];
  function walk(at) {
    for (const item of fs.readdirSync(at, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(at, item.name);
      const relative = path.relative(dir, full);
      if (item.isDirectory()) walk(full);
      else if (item.isFile() && relative !== 'session.json' && relative !== 'review.json' && !relative.startsWith('reviews/')) files.push(`${relative} ${sha(fs.readFileSync(full))}`);
    }
  }
  walk(dir);
  return sha(files.join('\n'));
}
