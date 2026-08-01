import path from "node:path";

import { ACADEMIC_PIPELINE_PROFILE, ACADEMIC_PIPELINE_PROFILE_TEXT } from "../../arsu-converter/workflow/academic-pipeline.js";
import { inspectLiteratureAdapters } from "../../literature-adapters/inspect.js";
import { loadCurrentWorkspaceIndex } from "../runtime/workspace-index.js";
import { sha256 } from "../workspace/write-plan.js";
import type { CurrentCheckResult, CurrentCheckTarget, Diagnostic } from "./types.js";

export async function runCurrentWorkspaceChecks(workspace: string, target: CurrentCheckTarget = "all", strict = false): Promise<CurrentCheckResult> {
  const index = await loadCurrentWorkspaceIndex(workspace);
  const diagnostics = [...index.diagnostics, ...profileOwnershipDiagnostics(index)];
  if (target === "all" || target === "literature-adapters") {
    const inspection = await inspectLiteratureAdapters(index);
    diagnostics.push(...inspection.diagnostics);
  }
  const filtered = diagnostics.filter((item) => matchesTarget(workspace, item, target));
  const ok = filtered.every((item) => !item.blocking && (!strict || item.severity !== "warning"));
  return { ok, workspace, target, diagnostics: filtered };
}

function profileOwnershipDiagnostics(index: Awaited<ReturnType<typeof loadCurrentWorkspaceIndex>>): Diagnostic[] {
  const targetPath = path.relative(index.projectRoot, path.join(index.workspace, "profiles/academic-pipeline.yaml")).split(path.sep).join("/");
  const records = index.manifest.installations.filter((item) => item.owner === "framework" && item.target.scope === "project" && item.target.path === targetPath);
  if (records.length !== 1) return [problem("framework_profile_ownership_invalid", "The project profile requires exactly one manifest ownership record.", path.join(index.workspace, "tool-installation-manifest.json"))];
  const record = records[0];
  if (record.source.kind !== "framework-profile" || record.source.profile_id !== ACADEMIC_PIPELINE_PROFILE.profile_id || record.source.profile_version !== ACADEMIC_PIPELINE_PROFILE.profile_version) {
    return [problem("framework_profile_source_mismatch", "The project profile manifest source does not match the packaged profile.", path.join(index.workspace, "tool-installation-manifest.json"))];
  }
  const packagedHash = sha256(ACADEMIC_PIPELINE_PROFILE_TEXT);
  if (record.sha256 !== packagedHash) return [problem("framework_profile_manifest_drift", "The recorded profile hash does not match the packaged profile.", path.join(index.workspace, "tool-installation-manifest.json"))];
  const file = index.files.get("profiles/academic-pipeline.yaml");
  if (file && file.hash !== record.sha256) return [problem("framework_profile_file_drift", "The projected profile differs from its manifest-owned source.", file.absolutePath)];
  return [];
}

function matchesTarget(workspace: string, diagnostic: Diagnostic, target: CurrentCheckTarget): boolean {
  if (target === "all" || !diagnostic.path) return true;
  const relative = path.relative(workspace, diagnostic.path).split(path.sep).join("/");
  if (target === "specs") return relative.startsWith("specs/") || diagnostic.code.startsWith("claim_") || diagnostic.code.startsWith("section_");
  if (target === "profiles") return relative.startsWith("profiles/") || diagnostic.code.startsWith("framework_profile_");
  if (target === "subflows") return relative.startsWith("subflows/") && !relative.endsWith("handoff.md");
  if (target === "handoffs") return relative.endsWith("handoff.md") || diagnostic.code.startsWith("handoff_");
  if (target === "changes") return relative.startsWith("changes/") || diagnostic.code.startsWith("change_");
  if (target === "tools") return relative === "config.yaml" || relative === "tool-installation-manifest.json" || diagnostic.code.startsWith("generated_file_");
  if (target === "plugins") return relative === "config.yaml" || relative === "tool-installation-manifest.json" || diagnostic.code.startsWith("plugin_");
  if (target === "literature-adapters") return relative === "tool-installation-manifest.json" || diagnostic.code.startsWith("literature_adapter_");
  return true;
}

function problem(code: string, message: string, filePath: string): Diagnostic {
  return { severity: "error", code, message, path: filePath, blocking: true };
}
