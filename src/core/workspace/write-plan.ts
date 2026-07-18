import { createHash, randomUUID } from "node:crypto";
import { chmod, lstat, mkdir, readFile, readdir, readlink, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export type PlannedAction = "create" | "refresh" | "remove-owned" | "move" | "skip-unchanged" | "skip-drift" | "conflict";

export interface PlannedWrite {
  action: PlannedAction;
  path: string;
  relativePath?: string;
  content?: string | Uint8Array;
  sourcePath?: string;
  scope: "workspace" | "project" | "shared-global";
  ownership: "user" | "generated";
  previousHash?: string;
  nextHash?: string;
  previousMode?: number;
  nextMode?: number;
  reason: string;
}

export interface WritePlan {
  operations: PlannedWrite[];
  readPreconditions?: ReadPrecondition[];
}

export interface ReadPrecondition {
  path: string;
  expectedHash: string;
  reason: string;
}

export function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function planFile(input: {
  path: string;
  relativePath?: string;
  content: string | Uint8Array;
  scope: PlannedWrite["scope"];
  ownership: PlannedWrite["ownership"];
  recordedHash?: string;
  force?: boolean;
  mode?: number;
  requireRecordedOwnership?: boolean;
}): Promise<PlannedWrite> {
  const existing = await readFileState(input.path);
  const nextHash = sha256(input.content);
  if (existing === undefined) {
    return { ...input, action: "create", nextHash, ...(input.mode === undefined ? {} : { nextMode: normalizeMode(input.mode) }), reason: "target is missing" };
  }
  if (existing.kind !== "file") {
    return { ...input, action: "conflict", nextHash, previousMode: existing.mode, ...(input.mode === undefined ? {} : { nextMode: normalizeMode(input.mode) }), reason: `existing target is ${existing.kind}, not a regular file` };
  }
  const previousHash = sha256(existing.bytes);
  const previousMode = existing.mode;
  const nextMode = input.mode === undefined ? undefined : normalizeMode(input.mode);
  if (input.requireRecordedOwnership && !input.recordedHash) {
    return { ...input, action: "conflict", previousHash, nextHash, previousMode, ...(nextMode === undefined ? {} : { nextMode }), reason: "existing path is not manifest-owned" };
  }
  const modeCurrent = nextMode === undefined || previousMode === nextMode;
  if (previousHash === nextHash && modeCurrent) {
    return { ...input, action: "skip-unchanged", previousHash, nextHash, previousMode, ...(nextMode === undefined ? {} : { nextMode }), reason: "content and mode are current" };
  }
  if (previousHash === nextHash && !modeCurrent) {
    if (input.ownership === "user") return { ...input, action: "conflict", previousHash, nextHash, previousMode, nextMode, reason: "existing user-owned file mode is protected" };
    if (!input.recordedHash) return { ...input, action: "conflict", previousHash, nextHash, previousMode, nextMode, reason: "existing path mode is not manifest-owned" };
    if (previousHash !== input.recordedHash && !input.force) return { ...input, action: "skip-drift", previousHash, nextHash, previousMode, nextMode, reason: "generated file has user modifications" };
    return { ...input, action: "refresh", previousHash, nextHash, previousMode, nextMode, reason: "restore manifest-owned file mode" };
  }
  if (input.ownership === "user") {
    return { ...input, action: "conflict", previousHash, nextHash, previousMode, ...(nextMode === undefined ? {} : { nextMode }), reason: "existing user-owned file is protected" };
  }
  if (!input.recordedHash) {
    return { ...input, action: "conflict", previousHash, nextHash, previousMode, ...(nextMode === undefined ? {} : { nextMode }), reason: "existing path is not manifest-owned" };
  }
  if (previousHash !== input.recordedHash && !input.force) {
    return { ...input, action: "skip-drift", previousHash, nextHash, previousMode, ...(nextMode === undefined ? {} : { nextMode }), reason: "generated file has user modifications" };
  }
  return { ...input, action: "refresh", previousHash, nextHash, previousMode, ...(nextMode === undefined ? {} : { nextMode }), reason: input.force ? "forced manifest-owned refresh" : "safe manifest-owned refresh" };
}

export async function executeWritePlan(plan: WritePlan): Promise<void> {
  const actionable = plan.operations.filter((operation) => operation.action === "create" || operation.action === "refresh" || operation.action === "remove-owned" || operation.action === "move");
  const transaction = actionable.map((operation) => ({ operation, temporary: `${operation.path}.researchspec-${randomUUID()}.tmp`, backup: `${operation.path}.researchspec-${randomUUID()}.bak`, hadOriginal: false, committed: false }));
  try {
    for (const precondition of plan.readPreconditions ?? []) {
      if (!(await exists(precondition.path)) || await hashPath(precondition.path) !== precondition.expectedHash) {
        throw writeConflict(`Read precondition changed (${precondition.reason}): ${precondition.path}`);
      }
    }
    for (const entry of transaction) await verifyPrecondition(entry.operation);
    for (const entry of transaction) {
      if (entry.operation.action === "remove-owned" || entry.operation.action === "move") continue;
      if (entry.operation.content === undefined) throw new Error(`Planned write has no content: ${entry.operation.path}`);
      await mkdir(path.dirname(entry.operation.path), { recursive: true });
      await writeFile(entry.temporary, entry.operation.content);
      if (entry.operation.nextMode !== undefined) await chmod(entry.temporary, entry.operation.nextMode);
    }
    for (const entry of transaction) {
      if (entry.operation.action === "move") {
        if (!entry.operation.sourcePath) throw writeConflict(`Move has no source: ${entry.operation.path}`);
        await mkdir(path.dirname(entry.operation.path), { recursive: true });
        await rename(entry.operation.sourcePath, entry.operation.path);
        entry.committed = true;
        continue;
      }
      entry.hadOriginal = await exists(entry.operation.path);
      if (entry.hadOriginal) await rename(entry.operation.path, entry.backup);
      if (entry.operation.action !== "remove-owned") await rename(entry.temporary, entry.operation.path);
      entry.committed = true;
    }
  } catch (error) {
    for (const entry of [...transaction].reverse()) {
      if (entry.committed && entry.operation.action === "move" && entry.operation.sourcePath) {
        await rename(entry.operation.path, entry.operation.sourcePath).catch(() => undefined);
        continue;
      }
      if (entry.committed && entry.operation.action !== "remove-owned") await rm(entry.operation.path, { force: true }).catch(() => undefined);
      if (entry.hadOriginal && await exists(entry.backup)) await rename(entry.backup, entry.operation.path).catch(() => undefined);
      await rm(entry.temporary, { force: true }).catch(() => undefined);
    }
    throw error;
  }
  for (const entry of transaction) if (entry.hadOriginal) await rm(entry.backup, { force: true }).catch(() => undefined);
}

type FileState = { kind: "file"; bytes: Uint8Array; mode: number } | { kind: "directory" | "symlink" | "other"; mode: number };

async function readFileState(filePath: string): Promise<FileState | undefined> {
  try {
    const info = await lstat(filePath);
    const mode = normalizeMode(info.mode);
    if (info.isSymbolicLink()) return { kind: "symlink", mode };
    if (info.isDirectory()) return { kind: "directory", mode };
    if (!info.isFile()) return { kind: "other", mode };
    return { kind: "file", bytes: await readFile(filePath), mode };
  }
  catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") return undefined;
    throw error;
  }
}

