import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { repoRoot } from './lib.mjs';

function one(type, label, detail = '') { return [{ type, label: String(label || ''), detail: String(detail || '').slice(0, 12000) }]; }

export const adapters = {
  codex: {
    binary: 'codex',
    argv(model, prompt) { return ['exec', '--model', model, '-c', 'approval_policy=never', '-c', 'features.hooks=false', '--sandbox', 'danger-full-access', '--skip-git-repo-check', '--json', prompt]; },
    decode(event) {
      if (event.type === 'turn.failed') return one('error', 'Host turn failed', JSON.stringify(event.error || event));
      if (event.type === 'item.completed' && event.item?.type === 'command_execution') return one('tool', event.item.command, event.item.aggregated_output);
      if (event.type === 'item.completed' && event.item?.type === 'agent_message') return one('answer', 'Agent response', event.item.text);
      if (event.type === 'item.completed' && event.item?.type === 'error') return one('error', 'Host error', JSON.stringify(event.item));
      return [];
    },
    credentials: ['.codex/auth.json', '.codex/config.toml'],
    envKeys: ['MINIMAX_CN_API_KEY', 'OPENAI_API_KEY'],
  },
  claude: {
    binary: 'claude',
    argv(model, prompt) { return ['-p', '--model', model, '--output-format', 'stream-json', '--verbose', '--no-session-persistence', '--dangerously-skip-permissions', prompt]; },
    decode(event) {
      if (event.type === 'assistant') return (event.message?.content || []).flatMap(item => item.type === 'tool_use' ? one('tool', item.name, JSON.stringify(item.input)) : item.type === 'text' ? one('answer', 'Agent response', item.text) : []);
      if (event.type === 'user') return (event.message?.content || []).flatMap(item => item.type === 'tool_result' ? one('tool-result', item.tool_use_id, JSON.stringify(item.content)) : []);
      if (event.type === 'result' && event.is_error) return one('error', 'Host error', event.result);
      return [];
    },
    credentials: ['.claude.json', '.claude/.credentials.json', '.claude/settings.json'],
    envKeys: ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_BASE_URL'],
  },
  opencode: {
    binary: 'opencode',
    argv(model, prompt, project) { return ['--pure', 'run', '--dir', project, '--model', model, '--format', 'json', '--auto', prompt]; },
    decode(event) {
      if (event.type === 'error') return one('error', 'Host error', JSON.stringify(event.error || event));
      if (event.type === 'tool_use') return one('tool', event.part?.tool, JSON.stringify({ input: event.part?.state?.input, output: event.part?.state?.output }));
      if (event.type === 'text') return one('answer', 'Agent response', event.part?.text);
      return [];
    },
    credentials: ['.config/opencode/opencode.json', '.local/share/opencode/auth.json'],
    envKeys: ['OPENCODE_API_KEY', 'OPENCODE_API_KEY_2', 'OPENCODE_API_KEY_3', 'MINIMAX_CN_API_KEY'],
  },
  'oh-my-pi': {
    binary: 'omp',
    argv(model, prompt, _project, timeoutSec) { return ['-p', `--model=${model}`, '--mode=json', '--approval-mode=yolo', `--max-time=${timeoutSec}`, '--no-extensions', '--no-session', prompt]; },
    decode(event) {
      if (event.type === 'error') return one('error', 'Host error', JSON.stringify(event.error || event));
      if (event.type === 'tool_execution_start') return one('tool', event.toolName, JSON.stringify(event.args));
      if (event.type === 'tool_execution_end') return one('tool-result', event.toolName, JSON.stringify(event.result));
      if (event.type === 'message_end' && event.message?.role === 'assistant') return one('answer', 'Agent response', (event.message.content || []).filter(x => x.type === 'text').map(x => x.text).join('\n'));
      if (event.type === 'notice') return one('notice', event.message || 'Host notice');
      return [];
    },
    credentials: ['.omp/agent/agent.db', '.omp/agent/config.yml', '.omp/agent/models.yml'],
    envKeys: ['MINIMAX_CN_API_KEY', 'ANTHROPIC_API_KEY'],
  },
};

