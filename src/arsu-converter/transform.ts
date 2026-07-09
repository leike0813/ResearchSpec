import path from "node:path";
import { posix as posixPath } from "node:path";

import {
  DEFAULT_SKILL_GROUPS,
  HISTORY_TERMS,
  MACHINE_RESOURCE_SUFFIXES,
  OPTIONAL_SKILL_GROUPS,
  PLATFORM_TERMS,
  TEXT_RESOURCE_SUFFIXES,
} from "./config.js";
import type { DependencyRef, Finding } from "./types.js";

const PATH_RE =
  /(?<path>(?:shared|deep-research|academic-paper|academic-paper-reviewer|academic-pipeline|experiment-agent)\/[A-Za-z0-9_./@+%:-]+(?:\.md|\.json|\.yaml|\.yml|\.toml|\.tex|\.py))/g;
const MARKDOWN_LINK_RE = /(?<prefix>\[[^\]]+\]\()(?<link>[^)#][^)#]*)(?<suffix>(?:#[^)]+)?\))/g;
const SKILL_GROUPS = [...DEFAULT_SKILL_GROUPS, ...OPTIONAL_SKILL_GROUPS] as readonly string[];

export function scanFindings(text: string, filePath: string): Finding[] {
  const findings: Finding[] = [];
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    const lineNumber = index + 1;
    for (const term of PLATFORM_TERMS) {
      if (line.includes(term)) findings.push({ path: filePath, line: lineNumber, term, category: "platform_term" });
    }
    for (const term of HISTORY_TERMS) {
      if (line.includes(term)) findings.push({ path: filePath, line: lineNumber, term, category: "history_term" });
    }
    if (/\bschema[-_ ]?version\b/i.test(line)) {
      findings.push({ path: filePath, line: lineNumber, term: "schema version", category: "schema_version" });
    }
    if (/\bversion\s*[:=]\s*[0-9]/i.test(line)) {
      findings.push({ path: filePath, line: lineNumber, term: "version marker", category: "version_marker" });
    }
    if (/\b(?:issue|pr|pull request)\s+#?\d+\b|#\d{2,}/i.test(line)) {
      findings.push({
        path: filePath,
        line: lineNumber,
        term: "issue_or_pr_reference",
        category: "issue_reference",
      });
    }
  }
  return findings;
}

export function discoverDependencies(text: string, ownerGroup: string, knownSourcePaths: Set<string>): DependencyRef[] {
  const refs = new Map<string, DependencyRef>();
  for (const match of text.matchAll(PATH_RE)) {
    const sourcePath = (match.groups?.path ?? "").replace(/[.,;:]+$/, "");
    if (!knownSourcePaths.has(sourcePath) || !isDependencyForGroup(sourcePath, ownerGroup)) continue;
    refs.set(sourcePath, {
      source_path: sourcePath,
      output_path: dependencyOutputPath(sourcePath),
      kind: dependencyKind(sourcePath, ownerGroup),
    });
  }
  for (const sourcePath of discoverMarkdownSourceLinks(text, "", knownSourcePaths)) {
    if (!isDependencyForGroup(sourcePath, ownerGroup)) continue;
    refs.set(sourcePath, {
      source_path: sourcePath,
      output_path: dependencyOutputPath(sourcePath),
      kind: dependencyKind(sourcePath, ownerGroup),
    });
  }
  return [...refs.values()].sort((a, b) => a.source_path.localeCompare(b.source_path));
}

export function discoverMarkdownDependencies(
  text: string,
  sourcePath: string,
  ownerGroup: string,
  knownSourcePaths: Set<string>,
): DependencyRef[] {
  const refs = new Map<string, DependencyRef>();
  for (const resolved of discoverMarkdownSourceLinks(text, sourcePath, knownSourcePaths)) {
    if (!isDependencyForGroup(resolved, ownerGroup)) continue;
    refs.set(resolved, {
      source_path: resolved,
      output_path: dependencyOutputPath(resolved),
      kind: dependencyKind(resolved, ownerGroup),
    });
  }
  return [...refs.values()].sort((a, b) => a.source_path.localeCompare(b.source_path));
}

export function discoverMissingDependencies(text: string, ownerGroup: string, knownSourcePaths: Set<string>): string[] {
  const missing = new Set<string>();
  for (const match of text.matchAll(PATH_RE)) {
    const sourcePath = (match.groups?.path ?? "").replace(/[.,;:]+$/, "");
    if (isDependencyForGroup(sourcePath, ownerGroup) && !knownSourcePaths.has(sourcePath)) {
      missing.add(sourcePath);
    }
  }
  return [...missing].sort();
}

