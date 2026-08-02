import path from "node:path";

import { DEFAULT_SKILL_GROUPS, OPTIONAL_SKILL_GROUPS } from "./config.js";
import { classifyPath } from "./classify.js";
import { listFiles, pathExists } from "./fs-utils.js";
import type { FileRecord, Inventory, SkillGroupInventory } from "./types.js";

const EMPTY_GROUP = (): SkillGroupInventory => ({
  entry: "",
  agents: [],
  references: [],
  templates: [],
  examples: [],
  scripts: [],
});

export async function buildInventory(sourceRoot: string, sourceCommit: string, sourcePaths?: readonly string[]): Promise<Inventory> {
  const inventory: Inventory = {
    source_root: sourceRoot,
    source_commit: sourceCommit,
    skill_groups: {},
    shared: [],
    excluded: [],
    needs_review: [],
  };

  for (const group of [...DEFAULT_SKILL_GROUPS, ...OPTIONAL_SKILL_GROUPS]) {
    if (await pathExists(path.join(sourceRoot, group, "SKILL.md"))) {
      inventory.skill_groups[group] = { ...EMPTY_GROUP(), entry: `${group}/SKILL.md` };
    }
  }

  for (const relPath of sourcePaths ?? await listFiles(sourceRoot)) {
    const classification = classifyPath(relPath);
    if (classification.category === "runtime_core") {
      const group = classification.skill_group;
      if (group && inventory.skill_groups[group] && classification.bucket && classification.bucket !== "entry") {
        inventory.skill_groups[group][classification.bucket].push(relPath);
      }
      continue;
    }

    const record: FileRecord = {
      path: relPath,
      category: classification.category,
      reason: classification.reason,
    };
    if (classification.category === "shared") {
      inventory.shared.push(record);
    } else if (classification.category === "excluded") {
      inventory.excluded.push(record);
    } else {
      inventory.needs_review.push(record);
    }
  }

  inventory.skill_groups = Object.fromEntries(Object.entries(inventory.skill_groups).sort(([a], [b]) => a.localeCompare(b)));
  for (const group of Object.values(inventory.skill_groups)) {
    group.agents.sort();
    group.references.sort();
    group.templates.sort();
    group.examples.sort();
    group.scripts.sort();
  }
  inventory.shared.sort(compareFileRecord);
  inventory.excluded.sort(compareFileRecord);
  inventory.needs_review.sort(compareFileRecord);
  return inventory;
}

function compareFileRecord(left: FileRecord, right: FileRecord): number {
  return left.path.localeCompare(right.path);
}
