#!/usr/bin/env node
// Real CPU smoke for local Procedure semantic search.
// Downloads the pinned model and installs the locked runtime into a user cache,
// then runs bilingual natural requests through the fused offline + semantic path.
// Intended for the hosted Node 22/24 Linux/macOS/Windows matrix and for local release checks.

import { createInterface } from "node:readline/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const PACKAGE_ROOT = fileURLToPath(new URL("..", import.meta.url));
const TOP = 3;
const RECALL_DEPTH = 5;

const QUERIES = [
  { language: "zh", query: "帮我把这一章的文献综述整理出来", expected: ["discovery-literature-search-screening", "deep-research", "judgment-review-synthesis"] },
  { language: "en", query: "I need to write a patent disclosure from my research results", expected: ["generation-patent-disclosure", "design-patent-intake", "design-patent-invention-mining"] },
  { language: "zh", query: "审稿人提了意见，帮我起草逐条回复", expected: ["generation-review-response-round", "design-review-response-intake", "analysis-review-response-manuscript-analysis", "design-review-response-workboard-planning", "transform-review-response-comment-atomization"] },
  { language: "en", query: "check whether the citations in my bibliography are real", expected: ["check-citation-existence-verification", "check-citation-verification-summary", "check-citation-format-compliance"] },
  { language: "mixed", query: "screen 这批 papers for duplicate and 低质量 records", expected: ["discovery-literature-search-screening", "deep-research"] },
];

function parseArguments(argv) {
  const options = { yes: false, cacheRoot: undefined };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--yes" || argument === "-y") options.yes = true;
    else if (argument === "--cache-root") options.cacheRoot = argv[++index];
    else if (argument.startsWith("--cache-root=")) options.cacheRoot = argument.slice("--cache-root=".length);
    else if (argument === "--help" || argument === "-h") options.help = true;
    else throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

async function loadCompiled(relative) {
  const target = path.join(PACKAGE_ROOT, "dist", relative);
  try {
    return await import(pathToFileURL(target).href);
  } catch (error) {
    throw new Error(`Could not load ${target}. Run the project build before this smoke. (${error instanceof Error ? error.message : String(error)})`);
  }
}

async function confirm(question) {
  if (!process.stdin.isTTY) {
    process.stderr.write("This smoke downloads and installs resources. Re-run with --yes to confirm in a non-interactive shell.\n");
    process.exit(2);
  }
  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await terminal.question(`${question} [y/N] `);
    return answer.trim().toLowerCase() === "y";
  } finally {
    terminal.close();
  }
}

function megibytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write("Usage: node scripts/semantic-search-smoke.mjs [--yes] [--cache-root <dir>]\n");
    return 0;
  }
  if (options.cacheRoot !== undefined) {
    process.env.RESEARCHSPEC_SEARCH_CACHE = path.resolve(options.cacheRoot);
  }

  const runtime = await loadCompiled("src/procedures/runtime.js");
  const search = await loadCompiled("src/procedures/search.js");
  const { loadProcedureCatalog } = await loadCompiled("src/procedures/catalog.js");
  const cacheRoot = runtime.semanticCacheRoot();

  process.stdout.write(`ResearchSpec local semantic search smoke
  runtime      ${runtime.SEMANTIC_RUNTIME.package}@${runtime.SEMANTIC_RUNTIME.version} (isolated, ${runtime.SEMANTIC_RUNTIME.install_command})
  model        ${runtime.SEMANTIC_RUNTIME.model}@${runtime.SEMANTIC_RUNTIME.model_revision.slice(0, 12)} (${runtime.SEMANTIC_RUNTIME.model_files} files, CPU q8, ${megibytes(runtime.SEMANTIC_DOWNLOAD_BYTES)})
  cache root   ${cacheRoot}
  node         ${process.version} on ${process.platform}-${process.arch}

This downloads ${megibytes(runtime.SEMANTIC_DOWNLOAD_BYTES)} of model files and installs the locked
runtime into the cache above. The runtime is never installed into the project.
`);

  if (!options.yes && !(await confirm("Download and install the local semantic runtime?"))) {
    process.stdout.write("Cancelled.\n");
    return 2;
  }

  const catalog = await loadProcedureCatalog();
  const documents = search.buildSearchDocuments(catalog);
  process.stdout.write(`\nCatalog: ${documents.length} Procedure documents\nPreparing local resources...\n`);

  const startedAt = Date.now();
  const preparation = await runtime.prepareSemanticSearch(documents, { cacheRoot });
  if (!preparation.ready) {
    const reason = preparation.reason ?? "unknown";
    process.stderr.write(`Preparation failed: ${reason} - ${runtime.SEMANTIC_ERROR_MESSAGES[reason] ?? ""}\n`);
    return 1;
  }
  const reused = !preparation.prepared;
  process.stdout.write(`${reused ? "Reused" : "Prepared"} local resources in ${((Date.now() - startedAt) / 1000).toFixed(1)}s\n\n`);

  let failures = 0;
  for (const { language, query, expected } of QUERIES) {
    const offline = await search.searchProcedures(catalog, query, { mode: "offline" });
    const hybrid = await search.searchProcedures(catalog, query, { mode: "hybrid" });
    const hybridIds = hybrid.items.slice(0, RECALL_DEPTH).map((item) => item.procedure.id);
    const recalled = hybridIds.some((id) => expected.includes(id));
    if (hybrid.retrieval.effective_mode !== "hybrid") failures += 1;
    if (!recalled) failures += 1;
    const names = (result) => result.items.slice(0, TOP).map((item) => item.procedure.id).join(", ");
    process.stdout.write(`[${recalled && hybrid.retrieval.effective_mode === "hybrid" ? "ok" : "FAIL"}] (${language}) ${query}
  offline  ${names(offline)}
  hybrid   ${names(hybrid)}   mode=${hybrid.retrieval.effective_mode}${hybrid.retrieval.fallback_reason ? ` fallback=${hybrid.retrieval.fallback_reason}` : ""}
  recalled ${recalled ? hybridIds.filter((id) => expected.includes(id)).join(", ") : "none of " + expected.join(", ")}
`);
  }

  const probe = await runtime.searchSemanticDocuments(documents, "整理文献综述", { cacheRoot });
  if (probe.length === 0) {
    failures += 1;
    process.stdout.write("[FAIL] direct semantic query returned no candidates\n");
  }

  process.stdout.write(failures === 0
    ? "\nSemantic smoke passed.\n"
    : `\nSemantic smoke failed ${String(failures)} check(s).\n`);
  return failures === 0 ? 0 : 1;
}

process.exitCode = await main();
