import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const CLI = path.resolve(".test-dist/src/cli/bin.js");

export interface CliProcessResult { status: number | null; stdout: string; stderr: string }
export interface Envelope<T = unknown> { schema_version: string; command: string; ok: boolean; data: T | null; diagnostics: unknown[]; error?: { code?: string; message?: string } }

export function runCli(args: string[], cwd = process.cwd(), env?: NodeJS.ProcessEnv): CliProcessResult {
  const result = spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: "utf8", env: { ...process.env, ...env } });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

export function parseEnvelope<T = unknown>(result: CliProcessResult): Envelope<T> {
  return JSON.parse(result.stdout) as Envelope<T>;
}

export async function tempProject(): Promise<string> { return mkdtemp(path.join(tmpdir(), "researchspec-test-")); }
export async function cleanup(root: string): Promise<void> { await rm(root, { recursive: true, force: true }); }
