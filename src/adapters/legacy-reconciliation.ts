import { lstat, readdir, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";

import type { Diagnostic } from "../core/validation/types.js";
import { hashPath, sha256, type PlannedWrite } from "../core/workspace/write-plan.js";
import { assertPathWithinRoot } from "../core/workspace/path-boundary.js";
import { validateManagedTarget } from "./managed-target.js";
import { COMMAND_WRAPPER_CONTENTS, renderCommand } from "./command-renderer.js";
import type { ManagedInstallation } from "./installations.js";
import { getTool, toolSkillsRoot, type DeliveryMode } from "./tools.js";

export interface LegacyReconciliationPlan {
  operations: PlannedWrite[];
  diagnostics: Diagnostic[];
}

export async function planLegacyToolReconciliation(input: {
  projectRoot: string;
  selectedToolIds: readonly string[];
  reconciledToolIds?: readonly string[];
  delivery?: DeliveryMode;
  existingInstallations?: readonly ManagedInstallation[];
  desiredInstallations: readonly ManagedInstallation[];
  plannedOperations: readonly PlannedWrite[];
  operation: "init" | "update";
  globalCleanupAuthorized: boolean;
}): Promise<LegacyReconciliationPlan> {
  const operations: PlannedWrite[] = [];
  const diagnostics: Diagnostic[] = [];
  const desiredHashes = new Map<string, string>();
  for (const installation of input.existingInstallations ?? []) {
    const target = await validateManagedTarget(input.projectRoot, installation);
    if (installation.owner !== "agent-tool" || installation.target.scope !== "project" || !installation.sha256) continue;
    desiredHashes.set(target.path, installation.sha256);
  }
  for (const item of input.plannedOperations) {
    if (item.nextHash) desiredHashes.set(path.resolve(item.path), item.nextHash);
  }
  const selected = new Set(input.selectedToolIds);
  const reconciled = new Set(input.reconciledToolIds ?? input.selectedToolIds);

  for (const toolId of reconciled) {
    const tool = getTool(toolId);
    if (!tool?.legacySkillsDirs?.length || (!tool.skillsDir && !tool.globalSkillsDir)) continue;
    const currentRoot = toolSkillsRoot(tool, input.projectRoot).root;
    for (const legacyRoot of tool.legacySkillsDirs) {
      const legacySkillsRoot = path.join(input.projectRoot, legacyRoot, "skills");
      await assertPathWithinRoot(input.projectRoot, legacySkillsRoot);
      for (const entry of await directories(legacySkillsRoot)) {
        const legacySkill = path.join(legacySkillsRoot, entry);
        const currentSkill = path.join(currentRoot, entry);
        await assertPathWithinRoot(input.projectRoot, legacySkill);
        const comparison = await compareKnownTree(legacySkill, currentSkill, desiredHashes);
        if (comparison === "unknown") continue;
        if (comparison === "drift") {
          diagnostics.push({
            severity: "warning",
            code: "legacy_skill_drift",
            message: "A legacy ResearchSpec Skill contains local or unrecognized changes and was preserved.",
            path: legacySkill,
            blocking: false,
            details: { tool_id: tool.id, replacement: currentSkill },
          });
          continue;
        }
        operations.push({
          action: "remove-owned",
          boundaryRoot: input.projectRoot,
          path: legacySkill,
          relativePath: posix(path.relative(input.projectRoot, legacySkill)),
          scope: "project",
          ownership: "generated",
          previousHash: await hashPath(legacySkill),
          reason: `remove replaced ${tool.id} legacy Skill tree`,
        });
      }
    }
  }

  for (const toolId of reconciled) {
    const tool = getTool(toolId);
    if (!tool?.command || (input.delivery !== "skills" && selected.has(toolId))) continue;
    for (const content of COMMAND_WRAPPER_CONTENTS) {
      const target = tool.command.path(content.id, input.projectRoot);
      await assertPathWithinRoot(input.projectRoot, target);
      if (input.plannedOperations.some((item) => item.path === target && item.action === "remove-owned")) continue;
      const exact = await exactFile(target, renderCommand(tool, content));
      if (exact === "drift") {
        diagnostics.push({ severity: "warning", code: "generated_file_drift", message: "An obsolete ResearchSpec command wrapper has local modifications and was preserved.", path: target, blocking: false, details: { tool_id: tool.id } });
      } else if (exact === "clean") {
        operations.push({ action: "remove-owned", boundaryRoot: input.projectRoot, path: target, relativePath: posix(path.relative(input.projectRoot, target)), scope: "project", ownership: "generated", previousHash: await hashPath(target), reason: "remove obsolete ResearchSpec command wrapper" });
      }
    }
  }

  if (selected.has("codex") && hasCodexReplacement(input.desiredInstallations)) {
    const codexRoot = path.dirname(codexPromptDir());
    await assertPathWithinRoot(codexRoot, codexPromptDir());
    const promptCandidates = await legacyCodexPrompts();
    if (promptCandidates.length && !input.globalCleanupAuthorized && input.operation === "update") {
      diagnostics.push({
        severity: "info",
        code: "legacy_global_cleanup_deferred",
        message: "Legacy Codex prompt cleanup was deferred until an interactive confirmation or --force.",
        blocking: false,
        details: { count: promptCandidates.length, directory: codexPromptDir() },
      });
    } else {
      for (const promptPath of promptCandidates) {
        await assertPathWithinRoot(codexRoot, promptPath);
        const info = await lstat(promptPath);
        if (!info.isFile() || info.isSymbolicLink()) {
          diagnostics.push({ severity: "warning", code: "legacy_prompt_preserved", message: "A legacy Codex prompt path is not a regular file and was preserved.", path: promptPath, blocking: false });
          continue;
        }
        operations.push({
          action: "remove-owned",
          boundaryRoot: codexRoot,
          path: promptPath,
          scope: "shared-global",
          ownership: "generated",
          previousHash: sha256(await readFile(promptPath)),
          reason: "remove allowlisted legacy Codex prompt after Skill replacement",
        });
      }
    }
  }

  return { operations, diagnostics };
}

function hasCodexReplacement(installations: readonly ManagedInstallation[]): boolean {
  return installations.some((item) => item.tool_id === "codex" && item.target.scope === "project" && item.source.kind === "companion-skill" && item.source.skill_id === "researchspec-navigate");
}

async function compareKnownTree(legacyRoot: string, currentRoot: string, desiredHashes: ReadonlyMap<string, string>): Promise<"clean" | "drift" | "unknown"> {
  const files = await walkLegacyFiles(legacyRoot);
  if (files === undefined || files.length === 0) return "unknown";
  let recognized = false;
  for (const file of files) {
    const relative = path.relative(legacyRoot, file.path);
    const expected = desiredHashes.get(path.resolve(currentRoot, relative));
    if (!expected) return "unknown";
    recognized = true;
    if (file.hash !== expected) return "drift";
  }
  return recognized ? "clean" : "unknown";
}

async function walkLegacyFiles(root: string): Promise<Array<{ path: string; hash: string }> | undefined> {
  try {
    const info = await lstat(root);
    if (!info.isDirectory() || info.isSymbolicLink()) return undefined;
    const result: Array<{ path: string; hash: string }> = [];
    for (const entry of await readdir(root, { withFileTypes: true })) {
      const target = path.join(root, entry.name);
      if (entry.isSymbolicLink()) return undefined;
      if (entry.isDirectory()) {
        const nested = await walkLegacyFiles(target);
        if (!nested) return undefined;
        result.push(...nested);
      } else if (entry.isFile()) result.push({ path: target, hash: sha256(await readFile(target)) });
      else return undefined;
    }
    return result;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function exactFile(target: string, expected: string): Promise<"clean" | "drift" | undefined> {
  try {
    const info = await lstat(target);
    if (!info.isFile() || info.isSymbolicLink()) return undefined;
    return sha256(await readFile(target)) === sha256(expected) ? "clean" : "drift";
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function directories(root: string): Promise<string[]> {
  try {
    return (await readdir(root, { withFileTypes: true })).filter((entry) => entry.isDirectory() && !entry.isSymbolicLink()).map((entry) => entry.name).sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

function codexPromptDir(): string {
  return path.join(path.resolve(process.env.CODEX_HOME ?? path.join(homedir(), ".codex")), "prompts");
}

async function legacyCodexPrompts(): Promise<string[]> {
  const allowed = new Set(COMMAND_WRAPPER_CONTENTS.map((item) => `researchspec-${item.id}.md`));
  try {
    return (await readdir(codexPromptDir(), { withFileTypes: true }))
      .filter((entry) => allowed.has(entry.name))
      .map((entry) => path.join(codexPromptDir(), entry.name))
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

function posix(value: string): string { return value.split(path.sep).join("/"); }
