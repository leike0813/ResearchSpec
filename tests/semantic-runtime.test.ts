import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, truncate, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { test } from "node:test";

import type { ProcedureSearchDocument } from "../src/procedures/search-contracts.js";
import {
  SEMANTIC_DOWNLOAD_BYTES,
  SEMANTIC_EMBEDDING_DIMENSIONS,
  SEMANTIC_MODEL_FILES,
  SEMANTIC_PREPARE_TIMEOUT_MS,
  SEMANTIC_QUERY_TIMEOUT_MS,
  SEMANTIC_RUNTIME,
  SemanticSearchError,
  defaultSemanticRuntimeEnvironment,
  inspectSemanticSearch,
  prepareSemanticSearch,
  searchSemanticDocuments,
  semanticCacheRoot,
  semanticErrorCode,
  semanticIndexMetadata,
  semanticRuntimeIdentity,
  semanticWorkerEnvironment,
} from "../src/procedures/runtime.js";
import type { SemanticModelFile, SemanticRuntimeEnvironment } from "../src/procedures/runtime.js";
import { semanticEmbeddingInput } from "../src/procedures/semantic-worker.js";
import { acquireSemanticCacheLock } from "../src/procedures/cache.js";

const DOCUMENTS: readonly ProcedureSearchDocument[] = [
  {
    id: "literature-review",
    fields: {
      identity: ["literature-review"],
      title: ["Literature Review"],
      intents: ["survey prior work"],
      description: ["organize existing literature and synthesize claims"],
      context: ["domain: education-research"],
    },
  },
  {
    id: "patent-disclosure",
    fields: {
      identity: ["patent-disclosure"],
      title: ["Patent Disclosure"],
      intents: ["write a patent disclosure"],
      description: ["draft a patent disclosure from research results"],
      context: [],
    },
  },
  {
    id: "manuscript-revision",
    fields: {
      identity: ["manuscript-revision"],
      title: ["Manuscript Revision"],
      intents: ["revise a manuscript"],
      description: ["apply reviewer feedback to the manuscript"],
      context: [],
    },
  },
];

const MARKERS: readonly (readonly [string, number])[] = [
  ["literature", 0],
  ["patent", 1],
  ["revision", 2],
];

interface FakeEnvironment extends SemanticRuntimeEnvironment {
  installs: number;
  downloads: number;
  inferences: number;
}

function createEnvironment(overrides: Partial<SemanticRuntimeEnvironment> = {}): FakeEnvironment {
  const environment: FakeEnvironment = {
    installs: 0,
    downloads: 0,
    inferences: 0,
    async installRuntime(runtimeDirectory) {
      environment.installs += 1;
      await mkdir(path.join(runtimeDirectory, "node_modules", "@huggingface", "transformers"), { recursive: true });
      await writeFile(path.join(runtimeDirectory, "package.json"), "{}");
    },
    async downloadModelFile(modelDirectory, file) {
      environment.downloads += 1;
      const target = path.join(modelDirectory, ...file.path.split("/"));
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, "model");
      await truncate(target, file.bytes);
    },
    runInference(request) {
      environment.inferences += 1;
      return Promise.resolve({ vectors: request.texts.map((text) => markerVector(`${request.mode}: ${text}`)) });
    },
    ...overrides,
  };
  return environment;
}

/** A deterministic stand-in for the real encoder: dimensions mark which concept a text mentions. */
function markerVector(text: string): number[] {
  const vector = new Array<number>(SEMANTIC_EMBEDDING_DIMENSIONS).fill(0);
  const lowered = text.toLowerCase();
  for (const [marker, dimension] of MARKERS) {
    if (lowered.includes(marker)) vector[dimension] = 1;
  }
  const norm = Math.hypot(...vector);
  return norm === 0 ? vector : vector.map((value) => value / norm);
}

async function withCacheRoot(run: (cacheRoot: string) => Promise<void>): Promise<void> {
  const cacheRoot = await mkdtemp(path.join(tmpdir(), "researchspec-semantic-test-"));
  try {
    await run(cacheRoot);
  } finally {
    await rm(cacheRoot, { recursive: true, force: true });
  }
}

