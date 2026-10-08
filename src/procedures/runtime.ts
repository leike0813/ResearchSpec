import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { cp, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

import { PACKAGE_ROOT } from "../capabilities/registry.js";
import { searchDocumentIdentity, searchDocumentText } from "./search-contracts.js";
import type { ProcedureSearchDocument, SemanticHit, SemanticPreparation, SemanticPreparationProgress, SemanticSearchStatus } from "./search-contracts.js";
import { acquireSemanticCacheLock, SemanticCacheError, semanticCacheRoot } from "./cache.js";
import { SEMANTIC_WORKER_RESULT_PREFIX } from "./semantic-worker.js";
import type { SemanticWorkerRequest, SemanticWorkerResult } from "./semantic-worker.js";

export const SEMANTIC_RUNTIME_PACKAGE = "@huggingface/transformers";
export const SEMANTIC_RUNTIME_VERSION = "3.8.1";
export const SEMANTIC_RUNTIME_ASSET_DIRECTORY = "semantic-search/runtime";
export const SEMANTIC_MODEL_ID = "Xenova/multilingual-e5-small";
export const SEMANTIC_MODEL_REVISION = "761b726dd34fb83930e26aab4e9ac3899aa1fa78";
export const SEMANTIC_EMBEDDING_DIMENSIONS = 384;
export const SEMANTIC_MAX_TOKENS = 512;
/** Long inputs stall the tokenizer long before the token budget applies, so passages are bounded by characters first. */
export const SEMANTIC_MAX_INPUT_CHARACTERS = 4_000;
export const SEMANTIC_CANDIDATE_LIMIT = 50;
export const SEMANTIC_QUERY_TIMEOUT_MS = 10_000;
export const SEMANTIC_PREPARE_TIMEOUT_MS = 600_000;
export const SEMANTIC_INDEX_VERSION = 1;
export const SEMANTIC_SELF_TEST_QUERY = "organize existing literature into a review";

/** Model files are the minimum set a CPU feature-extraction load needs; the other quantized variants stay out of the cache. */
export const SEMANTIC_MODEL_FILES: readonly SemanticModelFile[] = [
  { path: "config.json", bytes: 658 },
  { path: "onnx/model_quantized.onnx", bytes: 118_308_185 },
  { path: "special_tokens_map.json", bytes: 167 },
  { path: "tokenizer.json", bytes: 17_082_730 },
  { path: "tokenizer_config.json", bytes: 443 },
];

export const SEMANTIC_DOWNLOAD_BYTES = SEMANTIC_MODEL_FILES.reduce((total, file) => total + file.bytes, 0);

export const SEMANTIC_RUNTIME: Readonly<{
  package: string;
  version: string;
  asset_directory: string;
  install_command: string;
  model: string;
  model_revision: string;
  model_files: number;
}> = {
  package: SEMANTIC_RUNTIME_PACKAGE,
  version: SEMANTIC_RUNTIME_VERSION,
  asset_directory: SEMANTIC_RUNTIME_ASSET_DIRECTORY,
  install_command: "npm ci --ignore-scripts --omit=dev --no-audit --no-fund",
  model: SEMANTIC_MODEL_ID,
  model_revision: SEMANTIC_MODEL_REVISION,
  model_files: SEMANTIC_MODEL_FILES.length,
};

export type SemanticSearchErrorCode =
  | "runtime_missing"
  | "runtime_unusable"
  | "install_failed"
  | "model_missing"
  | "model_download_failed"
  | "index_missing"
  | "index_stale"
  | "inference_failed"
  | "deadline_exceeded"
  | "cache_busy"
  | "cache_unsafe"
  | "unknown";

export const SEMANTIC_ERROR_MESSAGES: Readonly<Record<SemanticSearchErrorCode, string>> = {
  runtime_missing: "The local semantic runtime is not installed.",
  runtime_unusable: "The installed local semantic runtime is not usable.",
  install_failed: "Installing the locked local semantic runtime failed.",
  model_missing: "The pinned multilingual model is not available in the user cache.",
  model_download_failed: "Downloading the pinned multilingual model failed.",
  index_missing: "No prepared Procedure vector index is available for the current catalog.",
  index_stale: "The prepared Procedure vector index does not match the current catalog.",
  inference_failed: "Local semantic inference failed.",
  deadline_exceeded: "Local semantic retrieval exceeded its time budget.",
  cache_busy: "The shared semantic cache is being modified by another process.",
  cache_unsafe: "The shared semantic cache path is unsafe to modify.",
  unknown: "Local semantic retrieval is unavailable for an unrecognized reason.",
};

export class SemanticSearchError extends Error {
  readonly code: SemanticSearchErrorCode;

  constructor(code: SemanticSearchErrorCode, detail?: string) {
    super(detail === undefined || detail === "" ? SEMANTIC_ERROR_MESSAGES[code] : `${SEMANTIC_ERROR_MESSAGES[code]}: ${detail}`);
    this.name = "SemanticSearchError";
    this.code = code;
  }
}

/** Parents receive a stable code vocabulary; anything unrecognized degrades to "unknown". */
export function semanticErrorCode(value: unknown): SemanticSearchErrorCode {
  if (value instanceof SemanticSearchError) return value.code;
  if (value instanceof SemanticCacheError) return value.code;
  if (typeof value === "string" && Object.hasOwn(SEMANTIC_ERROR_MESSAGES, value)) return value as SemanticSearchErrorCode;
  return "unknown";
}

export interface SemanticModelFile {
  path: string;
  bytes: number;
}

export interface SemanticRuntimeEnvironment {
  installRuntime(runtimeDirectory: string, timeoutMs: number): Promise<void>;
  downloadModelFile(modelDirectory: string, file: SemanticModelFile, timeoutMs: number, onProgress?: (completed: number) => void): Promise<void>;
  runInference(request: SemanticWorkerRequest, timeoutMs: number): Promise<SemanticWorkerResult>;
}

export interface SemanticIndexMetadata {
  identity: string;
  document_identity: string;
  runtime_identity: string;
  model_identity: string;
  dimensions: number;
}

export interface SemanticInspectOptions {
  cacheRoot?: string;
  packageRoot?: string;
}

export interface SemanticPrepareOptions extends SemanticInspectOptions {
  timeoutMs?: number;
  environment?: SemanticRuntimeEnvironment;
  onProgress?: (progress: SemanticPreparationProgress) => void;
}

export interface SemanticSearchOptions {
  cacheRoot?: string;
  packageRoot?: string;
  timeoutMs?: number;
  environment?: SemanticRuntimeEnvironment;
}

interface SemanticIndexFile {
  version: number;
  dimensions: number;
  ids: string[];
  vectors: number[][];
}

interface SemanticIndexCurrent {
  identity: string;
  document_identity: string;
  runtime_identity: string;
  model_identity: string;
  dimensions: number;
}

const SEMANTIC_EMBEDDING_BATCH = 32;
const SEMANTIC_VECTOR_PRECISION = 6;
const SEMANTIC_NORM_TOLERANCE = 0.02;
const SEMANTIC_WORKER_OUTPUT_LIMIT = 4 * 1024 * 1024;
const SEMANTIC_PROCESS_OUTPUT_LIMIT = 256 * 1024;
/** The inference subprocess needs the OS variables the native binding depends on, and nothing else. */
const SEMANTIC_WORKER_ENV_PASSTHROUGH = [
  "PATH",
  "HOME",
  "LANG",
  "TMPDIR",
  "TEMP",
  "TMP",
  "SystemRoot",
  "WINDIR",
  "LOCALAPPDATA",
  "APPDATA",
  "USERPROFILE",
] as const;

export { clearSemanticSearchCache, inspectSemanticSearchCache } from "./cache.js";
export { semanticCacheRoot };

export async function semanticRuntimeIdentity(packageRoot = PACKAGE_ROOT): Promise<string> {
  const lock = await readFile(path.join(packageRoot, SEMANTIC_RUNTIME_ASSET_DIRECTORY, "package-lock.json"), "utf8");
  return `runtime-${shortHash(`${SEMANTIC_RUNTIME_PACKAGE}@${SEMANTIC_RUNTIME_VERSION}\n${lock}`)}`;
}

export function semanticModelIdentity(): string {
  const manifest = SEMANTIC_MODEL_FILES.map((file) => `${file.path}:${String(file.bytes)}`).join("\n");
  return `model-${shortHash(`${SEMANTIC_MODEL_ID}@${SEMANTIC_MODEL_REVISION}\n${manifest}`)}`;
}

export async function semanticIndexMetadata(
  documents: readonly ProcedureSearchDocument[],
  options: { packageRoot?: string } = {},
): Promise<SemanticIndexMetadata> {
  const runtimeIdentity = await semanticRuntimeIdentity(options.packageRoot);
  const modelIdentity = semanticModelIdentity();
  const documentIdentity = searchDocumentIdentity(documents);
  return {
    identity: `index-${shortHash(`${String(SEMANTIC_INDEX_VERSION)}\n${runtimeIdentity}\n${modelIdentity}\n${documentIdentity}`)}`,
    document_identity: documentIdentity,
    runtime_identity: runtimeIdentity,
    model_identity: modelIdentity,
    dimensions: SEMANTIC_EMBEDDING_DIMENSIONS,
  };
}

export async function inspectSemanticSearch(
  documents?: readonly ProcedureSearchDocument[],
  options: SemanticInspectOptions = {},
): Promise<SemanticSearchStatus> {
  const cacheRoot = options.cacheRoot ?? semanticCacheRoot();
  const metadata = documents === undefined ? undefined : await semanticIndexMetadata(documents, options);
  return inspectResolved(cacheRoot, metadata);
}

export async function prepareSemanticSearch(
  documents: readonly ProcedureSearchDocument[],
  options: SemanticPrepareOptions = {},
): Promise<SemanticPreparation> {
  assertDocuments(documents);
  const cacheRoot = options.cacheRoot ?? semanticCacheRoot();
  const packageRoot = options.packageRoot ?? PACKAGE_ROOT;
  const environment = options.environment ?? defaultSemanticRuntimeEnvironment(packageRoot);
  const onProgress = options.onProgress;
  const report = (progress: SemanticPreparationProgress): void => { try { onProgress?.(progress); } catch { /* Progress observers cannot break preparation. */ } };
  const deadline = Date.now() + Math.max(1, options.timeoutMs ?? SEMANTIC_PREPARE_TIMEOUT_MS);
  const metadata = await semanticIndexMetadata(documents, { packageRoot });
  report({ stage: "cache", status: "started" });
  if ((await inspectResolved(cacheRoot, metadata)).ready) {
    report({ stage: "cache", status: "reused" });
    report({ stage: "cache", status: "completed" });
    return { ready: true, prepared: false, cache_root: cacheRoot };
  }

  const stagingRoot = path.join(cacheRoot, "staging");
  let staged: string | undefined;
  let release: (() => Promise<void>) | undefined;
  let stage: SemanticPreparationProgress["stage"] = "cache";
  try {
    release = await acquireSemanticCacheLock(cacheRoot);
    if ((await inspectResolved(cacheRoot, metadata)).ready) {
      report({ stage: "cache", status: "reused" });
      report({ stage: "cache", status: "completed" });
      return { ready: true, prepared: false, cache_root: cacheRoot };
    }
    await mkdir(stagingRoot, { recursive: true });
    const runtimeDirectory = path.join(cacheRoot, "runtime", metadata.runtime_identity);
    const modelDirectory = path.join(cacheRoot, "model", metadata.model_identity);
    stage = "runtime";
    report({ stage, status: "started" });
    if (!(await runtimeInstalled(cacheRoot, metadata.runtime_identity))) {
      staged = await mkdtemp(path.join(stagingRoot, "runtime-"));
      await runWithinBudget(installRuntime(environment, staged, remaining(deadline)), remaining(deadline), "Runtime installation exceeded the preparation deadline.", true);
      await publishDirectory(stagingRoot, staged, runtimeDirectory, "runtime", runtimeDirectoryUsable);
      staged = undefined;
      report({ stage, status: "completed" });
    } else report({ stage, status: "reused" });
    if (!(await runtimeInstalled(cacheRoot, metadata.runtime_identity))) throw new SemanticSearchError("runtime_unusable");

    stage = "model";
    report({ stage, status: "started" });
    if (!(await modelInstalled(cacheRoot, metadata.model_identity))) {
      staged = await mkdtemp(path.join(stagingRoot, "model-"));
      await downloadModel(environment, staged, deadline, report);
      await publishDirectory(stagingRoot, staged, modelDirectory, "model", modelDirectoryUsable);
      staged = undefined;
      report({ stage, status: "completed", completed: SEMANTIC_DOWNLOAD_BYTES, total: SEMANTIC_DOWNLOAD_BYTES });
    } else report({ stage, status: "reused" });
    if (!(await modelInstalled(cacheRoot, metadata.model_identity))) throw new SemanticSearchError("model_missing");

    stage = "index";
    report({ stage, status: "started", completed: 0, total: documents.length });
    if (!(await indexUsable(cacheRoot, metadata))) {
      staged = await mkdtemp(path.join(stagingRoot, "index-"));
      const indexPath = path.join(staged, "vectors.json");
      await writeFile(indexPath, await buildIndex(environment, runtimeDirectory, modelDirectory, documents, deadline, (completed, total) => report({ stage: "index", status: "progress", completed, total })));
      stage = "self-test";
      report({ stage, status: "started" });
      await selfTest(environment, runtimeDirectory, modelDirectory, indexPath, metadata, deadline);
      report({ stage, status: "completed" });
      await publishDirectory(stagingRoot, staged, indexDirectoryFor(cacheRoot, metadata), "index", (directory) => indexDirectoryUsable(directory, metadata));
      staged = undefined;
      await writeIndexCurrent(cacheRoot, metadata);
      stage = "index";
      report({ stage, status: "completed", completed: documents.length, total: documents.length });
    } else report({ stage, status: "reused", completed: documents.length, total: documents.length });
  } catch (error) {
    const reason = error instanceof SemanticCacheError ? error.code : semanticErrorCode(error);
    return { ready: false, prepared: false, reason, detail: detail(error), stage, cache_root: cacheRoot };
  } finally {
    try {
      if (staged !== undefined) await rm(staged, { recursive: true, force: true });
    } finally {
      await release?.();
    }
  }

  const completed = await inspectResolved(cacheRoot, metadata);
  return completed.ready
    ? { ready: true, prepared: true, cache_root: cacheRoot }
    : { ready: false, prepared: false, reason: completed.reason ?? "unknown", cache_root: cacheRoot };
}

export async function searchSemanticDocuments(
  documents: readonly ProcedureSearchDocument[],
  query: string,
  options: SemanticSearchOptions = {},
): Promise<SemanticHit[]> {
  assertDocuments(documents);
  if (typeof query !== "string" || query.trim() === "") throw new TypeError("A semantic search query is required.");
  const deadline = Date.now() + Math.max(1, options.timeoutMs ?? SEMANTIC_QUERY_TIMEOUT_MS);
  const cacheRoot = options.cacheRoot ?? semanticCacheRoot();
  const environment = options.environment ?? defaultSemanticRuntimeEnvironment();
  const metadata = await semanticIndexMetadata(documents, options);
  if (!(await runtimeInstalled(cacheRoot, metadata.runtime_identity))) throw new SemanticSearchError("runtime_missing");
  if (!(await modelInstalled(cacheRoot, metadata.model_identity))) throw new SemanticSearchError("model_missing");
  if (!(await indexUsable(cacheRoot, metadata))) throw new SemanticSearchError(await indexReason(cacheRoot));
  const indexPath = path.join(indexDirectoryFor(cacheRoot, metadata), "vectors.json");

  const index = parseIndex(await readFile(indexPath, "utf8"), metadata);
  for (const vector of index.vectors) {
    if (Math.abs(Math.sqrt(cosine(vector, vector)) - 1) > SEMANTIC_NORM_TOLERANCE) {
      throw new SemanticSearchError("inference_failed", "Prepared passage vectors are not unit normalized.");
    }
  }
  const { vectors } = await runBounded(environment, {
    mode: "query",
    runtime_dir: path.join(cacheRoot, "runtime", metadata.runtime_identity),
    model_dir: path.join(cacheRoot, "model", metadata.model_identity),
    texts: [query.slice(0, SEMANTIC_MAX_INPUT_CHARACTERS)],
  }, remaining(deadline));
  const probe = validateEmbedding(vectors[0]);
  return index.ids
    .map((id, position) => ({ id, score: cosine(probe, index.vectors[position] ?? []) }))
    .filter((hit) => Number.isFinite(hit.score))
    .sort((left, right) => right.score - left.score || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0))
    .slice(0, SEMANTIC_CANDIDATE_LIMIT);
}

