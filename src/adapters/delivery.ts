import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Diagnostic } from "../core/validation/types.js";
import { planFile, type PlannedWrite, sha256 } from "../core/workspace/write-plan.js";
import { COMPANION_INTENTS, renderCompanionSkill } from "./companion/index.js";
import { COMMAND_WRAPPER_CONTENTS, renderCommand } from "./command-renderer.js";
import { renderCliHandbook } from "../cli/handbook.js";
import { getTool } from "./tools.js";
import { ARSU_SKILL_IDS } from "../arsu-converter/routing/contracts.js";
import { MIT_LICENSE_TEXT } from "../licensing.js";
import { filesForSkill, pluginSkillRoot, resolveDomainSelection, type LoadedPluginRegistry } from "../plugins/registry.js";
import { installationKey, type ManagedInstallation, type ManagedInstallationSource } from "./installations.js";

export interface DeliveryPlan {
  operations: PlannedWrite[];
  installations: ManagedInstallation[];
  diagnostics: Diagnostic[];
}

const PACKAGE_ROOT = fileURLToPath(new URL("../../../", import.meta.url));

export async function planToolDelivery(input: {
  projectRoot: string;
  toolIds: readonly string[];
  existingInstallations: readonly ManagedInstallation[];
  force: boolean;
  pluginRegistry?: LoadedPluginRegistry;
  selectedPluginIds?: readonly string[];
}): Promise<DeliveryPlan> {
  const operations: PlannedWrite[] = [];
  const installations: ManagedInstallation[] = [];
  const diagnostics: Diagnostic[] = [];
  const recorded = new Map(input.existingInstallations.map((item) => [installationKey(item), item]));
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
          await addPlanned(target, relativeTarget, "project", content, { kind: "arsu-skill", skill_id: skillId }, toolId);
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
          { kind: "companion-skill", skill_id: intent.skillId },
          toolId,
        );
        const licenseTarget = path.join(skillRoot, "LICENSE");
        await addPlanned(
          licenseTarget,
          posix(path.relative(input.projectRoot, licenseTarget)),
          "project",
          MIT_LICENSE_TEXT,
          { kind: "companion-skill", skill_id: intent.skillId },
          toolId,
        );
        if (intent.id === "navigate") {
          const handbookTarget = path.join(skillRoot, "references", "cli-handbook.md");
          await addPlanned(
            handbookTarget,
            posix(path.relative(input.projectRoot, handbookTarget)),
            "project",
            renderCliHandbook(),
            { kind: "companion-skill", skill_id: intent.skillId },
            toolId,
          );
        }
      }

      if (pluginRegistry) {
        const resolution = resolveDomainSelection(pluginRegistry, input.selectedPluginIds ?? []);
        for (const registered of resolution.skills) {
          const skill = registered.definition;
          const vendor = registered.vendor;
            const sourceRoot = pluginSkillRoot(pluginRegistry.root, vendor.vendor_id, skill.skill_id);
            for (const relativeAsset of filesForSkill(pluginRegistry, skill.skill_id)) {
              const sourceFile = path.join(sourceRoot, relativeAsset);
              const target = path.join(input.projectRoot, tool.skillsDir, "skills", skill.skill_id, relativeAsset);
              await addPlanned(
                target,
                posix(path.relative(input.projectRoot, target)),
                "project",
                await readFile(sourceFile),
                { kind: "domain-skill", vendor_id: vendor.vendor_id, vendor_release: vendor.release, skill_id: skill.skill_id },
                toolId,
              );
            }
        }
      }

      if (!tool.command) {
        diagnostics.push({ severity: "info", code: "commands_not_supported", message: `${tool.name} supports skills only.`, blocking: false, details: { tool_id: tool.id } });
        continue;
      }
      for (const content of COMMAND_WRAPPER_CONTENTS) {
        const target = tool.command.path(content.id, input.projectRoot);
        const scope = tool.command.scope;
        const manifestPath = scope === "shared-global" ? target : posix(path.relative(input.projectRoot, target));
        await addPlanned(target, manifestPath, scope, renderCommand(tool, content), { kind: "command", command_id: content.id }, toolId);
      }
    } catch (error) {
      diagnostics.push({ severity: "error", code: "tool_delivery_failed", message: error instanceof Error ? error.message : String(error), blocking: true, details: { tool_id: toolId } });
    }
  }
  return { operations, installations, diagnostics };

  async function addPlanned(target: string, manifestPath: string, scope: "project" | "shared-global", content: string | Uint8Array, source: ManagedInstallationSource, toolId: string): Promise<void> {
    const prior = recorded.get(`${scope}:${manifestPath}`);
    const operation = await planFile({ path: target, relativePath: manifestPath, content, scope, ownership: "generated", recordedHash: typeof prior?.sha256 === "string" ? prior.sha256 : undefined, force: input.force });
    operations.push(operation);
    const hash = operation.action === "skip-drift" && typeof prior?.sha256 === "string" ? prior.sha256 : sha256(content);
    if (operation.action !== "conflict") installations.push({ owner: "agent-tool", tool_id: toolId, source, target: { scope, path: manifestPath, executable: false }, sha256: hash });
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
