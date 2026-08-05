import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml, stringify } from "yaml";

import { getArsuRoute } from "../../src/arsu-converter/routing/catalog.js";
import type { RouteRef } from "../../src/arsu-converter/routing/contracts.js";
import type { SubflowStartCommand } from "../../src/core/contracts/subflow-command.js";
import { getWorkspaceEntries } from "../../src/core/workspace/layout.js";
import { cleanup, tempProject } from "./cli.js";

export async function createCurrentWorkspace(options: {
  manuscriptDelivery?: { working_format: "markdown" | "qmd" | "latex" | "latex-project" | null; final_output_format: string | null };
} = {}): Promise<{ root: string; workspace: string; cleanup: () => Promise<void> }> {
  const root = await tempProject();
  const workspace = path.join(root, "researchspec");
  const delivery = options.manuscriptDelivery ?? { working_format: "markdown" as const, final_output_format: null };
  for (const entry of getWorkspaceEntries(workspace)) {
    if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    else {
      await mkdir(path.dirname(entry.path), { recursive: true });
      const content = entry.path.endsWith("specs/manuscript.yaml")
        ? stringify({ ...(parseYaml(entry.content) as Record<string, unknown>), delivery })
        : entry.content;
      await writeFile(entry.path, content, "utf8");
    }
  }
  return { root, workspace, cleanup: () => cleanup(root) };
}

export function startCommand(routeRef: RouteRef, confirmedAt: string, overrides: Partial<SubflowStartCommand> = {}): SubflowStartCommand {
  const route = getArsuRoute(routeRef);
  const usesManuscript = routeRef.startsWith("academic-paper:")
    || routeRef.startsWith("academic-paper-reviewer:")
    || routeRef.startsWith("academic-pipeline:");
  return {
    schema_version: "1",
    confirmed_at: confirmedAt,
    prerequisites: [],
    handoff_inputs: [],
    planned_outputs: [],
    ...(usesManuscript ? { manuscript_delivery: { working_format: "markdown" as const, final_output_format: null } } : {}),
    formal_gates: [],
    cost: route.cost,
    ...overrides,
  };
}
