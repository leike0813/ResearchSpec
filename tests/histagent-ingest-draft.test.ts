import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";

import { renderHistAgentCompleteTrees } from "../src/vendor-converters/histagent/complete-tree.js";
import { HISTAGENT_SKILL_DEFINITIONS } from "../src/vendor-converters/histagent/skill-definitions.js";
import { loadHistAgentPolicies } from "../src/vendor-converters/histagent/policy.js";
import { validateNonNativeVendorSkill } from "../src/vendor-converters/shared/non-native-skill-standard/index.js";

const REPO_ROOT = path.resolve(".");
let temporaryRoot: string;
let treeRoots: Map<string, string>;

before(async () => {
  temporaryRoot = await mkdtemp(path.join(tmpdir(), "histagent-copied-trees-"));
  treeRoots = new Map();
  const rendered = await renderHistAgentCompleteTrees(REPO_ROOT);
  for (const tree of rendered.trees) {
    const root = path.join(temporaryRoot, tree.skillId);
    treeRoots.set(tree.skillId, root);
    for (const file of tree.files) {
      const target = path.join(root, file.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.content);
    }
  }
});

after(async () => { await rm(temporaryRoot, { recursive: true, force: true }); });

void test("HistAgent production policy closes the audit and maps all admitted surfaces without an output-schema protocol", async () => {
  const policies = await loadHistAgentPolicies(REPO_ROOT);
  assert.deepEqual(Object.fromEntries(Object.entries(policies.production.decisions).map(([key, value]) => [key, value.length])), {
    source_entries: 120,
    knowledge_surfaces: 31,
    content_origins: 5,
    license_claims: 4,
    runtime_authorities: 10,
    external_resources: 16,
    security_findings: 10,
    candidates: 3,
  });
  assert.equal(policies.production.capability_map.length, 21);
  assert.equal(policies.production.capability_map.every((item) => item.derivation === "independent-reimplementation"), true);
  assert.equal(policies.production.capability_map.every((item) => !("output_schema" in item) && !("dependency_group" in item)), true);
  assert.deepEqual(new Set(policies.production.capability_map.map((item) => item.implementation_kind)), new Set(["bundled-script", "configured-http-adapter", "optional-local-tool"]));
  assert.equal(policies.sourceEvidence.files.length, 5);
  assert.equal(policies.review.review_status, "approved");
  assert.equal(policies.review.approved_tree_set_sha256, policies.review.tree_set_sha256);
  assert.notEqual(policies.review.approval_note, null);
  assert.notEqual(policies.review.approved_at, null);
});

void test("all three complete trees satisfy the common non-native validator and fixed portable closure", async () => {
  const rendered = await renderHistAgentCompleteTrees(REPO_ROOT);
  const forbidden = new Set(["runner.json", "runtime.json", "input.schema.json", "output.schema.json", "doctor.py", "validate_result.py", "dependencies.json", "core.txt", "optional.txt"]);
  assert.equal(rendered.trees.length, 3);
  for (const tree of rendered.trees) {
    assert.deepEqual(tree.files.map((file) => file.path), [
      "DERIVATION.json",
      "LICENSE",
      "NOTICE",
      "SKILL.md",
      "lib/historical_support.py",
      ...tree.files.filter((file) => file.path.startsWith("references/")).map((file) => file.path),
      tree.entrypoint,
    ].sort());
    assert.equal(tree.files.length, 8);
    assert.equal(tree.files.filter((file) => file.path.startsWith("references/")).length, 2);
    assert.equal(tree.files.some((file) => forbidden.has(path.posix.basename(file.path).toLowerCase())), false);
    const definition = HISTAGENT_SKILL_DEFINITIONS[tree.skillId];
    assert.ok(definition);
    const validation = validateNonNativeVendorSkill(definition, tree.files);
    assert.deepEqual(validation, { ok: true, diagnostics: [] });
  }
  const packageJson = JSON.parse(await readFile(path.join(REPO_ROOT, "package.json"), "utf8")) as { scripts: Record<string, string> };
  assert.deepEqual(Object.keys(packageJson.scripts).filter((name) => name.startsWith("histagent:")).sort(), [
    "histagent:check",
    "histagent:convert",
    "histagent:idempotence",
  ]);
});

