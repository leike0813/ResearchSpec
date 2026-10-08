import assert from "node:assert/strict";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { CLI_TOP_LEVEL_COMMANDS, getCliCommandDefinition } from "../src/cli/command-catalog.js";
import { handleSearchCache } from "../src/cli/handlers/search-cache.js";
import type { CommandContext } from "../src/cli/types.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

interface CacheData {
  action: string;
  cache_root: string;
  total_bytes: number;
  entries: Array<{ kind: string; path: string; bytes: number }>;
  skipped_paths: string[];
  dry_run?: boolean;
  cleared_paths?: string[];
  failed_paths?: Array<{ path: string; reason: string }>;
}

async function populate(cacheRoot: string): Promise<string> {
  const identity = "model-0123456789abcdef";
  const directory = path.join(cacheRoot, "model", identity);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "receipt.json"), JSON.stringify({ kind: "model", identity, ready: true }));
  await writeFile(path.join(directory, "weights.bin"), "cached model fixture");
  await writeFile(path.join(cacheRoot, "personal.txt"), "preserve me");
  await mkdir(path.join(cacheRoot, "model", "personal"));
  await writeFile(path.join(cacheRoot, "model", "personal", "notes.txt"), "preserve nested unknown data");
  return directory;
}

void test("search cache maintenance is a doctor child and keeps sixteen top-level commands", () => {
  assert.equal(CLI_TOP_LEVEL_COMMANDS.length, 16);
  const definition = getCliCommandDefinition("doctor-search-cache");
  assert.equal(definition.workspace, "none");
  assert.equal(definition.effect, "conditional-write");
  const result = runCli(["doctor", "search-cache", "--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /--clear/);
});

void test("cache inspection and dry-run work without a workspace and never create an absent cache", async () => {
  const root = await tempProject();
  const cacheRoot = path.join(root, "absent-cache");
  const env = { RESEARCHSPEC_SEARCH_CACHE: cacheRoot };
  try {
    for (const options of [[], ["--clear", "--dry-run"]]) {
      const result = runCli(["doctor", "search-cache", ...options, "--json"], root, env);
      const envelope = parseEnvelope<CacheData>(result);
      assert.equal(result.status, 0);
      assert.equal(result.stderr, "");
      assert.equal(envelope.command, "doctor");
      assert.equal(envelope.ok, true);
      assert.equal(envelope.data?.cache_root, cacheRoot);
      assert.equal(envelope.data?.total_bytes, 0);
      assert.deepEqual(envelope.data?.entries, []);
      await assert.rejects(access(cacheRoot));
      await assert.rejects(access(path.join(root, "researchspec")));
    }
    const cleared = parseEnvelope<CacheData>(runCli(["doctor", "search-cache", "--clear", "--yes", "--json"], root, env));
    assert.equal(cleared.ok, true);
    assert.deepEqual(cleared.data?.cleared_paths, []);
    await assert.rejects(access(cacheRoot));
  } finally { await cleanup(root); }
});

void test("inspection, refusal and dry-run preserve managed and unknown files before explicit cleanup", async () => {
  const root = await tempProject();
  const cacheRoot = path.join(root, "shared-cache");
  const env = { RESEARCHSPEC_SEARCH_CACHE: cacheRoot };
  try {
    const managed = await populate(cacheRoot);
    const inspected = parseEnvelope<CacheData>(runCli(["doctor", "search-cache", "--json"], root, env));
    assert.equal(inspected.ok, true);
    assert.ok((inspected.data?.total_bytes ?? 0) > 0);
    assert.ok(inspected.data?.entries.some((entry) => entry.path === managed && entry.kind === "model"));
    for (const options of [[], ["--force"]]) {
      const result = runCli(["doctor", "search-cache", "--clear", ...options, "--json"], root, env);
      assert.equal(result.status, 2);
      assert.equal(parseEnvelope(result).error?.code, "confirmation_required");
      await access(managed);
    }
    const planned = parseEnvelope<CacheData>(runCli(["doctor", "search-cache", "--clear", "--dry-run", "--json"], root, env));
    assert.equal(planned.ok, true);
    assert.equal(planned.data?.dry_run, true);
    assert.deepEqual(planned.data?.cleared_paths, []);
    await access(managed);
    const result = runCli(["doctor", "search-cache", "--clear", "--yes", "--json"], root, env);
    const cleared = parseEnvelope<CacheData>(result);
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
    assert.equal(cleared.ok, true);
    assert.ok(cleared.data?.cleared_paths?.includes(managed));
    assert.deepEqual(cleared.data?.failed_paths, []);
    await assert.rejects(access(managed));
    assert.equal(await readFile(path.join(cacheRoot, "personal.txt"), "utf8"), "preserve me");
    assert.equal(await readFile(path.join(cacheRoot, "model", "personal", "notes.txt"), "utf8"), "preserve nested unknown data");
  } finally { await cleanup(root); }
});

void test("interactive cleanup defaults to refusal and leaves project preference unchanged", async () => {
  const root = await tempProject();
  const cacheRoot = path.join(root, "shared-cache");
  const previous = process.env.RESEARCHSPEC_SEARCH_CACHE;
  process.env.RESEARCHSPEC_SEARCH_CACHE = cacheRoot;
  try {
    const managed = await populate(cacheRoot);
    await mkdir(path.join(root, "researchspec"));
    const config = path.join(root, "researchspec", "config.yaml");
    const preference = 'procedure_search:\n  mode: hybrid\n';
    await writeFile(config, preference);
    const context: CommandContext = { command: "doctor", cwd: root, interactive: true, json: false, quiet: true, dryRun: false, force: false, yes: false };
    let asked = 0;
    const result = await handleSearchCache({ clear: true }, context, (options) => {
      asked++;
      assert.equal(options.default, false);
      return Promise.resolve(false);
    });
    assert.equal(result.ok, true);
    assert.equal(asked, 1);
    await access(managed);
    const accepted = await handleSearchCache({ clear: true }, context, () => Promise.resolve(true));
    assert.equal(accepted.ok, true);
    await assert.rejects(access(managed));
    assert.equal(await readFile(config, "utf8"), preference);
  } finally {
    if (previous === undefined) delete process.env.RESEARCHSPEC_SEARCH_CACHE;
    else process.env.RESEARCHSPEC_SEARCH_CACHE = previous;
    await cleanup(root);
  }
});
