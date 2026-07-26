import { lstat, readFile } from "node:fs/promises";
import path from "node:path";

import {
  ToolInstallationManifestSchema,
  installationKey,
  type LiteratureAdapterResolution,
  type ManagedInstallation,
} from "../adapters/installations.js";
import { getTool } from "../adapters/tools.js";
import type { Diagnostic } from "../core/validation/types.js";
import type { WorkspaceSnapshot } from "../core/workspace/snapshot.js";
import { sha256 } from "../core/workspace/write-plan.js";
import { LITERATURE_ADAPTER_PACKAGE_ROOT, readLiteratureAdapterProfile, readLiteratureAdapterSkillAssets } from "./assets.js";
import { LITERATURE_ADAPTER_CATALOG } from "./catalog.js";
import { resolveLiteratureAdapterPlatform } from "./platform.js";

export type LiteratureAdapterState = "installed" | "degraded" | "unsupported" | "missing" | "conflict";

export interface LiteratureAdapterInspection {
  adapter_id: string;
  install_policy: "fixed";
  release_set_id: string;
  state: LiteratureAdapterState;
  connection_state: "unchecked";
  target_platform: string;
  runtime: {
    supported: boolean;
    installed_path: string | null;
    sha256: string | null;
  };
  skills: {
    skill_ids: string[];
    projection_state: "complete" | "deferred" | "incomplete";
    expected_tool_ids: string[];
    projected_tool_ids: string[];
    missing_tool_ids: string[];
  };
  diagnostics: Diagnostic[];
}

export interface LiteratureAdapterInspectionResult {
  adapters: LiteratureAdapterInspection[];
  diagnostics: Diagnostic[];
}

