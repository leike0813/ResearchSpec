import path from "node:path";

import { DEFAULT_SKILL_GROUPS } from "./config.js";
import { pathExists, readUtf8, sha256File } from "./fs-utils.js";
import { markerEnd, markerStart } from "./anchors/markers.js";
import { scanFindings } from "./transform.js";
import type { ConversionManifest, RiskFinding, ValidationResult } from "./types.js";

const LINK_RE = /\[[^\]]+\]\((?<link>[^)#]+)(?:#[^)]+)?\)/g;

export async function validateArsuOutput(outputRoot: string): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!(await pathExists(outputRoot))) {
    return { ok: false, errors: [`Missing generated output: ${outputRoot}`], warnings };
  }

  const manifestPath = path.join(outputRoot, "conversion-manifest.json");
  const reportPath = path.join(outputRoot, "conversion-report.md");
  const contractsPath = path.join(outputRoot, "researchspec-contracts.json");
  const manifest = await readJsonFile<ConversionManifest>(manifestPath, errors);

  if (!(await pathExists(reportPath))) errors.push("Missing conversion-report.md");
  if (!(await pathExists(contractsPath))) {
    errors.push("Missing researchspec-contracts.json");
  } else {
    await readJsonFile<unknown>(contractsPath, errors);
  }

  if (manifest) {
    const shape = validateManifestShape(manifest);
    errors.push(...shape.errors);
    warnings.push(...shape.warnings);
    errors.push(...await validateAnchorReplacementMarkers(outputRoot, manifest));
    const manifestFiles = outputFilesByPath(manifest);
    const actualFiles = await collectGeneratedFiles(outputRoot);

    for (const rel of actualFiles) {
      const record = manifestFiles.get(rel);
      if (!record) {
        errors.push(`Missing manifest entry for ${rel}`);
        continue;
      }
      const expectedHash = record.sha256;
      if (expectedHash !== await sha256File(path.join(outputRoot, rel))) {
        errors.push(`Hash mismatch for ${rel}`);
      }
      if (rel.endsWith(".json")) {
        await readJsonFile<unknown>(path.join(outputRoot, rel), errors, rel);
      }
    }

    for (const rel of [...manifestFiles.keys()].sort()) {
      if (!actualFiles.includes(rel)) errors.push(`Manifest entry missing output file: ${rel}`);
    }

    errors.push(...await validateRiskFindingCoverage(outputRoot, manifest));
  }

  for (const group of DEFAULT_SKILL_GROUPS) {
    const groupRoot = path.join(outputRoot, group);
    if (!(await pathExists(groupRoot))) {
      errors.push(`Missing skill group: ${group}`);
      continue;
    }
    const skillPath = path.join(groupRoot, "SKILL.md");
    if (!(await pathExists(skillPath))) {
      errors.push(`Missing ${group}/SKILL.md`);
    } else {
      const skillText = await readUtf8(skillPath);
      if (!skillText.includes("<!-- researchspec-contract-preflight:v1 -->")) {
        errors.push(`Missing Contract Preflight block in ${group}/SKILL.md`);
      }
    }
  }

  errors.push(...await validateMarkdownLinks(outputRoot));
  errors.sort();
  warnings.sort();
  return { ok: errors.length === 0, errors, warnings };
}

async function readJsonFile<T>(filePath: string, errors: string[], label = path.basename(filePath)): Promise<T | null> {
  if (!(await pathExists(filePath))) {
    errors.push(`Missing ${label}`);
    return null;
  }
  try {
    return JSON.parse(await readUtf8(filePath)) as T;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    errors.push(`Invalid JSON ${label}: ${detail}`);
    return null;
  }
}