export function defaultSemanticRuntimeEnvironment(packageRoot = PACKAGE_ROOT): SemanticRuntimeEnvironment {
  return {
    installRuntime: (runtimeDirectory, timeoutMs) => installDefaultRuntime(packageRoot, runtimeDirectory, timeoutMs),
    downloadModelFile: downloadModelFile,
    runInference: runSemanticWorker,
  };
}

function assertDocuments(documents: readonly ProcedureSearchDocument[]): void {
  if (!Array.isArray(documents) || documents.length === 0) throw new TypeError("At least one Procedure search document is required.");
}

async function inspectResolved(cacheRoot: string, metadata: SemanticIndexMetadata | undefined): Promise<SemanticSearchStatus> {
  if (metadata === undefined) {
    const runtime = await latestIdentity(path.join(cacheRoot, "runtime"));
    if (runtime === undefined || !(await runtimeInstalled(cacheRoot, runtime))) return { ready: false, cache_root: cacheRoot, reason: "runtime_missing" };
    const model = await latestIdentity(path.join(cacheRoot, "model"));
    if (model === undefined || !(await modelInstalled(cacheRoot, model))) return { ready: false, cache_root: cacheRoot, reason: "model_missing" };
    return { ready: true, cache_root: cacheRoot };
  }
  if (!(await runtimeInstalled(cacheRoot, metadata.runtime_identity))) return { ready: false, cache_root: cacheRoot, reason: "runtime_missing" };
  if (!(await modelInstalled(cacheRoot, metadata.model_identity))) return { ready: false, cache_root: cacheRoot, reason: "model_missing" };
  if (!(await indexUsable(cacheRoot, metadata))) {
    return { ready: false, cache_root: cacheRoot, reason: await indexReason(cacheRoot) };
  }
  return { ready: true, cache_root: cacheRoot };
}