async function listTree(root: string): Promise<string[]> {
  const found: string[] = [];
  const walk = async (directory: string): Promise<void> => {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const target = path.join(directory, entry.name);
      found.push(path.relative(root, target));
      if (entry.isDirectory()) await walk(target);
    }
  };
  await walk(root);
  return found.sort();
}

async function codeOf(run: () => Promise<unknown>): Promise<string> {
  try {
    await run();
    return "resolved";
  } catch (error) {
    return error instanceof SemanticSearchError ? error.code : `unexpected:${String(error)}`;
  }
}

void test("published constants describe the locked runtime and the model download", () => {
  assert.equal(SEMANTIC_RUNTIME.package, "@huggingface/transformers");
  assert.equal(SEMANTIC_RUNTIME.version, "3.8.1");
  assert.equal(SEMANTIC_RUNTIME.model_revision, "761b726dd34fb83930e26aab4e9ac3899aa1fa78");
  assert.equal(SEMANTIC_RUNTIME.install_command, "npm ci --ignore-scripts --omit=dev --no-audit --no-fund");
  assert.equal(SEMANTIC_DOWNLOAD_BYTES, 135_392_183);
  assert.deepEqual(SEMANTIC_MODEL_FILES.map((file: SemanticModelFile) => file.path), [
    "config.json",
    "onnx/model_quantized.onnx",
    "special_tokens_map.json",
    "tokenizer.json",
    "tokenizer_config.json",
  ]);
  assert.equal(SEMANTIC_PREPARE_TIMEOUT_MS, 600_000);
  assert.equal(SEMANTIC_QUERY_TIMEOUT_MS, 10_000);
});

void test("the model encoder keeps its asymmetric prefixes", () => {
  assert.equal(semanticEmbeddingInput("query", "review"), "query: review");
  assert.equal(semanticEmbeddingInput("passage", "review"), "passage: review");
});

void test("an unprepared cache reports the first missing resource", async () => {
  await withCacheRoot(async (cacheRoot) => {
    const status = await inspectSemanticSearch(DOCUMENTS, { cacheRoot });
    assert.deepEqual(status, { ready: false, cache_root: cacheRoot, reason: "runtime_missing" });
  });
});

void test("preparation reports an active cache writer without mutating the cache", async () => {
  await withCacheRoot(async (cacheRoot) => {
    const release = await acquireSemanticCacheLock(cacheRoot);
    try {
      const result = await prepareSemanticSearch(DOCUMENTS, { cacheRoot, environment: createEnvironment() });
      assert.equal(result.reason, "cache_busy");
      assert.equal(result.stage, "cache");
      assert.match(result.detail ?? "", /locked/);
    } finally {
      await release();
    }
  });
});

void test("preparation publishes reusable resources and a second call reuses them", async () => {
  await withCacheRoot(async (cacheRoot) => {
    const environment = createEnvironment();
    const prepared = await prepareSemanticSearch(DOCUMENTS, { cacheRoot, environment });
    assert.deepEqual(prepared, { ready: true, prepared: true, cache_root: cacheRoot });
    assert.equal(environment.installs, 1);
    assert.equal(environment.downloads, SEMANTIC_MODEL_FILES.length);
    assert.ok(environment.inferences >= 2, "passages and the self-test query are both embedded");

    const metadata = await semanticIndexMetadata(DOCUMENTS);
    const current = JSON.parse(await readFile(path.join(cacheRoot, "index", "current.json"), "utf8")) as { identity: string };
    assert.equal(current.identity, metadata.identity);
    const receipt = JSON.parse(await readFile(path.join(cacheRoot, "index", metadata.identity, "receipt.json"), "utf8")) as { ready: boolean };
    assert.equal(receipt.ready, true);

    const installs = environment.installs;
    const downloads = environment.downloads;
    const reused = await prepareSemanticSearch(DOCUMENTS, { cacheRoot, environment });
    assert.deepEqual(reused, { ready: true, prepared: false, cache_root: cacheRoot });
    assert.equal(environment.installs, installs);
    assert.equal(environment.downloads, downloads);
    assert.deepEqual(await inspectSemanticSearch(DOCUMENTS, { cacheRoot }), { ready: true, cache_root: cacheRoot });
    assert.ok((await prepareSemanticSearch(DOCUMENTS, { cacheRoot, environment, onProgress: () => undefined })).ready);
  });
});

