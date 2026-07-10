import path from "node:path";

import { fileExists, isDirectory } from "../../utils/fs.js";

export type WorkspaceResolution =
  | { status: "found"; workspace: string; source: "explicit" | "nearest" }
  | { status: "missing"; searchedFrom: string }
  | { status: "invalid"; path: string };

export async function resolveWorkspace(cwd: string, explicitWorkspace?: string): Promise<WorkspaceResolution> {
  if (explicitWorkspace) {
    const resolved = path.resolve(cwd, explicitWorkspace);
    return (await isDirectory(resolved))
      ? { status: "found", workspace: resolved, source: "explicit" }
      : { status: "invalid", path: resolved };
  }

  let current = path.resolve(cwd);
  while (true) {
    const candidate = path.join(current, "researchspec");
    if ((await fileExists(candidate)) && (await isDirectory(candidate))) {
      return { status: "found", workspace: candidate, source: "nearest" };
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
