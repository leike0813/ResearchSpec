import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { Diagnostic } from "../core/validation/types.js";
import { planFile, type PlannedWrite, sha256 } from "../core/workspace/write-plan.js";
import { COMPANION_INTENTS, renderCompanionSkill } from "./companion/index.js";
import { COMMAND_WRAPPER_CONTENTS, renderCommand } from "./command-renderer.js";
import { getTool, resolveToolIdAlias, sharedSkillTarget, toolSkillsRoot, type DeliveryMode, type ToolDefinition } from "./tools.js";
import { ARSU_SKILL_IDS } from "../arsu-converter/routing/contracts.js";
import { CORE_SKILL_IDS } from "../core-skills/catalog.js";
import { MIT_LICENSE_TEXT } from "../licensing.js";
import { filesForSkill, pluginSkillRoot, resolveDomainSelection, type LoadedPluginRegistry } from "../plugins/registry.js";
import { installationKey, type ManagedInstallation, type ManagedInstallationSource } from "./installations.js";

export interface DeliveryPlan {
  operations: PlannedWrite[];
  installations: ManagedInstallation[];
  diagnostics: Diagnostic[];
  skillToolIds: string[];
  commandToolIds: string[];
}

const PACKAGE_ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const SHARED_TARGET_MARKER = ".researchspec-target";

