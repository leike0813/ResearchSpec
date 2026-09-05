import { createHash, randomUUID } from "node:crypto";
import { chmod, lstat, mkdir, readFile, readdir, readlink, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { assertPathWithinRoot } from "./path-boundary.js";

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
  boundaryRoot?: string;
  reason: string;
}

export interface WritePlan {
  operations: PlannedWrite[];
  readPreconditions?: ReadPrecondition[];
  ensureDirectories?: string[];
  boundaryRoot?: string;
}

export interface WritePlanExecutionOptions {
  validateCommittedState?: () => Promise<void>;
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
  boundaryRoot?: string;
}): Promise<PlannedWrite> {
  const nextHash = sha256(input.content);
  const nextMode = input.mode === undefined ? undefined : normalizeMode(input.mode);
  if (input.ownership === "generated" && input.boundaryRoot === undefined) {
    return { ...input, action: "conflict", nextHash, ...(nextMode === undefined ? {} : { nextMode }), reason: "generated write has no trusted root" };
  }
  if (input.boundaryRoot !== undefined) {
    try {
      await assertPathWithinRoot(input.boundaryRoot, input.path);
    }
    catch (error) {
      return { ...input, action: "conflict", nextHash, ...(nextMode === undefined ? {} : { nextMode }), reason: error instanceof Error ? error.message : "target is outside trusted root" };
    }
  }
  const existing = await readFileState(input.path);
  if (existing === undefined) {
    return { ...input, action: "create", nextHash, ...(nextMode === undefined ? {} : { nextMode }), reason: "target is missing" };
  }
  if (existing.kind !== "file") {
    return { ...input, action: "conflict", nextHash, previousMode: existing.mode, ...(nextMode === undefined ? {} : { nextMode }), reason: `existing target is ${existing.kind}, not a regular file` };
  }
  const previousHash = sha256(existing.bytes);
  const previousMode = existing.mode;
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

export function planDirectFileEdit(input: {
  path: string;
  relativePath?: string;
  content: string | Uint8Array;
  previousContent?: string | Uint8Array;
  scope?: PlannedWrite["scope"];
  reason: string;
  boundaryRoot?: string;
}): PlannedWrite {
  const nextHash = sha256(input.content);
  const boundary = input.boundaryRoot === undefined ? {} : { boundaryRoot: input.boundaryRoot };
  if (input.previousContent === undefined) {
    return {
      action: "create",
      path: input.path,
      ...(input.relativePath === undefined ? {} : { relativePath: input.relativePath }),
      content: input.content,
      scope: input.scope ?? "workspace",
      ownership: "user",
      nextHash,
      ...boundary,
      reason: input.reason,
    };
  }
  return {
    action: sha256(input.previousContent) === nextHash ? "skip-unchanged" : "refresh",
    path: input.path,
    ...(input.relativePath === undefined ? {} : { relativePath: input.relativePath }),
    content: input.content,
    scope: input.scope ?? "workspace",
    ownership: "user",
    previousHash: sha256(input.previousContent),
    nextHash,
    ...boundary,
    reason: input.reason,
  };
}

export async function executeWritePlan(plan: WritePlan, options: WritePlanExecutionOptions = {}): Promise<void> {
  const actionable = plan.operations.filter((operation) => operation.action === "create" || operation.action === "refresh" || operation.action === "remove-owned" || operation.action === "move");
  const transaction: WriteTransaction[] = actionable.map((operation) => ({ operation, temporary: `${operation.path}.researchspec-${randomUUID()}.tmp`, backup: `${operation.path}.researchspec-${randomUUID()}.bak`, hadOriginal: false, committed: false }));
  const createdDirectories: string[] = [];
  try {
    const conflict = plan.operations.find((operation) => operation.action === "conflict");
    if (conflict) throw writeConflict(`Write plan contains a conflict: ${conflict.path}`);
    await assertPlanBoundaries(plan, transaction);
    for (const precondition of plan.readPreconditions ?? []) {
      await assertPlanBoundary(plan.boundaryRoot, precondition.path);
      if (!(await exists(precondition.path)) || await hashPath(precondition.path) !== precondition.expectedHash) {
        throw writeConflict(`Read precondition changed (${precondition.reason}): ${precondition.path}`);
      }
    }
    for (const entry of transaction) {
      await assertTransactionBoundaries(entry);
      await verifyPrecondition(entry.operation);
    }
    for (const directory of [...new Set(plan.ensureDirectories ?? [])].sort(compareText)) {
      await assertPlanBoundary(plan.boundaryRoot, directory);
      if (await exists(directory)) continue;
      await assertPlanBoundary(plan.boundaryRoot, directory);
      await mkdir(directory, { recursive: true });
      createdDirectories.push(directory);
    }
    for (const entry of transaction) {
      if (entry.operation.action === "remove-owned" || entry.operation.action === "move") continue;
      if (entry.operation.content === undefined) throw new Error(`Planned write has no content: ${entry.operation.path}`);
      await assertTransactionBoundaries(entry);
      await mkdir(path.dirname(entry.operation.path), { recursive: true });
      await assertTransactionBoundaries(entry);
      await writeFile(entry.temporary, entry.operation.content);
      if (entry.operation.nextMode !== undefined) {
        await assertTransactionBoundaries(entry);
        await chmod(entry.temporary, entry.operation.nextMode);
      }
    }
    for (const entry of transaction) {
      if (entry.operation.action === "move") {
        if (!entry.operation.sourcePath) throw writeConflict(`Move has no source: ${entry.operation.path}`);
        await assertTransactionBoundaries(entry);
        await mkdir(path.dirname(entry.operation.path), { recursive: true });
        await assertTransactionBoundaries(entry);
        await rename(entry.operation.sourcePath, entry.operation.path);
        entry.committed = true;
        continue;
      }
      await assertTransactionBoundaries(entry);
      entry.hadOriginal = await exists(entry.operation.path);
      if (entry.hadOriginal) {
        await assertTransactionBoundaries(entry);
        await rename(entry.operation.path, entry.backup);
      }
      if (entry.operation.action !== "remove-owned") {
        await assertTransactionBoundaries(entry);
        await rename(entry.temporary, entry.operation.path);
      }
      entry.committed = true;
    }
    await options.validateCommittedState?.();
  } catch (error) {
    for (const entry of [...transaction].reverse()) {
      if (entry.committed && entry.operation.action === "move" && entry.operation.sourcePath) {
        if (await canMutateTransaction(entry, [entry.operation.path, entry.operation.sourcePath])) {
          await rename(entry.operation.path, entry.operation.sourcePath).catch(() => undefined);
        }
        continue;
      }
      if (entry.committed && entry.operation.action !== "remove-owned" && await canMutateTransaction(entry, [entry.operation.path])) {
        await rm(entry.operation.path, { force: true }).catch(() => undefined);
      }
      if (entry.hadOriginal && await canMutateTransaction(entry, [entry.backup, entry.operation.path]) && await exists(entry.backup)) {
        await rename(entry.backup, entry.operation.path).catch(() => undefined);
      }
      if (await canMutateTransaction(entry, [entry.temporary])) await rm(entry.temporary, { force: true }).catch(() => undefined);
    }
    for (const directory of [...createdDirectories].reverse()) {
      if (await canUseBoundary(plan.boundaryRoot, [directory])) await rm(directory, { recursive: false, force: true }).catch(() => undefined);
    }
    throw error;
  }
  for (const entry of transaction) {
    if (entry.hadOriginal && await canMutateTransaction(entry, [entry.backup])) await rm(entry.backup, { force: true }).catch(() => undefined);
  }
}

type WriteTransaction = {
  operation: PlannedWrite;
  temporary: string;
  backup: string;
  hadOriginal: boolean;
  committed: boolean;
};

async function assertPlanBoundaries(plan: WritePlan, transaction: WriteTransaction[]): Promise<void> {
  for (const precondition of plan.readPreconditions ?? []) await assertPlanBoundary(plan.boundaryRoot, precondition.path);
  for (const directory of plan.ensureDirectories ?? []) await assertPlanBoundary(plan.boundaryRoot, directory);
  for (const entry of transaction) await assertTransactionBoundaries(entry);
}

async function assertPlanBoundary(root: string | undefined, target: string): Promise<void> {
  if (root !== undefined) await assertPathWithinRoot(root, target);
}

async function assertTransactionBoundaries(entry: WriteTransaction): Promise<void> {
  const root = entry.operation.boundaryRoot;
  if (entry.operation.ownership === "generated" && root === undefined) {
    throw writeConflict(`Generated write has no trusted root: ${entry.operation.path}`);
  }
  if (root === undefined) return;
  await assertPathWithinRoot(root, entry.operation.path);
  await assertPathWithinRoot(root, entry.temporary);
  await assertPathWithinRoot(root, entry.backup);
  if (entry.operation.sourcePath) await assertPathWithinRoot(root, entry.operation.sourcePath);
}

async function canMutateTransaction(entry: WriteTransaction, targets: string[]): Promise<boolean> {
  if (entry.operation.ownership === "generated" && entry.operation.boundaryRoot === undefined) return false;
  return canUseBoundary(entry.operation.boundaryRoot, targets);
}

async function canUseBoundary(root: string | undefined, targets: string[]): Promise<boolean> {
  if (root === undefined) return true;
  try {
    for (const target of targets) await assertPathWithinRoot(root, target);
    return true;
  }
  catch {
    return false;
  }
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