async function installRuntime(environment: SemanticRuntimeEnvironment, runtimeDirectory: string, timeoutMs: number): Promise<void> {
  try {
    await environment.installRuntime(runtimeDirectory, timeoutMs);
  } catch (error) {
    if (error instanceof SemanticSearchError) throw error;
    throw new SemanticSearchError("install_failed", detail(error));
  }
}

async function downloadModel(
  environment: SemanticRuntimeEnvironment,
  modelDirectory: string,
  deadline: number,
  report: (progress: SemanticPreparationProgress) => void,
): Promise<void> {
  const target = path.join(modelDirectory, SEMANTIC_MODEL_ID);
  await mkdir(target, { recursive: true });
  let completed = 0;
  for (const file of SEMANTIC_MODEL_FILES) {
    const budget = remaining(deadline);
    report({ stage: "model", status: "started", completed, total: SEMANTIC_DOWNLOAD_BYTES, file: file.path });
    try {
      await runWithinBudget(environment.downloadModelFile(target, file, budget, (received) => {
        report({ stage: "model", status: "progress", completed: completed + received, total: SEMANTIC_DOWNLOAD_BYTES, file: file.path });
      }), budget, `Downloading ${file.path} exceeded the preparation deadline.`, true);
      completed += file.bytes;
      report({ stage: "model", status: "progress", completed, total: SEMANTIC_DOWNLOAD_BYTES, file: file.path });
    } catch (error) {
      if (error instanceof SemanticSearchError) throw error;
      if (error instanceof Error && error.name === "TimeoutError") throw new SemanticSearchError("deadline_exceeded", `${file.path}: ${detail(error)}`);
      throw new SemanticSearchError("model_download_failed", `${file.path}: ${detail(error)}`);
    }
  }
}

