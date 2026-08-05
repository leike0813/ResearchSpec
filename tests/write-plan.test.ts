import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, lstat, readFile, symlink, writeFile } from "node:fs/promises";
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

void test("write plan restores committed files when postcondition validation fails", async () => {
  const root = await tempProject();
  const existing = path.join(root, "existing.txt");
  const created = path.join(root, "created.txt");
  await writeFile(existing, "original", "utf8");
  const refresh = await planFile({ path: existing, content: "changed", scope: "project", ownership: "generated", recordedHash: hash("original") });
  const create = await planFile({ path: created, content: "created", scope: "project", ownership: "generated" });
  await assert.rejects(
    () => executeWritePlan(
      { operations: [refresh, create] },
      { validateCommittedState: () => Promise.reject(new Error("postcondition failed")) },
    ),
    /postcondition failed/,
  );
  assert.equal(await readFile(existing, "utf8"), "original");
  await assert.rejects(() => readFile(created), (error: unknown) => (error as NodeJS.ErrnoException).code === "ENOENT");
  await cleanup(root);
});

void test("write plan creates executable files with the requested mode", { skip: process.platform === "win32" }, async () => {
  const root = await tempProject();
  const target = path.join(root, "tool");
  const operation = await planFile({ path: target, content: "binary", scope: "project", ownership: "generated", mode: 0o755 });
  await executeWritePlan({ operations: [operation] });
  assert.equal((await lstat(target)).mode & 0o777, 0o755);
  await cleanup(root);
});

void test("write plan restores manifest-owned executable mode drift", { skip: process.platform === "win32" }, async () => {
  const root = await tempProject();
  const target = path.join(root, "tool");
  await writeFile(target, "binary", { mode: 0o644 });
  const operation = await planFile({ path: target, content: "binary", scope: "project", ownership: "generated", recordedHash: hash("binary"), mode: 0o755 });
  assert.equal(operation.action, "refresh");
  await executeWritePlan({ operations: [operation] });
  assert.equal((await lstat(target)).mode & 0o777, 0o755);
  await cleanup(root);
});

void test("write plan refuses a mode changed after planning", { skip: process.platform === "win32" }, async () => {
  const root = await tempProject();
  const target = path.join(root, "tool");
  await writeFile(target, "binary", { mode: 0o644 });
  await chmod(target, 0o644);
  const operation = await planFile({ path: target, content: "updated", scope: "project", ownership: "generated", recordedHash: hash("binary"), mode: 0o755 });
  await chmod(target, 0o600);
  await assert.rejects(() => executeWritePlan({ operations: [operation] }), (error: unknown) => (error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT");
  assert.equal((await lstat(target)).mode & 0o777, 0o600);
  await cleanup(root);
});

void test("write plan treats symlink targets as conflicts", { skip: process.platform === "win32" }, async () => {
  const root = await tempProject();
  const source = path.join(root, "source.txt");
  const target = path.join(root, "target.txt");
  await writeFile(source, "user content", "utf8");
  await symlink(source, target);
  const operation = await planFile({ path: target, content: "generated", scope: "project", ownership: "generated", mode: 0o755 });
  assert.equal(operation.action, "conflict");
  assert.equal(await readFile(target, "utf8"), "user content");
  await cleanup(root);
});

void test("write plan refuses a dangling symlink introduced after planning", { skip: process.platform === "win32" }, async () => {
  const root = await tempProject();
  const target = path.join(root, "target.txt");
  const operation = await planFile({ path: target, content: "generated", scope: "project", ownership: "generated" });
  await symlink(path.join(root, "missing.txt"), target);
  await assert.rejects(() => executeWritePlan({ operations: [operation] }), (error: unknown) => (error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT");
  assert.equal((await lstat(target)).isSymbolicLink(), true);
  await cleanup(root);
});

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