export async function planToolDelivery(input: {
  projectRoot: string;
  toolIds: readonly string[];
  delivery?: DeliveryMode;
  existingInstallations: readonly ManagedInstallation[];
  force: boolean;
  pluginRegistry?: LoadedPluginRegistry;
  selectedPluginIds?: readonly string[];
}): Promise<DeliveryPlan> {
  const operations: PlannedWrite[] = [];
  const installations: ManagedInstallation[] = [];
  const diagnostics: Diagnostic[] = [];
  const recorded = new Map(input.existingInstallations.map((item) => [installationKey(item), item]));
  const selected = [...new Set(input.toolIds.map(resolveToolIdAlias))];
  const delivery = input.delivery ?? "both";
  const skillToolIds = selectSkillWriters(selected, delivery);
  const commandToolIds = selected.filter((id) => Boolean(getTool(id)?.command));
  const pluginRegistry = input.pluginRegistry;

  for (const toolId of selected) {
    const tool = getTool(toolId);
    if (!tool) continue;
    const writesSkills = skillToolIds.includes(tool.id);
    const writesCommands = delivery !== "skills" && Boolean(tool.command);
    if (delivery !== "skills" && !tool.command) {
      diagnostics.push({ severity: "info", code: "commands_not_supported", message: `${tool.name} supports skills only.`, blocking: false, details: { tool_id: tool.id, delivery } });
    }
    if (!writesSkills && !writesCommands) {
      continue;
    }

    try {
      if (writesSkills) {
        const root = toolSkillsRoot(tool, input.projectRoot);
        await planSharedMarker(tool, root);
        for (const skillId of ARSU_SKILL_IDS) {
          const sourceRoot = path.join(PACKAGE_ROOT, "skills/arsu", skillId);
          for (const sourceFile of await walkFiles(sourceRoot)) await addSkillFile(tool, root, sourceRoot, sourceFile, { kind: "arsu-skill", skill_id: skillId });
        }
        for (const skillId of CORE_SKILL_IDS) {
          const sourceRoot = path.join(PACKAGE_ROOT, "skills", skillId);
          for (const sourceFile of await walkFiles(sourceRoot)) await addSkillFile(tool, root, sourceRoot, sourceFile, { kind: "core-skill", skill_id: skillId });
        }
        for (const intent of COMPANION_INTENTS) {
          const skillRoot = path.join(root.root, intent.skillId);
          await addSkill(
            path.join(skillRoot, "SKILL.md"),
            renderCompanionSkill(intent),
            { kind: "companion-skill", skill_id: intent.skillId },
            tool,
          );
          await addSkill(path.join(skillRoot, "LICENSE"), MIT_LICENSE_TEXT, { kind: "companion-skill", skill_id: intent.skillId }, tool);
        }
        if (pluginRegistry) {
          const resolution = resolveDomainSelection(pluginRegistry, input.selectedPluginIds ?? []);
          for (const registered of resolution.skills) {
            const skill = registered.definition;
            const sourceRoot = pluginSkillRoot(pluginRegistry.root, registered.vendor.vendor_id, skill.skill_id);
            for (const relativeAsset of filesForSkill(pluginRegistry, skill.skill_id)) {
              await addSkill(
                path.join(root.root, skill.skill_id, relativeAsset),
                await readFile(path.join(sourceRoot, relativeAsset)),
                { kind: "domain-skill", vendor_id: registered.vendor.vendor_id, vendor_release: registered.vendor.release, skill_id: skill.skill_id },
                tool,
              );
            }
          }
        }
      }

      if (writesCommands) {
        const command = tool.command;
        if (command) {
          for (const content of COMMAND_WRAPPER_CONTENTS) {
            const target = command.path(content.id, input.projectRoot);
            await addPlanned(target, command.scope === "shared-global" ? target : relativeProject(target), command.scope, renderCommand(tool, content), { kind: "command", command_id: content.id }, tool.id);
          }
        }
      }
    } catch (error) {
      diagnostics.push({ severity: "error", code: "tool_delivery_failed", message: error instanceof Error ? error.message : String(error), blocking: true, details: { tool_id: tool.id } });
    }
  }

  return { operations, installations, diagnostics, skillToolIds, commandToolIds };

  async function planSharedMarker(tool: ToolDefinition, root: ReturnType<typeof toolSkillsRoot>): Promise<void> {
    const target = path.join(root.root, SHARED_TARGET_MARKER);
    const targetId = sharedSkillTarget(tool.id);
    if (!targetId) return;
    await addPlanned(target, root.scope === "project" ? relativeProject(target) : target, root.scope, `${targetId}\n`, { kind: "shared-skill-target", target_id: targetId }, tool.id);
  }

  async function addSkillFile(tool: ToolDefinition, root: ReturnType<typeof toolSkillsRoot>, sourceRoot: string, sourceFile: string, source: ManagedInstallationSource): Promise<void> {
    await addSkill(path.join(root.root, path.basename(sourceRoot), path.relative(sourceRoot, sourceFile)), await readFile(sourceFile), source, tool);
  }

  async function addSkill(target: string, content: string | Uint8Array, source: ManagedInstallationSource, tool: ToolDefinition): Promise<void> {
    const root = toolSkillsRoot(tool, input.projectRoot);
    await addPlanned(target, root.scope === "project" ? relativeProject(target) : target, root.scope, content, source, tool.id);
  }

  async function addPlanned(target: string, manifestPath: string, scope: "project" | "shared-global", content: string | Uint8Array, source: ManagedInstallationSource, toolId: string): Promise<void> {
    const prior = recorded.get(`${scope}:${manifestPath}`);
    const adoptedHash = prior?.sha256 ?? await existingFileHash(target);
    const operation = await planFile({
      path: target,
      relativePath: manifestPath,
      content,
      scope,
      ownership: "generated",
      recordedHash: adoptedHash,
      force: input.force,
    });
    operations.push(operation);
    const hash = operation.action === "skip-drift" && prior?.sha256 ? prior.sha256 : sha256(content);
    if (operation.action !== "conflict") installations.push({ owner: "agent-tool", tool_id: toolId, source, target: { scope, path: manifestPath, executable: false }, sha256: hash });
  }

  function relativeProject(target: string): string { return targetPath(path.relative(input.projectRoot, target)); }
}

export function selectSkillWriters(toolIds: readonly string[], delivery: DeliveryMode): string[] {
  const selected = [...new Set(toolIds.map(resolveToolIdAlias))];
  const candidates = selected.filter((id) => {
    const tool = getTool(id);
    return Boolean(tool && (tool.skillsDir || tool.globalSkillsDir) && (delivery !== "commands" || id === "codex"));
  });
  if (candidates.includes("codex") && candidates.includes("agents")) return candidates.filter((id) => id !== "agents");
  return candidates;
}

async function existingFileHash(target: string): Promise<string | undefined> {
  try {
    const info = await lstat(target);
    if (!info.isFile() || info.isSymbolicLink()) return undefined;
    return sha256(await readFile(target));
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "ENOENT" ? undefined : undefined;
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

function targetPath(value: string): string { return value.split(path.sep).join("/"); }
