import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { adapters, resolveBinary, sandboxCommand } from './hosts.mjs';
import { attemptDir, buildHash, campaignDir, evidenceHash, loadCampaignCatalog, playbookRoot, readJson, repoRoot, sha, validateFirstQuery, validateProcedureChain, writeJson } from './lib.mjs';

const [stateRoot, campaignId, attemptId] = process.argv.slice(2);
const dir = attemptDir(stateRoot, campaignId, attemptId);
const campaign = readJson(path.join(campaignDir(stateRoot, campaignId), 'campaign.json'));
const stateFile = path.join(dir, 'session.json');
let session = readJson(stateFile);
let project;

function update(state, extra = {}) {
  session = { ...session, ...extra, state, updated_at: new Date().toISOString() };
  writeJson(stateFile, session);
}
function saveResult(name, result) {
  fs.writeFileSync(path.join(dir, `${name}.stdout`), result.stdout || '');
  fs.writeFileSync(path.join(dir, `${name}.stderr`), result.stderr || '');
  return result.status;
}
function cli(name, args) {
  const result = spawnSync(process.execPath, [path.join(repoRoot, 'dist/src/cli/bin.js'), ...args], { cwd: project, encoding: 'utf8', timeout: 60000, maxBuffer: 20 * 1024 * 1024 });
  saveResult(name, result);
  if (result.error || result.status !== 0) throw new Error(`${name} failed: ${result.error?.message || result.stderr?.slice(0, 500) || result.status}`);
  return result.stdout;
}
function inventory(root) {
  const files = {};
  function walk(at) {
    for (const entry of fs.readdirSync(at, { withFileTypes: true })) {
      if (entry.name === '.git') continue;
      const full = path.join(at, entry.name);
      const relative = path.relative(root, full);
      if (entry.isDirectory()) walk(full);
      else if (entry.isSymbolicLink()) files[relative] = { kind: 'symlink', target: fs.readlinkSync(full) };
      else if (entry.isFile()) files[relative] = { kind: 'file', size: fs.statSync(full).size, sha256: sha(fs.readFileSync(full)) };
    }
  }
  walk(root);
  return files;
}
function copyFixture(paths) {
  for (const relative of paths) {
    const target = path.join(project, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(path.join(playbookRoot, relative), target);
  }
}
function stageNotes(scenarioId, staged) {
  const noteCases = new Set(['DF-T1-NOTE-RESUME', 'DF-T2-NOTE-DIVERGENCE', 'DF-T2-NOTE-MATERIAL-CHANGE', 'DF-T2-NOTE-AMBIGUITY', 'DF-T2-RUN-PRECEDENCE']);
  if (!noteCases.has(scenarioId)) return;
  const base = path.join(project, 'work/researchspec-notes');
  fs.mkdirSync(base, { recursive: true });
  const note = path.join(base, 'writing-evidence.md');
  if (scenarioId === 'DF-T2-RUN-PRECEDENCE') {
    fs.writeFileSync(note, fs.readFileSync(path.join(playbookRoot, 'benchmark/run-precedence-note.md'), 'utf8').replace('{{RUN_SELECTOR}}', `run:${staged.run_id}`));
  } else fs.copyFileSync(path.join(playbookRoot, 'benchmark/ordinary-task-note.md'), note);
  if (scenarioId === 'DF-T2-NOTE-AMBIGUITY') fs.copyFileSync(path.join(playbookRoot, 'benchmark/second-task-note.md'), path.join(base, 'review-response.md'));
  if (scenarioId === 'DF-T2-NOTE-MATERIAL-CHANGE') fs.unlinkSync(path.join(project, 'benchmark/sources.yaml'));
  if (scenarioId === 'DF-T2-NOTE-DIVERGENCE') fs.appendFileSync(path.join(project, 'benchmark/sources.yaml'), '\n# Minor wording correction since the note; source identities and claims unchanged.\n');
}
function stageGraph(scenarioId) {
  if (!['DF-T1-RESUME', 'DF-T2-RUN-PRECEDENCE', 'DF-T2-COMPLETED-RUN'].includes(scenarioId)) return null;
  if (scenarioId === 'DF-T2-RUN-PRECEDENCE') fs.copyFileSync(path.join(playbookRoot, 'benchmark/run-precedence-project.md'), path.join(project, 'researchspec/specs/project.md'));
  const profile = scenarioId === 'DF-T2-COMPLETED-RUN' ? 'minimal' : 'academic-pipeline';
  const response = JSON.parse(cli('profile-instructions', ['instructions', `profile:${profile}`, '--json']));
  const entry = response.data.entries.find(e => e.entry_id === 'main');
  const plannedOutputs = entry.boundary_outputs.map(o => ({ role: o.role, type: o.type, path: `work/historical-${o.role}${o.role === 'submission_package' ? '.zip' : '.md'}`, purpose: o.purpose }));
  for (const output of entry.expected_output_roles.filter(o => o.required && !plannedOutputs.some(p => p.role === o.role))) {
    plannedOutputs.push({ role: output.role, type: output.role, path: `work/historical-${output.role}.md`, purpose: `Required output of entry node ${entry.entry_node_id}.` });
  }
  const input = {
    schema_version: '2', confirmed_at: new Date().toISOString(), entry_id: entry.entry_id,
    entry_node_id: entry.entry_node_id, route_ref: entry.route_ref,
    prerequisites: ['Synthetic test fixture research goal and project spec checked.'], handoff_inputs: [],
    planned_outputs: plannedOutputs,
    formal_gates: entry.formal_gates.map(g => g.gate_id), cost: { effort: 'synthetic fixture', interaction: 'synthetic fixture' },
  };
  const inputFile = path.join(dir, 'staged-start-input.json');
  writeJson(inputFile, input);
  const started = JSON.parse(cli('staged-start', ['start', profile, '--input', inputFile, '--confirmed-by', 'synthetic-fixture-user', '--json']));
  const runId = started.data.run_id;
  if (scenarioId === 'DF-T2-COMPLETED-RUN') {
    for (const [node, role] of [['rq', 'rq_brief'], ['methodology', 'methodology_blueprint'], ['literature', 'annotated_bibliography'], ['grading', 'graded_sources'], ['synthesis', 'synthesis_report'], ['report', 'research_report']]) {
      const relative = `work/historical-${role}.md`;
      fs.mkdirSync(path.dirname(path.join(project, relative)), { recursive: true });
      fs.writeFileSync(path.join(project, relative), `Synthetic fixture ${role} for a completed historical run.\n`);
      const advanceInput = path.join(dir, `staged-${node}.json`);
      writeJson(advanceInput, { outputs: [{ role, path: relative }] });
      cli(`staged-advance-${node}`, ['advance', `node:${runId}/${node}`, '--input', advanceInput, '--json']);
    }
  }
  return { run_id: runId, profile, required_entry_roles: entry.expected_output_roles.filter(o => o.required).map(o => o.role) };
}
function validateRunPrecedenceFixture(staged, status) {
  const fixture = relative => fs.readFileSync(path.join(playbookRoot, 'benchmark', relative), 'utf8');
  const note = fs.readFileSync(path.join(project, 'work/researchspec-notes/writing-evidence.md'), 'utf8');
  const intent = fs.readFileSync(path.join(project, 'researchspec/specs/project.md'), 'utf8');
  const handoff = JSON.parse(fs.readFileSync(path.join(dir, 'staged-start.stdout'), 'utf8')).data.handoff;
  const plannedRoles = new Set(handoff.outputs.map(output => output.role));
  if (intent !== fixture('run-precedence-project.md')
    || note !== fixture('run-precedence-note.md').replace('{{RUN_SELECTOR}}', `run:${staged.run_id}`)
    || !staged.required_entry_roles.every(role => plannedRoles.has(role))
    || !status.data.pending_subgraph_starts.some(item => item.run_id === staged.run_id)) {
    throw new Error('Fixture precondition failed: run-precedence task link, entry outputs, or runnable frontier is missing');
  }
}
function stageScenario(scenario) {
  if (scenario.first_query) {
    const response = JSON.parse(cli('first-query', ['list', 'procedures', '--query', scenario.first_query, '--json']));
    validateFirstQuery(response);
    const record = { query: scenario.first_query, result: response };
    writeJson(path.join(dir, 'first-query.json'), record);
    writeJson(path.join(project, 'benchmark/first-query-result.json'), record);
  }
  if (scenario.procedure_chain) {
    const chain = scenario.procedure_chain;
    const first = JSON.parse(cli('chain-first-packet', ['instructions', `procedure:${chain.first}`, '--json'])).data?.packet;
    const second = JSON.parse(cli('chain-second-packet', ['instructions', `procedure:${chain.second}`, '--json'])).data?.packet;
    validateProcedureChain(chain, first, second, project);
  }
}
function appendEvent(event) {
  const file = path.join(dir, 'events.ndjson');
  const seq = (session.last_seq || 0) + 1;
  session.last_seq = seq;
  fs.appendFileSync(file, `${JSON.stringify({ seq, at: new Date().toISOString(), ...event })}\n`);
}
async function hostRun(binary, argv, scratch) {
  const command = sandboxCommand(session.host, binary, argv, project, scratch);
  fs.writeFileSync(path.join(dir, 'command.json'), `${JSON.stringify({ binary: path.basename(binary), args: argv.slice(0, -1).concat('<prompt from prompts.md>'), sandbox: 'bubblewrap' }, null, 2)}\n`);
  const out = fs.createWriteStream(path.join(dir, 'trace.jsonl'));
  const err = fs.createWriteStream(path.join(dir, 'stderr.txt'));
  const envKeys = ['PATH', 'LANG', 'LC_ALL', 'TERM', 'TZ', 'HTTP_PROXY', 'HTTPS_PROXY', 'NO_PROXY', 'ALL_PROXY', 'SSL_CERT_FILE', 'NODE_EXTRA_CA_CERTS', ...adapters[session.host].envKeys];
  const env = Object.fromEntries(envKeys.filter(key => process.env[key] !== undefined).map(key => [key, process.env[key]]));
  const child = spawn(command.command, command.args, { cwd: project, env: { ...env, PWD: project }, stdio: ['ignore', 'pipe', 'pipe'] });
  let buffer = '';
  let meaningfulEvents = 0;
  let protocolFailed = false;
  function record(value) {
    if (value.type === 'turn.failed' || value.type === 'error' || (value.type === 'result' && value.is_error)) protocolFailed = true;
    if (value.type === 'assistant' && typeof value.message?.model === 'string') session.observed_model = value.message.model;
    for (const event of adapters[session.host].decode(value)) {
      appendEvent(event);
      if (event.type === 'tool' || (event.type === 'answer' && event.detail.trim())) meaningfulEvents++;
    }
  }
  child.stdout.on('data', chunk => {
    out.write(chunk);
    buffer += chunk.toString('utf8');
    let index;
    while ((index = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, index); buffer = buffer.slice(index + 1);
      try { record(JSON.parse(line)); }
      catch { if (line.trim()) appendEvent({ type: 'output', label: line.slice(0, 500) }); }
    }
    update('running');
  });
  child.stderr.on('data', chunk => err.write(chunk));
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); }, campaign.selection.timeout_sec * 1000);
  const result = await new Promise(resolve => {
    child.once('error', error => resolve({ code: null, signal: null, error: error.message }));
    child.once('close', (code, signal) => resolve({ code, signal }));
  });
  clearTimeout(timer);
  if (buffer.trim()) try { record(JSON.parse(buffer)); } catch { appendEvent({ type: 'output', label: buffer.slice(0, 500) }); }
  await Promise.all([new Promise(resolve => out.end(resolve)), new Promise(resolve => err.end(resolve))]);
  return { ...result, timed_out: timedOut, meaningful_events: meaningfulEvents, protocol_failed: protocolFailed };
}

