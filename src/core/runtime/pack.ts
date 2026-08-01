import path from "node:path";
import { strToU8, zipSync, type Zippable } from "fflate";

import type { CurrentWorkspaceFile, CurrentWorkspaceIndex } from "./workspace-index.js";
import { sha256 } from "../workspace/write-plan.js";

const FIXED_DATE = new Date("1980-01-01T00:00:00.000Z");

export interface PackEntry { path: string; bytes: number; sha256: string }
export type CurrentPackScope = "all" | "specs" | "profile" | "subflows" | "changes" | `subflow:${string}` | `change:${string}`;

export class CurrentPackError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "CurrentPackError";
  }
}

export function buildCurrentContextPack(index: CurrentWorkspaceIndex, scope: CurrentPackScope = "all"): { bytes: Uint8Array; entries: PackEntry[]; sha256: string } {
  const selected = selectCurrentPackFiles(index, scope);
  const content = new Map<string, Uint8Array>();
  for (const file of selected) content.set(posix(file.relativePath), strToU8(file.text));
  const sourceEntries = [...content.entries()].sort(([left], [right]) => compareText(left, right))
    .map(([entryPath, bytes]) => ({ path: entryPath, bytes: bytes.length, sha256: sha256(bytes) }));
  const manifestBytes = strToU8(`${JSON.stringify({ schema_version: "1", scope, entries: sourceEntries }, null, 2)}\n`);
  content.set("manifest.json", manifestBytes);
  const zippable: Zippable = {};
  for (const [entryPath, bytes] of [...content.entries()].sort(([left], [right]) => compareText(left, right))) {
    zippable[entryPath] = [bytes, { mtime: FIXED_DATE, level: 6 }];
  }
  const bytes = zipSync(zippable, { level: 6 });
  const entries = [...sourceEntries, { path: "manifest.json", bytes: manifestBytes.length, sha256: sha256(manifestBytes) }].sort((left, right) => compareText(left.path, right.path));
  return { bytes, entries, sha256: sha256(bytes) };
}

function selectCurrentPackFiles(index: CurrentWorkspaceIndex, scope: CurrentPackScope): CurrentWorkspaceFile[] {
  const files = [...index.files.values()];
  const fixed = (file: CurrentWorkspaceFile) => file.relativePath === "config.yaml" || file.relativePath === "tool-installation-manifest.json" || file.relativePath.startsWith("profiles/") || file.relativePath.startsWith("specs/");
  const subflow = (file: CurrentWorkspaceFile) => /^subflows\/[^/]+\/(control\.yaml|handoff\.md)$/.test(file.relativePath);
  const change = (file: CurrentWorkspaceFile) => /^changes\/(?:archive\/)?[^/]+\/(change\.md|design\.md|tasks\.md|delta\.yaml)$/.test(file.relativePath);
  if (scope === "all") return files.filter((file) => fixed(file) || subflow(file) || change(file));
  if (scope === "specs") return files.filter((file) => file.relativePath.startsWith("specs/"));
  if (scope === "profile") return files.filter((file) => file.relativePath === "profiles/academic-pipeline.yaml");
  if (scope === "subflows") return files.filter(subflow);
  if (scope === "changes") return files.filter(change);
  if (scope.startsWith("subflow:")) {
    const id = scope.slice("subflow:".length);
    const records = index.subflowEntries.filter((item) => item.control?.instance_id === id);
    if (records.length !== 1) throw new CurrentPackError(records.length ? "pack_scope_ambiguous" : "pack_scope_not_found", `Subflow pack scope must resolve exactly once: ${id}`);
    const prefix = `subflows/${records[0]?.directoryName ?? ""}/`;
    return files.filter((file) => file.relativePath.startsWith(prefix) && subflow(file));
  }
  if (scope.startsWith("change:")) {
    const id = scope.slice("change:".length);
    const records = [...index.changes, ...index.archivedChanges].filter((item) => item.id === id);
    if (records.length !== 1) throw new CurrentPackError(records.length ? "pack_scope_ambiguous" : "pack_scope_not_found", `Change pack scope must resolve exactly once: ${id}`);
    const prefix = `${records[0]?.archived ? "changes/archive" : "changes"}/${records[0]?.directoryName ?? ""}/`;
    return files.filter((file) => file.relativePath.startsWith(prefix) && change(file));
  }
  throw new CurrentPackError("pack_scope_invalid", `Unknown pack scope: ${scope}`);
}


function posix(value: string): string { return value.split(path.sep).join("/"); }
function compareText(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