async function buildIndex(
  environment: SemanticRuntimeEnvironment,
  runtimeDirectory: string,
  modelDirectory: string,
  documents: readonly ProcedureSearchDocument[],
  deadline: number,
  onProgress?: (completed: number, total: number) => void,
): Promise<string> {
  const texts = documents.map((document) => searchDocumentText(document).slice(0, SEMANTIC_MAX_INPUT_CHARACTERS));
  const vectors: number[][] = [];
  for (let offset = 0; offset < texts.length; offset += SEMANTIC_EMBEDDING_BATCH) {
    const batch = texts.slice(offset, offset + SEMANTIC_EMBEDDING_BATCH);
    const { vectors: embedded } = await runBounded(environment, {
      mode: "passage",
      runtime_dir: runtimeDirectory,
      model_dir: modelDirectory,
      texts: batch,
    }, remaining(deadline), true);
    if (embedded.length !== batch.length) throw new SemanticSearchError("inference_failed", "The encoder returned an unexpected batch size.");
    vectors.push(...embedded.map((vector) => validateEmbedding(vector).map((value) => Number(value.toFixed(SEMANTIC_VECTOR_PRECISION)))));
    onProgress?.(vectors.length, texts.length);
  }
  const index: SemanticIndexFile = {
    version: SEMANTIC_INDEX_VERSION,
    dimensions: SEMANTIC_EMBEDDING_DIMENSIONS,
    ids: documents.map((document) => document.id),
    vectors,
  };
  return `${JSON.stringify(index)}\n`;
}

