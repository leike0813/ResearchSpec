import { cp, mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

import { sha256 } from "../../core/workspace/write-plan.js";

const GENERATED_AREAS = ["vendor-bundles", "vendor-manifests", "conversion-reports"] as const;

export async function prepareVendorStage(baselinePluginRoot: string, stageRoot: string, vendorId: string): Promise<void> {
  if (await pathExists(baselinePluginRoot)) await cp(baselinePluginRoot, stageRoot, { recursive: true });
  await removeVendorProjection(stageRoot, vendorId);
  await rm(path.join(stageRoot, "registry.json"), { force: true });
}

export async function commitVendorStage(stageRoot: string, outputRoot: string, vendorId: string): Promise<void> {
  await mkdir(path.join(outputRoot, "vendors"), { recursive: true });
  await rm(path.join(outputRoot, "vendors", vendorId), { recursive: true, force: true });
  await cp(path.join(stageRoot, "vendors", vendorId), path.join(outputRoot, "vendors", vendorId), { recursive: true });
  for (const area of GENERATED_AREAS) {
    await mkdir(path.join(outputRoot, area), { recursive: true });
    const extension = area === "conversion-reports" ? "md" : "json";
    await cp(path.join(stageRoot, area, `${vendorId}.${extension}`), path.join(outputRoot, area, `${vendorId}.${extension}`));
  }
  await cp(path.join(stageRoot, "registry.json"), path.join(outputRoot, "registry.json"));
}

export async function vendorProjectionDiff(expectedRoot: string, actualRoot: string, vendorId: string): Promise<string[]> {
  const expected = await relativeFileMap(expectedRoot, (relative) => isVendorProjectionPath(relative, vendorId));
  const actual = await relativeFileMap(actualRoot, (relative) => isVendorProjectionPath(relative, vendorId));
  const keys = new Set([...expected.keys(), ...actual.keys()]);
  return [...keys].filter((key) => expected.get(key) !== actual.get(key)).sort(compareText);
}

export async function pathExists(filePath: string): Promise<boolean> {
  try { await stat(filePath); return true; } catch { return false; }
}

export async function walkFiles(root: string): Promise<string[]> {
  const result: string[] = [];
  if (!(await pathExists(root))) return result;
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...await walkFiles(target));
    else if (entry.isFile()) result.push(target);
  }
  return result.sort(compareText);
}

export function posix(value: string): string { return value.split(path.sep).join("/"); }

async function removeVendorProjection(root: string, vendorId: string): Promise<void> {
  await rm(path.join(root, "vendors", vendorId), { recursive: true, force: true });
  for (const area of GENERATED_AREAS) {
    const extension = area === "conversion-reports" ? "md" : "json";
    await rm(path.join(root, area, `${vendorId}.${extension}`), { force: true });
  }
}

function isVendorProjectionPath(relative: string, vendorId: string): boolean {
  return relative === "registry.json"
    || relative.startsWith(`vendors/${vendorId}/`)
    || relative === `vendor-bundles/${vendorId}.json`
    || relative === `vendor-manifests/${vendorId}.json`
    || relative === `conversion-reports/${vendorId}.md`;
}

async function relativeFileMap(root: string, include: (relative: string) => boolean): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  for (const file of await walkFiles(root)) {
    const relative = posix(path.relative(root, file));
    if (include(relative)) result.set(relative, sha256(await readFile(file)));
  }
  return result;
}

function compareText(left: string, right: string): number { return left.localeCompare(right); }