export async function inspectLiteratureAdapters(
  snapshot: WorkspaceSnapshot,
  platform: NodeJS.Platform = process.platform,
  architecture: NodeJS.Architecture = process.arch,
): Promise<LiteratureAdapterInspectionResult> {
  const parsedManifest = ToolInstallationManifestSchema.safeParse(snapshot.manifest);
  const selectedToolIds = stringArray(record(snapshot.config.agent_tools).selected);
  const projectRoot = path.dirname(snapshot.workspace);
  const adapters: LiteratureAdapterInspection[] = [];

  for (const adapter of LITERATURE_ADAPTER_CATALOG) {
    const diagnostics: Diagnostic[] = [];
    const platformResolution = resolveLiteratureAdapterPlatform(adapter, platform, architecture);
    const targetPlatform = platformResolution.platform;
    let conflict = false;
    let missingCore = false;
    let degraded = false;
    let projectedToolIds: string[] = [];
    let projectionState: LiteratureAdapterInspection["skills"]["projection_state"] = selectedToolIds.length ? "complete" : "deferred";
    let resolution: LiteratureAdapterResolution | undefined;

    if (!parsedManifest.success) {
      conflict = true;
      diagnostics.push(problem("literature_adapter_manifest_invalid", "The installation manifest is not the current strict schema v1 structure.", path.join(snapshot.workspace, "tool-installation-manifest.json"), true, parsedManifest.error.issues));
    } else {
      const matches = parsedManifest.data.literature_adapter_resolutions.filter((item) => item.adapter_id === adapter.adapter_id);
      if (matches.length === 0) {
        missingCore = true;
        diagnostics.push(problem("literature_adapter_resolution_missing", "The fixed literature adapter has no manifest resolution.", path.join(snapshot.workspace, "tool-installation-manifest.json"), true));
      } else if (matches.length > 1) {
        conflict = true;
        diagnostics.push(problem("literature_adapter_resolution_conflict", "The fixed literature adapter has duplicate manifest resolutions.", path.join(snapshot.workspace, "tool-installation-manifest.json"), true));
      } else {
        resolution = matches[0];
        projectedToolIds = resolution.projected_tool_ids;
        projectionState = resolution.projection_state;
        if (!resolutionMatchesCatalog(resolution, adapter, targetPlatform, platformResolution.supported)) {
          conflict = true;
          diagnostics.push(problem("literature_adapter_resolution_conflict", "The literature adapter resolution does not match its fixed release-set identity or target platform.", path.join(snapshot.workspace, "tool-installation-manifest.json"), true));
        }
      }
    }

    const installations = parsedManifest.success
      ? parsedManifest.data.installations.filter((item) => item.source.kind === "literature-adapter" && item.source.adapter_id === adapter.adapter_id)
      : [];
    const byPath = new Map<string, ManagedInstallation[]>();
    const expectedInstallationKeys = new Set<string>();
    for (const installation of installations) {
      const key = installationKey(installation);
      byPath.set(key, [...(byPath.get(key) ?? []), installation]);
      if (installation.source.kind !== "literature-adapter" || installation.source.release_set_id !== adapter.identity.release_set_id) conflict = true;
    }

    const profileContent = await readLiteratureAdapterProfile(adapter);
    expectedInstallationKeys.add("project:.zotero-bridge/profile.template.json");
    const profileResult = await inspectExpected({
      projectRoot,
      targetPath: ".zotero-bridge/profile.template.json",
      expectedHash: sha256(profileContent),
      expectedExecutable: false,
      byPath,
      sourceMatches: (item) => item.owner === "literature-adapter" && item.source.kind === "literature-adapter" && item.source.release_set_id === adapter.identity.release_set_id && item.source.component === "profile-template",
      missingCode: "literature_adapter_file_missing",
    });
    diagnostics.push(...profileResult.diagnostics);
    conflict ||= profileResult.conflict;
    missingCore ||= profileResult.missing;
    degraded ||= profileResult.degraded;

    let installedPath: string | null = null;
    let runtimeSha256: string | null = null;
    if (platformResolution.supported) {
      const runtime = platformResolution.runtime;
      installedPath = posix(path.join(".zotero-bridge", "bin", runtime.binary));
      expectedInstallationKeys.add(`project:${installedPath}`);
      runtimeSha256 = runtime.sha256;
      const packagedRuntime = await readFile(path.join(LITERATURE_ADAPTER_PACKAGE_ROOT, runtime.source_path));
      if (packagedRuntime.byteLength !== runtime.bytes || sha256(packagedRuntime) !== runtime.sha256) {
        conflict = true;
        diagnostics.push(problem("literature_adapter_catalog_asset_drift", "The packaged runtime no longer matches the fixed catalog.", path.join(LITERATURE_ADAPTER_PACKAGE_ROOT, runtime.source_path), true));
      }
      const runtimeResult = await inspectExpected({
        projectRoot,
        targetPath: installedPath,
        expectedHash: runtime.sha256,
        expectedExecutable: true,
        byPath,
        sourceMatches: (item) => item.owner === "literature-adapter" && item.source.kind === "literature-adapter" && item.source.release_set_id === adapter.identity.release_set_id && item.source.component === "runtime" && item.source.platform === platformResolution.platform,
        missingCode: "literature_adapter_runtime_missing",
        checkPosixMode: platform !== "win32",
      });
      diagnostics.push(...runtimeResult.diagnostics);
      conflict ||= runtimeResult.conflict;
      missingCore ||= runtimeResult.missing;
      degraded ||= runtimeResult.degraded;
      if (platformResolution.platform === "win32-x64") {
        expectedInstallationKeys.add("project:.zotero-bridge/bin/zotero-bridge.cmd");
        const shimResult = await inspectExpected({
          projectRoot,
          targetPath: ".zotero-bridge/bin/zotero-bridge.cmd",
          expectedHash: sha256("@echo off\r\n\"%~dp0zotero-bridge.exe\" %*\r\n"),
          expectedExecutable: true,
          byPath,
          sourceMatches: (item) => item.owner === "literature-adapter" && item.source.kind === "literature-adapter" && item.source.release_set_id === adapter.identity.release_set_id && item.source.component === "windows-shim" && item.source.platform === platformResolution.platform,
          missingCode: "literature_adapter_runtime_missing",
        });
        diagnostics.push(...shimResult.diagnostics);
        conflict ||= shimResult.conflict;
        missingCore ||= shimResult.missing;
        degraded ||= shimResult.degraded;
      }
    } else {
      diagnostics.push({ severity: "warning", code: "literature_adapter_platform_unsupported", message: "No fixed Zotero literature adapter runtime is available for this platform.", blocking: false, details: { adapter_id: adapter.adapter_id, target_platform: targetPlatform } });
    }

    const skillAssets = await readLiteratureAdapterSkillAssets(adapter);
    const completeTools: string[] = [];
    for (const toolId of selectedToolIds) {
      const tool = getTool(toolId);
      if (!tool) continue;
      let complete = true;
      for (const asset of skillAssets) {
        const targetPath = posix(path.join(tool.skillsDir, "skills", asset.skillId, asset.relativePath));
        expectedInstallationKeys.add(`project:${targetPath}`);
        const result = await inspectExpected({
          projectRoot,
          targetPath,
          expectedHash: sha256(asset.content),
          expectedExecutable: asset.executable,
          byPath,
          sourceMatches: (item) => item.owner === "agent-tool" && item.tool_id === toolId && item.source.kind === "literature-adapter" && item.source.release_set_id === adapter.identity.release_set_id && item.source.component === "skill" && item.source.skill_id === asset.skillId,
          missingCode: "literature_adapter_projection_missing",
          checkPosixMode: platform !== "win32" && asset.executable,
          details: { tool_id: toolId, skill_id: asset.skillId },
        });
        diagnostics.push(...result.diagnostics);
        conflict ||= result.conflict;
        degraded ||= result.degraded || result.missing;
        complete &&= !result.conflict && !result.degraded && !result.missing;
      }
      if (complete) completeTools.push(toolId);
    }
    const missingToolIds = selectedToolIds.filter((toolId) => !completeTools.includes(toolId));
    if (selectedToolIds.length === 0) {
      if (resolution && (resolution.projection_state !== "deferred" || resolution.projected_tool_ids.length !== 0)) conflict = true;
      projectionState = "deferred";
      diagnostics.push({ severity: "info", code: "literature_adapter_projection_deferred", message: "The fixed adapter runtime is installed, but no Agent tool is selected for Skill projection.", blocking: false, details: { adapter_id: adapter.adapter_id } });
    } else if (missingToolIds.length || !sameStrings(projectedToolIds, completeTools) || resolution?.projection_state !== "complete") {
      projectionState = "incomplete";
      degraded = true;
      diagnostics.push(problem("literature_adapter_projection_incomplete", "Literature adapter Skill projection is incomplete for the selected Agent tools.", path.join(snapshot.workspace, "tool-installation-manifest.json"), true, { expected_tool_ids: selectedToolIds, complete_tool_ids: completeTools }));
    } else {
      projectionState = "complete";
    }

    for (const [key, records] of byPath) {
      if (expectedInstallationKeys.has(key)) continue;
      conflict = true;
      diagnostics.push(problem("literature_adapter_installation_conflict", "The manifest contains a stale or unexpected literature adapter installation.", path.resolve(projectRoot, records[0]?.target.path ?? key), true));
    }

    const state: LiteratureAdapterState = conflict
      ? "conflict"
      : !platformResolution.supported
        ? "unsupported"
        : missingCore
          ? "missing"
          : degraded
            ? "degraded"
            : "installed";
    adapters.push({
      adapter_id: adapter.adapter_id,
      install_policy: "fixed",
      release_set_id: adapter.identity.release_set_id,
      state,
      connection_state: "unchecked",
      target_platform: targetPlatform,
      runtime: { supported: platformResolution.supported, installed_path: installedPath, sha256: runtimeSha256 },
      skills: {
        skill_ids: adapter.skills.map((skill) => skill.skill_id),
        projection_state: projectionState,
        expected_tool_ids: selectedToolIds,
        projected_tool_ids: completeTools,
        missing_tool_ids: missingToolIds,
      },
      diagnostics,
    });
  }

  return { adapters, diagnostics: adapters.flatMap((adapter) => adapter.diagnostics) };
}