void test("a changed catalog publishes a new index and marks the old one stale", async () => {
  await withCacheRoot(async (cacheRoot) => {
    const environment = createEnvironment();
    await prepareSemanticSearch(DOCUMENTS, { cacheRoot, environment });
    const firstDocument = DOCUMENTS[0];
    const changed: ProcedureSearchDocument[] = [
      { ...firstDocument, fields: { ...firstDocument.fields, description: ["organize existing literature and compare methods"] } },
      ...DOCUMENTS.slice(1),
    ];
    const progress: { stage: string; status: string; completed?: number; total?: number }[] = [];
    const second = await prepareSemanticSearch(changed, { cacheRoot, environment, onProgress: (event) => progress.push(event) });
    assert.equal(second.prepared, true);
    assert.ok(progress.some((event) => event.stage === "runtime" && event.status === "reused"));
    assert.ok(progress.some((event) => event.stage === "model" && event.status === "reused"));
    assert.ok(progress.some((event) => event.stage === "index" && event.status === "progress" && event.completed === DOCUMENTS.length));

    const first = await semanticIndexMetadata(DOCUMENTS);
    const next = await semanticIndexMetadata(changed);
    assert.notEqual(first.identity, next.identity);
    await readFile(path.join(cacheRoot, "index", first.identity, "vectors.json"), "utf8");
    const source = DOCUMENTS[0];
    const unprepared: ProcedureSearchDocument[] = [{ id: "unprepared", fields: { ...source.fields } }];
    assert.equal(await codeOf(() => searchSemanticDocuments(unprepared, "literature", { cacheRoot, environment })), "index_stale");
  });
});