function validateManifestShape(manifest: ConversionManifest): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const required = [
    "converter_version",
    "output_kind",
    "source_root",
    "output_root",
    "source_commit",
    "source_version",
    "generated_at",
    "generated_groups",
    "skill_groups",
    "output_files",
    "excluded",
    "unclassified_files",
    "risk_findings",
    "contract_compatibility",
    "validation_summary",
  ] as const;
  for (const key of required) {
    if (!(key in manifest)) errors.push(`Manifest missing key: ${key}`);
  }
  if (requiresAnchorReplacement(manifest)) {
    if (!("anchor_replacements" in manifest)) errors.push("Manifest missing key: anchor_replacements");
  } else if (!("anchor_replacements" in manifest)) {
    warnings.push("Manifest was generated before anchor replacement support; run pnpm arsu:convert to refresh.");
  }
  if (manifest.output_kind !== "final") errors.push("Manifest output_kind must be final");
  if (!Array.isArray(manifest.output_files)) errors.push("Manifest output_files must be a list");
  if (!Array.isArray(manifest.risk_findings)) errors.push("Manifest risk_findings must be a list");
  if (JSON.stringify(manifest.generated_groups) !== JSON.stringify([...DEFAULT_SKILL_GROUPS].sort())) {
    errors.push("Manifest generated_groups must list the required skill groups");
  }
  if (manifest.contract_compatibility?.material_passport_policy !== "compatibility_artifact_only_not_runtime_ssot") {
    errors.push("Manifest contract compatibility must keep Material Passport out of runtime SSOT");
  }
  if (requiresAnchorReplacement(manifest) && manifest.contract_compatibility?.anchor_replacement?.profile_id !== "researchspec-anchor-replacement-v2") {
    if (requiresSemanticAnchorReplacement(manifest)) {
      errors.push("Manifest contract compatibility must declare v2 anchor replacement profile");
    }
  }
  if (requiresAnchorReplacement(manifest) && manifest.contract_compatibility?.anchor_replacement?.coverage_policy !== "required_and_recommended") {
    errors.push("Manifest contract compatibility must declare required_and_recommended anchor replacement");
  }
  if (requiresAnchorReplacement(manifest) && (!manifest.anchor_replacements || manifest.anchor_replacements.coverage_policy !== "required_and_recommended")) {
    errors.push("Manifest anchor_replacements must declare required_and_recommended coverage");
  }
  return { errors, warnings };
}

async function validateAnchorReplacementMarkers(outputRoot: string, manifest: ConversionManifest): Promise<string[]> {
  const errors: string[] = [];
  const anchorReplacements = manifest.anchor_replacements;
  if (!anchorReplacements) return requiresAnchorReplacement(manifest) ? ["Manifest missing anchor_replacements"] : [];
  const requiresSemantic = requiresSemanticAnchorReplacement(manifest);

  const manifestMarkerIds = new Set(anchorReplacements.records.map((record) => record.marker_id));
  const anchorReportPath = path.join(outputRoot, "anchor-replacement-report.md");
  const anchorReportText = await pathExists(anchorReportPath) ? await readUtf8(anchorReportPath) : "";
  if (requiresSemantic && !anchorReportText) errors.push("Missing anchor-replacement-report.md");
  for (const record of anchorReplacements.records) {
    if (record.replacement_mode !== "replace") continue;
    if (requiresSemantic && record.semantic_role === undefined) errors.push(`Anchor replacement missing semantic role: ${record.anchor_id}`);
    if (requiresSemantic && record.researchspec_targets.length === 0) errors.push(`Anchor replacement missing ResearchSpec targets: ${record.anchor_id}`);
    if (requiresSemantic && record.replacement_shape === undefined) errors.push(`Anchor replacement missing replacement shape: ${record.anchor_id}`);
    if (requiresSemantic && (!record.before_sha256 || !record.after_sha256)) errors.push(`Anchor replacement missing before/after hash: ${record.anchor_id}`);
    if (requiresSemantic && !anchorReportText.includes(`### ${record.anchor_id}`)) {
      errors.push(`Anchor replacement report missing anchor: ${record.anchor_id}`);
    }
    if (!record.replaced) {
      errors.push(`Anchor replacement missing generated marker: ${record.anchor_id}`);
      continue;
    }
    if (record.output_paths.length === 0) {
      errors.push(`Anchor replacement has no output paths: ${record.anchor_id}`);
      continue;
    }
    for (const outputPath of record.output_paths) {
      const filePath = path.join(outputRoot, outputPath);
      if (!(await pathExists(filePath))) {
        errors.push(`Anchor replacement output file missing: ${record.anchor_id} -> ${outputPath}`);
        continue;
      }
      const text = await readUtf8(filePath);
      const markerBlock = extractMarkerBlock(text, record.anchor_id, requiresSemantic);
      if (!markerBlock.ok) {
        errors.push(`Anchor replacement marker missing in ${outputPath}: ${record.anchor_id}`);
        errors.push(...markerBlock.errors.map((error) => `${outputPath}: ${error}`));
        continue;
      }
      if (requiresSemantic && markerBlock.text.includes("### ResearchSpec Contract Replacement")) {
        errors.push(`Anchor replacement uses obsolete generic heading in ${outputPath}: ${record.anchor_id}`);
      }
      if (requiresSemantic && record.researchspec_targets.length > 0 && !record.researchspec_targets.some((target) => markerBlock.text.includes(target))) {
        errors.push(`Anchor replacement text missing declared ResearchSpec target in ${outputPath}: ${record.anchor_id}`);
      }
    }
  }

  const markerRe = /<!--rs:a:([0-9a-f]{12})-->/g;
  const markdownFiles = (await collectFiles(outputRoot, outputRoot)).filter((rel) => rel.endsWith(".md"));
  for (const rel of markdownFiles) {
    if (rel === "conversion-report.md" || rel === "anchor-replacement-report.md") continue;
    const text = await readUtf8(path.join(outputRoot, rel));
    for (const match of text.matchAll(markerRe)) {
      const markerId = match[1] ?? "";
      if (!manifestMarkerIds.has(markerId)) {
        errors.push(`Anchor replacement marker references unknown marker id: ${rel} -> ${markerId}`);
      }
    }
  }

  return errors;
}

