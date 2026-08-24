import path from "node:path";

import { ACADEMIC_PIPELINE_GRAPH_PROFILE, ACADEMIC_PIPELINE_GRAPH_PROFILE_TEXT } from "../core/graph-profiles/academic-pipeline.js";
import { ACADEMIC_PAPER_GRAPH_PROFILE, ACADEMIC_PAPER_GRAPH_PROFILE_TEXT } from "../core/graph-profiles/academic-paper.js";
import { ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE, ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE_TEXT } from "../core/graph-profiles/academic-paper-reviewer.js";
import { MINIMAL_GRAPH_PROFILE, MINIMAL_GRAPH_PROFILE_TEXT } from "../core/graph-profiles/minimal.js";
import { PAPER_HUMANIZER_GRAPH_PROFILE, PAPER_HUMANIZER_GRAPH_PROFILE_TEXT } from "../core/graph-profiles/paper-humanizer.js";
import { RESEARCH_MAIN_GRAPH_PROFILE, RESEARCH_MAIN_GRAPH_PROFILE_TEXT } from "../core/graph-profiles/research-main.js";
import { REVIEW_RESPONSE_GRAPH_PROFILE, REVIEW_RESPONSE_GRAPH_PROFILE_TEXT } from "../core/graph-profiles/review-response.js";
import type { Diagnostic } from "../core/validation/types.js";
import { planFile, sha256, type PlannedWrite } from "../core/workspace/write-plan.js";
import {
  LITERATURE_ADAPTER_SKILL_IDS,
  planLiteratureAdapterDelivery,
  reconcileLiteratureAdapterInstallations,
} from "../literature-adapters/index.js";
import type { LoadedPluginRegistry } from "../plugins/registry.js";
import { planPluginProjection } from "../plugins/graph-delivery.js";
import type { DomainResolutionSnapshot } from "./installations.js";
import { planToolDelivery } from "./delivery.js";
import type { DeliveryMode } from "./tools.js";
import { planLegacyToolReconciliation } from "./legacy-reconciliation.js";
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
  pluginResolutions: DomainResolutionSnapshot[];
}

