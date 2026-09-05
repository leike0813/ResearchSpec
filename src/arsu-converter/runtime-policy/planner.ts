import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { listFiles } from "../fs-utils.js";
import { ArsuConverterError } from "../types.js";
import {
  ARSU_RUNTIME_POLICY_CATALOG,
  RUNTIME_POLICY_ACTIVE_TRIGGER_RE,
  RUNTIME_POLICY_MATCH_RE,
} from "./catalog.js";
import type {
  RuntimePolicyAdaptationRecord,
  RuntimePolicyCatalog,
  RuntimePolicyCatalogEntry,
  RuntimePolicyPlan,
  RuntimePolicyRewriteSpan,
  SerializableRuntimePolicyPlan,
} from "./types.js";

const HOST_NATIVE_ASSET = "src/arsu-converter/runtime-policy/assets/host-native-delegation.md";
const CROSS_MODEL_ASSET = "src/arsu-converter/runtime-policy/assets/cross-model-verification.md";
const MODEL_TIERING_ASSET = "src/arsu-converter/runtime-policy/assets/model-tiering.md";
const RUNTIME_TEXT_SUFFIXES = new Set([".md", ".json", ".yaml", ".yml"]);
const RUNTIME_ROOTS = new Set(["deep-research", "academic-paper", "academic-paper-reviewer", "academic-pipeline", "shared"]);

