import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { z } from "zod";

import { GraphWorkspaceConfigSchema } from "../core/contracts/graph-workspace.js";
import { resolveGraphWorkspace } from "../core/workspace/graph-discover.js";
import { domainIsAvailable, loadPluginRegistry } from "../plugins/registry.js";
import type { ProcedureDefinition } from "./catalog.js";
import type { ProcedureSearchMode } from "./search-contracts.js";

/**
 * Static selection facts only. A state is never an execution permission, a consent record or a
 * guarantee that activation succeeds: package, manifest, workspace and content validation still
 * runs at activation time.
 */
export type ProcedureEligibilityState =
  | "workspace_required"
  | "eligible"
  | "domain_selection_required"
  | "selected_domain_unavailable"
  | "unknown";

export interface ProcedureEligibility {
  state: ProcedureEligibilityState;
  detail: string;
  /** Owning domains considered by the static selection rule. */
  domains: readonly string[];
  /** Selected owning domains that are available. */
  available_domains: readonly string[];
  /** Selected owning domains that are empty or unavailable. */
  unavailable_domains: readonly string[];
}

export type ProcedureEligibilityContext =
  | {
      status: "workspace";
      workspace: string;
      selectedDomainIds: readonly string[];
      availableSelectedDomainIds: readonly string[];
      unavailableSelectedDomainIds: readonly string[];
      /** Read from the same schema 2 configuration as the selection, never from a second parse. */
      procedureSearchMode: ProcedureSearchMode;
      /**
       * Domain availability metadata could not be read. The configuration itself is current, so
       * only domain-owning Procedures become unknown; everything else stays derivable.
       */
      catalogFailure?: string;
    }
  | { status: "outside_workspace" }
  | { status: "unsupported_configuration"; reason: string };

export type ProcedureWorkspaceSelection = Extract<ProcedureEligibilityContext, { status: "workspace" }>;

/**
 * Build the shared context from facts a caller already holds, so an activation path that already
 * parsed its configuration and registry does not read the workspace again.
 */
export function procedureEligibilityContextFromSelection(
  workspace: string,
  selectedDomainIds: readonly string[],
  isDomainAvailable: (domainId: string) => boolean,
  procedureSearchMode: ProcedureSearchMode = "offline",
): ProcedureWorkspaceSelection {
  const selected = uniqueSorted(selectedDomainIds);
  return {
    status: "workspace",
    workspace,
    selectedDomainIds: selected,
    availableSelectedDomainIds: selected.filter((domainId) => isDomainAvailable(domainId)),
    unavailableSelectedDomainIds: selected.filter((domainId) => !isDomainAvailable(domainId)),
    procedureSearchMode,
  };
}

/**
 * Read only the workspace configuration and bounded domain metadata. No run, node, change,
 * manifest, full workspace index or Skill content validation is loaded, so discovery stays usable
 * outside a workspace. An unsupported configuration and an unreadable domain catalog stay
 * distinguishable: the first makes every card unknown, the second only the domain-owning ones.
 */
export async function loadProcedureEligibilityContext(cwd: string, explicitWorkspace?: string): Promise<ProcedureEligibilityContext> {
  const resolution = await resolveGraphWorkspace(cwd, explicitWorkspace);
  if (resolution.status === "missing") return { status: "outside_workspace" };
  if (resolution.status === "invalid") return { status: "unsupported_configuration", reason: "Invalid graph workspace path: " + resolution.path };
  if (resolution.status === "unsupported") return { status: "unsupported_configuration", reason: "Unsupported graph workspace format: " + resolution.path + " (" + resolution.reason + ")" };
  let config: z.infer<typeof GraphWorkspaceConfigSchema>;
  try {
    const parsed = GraphWorkspaceConfigSchema.safeParse(parseYaml(await readFile(path.join(resolution.workspace, "config.yaml"), "utf8")));
    if (!parsed.success) return { status: "unsupported_configuration", reason: "Graph workspace configuration is not a current schema 2 configuration." };
    config = parsed.data;
  } catch {
    return { status: "unsupported_configuration", reason: "Graph workspace configuration could not be read." };
  }
  const searchMode = config.procedure_search?.mode ?? "offline";
  const selected = uniqueSorted(config.plugins.selected);
  if (selected.length === 0) return procedureEligibilityContextFromSelection(resolution.workspace, selected, () => false, searchMode);
  try {
    const registry = await loadPluginRegistry(undefined, false);
    return procedureEligibilityContextFromSelection(resolution.workspace, selected, (domainId) => domainIsAvailable(registry.domains.get(domainId)), searchMode);
  } catch (error) {
    return { ...procedureEligibilityContextFromSelection(resolution.workspace, selected, () => false, searchMode), catalogFailure: "Domain availability metadata is unavailable: " + message(error) };
  }
}

/** Pure static derivation. It never hides or reranks candidates and never grants permission. */
export function procedureEligibility(procedure: ProcedureDefinition, context: ProcedureEligibilityContext): ProcedureEligibility {
  const ownership = { domains: procedure.domains, available_domains: [] as string[], unavailable_domains: [] as string[] };
  if (context.status === "unsupported_configuration") return { ...ownership, state: "unknown", detail: context.reason };
  if (context.status === "outside_workspace") return { ...ownership, state: "workspace_required", detail: "Activation requires a current schema 2 ResearchSpec workspace." };
  if (procedure.kind !== "plugin") return { ...ownership, state: "eligible", detail: "This Procedure has no domain selection requirement." };
  if (context.catalogFailure !== undefined) return { ...ownership, state: "unknown", detail: context.catalogFailure };
  const selected = new Set(context.selectedDomainIds);
  const available = new Set(context.availableSelectedDomainIds);
  const resolved = {
    domains: procedure.domains,
    available_domains: procedure.domains.filter((id) => selected.has(id) && available.has(id)),
    unavailable_domains: procedure.domains.filter((id) => selected.has(id) && !available.has(id)),
  };
  if (resolved.available_domains.length > 0) return { ...resolved, state: "eligible", detail: "A selected available domain owns this Procedure: " + resolved.available_domains.join(", ") };
  if (resolved.unavailable_domains.length > 0) return { ...resolved, state: "selected_domain_unavailable", detail: "Selected owning domains are unavailable: " + resolved.unavailable_domains.join(", ") };
  return { ...resolved, state: "domain_selection_required", detail: "Select and install one owning domain before activation." };
}

/**
 * Canonical selection facts a pagination cursor must bind, so pages read across a selection change
 * never mix conflicting eligibility. Returns unhashed text for the existing cursor fingerprint to
 * digest; nothing new is persisted.
 */
export function procedureEligibilityContextKey(context: ProcedureEligibilityContext): string {
  if (context.status === "outside_workspace") return "outside_workspace";
  if (context.status === "unsupported_configuration") return "unsupported_configuration:" + context.reason;
  const selection = "selected=" + context.selectedDomainIds.join(",") + ";available=" + context.availableSelectedDomainIds.join(",") + ";unavailable=" + context.unavailableSelectedDomainIds.join(",");
  return context.catalogFailure === undefined ? selection : "catalog_unavailable:" + context.catalogFailure + ";" + selection;
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) => left < right ? -1 : left > right ? 1 : 0);
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
