import { readFile } from "node:fs/promises";
import path from "node:path";

import { getTool } from "../adapters/tools.js";
import { sha256 } from "../core/workspace/write-plan.js";
import type { WorkspaceSnapshot } from "../core/workspace/snapshot.js";
import {
  filesForSkill,
  pluginSkillRoot,
  readPluginSkillEntry,
  resolveDomainSelection,
  type LoadedPluginRegistry,
} from "./registry.js";
import { resolutionSnapshots, selectedPluginIds } from "./status.js";
import { installationRecords, isDomainSkillInstallation } from "../adapters/installations.js";

export class PluginSkillInstructionsError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "PluginSkillInstructionsError";
  }
}

export async function buildPluginSkillInstructions(
  snapshot: WorkspaceSnapshot,
  loaded: LoadedPluginRegistry,
  skillId: string,
) {
  const registered = loaded.skills.get(skillId);
  if (!registered) throw new PluginSkillInstructionsError("plugin_skill_not_found", `Plugin Skill not found: ${skillId}`);

  const selected = selectedPluginIds(snapshot.config);
  const resolution = resolveDomainSelection(loaded, selected);
  const unavailableSnapshots = resolutionSnapshots(snapshot.manifest.plugin_resolutions)
    .filter((item) => resolution.unavailableDomainIds.includes(item.domain_id) && item.resolved_skill_ids.includes(skillId));
  if (unavailableSnapshots.length) {
    throw new PluginSkillInstructionsError(
      "plugin_skill_unavailable",
      `Plugin Skill is retained by unavailable domain recovery evidence: ${skillId}`,
      { domain_ids: unavailableSnapshots.map((item) => item.domain_id) },
    );
  }
  if (!resolution.resolvedSkillIds.includes(skillId)) {
    throw new PluginSkillInstructionsError("plugin_skill_not_selected", `Plugin Skill is not in the selected domain closure: ${skillId}`);
  }

  const projectRoot = path.dirname(snapshot.workspace);
  const toolIds = strings(record(snapshot.config.agent_tools).selected);
  if (!toolIds.length) throw new PluginSkillInstructionsError("plugin_skill_unprojected", `Plugin Skill has no configured Agent tool projection: ${skillId}`);

  const expectedFiles = filesForSkill(loaded, skillId);
  const sourceRoot = pluginSkillRoot(loaded.root, registered.vendor.vendor_id, skillId);
  const sourceHashes = new Map<string, string>();
  for (const relativeAsset of expectedFiles) {
    try {
      sourceHashes.set(relativeAsset, sha256(await readFile(path.join(sourceRoot, relativeAsset))));
    } catch {
      throw new PluginSkillInstructionsError(
        "plugin_skill_source_drift",
        `Packaged Plugin Skill source is incomplete: ${skillId}`,
        { path: relativeAsset },
      );
    }
  }
  const installations = installationRecords(snapshot.manifest.installations).filter(isDomainSkillInstallation);
  const drift: Array<{ tool_id: string; path: string; reason: string }> = [];
  for (const toolId of toolIds) {
    const tool = getTool(toolId);
    if (!tool) {
      drift.push({ tool_id: toolId, path: "", reason: "unknown_tool" });
      continue;
    }
    for (const relativeAsset of expectedFiles) {
      const expectedPath = path.join(projectRoot, tool.skillsDir, "skills", skillId, relativeAsset);
      const expectedRelative = posix(path.relative(projectRoot, expectedPath));
      const installation = installations.find((item) =>
        item.tool_id === toolId
        && item.source.skill_id === skillId
        && item.target.path === expectedRelative
        && item.target.scope === "project");
      if (!installation) {
        drift.push({ tool_id: toolId, path: expectedRelative, reason: "manifest_record_missing" });
        continue;
      }
      if (installation.sha256 !== sourceHashes.get(relativeAsset)) {
        drift.push({ tool_id: toolId, path: expectedRelative, reason: "manifest_source_mismatch" });
        continue;
      }
      try {
        const bytes = await readFile(expectedPath);
        if (sha256(bytes) !== installation.sha256) drift.push({ tool_id: toolId, path: expectedRelative, reason: "hash_drift" });
      } catch {
        drift.push({ tool_id: toolId, path: expectedRelative, reason: "file_missing" });
      }
    }
  }
  if (drift.length) {
    throw new PluginSkillInstructionsError(
      "plugin_skill_projection_drift",
      `Plugin Skill projection is incomplete or drifted: ${skillId}`,
      { drift },
    );
  }

  const entry = await readPluginSkillEntry(path.join(sourceRoot, "SKILL.md"));
  const domainIds = resolution.availableDomainIds.filter((domainId) =>
    resolveDomainSelection(loaded, [domainId]).resolvedSkillIds.includes(skillId));
  return {
    skill_id: skillId,
    description: entry.metadata.description,
    entry_sha256: entry.metadata.entrySha256,
    instructions: entry.text,
    resource_paths: expectedFiles.filter((item) => item !== "SKILL.md"),
    domain_ids: domainIds,
    projected_tools: toolIds,
    authority: {
      kind: "advisory-semantic-helper",
      workflow_binding: "none",
      producer_unchanged: true,
      executes_resources: false,
      forbidden_writes: [
        "researchspec/runs/current/state.yaml",
        "researchspec/runs/current/artifact-registry.json",
        "researchspec/runs/current/decision-ledger.jsonl",
        "researchspec/runs/current/gate-ledger.jsonl",
        "researchspec/runs/current/receipts/**",
      ],
    },
  };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function posix(value: string): string {
  return value.split(path.sep).join("/");
}
