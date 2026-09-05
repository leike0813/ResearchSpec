import { lstat, readFile } from "node:fs/promises";
import path from "node:path";

import {
  installationKey,
  type LiteratureAdapterResolution,
  type ManagedInstallation,
  type ManagedInstallationSource,
} from "../adapters/installations.js";
import { getTool, toolSkillsRoot } from "../adapters/tools.js";
import { managedTargetDiagnostic, resolveManagedTarget, validateManagedTarget } from "../adapters/managed-target.js";
import type { Diagnostic } from "../core/validation/types.js";
import { planFile, sha256, type PlannedWrite } from "../core/workspace/write-plan.js";
import { desiredLiteratureAdapters } from "./catalog.js";
import { LITERATURE_ADAPTER_PACKAGE_ROOT, readLiteratureAdapterProfile, readLiteratureAdapterSkillAssets } from "./assets.js";
import { resolveLiteratureAdapterPlatform } from "./platform.js";

export interface LiteratureAdapterDeliveryPlan {
  operations: PlannedWrite[];
  installations: ManagedInstallation[];
  resolutions: LiteratureAdapterResolution[];
  diagnostics: Diagnostic[];
}

export async function reconcileLiteratureAdapterInstallations(input: {
  projectRoot: string;
  existingInstallations: readonly ManagedInstallation[];
  desiredInstallations: readonly ManagedInstallation[];
}): Promise<{ operations: PlannedWrite[]; retainedInstallations: ManagedInstallation[]; diagnostics: Diagnostic[] }> {
  const operations: PlannedWrite[] = [];
  const retainedInstallations: ManagedInstallation[] = [];
  const diagnostics: Diagnostic[] = [];
  const desiredKeys = new Set(input.desiredInstallations.map(installationKey));

  for (const installation of input.existingInstallations) {
    let resolved;
    try { resolved = await validateManagedTarget(input.projectRoot, installation); }
    catch (error) {
      retainedInstallations.push(installation);
      diagnostics.push(managedTargetDiagnostic(installation, error));
      continue;
    }
    if (desiredKeys.has(installationKey(installation))) continue;
    if (installation.source.kind !== "literature-adapter") {
      retainedInstallations.push(installation);
      continue;
    }
    if (installation.target.scope !== "project") {
      retainedInstallations.push(installation);
      continue;
    }
    const target = resolved.path;
    let info;
    try {
      info = await lstat(target);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") continue;
      throw error;
    }
    if (!info.isFile() || info.isSymbolicLink()) {
      retainedInstallations.push(installation);
      diagnostics.push({
        severity: "warning",
        code: "literature_adapter_path_conflict",
        message: "A stale literature adapter target is not a regular file and was preserved.",
        path: target,
        blocking: false,
      });
      continue;
    }
    if (sha256(await readFile(target)) !== installation.sha256) {
      retainedInstallations.push(installation);
      diagnostics.push({
        severity: "warning",
        code: "literature_adapter_file_drift",
        message: "A stale literature adapter file has local modifications and was preserved.",
        path: target,
        blocking: false,
      });
      continue;
    }
    operations.push({
      action: "remove-owned",
      boundaryRoot: resolved.boundaryRoot,
      path: target,
      relativePath: installation.target.path,
      scope: "project",
      ownership: "generated",
      previousHash: installation.sha256,
      previousMode: info.mode & 0o777,
      reason: "remove stale manifest-owned literature adapter file",
    });
  }
  return { operations, retainedInstallations, diagnostics };
}