void test("the default model downloader reports bytes from streamed response chunks", async () => {
  await withCacheRoot(async (cacheRoot) => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = () => Promise.resolve(new Response(new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2]));
        controller.enqueue(new Uint8Array([3, 4, 5]));
        controller.close();
      },
    })));
    try {
      const progress: number[] = [];
      const environment = defaultSemanticRuntimeEnvironment();
      await assert.rejects(environment.downloadModelFile(path.join(cacheRoot, "model"), SEMANTIC_MODEL_FILES[0], 1_000, (bytes) => progress.push(bytes)), /expected .* bytes, received 5/);
      assert.deepEqual(progress, [2, 5]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

void test("preparing another catalog leaves earlier prepared catalogs addressable", async () => {
  await withCacheRoot(async (cacheRoot) => {
    const environment = createEnvironment();
    await prepareSemanticSearch(DOCUMENTS, { cacheRoot, environment });
    const other: ProcedureSearchDocument[] = DOCUMENTS.map((document) => ({
      ...document,
      fields: { ...document.fields, description: [`${document.fields.description.join(" ")} qualitative coding`] },
    }));
    await prepareSemanticSearch(other, { cacheRoot, environment });

    const original = await searchSemanticDocuments(DOCUMENTS, "literature", { cacheRoot, environment });
    assert.equal(original[0]?.id, "literature-review");
    const republished = await prepareSemanticSearch(DOCUMENTS, { cacheRoot, environment });
    assert.deepEqual(republished, { ready: true, prepared: false, cache_root: cacheRoot });
  });
});

void test("an explicit preparation repairs a receipted but unusable cache", async () => {
  await withCacheRoot(async (cacheRoot) => {
    const environment = createEnvironment();
    await prepareSemanticSearch(DOCUMENTS, { cacheRoot, environment });
    const runtimeIdentity = await semanticRuntimeIdentity();
    const runtimeDirectory = path.join(cacheRoot, "runtime", runtimeIdentity);
    await rm(path.join(runtimeDirectory, "node_modules"), { recursive: true, force: true });
    assert.equal((await inspectSemanticSearch(DOCUMENTS, { cacheRoot })).reason, "runtime_missing");

    const repaired = await prepareSemanticSearch(DOCUMENTS, { cacheRoot, environment });
    assert.equal(repaired.ready, true);
    assert.equal(environment.installs, 2);
    assert.deepEqual(await inspectSemanticSearch(DOCUMENTS, { cacheRoot }), { ready: true, cache_root: cacheRoot });
  });
});

void test("a malformed prepared index reports a stale code rather than a raw error", async () => {
  await withCacheRoot(async (cacheRoot) => {
    const environment = createEnvironment();
    await prepareSemanticSearch(DOCUMENTS, { cacheRoot, environment });
    const vectors = path.join(cacheRoot, "index", (await semanticIndexMetadata(DOCUMENTS)).identity, "vectors.json");
    const corrupt = [
      "null",
      "[]",
      JSON.stringify({ version: 1, dimensions: 384, ids: ["a"], vectors: [null] }),
      JSON.stringify({ version: 1, dimensions: 384, ids: ["a"], vectors: [[1, 2]] }),
    ];
    for (const contents of corrupt) {
      await writeFile(vectors, contents);
      const code = await codeOf(() => searchSemanticDocuments(DOCUMENTS, "literature", { cacheRoot, environment }));
      assert.equal(code, "index_stale", `unexpected code for ${contents}`);
    }
  });
});

void test("queries rank the matching candidate and leave the cache untouched", async () => {
  await withCacheRoot(async (cacheRoot) => {
    const environment = createEnvironment();
    await prepareSemanticSearch(DOCUMENTS, { cacheRoot, environment });
    const before = await listTree(cacheRoot);
    const installs = environment.installs;
    const downloads = environment.downloads;

    const hits = await searchSemanticDocuments(DOCUMENTS, "please organize the literature", { cacheRoot, environment });
    assert.equal(hits[0]?.id, "literature-review");
    assert.equal(hits[0]?.score, 1);
    assert.equal(hits.length, DOCUMENTS.length);
    const patent = await searchSemanticDocuments(DOCUMENTS, "write a patent disclosure", { cacheRoot, environment });
    assert.equal(patent[0]?.id, "patent-disclosure");

    assert.deepEqual(await listTree(cacheRoot), before);
    assert.equal(environment.installs, installs);
    assert.equal(environment.downloads, downloads);
  });
});

void test("queries never install, download, or embed when resources are absent", async () => {
  await withCacheRoot(async (cacheRoot) => {
    const environment = createEnvironment();
    assert.equal(await codeOf(() => searchSemanticDocuments(DOCUMENTS, "literature", { cacheRoot, environment })), "runtime_missing");
    assert.equal(environment.installs, 0);
    assert.equal(environment.downloads, 0);
    assert.equal(environment.inferences, 0);
    assert.deepEqual(await listTree(cacheRoot), []);
  });
});

void test("a blank query is rejected before any resource lookup", async () => {
  await withCacheRoot(async (cacheRoot) => {
    const environment = createEnvironment();
    await assert.rejects(() => searchSemanticDocuments(DOCUMENTS, "   ", { cacheRoot, environment }), TypeError);
  });
});

void test("a query that cannot finish inside its budget raises a deadline code", async () => {
  await withCacheRoot(async (cacheRoot) => {
    await prepareSemanticSearch(DOCUMENTS, { cacheRoot, environment: createEnvironment() });
    const stalled = createEnvironment({
      runInference(): Promise<{ vectors: number[][] }> {
        return new Promise<{ vectors: number[][] }>(() => undefined);
      },
    });
    const code = await codeOf(() => searchSemanticDocuments(DOCUMENTS, "literature", { cacheRoot, environment: stalled, timeoutMs: 60 }));
    assert.equal(code, "deadline_exceeded");
  });
});

void test("static inspection reports prepared runtime and model without an index", async () => {
  await withCacheRoot(async (cacheRoot) => {
    let inferences = 0;
    const environment = createEnvironment({
      runInference(): Promise<{ vectors: number[][] }> {
        inferences += 1;
        return Promise.reject(new Error("inference must not run during static inspection"));
      },
    });
    const failed = await prepareSemanticSearch(DOCUMENTS, { cacheRoot, environment });
    assert.equal(failed.ready, false);
    assert.equal(failed.reason, "inference_failed");
    assert.equal(failed.stage, "index");
    assert.match(failed.detail ?? "", /inference_failed|local semantic inference/i);
    const duringPreparation = inferences;
    assert.deepEqual(await inspectSemanticSearch(undefined, { cacheRoot }), { ready: true, cache_root: cacheRoot });
    assert.equal(inferences, duringPreparation);
    assert.equal((await inspectSemanticSearch(DOCUMENTS, { cacheRoot })).reason, "index_missing");
  });
});

void test("preparation failures report a code and publish nothing", async () => {
  await withCacheRoot(async (cacheRoot) => {
    const installFailure = await prepareSemanticSearch(DOCUMENTS, {
      cacheRoot,
      environment: createEnvironment({
        installRuntime(): Promise<void> {
          return Promise.reject(new Error("registry unreachable"));
        },
      }),
    });
    assert.equal(installFailure.ready, false);
    assert.equal(installFailure.reason, "install_failed");
    assert.deepEqual(await listTree(path.join(cacheRoot, "runtime")), []);

    const downloadFailure = await prepareSemanticSearch(DOCUMENTS, {
      cacheRoot,
      environment: createEnvironment({
        downloadModelFile(_modelDirectory, file): Promise<void> {
          return Promise.reject(new Error(`download failed for ${file.path}`));
        },
      }),
    });
    assert.equal(downloadFailure.reason, "model_download_failed");
    assert.equal(downloadFailure.stage, "model");
    assert.match(downloadFailure.detail ?? "", /download failed/);
    assert.deepEqual(await listTree(path.join(cacheRoot, "model")), []);
  });
});

void test("a preparation that runs out of time leaves no published resources", async () => {
  await withCacheRoot(async (cacheRoot) => {
    const environment = createEnvironment({
      installRuntime(): Promise<void> {
        return new Promise<void>((resolve) => setTimeout(resolve, 150));
      },
    });
    const outcome = await prepareSemanticSearch(DOCUMENTS, { cacheRoot, environment, timeoutMs: 40 });
    assert.equal(outcome.ready, false);
    assert.equal(outcome.reason, "deadline_exceeded");
    assert.equal(outcome.stage, "runtime");
    assert.deepEqual(await listTree(path.join(cacheRoot, "runtime")), []);
    assert.deepEqual(await listTree(path.join(cacheRoot, "staging")), []);
  });
});

void test("error codes degrade to a stable vocabulary for parent fallback", () => {
  assert.equal(semanticErrorCode(new SemanticSearchError("inference_failed")), "inference_failed");
  assert.equal(semanticErrorCode("index_stale"), "index_stale");
  assert.equal(semanticErrorCode(new Error("something else")), "unknown");
  assert.equal(semanticErrorCode(undefined), "unknown");
  assert.equal(semanticErrorCode("not_a_code"), "unknown");
});

void test("the cache root follows the relocation override", () => {
  const previous = process.env.RESEARCHSPEC_SEARCH_CACHE;
  try {
    process.env.RESEARCHSPEC_SEARCH_CACHE = path.join(tmpdir(), "researchspec-search-override");
    assert.equal(semanticCacheRoot(), path.join(tmpdir(), "researchspec-search-override"));
  } finally {
    if (previous === undefined) delete process.env.RESEARCHSPEC_SEARCH_CACHE;
    else process.env.RESEARCHSPEC_SEARCH_CACHE = previous;
  }
});

void test("the encoder subprocess inherits OS variables but not the wider environment", () => {
  const root = process.env.SystemRoot;
  const temp = process.env.TEMP;
  const secret = process.env.RESEARCHSPEC_TEST_SECRET;
  try {
    process.env.SystemRoot = "C:\\Windows";
    process.env.TEMP = "C:\\Temp";
    process.env.RESEARCHSPEC_TEST_SECRET = "must-not-reach-the-encoder";
    const env = semanticWorkerEnvironment();
    assert.equal(env.SystemRoot, "C:\\Windows");
    assert.equal(env.TEMP, "C:\\Temp");
    assert.equal(env.NODE_ENV, "production");
    assert.equal(env.RESEARCHSPEC_SEMANTIC_MODEL, SEMANTIC_RUNTIME.model);
    assert.equal(env.RESEARCHSPEC_TEST_SECRET, undefined);
  } finally {
    if (root === undefined) delete process.env.SystemRoot; else process.env.SystemRoot = root;
    if (temp === undefined) delete process.env.TEMP; else process.env.TEMP = temp;
    if (secret === undefined) delete process.env.RESEARCHSPEC_TEST_SECRET; else process.env.RESEARCHSPEC_TEST_SECRET = secret;
  }
});