export function rewriteMarkdownLinks(
  text: string,
  sourcePath: string,
  currentOutputPath: string,
  sourceToOutput: Map<string, string>,
  knownSourcePaths: Set<string>,
): string {
  return text.replace(MARKDOWN_LINK_RE, (full, _prefix: string, _link: string, _suffix: string, _offset: number, _source: string, groups?: Record<string, string>) => {
    const link = groups?.link ?? "";
    if (shouldSkipLink(link)) return full;
    const normalized = normalizeSourceLink(sourcePath, link);
    const output = sourceToOutput.get(normalized);
    if (!knownSourcePaths.has(normalized) || !output) return full;
    return `${groups?.prefix ?? ""}${relativeLink(currentOutputPath, output)}${groups?.suffix ?? ")"}`;
  });
}

export function neutralizeUnresolvedMarkdownLinks(
  text: string,
  sourcePath: string,
  sourceToOutput: Map<string, string>,
  knownSourcePaths: Set<string>,
): string {
  return text.replace(MARKDOWN_LINK_RE, (full, _prefix: string, _link: string, _suffix: string, _offset: number, _source: string, groups?: Record<string, string>) => {
    const link = (groups?.link ?? "").trim();
    if (shouldSkipLink(link)) return full;
    const normalized = normalizeSourceLink(sourcePath, link);
    if (knownSourcePaths.has(normalized) && sourceToOutput.has(normalized)) return full;
    if (link === "path" || link === "url") return full;
    const prefix = groups?.prefix ?? "";
    return prefix.slice(1, -2);
  });
}

export function rewriteText(text: string, dependencyMap: Map<string, string>, currentOutputPath: string): string {
  let rewritten = text;
  const ordered = [...dependencyMap.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [sourcePath, outputPath] of ordered) {
    const replacement = relativeLink(currentOutputPath, outputPath);
    const pattern = new RegExp(`(?<!\\.\\./)(?<!assets/)(?<!references/)(?<!cross-skill/)${escapeRegExp(sourcePath)}`, "g");
    rewritten = rewritten.replace(pattern, replacement);
  }
  return rewritten;
}

export function isTextResource(filePath: string): boolean {
  return TEXT_RESOURCE_SUFFIXES.has(path.posix.extname(filePath));
}

export function isMachineResource(filePath: string): boolean {
  return MACHINE_RESOURCE_SUFFIXES.has(path.posix.extname(filePath));
}

function discoverMarkdownSourceLinks(text: string, sourcePath: string, knownSourcePaths: Set<string>): string[] {
  const refs = new Set<string>();
  for (const match of text.matchAll(MARKDOWN_LINK_RE)) {
    const link = match.groups?.link ?? "";
    if (shouldSkipLink(link)) continue;
    const normalized = normalizeSourceLink(sourcePath, link);
    if (knownSourcePaths.has(normalized)) refs.add(normalized);
  }
  return [...refs].sort();
}

function shouldSkipLink(link: string): boolean {
  return link.includes("://") || link.startsWith("#") || link.startsWith("mailto:");
}

function isDependencyForGroup(sourcePath: string, ownerGroup: string): boolean {
  const first = sourcePath.split("/", 1)[0] ?? "";
  if (first === "shared") return true;
  return SKILL_GROUPS.includes(first) && first !== ownerGroup;
}

function dependencyKind(sourcePath: string, ownerGroup: string): DependencyRef["kind"] {
  const first = sourcePath.split("/", 1)[0] ?? "";
  if (first === "shared") return "shared";
  if (SKILL_GROUPS.includes(first) && first !== ownerGroup) return "cross_skill";
  return "local";
}

function dependencyOutputPath(sourcePath: string): string {
  const baseDir = isMachineResource(sourcePath) ? "assets" : "references";
  if (sourcePath.startsWith("shared/")) return `${baseDir}/shared/${sourcePath.slice("shared/".length)}`;
  const [group, ...rest] = sourcePath.split("/");
  return `${baseDir}/cross-skill/${group}/${rest.join("/")}`;
}

function relativeLink(fromOutputPath: string, toOutputPath: string): string {
  const fromParent = posixPath.dirname(fromOutputPath);
  const fromParts = fromParent === "." ? [] : fromParent.split("/");
  const targetParts = toOutputPath.split("/");
  let common = 0;
  while (fromParts[common] !== undefined && fromParts[common] === targetParts[common]) {
    common += 1;
  }
  const ups = Array.from({ length: fromParts.length - common }, () => "..");
  const downs = targetParts.slice(common);
  const parts = [...ups, ...downs];
  return parts.length > 0 ? parts.join("/") : posixPath.basename(toOutputPath);
}

function normalizeSourceLink(sourcePath: string, link: string): string {
  const sourceParent = sourcePath ? posixPath.dirname(sourcePath) : ".";
  const combined = sourceParent === "." ? link : posixPath.join(sourceParent, link);
  const parts: string[] = [];
  for (const part of combined.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join("/");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