async function exists(filePath: string): Promise<boolean> {
  try { await lstat(filePath); return true; }
  catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") return false;
    throw error;
  }
}

export async function hashPath(target: string): Promise<string> {
  const info = await lstat(target);
  if (info.isSymbolicLink()) return sha256(`symlink:${await readlink(target)}`);
  if (info.isFile()) return sha256(await readFile(target));
  if (!info.isDirectory()) return sha256(`other:${String(info.mode)}`);
  const parts: string[] = [];
  for (const entry of (await readdir(target)).sort(compareText)) parts.push(`${entry}\0${await hashPath(path.join(target, entry))}`);
  return sha256(parts.join("\n"));
}

async function verifyPrecondition(operation: PlannedWrite): Promise<void> {
  if (operation.action === "create") {
    if (await exists(operation.path)) throw writeConflict(`Create target now exists: ${operation.path}`);
    return;
  }
  if (operation.action === "move") {
    if (!operation.sourcePath || !(await exists(operation.sourcePath))) throw writeConflict(`Move source is missing: ${operation.sourcePath ?? "unknown"}`);
    if (await exists(operation.path)) throw writeConflict(`Move target already exists: ${operation.path}`);
    if (operation.previousHash && await hashPath(operation.sourcePath) !== operation.previousHash) throw writeConflict(`Move source changed after planning: ${operation.sourcePath}`);
    return;
  }
  if (!(await exists(operation.path))) throw writeConflict(`Planned target is missing: ${operation.path}`);
  if (operation.previousHash && await hashPath(operation.path) !== operation.previousHash) throw writeConflict(`Target changed after planning: ${operation.path}`);
  if (operation.previousMode !== undefined && normalizeMode((await lstat(operation.path)).mode) !== operation.previousMode) throw writeConflict(`Target mode changed after planning: ${operation.path}`);
}

function writeConflict(message: string): NodeJS.ErrnoException {
  const error = new Error(message) as NodeJS.ErrnoException;
  error.code = "EWRITE_CONFLICT";
  return error;
}

function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
function normalizeMode(mode: number): number { return mode & 0o777; }
