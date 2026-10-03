import { lstat, readFile } from "node:fs/promises";
import path from "node:path";

import type { Diagnostic } from "../core/validation/types.js";
import { assertPathWithinRoot } from "../core/workspace/path-boundary.js";
import { planDirectFileEdit, sha256, type PlannedWrite } from "../core/workspace/write-plan.js";
import type { ManagedInstallation } from "./installations.js";
import { validateManagedTarget } from "./managed-target.js";
import { getTool, resolveToolIdAlias, type ToolDefinition } from "./tools.js";

const BEGIN = "<!-- researchspec:begin researchspec-entry -->";
const END = "<!-- researchspec:end researchspec-entry -->";
const MARKER_PREFIX = "<!-- researchspec:";

type Region = { kind: "none" } | { kind: "malformed" } | { kind: "valid"; start: number; end: number };

export function entryOwnedBytes(bytes: Uint8Array, installation: ManagedInstallation): Uint8Array | undefined {
  if (installation.source.kind !== "project-entry") return bytes;
  if (installation.source.mode === "file") return bytes;
  const region = findRegion(bytes);
  return region.kind === "valid" ? bytes.subarray(region.start, region.end) : undefined;
}

export async function planProjectEntryDelivery(input: {
  projectRoot: string;
  toolIds: readonly string[];
  installedEntries: readonly ManagedInstallation[];
  existingInstallations: readonly ManagedInstallation[];
}): Promise<{ operations: PlannedWrite[]; installations: ManagedInstallation[]; diagnostics: Diagnostic[] }> {
  const operations: PlannedWrite[] = [];
  const installations: ManagedInstallation[] = [];
  const diagnostics: Diagnostic[] = [];
  const recorded = new Map(input.existingInstallations.map((item) => [entryKey(item), item]));
  for (const [relative, consumers] of entryGroups(input.toolIds)) {
    const tool = consumers[0];
    const mode = tool.entry.mechanism;
    if (mode === "discovery") continue;
    const source = mode === "region"
      ? { kind: "project-entry" as const, mode, region_id: "researchspec-entry" as const }
      : { kind: "project-entry" as const, mode };
    const prior = recorded.get(`project:${relative}`);
    const installation: ManagedInstallation = {
      owner: "agent-tool", tool_id: tool.id, source,
      target: { scope: "project", path: relative, executable: false }, sha256: sha256(""),
    };
    const resolved = await validateManagedTarget(input.projectRoot, installation);
    if (prior && prior.source.kind !== "project-entry") {
      throw new Error(`Project entry destination has incompatible ownership: ${relative}`);
    }
    const snapshot = await readRegular(resolved.path);
    if (relative === "AGENTS.md" && consumers.some((item) => item.id === "opencode") && !snapshot && await pathExists(input.projectRoot, "CLAUDE.md")) {
      diagnostics.push(entryDiagnostic("project_entry_fallback_preserved", "Existing CLAUDE.md fallback was preserved; AGENTS.md was not created.", resolved.path, consumers));
      if (prior) installations.push(prior);
      continue;
    }
    const references = [...new Set(input.installedEntries
      .filter((item) => consumers.some((consumer) => consumer.id === item.tool_id))
      .filter((item) => item.source.kind === "command" && item.source.command_id === "navigate"
        || item.source.kind === "companion-skill" && item.source.skill_id === "researchspec-navigate" && item.target.path.endsWith("/SKILL.md"))
      .map((item) => item.target.path))].sort();
    if (!references.length) {
      diagnostics.push(entryDiagnostic("project_entry_asset_missing", "No delivered Navigate entry is available for this agreement.", resolved.path, consumers));
      if (prior) installations.push(prior);
      continue;
    }
    const lineEnding = snapshot && Buffer.from(snapshot.bytes).includes(Buffer.from("\r\n")) ? "\r\n" : "\n";
    const body = renderAgreement(references, mode === "file" && tool.entry.format === "mdc", lineEnding);
    const owned = mode === "region" ? Buffer.from(`${BEGIN}${lineEnding}${body}${END}${lineEnding}`) : Buffer.from(body);
    let next: Uint8Array;
    if (!snapshot) {
      next = owned;
    } else if (mode === "file") {
      if (!prior || sha256(snapshot.bytes) !== prior.sha256) {
        diagnostics.push(entryDiagnostic("project_entry_content_conflict", "Unowned or modified project entry file was preserved.", resolved.path, consumers));
        if (prior) installations.push(prior);
        continue;
      }
      next = owned;
    } else {
      const region = findRegion(snapshot.bytes);
      if (region.kind === "malformed" || region.kind === "none" && prior || region.kind === "valid" && (!prior || sha256(snapshot.bytes.subarray(region.start, region.end)) !== prior.sha256)) {
        diagnostics.push(entryDiagnostic("project_entry_content_conflict", "Unowned, missing, malformed or modified project entry region was preserved.", resolved.path, consumers));
        if (prior) installations.push(prior);
        continue;
      }
      if (region.kind === "none") {
        const separator = snapshot.bytes.length && snapshot.bytes.at(-1) !== 10 ? Buffer.from(lineEnding) : Buffer.alloc(0);
        next = Buffer.concat([snapshot.bytes, separator, owned]);
      } else {
        next = Buffer.concat([snapshot.bytes.subarray(0, region.start), owned, snapshot.bytes.subarray(region.end)]);
      }
    }
    const operation = planDirectFileEdit({ path: resolved.path, relativePath: relative, content: next,
      ...(snapshot ? { previousContent: snapshot.bytes } : {}), scope: "project", boundaryRoot: resolved.boundaryRoot,
      reason: "maintain project research entry agreement" });
    operation.ownership = "generated";
    if (snapshot) operation.nextMode = snapshot.mode;
    operations.push(operation);
    installations.push({ ...installation, sha256: sha256(owned) });
  }
  return { operations, installations, diagnostics };
}