void test("copied analysis and identification trees execute offline, preserve lineage, and refuse overwrite", async () => {
  const work = await mkdtemp(path.join(temporaryRoot, "offline-"));
  const source = path.join(work, "source.html");
  const analysisPath = path.join(work, "analysis.json");
  await writeFile(source, "<html><body><h1>Archive</h1><p>Ledger entry 1848.</p></body></html>");
  const analysis = await invoke("histagent-historical-source-analysis", "scripts/analyze_source.py", ["inspect", "--source", source, "--output", analysisPath]);
  assert.equal(analysis.code, 0);
  assert.equal(analysis.stdout.command, "inspect");
  const analysisArtifact = JSON.parse(await readFile(analysisPath, "utf8")) as { layers: Array<Record<string, unknown>> };
  assert.match(JSON.stringify(analysisArtifact), /Ledger entry 1848/);
  for (const key of ["parent_id", "locator", "tool_or_provider", "reason", "uncertainty", "review_state", "content_sha256"]) assert.ok(key in (analysisArtifact.layers[0] ?? {}));
  const overwrite = await invoke("histagent-historical-source-analysis", "scripts/analyze_source.py", ["inspect", "--source", source, "--output", analysisPath]);
  assert.equal(overwrite.code, 2);
  assert.equal(errorCode(overwrite), "artifact_exists");

  const variants = path.join(work, "variants.json");
  const emendations = path.join(work, "emendations.json");
  const collation = path.join(work, "collation.json");
  await writeJson(variants, { variants: [{ id: "a", text: "colour" }, { id: "b", text: "color" }] });
  await writeJson(emendations, { emendations: [{ from: "a", proposed: "color", reason: "reviewed orthography" }] });
  await invoke("histagent-historical-source-analysis", "scripts/analyze_source.py", ["collate", "--variants-file", variants, "--emendations-file", emendations, "--output", collation]);
  const collated = JSON.parse(await readFile(collation, "utf8")) as { emendations: unknown[]; layers: unknown[] };
  assert.equal(collated.emendations.length, 1);
  assert.equal(collated.layers.length, 1);
  assert.equal((await invoke("histagent-historical-source-analysis", "scripts/analyze_source.py", ["validate", "--layer-file", collation])).stdout.valid, true);

  const index = path.join(work, "index.json");
  const candidatesPath = path.join(work, "candidates.json");
  await writeJson(index, { records: [{ title: "Guild ledger", text: "Merchant guild ledger 1848", locator: "local:ledger" }] });
  await invoke("histagent-historical-source-identification", "scripts/identify_sources.py", ["search", "--query", "merchant guild ledger", "--adapter", "local-index", "--index", index, "--output", candidatesPath]);
  const candidates = (JSON.parse(await readFile(candidatesPath, "utf8")) as { candidates: Array<Record<string, unknown>> }).candidates;
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0]?.status, "discovered");
  assert.equal(candidates[0]?.originating_query, "merchant guild ledger");
});