function requiresAnchorReplacement(manifest: ConversionManifest): boolean {
  return compareVersion(manifest.converter_version, "0.2.0") >= 0;
}

function requiresSemanticAnchorReplacement(manifest: ConversionManifest): boolean {
  return compareVersion(manifest.converter_version, "0.3.0") >= 0;
}

function extractMarkerBlock(
  text: string,
  anchorId: string,
  requiresSemantic: boolean,
): { ok: boolean; text: string; errors: string[] } {
  const startMarker = markerStartForManifest(anchorId, requiresSemantic);
  const endMarker = requiresSemantic ? markerEnd(anchorId) : `researchspec-anchor-replacement:end anchor_id="${anchorId}"`;
  const starts = allIndices(text, startMarker);
  const ends = allIndices(text, endMarker);
  const errors: string[] = [];
  if (starts.length !== 1) errors.push(`expected one start marker for ${anchorId}, found ${String(starts.length)}`);
  if (ends.length !== 1) errors.push(`expected one end marker for ${anchorId}, found ${String(ends.length)}`);
  if (errors.length > 0) return { ok: false, text: "", errors };
  const start = starts[0];
  const end = ends[0];
  if (end < start) return { ok: false, text: "", errors: [`marker order is reversed for ${anchorId}`] };
  const endExclusive = end + endMarker.length;
  if (requiresSemantic) {
    if (start > 0 && text[start - 1] !== "\n") errors.push(`start marker is not on a standalone line for ${anchorId}`);
    if (endExclusive < text.length && text[endExclusive] !== "\n" && text.slice(endExclusive, endExclusive + 2) !== "\r\n") {
      errors.push(`end marker is not followed by a line boundary for ${anchorId}`);
    }
  }
  return { ok: errors.length === 0, text: text.slice(start, endExclusive), errors };
}

function allIndices(text: string, needle: string): number[] {
  const indices: number[] = [];
  let offset = 0;
  while (offset <= text.length) {
    const index = text.indexOf(needle, offset);
    if (index < 0) break;
    indices.push(index);
    offset = index + needle.length;
  }
  return indices;
}

