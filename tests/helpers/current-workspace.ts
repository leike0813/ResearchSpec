import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { getArsuRoute } from "../../src/arsu-converter/routing/catalog.js";
import type { RouteRef } from "../../src/arsu-converter/routing/contracts.js";
import type { SubflowStartCommand } from "../../src/core/contracts/subflow-command.js";
import { getWorkspaceEntries } from "../../src/core/workspace/layout.js";
import { cleanup, tempProject } from "./cli.js";

export async function createCurrentWorkspace(): Promise<{ root: string; workspace: string; cleanup: () => Promise<void> }> {
  const root = await tempProject();
  const workspace = path.join(root, "researchspec");
  for (const entry of getWorkspaceEntries(workspace)) {
    if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    else {
      await mkdir(path.dirname(entry.path), { recursive: true });
      await writeFile(entry.path, entry.content, "utf8");
    }
  }
  return { root, workspace, cleanup: () => cleanup(root) };
}

export function startCommand(routeRef: RouteRef, confirmedAt: string, overrides: Partial<SubflowStartCommand> = {}): SubflowStartCommand {
  const route = getArsuRoute(routeRef);
  return {
    schema_version: "1",
    confirmed_at: confirmedAt,
    prerequisites: [],
    handoff_inputs: [],
    planned_outputs: [],
    formal_gates: [],
    cost: route.cost,
    ...overrides,
  };
}
