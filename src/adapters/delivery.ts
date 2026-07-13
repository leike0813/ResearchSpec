import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Diagnostic } from "../core/validation/types.js";
import { planFile, type PlannedWrite, sha256 } from "../core/workspace/write-plan.js";
import { COMPANION_INTENTS, renderCompanionSkill } from "./companion/index.js";
import { ARSU_COMMAND_CONTENTS, renderCommand } from "./command-renderer.js";
import { getTool } from "./tools.js";
import { ARSU_SKILL_IDS } from "../arsu-converter/routing/contracts.js";
import { MIT_LICENSE_TEXT } from "../licensing.js";
import { filesForSkill, pluginSkillRoot, type LoadedPluginRegistry } from "../plugins/registry.js";

export interface InstallationRecord {
  tool_id: string;
  path: string;
  scope: "project" | "shared-global";
  sha256: string;
  source: string;
  adapter_version: "1";
  plugin_id?: string;
  plugin_version?: string;
  skill_id?: string;
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
  pluginRegistry?: LoadedPluginRegistry;
  selectedPluginIds?: readonly string[];
}): Promise<DeliveryPlan> {
  const operations: PlannedWrite[] = [];
  const installations: InstallationRecord[] = [];
  const diagnostics: Diagnostic[] = [];
  const recorded = new Map(input.existingInstallations.map((item) => [`${item.scope}:${item.path}`, item]));
  const pluginRegistry = input.pluginRegistry;

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
        const licenseTarget = path.join(skillRoot, "LICENSE");
        await addPlanned(
          licenseTarget,
          posix(path.relative(input.projectRoot, licenseTarget)),
          "project",
          MIT_LICENSE_TEXT,
          `companion:${intent.skillId}/LICENSE`,
          toolId,
        );
      }

      if (pluginRegistry) {
        for (const pluginId of input.selectedPluginIds ?? []) {
          const plugin = pluginRegistry.plugins.get(pluginId);
          if (!plugin) continue;
          for (const skill of plugin.skills) {
            const sourceRoot = pluginSkillRoot(pluginRegistry.root, plugin.plugin_id, skill.skill_id);
            for (const relativeAsset of filesForSkill(pluginRegistry, plugin.plugin_id, skill.skill_id)) {
              const sourceFile = path.join(sourceRoot, relativeAsset);
              const target = path.join(input.projectRoot, tool.skillsDir, "skills", skill.skill_id, relativeAsset);
              await addPlanned(
                target,
                posix(path.relative(input.projectRoot, target)),
                "project",
                await readFile(sourceFile),
                `plugin:${plugin.plugin_id}/${skill.skill_id}/${relativeAsset}`,
                toolId,
                { plugin_id: plugin.plugin_id, plugin_version: plugin.version, skill_id: skill.skill_id },
              );
            }
          }
        }
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

  async function addPlanned(target: string, manifestPath: string, scope: "project" | "shared-global", content: string | Uint8Array, source: string, toolId: string, plugin?: Pick<InstallationRecord, "plugin_id" | "plugin_version" | "skill_id">): Promise<void> {
    const prior = recorded.get(`${scope}:${manifestPath}`);
    const operation = await planFile({ path: target, relativePath: manifestPath, content, scope, ownership: "generated", recordedHash: typeof prior?.sha256 === "string" ? prior.sha256 : undefined, force: input.force });
    operations.push(operation);
    const hash = operation.action === "skip-drift" && typeof prior?.sha256 === "string" ? prior.sha256 : sha256(content);
    if (operation.action !== "conflict") installations.push({ tool_id: toolId, path: manifestPath, scope, sha256: hash, source, adapter_version: "1", ...plugin });
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
