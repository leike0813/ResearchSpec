import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

export const SEMANTIC_WORKER_RESULT_PREFIX = "@researchspec-semantic-result ";
export const SEMANTIC_WORKER_ERROR_PREFIX = "@researchspec-semantic-error ";

export type SemanticWorkerMode = "passage" | "query";

export interface SemanticWorkerRequest {
  mode: SemanticWorkerMode;
  runtime_dir: string;
  model_dir: string;
  texts: readonly string[];
}

export interface SemanticWorkerResult {
  vectors: number[][];
}

interface FeatureExtractionOutput {
  tolist(): number[][];
}

interface FeatureExtractionPipeline {
  tokenizer: { model_max_length?: number };
  (texts: readonly string[], options: { pooling: "mean"; normalize: boolean }): Promise<FeatureExtractionOutput>;
}

interface TransformersLibrary {
  env: Record<string, unknown>;
  pipeline(task: "feature-extraction", model: string, options: { dtype: string; device: string }): Promise<FeatureExtractionPipeline>;
}

/**
 * The pinned multilingual encoder is asymmetric: a document embedded without the
 * passage prefix is measurably closer to unrelated queries, so both sides keep it.
 */
export function semanticEmbeddingInput(mode: SemanticWorkerMode, text: string): string {
  return `${mode}: ${text}`;
}

async function embed(request: SemanticWorkerRequest, modelId: string, maxTokens: number): Promise<number[][]> {
  const require = createRequire(path.join(request.runtime_dir, "package.json"));
  const namespace: unknown = await import(pathToFileURL(require.resolve("@huggingface/transformers")).href);
  const library = resolveLibrary(namespace);
  library.env.allowRemoteModels = false;
  library.env.allowLocalModels = true;
  library.env.useFSCache = false;
  library.env.localModelPath = request.model_dir;
  const extractor = await library.pipeline("feature-extraction", modelId, { dtype: "q8", device: "cpu" });
  extractor.tokenizer.model_max_length = maxTokens;
  const output = await extractor(request.texts.map((text) => semanticEmbeddingInput(request.mode, text)), { pooling: "mean", normalize: true });
  return output.tolist();
}

function resolveLibrary(namespace: unknown): TransformersLibrary {
  if (isLibrary(namespace)) return namespace;
  if (typeof namespace === "object" && namespace !== null) {
    const fallback = (namespace as { default?: unknown }).default;
    if (isLibrary(fallback)) return fallback;
  }
  throw new Error("The installed Transformers runtime does not expose the expected feature-extraction pipeline.");
}

function isLibrary(value: unknown): value is TransformersLibrary {
  return typeof value === "object" && value !== null && "env" in value && "pipeline" in value;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  return Buffer.concat(chunks).toString("utf8");
}

async function main(): Promise<void> {
  const request = JSON.parse(await readStdin()) as SemanticWorkerRequest;
  const modelId = process.env.RESEARCHSPEC_SEMANTIC_MODEL ?? "Xenova/multilingual-e5-small";
  const maxTokens = Number(process.env.RESEARCHSPEC_SEMANTIC_MAX_TOKENS ?? "512");
  const result: SemanticWorkerResult = { vectors: await embed(request, modelId, maxTokens) };
  process.stdout.write(`${SEMANTIC_WORKER_RESULT_PREFIX}${JSON.stringify(result)}\n`);
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${SEMANTIC_WORKER_ERROR_PREFIX}${message}\n`);
    process.exitCode = 1;
  });
}
