import { readFile, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import { strToU8, zipSync, type Zippable } from "fflate";

import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import { sha256 } from "../workspace/write-plan.js";
import { isPathContained, resolveRegisteredArtifactPath, toPosixPath } from "./artifact-path.js";
import { renderHandoff } from "./handoff.js";

const FIXED_DATE = new Date("1980-01-01T00:00:00.000Z");

export interface PackEntry { path: string; bytes: number; sha256: string }

export async function buildContextPack(snapshot: WorkspaceSnapshot, includeArtifacts: boolean): Promise<{ bytes: Uint8Array; entries: PackEntry[]; sha256: string }> {
  const content = new Map<string, Uint8Array>();
  for (const file of snapshot.files.values()) content.set(posix(file.relativePath), file.bytes);
  await addTree(content, snapshot.workspace, "changes");
  await addTree(content, snapshot.workspace, "draft-patches");
  content.set("runs/current/handoff.md", strToU8(await renderHandoff(snapshot)));

  if (includeArtifacts) {
    for (const artifact of snapshot.artifacts) {
      if (typeof artifact.path !== "string") continue;
      const resolved = resolveRegisteredArtifactPath(snapshot, artifact.path);
      if (!resolved.contained) continue;
      try {
        const [realRoot, realArtifact] = await Promise.all([realpath(resolved.root), realpath(resolved.absolutePath)]);
        if (!isPathContained(realRoot, realArtifact)) continue;
        content.set(`artifacts/${toPosixPath(artifact.path)}`, await readFile(realArtifact));
      } catch { /* check reports missing artifacts */ }
    }
  }

  const entries: PackEntry[] = [...content.entries()].sort(([a], [b]) => compareText(a, b)).map(([entryPath, bytes]) => ({ path: entryPath, bytes: bytes.length, sha256: sha256(bytes) }));
  const manifestBytes = strToU8(`${JSON.stringify({ schema_version: "1", entries }, null, 2)}\n`);
  content.set("manifest.json", manifestBytes);

  const zippable: Zippable = {};
  for (const [entryPath, bytes] of [...content.entries()].sort(([a], [b]) => compareText(a, b))) {
    zippable[entryPath] = [bytes, { mtime: FIXED_DATE, level: 6 }];
  }
  const bytes = zipSync(zippable, { level: 6 });
  return { bytes, entries: [...entries, { path: "manifest.json", bytes: manifestBytes.length, sha256: sha256(manifestBytes) }].sort((a, b) => compareText(a.path, b.path)), sha256: sha256(bytes) };
}

async function addTree(content: Map<string, Uint8Array>, workspace: string, relativeRoot: string): Promise<void> {
  const absoluteRoot = path.join(workspace, relativeRoot);
  let entries;
  try { entries = await readdir(absoluteRoot, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    if (entry.name === "archive") continue;
    const relative = path.join(relativeRoot, entry.name);
    if (entry.isDirectory()) await addTree(content, workspace, relative);
    else if (entry.isFile()) content.set(posix(relative), await readFile(path.join(workspace, relative)));
  }
}

function posix(value: string): string { return value.split(path.sep).join("/"); }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