export async function planProjectEntryRemoval(projectRoot: string, installation: ManagedInstallation): Promise<{ operation?: PlannedWrite; diagnostic?: Diagnostic; retain: boolean }> {
  const resolved = await validateManagedTarget(projectRoot, installation);
  const snapshot = await readRegular(resolved.path);
  if (!snapshot) return { retain: false };
  const owned = entryOwnedBytes(snapshot.bytes, installation);
  if (!owned || sha256(owned) !== installation.sha256) {
    return { retain: true, diagnostic: entryDiagnostic("project_entry_drift", "Modified or malformed project entry content was preserved.", resolved.path) };
  }
  if (installation.source.kind !== "project-entry") throw new Error("Expected a project entry installation.");
  if (installation.source.mode === "file") {
    return { retain: false, operation: {
      action: "remove-owned", path: resolved.path, relativePath: installation.target.path, scope: "project",
      ownership: "generated", boundaryRoot: resolved.boundaryRoot, previousHash: sha256(snapshot.bytes),
      reason: "remove deselected project entry file",
    } };
  }
  const region = findRegion(snapshot.bytes);
  if (region.kind !== "valid") throw new Error("Valid owned region was lost during removal planning.");
  const next = Buffer.concat([snapshot.bytes.subarray(0, region.start), snapshot.bytes.subarray(region.end)]);
  const operation = planDirectFileEdit({ path: resolved.path, relativePath: installation.target.path, content: next,
    previousContent: snapshot.bytes, scope: "project", boundaryRoot: resolved.boundaryRoot,
    reason: "remove deselected project entry region" });
  operation.ownership = "generated";
  operation.nextMode = snapshot.mode;
  return { operation, retain: false };
}

export async function inspectProjectEntries(projectRoot: string, toolIds: readonly string[], installations: readonly ManagedInstallation[]): Promise<Diagnostic[]> {
  const diagnostics: Diagnostic[] = [];
  const recorded = new Map(installations.map((item) => [entryKey(item), item]));
  for (const [relative, consumers] of entryGroups(toolIds)) {
    const tool = consumers[0];
    const mode = tool.entry.mechanism;
    if (mode === "discovery") continue;
    const target = path.join(projectRoot, ...relative.split("/"));
    const prior = recorded.get(`project:${relative}`);
    let snapshot;
    try {
      if (prior) await validateManagedTarget(projectRoot, prior);
      else await assertPathWithinRoot(projectRoot, target);
      snapshot = await readRegular(target);
    } catch (error) {
      diagnostics.push({ severity: "error", code: "project_entry_path_invalid", blocking: true, path: target,
        message: error instanceof Error ? error.message : String(error), details: { tool_ids: consumers.map((item) => item.id) } });
      continue;
    }
    if (!snapshot) {
      diagnostics.push(entryDiagnostic("project_entry_missing", "Project research entry agreement is absent.", target, consumers));
      if (relative === "AGENTS.md" && consumers.some((item) => item.id === "opencode") && await pathExists(projectRoot, "CLAUDE.md")) {
        diagnostics.push(entryDiagnostic("project_entry_fallback_preserved", "Existing CLAUDE.md fallback prevented AGENTS.md creation.", target, consumers));
      }
      continue;
    }
    const region = mode === "region" ? findRegion(snapshot.bytes) : undefined;
    if (region?.kind === "malformed") diagnostics.push(entryDiagnostic("project_entry_malformed", "Project entry markers are malformed.", target, consumers));
    else if (!prior) diagnostics.push(entryDiagnostic("project_entry_unowned", "Project entry destination has no manifest ownership record.", target, consumers));
    else {
      const owned = entryOwnedBytes(snapshot.bytes, prior);
      if (!owned || sha256(owned) !== prior.sha256) {
        diagnostics.push(entryDiagnostic("project_entry_drift", "Project entry content differs from its ownership record.", target, consumers));
      }
    }
    if (relative === "AGENTS.md" && consumers.some((item) => item.id === "codex") && await nonemptyFile(projectRoot, "AGENTS.override.md")) {
      diagnostics.push(entryDiagnostic("project_entry_shadowed", "Root AGENTS.override.md can shadow the installed AGENTS.md agreement.", target, consumers));
    }
  }
  return diagnostics;
}

