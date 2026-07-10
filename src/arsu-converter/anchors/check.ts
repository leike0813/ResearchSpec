import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { pathExists } from "../fs-utils.js";
import { findUncoveredRuntimeSurfaces } from "./coverage.js";
import { isAnchorFile, normalizeReplacementBody, REPLACEMENTS_DIR } from "./io.js";
import { isAnchorId } from "./markers.js";
import {
  CONTRACT_ANCHORS_PATH,
  generateUpstreamManifest,
  type ManifestHeading,
  type UpstreamManifest,
  type UpstreamManifestFile,
  UPSTREAM_MANIFEST_PATH,
} from "./manifest.js";
import type { ContractAnchor, ContractAnchorFile, CoverageDecision } from "./types.js";
import { isReplaceableAnchor } from "./types.js";

export interface AnchorValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  anchor_count: number;
  manifest_file_count: number;
}

export async function validateAnchorAssets(repoRoot = process.cwd()): Promise<AnchorValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const anchors = await readAnchorFile(path.join(repoRoot, CONTRACT_ANCHORS_PATH), errors);
  const manifest = await readManifestFile(path.join(repoRoot, UPSTREAM_MANIFEST_PATH), errors);

  if (anchors && manifest) {
    if (anchors.audited_commit !== manifest.upstream.commit) {
      errors.push(`Anchor audited commit ${anchors.audited_commit} does not match manifest commit ${manifest.upstream.commit}.`);
    }
    const uncovered = await findUncoveredRuntimeSurfaces(repoRoot, anchors, manifest.files.map((file) => file.path));
    errors.push(...uncovered.map((finding) => `Uncovered runtime contract surface: ${finding}.`));
  }

  if (anchors) {
    await validateAnchors(repoRoot, anchors, errors, warnings);
  }
  if (manifest) {
    await validateManifest(repoRoot, manifest, errors);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    anchor_count: anchors?.anchors.length ?? 0,
    manifest_file_count: manifest?.files.length ?? 0,
  };
}

async function readAnchorFile(filePath: string, errors: string[]): Promise<ContractAnchorFile | undefined> {
  try {
    const parsed: unknown = JSON.parse(await readFile(filePath, "utf8"));
    if (!isAnchorFile(parsed)) {
      errors.push(`${CONTRACT_ANCHORS_PATH} does not match the expected anchor file shape.`);
      return undefined;
    }
    return parsed;
  } catch (error) {
    errors.push(`${CONTRACT_ANCHORS_PATH} is not parseable JSON: ${formatError(error)}`);
    return undefined;
  }
}

async function readManifestFile(filePath: string, errors: string[]): Promise<UpstreamManifest | undefined> {
  try {
    const parsed: unknown = JSON.parse(await readFile(filePath, "utf8"));
    if (!isManifest(parsed)) {
      errors.push(`${UPSTREAM_MANIFEST_PATH} does not match the expected manifest shape.`);
      return undefined;
    }
    return parsed;
  } catch (error) {
    errors.push(`${UPSTREAM_MANIFEST_PATH} is not parseable JSON: ${formatError(error)}`);
    return undefined;
  }
}

