import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { test } from "node:test";

import { clearSemanticSearchCache, inspectSemanticSearchCache } from "../src/procedures/runtime.js";
import { acquireSemanticCacheLock, SemanticCacheError } from "../src/procedures/cache.js";
import { semanticIndexMetadata } from "../src/procedures/runtime.js";
import type { ProcedureSearchDocument } from "../src/procedures/search-contracts.js";

const DOCUMENTS: ProcedureSearchDocument[] = [{ id: "fixture", fields: { identity: ["fixture"], title: ["fixture"], intents: [], description: [], context: [] } }];

async function withRoots(run: (root: string, outside: string) => Promise<void>): Promise<void> {
  const base = await mkdtemp(path.join(tmpdir(), "researchspec-cache-test-"));
  try { await run(path.join(base, "cache"), path.join(base, "outside")); }
  finally { await rm(base, { recursive: true, force: true }); }
}

void test("inventory and clear recognize managed identities while retaining unknown paths", async () => {
  await withRoots(async (root) => {
    const runtime = path.join(root, "runtime", "runtime-0123456789abcdef");
    await mkdir(runtime, { recursive: true });
    await writeFile(path.join(runtime, "receipt.json"), JSON.stringify({ kind: "runtime", identity: "runtime-0123456789abcdef", ready: true }));
    const olderPaths: string[] = [];
    for (const kind of ["runtime", "model", "index"]) {
      const identity = `${kind}-fedcba9876543210`;
      const directory = path.join(root, kind, identity);
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, "receipt.json"), JSON.stringify({ kind, identity, ready: true }));
      olderPaths.push(directory);
    }
    const unowned = path.join(root, "model", "model-0123456789abcdef");
    await mkdir(unowned, { recursive: true });
    await writeFile(path.join(unowned, "user.txt"), "keep");
    await writeFile(path.join(root, "runtime", "valuable"), "keep");
    await mkdir(path.join(root, "index"), { recursive: true });
    await writeFile(path.join(root, "index", "current.json"), `${JSON.stringify(await semanticIndexMetadata(DOCUMENTS))}\n`);
    const staging = path.join(root, "staging", "index-test-stage");
    await mkdir(staging, { recursive: true });
    await writeFile(path.join(staging, "partial"), "stage");
    const inventory = await inspectSemanticSearchCache({ cacheRoot: root });
    assert.equal(inventory.entries.length, 6);
    assert.deepEqual(new Set(inventory.entries.map((entry) => entry.kind)), new Set(["runtime", "model", "index", "staging"]));
    assert.equal(inventory.total_bytes > 0, true);
    const preview = await clearSemanticSearchCache({ cacheRoot: root, dryRun: true });
    assert.deepEqual(preview.cleared_paths, []);
    await readFile(path.join(runtime, "receipt.json"));
    const result = await clearSemanticSearchCache({ cacheRoot: root });
    assert.deepEqual(result.failed_paths, []);
    await assert.rejects(readFile(path.join(runtime, "receipt.json")));
    assert.equal(await readFile(path.join(root, "runtime", "valuable"), "utf8"), "keep");
    assert.equal(await readFile(path.join(unowned, "user.txt"), "utf8"), "keep");
    assert.equal(result.cleared_paths.includes(path.join(root, "index", "current.json")), true);
    assert.equal(result.cleared_paths.includes(staging), true);
    for (const directory of olderPaths) {
      assert.ok(result.cleared_paths.includes(directory));
      await assert.rejects(readFile(path.join(directory, "receipt.json")));
    }
  });
});

void test("a symlink deletion candidate is reported failed, while nested runtime links are safely removed", async () => {
  await withRoots(async (root, outside) => {
    await mkdir(outside);
    await mkdir(path.join(root, "model"), { recursive: true });
    await writeFile(path.join(outside, "keep"), "safe");
    const owned = path.join(root, "runtime", "runtime-0123456789abcdef");
    await mkdir(owned, { recursive: true });
    await writeFile(path.join(owned, "receipt.json"), JSON.stringify({ kind: "runtime", identity: "runtime-0123456789abcdef", ready: true }));
    await symlink(outside, path.join(owned, "node_modules"));
    await symlink(outside, path.join(root, "model", "model-0123456789abcdef"));
    const result = await clearSemanticSearchCache({ cacheRoot: root });
    assert.equal(result.failed_paths.length, 1);
    assert.equal(result.failed_paths[0]?.path, path.join(root, "model", "model-0123456789abcdef"));
    assert.equal(await readFile(path.join(outside, "keep"), "utf8"), "safe");
    await assert.rejects(readFile(path.join(owned, "receipt.json")));
    await readFile(path.join(root, "model", "model-0123456789abcdef", "keep"));
  });
});