export async function planWorkspaceDelivery(input: {
  projectRoot: string;
  workspaceRoot?: string;
  toolIds: readonly string[];
  delivery?: DeliveryMode;
  selectedToolIds: readonly string[];
  reconciledToolIds: readonly string[];
  selectedLiteratureAdapterIds: readonly string[];
  existingInstallations: readonly ManagedInstallation[];
  force: boolean;
  pluginRegistry?: LoadedPluginRegistry;
  selectedPluginIds?: readonly string[];
  existingPluginResolutions?: readonly DomainResolutionSnapshot[];
  preserveSkillIds?: readonly string[];
  platform?: NodeJS.Platform;
  architecture?: NodeJS.Architecture;
  operation?: "init" | "update";
  reconcileLegacy?: boolean;
  globalCleanupAuthorized?: boolean;
}): Promise<WorkspaceDeliveryPlan> {
  const profileDefinitions = [
    { profile: MINIMAL_GRAPH_PROFILE, projection: MINIMAL_GRAPH_PROFILE_TEXT },
    { profile: RESEARCH_MAIN_GRAPH_PROFILE, projection: RESEARCH_MAIN_GRAPH_PROFILE_TEXT },
    { profile: ACADEMIC_PAPER_GRAPH_PROFILE, projection: ACADEMIC_PAPER_GRAPH_PROFILE_TEXT },
    { profile: ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE, projection: ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE_TEXT },
    { profile: ACADEMIC_PIPELINE_GRAPH_PROFILE, projection: ACADEMIC_PIPELINE_GRAPH_PROFILE_TEXT },
    { profile: PAPER_HUMANIZER_GRAPH_PROFILE, projection: PAPER_HUMANIZER_GRAPH_PROFILE_TEXT },
    { profile: REVIEW_RESPONSE_GRAPH_PROFILE, projection: REVIEW_RESPONSE_GRAPH_PROFILE_TEXT },
  ] as const;
  const profileOperations: PlannedWrite[] = [];
  const profileInstallations: ManagedInstallation[] = [];
  for (const definition of profileDefinitions) {
    const profileAbsolutePath = path.join(input.workspaceRoot ?? path.join(input.projectRoot, "researchspec"), `profiles/${definition.profile.profile_id}.yaml`);
    const profileTarget = path.relative(input.projectRoot, profileAbsolutePath).split(path.sep).join("/");
    const existingProfile = input.existingInstallations.find((item) => item.owner === "framework" && item.target.scope === "project" && item.target.path === profileTarget);
    profileOperations.push(await planFile({
      path: profileAbsolutePath,
      relativePath: profileTarget,
      content: definition.projection,
      scope: "project",
      ownership: "generated",
      recordedHash: existingProfile?.sha256,
      requireRecordedOwnership: existingProfile === undefined,
      force: input.force,
    }));
    profileInstallations.push({
      owner: "framework",
      tool_id: null,
      source: { kind: "framework-profile", profile_id: definition.profile.profile_id, profile_version: definition.profile.profile_version },
      target: { scope: "project", path: profileTarget, executable: false },
      sha256: sha256(definition.projection),
    });
  }
  const toolDelivery = await planToolDelivery({
    projectRoot: input.projectRoot,
    toolIds: input.toolIds,
    delivery: input.delivery ?? "both",
    existingInstallations: input.existingInstallations,
    force: input.force,
  });
  const toolReconciliation = await reconcileAgentToolInstallations({
    projectRoot: input.projectRoot,
    existingInstallations: input.existingInstallations,
    desiredInstallations: toolDelivery.installations,
    reconciledToolIds: input.reconciledToolIds,
    selectedToolIds: input.selectedToolIds,
    preserveSkillIds: [...LITERATURE_ADAPTER_SKILL_IDS, ...(input.preserveSkillIds ?? [])],
  });
  const legacyReconciliation = input.reconcileLegacy
    ? await planLegacyToolReconciliation({
        projectRoot: input.projectRoot,
        selectedToolIds: input.selectedToolIds,
        desiredInstallations: toolDelivery.installations,
        existingInstallations: input.existingInstallations,
        plannedOperations: [...toolDelivery.operations, ...toolReconciliation.operations],
        operation: input.operation ?? "update",
        globalCleanupAuthorized: input.globalCleanupAuthorized ?? false,
        reconciledToolIds: input.reconciledToolIds,
        delivery: input.delivery ?? "both",
      })
    : { operations: [] as PlannedWrite[], diagnostics: [] as Diagnostic[] };
  const literatureDelivery = await planLiteratureAdapterDelivery({
    projectRoot: input.projectRoot,
    toolIds: toolDelivery.skillToolIds,
    selectedAdapterIds: input.selectedLiteratureAdapterIds,
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
  const pluginDelivery = input.pluginRegistry
    ? await planPluginProjection({
        projectRoot: input.projectRoot,
        workspaceRoot: input.workspaceRoot ?? path.join(input.projectRoot, "researchspec"),
        toolIds: input.toolIds,
        delivery: input.delivery ?? "both",
        registry: input.pluginRegistry,
        selectedDomainIds: input.selectedPluginIds ?? [],
        existingInstallations: input.existingInstallations,
        existingResolutions: input.existingPluginResolutions ?? [],
        force: input.force,
      })
    : undefined;

  return {
    operations: [
      ...profileOperations,
      ...toolDelivery.operations,
      ...toolReconciliation.operations,
      ...legacyReconciliation.operations,
      ...literatureDelivery.operations,
      ...literatureReconciliation.operations,
      ...(pluginDelivery?.operations ?? []),
    ],
    installations: deduplicateInstallations([
      ...profileInstallations,
      ...literatureReconciliation.retainedInstallations,
      ...literatureDelivery.installations,
      ...(pluginDelivery?.retainedInstallations ?? []),
      ...(pluginDelivery?.desiredInstallations ?? []),
    ]),
    literatureAdapterResolutions: literatureDelivery.resolutions,
    pluginResolutions: [...(pluginDelivery?.resolutions ?? input.existingPluginResolutions ?? [])],
    diagnostics: [
      ...toolDelivery.diagnostics,
      ...toolReconciliation.diagnostics,
      ...legacyReconciliation.diagnostics,
      ...literatureDelivery.diagnostics,
      ...literatureReconciliation.diagnostics,
      ...(pluginDelivery?.diagnostics ?? []),
    ],
  };
}
