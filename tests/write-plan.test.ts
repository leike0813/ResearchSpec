import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { executeWritePlan, planFile } from "../src/core/workspace/write-plan.js";
import { cleanup, tempProject } from "./helpers/cli.js";

void test("write plan refuses a target changed after planning", async () => {
  const root = await tempProject();
  const target = path.join(root, "target.txt");
  await writeFile(target, "original", "utf8");
  const operation = await planFile({ path: target, content: "planned", scope: "project", ownership: "generated", recordedHash: hash("original") });
  await writeFile(target, "raced", "utf8");
  await assert.rejects(() => executeWritePlan({ operations: [operation] }), (error: unknown) => (error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT");
  assert.equal(await readFile(target, "utf8"), "raced");
  await cleanup(root);
});

void test("write plan preflights every operation before committing any file", async () => {
  const root = await tempProject();
  const first = path.join(root, "first.txt");
  const second = path.join(root, "second.txt");
  await writeFile(first, "one", "utf8");
  await writeFile(second, "two", "utf8");
  const firstOperation = await planFile({ path: first, content: "ONE", scope: "project", ownership: "generated", recordedHash: hash("one") });
  const secondOperation = await planFile({ path: second, content: "TWO", scope: "project", ownership: "generated", recordedHash: hash("two") });
  await writeFile(second, "raced", "utf8");
  await assert.rejects(() => executeWritePlan({ operations: [firstOperation, secondOperation] }));
  assert.equal(await readFile(first, "utf8"), "one");
  assert.equal(await readFile(second, "utf8"), "raced");
  await cleanup(root);
});

void test("write plan rejects a changed read dependency before staging writes", async () => {
  const root = await tempProject();
  const basis = path.join(root, "basis.txt");
  const target = path.join(root, "target.txt");
  await writeFile(basis, "basis", "utf8");
  const operation = await planFile({ path: target, content: "planned", scope: "project", ownership: "generated" });
  await writeFile(basis, "changed", "utf8");
  await assert.rejects(
    () => executeWritePlan({ operations: [operation], readPreconditions: [{ path: basis, expectedHash: hash("basis"), reason: "submission basis" }] }),
    (error: unknown) => (error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT",
  );
  await assert.rejects(() => readFile(target), (error: unknown) => (error as NodeJS.ErrnoException).code === "ENOENT");
  await cleanup(root);
});

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