async function inspectExpected(input: {
  projectRoot: string;
  targetPath: string;
  expectedHash: string;
  expectedExecutable: boolean;
  byPath: Map<string, ManagedInstallation[]>;
  sourceMatches: (installation: ManagedInstallation) => boolean;
  missingCode: string;
  checkPosixMode?: boolean;
  details?: unknown;
}): Promise<{ missing: boolean; degraded: boolean; conflict: boolean; diagnostics: Diagnostic[] }> {
  const diagnostics: Diagnostic[] = [];
  const absolutePath = path.resolve(input.projectRoot, input.targetPath);
  const records = input.byPath.get(`project:${input.targetPath}`) ?? [];
  let info;
  try { info = await lstat(absolutePath); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  if (records.length === 0) {
    if (info) {
      diagnostics.push(problem("literature_adapter_path_conflict", "An expected adapter target exists but is not owned by the manifest.", absolutePath, true, input.details));
      return { missing: false, degraded: false, conflict: true, diagnostics };
    }
    diagnostics.push(problem(input.missingCode, "An expected manifest-owned literature adapter file is missing.", absolutePath, true, input.details));
    return { missing: true, degraded: false, conflict: false, diagnostics };
  }
  const installation = records[0];
  if (records.length !== 1 || !installation || !input.sourceMatches(installation) || installation.sha256 !== input.expectedHash || installation.target.executable !== input.expectedExecutable) {
    diagnostics.push(problem("literature_adapter_installation_conflict", "The adapter installation record does not match the fixed source identity.", absolutePath, true, input.details));
    return { missing: false, degraded: false, conflict: true, diagnostics };
  }
  if (!info) {
    diagnostics.push(problem(input.missingCode, "An expected manifest-owned literature adapter file is missing.", absolutePath, true, input.details));
    return { missing: true, degraded: false, conflict: false, diagnostics };
  }
  if (!info.isFile() || info.isSymbolicLink()) {
    diagnostics.push(problem("literature_adapter_path_conflict", "A manifest-owned adapter target is not a regular file.", absolutePath, true, input.details));
    return { missing: false, degraded: false, conflict: true, diagnostics };
  }
  if (sha256(await readFile(absolutePath)) !== input.expectedHash) {
    diagnostics.push(problem("literature_adapter_file_drift", "A manifest-owned literature adapter file has changed.", absolutePath, true, input.details));
    return { missing: false, degraded: true, conflict: false, diagnostics };
  }
  if (input.checkPosixMode && (info.mode & 0o111) === 0) {
    diagnostics.push(problem("literature_adapter_not_executable", "A POSIX literature adapter executable has no executable bit.", absolutePath, true, input.details));
    return { missing: false, degraded: true, conflict: false, diagnostics };
  }
  return { missing: false, degraded: false, conflict: false, diagnostics };
}

function resolutionMatchesCatalog(
  resolution: LiteratureAdapterResolution,
  adapter: typeof LITERATURE_ADAPTER_CATALOG[number],
  targetPlatform: string,
  runtimeSupported: boolean,
): boolean {
  return resolution.release_set_id === adapter.identity.release_set_id
    && resolution.bundle_version === adapter.versions.bundle
    && resolution.cli_version === adapter.versions.cli
    && sameOrderedStrings(resolution.skill_ids, adapter.skills.map((skill) => skill.skill_id))
    && adapter.skills.every((skill) => resolution.skill_versions[skill.skill_id] === skill.version)
    && Object.keys(resolution.skill_versions).length === adapter.skills.length
    && resolution.target_platform === targetPlatform
    && (runtimeSupported
      ? resolution.runtime_asset?.protocol === adapter.identity.protocol
        && resolution.runtime_asset.cli_schema === adapter.identity.cli_schema
        && resolution.runtime_asset.build_fingerprint === adapter.identity.build_fingerprint
        && resolution.runtime_asset.command_catalog_checksum === adapter.identity.command_catalog_checksum
        && resolution.runtime_asset.binary_aggregate_sha256 === adapter.identity.binary_aggregate_sha256
      : resolution.runtime_asset === null);
}

function problem(code: string, message: string, filePath: string, blocking: boolean, details?: unknown): Diagnostic {
  return { severity: "error", code, message, path: filePath, blocking, ...(details === undefined ? {} : { details }) };
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return [...left].sort().join("\0") === [...right].sort().join("\0");
}

function sameOrderedStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function posix(value: string): string {
  return value.split(path.sep).join("/");
}
