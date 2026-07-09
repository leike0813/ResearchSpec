import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { VENDOR_SOURCE_PATH } from "../config.js";
import { listFiles } from "../fs-utils.js";
import { gitOutput } from "../git.js";

export const ANCHOR_DATA_DIR = "src/arsu-converter/anchors";
export const CONTRACT_ANCHORS_PATH = `${ANCHOR_DATA_DIR}/contract-anchors.json`;
export const UPSTREAM_MANIFEST_PATH = `${ANCHOR_DATA_DIR}/upstream-manifest.json`;

export const AUDITED_ROOTS = [
  "deep-research",
  "academic-paper",
  "academic-paper-reviewer",
  "academic-pipeline",
  "shared",
] as const;

export const CONTRACT_RISK_KEYWORDS = [
  "Material Passport",
  "Schema 5",
  "Schema 7",
  "Schema 8",
  "Schema 9",
  "Schema 11",
  "Schema 12",
  "handoff",
  "phase",
  "sprint contract",
  "generator-evaluator",
  "revision patch",
  "commitment ledger",
  "integrity gate",
  "review gate",
  "scripts/",
  "hooks/",
] as const;

export interface ManifestFrontmatter {
  keys: string[];
  values: Record<string, string>;
}

export interface ManifestHeading {
  level: number;
  title: string;
}

export interface ManifestRiskHit {
  keyword: string;
  count: number;
}

export interface UpstreamManifestFile {
  path: string;
  kind: "markdown" | "json" | "yaml" | "text" | "other";
  normalized_sha256: string;
  frontmatter?: ManifestFrontmatter;
  headings?: ManifestHeading[];
  risk_hits: ManifestRiskHit[];
}

export interface UpstreamManifest {
  schema_version: "researchspec.arsu.upstream-manifest.v0";
  upstream: {
    source_path: typeof VENDOR_SOURCE_PATH;
    commit: string;
  };
  audited_roots: readonly string[];
  risk_keywords: readonly string[];
  files: UpstreamManifestFile[];
}

export async function generateUpstreamManifest(repoRoot: string): Promise<UpstreamManifest> {
  const vendorRoot = path.join(repoRoot, VENDOR_SOURCE_PATH);
  const commit = await gitOutput(vendorRoot, ["rev-parse", "HEAD"]);
  const rootFiles = await listFiles(vendorRoot);
  const auditedFiles = rootFiles.filter((file) => AUDITED_ROOTS.some((root) => file === root || file.startsWith(`${root}/`)));
  const files = await Promise.all(
    auditedFiles.map(async (relativePath) => {
      const content = await readFile(path.join(vendorRoot, relativePath), "utf8");
      const normalized = normalizeContent(content);
      const entry: UpstreamManifestFile = {
        path: relativePath,
        kind: classifyFile(relativePath),
        normalized_sha256: sha256Text(normalized),
        risk_hits: findRiskHits(normalized),
      };

      if (relativePath.endsWith(".md")) {
        const frontmatter = extractFrontmatter(normalized);
        if (frontmatter) entry.frontmatter = frontmatter;
        entry.headings = extractHeadings(normalized);
      }

      return entry;
    }),
  );

  return {
    schema_version: "researchspec.arsu.upstream-manifest.v0",
    upstream: {
      source_path: VENDOR_SOURCE_PATH,
      commit,
    },
    audited_roots: [...AUDITED_ROOTS],
    risk_keywords: [...CONTRACT_RISK_KEYWORDS],
    files,
  };
}

export function normalizeContent(content: string): string {
  return `${content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd()}\n`;
}

export function sha256Text(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export function extractHeadings(content: string): ManifestHeading[] {
  const headings: ManifestHeading[] = [];
  for (const line of content.split("\n")) {
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (!match) continue;
    headings.push({ level: match[1].length, title: match[2] });
  }
  return headings;
}

function extractFrontmatter(content: string): ManifestFrontmatter | undefined {
  if (!content.startsWith("---\n")) return undefined;
  const end = content.indexOf("\n---\n", 4);
  if (end === -1) return undefined;
  const values: Record<string, string> = {};
  for (const line of content.slice(4, end).split("\n")) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    values[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return { keys: Object.keys(values).sort(), values };
}

function findRiskHits(content: string): ManifestRiskHit[] {
  const hits: ManifestRiskHit[] = [];
  for (const keyword of CONTRACT_RISK_KEYWORDS) {
    const count = countOccurrences(content, keyword);
    if (count > 0) hits.push({ keyword, count });
  }
  return hits;
}

function countOccurrences(content: string, needle: string): number {
  let count = 0;
  let position = 0;
  const lowerContent = content.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  while (true) {
    const next = lowerContent.indexOf(lowerNeedle, position);
    if (next === -1) return count;
    count += 1;
    position = next + lowerNeedle.length;
  }
}

function classifyFile(relativePath: string): UpstreamManifestFile["kind"] {
  const extension = path.extname(relativePath);
  if (extension === ".md") return "markdown";
  if (extension === ".json") return "json";
  if (extension === ".yaml" || extension === ".yml") return "yaml";
  if (extension === ".txt" || extension === ".tex" || extension === ".toml") return "text";
  return "other";
}