function entryGroups(toolIds: readonly string[]): Map<string, ToolDefinition[]> {
  const groups = new Map<string, ToolDefinition[]>();
  for (const id of [...new Set(toolIds.map(resolveToolIdAlias))].sort()) {
    const tool = getTool(id);
    if (!tool || !tool.entry.path) continue;
    const group = groups.get(tool.entry.path) ?? [];
    group.push(tool);
    groups.set(tool.entry.path, group);
  }
  return groups;
}

function renderAgreement(references: readonly string[], cursor: boolean, newline: string): string {
  const lines = [
    ...(cursor ? ["---", "alwaysApply: true", "---", ""] : []),
    "# ResearchSpec research entry",
    "",
    "For literature synthesis, manuscript writing or revision, evidence checks, peer review, reviewer replies, patent research or document preparation, or continuing research in this initialized project, use the Navigate entry below even when the user does not name ResearchSpec.",
    "Begin with `researchspec status --json`. Continue a related unfinished run through its exact instructions. For ordinary work, discover a suitable Procedure with `researchspec list procedures --query \"<original user request>\" --json`, preserving Chinese or mixed language. Compare purposes and declared input/output roles; make at most one focused reformulation when no candidate fits. Read the selected Procedure's current instructions, check required materials, and save declared outputs as ordinary project files. Use a graph entry only when formal controls or auditable workflow state are needed, after its own confirmation.",
    "For sustained ordinary work, check `work/researchspec-notes/` against current materials before continuing.",
    "Unrelated work and explicit opt-out stay outside ResearchSpec. Discovery does not authorize a graph start, external access, plugin installation or other consent-bound action.",
    "",
    "Navigate entry:",
    ...references.map((reference) => `- \`${reference}\``),
    "",
  ];
  return lines.join(newline);
}

function findRegion(bytes: Uint8Array): Region {
  const text = Buffer.from(bytes).toString("latin1");
  const begins = [...text.matchAll(/<!-- researchspec:begin researchspec-entry -->/g)];
  const ends = [...text.matchAll(/<!-- researchspec:end researchspec-entry -->/g)];
  if (!begins.length && !ends.length) return text.includes(MARKER_PREFIX) ? { kind: "malformed" } : { kind: "none" };
  if (begins.length !== 1 || ends.length !== 1 || [...text.matchAll(/<!-- researchspec:/g)].length !== 2) return { kind: "malformed" };
  const start = begins[0].index;
  const endMarker = ends[0].index;
  if (start === undefined || endMarker === undefined || start >= endMarker) return { kind: "malformed" };
  if (!(start === 0 || start === 3 && text.startsWith("\xEF\xBB\xBF") || text[start - 1] === "\n") || text[endMarker - 1] !== "\n") return { kind: "malformed" };
  const afterBegin = start + BEGIN.length;
  if (!text.startsWith("\n", afterBegin) && !text.startsWith("\r\n", afterBegin)) return { kind: "malformed" };
  const after = endMarker + END.length;
  const lineEnding = text.startsWith("\r\n", after) ? 2 : text.startsWith("\n", after) ? 1 : 0;
  if (after + lineEnding < text.length && lineEnding === 0) return { kind: "malformed" };
  return { kind: "valid", start, end: after + lineEnding };
}

async function readRegular(target: string): Promise<{ bytes: Uint8Array; mode: number } | undefined> {
  let info;
  try { info = await lstat(target); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined; throw error; }
  if (!info.isFile() || info.isSymbolicLink()) throw new Error(`Project entry target is not a regular file: ${target}`);
  return { bytes: await readFile(target), mode: info.mode & 0o777 };
}

async function pathExists(root: string, relative: string): Promise<boolean> {
  const target = path.join(root, relative);
  try { await lstat(target); return true; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return false; throw error; }
}

async function nonemptyFile(root: string, relative: string): Promise<boolean> {
  const target = path.join(root, relative);
  let info;
  try { info = await lstat(target); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return false; throw error; }
  if (info.isSymbolicLink()) return true;
  if (!info.isFile()) return false;
  return Boolean((await readFile(target, "utf8")).trim());
}

function entryDiagnostic(code: string, message: string, target: string, consumers: readonly ToolDefinition[] = []): Diagnostic {
  return { severity: "warning", code, message, path: target, blocking: false,
    details: { tool_ids: consumers.map((item) => item.id) } };
}

function entryKey(item: ManagedInstallation): string { return `${item.target.scope}:${item.target.path}`; }