async function selfTest(
  environment: SemanticRuntimeEnvironment,
  runtimeDirectory: string,
  modelDirectory: string,
  indexPath: string,
  metadata: SemanticIndexMetadata,
  deadline: number,
): Promise<void> {
  const index = parseIndex(await readFile(indexPath, "utf8"), metadata);
  const { vectors } = await runBounded(environment, {
    mode: "query",
    runtime_dir: runtimeDirectory,
    model_dir: modelDirectory,
    texts: [SEMANTIC_SELF_TEST_QUERY],
  }, remaining(deadline), true);
  const probe = validateEmbedding(vectors[0]);
  const best = index.vectors.reduce((highest, vector) => Math.max(highest, cosine(probe, vector)), Number.NEGATIVE_INFINITY);
  if (!Number.isFinite(best)) throw new SemanticSearchError("inference_failed", "The self-test produced no comparable neighbor.");
}

async function runBounded(environment: SemanticRuntimeEnvironment, request: SemanticWorkerRequest, timeoutMs: number, waitForCompletion = false): Promise<SemanticWorkerResult> {
  try {
    return await runWithinBudget(
      environment.runInference(request, timeoutMs),
      timeoutMs,
      "The semantic encoder exceeded its time budget.",
      waitForCompletion,
    );
  } catch (error) {
    if (error instanceof SemanticSearchError) throw error;
    throw new SemanticSearchError("inference_failed", detail(error));
  }
}

