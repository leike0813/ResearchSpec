import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { parse as parseYaml } from "yaml";
import { handleGraphInit, handleGraphUpdate, type GraphBootstrapPromptPort } from "../src/cli/handlers/graph-bootstrap.js";
import type { CommandContext } from "../src/cli/types.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

type SearchData = { total: number; next_cursor?: string; items: Array<{ selector: string; inputs: unknown[]; outputs: unknown[]; match: { terms: string[] } }>; retrieval: { effective_mode: string; fallback_reason?: string } };

void test("public discovery preserves Chinese requests, rejects empty queries and binds cursors", async () => {
  const root = await tempProject();
  try {
    const found = parseEnvelope<SearchData>(runCli(["list", "procedures", "--query", "检索文献找出研究空白", "--limit", "1", "--json"], root));
    assert.equal(found.ok, true);
    assert.equal(found.data?.retrieval.effective_mode, "offline");
    assert.ok(found.data?.items.length);
    const card = found.data.items[0];
    assert.ok(Array.isArray(card?.inputs) && Array.isArray(card?.outputs));
    assert.ok(card?.match.terms.length);
    assert.ok(found.data.next_cursor);
    const next = parseEnvelope<SearchData>(runCli(["list", "procedures", "--query", "检索文献找出研究空白", "--cursor", found.data.next_cursor, "--json"], root));
    assert.equal(next.ok, true);
    const stale = parseEnvelope(runCli(["list", "procedures", "--query", "答复审稿意见", "--cursor", found.data.next_cursor, "--json"], root));
    assert.equal(stale.error?.code, "list_cursor_stale");
    for (const query of ["", "   ", "！？", "the and of"]) {
      const empty = parseEnvelope(runCli(["list", "procedures", "--query", query, "--json"], root));
      assert.equal(empty.error?.code, "procedure_query_empty");
    }
    const miss = parseEnvelope<SearchData>(runCli(["list", "procedures", "--query", "zzqvxyunknown", "--json"], root));
    assert.equal(miss.data?.total, 0);
    const browse = parseEnvelope<SearchData>(runCli(["list", "procedures", "--json"], root));
    assert.ok((browse.data?.total ?? 0) > 100);
  } finally { await cleanup(root); }
});

void test("semantic preparation requires explicit selection, preserves mode and remains nonblocking", async () => {
  const root = await tempProject();
  let preparations = 0;
  const context: CommandContext = { command: "init", cwd: root, json: true, dryRun: false, force: false, yes: true, quiet: false, interactive: false };
  const prompts: GraphBootstrapPromptPort = { multiSelect: () => { throw new Error("No noninteractive prompt"); }, confirm: () => { throw new Error("No noninteractive consent"); }, select: () => { throw new Error("No noninteractive recovery prompt"); } };
  const prepare = () => { preparations++; return Promise.resolve({ prepared: false, ready: false, cache_root: path.join(root, "cache"), reason: "runtime_missing" }); };
  try {
    await handleGraphInit(root, { tools: "none" }, context, prompts, prepare);
    assert.equal(preparations, 0);
    const configPath = path.join(root, "researchspec/config.yaml");
    const initial = await readFile(configPath, "utf8");
    const dry = await handleGraphUpdate({ procedureSearch: "hybrid" }, { ...context, dryRun: true }, prepare);
    assert.equal(dry.ok, true);
    assert.equal(preparations, 0);
    assert.equal(await readFile(configPath, "utf8"), initial);
    const selected = await handleGraphUpdate({ procedureSearch: "hybrid" }, context, prepare);
    assert.equal(selected.ok, true);
    assert.equal(preparations, 1);
    assert.equal((selected.data as { procedure_search: { effective_mode: string } }).procedure_search.effective_mode, "offline");
    await handleGraphInit(root, {}, context, prompts, prepare);
    await handleGraphUpdate({}, context, prepare);
    assert.equal(preparations, 1);
    const config = parseYaml(await readFile(configPath, "utf8")) as { procedure_search: { mode: string } };
    assert.equal(config.procedure_search.mode, "hybrid");
    const env = { RESEARCHSPEC_SEARCH_CACHE: path.join(root, "missing-cache") };
    const searched = parseEnvelope<SearchData>(runCli(["list", "procedures", "--query", "文献综述", "--json"], root, env));
    assert.equal(searched.data?.retrieval.effective_mode, "offline");
    assert.ok(searched.data?.retrieval.fallback_reason);
    for (const command of ["status", "check", "doctor"]) {
      const result = parseEnvelope(runCli([command, "--json"], root, env));
      assert.equal(result.ok, true);
      assert.ok(result.diagnostics.some((item) => (item as { code: string }).code === "procedure_search_fallback"));
    }
    await assert.rejects(access(env.RESEARCHSPEC_SEARCH_CACHE));
    await assert.rejects(handleGraphUpdate({ procedureSearch: "other" }, context, prepare), (error: unknown) => (error as { code?: string }).code === "invalid_procedure_search");
    await handleGraphUpdate({ procedureSearch: "offline" }, context, prepare);
    assert.equal(preparations, 1);
  } finally { await cleanup(root); }
});

