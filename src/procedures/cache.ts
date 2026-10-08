import { randomUUID } from "node:crypto";
import { lstat, mkdir, readFile, readdir, realpath, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import process from "node:process";

export type SemanticCacheKind = "runtime" | "model" | "index" | "staging";
export interface SemanticCacheEntry { kind: SemanticCacheKind; path: string; bytes: number }
export interface SemanticCacheInventory {
  cache_root: string;
  total_bytes: number;
  entries: SemanticCacheEntry[];
  skipped_paths: string[];
}
export interface SemanticCacheClearResult extends SemanticCacheInventory {
  dry_run: boolean;
  cleared_paths: string[];
  failed_paths: { path: string; reason: string }[];
}
export interface SemanticCacheOptions { cacheRoot?: string }
export interface SemanticCacheClearOptions extends SemanticCacheOptions { dryRun?: boolean }

export class SemanticCacheError extends Error {
  constructor(readonly code: "cache_busy" | "cache_unsafe", message: string) {
    super(message);
    this.name = "SemanticCacheError";
  }
}

const LOCK_NAME = ".mutation.lock";

export function semanticCacheRoot(): string {
  const override = process.env.RESEARCHSPEC_SEARCH_CACHE?.trim();
  if (override) return path.resolve(override);
  if (process.platform === "win32") {
    const local = process.env.LOCALAPPDATA?.trim();
    return path.join(local ? path.resolve(local) : path.join(homedir(), "AppData", "Local"), "researchspec", "search");
  }
  if (process.platform === "darwin") return path.join(homedir(), "Library", "Caches", "researchspec", "search");
  const xdg = process.env.XDG_CACHE_HOME?.trim();
  return path.join(xdg ? path.resolve(xdg) : path.join(homedir(), ".cache"), "researchspec", "search");
}

export async function inspectSemanticSearchCache(options: SemanticCacheOptions = {}): Promise<SemanticCacheInventory> {
  const cacheRoot = path.resolve(options.cacheRoot ?? semanticCacheRoot());
  const entries: SemanticCacheEntry[] = [];
  const skipped_paths: string[] = [];
  const add = async (kind: SemanticCacheKind, target: string): Promise<void> => {
    const bytes = await treeBytes(target);
    if (bytes === undefined) skipped_paths.push(target);
    else entries.push({ kind, path: target, bytes });
  };
  const rootInfo = await lstatOrMissing(cacheRoot);
  const resolvedRootInfo = rootInfo === undefined ? undefined : await stat(cacheRoot);
  if (resolvedRootInfo?.isDirectory()) {
    for (const name of await readdir(cacheRoot)) {
      if (name === LOCK_NAME) continue;
      const parent = path.join(cacheRoot, name);
      if (name === "runtime" || name === "model" || name === "index" || name === "staging") {
        const parentInfo = await lstat(parent);
        if (!parentInfo.isDirectory() || parentInfo.isSymbolicLink()) {
          skipped_paths.push(parent);
          continue;
        }
        for (const child of await readdir(parent)) {
          const target = path.join(parent, child);
          const info = await lstat(target);
          const managedStage = name === "staging"
            ? /^(?:runtime|model|index)-[A-Za-z0-9_-]+$/.test(child) || /^discarded-[A-Za-z0-9_-]+$/.test(child)
            : false;
          const kind = name === "runtime" || name === "model" || name === "index" ? name : undefined;
          const identityMatches = kind === "runtime" ? /^runtime-[a-f0-9]{16}$/.test(child)
            : kind === "model" ? /^model-[a-f0-9]{16}$/.test(child)
              : kind === "index" ? /^index-[a-f0-9]{16}$/.test(child) : false;
          const managedIdentity = kind !== undefined && identityMatches && !info.isSymbolicLink() && await hasReceipt(target, kind, child);
          const currentMetadata = kind === "index" && child === "current.json" && await hasIndexMetadata(target, info.isSymbolicLink());
          if (managedStage) await add("staging", target);
          else if (managedIdentity || currentMetadata) await add(kind ?? "index", target);
          else skipped_paths.push(target);
        }
      } else skipped_paths.push(parent);
    }
  } else if (rootInfo !== undefined) {
    throw new SemanticCacheError("cache_unsafe", `Cache root is not a directory: ${cacheRoot}`);
  }
  return {
    cache_root: cacheRoot,
    total_bytes: entries.reduce((total, entry) => total + entry.bytes, 0),
    entries: entries.sort((left, right) => left.path.localeCompare(right.path)),
    skipped_paths: skipped_paths.sort(),
  };
}

export async function clearSemanticSearchCache(options: SemanticCacheClearOptions = {}): Promise<SemanticCacheClearResult> {
  const cacheRoot = path.resolve(options.cacheRoot ?? semanticCacheRoot());
  const inventory = await inspectSemanticSearchCache({ cacheRoot });
  if (options.dryRun) {
    return { ...inventory, dry_run: options.dryRun ?? false, cleared_paths: [], failed_paths: [] };
  }
  if (await lstatOrMissing(cacheRoot) === undefined) return { ...inventory, dry_run: false, cleared_paths: [], failed_paths: [] };
  const release = await acquireSemanticCacheLock(cacheRoot);
  const cleared_paths: string[] = [];
  const failed_paths: SemanticCacheClearResult["failed_paths"] = [];
  try {
    const current = await inspectSemanticSearchCache({ cacheRoot });
    for (const entry of current.entries) {
      try {
        await assertManagedCandidate(cacheRoot, entry);
        // fs.rm unlinks a symlink itself and does not traverse its target.
        await rm(entry.path, { recursive: true });
        cleared_paths.push(entry.path);
      } catch (error) {
        failed_paths.push({ path: entry.path, reason: error instanceof Error ? error.message : String(error) });
      }
    }
    for (const target of await Promise.all(current.skipped_paths.map(async (candidate) => await isUnsafeManagedCandidate(cacheRoot, candidate) ? candidate : undefined))) {
      if (target === undefined) continue;
      if (!failed_paths.some((failure) => failure.path === target)) failed_paths.push({ path: target, reason: "Managed cache candidate is a symbolic link or crosses an unsafe path." });
    }
    return { ...current, dry_run: false, cleared_paths, failed_paths };
  } finally {
    await release();
  }
}

export async function acquireSemanticCacheLock(cacheRoot: string): Promise<() => Promise<void>> {
  const root = path.resolve(cacheRoot);
  await assertMutationRoot(root);
  const rootInfo = await lstatOrMissing(root);
  if (rootInfo?.isSymbolicLink()) throw new SemanticCacheError("cache_unsafe", `Cache root is a symbolic link: ${root}`);
  await mkdir(root, { recursive: true });
  await assertMutationRoot(root);
  const lockPath = path.join(root, LOCK_NAME);
  const token = randomUUID();
  const owner = { pid: process.pid, token };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let created = false;
    let createdStat: Awaited<ReturnType<typeof lstat>> | undefined;
    try {
      await mkdir(lockPath);
      created = true;
      createdStat = await lstat(lockPath);
      await writeFile(path.join(lockPath, "owner.json"), `${JSON.stringify(owner)}\n`, { flag: "wx" });
      return async () => {
        const current = await lockOwner(lockPath);
        const lockInfo = await lstatOrMissing(lockPath);
        if (!lockInfo?.isSymbolicLink() && lockInfo?.isDirectory() && lockInfo.dev === createdStat?.dev && lockInfo.ino === createdStat.ino
          && current?.pid === owner.pid && current.token === token) await rm(lockPath, { recursive: true, force: true });
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        const current = await lstatOrMissing(lockPath);
        if (created && current?.isDirectory() && !current.isSymbolicLink() && current.dev === createdStat?.dev && current.ino === createdStat.ino) {
          await rm(lockPath, { recursive: true, force: true }).catch(() => undefined);
        }
        throw error;
      }
    }
    const previous = await lockOwner(lockPath);
    if (previous === undefined || processIsAlive(previous.pid)) throw new SemanticCacheError("cache_busy", `The semantic cache is locked by a live or unidentified owner: ${root}`);
    const rechecked = await lockOwner(lockPath);
    if (rechecked?.pid !== previous.pid || rechecked.token !== previous.token) continue;
    const recoveryPath = path.join(lockPath, "recovery");
    try {
      await mkdir(recoveryPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      if ((error as NodeJS.ErrnoException).code === "EEXIST") {
        const recoveryOwner = await lockOwner(recoveryPath);
        if (recoveryOwner === undefined || processIsAlive(recoveryOwner.pid)) throw new SemanticCacheError("cache_busy", `The semantic cache is being recovered: ${root}`);
        const recheckedRecovery = await lockOwner(recoveryPath);
        if (recheckedRecovery?.pid === recoveryOwner.pid && recheckedRecovery.token === recoveryOwner.token) {
          // Only one contender may reclaim the dead recovery owner.
          const claimPath = path.join(recoveryPath, "reclaim");
          try {
            await mkdir(claimPath);
          } catch {
            throw new SemanticCacheError("cache_busy", `The semantic cache recovery is already being reclaimed: ${root}`);
          }
          const currentRecovery = await lockOwner(recoveryPath);
          if (currentRecovery?.pid !== recoveryOwner.pid || currentRecovery.token !== recoveryOwner.token) {
            throw new SemanticCacheError("cache_busy", `The semantic cache recovery owner changed: ${root}`);
          }
          await rm(recoveryPath, { recursive: true, force: true });
          continue;
        }
        throw new SemanticCacheError("cache_busy", `The semantic cache recovery owner changed: ${root}`);
      }
      throw error;
    }
    const recoveryToken = randomUUID();
    const recoveryInfo = await lstat(recoveryPath);
    try {
      await writeFile(path.join(recoveryPath, "owner.json"), `${JSON.stringify({ pid: process.pid, token: recoveryToken })}\n`, { flag: "wx" });
    } catch {
      const currentRecovery = await lstatOrMissing(recoveryPath);
      if (currentRecovery?.isDirectory() && !currentRecovery.isSymbolicLink() && currentRecovery.dev === recoveryInfo.dev && currentRecovery.ino === recoveryInfo.ino) {
        await rm(recoveryPath, { recursive: true, force: true }).catch(() => undefined);
      }
      throw new SemanticCacheError("cache_busy", `The semantic cache recovery lock could not be recorded: ${root}`);
    }
    const oldOwnerStillMatches = await lockOwner(lockPath);
    const recoveryStillOurs = await lockOwner(recoveryPath);
    if (oldOwnerStillMatches?.pid !== previous.pid || oldOwnerStillMatches.token !== previous.token
      || recoveryStillOurs?.pid !== process.pid || recoveryStillOurs.token !== recoveryToken) {
      throw new SemanticCacheError("cache_busy", `The semantic cache lock changed during recovery: ${root}`);
    }
    await rm(lockPath, { recursive: true, force: true });
  }
  throw new SemanticCacheError("cache_busy", `The semantic cache lock changed during recovery: ${root}`);
}

async function assertManagedCandidate(root: string, entry: SemanticCacheEntry): Promise<void> {
  await assertMutationRoot(root);
  const relative = path.relative(root, entry.path);
  if (!relative || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new SemanticCacheError("cache_unsafe", `Deletion candidate escapes the cache root: ${entry.path}`);
  }
  const [parent, candidate] = relative.split(path.sep);
  if (!(["runtime", "model", "index", "staging"].includes(parent ?? "") && candidate)) {
    throw new SemanticCacheError("cache_unsafe", `Unrecognized deletion candidate: ${entry.path}`);
  }
  const parentInfo = await lstat(path.join(root, parent));
  if (!parentInfo.isDirectory() || parentInfo.isSymbolicLink()) throw new SemanticCacheError("cache_unsafe", `Deletion path crosses a symbolic link: ${entry.path}`);
  const info = await lstat(entry.path);
  if (info.isSymbolicLink()) throw new SemanticCacheError("cache_unsafe", `Deletion candidate is a symbolic link: ${entry.path}`);
  if (!info.isDirectory() && !info.isFile()) throw new SemanticCacheError("cache_unsafe", `Unsupported deletion target: ${entry.path}`);
}

async function assertMutationRoot(root: string): Promise<void> {
  const canonical = await canonicalPath(root);
  const home = await canonicalPath(homedir());
  const project = await canonicalPath(process.cwd());
  if (canonical === path.parse(canonical).root || canonical === home || isWithin(canonical, project)) {
    throw new SemanticCacheError("cache_unsafe", `Refusing to mutate a protected cache root: ${canonical}`);
  }
  const info = await lstatOrMissing(root);
  if (info?.isSymbolicLink()) throw new SemanticCacheError("cache_unsafe", `Cache root itself is a symbolic link: ${root}`);
}

async function canonicalPath(target: string): Promise<string> {
  let ancestor = target;
  const suffix: string[] = [];
  while (true) {
    try {
      return path.join(await realpath(ancestor), ...suffix.reverse());
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const parent = path.dirname(ancestor);
      if (parent === ancestor) throw error;
      suffix.push(path.basename(ancestor));
      ancestor = parent;
    }
  }
}

function isWithin(parent: string, candidate: string): boolean {
  const relative = path.relative(parent, candidate);
  return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

async function treeBytes(target: string): Promise<number | undefined> {
  try {
    const info = await lstat(target);
    if (!info.isDirectory() || info.isSymbolicLink()) return info.size;
    let bytes = 0;
    for (const entry of await readdir(target)) bytes += (await treeBytes(path.join(target, entry))) ?? 0;
    return bytes;
  } catch {
    return undefined;
  }
}

async function lstatOrMissing(target: string) {
  try { return await lstat(target); } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function lockOwner(lockPath: string): Promise<{ pid: number; token: string } | undefined> {
  try {
    const directoryInfo = await lstat(lockPath);
    const ownerPath = path.join(lockPath, "owner.json");
    const ownerInfo = await lstat(ownerPath);
    if (!directoryInfo.isDirectory() || directoryInfo.isSymbolicLink() || !ownerInfo.isFile() || ownerInfo.isSymbolicLink()) return undefined;
    const owner: unknown = JSON.parse(await readFile(ownerPath, "utf8"));
    if (typeof owner !== "object" || owner === null) return undefined;
    const record = owner as { pid?: unknown; token?: unknown };
    return Number.isSafeInteger(record.pid) && (record.pid as number) > 0 && typeof record.token === "string"
      ? { pid: record.pid as number, token: record.token }
      : undefined;
  } catch { return undefined; }
}

async function hasReceipt(target: string, kind: SemanticCacheKind, identity: string): Promise<boolean> {
  try {
    const info = await lstat(path.join(target, "receipt.json"));
    if (!info.isFile() || info.isSymbolicLink()) return false;
    const value: unknown = JSON.parse(await readFile(path.join(target, "receipt.json"), "utf8"));
    if (typeof value !== "object" || value === null) return false;
    const receipt = value as { kind?: unknown; identity?: unknown; ready?: unknown };
    return receipt.kind === kind && receipt.identity === identity && receipt.ready === true;
  } catch { return false; }
}

async function hasIndexMetadata(target: string, isLink: boolean): Promise<boolean> {
  if (isLink) return false;
  try {
    const info = await lstat(target);
    if (!info.isFile()) return false;
    const value: unknown = JSON.parse(await readFile(target, "utf8"));
    if (typeof value !== "object" || value === null) return false;
    const metadata = value as { identity?: unknown; document_identity?: unknown; runtime_identity?: unknown; model_identity?: unknown; dimensions?: unknown };
    return typeof metadata.identity === "string" && /^index-[a-f0-9]{16}$/.test(metadata.identity)
      && typeof metadata.document_identity === "string" && /^[a-f0-9]{64}$/.test(metadata.document_identity)
      && typeof metadata.runtime_identity === "string" && /^runtime-[a-f0-9]{16}$/.test(metadata.runtime_identity)
      && typeof metadata.model_identity === "string" && /^model-[a-f0-9]{16}$/.test(metadata.model_identity)
      && Number.isSafeInteger(metadata.dimensions) && (metadata.dimensions as number) > 0;
  } catch { return false; }
}

function managedIdentityName(kind: SemanticCacheKind | undefined, name: string): boolean {
  return kind === "runtime" ? /^runtime-[a-f0-9]{16}$/.test(name)
    : kind === "model" ? /^model-[a-f0-9]{16}$/.test(name)
      : kind === "index" && /^index-[a-f0-9]{16}$/.test(name);
}

async function isUnsafeManagedCandidate(root: string, target: string): Promise<boolean> {
  const relative = path.relative(root, target).split(path.sep);
  const info = await lstatOrMissing(target);
  if (relative.length === 1 && ["runtime", "model", "index", "staging"].includes(relative[0] ?? "")) return info?.isSymbolicLink() ?? false;
  if (relative.length !== 2 || !info?.isSymbolicLink()) return false;
  const [kind, name] = relative;
  return kind === "staging" && (/^(?:runtime|model|index)-[A-Za-z0-9_-]+$/.test(name ?? "") || /^discarded-[A-Za-z0-9_-]+$/.test(name ?? ""))
    || kind === "index" && name === "current.json"
    || (kind === "runtime" || kind === "model" || kind === "index") && managedIdentityName(kind, name ?? "");
}

function processIsAlive(pid: number): boolean {
  try { process.kill(pid, 0); return true; } catch (error) {
    return (error as NodeJS.ErrnoException).code !== "ESRCH";
  }
}
