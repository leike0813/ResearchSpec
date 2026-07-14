import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, readdir, stat } from "node:fs/promises";
import path from "node:path";

import { isSafeAuditPath } from "../../src/vendor-audits/contracts.js";

export interface RepositoryResourceSummary {
  files: number;
  bytes: number;
  references: number;
  scripts: number;
  assets: number;
  tests_or_evals: number;
  environment_templates: number;
}

export async function assertAuditSourceInitialized(sourceRoot: string, markerPath: string, command: string): Promise<void> {
  await assert.doesNotReject(
    stat(path.join(sourceRoot, markerPath)),
    `Vendor audit source is not initialized; run ${command}`,
  );
}

export function gitOutput(sourceRoot: string, args: string[]): string {
  return execFileSync("git", ["-C", sourceRoot, ...args], { encoding: "utf8" }).trim();
}

export async function topLevelSkillIds(sourceRoot: string, skillRoot = "skills"): Promise<string[]> {
  const root = path.join(sourceRoot, skillRoot);
  const entries = await readdir(root, { withFileTypes: true });
  const result: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      await access(path.join(root, entry.name, "SKILL.md"));
      result.push(entry.name);
    } catch {
      // Non-Skill directories are outside the top-level audit inventory.
    }
  }
  return result.sort(compareText);
}

export async function repositoryResourceSummary(skillRoot: string): Promise<RepositoryResourceSummary> {
  const files = await walkFiles(skillRoot);
  const relative = files.map((file) => ({ file, path: path.relative(skillRoot, file).split(path.sep).join("/") }));
  const countRoot = (name: string): number => relative.filter((item) => item.path === name || item.path.startsWith(`${name}/`)).length;
  return {
    files: files.length,
    bytes: (await Promise.all(files.map(async (file) => (await stat(file)).size))).reduce((sum, size) => sum + size, 0),
    references: countRoot("references"),
    scripts: countRoot("scripts"),
    assets: countRoot("assets"),
    tests_or_evals: relative.filter((item) => {
      const name = path.basename(item.path);
      return item.path.startsWith("tests/") || item.path.startsWith("evals/") || name.startsWith("test_") || /_test\.[^.]+$/.test(name);
    }).length,
    environment_templates: relative.filter((item) => path.basename(item.path) === ".env.template").length,
  };
}

export async function assertEvidencePaths(sourceRoot: string, evidence: readonly string[]): Promise<void> {
  assert.ok(evidence.length > 0);
  for (const evidencePath of evidence) {
    assert.equal(isSafeAuditPath(evidencePath), true, evidencePath);
    await access(path.join(sourceRoot, evidencePath));
  }
}

async function walkFiles(root: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...await walkFiles(target));
    else if (entry.isFile()) result.push(target);
  }
  return result.sort(compareText);
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, "en");
}
