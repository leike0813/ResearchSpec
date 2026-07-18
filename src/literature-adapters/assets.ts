import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { LiteratureAdapterDefinition } from "./contracts.js";

export const LITERATURE_ADAPTER_PACKAGE_ROOT = fileURLToPath(new URL("../../../", import.meta.url));

export interface LiteratureAdapterSkillAsset {
  skillId: string;
  relativePath: string;
  sourcePath: string;
  content: Uint8Array;
  executable: boolean;
}

export async function readLiteratureAdapterProfile(adapter: LiteratureAdapterDefinition): Promise<Uint8Array> {
  return readFile(path.join(LITERATURE_ADAPTER_PACKAGE_ROOT, adapter.profile_template_path));
}

export async function readLiteratureAdapterSkillAssets(adapter: LiteratureAdapterDefinition): Promise<LiteratureAdapterSkillAsset[]> {
  const result: LiteratureAdapterSkillAsset[] = [];
  for (const skillId of [adapter.primary_skill_id, adapter.helper_skill_id]) {
    const sourcePath = adapter.skill_source_paths[skillId];
    if (!sourcePath) throw new Error(`Literature adapter Skill path is missing: ${skillId}`);
    const sourceRoot = path.join(LITERATURE_ADAPTER_PACKAGE_ROOT, sourcePath);
    for (const sourceFile of await walkFiles(sourceRoot)) {
      result.push({
        skillId,
        relativePath: path.relative(sourceRoot, sourceFile.path),
        sourcePath: sourceFile.path,
        content: await readFile(sourceFile.path),
        executable: sourceFile.executable,
      });
    }
  }
  return result.sort((left, right) => left.skillId.localeCompare(right.skillId) || left.relativePath.localeCompare(right.relativePath));
}

async function walkFiles(root: string): Promise<Array<{ path: string; executable: boolean }>> {
  const result: Array<{ path: string; executable: boolean }> = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...await walkFiles(target));
    else if (entry.isFile()) result.push({ path: target, executable: Boolean((await lstat(target)).mode & 0o111) });
  }
  return result.sort((left, right) => left.path.localeCompare(right.path));
}