try {
  const { catalog, hash } = loadCampaignCatalog(stateRoot, campaignId);
  if (hash !== campaign.catalog_hash) throw new Error('Scenario catalog changed since campaign creation');
  if (buildHash() !== campaign.build_hash) throw new Error('Harness or ResearchSpec build changed since campaign creation');
  const scenario = catalog.scenarios.find(x => x.scenario_id === session.scenario);
  const variant = catalog.fixture_variants.find(x => x.fixture_variant === scenario.fixture_variant);
  if (!variant) throw new Error('Unknown fixture variant');
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'researchspec-dogfood-'));
  project = path.join(scratch, 'project');
  fs.mkdirSync(project);
  fs.mkdirSync(path.join(scratch, 'bin'));
  const cliShim = path.join(scratch, 'bin/researchspec');
  fs.writeFileSync(cliShim, `#!/bin/sh\nexec '${process.execPath}' '${path.join(repoRoot, 'dist/src/cli/bin.js')}' "$@"\n`, { mode: 0o755 });
  update('staging', { started_at: new Date().toISOString(), workspace: project });
  copyFixture(variant.paths);
  cli('init', ['init', project, '--tools', session.host, '--delivery', 'both']);
  const staged = stageGraph(session.scenario);
  stageNotes(session.scenario, staged);
  stageScenario(scenario);
  const beforeStatus = JSON.parse(cli('before-status', ['status', '--json']));
  if (session.scenario === 'DF-T2-RUN-PRECEDENCE') validateRunPrecedenceFixture(staged, beforeStatus);
  cli('before-check', ['check', 'all', '--strict', '--json']);
  const before = inventory(project);
  writeJson(path.join(dir, 'before-files.json'), before);
  const prompt = scenario.prompts.join('\n');
  fs.writeFileSync(path.join(dir, 'prompts.md'), `${prompt}\n`);
  const binary = resolveBinary(campaign.binaries[session.host]);
  if (!binary) throw new Error(`Host binary missing: ${session.host}`);
  const argv = adapters[session.host].argv(session.requested_model, prompt, project, campaign.selection.timeout_sec);
  update('running', { staged, host_version: campaign.host_versions[session.host] });
  const result = await hostRun(binary, argv, scratch);
  update('capturing', { exit_code: result.code, signal: result.signal, timed_out: result.timed_out });
  let diagnostics_error = null;
  try { cli('after-status', ['status', '--json']); cli('after-check', ['check', 'all', '--strict', '--json']); } catch (error) { diagnostics_error = error.message; }
  const after = inventory(project);
  writeJson(path.join(dir, 'after-files.json'), after);
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(file => JSON.stringify(before[file]) !== JSON.stringify(after[file]));
  for (const relative of changed) {
    if (!after[relative]) continue;
    if (relative.startsWith('.') || relative.startsWith('node_modules/')) continue;
    const source = path.join(project, relative);
    if (!fs.lstatSync(source).isFile()) continue;
    const target = path.join(dir, relative.startsWith('researchspec/') ? 'authority' : 'deliverables', relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
  writeJson(path.join(dir, 'file-diff.json'), { changed: changed.map(file => ({ path: file, before: before[file] || null, after: after[file] })), authority_changed: changed.filter(file => file.startsWith('researchspec/runs/')) });
  const completed_at = new Date().toISOString();
  const blocked = result.code !== 0 || result.timed_out || result.protocol_failed || result.meaningful_events === 0;
  update(blocked ? 'blocked' : 'sealed', { completed_at, changed, diagnostics_error, last_seq: session.last_seq || 0, issue: blocked ? result.error || (result.timed_out ? 'Host timed out' : result.code !== 0 ? `Host exited ${result.code}` : result.protocol_failed ? 'Host protocol reported failure' : 'Host produced no Agent response or tool call') : null });
  update(blocked ? 'blocked' : 'sealed', { evidence_hash: evidenceHash(dir) });
  if (blocked) process.exitCode = 1;
} catch (error) {
  update('blocked', { completed_at: new Date().toISOString(), issue: error.message, issue_kind: error.message.startsWith('Fixture precondition failed:') ? 'fixture_precondition' : 'setup_or_host' });
  update('blocked', { evidence_hash: evidenceHash(dir) });
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
