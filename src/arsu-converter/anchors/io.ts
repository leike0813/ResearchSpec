import { readFile } from "node:fs/promises";
import path from "node:path";

import { CONTRACT_ANCHORS_PATH } from "./manifest.js";
import type { ContractAnchor, ContractAnchorFile, CoverageDecision } from "./types.js";

export async function readContractAnchors(repoRoot: string): Promise<ContractAnchorFile> {
  const parsed: unknown = JSON.parse(await readFile(path.join(repoRoot, CONTRACT_ANCHORS_PATH), "utf8"));
  if (!isAnchorFile(parsed)) {
    throw new Error(`${CONTRACT_ANCHORS_PATH} does not match the expected anchor file shape.`);
  }
  return parsed;
}

function isAnchorFile(value: unknown): value is ContractAnchorFile {
  if (!isRecord(value)) return false;
  return (
    value.schema_version === "researchspec.arsu.contract-anchors.v2" &&
    value.upstream_source === "vendor/ars" &&
    typeof value.audited_commit === "string" &&
    Array.isArray(value.anchors) &&
    value.anchors.every(isAnchor) &&
    Array.isArray(value.coverage_decisions) &&
    value.coverage_decisions.every(isCoverageDecision)
  );
}

function isAnchor(value: unknown): value is ContractAnchor {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.source_path === "string" &&
    typeof value.owner_skill === "string" &&
    typeof value.contract_category === "string" &&
    (value.severity === "required" || value.severity === "recommended" || value.severity === "diagnostic") &&
    isRecord(value.match_hints) &&
    typeof value.replacement_intent === "string" &&
    typeof value.template_id === "string" &&
    isOptionalReplacementScope(value.replacement_scope)
  );
}

function isCoverageDecision(value: unknown): value is CoverageDecision {
  return isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.source_path === "string" &&
    typeof value.match_snippet === "string" &&
    value.disposition === "retain" &&
    typeof value.rationale === "string";
}

function isOptionalReplacementScope(value: unknown): value is ContractAnchor["replacement_scope"] {
  return value === undefined || (
    isRecord(value) &&
    typeof value.start_snippet === "string" &&
    typeof value.end_snippet === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
