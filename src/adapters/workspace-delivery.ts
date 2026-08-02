import path from "node:path";

import { ACADEMIC_PIPELINE_PROFILE } from "../arsu-converter/workflow/academic-pipeline.js";
import { ACADEMIC_PIPELINE_PROFILE_PROJECTION } from "../arsu-converter/workflow/generate.js";
import type { Diagnostic } from "../core/validation/types.js";
import { planFile, sha256, type PlannedWrite } from "../core/workspace/write-plan.js";
import {
  LITERATURE_ADAPTER_SKILL_IDS,
  planLiteratureAdapterDelivery,
  reconcileLiteratureAdapterInstallations,
} from "../literature-adapters/index.js";
import type { LoadedPluginRegistry } from "../plugins/registry.js";
import { planToolDelivery } from "./delivery.js";
import {
  deduplicateInstallations,
  reconcileAgentToolInstallations,
  type LiteratureAdapterResolution,
  type ManagedInstallation,
} from "./installations.js";

export interface WorkspaceDeliveryPlan {
  operations: PlannedWrite[];
  installations: ManagedInstallation[];
  literatureAdapterResolutions: LiteratureAdapterResolution[];
  diagnostics: Diagnostic[];
}

export async function planWorkspaceDelivery(input: {
  projectRoot: string;
  workspaceRoot?: string;
  toolIds: readonly string[];
  selectedToolIds: readonly string[];
  reconciledToolIds: readonly string[];
  existingInstallations: readonly ManagedInstallation[];
  force: boolean;
  pluginRegistry?: LoadedPluginRegistry;
  selectedPluginIds?: readonly string[];
  preserveSkillIds?: readonly string[];
  platform?: NodeJS.Platform;
  architecture?: NodeJS.Architecture;
}): Promise<WorkspaceDeliveryPlan> {
  const profileAbsolutePath = path.join(input.workspaceRoot ?? path.join(input.projectRoot, "researchspec"), "profiles/academic-pipeline.yaml");
  const profileTarget = path.relative(input.projectRoot, profileAbsolutePath).split(path.sep).join("/");
  const existingProfile = input.existingInstallations.find((item) => item.owner === "framework" && item.target.scope === "project" && item.target.path === profileTarget);
  const profileOperation = await planFile({
    path: profileAbsolutePath,
    relativePath: profileTarget,
    content: ACADEMIC_PIPELINE_PROFILE_PROJECTION,
    scope: "project",
    ownership: "generated",
    recordedHash: existingProfile?.sha256,
    requireRecordedOwnership: existingProfile === undefined,
    force: input.force,
  });
  const profileInstallation: ManagedInstallation = {
    owner: "framework",
    tool_id: null,
    source: { kind: "framework-profile", profile_id: ACADEMIC_PIPELINE_PROFILE.profile_id, profile_version: ACADEMIC_PIPELINE_PROFILE.profile_version },
    target: { scope: "project", path: profileTarget, executable: false },
    sha256: sha256(ACADEMIC_PIPELINE_PROFILE_PROJECTION),
  };
  const toolDelivery = await planToolDelivery({
    projectRoot: input.projectRoot,
    toolIds: input.toolIds,
    existingInstallations: input.existingInstallations,
    force: input.force,
    pluginRegistry: input.pluginRegistry,
    selectedPluginIds: input.selectedPluginIds,
  });
  const toolReconciliation = await reconcileAgentToolInstallations({
    projectRoot: input.projectRoot,
    existingInstallations: input.existingInstallations,
    desiredInstallations: toolDelivery.installations,
    reconciledToolIds: input.reconciledToolIds,
    selectedToolIds: input.selectedToolIds,
    preserveSkillIds: [...LITERATURE_ADAPTER_SKILL_IDS, ...(input.preserveSkillIds ?? [])],
  });
  const literatureDelivery = await planLiteratureAdapterDelivery({
    projectRoot: input.projectRoot,
    toolIds: input.selectedToolIds,
    existingInstallations: input.existingInstallations,
    force: input.force,
    platform: input.platform,
    architecture: input.architecture,
  });
  const literatureReconciliation = await reconcileLiteratureAdapterInstallations({
    projectRoot: input.projectRoot,
    existingInstallations: [...toolReconciliation.retainedInstallations, ...toolDelivery.installations],
    desiredInstallations: literatureDelivery.installations,
  });

  return {
    operations: [
      profileOperation,
      ...toolDelivery.operations,
      ...toolReconciliation.operations,
      ...literatureDelivery.operations,
      ...literatureReconciliation.operations,
    ],
    installations: deduplicateInstallations([
      profileInstallation,
      ...literatureReconciliation.retainedInstallations,
      ...literatureDelivery.installations,
    ]),
    literatureAdapterResolutions: literatureDelivery.resolutions,
    diagnostics: [
      ...toolDelivery.diagnostics,
      ...toolReconciliation.diagnostics,
      ...literatureDelivery.diagnostics,
      ...literatureReconciliation.diagnostics,
    ],
  };
}
