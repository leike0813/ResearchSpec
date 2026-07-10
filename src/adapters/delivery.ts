import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Diagnostic } from "../core/validation/types.js";
import { planFile, type PlannedWrite, sha256 } from "../core/workspace/write-plan.js";
import { COMPANION_INTENTS, renderCompanionSkill } from "./companion/index.js";
import { ARSU_COMMAND_CONTENTS, renderCommand } from "./command-renderer.js";
import { getTool } from "./tools.js";
import { ARSU_SKILL_IDS } from "../arsu-converter/routing/contracts.js";

export interface InstallationRecord {
  tool_id: string;
  path: string;
  scope: "project" | "shared-global";
  sha256: string;
  source: string;
  adapter_version: "1";
}

export interface DeliveryPlan {
  operations: PlannedWrite[];
  installations: InstallationRecord[];
  diagnostics: Diagnostic[];
}

const PACKAGE_ROOT = fileURLToPath(new URL("../../../", import.meta.url));

export async function planToolDelivery(input: {
  projectRoot: string;
  toolIds: readonly string[];
  existingInstallations: readonly InstallationRecord[];
  force: boolean;
}): Promise<DeliveryPlan> {
  const operations: PlannedWrite[] = [];
  const installations: InstallationRecord[] = [];
  const diagnostics: Diagnostic[] = [];
  const recorded = new Map(input.existingInstallations.map((item) => [`${item.scope}:${item.path}`, item]));

  for (const toolId of input.toolIds) {
    const tool = getTool(toolId);
    if (!tool) continue;
    try {
      for (const skillId of ARSU_SKILL_IDS) {
        const sourceRoot = path.join(PACKAGE_ROOT, "skills/arsu", skillId);
        for (const sourceFile of await walkFiles(sourceRoot)) {
          const relativeAsset = path.relative(sourceRoot, sourceFile);
          const target = path.join(input.projectRoot, tool.skillsDir, "skills", skillId, relativeAsset);
          const relativeTarget = posix(path.relative(input.projectRoot, target));
          const content = await readFile(sourceFile);
          await addPlanned(target, relativeTarget, "project", content, `${skillId}/${posix(relativeAsset)}`, toolId);
        }
      }

      for (const intent of COMPANION_INTENTS) {
        const skillRoot = path.join(input.projectRoot, tool.skillsDir, "skills", intent.skillId);
        const skillTarget = path.join(skillRoot, "SKILL.md");
        await addPlanned(
          skillTarget,
          posix(path.relative(input.projectRoot, skillTarget)),
          "project",
          renderCompanionSkill(intent),
          `companion:${intent.skillId}/SKILL.md`,
          toolId,
        );
      }

      if (!tool.command) {
        diagnostics.push({ severity: "info", code: "commands_not_supported", message: `${tool.name} supports skills only.`, blocking: false, details: { tool_id: tool.id } });
        continue;
      }
      for (const content of [...ARSU_COMMAND_CONTENTS, ...COMPANION_INTENTS]) {
        const target = tool.command.path(content.id, input.projectRoot);
        const scope = tool.command.scope;
        const manifestPath = scope === "shared-global" ? target : posix(path.relative(input.projectRoot, target));
        await addPlanned(target, manifestPath, scope, renderCommand(tool, content), `command:${content.id}`, toolId);
      }
    } catch (error) {
      diagnostics.push({ severity: "error", code: "tool_delivery_failed", message: error instanceof Error ? error.message : String(error), blocking: true, details: { tool_id: toolId } });
    }
  }
  return { operations, installations, diagnostics };

  async function addPlanned(target: string, manifestPath: string, scope: "project" | "shared-global", content: string | Uint8Array, source: string, toolId: string): Promise<void> {
    const prior = recorded.get(`${scope}:${manifestPath}`);
    const operation = await planFile({ path: target, relativePath: manifestPath, content, scope, ownership: "generated", recordedHash: typeof prior?.sha256 === "string" ? prior.sha256 : undefined, force: input.force });
    operations.push(operation);
    const hash = operation.action === "skip-drift" && typeof prior?.sha256 === "string" ? prior.sha256 : sha256(content);
    if (operation.action !== "conflict") installations.push({ tool_id: toolId, path: manifestPath, scope, sha256: hash, source, adapter_version: "1" });
  }
}

async function walkFiles(root: string): Promise<string[]> {
  const result: string[] = [];
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const target = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...await walkFiles(target));
    else if (entry.isFile()) result.push(target);
  }
  return result.sort();
}

function posix(value: string): string { return value.split(path.sep).join("/"); }
