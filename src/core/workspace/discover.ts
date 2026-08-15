import path from "node:path";

import { fileExists, isDirectory } from "../../utils/fs.js";
import { inspectGraphWorkspaceFormat } from "../runtime/graph-workspace-index.js";

export type WorkspaceResolution =
  | { status: "found"; workspace: string; source: "explicit" | "nearest" }
  | { status: "missing"; searchedFrom: string }
  | { status: "invalid"; path: string }
  | { status: "unsupported"; path: string; reason: string };

export async function resolveWorkspace(cwd: string, explicitWorkspace?: string): Promise<WorkspaceResolution> {
  if (explicitWorkspace) {
    const resolved = path.resolve(cwd, explicitWorkspace);
    if (!(await isDirectory(resolved))) return { status: "invalid", path: resolved };
    const format = await inspectGraphWorkspaceFormat(resolved);
    return format.current
      ? { status: "found", workspace: resolved, source: "explicit" }
      : { status: "unsupported", path: resolved, reason: format.reason };
  }

  let current = path.resolve(cwd);
  while (true) {
    const candidate = path.join(current, "researchspec");
    if ((await fileExists(candidate)) && (await isDirectory(candidate))) {
      const format = await inspectGraphWorkspaceFormat(candidate);
      return format.current
        ? { status: "found", workspace: candidate, source: "nearest" }
        : { status: "unsupported", path: candidate, reason: format.reason };
    }
    const parent = path.dirname(current);
    if (parent === current) return { status: "missing", searchedFrom: cwd };
    current = parent;
  }
}

export async function discoverWorkspace(cwd: string, explicitWorkspace?: string): Promise<string | undefined> {
  const result = await resolveWorkspace(cwd, explicitWorkspace);
  return result.status === "found" ? result.workspace : undefined;
}