export async function buildRuntimePolicyPlan(
  repoRoot: string,
  sourceRoot: string,
  sourceCommit: string,
  catalog: RuntimePolicyCatalog = ARSU_RUNTIME_POLICY_CATALOG,
): Promise<RuntimePolicyPlan> {
  const errors: string[] = [];
  const canonical = catalog.catalog_id === ARSU_RUNTIME_POLICY_CATALOG.catalog_id;
  if (catalog.source_commit !== "*" && sourceCommit !== catalog.source_commit) {
    errors.push(`runtime-policy source commit mismatch: expected ${catalog.source_commit}, found ${sourceCommit}`);
  }

  const duplicatePaths = duplicates(catalog.entries.map((entry) => entry.source_path));
  if (duplicatePaths.length > 0) errors.push(...duplicatePaths.map((item) => `duplicate runtime-policy entry: ${item}`));
  if (canonical && catalog.entries.length !== 41) errors.push(`runtime-policy catalog must classify exactly 41 source files, found ${String(catalog.entries.length)}`);
  if (canonical && catalog.checker_closure.length !== 5) errors.push("runtime-policy checker closure must contain exactly five files");

  const catalogPaths = new Set(catalog.entries.map((entry) => entry.source_path));
  const exclusions = new Set<string>(catalog.excluded_non_runtime_paths);
  const matchedPaths: string[] = [];
  for (const sourcePath of await listFiles(sourceRoot)) {
    if (!RUNTIME_ROOTS.has(sourcePath.split("/")[0] ?? "")) continue;
    if (!RUNTIME_TEXT_SUFFIXES.has(path.extname(sourcePath).toLowerCase())) continue;
    const text = await readFile(path.join(sourceRoot, sourcePath), "utf8");
    if (RUNTIME_POLICY_MATCH_RE.test(text)) matchedPaths.push(sourcePath);
  }
  const classifiedMatches = matchedPaths.filter((sourcePath) => !exclusions.has(sourcePath)).sort();
  for (const sourcePath of classifiedMatches) {
    if (!catalogPaths.has(sourcePath)) errors.push(`unclassified runtime-policy match: ${sourcePath}`);
  }
  for (const entry of catalog.entries) {
    if (!classifiedMatches.includes(entry.source_path)) errors.push(`catalog entry no longer matches runtime-policy keywords: ${entry.source_path}`);
  }
  for (const sourcePath of exclusions) {
    if (!matchedPaths.includes(sourcePath)) errors.push(`non-runtime exclusion no longer matches policy keywords: ${sourcePath}`);
  }

  const assets = catalog.entries.some((entry) => entry.disposition === "adapt")
    ? {
        paragraphs: normalizeAsset(await readFile(path.join(repoRoot, HOST_NATIVE_ASSET), "utf8")),
        cross_model_reference: normalizeAsset(await readFile(path.join(repoRoot, CROSS_MODEL_ASSET), "utf8")),
        model_tiering_reference: normalizeAsset(await readFile(path.join(repoRoot, MODEL_TIERING_ASSET), "utf8")),
      }
    : { paragraphs: "", cross_model_reference: "", model_tiering_reference: "" };
  const records: RuntimePolicyAdaptationRecord[] = [];
  const spansBySource = new Map<string, RuntimePolicyRewriteSpan[]>();

  for (const entry of catalog.entries) {
    const sourceFile = path.join(sourceRoot, entry.source_path);
    let text = "";
    try {
      text = await readFile(sourceFile, "utf8");
    } catch (error) {
      errors.push(`runtime-policy source missing: ${entry.source_path}: ${formatError(error)}`);
      continue;
    }
    if (entry.disposition === "retain") {
      records.push(recordFor(entry, true, false));
      continue;
    }
    const adaptation = entry.adaptation ?? "paragraphs";
    const spans = adaptation === "paragraphs"
      ? paragraphSpans(entry.source_path, text, assets.paragraphs)
      : [fullFileSpan(entry.source_path, text, assets[adaptation])];
    if (spans.length === 0) {
      errors.push(`active runtime-policy source has no adaptation span: ${entry.source_path}`);
      continue;
    }
    spansBySource.set(entry.source_path, spans);
    records.push(...spans.map((span) => ({
      ...recordFor(entry, true, false),
      rewrite_id: span.rewrite_id,
      before_sha256: sha256Text(text.slice(span.start, span.end)),
      before_text: text.slice(span.start, span.end),
    })));
  }

  if (catalog.checker_closure.some((item) => item.adaptation === "sprint_schema_path")) {
    await addSprintSchemaRewrite(sourceRoot, spansBySource, records, errors);
  }
  if (catalog.checker_closure.some((item) => item.adaptation === "reviewer_assets_root")) {
    await addReviewerAssetsRootRewrite(sourceRoot, spansBySource, records, errors);
  }
  await addUnavailableRuntimeRewrites(sourceRoot, spansBySource, records, errors, catalog);
  await validateCheckerClosure(sourceRoot, catalog, errors);
  if (errors.length > 0) {
    throw new ArsuConverterError(
      "runtime_policy_invalid",
      "ARSU runtime policy failed before generated output was touched.",
      errors.sort(),
    );
  }

  return {
    schema_version: catalog.schema_version,
    catalog_id: catalog.catalog_id,
    source_commit: sourceCommit,
    catalog_sha256: sha256Text(JSON.stringify(catalog)),
    classified_source_count: catalog.entries.length,
    adapted_source_count: catalog.entries.filter((entry) => entry.disposition === "adapt").length,
    retained_source_count: catalog.entries.filter((entry) => entry.disposition === "retain").length,
    records,
    checker_closure: catalog.checker_closure.map((item) => ({ ...item })),
    spans_by_source: spansBySource,
  };
}

export function markRuntimePolicyAdapted(
  plan: RuntimePolicyPlan,
  rewriteId: string,
  outputPath: string,
  afterText: string,
): void {
  const record = plan.records.find((item) => item.rewrite_id === rewriteId);
  if (!record) return;
  record.adapted = true;
  if (!record.output_paths.includes(outputPath)) record.output_paths.push(outputPath);
  record.after_text = afterText;
  record.after_sha256 = sha256Text(afterText);
}

export function serializableRuntimePolicyPlan(plan: RuntimePolicyPlan): SerializableRuntimePolicyPlan {
  return {
    schema_version: plan.schema_version,
    catalog_id: plan.catalog_id,
    source_commit: plan.source_commit,
    catalog_sha256: plan.catalog_sha256,
    classified_source_count: plan.classified_source_count,
    adapted_source_count: plan.adapted_source_count,
    retained_source_count: plan.retained_source_count,
    checker_closure: plan.checker_closure.map((item) => ({ ...item })),
    records: plan.records.map((record) => ({
      rewrite_id: record.rewrite_id,
      source_path: record.source_path,
      disposition: record.disposition,
      rationale: record.rationale,
      matched: record.matched,
      adapted: record.adapted,
      output_paths: [...record.output_paths].sort(),
      before_sha256: record.before_sha256,
      after_sha256: record.after_sha256,
    })).sort((left, right) => left.rewrite_id.localeCompare(right.rewrite_id)),
  };
}