async function validateAnchors(
  repoRoot: string,
  anchorFile: ContractAnchorFile,
  errors: string[],
  warnings: string[],
): Promise<void> {
  const seen = new Set<string>();
  const expectedBodies = new Set<string>();
  const bodyHashes = new Map<string, string>();
  for (const anchor of anchorFile.anchors) {
    if (seen.has(anchor.id)) {
      errors.push(`Duplicate anchor id: ${anchor.id}.`);
    }
    seen.add(anchor.id);
    if (!isAnchorId(anchor.id)) errors.push(`Anchor id does not use the registered domain format: ${anchor.id}.`);
    if (!anchor.name.trim()) errors.push(`Anchor ${anchor.id} must include a descriptive name.`);

    if (isReplaceableAnchor(anchor)) {
      validateSemanticProfile(anchor, errors);
      const bodyName = `${anchor.id}.md`;
      expectedBodies.add(bodyName);
      const bodyPath = path.join(repoRoot, REPLACEMENTS_DIR, bodyName);
      if (!(await pathExists(bodyPath))) {
        errors.push(`Replaceable anchor ${anchor.id} is missing body: ${bodyName}.`);
      } else {
        const rawBody = await readFile(bodyPath, "utf8");
        const body = normalizeReplacementBody(rawBody);
        if (!body) errors.push(`Replacement body is empty: ${bodyName}.`);
        if (rawBody.includes("\r")) errors.push(`Replacement body must use LF: ${bodyName}.`);
        if (!rawBody.endsWith("\n")) errors.push(`Replacement body must end with one newline: ${bodyName}.`);
        if (body.includes("<!--rs:") || body.includes("<!--/rs:")) {
          errors.push(`Replacement body must not contain runtime markers: ${bodyName}.`);
        }
        if (!anchor.researchspec_targets.some((target) => body.includes(target))) {
          errors.push(`Replacement body mentions none of its ResearchSpec targets: ${bodyName}.`);
        }
        const hash = createHash("sha256").update(body).digest("hex");
        const duplicate = bodyHashes.get(hash);
        if (duplicate) errors.push(`Replacement bodies are byte-identical: ${duplicate} and ${bodyName}.`);
        bodyHashes.set(hash, bodyName);
      }
    }

    const hintCount = countHints(anchor);
    if (hintCount === 0) {
      errors.push(`Anchor ${anchor.id} has no robust match hints.`);
    }

    const sourcePath = path.join(repoRoot, anchorFile.upstream_source, anchor.source_path);
    if (!(await pathExists(sourcePath))) {
      errors.push(`Anchor ${anchor.id} source file is missing: ${anchor.source_path}.`);
      continue;
    }

    const content = await readFile(sourcePath, "utf8");
    validateHintPresence(anchor, content, errors, warnings);
    validateReplacementScope(anchor, content, errors);
  }

  const actualBodies = (await readdir(path.join(repoRoot, REPLACEMENTS_DIR)))
    .filter((name) => name.endsWith(".md"));
  for (const body of actualBodies) {
    if (!expectedBodies.has(body)) errors.push(`Orphan replacement body: ${body}.`);
  }
  for (const body of expectedBodies) {
    if (!actualBodies.includes(body)) errors.push(`Replacement body not found in asset directory: ${body}.`);
  }

  validateCoverageDecisions(anchorFile.coverage_decisions, errors);
}

async function validateManifest(repoRoot: string, expected: UpstreamManifest, errors: string[]): Promise<void> {
  const actual = await generateUpstreamManifest(repoRoot);
  if (actual.upstream.commit !== expected.upstream.commit) {
    errors.push(
      `Manifest commit ${expected.upstream.commit} does not match current vendor/ars commit ${actual.upstream.commit}.`,
    );
  }

  const expectedPaths = expected.files.map((file) => file.path);
  const actualPaths = actual.files.map((file) => file.path);
  if (JSON.stringify(expectedPaths) !== JSON.stringify(actualPaths)) {
    errors.push("Manifest runtime file tree does not match current vendor/ars audited file tree.");
  }

  const actualByPath = new Map(actual.files.map((file) => [file.path, file]));
  for (const expectedFile of expected.files) {
    const actualFile = actualByPath.get(expectedFile.path);
    if (!actualFile) continue;
    compareManifestFile(expectedFile, actualFile, errors);
  }
}

function compareManifestFile(expected: UpstreamManifestFile, actual: UpstreamManifestFile, errors: string[]): void {
  if (expected.normalized_sha256 !== actual.normalized_sha256) {
    errors.push(`Manifest hash drift: ${expected.path}.`);
  }
  if (JSON.stringify(expected.frontmatter ?? null) !== JSON.stringify(actual.frontmatter ?? null)) {
    errors.push(`Manifest frontmatter drift: ${expected.path}.`);
  }
  if (JSON.stringify(expected.headings ?? []) !== JSON.stringify(actual.headings ?? [])) {
    errors.push(`Manifest heading tree drift: ${expected.path}.`);
  }
}

function validateHintPresence(
  anchor: ContractAnchor,
  content: string,
  errors: string[],
  warnings: string[],
): void {
  const headings = new Set(extractHeadingTitles(content));
  for (const heading of anchor.match_hints.headings ?? []) {
    if (!headings.has(heading)) {
      warnings.push(`Anchor ${anchor.id} heading hint not found: ${heading}.`);
    }
  }
  for (const snippet of anchor.match_hints.snippets ?? []) {
    if (!content.includes(snippet)) {
      errors.push(`Anchor ${anchor.id} snippet hint not found: ${snippet}.`);
    }
  }
  for (const keyword of anchor.match_hints.keywords ?? []) {
    if (!content.toLowerCase().includes(keyword.toLowerCase())) {
      errors.push(`Anchor ${anchor.id} keyword hint not found: ${keyword}.`);
    }
  }
}