export function resolveBinary(binary) {
  if (path.isAbsolute(binary)) return fs.existsSync(binary) ? binary : null;
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    const full = path.join(dir, binary);
    try { fs.accessSync(full, fs.constants.X_OK); return full; } catch { /* keep looking */ }
  }
  return null;
}

// Hide the entire real home. Expose only the installed runtimes, ResearchSpec source,
// required credentials and the current fixture; no sibling project or host history is visible.
export function sandboxCommand(host, binary, argv, project, scratch, evidence = null) {
  const home = os.homedir();
  const sessionHome = path.join(scratch, 'home');
  fs.mkdirSync(sessionHome, { recursive: true });
  const args = ['--ro-bind', '/', '/', '--tmpfs', home, '--tmpfs', '/tmp'];
  const scratchParent = path.dirname(scratch);
  args.push('--dir', scratchParent, '--bind', scratch, scratch);
  if (evidence) args.push('--ro-bind', evidence, path.join(project, 'evidence'));
  const runtimeRoots = [path.dirname(path.dirname(process.execPath)), path.join(home, '.bun')];
  function parents(target) {
    const relative = path.relative(home, path.dirname(target));
    if (relative.startsWith('..')) return;
    let at = home;
    for (const part of relative.split(path.sep).filter(Boolean)) { at = path.join(at, part); args.push('--dir', at); }
  }
  for (const target of runtimeRoots) {
    if (!fs.existsSync(target)) continue;
    parents(target);
    args.push('--ro-bind', target, target);
  }
  parents(repoRoot);
  args.push('--dir', repoRoot);
  for (const relative of ['dist', 'skills', 'node_modules', 'literature-adapters', 'review-workspace', 'package.json']) {
    const target = path.join(repoRoot, relative);
    if (fs.existsSync(target)) args.push('--ro-bind', target, target);
  }
  if (host === 'codex') {
    const catalog = path.join(home, '.codex/opencodex-catalog.json');
    if (fs.existsSync(catalog)) {
      parents(catalog);
      args.push('--ro-bind', catalog, catalog);
    }
  }
  for (const relative of adapters[host].credentials) {
    const from = path.join(home, relative);
    if (!fs.existsSync(from)) continue;
    const to = path.join(sessionHome, relative);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    if (host === 'oh-my-pi') {
      fs.copyFileSync(from, to);
      if (relative.endsWith('/agent.db')) {
        const sql = 'DELETE FROM cache; DELETE FROM command_usage; DELETE FROM usage_history; DELETE FROM client_usage; DELETE FROM model_usage; DELETE FROM model_perf; DELETE FROM clients; VACUUM;';
        const result = spawnSync('sqlite3', [to, sql], { encoding: 'utf8', timeout: 30000 });
        if (result.status !== 0 || result.error) throw new Error(`Cannot sanitize OMP state: ${result.error?.message || result.stderr?.trim() || result.status}`);
      }
    }
    else { fs.closeSync(fs.openSync(to, 'a')); args.push('--ro-bind', from, to); }
  }
  const visiblePath = [path.join(scratch, 'bin'), path.dirname(process.execPath), path.join(home, '.bun/bin'), '/usr/local/bin', '/usr/bin', '/bin'].join(':');
  args.push('--proc', '/proc', '--dev', '/dev', '--chdir', project, '--setenv', 'HOME', sessionHome, '--setenv', 'PATH', visiblePath, '--setenv', 'XDG_CONFIG_HOME', path.join(sessionHome, '.config'), '--setenv', 'XDG_DATA_HOME', path.join(sessionHome, '.local/share'), '--setenv', 'XDG_CACHE_HOME', path.join(sessionHome, '.cache'), '--setenv', 'TMPDIR', '/tmp');
  if (host === 'codex') args.push('--setenv', 'CODEX_HOME', path.join(sessionHome, '.codex'));
  if (host === 'oh-my-pi') args.push('--setenv', 'PI_CODING_AGENT_DIR', path.join(sessionHome, '.omp/agent'));
  args.push('--', binary, ...argv);
  return { command: 'bwrap', args };
}