export function buildRuntimePolicyReport(plan: RuntimePolicyPlan): string {
  const lines = [
    "# ARSU Runtime Policy Report",
    "",
    "This converter-owned audit is not active Skill guidance. Quoted upstream Before text is evidence only.",
    "",
    `- Catalog: \`${plan.catalog_id}\``,
    `- Source commit: \`${plan.source_commit}\``,
    `- Catalog SHA-256: \`${plan.catalog_sha256}\``,
    `- Classified sources: ${String(plan.classified_source_count)}`,
    `- Adapted sources: ${String(plan.adapted_source_count)}`,
    `- Retained sources: ${String(plan.retained_source_count)}`,
    "",
    "## Checker Closure",
    "",
    ...plan.checker_closure.map((item) => `- \`${item.source_path}\` -> \`${item.output_path}\` (${item.adaptation})`),
    "",
    "## Adaptations",
    "",
  ];
  for (const record of [...plan.records].sort((left, right) => left.rewrite_id.localeCompare(right.rewrite_id))) {
    lines.push(
      `### ${record.rewrite_id}`,
      "",
      `- Source: \`${record.source_path}\``,
      `- Disposition: \`${record.disposition}\``,
      `- Before SHA-256: \`${record.before_sha256 ?? "not-applicable"}\``,
      `- After SHA-256: \`${record.after_sha256 ?? "not-applicable"}\``,
      `- Outputs: ${record.output_paths.length > 0 ? record.output_paths.map((item) => `\`${item}\``).join(", ") : "_none_"}`,
      `- Rationale: ${record.rationale}`,
      "",
    );
    if (record.before_text !== undefined) {
      lines.push("#### Before (audit evidence only)", "", fenced(record.before_text), "", "#### After", "", fenced(record.after_text ?? ""), "");
    }
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

function paragraphSpans(sourcePath: string, text: string, replacement: string): RuntimePolicyRewriteSpan[] {
  const startOffset = frontmatterEnd(text);
  const raw: Array<{ start: number; end: number }> = [];
  let cursor = startOffset;
  for (const match of text.slice(startOffset).matchAll(/\n[ \t]*\n/g)) {
    const boundary = startOffset + (match.index ?? 0);
    if (boundary > cursor) {
      const block = text.slice(cursor, boundary);
      if (RUNTIME_POLICY_ACTIVE_TRIGGER_RE.test(block)) raw.push({ start: cursor, end: boundary });
    }
    cursor = boundary + match[0].length;
  }
  if (cursor < text.length && RUNTIME_POLICY_ACTIVE_TRIGGER_RE.test(text.slice(cursor))) raw.push({ start: cursor, end: text.length });
  const merged: Array<{ start: number; end: number }> = [];
  for (const span of raw) {
    const previous = merged.at(-1);
    if (previous && /^\s*$/.test(text.slice(previous.end, span.start))) previous.end = span.end;
    else merged.push({ ...span });
  }
  return merged.map((span, index) => makeSpan(`${policyId(sourcePath)}-${String(index + 1).padStart(2, "0")}`, sourcePath, span.start, span.end, replacement));
}

function fullFileSpan(sourcePath: string, text: string, replacement: string): RuntimePolicyRewriteSpan {
  return makeSpan(`${policyId(sourcePath)}-full`, sourcePath, 0, text.length, replacement);
}

function makeSpan(rewriteId: string, sourcePath: string, start: number, end: number, replacementText: string): RuntimePolicyRewriteSpan {
  return { rewrite_id: rewriteId, source_path: sourcePath, start, end, replacement_text: replacementText, replacement_sha256: sha256Text(replacementText) };
}

async function addSprintSchemaRewrite(
  sourceRoot: string,
  spansBySource: Map<string, RuntimePolicyRewriteSpan[]>,
  records: RuntimePolicyAdaptationRecord[],
  errors: string[],
): Promise<void> {
  const sourcePath = "scripts/check_sprint_contract.py";
  const sourceFile = path.join(sourceRoot, sourcePath);
  const oldLine = 'SCHEMA_PATH = Path(__file__).resolve().parent.parent / "shared" / "sprint_contract.schema.json"';
  const newLine = 'SCHEMA_PATH = Path(__file__).resolve().parent.parent / "assets" / "shared" / "sprint_contract.schema.json"';
  try {
    const text = await readFile(sourceFile, "utf8");
    const matches = allIndices(text, oldLine);
    if (matches.length !== 1) {
      errors.push(`sprint checker schema path matched ${String(matches.length)} times`);
      return;
    }
    const span = makeSpan("checker-sprint-schema-path", sourcePath, matches[0], matches[0] + oldLine.length, newLine);
    spansBySource.set(sourcePath, [span]);
    records.push({
      rewrite_id: span.rewrite_id,
      source_path: sourcePath,
      disposition: "adapt",
      rationale: "Reuse the reviewer Skill's existing packaged sprint-contract schema.",
      matched: true,
      adapted: false,
      output_paths: [],
      before_sha256: sha256Text(oldLine),
      before_text: oldLine,
    });
  } catch (error) {
    errors.push(`sprint checker missing: ${formatError(error)}`);
  }
}

async function addReviewerAssetsRootRewrite(
  sourceRoot: string,
  spansBySource: Map<string, RuntimePolicyRewriteSpan[]>,
  records: RuntimePolicyAdaptationRecord[],
  errors: string[],
): Promise<void> {
  const sourcePath = "scripts/review_panel_provenance.py";
  const sourceFile = path.join(sourceRoot, sourcePath);
  const oldLine = "REPO_ROOT = Path(__file__).resolve().parent.parent";
  const newLine = "REPO_ROOT = Path(__file__).resolve().parent.parent / \"assets\"";
  try {
    const text = await readFile(sourceFile, "utf8");
    const matches = allIndices(text, oldLine);
    if (matches.length !== 1) {
      errors.push(`reviewer provenance assets root matched ${String(matches.length)} times`);
      return;
    }
    const span = makeSpan("checker-reviewer-assets-root", sourcePath, matches[0], matches[0] + oldLine.length, newLine);
    spansBySource.set(sourcePath, [span]);
    records.push({
      rewrite_id: span.rewrite_id,
      source_path: sourcePath,
      disposition: "adapt",
      rationale: "Point the reviewer provenance checker at the generated package's static assets tree.",
      matched: true,
      adapted: false,
      output_paths: [],
      before_sha256: sha256Text(oldLine),
      before_text: oldLine,
    });
  } catch (error) {
    errors.push(`reviewer provenance checker missing: ${formatError(error)}`);
  }
}

async function addUnavailableRuntimeRewrites(
  sourceRoot: string,
  spansBySource: Map<string, RuntimePolicyRewriteSpan[]>,
  records: RuntimePolicyAdaptationRecord[],
  errors: string[],
  catalog: RuntimePolicyCatalog,
): Promise<void> {
  const additions = new Map<string, RuntimePolicyRewriteSpan[]>();
  for (const item of catalog.unavailable_runtime_references) {
    const sourceFile = path.join(sourceRoot, item.source_path);
    let text: string;
    try {
      text = await readFile(sourceFile, "utf8");
    } catch (error) {
      errors.push(`unavailable runtime source missing: ${item.source_path}: ${formatError(error)}`);
      continue;
    }
    const matches = allIndices(text, item.reference);
    if (matches.length !== 1) {
      errors.push(`unavailable runtime reference matched ${String(matches.length)} times: ${item.source_path} -> ${item.reference}`);
      continue;
    }
    const referenceOffset = matches[0];
    const paragraphStartBoundary = text.lastIndexOf("\n\n", referenceOffset - 1);
    const paragraphEndBoundary = text.indexOf("\n\n", referenceOffset);
    const start = paragraphStartBoundary < 0 ? 0 : paragraphStartBoundary + 2;
    const end = paragraphEndBoundary < 0 ? text.length : paragraphEndBoundary;
    const existing = [
      ...(spansBySource.get(item.source_path) ?? []),
      ...(additions.get(item.source_path) ?? []),
    ];
    const overlappingIds = new Set(
      existing
        .filter((span) => span.start < end && start < span.end)
        .map((span) => span.rewrite_id),
    );
    if (overlappingIds.size > 0) {
      const retained = (spansBySource.get(item.source_path) ?? [])
        .filter((span) => !overlappingIds.has(span.rewrite_id));
      spansBySource.set(item.source_path, retained);
      for (let index = records.length - 1; index >= 0; index -= 1) {
        if (overlappingIds.has(records[index]?.rewrite_id ?? "")) records.splice(index, 1);
      }
    }
    const rewriteId = `unavailable-${policyId(item.source_path)}-${policyId(item.reference)}`;
    const span = makeSpan(rewriteId, item.source_path, start, end, item.replacement);
    const sourceSpans = additions.get(item.source_path) ?? [];
    sourceSpans.push(span);
    additions.set(item.source_path, sourceSpans);
    records.push({
      rewrite_id: rewriteId,
      source_path: item.source_path,
      disposition: "adapt",
      rationale: item.rationale,
      matched: true,
      adapted: false,
      output_paths: [],
      before_sha256: sha256Text(text.slice(start, end)),
      before_text: text.slice(start, end),
    });
  }
  for (const [sourcePath, spans] of additions) {
    spansBySource.set(sourcePath, [...(spansBySource.get(sourcePath) ?? []), ...spans].sort((left, right) => left.start - right.start));
  }
}

async function validateCheckerClosure(sourceRoot: string, catalog: RuntimePolicyCatalog, errors: string[]): Promise<void> {
  const expected = new Set(catalog.checker_closure.map((item) => item.source_path));
  for (const item of catalog.checker_closure) {
    if (!expected.delete(item.source_path)) errors.push(`unexpected checker closure source: ${item.source_path}`);
    try {
      const text = await readFile(path.join(sourceRoot, item.source_path), "utf8");
      if (item.source_path.endsWith("check_panel_synthesis.py") && !/^import check_sprint_contract\b/m.test(text)) {
        errors.push("panel checker no longer imports check_sprint_contract");
      }
      if (item.source_path.endsWith("check_phase_conformance.py")
        && (!/^import check_panel_synthesis\b/m.test(text) || !/^import recompute_receipts\b/m.test(text))) {
        errors.push("phase conformance checker no longer imports its approved local closure");
      }
      if (item.source_path.endsWith("review_panel_provenance.py") && !text.includes('CONTRACT_ID = "reviewer/reviewer_full/v2"')) {
        errors.push("reviewer provenance checker is not bound to reviewer_full v2");
      }
    } catch (error) {
      errors.push(`checker closure source missing: ${item.source_path}: ${formatError(error)}`);
    }
  }
  if (expected.size > 0) errors.push(...[...expected].map((item) => `checker closure omitted: ${item}`));
}

function recordFor(entry: RuntimePolicyCatalogEntry, matched: boolean, adapted: boolean): RuntimePolicyAdaptationRecord {
  return { rewrite_id: `retain-${policyId(entry.source_path)}`, source_path: entry.source_path, disposition: entry.disposition, rationale: entry.rationale, matched, adapted, output_paths: [] };
}

function frontmatterEnd(text: string): number {
  if (!text.startsWith("---\n")) return 0;
  const end = text.indexOf("\n---\n", 4);
  return end < 0 ? 0 : end + 5;
}

function normalizeAsset(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

function policyId(sourcePath: string): string {
  return sourcePath.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

function duplicates(values: string[]): string[] {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))].sort();
}

function allIndices(text: string, needle: string): number[] {
  const values: number[] = [];
  for (let offset = 0; offset <= text.length;) {
    const index = text.indexOf(needle, offset);
    if (index < 0) break;
    values.push(index);
    offset = index + needle.length;
  }
  return values;
}

function sha256Text(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function fenced(text: string): string {
  return ["````text", text.trimEnd(), "````"].join("\n");
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