/** The parent owns the budget so an unusable encoder degrades to lexical results instead of stalling a query. */
async function runWithinBudget<T>(execution: Promise<T>, timeoutMs: number, detail_: string, waitForCompletion = false): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      execution,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new SemanticSearchError("deadline_exceeded", detail_)), timeoutMs);
      }),
    ]);
  } catch (error) {
    // Writers must settle before their cache lock and staging directory are released.
    if (waitForCompletion && error instanceof SemanticSearchError && error.code === "deadline_exceeded") await execution.catch(() => undefined);
    throw error;
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

function remaining(deadline: number): number {
  const budget = deadline - Date.now();
  if (budget <= 0) throw new SemanticSearchError("deadline_exceeded");
  return budget;
}

function parseIndex(raw: string, metadata: SemanticIndexMetadata): SemanticIndexFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new SemanticSearchError("index_stale", "The prepared vector index is unreadable.");
  }
  const index = parsed as Partial<SemanticIndexFile>;
  if (typeof parsed !== "object" || parsed === null
    || index.version !== SEMANTIC_INDEX_VERSION
    || index.dimensions !== SEMANTIC_EMBEDDING_DIMENSIONS
    || !Array.isArray(index.ids)
    || !Array.isArray(index.vectors)
    || index.ids.length === 0
    || index.ids.length !== index.vectors.length
    || index.ids.some((id) => typeof id !== "string")) {
    throw new SemanticSearchError("index_stale", "The prepared vector index does not match the current model.");
  }
  for (const vector of index.vectors) {
    if (!Array.isArray(vector) || vector.length !== metadata.dimensions || vector.some((value) => typeof value !== "number")) {
      throw new SemanticSearchError("index_stale", "A prepared vector has the wrong width or contents.");
    }
  }
  return index as SemanticIndexFile;
}

function cosine(left: readonly number[], right: readonly number[]): number {
  let total = 0;
  for (let position = 0; position < left.length; position += 1) total += (left[position] ?? 0) * (right[position] ?? 0);
  return total;
}

/** The pinned encoder returns unit vectors; a zero or malformed one cannot rank, so the caller falls back to lexical results. */
function validateEmbedding(vector: number[] | undefined): number[] {
  if (vector === undefined || vector.length !== SEMANTIC_EMBEDDING_DIMENSIONS || vector.some((value) => !Number.isFinite(value))) {
    throw new SemanticSearchError("inference_failed", "The encoder returned a malformed embedding.");
  }
  const norm = Math.sqrt(cosine(vector, vector));
  if (norm <= 0) throw new SemanticSearchError("inference_failed", "The encoder returned a zero-length embedding.");
  return vector.map((value) => value / norm);
}

/**
 * An existing target is only kept when it is both receipted and actually usable, so an
 * explicit preparation repairs a corrupt cache instead of trusting its own receipt.
 */
async function publishDirectory(
  stagingRoot: string,
  source: string,
  target: string,
  kind: string,
  isUsable: (directory: string) => Promise<boolean>,
): Promise<void> {
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(path.join(source, "receipt.json"), `${JSON.stringify({
    kind,
    identity: path.basename(target),
    ready: true,
    runtime: SEMANTIC_RUNTIME_PACKAGE,
    runtime_version: SEMANTIC_RUNTIME_VERSION,
    model: SEMANTIC_MODEL_ID,
    model_revision: SEMANTIC_MODEL_REVISION,
    dimensions: SEMANTIC_EMBEDDING_DIMENSIONS,
  }, null, 2)}\n`);
  if (await publish(source, target)) return;
  if (await isUsable(target)) return;
  const discarded = path.join(stagingRoot, `discarded-${path.basename(target)}-${randomUUID()}`);
  await rename(target, discarded).catch(() => undefined);
  if (await publish(source, target)) {
    await rm(discarded, { recursive: true, force: true });
    return;
  }
  throw new SemanticSearchError("install_failed", `Could not publish ${kind} resources.`);
}

async function publish(source: string, target: string): Promise<boolean> {
  try {
    await rename(source, target);
    return true;
  } catch (error) {
    if (isCollision(error)) return false;
    throw error;
  }
}

function isCollision(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException | null)?.code;
  return code === "EEXIST" || code === "ENOTEMPTY" || code === "EPERM" || code === "EACCES";
}

async function writeIndexCurrent(cacheRoot: string, metadata: SemanticIndexMetadata): Promise<void> {
  const directory = path.join(cacheRoot, "index");
  await mkdir(directory, { recursive: true });
  const temporary = path.join(directory, `current-${randomUUID()}.json`);
  await writeFile(temporary, `${JSON.stringify(metadata)}\n`);
  await rename(temporary, path.join(directory, "current.json"));
}

