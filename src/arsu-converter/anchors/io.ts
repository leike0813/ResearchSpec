import { readFile } from "node:fs/promises";
import path from "node:path";

import { CONTRACT_ANCHORS_PATH } from "./manifest.js";
import type {
  AnchorMatchHints,
  AnchorReplacementShape,
  AnchorSemanticRole,
  ContractAnchor,
  ContractAnchorFile,
  CoverageDecision,
} from "./types.js";

export const REPLACEMENTS_DIR = "src/arsu-converter/anchors/replacements";

export async function readContractAnchors(repoRoot: string): Promise<ContractAnchorFile> {
  const parsed: unknown = JSON.parse(await readFile(path.join(repoRoot, CONTRACT_ANCHORS_PATH), "utf8"));
  if (!isAnchorFile(parsed)) {
    throw new Error(`${CONTRACT_ANCHORS_PATH} does not match the expected anchor file shape.`);
  }
  return parsed;
}

export async function readReplacementBody(repoRoot: string, anchorId: string): Promise<string> {
  const content = await readFile(path.join(repoRoot, REPLACEMENTS_DIR, `${anchorId}.md`), "utf8");
  return normalizeReplacementBody(content);
}

export function normalizeReplacementBody(content: string): string {
  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

export function isAnchorFile(value: unknown): value is ContractAnchorFile {
  if (!isRecord(value)) return false;
  return (
    value.schema_version === "researchspec.arsu.contract-anchors.v4" &&
    value.upstream_source === "vendor/ars" &&
    typeof value.audited_commit === "string" &&
    Array.isArray(value.anchors) &&
    value.anchors.every(isAnchor) &&
    Array.isArray(value.coverage_decisions) &&
    value.coverage_decisions.every(isCoverageDecision)
  );
}

export function isAnchor(value: unknown): value is ContractAnchor {
  if (!isRecord(value)) return false;
  const base = typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.source_path === "string" &&
    typeof value.owner_skill === "string" &&
    typeof value.contract_category === "string" &&
    isMatchHints(value.match_hints);
  if (!base) return false;
  if (value.severity === "diagnostic") {
    return value.replacement_scope === undefined &&
      value.semantic_role === undefined &&
      value.researchspec_targets === undefined &&
      value.replacement_shape === undefined;
  }
  return (value.severity === "required" || value.severity === "recommended") &&
    isReplacementScope(value.replacement_scope) &&
    isSemanticRole(value.semantic_role) &&
    Array.isArray(value.researchspec_targets) &&
    value.researchspec_targets.every((item) => typeof item === "string") &&
    isReplacementShape(value.replacement_shape);
}

function isCoverageDecision(value: unknown): value is CoverageDecision {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.source_path === "string" &&
    typeof value.match_snippet === "string" &&
    value.disposition === "retain" &&
    typeof value.rationale === "string";
}

function isMatchHints(value: unknown): value is AnchorMatchHints {
  return isRecord(value) &&
    isOptionalStringArray(value.headings) &&
    isOptionalStringArray(value.snippets) &&
    isOptionalStringArray(value.keywords);
}

function isReplacementScope(value: unknown): boolean {
  return isRecord(value) &&
    typeof value.start_snippet === "string" &&
    typeof value.end_snippet === "string";
}

function isSemanticRole(value: unknown): value is AnchorSemanticRole {
  return typeof value === "string" && [
    "graph_state_boundary", "boundary_deliverable_contract", "handoff_projection",
    "revision_patch_protocol", "gate_policy", "boundary_deliverable_provenance",
    "review_handoff_tracking", "generator_evaluator_contract",
    "stable_claim_contract", "stable_source_contract", "control_decision_record",
  ].includes(value);
}

function isReplacementShape(value: unknown): value is AnchorReplacementShape {
  return typeof value === "string" && [
    "protocol_block", "io_contract_block", "gate_rule_block", "patch_protocol_block",
    "artifact_projection_block", "schema_projection_table", "checklist",
  ].includes(value);
}

function isOptionalStringArray(value: unknown): boolean {
  return value === undefined || (Array.isArray(value) && value.every((item) => typeof item === "string"));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
