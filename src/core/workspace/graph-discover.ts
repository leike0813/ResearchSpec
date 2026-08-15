import path from "node:path";

import { inspectGraphWorkspaceFormat } from "../runtime/graph-workspace-index.js";
import { fileExists, isDirectory } from "../../utils/fs.js";

export type GraphWorkspaceResolution =
  | { status: "found"; workspace: string; source: "explicit" | "nearest" }
  | { status: "missing"; searchedFrom: string }
  | { status: "invalid"; path: string }
  | { status: "unsupported"; path: string; reason: string };

export async function resolveGraphWorkspace(cwd: string, explicitWorkspace?: string): Promise<GraphWorkspaceResolution> {
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

export async function requireGraphWorkspace(cwd: string, explicitWorkspace?: string): Promise<string> {
  const resolution = await resolveGraphWorkspace(cwd, explicitWorkspace);
  if (resolution.status === "found") return resolution.workspace;
  if (resolution.status === "unsupported") throw new Error(`Unsupported graph workspace format: ${resolution.path} (${resolution.reason})`);
  if (resolution.status === "invalid") throw new Error(`Invalid graph workspace path: ${resolution.path}`);
  throw new Error("No schema 2 researchspec workspace found.");
}
