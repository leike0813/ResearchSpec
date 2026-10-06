import path from "node:path";

import type { Diagnostic } from "../core/validation/types.js";
import { planFile, sha256, type PlannedWrite } from "../core/workspace/write-plan.js";
import {
  LITERATURE_ADAPTER_SKILL_IDS,
  planLiteratureAdapterDelivery,
  reconcileLiteratureAdapterInstallations,
} from "../literature-adapters/index.js";
import type { LoadedPluginRegistry } from "../plugins/registry.js";
import { planPluginProjection } from "../plugins/graph-delivery.js";
import { loadGraphProfileRegistry } from "../graph-profiles/registry.js";
import type { DomainResolutionSnapshot } from "./installations.js";
import { planToolDelivery } from "./delivery.js";
import { resolveManagedTarget, validateManagedTarget } from "./managed-target.js";
import type { DeliveryMode } from "./tools.js";
import { planLegacyToolReconciliation } from "./legacy-reconciliation.js";
import { planPaperHumanizerHooks } from "./prompt-guard.js";
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
  paperHumanizerGuard?: "on" | "off";
}): Promise<WorkspaceDeliveryPlan> {
  for (const installation of input.existingInstallations) await validateManagedTarget(input.projectRoot, installation);
  const profileDefinitions = [...(await loadGraphProfileRegistry()).profiles.values()];
  const profileOperations: PlannedWrite[] = [];
  const profileInstallations: ManagedInstallation[] = [];
  for (const definition of profileDefinitions) {
    const profileAbsolutePath = path.join(input.workspaceRoot ?? path.join(input.projectRoot, "researchspec"), `profiles/${definition.profile.profile_id}.yaml`);
    const profileTarget = path.relative(input.projectRoot, profileAbsolutePath).split(path.sep).join("/");
    const existingProfile = input.existingInstallations.find((item) => item.owner === "framework" && item.target.scope === "project" && item.target.path === profileTarget);
    const installation: ManagedInstallation = {
      owner: "framework", tool_id: null,
      source: { kind: "framework-profile", profile_id: definition.profile.profile_id, profile_version: definition.profile.profile_version },
      target: { scope: "project", path: profileTarget, executable: false }, sha256: sha256(definition.projection),
    };
    profileOperations.push(await planFile({
      boundaryRoot: resolveManagedTarget(input.projectRoot, installation).boundaryRoot,
      path: profileAbsolutePath,
      relativePath: profileTarget,
      content: definition.projection,
      scope: "project",
      ownership: "generated",
      recordedHash: existingProfile?.sha256,
      requireRecordedOwnership: existingProfile === undefined,
      force: input.force,
    }));
    profileInstallations.push(installation);
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

  const promptGuard = await planPaperHumanizerHooks({
    projectRoot: input.projectRoot, selectedToolIds: input.selectedToolIds,
    reconciledToolIds: input.reconciledToolIds, existingInstallations: input.existingInstallations,
    enabled: input.paperHumanizerGuard !== "off",
  });
  return {
    operations: [
      ...profileOperations,
      ...promptGuard.operations,
      ...toolDelivery.operations,
      ...toolReconciliation.operations,
      ...legacyReconciliation.operations,
      ...literatureDelivery.operations,
      ...literatureReconciliation.operations,
      ...(pluginDelivery?.operations ?? []),
    ],
    installations: deduplicateInstallations([
      ...profileInstallations,
      ...promptGuard.installations,
      ...literatureReconciliation.retainedInstallations,
      ...literatureDelivery.installations,
      ...(pluginDelivery?.retainedInstallations ?? []),
      ...(pluginDelivery?.desiredInstallations ?? []),
    ]),
    literatureAdapterResolutions: literatureDelivery.resolutions,
    pluginResolutions: [...(pluginDelivery?.resolutions ?? input.existingPluginResolutions ?? [])],
    diagnostics: [
      ...toolDelivery.diagnostics,
      ...promptGuard.diagnostics,
      ...toolReconciliation.diagnostics,
      ...legacyReconciliation.diagnostics,
      ...literatureDelivery.diagnostics,
      ...literatureReconciliation.diagnostics,
      ...(pluginDelivery?.diagnostics ?? []),
    ],
  };
}