void test("external adapters use localhost mocks, environment credentials, and explicit upload consent", async () => {
  let requestCount = 0;
  let authorization = "";
  const server = http.createServer((request, response) => {
    requestCount += 1;
    authorization = request.headers.authorization ?? authorization;
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk: string) => { body += chunk; });
    request.on("end", () => {
      const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
      if (pathname !== "/fetch") response.setHeader("Content-Type", "application/json");
      if (pathname === "/translate") response.end(JSON.stringify({ translatedText: `translated:${(JSON.parse(body) as { q: string }).q}` }));
      else if (pathname === "/serp") response.end(JSON.stringify({ organic_results: [{ title: "Search result", link: "https://example.test/search", position: 1 }] }));
      else if (pathname === "/books") response.end(JSON.stringify({ items: [{ id: "book-1", volumeInfo: { title: "Book", infoLink: "https://example.test/book", publishedDate: "1901" } }] }));
      else if (pathname === "/springer") response.end(JSON.stringify({ records: [{ title: "Article", publicationDate: "1902", doi: "10.example/1", url: [{ value: "https://example.test/article" }] }] }));
      else if (pathname === "/cdx") response.end(JSON.stringify([["timestamp", "original", "digest", "statuscode", "mimetype"], ["19030101000000", "https://example.test/original", "digest", "200", "text/html"]]));
      else if (pathname === "/fetch") { response.setHeader("Content-Type", "text/html"); response.end("<html>Fetched source</html>"); }
      else if (pathname === "/vision" || pathname === "/ocr") response.end(JSON.stringify({ text: "adapter observation" }));
      else response.end(JSON.stringify({ results: [{ title: "Matching archive", url: "https://example.test/source" }] }));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const endpoint = `http://127.0.0.1:${String(address.port)}`;
  const env = { HISTAGENT_TEST_KEY: "test-only-secret" };
  try {
    const work = await mkdtemp(path.join(temporaryRoot, "mock-"));
    const image = path.join(work, "image.bin");
    const layer = path.join(work, "layer.json");
    await writeFile(image, "image-bytes");
    await writeJson(layer, { content: "Quelle", content_sha256: "ignored-parent", locator: "folio-1" });

    const beforeDenied = requestCount;
    const denied = await invoke("histagent-historical-source-identification", "scripts/identify_sources.py", ["reverse-image", "--adapter", "http-upload", "--source", image, "--endpoint", `${endpoint}/reverse`, "--output", path.join(work, "denied.json")]);
    assert.equal(errorCode(denied), "consent_required");
    assert.equal(requestCount, beforeDenied);

    const translationPath = path.join(work, "translation.json");
    await invoke("histagent-historical-source-analysis", "scripts/analyze_source.py", ["translate", "--layer-file", layer, "--adapter", "libretranslate", "--endpoint", endpoint, "--target-language", "en", "--credential-env", "HISTAGENT_TEST_KEY", "--allow-external-upload", "--output", translationPath], env);
    assert.match(await readFile(translationPath, "utf8"), /translated:Quelle/);
    assert.equal(authorization, "Bearer test-only-secret");

    await invoke("histagent-historical-source-analysis", "scripts/analyze_source.py", ["ocr", "--source", image, "--adapter", "transkribus", "--endpoint", `${endpoint}/ocr`, "--allow-external-upload", "--output", path.join(work, "ocr.json")]);
    await invoke("histagent-historical-source-analysis", "scripts/analyze_source.py", ["vision", "--source", image, "--adapter", "vision-http", "--endpoint", `${endpoint}/vision`, "--question", "What is visible?", "--allow-external-upload", "--output", path.join(work, "vision.json")]);
    await invoke("histagent-historical-source-identification", "scripts/identify_sources.py", ["search", "--query", "ledger", "--adapter", "serpapi", "--endpoint", `${endpoint}/serp`, "--credential-env", "HISTAGENT_TEST_KEY", "--output", path.join(work, "serp.json")], env);
    await invoke("histagent-historical-source-identification", "scripts/identify_sources.py", ["literature", "--query", "ledger", "--adapter", "google-books", "--endpoint", `${endpoint}/books`, "--output", path.join(work, "books.json")]);
    await invoke("histagent-historical-source-identification", "scripts/identify_sources.py", ["literature", "--query", "ledger", "--adapter", "springer", "--endpoint", `${endpoint}/springer`, "--credential-env", "HISTAGENT_TEST_KEY", "--output", path.join(work, "springer.json")], env);
    await invoke("histagent-historical-source-identification", "scripts/identify_sources.py", ["archive", "--url", "https://example.test/original", "--endpoint", `${endpoint}/cdx`, "--output", path.join(work, "archive.json")]);
    await invoke("histagent-historical-source-identification", "scripts/identify_sources.py", ["reverse-image", "--adapter", "http-upload", "--source", image, "--endpoint", `${endpoint}/reverse`, "--allow-external-upload", "--output", path.join(work, "reverse.json")]);
    const fetched = await invoke("histagent-historical-source-identification", "scripts/identify_sources.py", ["fetch", "--url", `${endpoint}/fetch`, "--output", path.join(work, "fetched.html")]);
    assert.equal((fetched.stdout.candidate as { status: string }).status, "retrieved");
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

void test("copied research tree supports not-applicable layers, recovery, conflicts, and deterministic final artifacts", async () => {
  const work = await mkdtemp(path.join(temporaryRoot, "research-"));
  const runDir = path.join(work, "run");
  const scope = path.join(work, "scope.json");
  await writeJson(scope, { question: "What changed?", source_strategy: "Use the registered ledger." });
  await research(["init", "--run-dir", runDir, "--scope-file", scope, "--run-id", "test-run"]);
  assert.equal((await research(["status", "--run-dir", runDir])).stdout.next_action, "submit-source");

  const source = {
    source_id: "s1",
    title: "Ledger",
    locator: "local:ledger",
    provenance: { sha256: "a".repeat(64) },
    layer_plan: Object.fromEntries(["raw-observation-or-ocr", "normalized-transcription", "emendation", "translation", "interpretation"].map((layer) => [layer, { status: layer === "raw-observation-or-ocr" ? "required" : "not-applicable", reason: layer === "raw-observation-or-ocr" ? "Primary observation is required." : `${layer} is unnecessary for this source.` }])),
    registration_complete: true,
  };
  await mutate(runDir, "submit-source", source);
  assert.equal((await research(["status", "--run-dir", runDir])).stdout.next_action, "submit-layer");

  const wrong = await mutate(runDir, "submit-layer", { source_id: "s1", layer: "interpretation", content: "inference", reason: "wrong order", uncertainty: "high", review_state: "unreviewed" });
  assert.equal(errorCode(wrong), "gate_order_violation");
  await mutate(runDir, "submit-layer", { source_id: "s1", layer: "raw-observation-or-ocr", content: "observed text", parent_id: "s1", locator: "folio-1", operations: [], tool_or_provider: "invoking-agent", reason: "direct reading", uncertainty: "low", review_state: "reviewed" });
  const afterLayer = await research(["status", "--run-dir", runDir]);
  assert.equal(afterLayer.stdout.next_action, "submit-evidence");
  assert.equal((afterLayer.stdout.counts as { required_layers: number }).required_layers, 1);

  await mutate(runDir, "submit-evidence", { record_type: "evidence", evidence_id: "e1", claim: "The text changed.", source_ids: ["s1"] });
  await mutate(runDir, "submit-evidence", { record_type: "conflict", conflict_id: "c1", description: "Witnesses disagree.", status: "unresolved" });
  assert.equal(((await research(["status", "--run-dir", runDir])).stdout.blockers as Array<{ code: string }>)[0]?.code, "unresolved-conflict");
  await mutate(runDir, "submit-evidence", { record_type: "conflict", conflict_id: "c1", description: "Witnesses disagree.", status: "resolved", resolution: "Report both readings." });
  await mutate(runDir, "submit-evidence", { record_type: "limitation", limitation_id: "l1", description: "One register is missing." });
  await mutate(runDir, "submit-evidence", { record_type: "review", conflicts_reviewed: true, limitations_reviewed: true });
  await mutate(runDir, "submit-evidence", { record_type: "synthesis", text: "A documented change occurred, with one missing register.", evidence_ids: ["e1"] });
  assert.equal((await research(["status", "--run-dir", runDir])).stdout.next_action, "render");

  const output = path.join(work, "output");
  const first = await renderResearch(runDir, output, false);
  const firstBytes = await Promise.all(["research-report.md", "evidence-matrix.json", "provenance.json"].map((name) => readFile(path.join(output, name))));
  const provenance = JSON.parse(firstBytes[2]?.toString("utf8") ?? "") as { researchspec_workflow_authority: boolean };
  assert.equal(provenance.researchspec_workflow_authority, false);
  const second = await renderResearch(runDir, output, true);
  const secondBytes = await Promise.all(["research-report.md", "evidence-matrix.json", "provenance.json"].map((name) => readFile(path.join(output, name))));
  assert.deepEqual(secondBytes, firstBytes);
  assert.equal(first.stdout.command, "render");
  assert.equal(second.stdout.command, "render");
  assert.equal((await research(["status", "--run-dir", runDir])).stdout.phase, "complete");
});

interface Invocation { code: number; stdout: Record<string, unknown>; stderr: Record<string, unknown> }

async function invoke(skillId: string, script: string, args: string[], environment: Record<string, string> = {}): Promise<Invocation> {
  const root = treeRoots.get(skillId);
  assert.ok(root);
  const command = ["run", `--project=${path.join(homedir(), ".ar")}`, "--locked", "--", "python", path.join(root, script), ...args];
  return new Promise((resolve, reject) => {
    execFile("uv", command, { cwd: root, env: { ...process.env, ...environment, PYTHONPATH: "", PYTHONNOUSERSITE: "1", PYTHONDONTWRITEBYTECODE: "1" } }, (error, stdout, stderr) => {
      try {
        const code = error && "code" in error && typeof error.code === "number" ? error.code : 0;
        const stdoutLines = stdout.trim() ? stdout.trim().split("\n") : [];
        const stderrLines = stderr.trim() ? stderr.trim().split("\n") : [];
        assert.ok(stdoutLines.length <= 1, `${skillId}:${script}:unexpected stdout`);
        assert.ok(stderrLines.length <= 1, `${skillId}:${script}:unexpected stderr`);
        resolve({ code, stdout: stdoutLines[0] ? JSON.parse(stdoutLines[0]) as Record<string, unknown> : {}, stderr: stderrLines[0] ? JSON.parse(stderrLines[0]) as Record<string, unknown> : {} });
      } catch (parseError) {
        reject(parseError instanceof Error ? parseError : new Error(String(parseError)));
      }
    });
  });
}

async function research(args: string[]): Promise<Invocation> {
  return invoke("histagent-historical-research", "scripts/research_runtime.py", args);
}

async function mutate(runDir: string, command: "submit-source" | "submit-layer" | "submit-evidence", record: Record<string, unknown>): Promise<Invocation> {
  const status = await research(["status", "--run-dir", runDir]);
  const recordPath = path.join(await mkdtemp(path.join(temporaryRoot, "record-")), `${command}.json`);
  await writeJson(recordPath, record);
  return research([command, "--run-dir", runDir, "--record-file", recordPath, "--status-token", String(status.stdout.status_token)]);
}

async function renderResearch(runDir: string, outputDir: string, overwrite: boolean): Promise<Invocation> {
  const status = await research(["status", "--run-dir", runDir]);
  return research(["render", "--run-dir", runDir, "--output-dir", outputDir, "--status-token", String(status.stdout.status_token), ...(overwrite ? ["--overwrite"] : [])]);
}

function errorCode(invocation: Invocation): string | undefined {
  return (invocation.stderr.error as { code?: string } | undefined)?.code;
}

async function writeJson(target: string, value: unknown): Promise<void> {
  await writeFile(target, `${JSON.stringify(value)}\n`);
}