function compareVersion(left: string, right: string): number {
  const leftParts = left.split(".").map((part) => Number(part));
  const rightParts = right.split(".").map((part) => Number(part));
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const diff = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function outputFilesByPath(manifest: ConversionManifest): Map<string, { sha256: string }> {
  const records = new Map<string, { sha256: string }>();
  for (const item of manifest.output_files) {
    records.set(item.output_path, { sha256: item.sha256 });
  }
  return records;
}

async function collectGeneratedFiles(outputRoot: string): Promise<string[]> {
  const files: string[] = ["researchspec-contracts.json"];
  if (await pathExists(path.join(outputRoot, "anchor-replacement-report.md"))) files.push("anchor-replacement-report.md");
  for (const group of DEFAULT_SKILL_GROUPS) {
    const groupRoot = path.join(outputRoot, group);
    if (!(await pathExists(groupRoot))) continue;
    files.push(...await collectFiles(groupRoot, outputRoot));
  }
  return files.sort();
}

function markerStartForManifest(anchorId: string, requiresSemantic: boolean): string {
  return requiresSemantic
    ? markerStart(anchorId)
    : `researchspec-anchor-replacement:start anchor_id="${anchorId}"`;
}

async function collectFiles(root: string, outputRoot: string): Promise<string[]> {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectFiles(absolute, outputRoot));
    } else if (entry.isFile()) {
      const rel = path.relative(outputRoot, absolute).split(path.sep).join("/");
      if (forbiddenRuntimeArtifact(rel)) files.push(rel);
      else files.push(rel);
    }
  }
  return files;
}

async function validateMarkdownLinks(outputRoot: string): Promise<string[]> {
  const errors: string[] = [];
  const markdownFiles = (await collectFiles(outputRoot, outputRoot)).filter((rel) => rel.endsWith(".md"));
  for (const rel of markdownFiles) {
    if (rel === "conversion-report.md" || rel === "anchor-replacement-report.md") continue;
    const absolute = path.join(outputRoot, rel);
    const text = await readUtf8(absolute);
    for (const match of text.matchAll(LINK_RE)) {
      const link = (match.groups?.link ?? "").trim();
      if (shouldSkipLink(link)) continue;
      if (shouldWarnUnresolvedLink(link)) continue;
      const target = path.resolve(path.dirname(absolute), link);
      if (!target.startsWith(path.resolve(outputRoot) + path.sep) && target !== path.resolve(outputRoot)) {
        errors.push(`Link escapes output root: ${rel} -> ${link}`);
        continue;
      }
      if (!(await pathExists(target))) errors.push(`Broken link: ${rel} -> ${link}`);
    }
  }
  return errors;
}

async function validateRiskFindingCoverage(outputRoot: string, manifest: ConversionManifest): Promise<string[]> {
  const errors: string[] = [];
  const reported = new Set(manifest.risk_findings.map(riskKey));
  const markdownFiles = (await collectFiles(outputRoot, outputRoot)).filter((rel) => rel.endsWith(".md"));
  for (const rel of markdownFiles) {
    if (rel === "conversion-report.md" || rel === "anchor-replacement-report.md") continue;
    const findings = scanFindings(await readUtf8(path.join(outputRoot, rel)), rel);
    for (const finding of findings) {
      const key = riskKey({
        path: finding.path,
        line: finding.line,
        category: finding.category,
        term: finding.term,
      });
      if (!reported.has(key)) {
        errors.push(`Unreported risk finding: ${finding.path}:${String(finding.line)} ${finding.category} ${finding.term}`);
      }
    }
  }
  return errors;
}

function forbiddenRuntimeArtifact(rel: string): boolean {
  const parts = rel.split("/");
  const forbiddenParts = new Set([".claude", ".claude-plugin", ".codex", ".codex-plugin", "commands", "hooks"]);
  if (parts.some((part) => forbiddenParts.has(part))) return true;
  return [
    "AGENT_HANDOFF.md",
    "preconversion-report.json",
    "cleanup-report.json",
    "cleanup-report.md",
    "skill-manifest.json",
  ].includes(parts[parts.length - 1] ?? "");
}

function shouldSkipLink(link: string): boolean {
  return (
    link.includes("://") ||
    link.startsWith("#") ||
    link.startsWith("mailto:") ||
    link.startsWith("http:") ||
    link.startsWith("https:") ||
    link === "path" ||
    link === "url"
  );
}

function shouldWarnUnresolvedLink(link: string): boolean {
  return (
    link.endsWith("/") ||
    link.includes("/docs/") ||
    link.startsWith("../docs/") ||
    link.includes("/scripts/") ||
    link.startsWith("../scripts/") ||
    link.startsWith("docs/") ||
    link.startsWith("scripts/") ||
    link.includes("/examples/") ||
    link.startsWith("../examples/")
  );
}

function riskKey(finding: Pick<RiskFinding, "path" | "line" | "category" | "term">): string {
  return `${finding.path}\0${String(finding.line)}\0${finding.category}\0${finding.term}`;
}
