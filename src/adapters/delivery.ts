import path from "node:path";

import type { Diagnostic } from "../core/validation/types.js";
import { planFile, type PlannedWrite, sha256 } from "../core/workspace/write-plan.js";
import { COMPANION_INTENTS, renderCompanionSkill } from "./companion/index.js";
import { COMMAND_WRAPPER_CONTENTS, renderCommand } from "./command-renderer.js";
import { getTool, resolveToolIdAlias, sharedSkillTarget, toolSkillsRoot, type DeliveryMode, type ToolDefinition } from "./tools.js";
import { MIT_LICENSE_TEXT } from "../licensing.js";
import type { LoadedPluginRegistry } from "../plugins/registry.js";
import { installationKey, type ManagedInstallation, type ManagedInstallationSource } from "./installations.js";
import { resolveManagedTarget, validateManagedTarget } from "./managed-target.js";

export interface DeliveryPlan {
  operations: PlannedWrite[];
  installations: ManagedInstallation[];
  diagnostics: Diagnostic[];
  skillToolIds: string[];
  commandToolIds: string[];
}

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
  for (const installation of input.existingInstallations) await validateManagedTarget(input.projectRoot, installation);
  const operations: PlannedWrite[] = [];
  const installations: ManagedInstallation[] = [];
  const diagnostics: Diagnostic[] = [];
  const recorded = new Map(input.existingInstallations.map((item) => [installationKey(item), item]));
  const selected = [...new Set(input.toolIds.map(resolveToolIdAlias))];
  const delivery = input.delivery ?? "both";
  const skillToolIds = selectSkillWriters(selected, delivery);
  const commandToolIds = selected.filter((id) => Boolean(getTool(id)?.command));
  const navigate = COMPANION_INTENTS.find((intent) => intent.id === "navigate");
  if (!navigate) throw new Error("Navigate Companion is unavailable.");

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
        for (const intent of [navigate]) {
          const skillRoot = path.join(root.root, intent.skillId);
          await addSkill(
            path.join(skillRoot, "SKILL.md"),
            renderCompanionSkill(intent),
            { kind: "companion-skill", skill_id: intent.skillId },
            tool,
          );
          await addSkill(path.join(skillRoot, "LICENSE"), MIT_LICENSE_TEXT, { kind: "companion-skill", skill_id: intent.skillId }, tool);
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

  async function addSkill(target: string, content: string | Uint8Array, source: ManagedInstallationSource, tool: ToolDefinition): Promise<void> {
    const root = toolSkillsRoot(tool, input.projectRoot);
    await addPlanned(target, root.scope === "project" ? relativeProject(target) : target, root.scope, content, source, tool.id);
  }

  async function addPlanned(target: string, manifestPath: string, scope: "project" | "shared-global", content: string | Uint8Array, source: ManagedInstallationSource, toolId: string): Promise<void> {
    const prior = recorded.get(`${scope}:${manifestPath}`);
    const installation: ManagedInstallation = { owner: "agent-tool", tool_id: toolId, source, target: { scope, path: manifestPath, executable: false }, sha256: sha256(content) };
    const operation = await planFile({
      boundaryRoot: resolveManagedTarget(input.projectRoot, installation).boundaryRoot,
      path: target,
      relativePath: manifestPath,
      content,
      scope,
      ownership: "generated",
      recordedHash: prior?.sha256,
      requireRecordedOwnership: prior === undefined,
      force: input.force,
    });
    operations.push(operation);
    const hash = operation.action === "skip-drift" && prior?.sha256 ? prior.sha256 : sha256(content);
    if (operation.action !== "conflict") installations.push({ ...installation, sha256: hash });
  }

  function relativeProject(target: string): string { return targetPath(path.relative(input.projectRoot, target)); }
}

export function selectSkillWriters(toolIds: readonly string[], delivery: DeliveryMode): string[] {
  const selected = [...new Set(toolIds.map(resolveToolIdAlias))];
  const candidates = selected.filter((id) => {
    const tool = getTool(id);
    return Boolean(tool && (tool.skillsDir || tool.globalSkillsDir) && (delivery !== "commands" || !tool.command));
  });
  if (candidates.includes("codex") && candidates.includes("agents")) return candidates.filter((id) => id !== "agents");
  return candidates;
}

function targetPath(value: string): string { return value.split(path.sep).join("/"); }
