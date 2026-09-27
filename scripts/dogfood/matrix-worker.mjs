#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { buildHash, campaignDir, matrixCaseDir, readJson, repoRoot, sha, toolCatalog, writeJson } from './lib.mjs';

const [root, campaignId, target, mode] = process.argv.slice(2);
const dir = matrixCaseDir(root, campaignId, target, mode);
const campaign = readJson(path.join(campaignDir(root, campaignId), 'campaign.json'));
const checks = [];
const state = (status, extra = {}) => writeJson(path.join(dir, 'state.json'), { status, target, mode, updated_at: new Date().toISOString(), ...extra });

try {
  if (campaign.schema_version !== '2' || campaign.build_hash !== buildHash()) throw new Error('Matrix source changed since campaign creation');
  const tool = (await toolCatalog()).find(item => item.id === target);
  if (!tool || !campaign.selection.matrix.targets.includes(target) || !campaign.selection.matrix.modes.includes(mode)) throw new Error('Matrix case is outside the frozen selection');
  state('running');
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'researchspec-init-matrix-'));
  const project = path.join(scratch, 'project');
  fs.mkdirSync(project);
  const cli = path.join(repoRoot, 'dist/src/cli/bin.js');
  function call(name, args) {
    const result = spawnSync(process.execPath, [cli, ...args, '--json'], { cwd: project, encoding: 'utf8', timeout: 90000, maxBuffer: 20 * 1024 * 1024 });
    fs.writeFileSync(path.join(dir, `${name}.stdout`), result.stdout || '');
    fs.writeFileSync(path.join(dir, `${name}.stderr`), result.stderr || '');
    if (result.error || result.status !== 0) throw new Error(`${name}: ${result.error?.message || result.stderr?.trim() || `exit ${result.status}`}`);
    const envelope = JSON.parse(result.stdout);
    if (!envelope.ok) throw new Error(`${name}: ${envelope.error?.message || 'CLI rejected the request'}`);
    return envelope.data;
  }
  function check(id, ok, evidence) { checks.push({ id, status: ok ? 'pass' : 'fail', evidence }); }
  const init = call('init', ['init', project, '--tools', target, '--delivery', mode]);
  check('init', init.schema_version === '2' && init.selected_tools?.length === 1 && init.selected_tools[0] === target && init.delivery === mode, ['init.stdout']);
  const status = call('status', ['status']);
  check('fresh-workspace', status.schema_version === '2' && status.runs?.total === 0 && status.agent_tools?.selected?.length === 1 && status.agent_tools.selected[0] === target && status.agent_tools.delivery === mode, ['status.stdout']);
  const strict = call('check', ['check', 'all', '--strict']);
  check('strict-check', strict.diagnostics?.length === 0, ['check.stdout']);
  const manifestPath = path.join(project, 'researchspec/tool-installation-manifest.json');
  fs.copyFileSync(manifestPath, path.join(dir, 'manifest.json'));
  const manifest = readJson(manifestPath);
  const owned = manifest.installations.filter(item => item.tool_id === target);
  const skill = owned.filter(item => item.source.kind === 'companion-skill' && item.target.path.endsWith('/researchspec-navigate/SKILL.md'));
  const command = owned.filter(item => item.source.kind === 'command' && item.source.command_id === 'navigate');
  const profiles = [...new Set(owned.filter(item => item.source.kind === 'custom-agent').map(item => item.source.role_id))].sort();
  const entries = owned.filter(item => item.source.kind === 'project-entry');
  const wantsSkill = mode !== 'commands' || !tool.command;
  const wantsCommand = mode !== 'skills' && !!tool.command;
  check('navigate-skill', skill.length === Number(wantsSkill), ['manifest.json']);
  check('navigate-command', command.length === Number(wantsCommand), ['manifest.json']);
  check('project-entry', entries.length === Number(tool.entry.mechanism !== 'discovery') && (!entries.length || entries[0].target.path === tool.entry.path), ['manifest.json']);
  check('agent-profiles', JSON.stringify(profiles) === JSON.stringify(tool.agentProfile ? ['researchspec-executor', 'researchspec-reviewer'] : []), ['manifest.json']);
  const files = [];
  for (const item of owned) {
    const relative = item.target.path;
    const source = path.join(project, relative);
    if (item.target.scope !== 'project' || !fs.existsSync(source) || !fs.lstatSync(source).isFile()) continue;
    const copy = path.join(dir, 'projected', relative);
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    fs.copyFileSync(source, copy);
    files.push({ path: relative, sha256: sha(fs.readFileSync(source)), source: item.source.kind });
  }
  writeJson(path.join(dir, 'files.json'), files);
  check('installed-files', files.length === owned.filter(item => item.target.scope === 'project').length && files.every(file => owned.some(item => item.target.path === file.path && item.sha256 === file.sha256)), ['manifest.json', 'files.json']);
  const listed = call('list-procedures', ['list', 'procedures', '--query', 'verify']);
  const shown = call('show-procedure', ['show', 'procedure:researchspec-verify']);
  const instructions = call('instructions-procedure', ['instructions', 'procedure:researchspec-verify']);
  check('procedure-discovery', listed.items?.some(item => item.selector === 'procedure:researchspec-verify') && shown.selector === 'procedure:researchspec-verify' && instructions.selector === 'procedure:researchspec-verify', ['list-procedures.stdout', 'show-procedure.stdout', 'instructions-procedure.stdout']);
  const result = { target, mode, status: checks.every(item => item.status === 'pass') ? 'pass' : 'fail', checks, project, entry_mechanism: tool.entry.mechanism, shared_target: target === 'agents' };
  writeJson(path.join(dir, 'report.json'), result);
  state(result.status, { failed_checks: checks.filter(item => item.status === 'fail').map(item => item.id), evidence_hash: sha(JSON.stringify({ checks, files })) });
  if (result.status !== 'pass') process.exitCode = 1;
} catch (error) {
  checks.push({ id: 'execution', status: 'fail', reason: error.message, evidence: [] });
  writeJson(path.join(dir, 'report.json'), { target, mode, status: 'fail', checks });
  state('fail', { issue: error.message });
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
}