/**
 * The advisory record of the most recently prepared index. It never gates retrieval:
 * index directories are addressed by content identity, so several catalogs stay usable.
 */
export async function readPreparedSemanticIndex(cacheRoot = semanticCacheRoot()): Promise<SemanticIndexCurrent | undefined> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(path.join(cacheRoot, "index", "current.json"), "utf8"));
  } catch {
    return undefined;
  }
  const current = parsed as Partial<SemanticIndexCurrent>;
  if (typeof current.identity !== "string"
    || typeof current.document_identity !== "string"
    || typeof current.runtime_identity !== "string"
    || typeof current.model_identity !== "string") {
    return undefined;
  }
  return current as SemanticIndexCurrent;
}

/** Index directories are named by content identity, so every prepared catalog stays addressable. */
function indexDirectoryFor(cacheRoot: string, metadata: SemanticIndexMetadata): string {
  return path.join(cacheRoot, "index", metadata.identity);
}

async function indexUsable(cacheRoot: string, metadata: SemanticIndexMetadata): Promise<boolean> {
  return indexDirectoryUsable(indexDirectoryFor(cacheRoot, metadata), metadata);
}

async function indexDirectoryUsable(directory: string, metadata: SemanticIndexMetadata): Promise<boolean> {
  if (await readyReceipt(directory) === undefined) return false;
  try {
    parseIndex(await readFile(path.join(directory, "vectors.json"), "utf8"), metadata);
    return true;
  } catch {
    return false;
  }
}

async function indexReason(cacheRoot: string): Promise<SemanticSearchErrorCode> {
  return await latestIdentity(path.join(cacheRoot, "index")) === undefined ? "index_missing" : "index_stale";
}

async function readyReceipt(directory: string): Promise<Record<string, unknown> | undefined> {
  try {
    const parsed: unknown = JSON.parse(await readFile(path.join(directory, "receipt.json"), "utf8"));
    if (typeof parsed !== "object" || parsed === null) return undefined;
    const receipt = parsed as { ready?: unknown; identity?: unknown };
    if (receipt.ready !== true || receipt.identity !== path.basename(directory)) return undefined;
    return parsed as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

async function runtimeInstalled(cacheRoot: string, identity: string): Promise<boolean> {
  return runtimeDirectoryUsable(path.join(cacheRoot, "runtime", identity));
}

async function runtimeDirectoryUsable(directory: string): Promise<boolean> {
  if (await readyReceipt(directory) === undefined) return false;
  return isDirectory(path.join(directory, "node_modules", ...SEMANTIC_RUNTIME_PACKAGE.split("/")));
}

async function modelInstalled(cacheRoot: string, identity: string): Promise<boolean> {
  return modelDirectoryUsable(path.join(cacheRoot, "model", identity));
}

async function modelDirectoryUsable(directory: string): Promise<boolean> {
  if (await readyReceipt(directory) === undefined) return false;
  for (const file of SEMANTIC_MODEL_FILES) {
    const target = path.join(directory, SEMANTIC_MODEL_ID, ...file.path.split("/"));
    if (!(await isFile(target))) return false;
    try {
      if ((await stat(target)).size !== file.bytes) return false;
    } catch {
      return false;
    }
  }
  return true;
}

async function latestIdentity(parent: string): Promise<string | undefined> {
  try {
    const ready: string[] = [];
    for (const entry of await readdir(parent, { withFileTypes: true })) {
      if (entry.isDirectory() && await readyReceipt(path.join(parent, entry.name)) !== undefined) ready.push(entry.name);
    }
    return ready.sort().at(-1);
  } catch {
    return undefined;
  }
}

async function isFile(target: string): Promise<boolean> {
  try {
    return (await stat(target)).isFile();
  } catch {
    return false;
  }
}

async function isDirectory(target: string): Promise<boolean> {
  try {
    return (await stat(target)).isDirectory();
  } catch {
    return false;
  }
}

function shortHash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function detail(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function installDefaultRuntime(packageRoot: string, runtimeDirectory: string, timeoutMs: number): Promise<void> {
  const source = path.join(packageRoot, SEMANTIC_RUNTIME_ASSET_DIRECTORY);
  for (const asset of ["package.json", "package-lock.json"]) {
    await cp(path.join(source, asset), path.join(runtimeDirectory, asset));
  }
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  await runProcess(npm, ["ci", "--ignore-scripts", "--omit=dev", "--no-audit", "--no-fund"], runtimeDirectory, timeoutMs);
}

async function downloadModelFile(
  modelDirectory: string,
  file: SemanticModelFile,
  timeoutMs: number,
  onProgress?: (completed: number) => void,
): Promise<void> {
  const target = path.join(modelDirectory, ...file.path.split("/"));
  await mkdir(path.dirname(target), { recursive: true });
  const url = `https://huggingface.co/${SEMANTIC_MODEL_ID}/resolve/${SEMANTIC_MODEL_REVISION}/${file.path}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), redirect: "follow" });
  if (!response.ok || response.body === null) throw new Error(`HTTP ${String(response.status)} for ${file.path}`);
  const body = Readable.fromWeb(response.body);
  let completed = 0;
  const progress = new Transform({ transform(chunk: Buffer, _encoding, callback) {
    completed += chunk.length;
    onProgress?.(completed);
    callback(null, chunk);
  } });
  await pipeline(body, progress, createWriteStream(target));
  const size = (await stat(target)).size;
  if (size !== file.bytes) {
    await rm(target, { force: true });
    throw new Error(`expected ${String(file.bytes)} bytes, received ${String(size)}`);
  }
}

function runProcess(command: string, args: readonly string[], cwd: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, [...args], { cwd, stdio: ["ignore", "pipe", "pipe"], shell: process.platform === "win32" });
    let output = "";
    let settled = false;
    let deadlineExceeded = false;
    const timer = setTimeout(() => { deadlineExceeded = true; child.kill("SIGKILL"); }, timeoutMs);
    const finish = (action: () => void): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      action();
    };
    child.stdout?.on("data", (chunk: Buffer) => {
      if (output.length < SEMANTIC_PROCESS_OUTPUT_LIMIT) output += chunk.toString("utf8");
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      if (output.length < SEMANTIC_PROCESS_OUTPUT_LIMIT) output += chunk.toString("utf8");
    });
    child.on("error", (error: Error) => finish(() => reject(deadlineExceeded ? new SemanticSearchError("deadline_exceeded", `${command} exceeded ${String(timeoutMs)}ms`) : error)));
    child.on("close", (code: number | null) => finish(() => {
      if (deadlineExceeded) reject(new SemanticSearchError("deadline_exceeded", `${command} exceeded ${String(timeoutMs)}ms`));
      else if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${String(code ?? "signal")}: ${output.slice(-400)}`));
    }));
  });
}

