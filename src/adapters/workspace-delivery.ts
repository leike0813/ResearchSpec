import type { Diagnostic } from "../core/validation/types.js";
import type { PlannedWrite } from "../core/workspace/write-plan.js";
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
      ...toolDelivery.operations,
      ...toolReconciliation.operations,
      ...literatureDelivery.operations,
      ...literatureReconciliation.operations,
    ],
    installations: deduplicateInstallations([
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
