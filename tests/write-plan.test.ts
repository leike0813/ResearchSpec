import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmod, lstat, mkdir, readFile, rename, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { executeWritePlan, planFile } from "../src/core/workspace/write-plan.js";
import { cleanup, tempProject } from "./helpers/cli.js";

void test("write plan refuses a target changed after planning", async () => {
  const root = await tempProject();
  const target = path.join(root, "target.txt");
  await writeFile(target, "original", "utf8");
  const operation = await planFile({ path: target, content: "planned", scope: "project", ownership: "generated", recordedHash: hash("original"), boundaryRoot: root });
  await writeFile(target, "raced", "utf8");
  await assert.rejects(() => executeWritePlan({ operations: [operation], boundaryRoot: root }), (error: unknown) => (error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT");
  assert.equal(await readFile(target, "utf8"), "raced");
  await cleanup(root);
});

void test("write plan rejects generated writes without a trusted root", async () => {
  const root = await tempProject();
  const target = path.join(root, "target.txt");
  const operation = await planFile({ path: target, content: "planned", scope: "project", ownership: "generated" });
  assert.equal(operation.action, "conflict");
  await assert.rejects(
    () => executeWritePlan({ operations: [{ ...operation, action: "create", reason: "manual actionable operation" }] }),
    (error: unknown) => (error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT",
  );
  await assert.rejects(() => readFile(target), (error: unknown) => (error as NodeJS.ErrnoException).code === "ENOENT");
  await cleanup(root);
});

void test("write plan rejects a conflict before committing another operation", async () => {
  const root = await tempProject();
  const existing = path.join(root, "existing.txt");
  const created = path.join(root, "created.txt");
  await writeFile(existing, "user content", "utf8");
  const conflict = await planFile({ path: existing, content: "generated", scope: "project", ownership: "generated", boundaryRoot: root });
  const create = await planFile({ path: created, content: "created", scope: "project", ownership: "generated", boundaryRoot: root });
  assert.equal(conflict.action, "conflict");
  await assert.rejects(
    () => executeWritePlan({ operations: [conflict, create], boundaryRoot: root }),
    (error: unknown) => (error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT",
  );
  assert.equal(await readFile(existing, "utf8"), "user content");
  await assert.rejects(() => readFile(created), (error: unknown) => (error as NodeJS.ErrnoException).code === "ENOENT");
  await cleanup(root);
});

void test("write plan rejects project-external targets before reading them", async () => {
  const root = await tempProject();
  const outside = await tempProject();
  const target = path.join(outside, "external.txt");
  await writeFile(target, "outside", "utf8");
  const operation = await planFile({ path: target, content: "changed", scope: "project", ownership: "generated", boundaryRoot: root });
  assert.equal(operation.action, "conflict");
  assert.equal(await readFile(target, "utf8"), "outside");
  await cleanup(root);
  await cleanup(outside);
});

void test("write plan preflights every operation before committing any file", async () => {
  const root = await tempProject();
  const first = path.join(root, "first.txt");
  const second = path.join(root, "second.txt");
  await writeFile(first, "one", "utf8");
  await writeFile(second, "two", "utf8");
  const firstOperation = await planFile({ path: first, content: "ONE", scope: "project", ownership: "generated", recordedHash: hash("one"), boundaryRoot: root });
  const secondOperation = await planFile({ path: second, content: "TWO", scope: "project", ownership: "generated", recordedHash: hash("two"), boundaryRoot: root });
  await writeFile(second, "raced", "utf8");
  await assert.rejects(() => executeWritePlan({ operations: [firstOperation, secondOperation], boundaryRoot: root }));
  assert.equal(await readFile(first, "utf8"), "one");
  assert.equal(await readFile(second, "utf8"), "raced");
  await cleanup(root);
});

void test("write plan rejects a changed read dependency before staging writes", async () => {
  const root = await tempProject();
  const basis = path.join(root, "basis.txt");
  const target = path.join(root, "target.txt");
  await writeFile(basis, "basis", "utf8");
  const operation = await planFile({ path: target, content: "planned", scope: "project", ownership: "generated", boundaryRoot: root });
  await writeFile(basis, "changed", "utf8");
  await assert.rejects(
    () => executeWritePlan({ operations: [operation], readPreconditions: [{ path: basis, expectedHash: hash("basis"), reason: "submission basis" }], boundaryRoot: root }),
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
  const refresh = await planFile({ path: existing, content: "changed", scope: "project", ownership: "generated", recordedHash: hash("original"), boundaryRoot: root });
  const create = await planFile({ path: created, content: "created", scope: "project", ownership: "generated", boundaryRoot: root });
  await assert.rejects(
    () => executeWritePlan(
      { operations: [refresh, create], boundaryRoot: root },
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
  const operation = await planFile({ path: target, content: "binary", scope: "project", ownership: "generated", mode: 0o755, boundaryRoot: root });
  await executeWritePlan({ operations: [operation], boundaryRoot: root });
  assert.equal((await lstat(target)).mode & 0o777, 0o755);
  await cleanup(root);
});

void test("write plan restores manifest-owned executable mode drift", { skip: process.platform === "win32" }, async () => {
  const root = await tempProject();
  const target = path.join(root, "tool");
  await writeFile(target, "binary", { mode: 0o644 });
  const operation = await planFile({ path: target, content: "binary", scope: "project", ownership: "generated", recordedHash: hash("binary"), mode: 0o755, boundaryRoot: root });
  assert.equal(operation.action, "refresh");
  await executeWritePlan({ operations: [operation], boundaryRoot: root });
  assert.equal((await lstat(target)).mode & 0o777, 0o755);
  await cleanup(root);
});

void test("write plan refuses a mode changed after planning", { skip: process.platform === "win32" }, async () => {
  const root = await tempProject();
  const target = path.join(root, "tool");
  await writeFile(target, "binary", { mode: 0o644 });
  await chmod(target, 0o644);
  const operation = await planFile({ path: target, content: "updated", scope: "project", ownership: "generated", recordedHash: hash("binary"), mode: 0o755, boundaryRoot: root });
  await chmod(target, 0o600);
  await assert.rejects(() => executeWritePlan({ operations: [operation], boundaryRoot: root }), (error: unknown) => (error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT");
  assert.equal((await lstat(target)).mode & 0o777, 0o600);
  await cleanup(root);
});

void test("write plan treats symlink targets as conflicts", { skip: process.platform === "win32" }, async () => {
  const root = await tempProject();
  const source = path.join(root, "source.txt");
  const target = path.join(root, "target.txt");
  await writeFile(source, "user content", "utf8");
  await symlink(source, target);
  const operation = await planFile({ path: target, content: "generated", scope: "project", ownership: "generated", mode: 0o755, boundaryRoot: root });
  assert.equal(operation.action, "conflict");
  assert.equal(await readFile(target, "utf8"), "user content");
  await cleanup(root);
});

void test("write plan refuses a dangling symlink introduced after planning", { skip: process.platform === "win32" }, async () => {
  const root = await tempProject();
  const target = path.join(root, "target.txt");
  const operation = await planFile({ path: target, content: "generated", scope: "project", ownership: "generated", boundaryRoot: root });
  await symlink(path.join(root, "missing.txt"), target);
  await assert.rejects(() => executeWritePlan({ operations: [operation], boundaryRoot: root }), (error: unknown) => (error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT");
  assert.equal((await lstat(target)).isSymbolicLink(), true);
  await cleanup(root);
});

void test("write plan rejects final and ancestor symlinks, including links back into the root", { skip: process.platform === "win32" }, async () => {
  const root = await tempProject();
  const outside = await tempProject();
  const outsideFile = path.join(outside, "outside.txt");
  await writeFile(outsideFile, "outside", "utf8");
  const finalLink = path.join(root, "final-link.txt");
  const ancestorLink = path.join(root, "ancestor-link");
  await symlink(outsideFile, finalLink);
  await symlink(root, ancestorLink);

  const finalOperation = await planFile({ path: finalLink, content: "changed", scope: "project", ownership: "generated", boundaryRoot: root });
  const ancestorOperation = await planFile({ path: path.join(ancestorLink, "target.txt"), content: "changed", scope: "project", ownership: "generated", boundaryRoot: root });
  assert.equal(finalOperation.action, "conflict");
  assert.equal(ancestorOperation.action, "conflict");
  assert.equal(await readFile(outsideFile, "utf8"), "outside");

  await cleanup(root);
  await cleanup(outside);
});

void test("write plan creates missing regular paths under its trusted root", async () => {
  const root = await tempProject();
  const target = path.join(root, "missing", "nested", "target.txt");
  const operation = await planFile({ path: target, content: "created", scope: "project", ownership: "generated", boundaryRoot: root });
  await executeWritePlan({ operations: [operation], boundaryRoot: root, ensureDirectories: [path.join(root, "prepared")] });
  assert.equal(await readFile(target, "utf8"), "created");
  await cleanup(root);
});

void test("write plan permits a project root that is itself a symlink", { skip: process.platform === "win32" }, async () => {
  const root = await tempProject();
  const actualRoot = path.join(root, "actual");
  const projectRoot = path.join(root, "project-link");
  await mkdir(actualRoot);
  await symlink(actualRoot, projectRoot);
  const target = path.join(projectRoot, "target.txt");
  const operation = await planFile({ path: target, content: "created", scope: "project", ownership: "generated", boundaryRoot: projectRoot });
  await executeWritePlan({ operations: [operation], boundaryRoot: projectRoot });
  assert.equal(await readFile(target, "utf8"), "created");
  await cleanup(root);
});

void test("write plan blocks a parent that becomes a symlink after planning", { skip: process.platform === "win32" }, async () => {
  const root = await tempProject();
  const outside = await tempProject();
  const parent = path.join(root, "managed");
  const movedParent = path.join(root, "managed-real");
  const target = path.join(parent, "target.txt");
  const outsideTarget = path.join(outside, "target.txt");
  await mkdir(parent);
  await writeFile(outsideTarget, "outside", "utf8");
  const operation = await planFile({ path: target, content: "changed", scope: "project", ownership: "generated", boundaryRoot: root });
  await rename(parent, movedParent);
  await symlink(outside, parent);

  await assert.rejects(
    () => executeWritePlan({ operations: [operation], boundaryRoot: root }),
    (error: unknown) => (error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT",
  );
  assert.equal(await readFile(outsideTarget, "utf8"), "outside");
  await cleanup(root);
  await cleanup(outside);
});

void test("write plan leaves recovery files when rollback would cross a new symlink", { skip: process.platform === "win32" }, async () => {
  const root = await tempProject();
  const outside = await tempProject();
  const parent = path.join(root, "managed");
  const movedParent = path.join(root, "managed-real");
  const existing = path.join(parent, "existing.txt");
  const created = path.join(parent, "created.txt");
  const outsideExisting = path.join(outside, "existing.txt");
  await mkdir(parent);
  await writeFile(existing, "original", "utf8");
  await writeFile(outsideExisting, "outside", "utf8");
  const refresh = await planFile({ path: existing, content: "changed", scope: "project", ownership: "generated", recordedHash: hash("original"), boundaryRoot: root });
  const create = await planFile({ path: created, content: "created", scope: "project", ownership: "generated", boundaryRoot: root });

  await assert.rejects(
    () => executeWritePlan(
      { operations: [refresh, create], boundaryRoot: root },
      {
        validateCommittedState: async () => {
          await rename(parent, movedParent);
          await symlink(outside, parent);
          throw new Error("postcondition failed");
        },
      },
    ),
    /postcondition failed/,
  );
  assert.equal(await readFile(outsideExisting, "utf8"), "outside");
  await cleanup(root);
  await cleanup(outside);
});

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