function runSemanticWorker(request: SemanticWorkerRequest, timeoutMs: number): Promise<SemanticWorkerResult> {
  const worker = fileURLToPath(new URL("./semantic-worker.js", import.meta.url));
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [worker], {
      stdio: ["pipe", "pipe", "pipe"],
      env: semanticWorkerEnvironment(),
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    let deadlineExceeded = false;
    const timer = setTimeout(() => { deadlineExceeded = true; child.kill("SIGKILL"); }, timeoutMs);
    const finish = (action: () => void): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      action();
    };
    child.stdout?.on("data", (chunk: Buffer) => {
      if (stdout.length < SEMANTIC_WORKER_OUTPUT_LIMIT) stdout += chunk.toString("utf8");
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      if (stderr.length < SEMANTIC_PROCESS_OUTPUT_LIMIT) stderr += chunk.toString("utf8");
    });
    child.stdin?.end(JSON.stringify(request));
    child.on("error", (error: Error) => finish(() => reject(deadlineExceeded
      ? new SemanticSearchError("deadline_exceeded", `semantic worker exceeded ${String(timeoutMs)}ms`)
      : new SemanticSearchError("inference_failed", error.message))));
    child.on("close", () => finish(() => {
      if (deadlineExceeded) {
        reject(new SemanticSearchError("deadline_exceeded", `semantic worker exceeded ${String(timeoutMs)}ms`));
        return;
      }
      const line = stdout.split("\n").reverse().find((candidate) => candidate.startsWith(SEMANTIC_WORKER_RESULT_PREFIX));
      if (line === undefined) {
        reject(new SemanticSearchError("inference_failed", `semantic worker produced no result: ${stderr.slice(-400)}`));
        return;
      }
      try {
        resolve(JSON.parse(line.slice(SEMANTIC_WORKER_RESULT_PREFIX.length)) as SemanticWorkerResult);
      } catch {
        reject(new SemanticSearchError("inference_failed", "The semantic worker result is unreadable."));
      }
    }));
  });
}

/**
 * Windows resolves the ONNX native binding through SystemRoot, and the model loader needs a
 * writable temp directory. Everything else in the parent environment stays out of the subprocess.
 */
export function semanticWorkerEnvironment(): Record<string, string> {
  const env: Record<string, string> = {
    NODE_ENV: "production",
    RESEARCHSPEC_SEMANTIC_MODEL: SEMANTIC_MODEL_ID,
    RESEARCHSPEC_SEMANTIC_MAX_TOKENS: String(SEMANTIC_MAX_TOKENS),
  };
  for (const name of SEMANTIC_WORKER_ENV_PASSTHROUGH) {
    const value = process.env[name];
    if (value !== undefined) env[name] = value;
  }
  return env;
}
