import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

// Compiled tests live under .test-dist, so the project root is the working
// directory the runner starts from, not a path relative to this module.
const ROOT = process.cwd();

type RunCall = { command: string; args: string[] };
type RunResult = { status: number | null; stdout: string; stderr: string };
type Run = (command: string, args: string[], options?: { cwd?: string }) => RunResult;
type Spawn = (command: string, args: string[], options: { shell?: boolean }) => RunResult;

type StableInstallModule = {
  platformCommand: (name: string, platform: string) => string;
  createProcessRunner: (platform?: string, spawn?: Spawn) => Run;
  parsePackMetadata: (stdout: string) => { filename: string };
  installStable: (options: {
    run: Run; cwd: string; packDestination: string; name: string; version: string; platform?: string;
  }) => Promise<{ packageRoot: string; binPath: string; version: string; tarball: string }>;
};

async function loadModule(): Promise<StableInstallModule> {
  return await import(pathToFileURL(path.join(ROOT, 'scripts/lib/stable-install.mjs')).href) as StableInstallModule;
}

interface FakeInstallOptions {
  packedFilename?: string;
  installedVersion?: string;
  cliVersion?: string;
  installExit?: number;
}

// A fake npm/pnpm pair plus a real directory tree standing in for the global
// install. Nothing here spawns a package manager or touches a real prefix.
async function fakeEnvironment(options: FakeInstallOptions = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'researchspec-install-stable-'));
  const packDestination = path.join(root, 'pack');
  const globalRoot = path.join(root, 'global', 'lib', 'node_modules');
  const packageRoot = path.join(globalRoot, 'researchspec');
  const binRelative = 'dist/src/cli/bin.js';
  const installedVersion = options.installedVersion ?? '9.9.9';
  await mkdir(packDestination, { recursive: true });
  await mkdir(path.dirname(path.join(packageRoot, binRelative)), { recursive: true });
  await writeFile(path.join(packageRoot, 'package.json'), JSON.stringify({
    name: 'researchspec', version: installedVersion, bin: { researchspec: `./${binRelative}` },
  }));
  const binAbsolute = path.join(packageRoot, binRelative);
  await writeFile(binAbsolute, '#!/usr/bin/env node\nconsole.log("fake cli");\n');
  await chmod(binAbsolute, 0o755);
  const calls: RunCall[] = [];
  const run: Run = (command, args) => {
    calls.push({ command, args });
    if (args[0] === 'build') return { status: 0, stdout: '', stderr: '' };
    if (args[0] === 'pack') {
      const metadata = JSON.stringify([{ filename: options.packedFilename ?? 'researchspec-0.0.1.tgz', files: [] }]);
      return { status: 0, stdout: `npm notice\n${metadata}\n`, stderr: '' };
    }
    if (args[0] === 'install' && options.installExit) throw new Error(`npm ${args.join(' ')} failed\nEACCES permission denied`);
    if (args[0] === 'install') return { status: 0, stdout: '', stderr: '' };
    if (args[0] === 'root') return { status: 0, stdout: `${globalRoot}\n`, stderr: '' };
    if (args.at(-1) === '--version') return { status: 0, stdout: `${options.cliVersion ?? installedVersion}\n`, stderr: '' };
    throw new Error(`unexpected command ${command} ${args.join(' ')}`);
  };
  return { root, packDestination, globalRoot, packageRoot, binAbsolute, calls, run };
}

void test('stable install packs, replaces and verifies the actual installed CLI', async () => {
  const { installStable, parsePackMetadata } = await loadModule();
  const env = await fakeEnvironment({ packedFilename: 'researchspec-9.9.9.tgz' });
  try {
    const result = await installStable({
      run: env.run, cwd: ROOT, packDestination: env.packDestination,
      name: 'researchspec', version: '9.9.9', platform: 'linux',
    });
    assert.equal(result.version, '9.9.9');
    assert.equal(result.packageRoot, env.packageRoot);
    assert.equal(result.binPath, env.binAbsolute);
    // The tarball name comes from npm metadata, not from name/version guessing.
    const install = env.calls.find((call) => call.args[0] === 'install');
    assert.ok(install);
    assert.deepEqual(install.args, ['install', '-g', path.join(env.packDestination, 'researchspec-9.9.9.tgz')]);
    // The installed bin was executed, and its reported version is what was accepted.
    const executed = env.calls.find((call) => call.args.includes('--version'));
    assert.ok(executed);
    assert.equal(executed.args[0], env.binAbsolute);
    assert.equal(parsePackMetadata('noise\n[{"filename":"a.tgz","files":[]}]\n').filename, 'a.tgz');
  } finally {
    await rm(env.root, { recursive: true, force: true });
  }
});

void test('stable install never uninstalls and surfaces the real npm failure', async () => {
  const { installStable } = await loadModule();
  const env = await fakeEnvironment({ installExit: 243 });
  try {
    await assert.rejects(installStable({
      run: env.run, cwd: ROOT, packDestination: env.packDestination,
      name: 'researchspec', version: '9.9.9', platform: 'linux',
    }), /permission denied/);
    const destructive = env.calls.filter((call) => call.args.some((arg) => arg === 'rm' || arg === 'uninstall' || arg === '-u'));
    assert.deepEqual(destructive, []);
    // Nothing was verified, because nothing was installed.
    assert.equal(env.calls.some((call) => call.args.includes('--version')), false);
  } finally {
    await rm(env.root, { recursive: true, force: true });
  }
});