void test("fresh interactive init prepares only after affirmative model confirmation", async () => {
  for (const enabled of [false, true]) {
    const root = await tempProject();
    let confirmed = 0;
    let prepared = 0;
    let confirmationMessage = "";
    try {
      const context: CommandContext = { command: "init", cwd: root, json: false, dryRun: false, force: false, yes: false, quiet: false, interactive: true };
      const prompts: GraphBootstrapPromptPort = { multiSelect: () => Promise.resolve([]), confirm: (config) => { confirmed++; confirmationMessage = config.message; return Promise.resolve(enabled); }, select: () => Promise.resolve("offline") };
      const result = await handleGraphInit(root, { tools: "none", literatureAdapters: "none" }, context, prompts, () => { prepared++; return Promise.resolve({ prepared: true, ready: true, cache_root: "/test/cache" }); });
      assert.equal(result.ok, true);
      assert.equal(confirmed, 1);
      assert.ok(confirmationMessage.length < 60);
      assert.equal(prepared, enabled ? 1 : 0);
    } finally { await cleanup(root); }
  }
});

void test("interactive semantic setup retries once per explicit choice and offers offline after repeated failure", async () => {
  const root = await tempProject();
  let preparations = 0;
  let recoveryPrompts = 0;
  const context: CommandContext = { command: "init", cwd: root, json: false, dryRun: false, force: false, yes: false, quiet: false, interactive: true };
  const prompts: GraphBootstrapPromptPort = {
    multiSelect: () => Promise.resolve([]),
    confirm: () => Promise.resolve(true),
    select: () => { recoveryPrompts++; return Promise.resolve(recoveryPrompts < 2 ? "retry" : "offline"); },
  };
  try {
    const result = await handleGraphInit(root, { tools: "none", literatureAdapters: "none" }, context, prompts, () => {
      preparations++;
      return Promise.resolve({ prepared: false, ready: false, cache_root: path.join(root, "cache"), reason: "runtime_missing", detail: "runtime unavailable", stage: "runtime" });
    });
    assert.equal(result.ok, true);
    assert.equal(preparations, 2);
    assert.equal(recoveryPrompts, 2);
    assert.equal((result.data as { procedure_search: { mode: string; effective_mode: string } }).procedure_search.mode, "hybrid");
    assert.equal((result.data as { procedure_search: { effective_mode: string } }).procedure_search.effective_mode, "offline");
  } finally { await cleanup(root); }
});

void test("semantic setup retries explicitly and offline recovery keeps hybrid preference", async () => {
  const root = await tempProject();
  const context: CommandContext = { command: "init", cwd: root, json: false, dryRun: false, force: false, yes: false, quiet: false, interactive: true };
  let preparations = 0;
  const choices: Array<"retry" | "offline"> = ["retry", "offline", "retry", "offline"];
  const prompts: GraphBootstrapPromptPort = {
    multiSelect: () => Promise.resolve([]),
    confirm: () => Promise.resolve(true),
    select: () => Promise.resolve(choices.shift() ?? "offline"),
  };
  const prepare = () => {
    preparations += 1;
    return Promise.resolve(preparations === 2
      ? { prepared: true, ready: true, cache_root: path.join(root, "cache") }
      : { prepared: false, ready: false, cache_root: path.join(root, "cache"), reason: "runtime_missing", detail: "runtime unavailable" });
  };
  try {
    const initialized = await handleGraphInit(root, { tools: "none", literatureAdapters: "none" }, context, prompts, prepare);
    assert.equal(initialized.ok, true);
    assert.equal(preparations, 2);
    const configPath = path.join(root, "researchspec/config.yaml");
    assert.equal((parseYaml(await readFile(configPath, "utf8")) as { procedure_search: { mode: string } }).procedure_search.mode, "hybrid");

    const updated = await handleGraphUpdate({ procedureSearch: "hybrid" }, context, prepare, prompts);
    assert.equal(updated.ok, true);
    assert.equal((updated.data as { procedure_search: { effective_mode: string } }).procedure_search.effective_mode, "offline");
    assert.equal((parseYaml(await readFile(configPath, "utf8")) as { procedure_search: { mode: string } }).procedure_search.mode, "hybrid");

    const reinitialized = await handleGraphInit(root, { procedureSearch: "hybrid" }, context, prompts, prepare);
    assert.equal(reinitialized.ok, true);
    assert.equal(preparations, 5);
    assert.equal((parseYaml(await readFile(configPath, "utf8")) as { procedure_search: { mode: string } }).procedure_search.mode, "hybrid");
  } finally { await cleanup(root); }
});