export async function planLiteratureAdapterDelivery(input: {
  projectRoot: string;
  toolIds: readonly string[];
  selectedAdapterIds: readonly string[];
  existingInstallations: readonly ManagedInstallation[];
  force: boolean;
  platform?: NodeJS.Platform;
  architecture?: NodeJS.Architecture;
}): Promise<LiteratureAdapterDeliveryPlan> {
  for (const installation of input.existingInstallations) await validateManagedTarget(input.projectRoot, installation);
  const operations: PlannedWrite[] = [];
  const installations: ManagedInstallation[] = [];
  const resolutions: LiteratureAdapterResolution[] = [];
  const diagnostics: Diagnostic[] = [];
  const recorded = new Map(input.existingInstallations.map((item) => [installationKey(item), item]));

  for (const adapter of desiredLiteratureAdapters(input.selectedAdapterIds)) {
    const adapterOperationStart = operations.length;
    const platform = resolveLiteratureAdapterPlatform(adapter, input.platform, input.architecture);
    const targetIsWindows = platform.platform.startsWith("win32-");
    let incomplete = false;
    const projectedToolIds: string[] = [];

    await addManaged({
      target: path.join(input.projectRoot, ".zotero-bridge", "profile.template.json"),
      manifestPath: ".zotero-bridge/profile.template.json",
      content: await readLiteratureAdapterProfile(adapter),
      source: literatureSource(adapter.adapter_id, adapter.identity.release_set_id, "profile-template"),
      owner: "literature-adapter",
      toolId: null,
      executable: false,
    });

    let runtimeAsset: LiteratureAdapterResolution["runtime_asset"] = null;
    if (platform.supported) {
      const runtime = platform.runtime;
      const installedPath = posix(path.join(".zotero-bridge", "bin", runtime.binary));
      const runtimeBytes = await readFile(path.join(LITERATURE_ADAPTER_PACKAGE_ROOT, runtime.source_path));
      if (sha256(runtimeBytes) !== runtime.sha256 || runtimeBytes.byteLength !== runtime.bytes) {
        diagnostics.push({
          severity: "error",
          code: "literature_adapter_package_drift",
          message: "Packaged literature Adapter runtime does not match the catalog.",
          path: path.join(LITERATURE_ADAPTER_PACKAGE_ROOT, runtime.source_path),
          blocking: true,
          details: { adapter_id: adapter.adapter_id, platform: platform.platform },
        });
        incomplete = true;
      } else {
        await addManaged({
          target: path.join(input.projectRoot, installedPath),
          manifestPath: installedPath,
          content: runtimeBytes,
          source: literatureSource(adapter.adapter_id, adapter.identity.release_set_id, "runtime", undefined, platform.platform),
          owner: "literature-adapter",
          toolId: null,
          executable: true,
          mode: targetIsWindows ? undefined : 0o755,
        });
        runtimeAsset = {
          source_path: runtime.source_path,
          installed_path: installedPath,
          sha256: runtime.sha256,
          bytes: runtime.bytes,
          protocol: adapter.identity.protocol,
          cli_schema: adapter.identity.cli_schema,
          build_fingerprint: adapter.identity.build_fingerprint,
          command_catalog_checksum: adapter.identity.command_catalog_checksum,
          binary_aggregate_sha256: adapter.identity.binary_aggregate_sha256,
        };
        if (platform.platform === "win32-x64") {
          const shimPath = ".zotero-bridge/bin/zotero-bridge.cmd";
          await addManaged({
            target: path.join(input.projectRoot, shimPath),
            manifestPath: shimPath,
            content: "@echo off\r\n\"%~dp0zotero-bridge.exe\" %*\r\n",
            source: literatureSource(adapter.adapter_id, adapter.identity.release_set_id, "windows-shim", undefined, platform.platform),
            owner: "literature-adapter",
            toolId: null,
            executable: true,
          });
        }
      }
    } else {
      diagnostics.push({
        severity: "warning",
        code: "literature_adapter_platform_unsupported",
        message: "No Zotero literature Adapter runtime is available for this platform.",
        blocking: false,
        details: { adapter_id: adapter.adapter_id, target_platform: platform.platform },
      });
    }

    for (const toolId of input.toolIds) {
      const tool = getTool(toolId);
      if (!tool) continue;
      const operationStart = operations.length;
      for (const sourceFile of await readLiteratureAdapterSkillAssets(adapter)) {
          const skillRoot = toolSkillsRoot(tool, input.projectRoot);
          const target = path.join(skillRoot.root, sourceFile.skillId, sourceFile.relativePath);
          await addManaged({
            target,
            manifestPath: skillRoot.scope === "project" ? posix(path.relative(input.projectRoot, target)) : target,
            scope: skillRoot.scope,
            content: sourceFile.content,
            source: literatureSource(adapter.adapter_id, adapter.identity.release_set_id, "skill", sourceFile.skillId),
            owner: "agent-tool",
            toolId,
            executable: sourceFile.executable,
            mode: targetIsWindows || !sourceFile.executable ? undefined : 0o755,
          });
      }
      const projected = operations.slice(operationStart).every((operation) => operation.action !== "conflict" && operation.action !== "skip-drift");
      if (projected) projectedToolIds.push(toolId);
      else incomplete = true;
    }

    if (operations.slice(adapterOperationStart).some((operation) => operation.action === "conflict" || operation.action === "skip-drift")) incomplete = true;
    resolutions.push({
      adapter_id: adapter.adapter_id,
      release_set_id: adapter.identity.release_set_id,
      bundle_version: adapter.versions.bundle,
      cli_version: adapter.versions.cli,
      skill_versions: Object.fromEntries(adapter.skills.map((skill) => [skill.skill_id, skill.version])),
      target_platform: platform.platform,
      runtime_asset: runtimeAsset,
      skill_ids: adapter.skills.map((skill) => skill.skill_id),
      projected_tool_ids: projectedToolIds,
      projection_state: incomplete ? "incomplete" : input.toolIds.length === 0 ? "deferred" : "complete",
    });
  }

  return { operations, installations, resolutions, diagnostics };

  async function addManaged(value: {
    target: string;
    manifestPath: string;
    scope?: "project" | "shared-global";
    content: string | Uint8Array;
    source: ManagedInstallationSource;
    owner: ManagedInstallation["owner"];
    toolId: string | null;
    executable: boolean;
    mode?: number;
  }): Promise<void> {
    const scope = value.scope ?? "project";
    const key = `${scope}:${value.manifestPath}`;
    const prior = recorded.get(key);
    const installation: ManagedInstallation = {
      owner: value.owner, tool_id: value.toolId, source: value.source,
      target: { scope, path: value.manifestPath, executable: value.executable }, sha256: sha256(value.content),
    };
    const operation = await planFile({
      boundaryRoot: resolveManagedTarget(input.projectRoot, installation).boundaryRoot,
      path: value.target,
      relativePath: value.manifestPath,
      content: value.content,
      scope,
      ownership: "generated",
      recordedHash: prior?.sha256,
      force: input.force,
      mode: value.mode,
      requireRecordedOwnership: true,
    });
    operations.push(operation);
    if (operation.action === "conflict") {
      diagnostics.push({
        severity: "error",
        code: "literature_adapter_path_conflict",
        message: operation.reason,
        path: value.target,
        blocking: true,
        details: { source: value.source },
      });
      return;
    }
    if (operation.action === "skip-drift") {
      diagnostics.push({
        severity: "warning",
        code: "literature_adapter_file_drift",
        message: operation.reason,
        path: value.target,
        blocking: false,
        details: { source: value.source },
      });
    }
    const hash = operation.action === "skip-drift" && prior ? prior.sha256 : sha256(value.content);
    installations.push({ ...installation, sha256: hash });
  }
}

function literatureSource(
  adapterId: string,
  releaseSetId: string,
  component: Extract<ManagedInstallationSource, { kind: "literature-adapter" }>["component"],
  skillId?: string,
  platform?: string,
): Extract<ManagedInstallationSource, { kind: "literature-adapter" }> {
  return {
    kind: "literature-adapter",
    adapter_id: adapterId,
    release_set_id: releaseSetId,
    component,
    ...(skillId ? { skill_id: skillId } : {}),
    ...(platform ? { platform } : {}),
  };
}

function posix(value: string): string {
  return value.split(path.sep).join("/");
}