void test('stable install rejects a stale or misreporting install', async () => {
  const { installStable } = await loadModule();
  const missing = await fakeEnvironment();
  try {
    await assert.rejects(installStable({
      run: missing.run, cwd: ROOT, packDestination: missing.packDestination,
      name: 'absent-scope.absent-pkg', version: '9.9.9', platform: 'linux',
    }), /No installed absent-scope[.]absent-pkg package at/);
  } finally {
    await rm(missing.root, { recursive: true, force: true });
  }
  const stale = await fakeEnvironment({ installedVersion: '1.0.0' });
  try {
    await assert.rejects(installStable({
      run: stale.run, cwd: ROOT, packDestination: stale.packDestination,
      name: 'researchspec', version: '9.9.9', platform: 'linux',
    }), /expected 9[.]9[.]9/);
  } finally {
    await rm(stale.root, { recursive: true, force: true });
  }
  const lying = await fakeEnvironment({ cliVersion: '0.0.1' });
  try {
    await assert.rejects(installStable({
      run: lying.run, cwd: ROOT, packDestination: lying.packDestination,
      name: 'researchspec', version: '9.9.9', platform: 'linux',
    }), /reported 0[.]0[.]1/);
  } finally {
    await rm(lying.root, { recursive: true, force: true });
  }
});

void test('win32 runs address the npm and pnpm shims', async () => {
  const { installStable, platformCommand } = await loadModule();
  assert.equal(platformCommand('npm', 'win32'), 'npm.cmd');
  assert.equal(platformCommand('pnpm', 'win32'), 'pnpm.cmd');
  assert.equal(platformCommand('npm', 'linux'), 'npm');
  const env = await fakeEnvironment({ packedFilename: 'researchspec-9.9.9.tgz' });
  try {
    const calls: string[] = [];
    const run: Run = (command, args) => {
      calls.push([command, args[0]].join(' '));
      if (args[0] === 'pack') return { status: 0, stdout: '[{"filename":"researchspec-9.9.9.tgz","files":[]}]', stderr: '' };
      if (args[0] === 'root') return { status: 0, stdout: `${env.globalRoot}\n`, stderr: '' };
      if (args.at(-1) === '--version') return { status: 0, stdout: '9.9.9\n', stderr: '' };
      return { status: 0, stdout: '', stderr: '' };
    };
    await installStable({ run, cwd: ROOT, packDestination: env.packDestination, name: 'researchspec', version: '9.9.9', platform: 'win32' });
    for (const expected of ['pnpm.cmd build', 'npm.cmd pack', 'npm.cmd install', 'npm.cmd root']) assert.ok(calls.includes(expected), expected);
  } finally {
    await rm(env.root, { recursive: true, force: true });
  }
});

void test('the process runner reports the real command output on failure', async () => {
  const { createProcessRunner } = await loadModule();
  const run = createProcessRunner('linux');
  const result = run(process.execPath, ['-e', 'process.stdout.write("done")'], { cwd: ROOT });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /done/);
  assert.throws(() => run(process.execPath, ['-e', 'process.stderr.write("boom"); process.exit(3)'], { cwd: ROOT }), /boom/);
});

function tokenizeWindows(line: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quoted = false;
  for (const character of line) {
    if (character === '"') { quoted = !quoted; continue; }
    if (character === ' ' && !quoted) { if (current) tokens.push(current); current = ''; continue; }
    current += character;
  }
  if (current) tokens.push(current);
  return tokens;
}

void test('the win32 runner hands cmd one quoted argument per value, POSIX keeps its array', async () => {
  const { createProcessRunner } = await loadModule();
  const seen: { command: string; args: string[]; shell: boolean | undefined }[] = [];
  const spawn: Spawn = (command, args, options) => {
    seen.push({ command, args, shell: options.shell });
    return { status: 0, stdout: '', stderr: '' };
  };
  // A repository or temp path on Windows routinely carries a space, and & | < > ^
  // would silently split the command line if any argument were left bare.
  const tarball = String.raw`C:\Users\Ada & Sons\AppData\Local\Temp\researchspec-stable-1\researchspec-0.1.0.tgz`;
  const winRun = createProcessRunner('win32', spawn);
  winRun('npm.cmd', ['install', '-g', tarball], { cwd: ROOT });
  const win = seen.at(-1);
  assert.equal(win?.shell, true);
  assert.deepEqual(win?.args, []);
  assert.deepEqual(tokenizeWindows(win?.command ?? ''), ['npm.cmd', 'install', '-g', tarball]);

  seen.length = 0;
  const posixRun = createProcessRunner('linux', spawn);
  posixRun('npm', ['install', '-g', tarball], { cwd: ROOT });
  const posix = seen.at(-1);
  assert.equal(posix?.shell, false);
  assert.equal(posix?.command, 'npm');
  assert.deepEqual(posix?.args, ['install', '-g', tarball]);
});