void test("active owners block cleanup and dead owners can be recovered", async () => {
  await withRoots(async (root) => {
    const release = await acquireSemanticCacheLock(root);
    await assert.rejects(clearSemanticSearchCache({ cacheRoot: root }), (error: unknown) => error instanceof SemanticCacheError && error.code === "cache_busy");
    await release();
    await mkdir(path.join(root, ".mutation.lock"));
    await writeFile(path.join(root, ".mutation.lock", "owner.json"), JSON.stringify({ pid: 2_000_000_000, token: "old" }));
    await mkdir(path.join(root, ".mutation.lock", "recovery"));
    await writeFile(path.join(root, ".mutation.lock", "recovery", "owner.json"), JSON.stringify({ pid: 2_000_000_000, token: "dead-recovery" }));
    const reclaimed = await acquireSemanticCacheLock(root);
    await reclaimed();
  });
});

void test("a child process cannot enter while another process holds the cache lock", async () => {
  await withRoots(async (root) => {
    const release = await acquireSemanticCacheLock(root);
    try {
      const moduleUrl = new URL("../src/procedures/cache.js", import.meta.url).href;
      const source = `import(${JSON.stringify(moduleUrl)}).then(async ({ acquireSemanticCacheLock }) => { try { await acquireSemanticCacheLock(process.argv[1]); process.exitCode = 1; } catch (error) { if (error.code === "cache_busy") console.log(error.code); else throw error; } });`;
      const child = spawnSync(process.execPath, ["--input-type=module", "-e", source, root], { encoding: "utf8" });
      assert.equal(child.status, 0, child.stderr);
      assert.match(child.stdout, /cache_busy/);
    } finally {
      await release();
    }
  });
});

void test("concurrent processes recover a dead owner without sharing mutation ownership", { timeout: 10_000 }, async () => {
  await withRoots(async (root) => {
    const exited = spawnSync(process.execPath, ["-e", "" ]);
    await mkdir(path.join(root, ".mutation.lock", "recovery"), { recursive: true });
    for (const directory of [".mutation.lock", ".mutation.lock/recovery"]) {
      await writeFile(path.join(root, directory, "owner.json"), JSON.stringify({ pid: exited.pid, token: directory }));
    }
    const moduleUrl = new URL("../src/procedures/cache.js", import.meta.url).href;
    const source = `import { acquireSemanticCacheLock } from ${JSON.stringify(moduleUrl)};
      try {
        const release = await acquireSemanticCacheLock(process.argv[1]);
        process.send("acquired");
        await new Promise(resolve => process.once("message", resolve));
        await release();
      } catch (error) {
        if (error.code !== "cache_busy") throw error;
        process.send("busy");
      }
      process.disconnect();`;
    const children = Array.from({ length: 4 }, () => spawn(process.execPath, ["--input-type=module", "-e", source, root], { stdio: ["ignore", "ignore", "pipe", "ipc"] }));
    try {
      const states = await Promise.all(children.map((child) => new Promise<unknown>((resolve, reject) => {
        child.once("message", resolve);
        child.once("error", reject);
        child.once("exit", () => reject(new Error("Cache contender exited before reporting ownership")));
      })));
      assert.equal(states.filter((state) => state === "acquired").length, 1);
      assert.equal(states.filter((state) => state === "busy").length, 3);
      const holder = children[states.indexOf("acquired")];
      assert.ok(holder);
      const finished = new Promise<void>((resolve, reject) => holder.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`Cache holder exited with ${String(code)}`))));
      holder.send("release");
      await finished;
      const release = await acquireSemanticCacheLock(root);
      await release();
    } finally {
      for (const child of children) if (child.exitCode === null) child.kill();
    }
  });
});

void test("cache root safety checks reject protected paths", async () => {
  await assert.rejects(acquireSemanticCacheLock(process.cwd()), (error: unknown) => error instanceof SemanticCacheError && error.code === "cache_unsafe");
});