function validateReplacementScope(anchor: ContractAnchor, content: string, errors: string[]): void {
  if (anchor.severity === "diagnostic") return;
  const scope = anchor.replacement_scope;
  if (!scope) {
    errors.push(`Replaceable anchor ${anchor.id} must declare replacement_scope.`);
    return;
  }
  for (const [label, snippet] of [["start", scope.start_snippet], ["end", scope.end_snippet]] as const) {
    if (!snippet.trim()) {
      errors.push(`Replaceable anchor ${anchor.id} has an empty ${label} boundary.`);
    } else if (!content.includes(snippet)) {
      errors.push(`Replaceable anchor ${anchor.id} ${label} boundary not found: ${snippet}.`);
    }
  }
}

function validateCoverageDecisions(decisions: CoverageDecision[], errors: string[]): void {
  const seen = new Set<string>();
  for (const decision of decisions) {
    if (seen.has(decision.id)) errors.push(`Duplicate coverage decision id: ${decision.id}.`);
    seen.add(decision.id);
    if (!decision.match_snippet.trim() || !decision.rationale.trim()) {
      errors.push(`Coverage decision ${decision.id} must include a match snippet and rationale.`);
    }
  }
}

function extractHeadingTitles(content: string): string[] {
  const headings: ManifestHeading[] = [];
  for (const line of content.split("\n")) {
    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (match) headings.push({ level: match[1].length, title: match[2] });
  }
  return headings.map((heading) => heading.title);
}

function countHints(anchor: ContractAnchor): number {
  const hintValues = [
    ...(anchor.match_hints.headings ?? []),
    ...(anchor.match_hints.snippets ?? []),
    ...(anchor.match_hints.keywords ?? []),
  ];
  return hintValues.filter((hint) => hint.trim().length > 0).length;
}

function validateSemanticProfile(anchor: ContractAnchor, errors: string[]): void {
  if (!isReplaceableAnchor(anchor)) return;
  if (anchor.researchspec_targets.length === 0) errors.push(`Replaceable anchor ${anchor.id} has no ResearchSpec targets.`);
  if (!anchor.replacement_scope.start_snippet.trim() || !anchor.replacement_scope.end_snippet.trim()) {
    errors.push(`Replaceable anchor ${anchor.id} has an empty replacement boundary.`);
  }
}

function isManifest(value: unknown): value is UpstreamManifest {
  if (!isRecord(value)) return false;
  return (
    value.schema_version === "researchspec.arsu.upstream-manifest.v0" &&
    isRecord(value.upstream) &&
    value.upstream.source_path === "vendor/ars" &&
    typeof value.upstream.commit === "string" &&
    Array.isArray(value.audited_roots) &&
    value.audited_roots.every((item) => typeof item === "string") &&
    Array.isArray(value.risk_keywords) &&
    value.risk_keywords.every((item) => typeof item === "string") &&
    Array.isArray(value.files) &&
    value.files.every(isManifestFile)
  );
}

function isManifestFile(value: unknown): value is UpstreamManifestFile {
  if (!isRecord(value)) return false;
  return (
    typeof value.path === "string" &&
    isFileKind(value.kind) &&
    typeof value.normalized_sha256 === "string" &&
    isOptionalFrontmatter(value.frontmatter) &&
    isOptionalHeadings(value.headings) &&
    Array.isArray(value.risk_hits) &&
    value.risk_hits.every(isRiskHit)
  );
}

function isRiskHit(value: unknown): value is UpstreamManifestFile["risk_hits"][number] {
  return isRecord(value) && typeof value.keyword === "string" && typeof value.count === "number";
}

function isOptionalFrontmatter(value: unknown): boolean {
  if (value === undefined) return true;
  return (
    isRecord(value) &&
    Array.isArray(value.keys) &&
    value.keys.every((item) => typeof item === "string") &&
    isRecord(value.values) &&
    Object.values(value.values).every((item) => typeof item === "string")
  );
}

function isOptionalHeadings(value: unknown): boolean {
  if (value === undefined) return true;
  return (
    Array.isArray(value) &&
    value.every((item) => isRecord(item) && typeof item.level === "number" && typeof item.title === "string")
  );
}

function isFileKind(value: unknown): value is UpstreamManifestFile["kind"] {
  return value === "markdown" || value === "json" || value === "yaml" || value === "text" || value === "other";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await validateAnchorAssets();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}
