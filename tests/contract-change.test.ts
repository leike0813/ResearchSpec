import assert from "node:assert/strict";
import { test } from "node:test";
import { parse } from "yaml";

import { ContractChangeError, validateAndApplyContractOperations } from "../src/core/runtime/contract-change.js";

void test("contract target resolver applies the five operation contracts deterministically", () => {
  const source = 'schema_version: "0.1"\nclaims:\n  - claim_id: C001\n    strength: strong\n    limits: []\n    metadata:\n      reviewed: false\n';
  const next = validateAndApplyContractOperations("specs/claims.yaml", source, [
    patch("add", "claims[C001].note", undefined, "bounded"),
    patch("replace", "claims[C001].strength", "strong", "moderate"),
    patch("append", "claims[C001].limits", [], "observational"),
    patch("merge", "claims[C001].metadata", { reviewed: false }, { reviewer: "R1" }),
    patch("remove", "claims[C001].note", "bounded", undefined),
  ]);
  const document = parse(next) as { claims: Array<{ strength: string; limits: string[]; metadata: Record<string, unknown>; note?: string }> };
  assert.equal(document.claims[0].strength, "moderate");
  assert.deepEqual(document.claims[0].limits, ["observational"]);
  assert.deepEqual(document.claims[0].metadata, { reviewed: false, reviewer: "R1" });
  assert.equal(Object.hasOwn(document.claims[0], "note"), false);
});

void test("contract target resolver rejects ambiguous selectors and invalid operation values", () => {
  const duplicate = 'schema_version: "0.1"\nclaims:\n  - claim_id: C001\n    strength: strong\n  - claim_id: C001\n    strength: weak\n';
  assertContractError(() => validateAndApplyContractOperations("specs/claims.yaml", duplicate, [patch("replace", "claims[C001].strength", "strong", "moderate")]), "selector_not_unique");
  const source = 'schema_version: "0.1"\nclaims:\n  - claim_id: C001\n    strength: strong\n';
  assertContractError(() => validateAndApplyContractOperations("specs/claims.yaml", source, [patch("add", "claims[C001].strength", undefined, "moderate")]), "proposal_target_exists");
  assertContractError(() => validateAndApplyContractOperations("specs/claims.yaml", source, [patch("replace", "claims[C001].strength", "weak", "moderate")]), "current_value_conflict");
  assertContractError(() => validateAndApplyContractOperations("specs/claims.yaml", source, [patch("append", "claims[C001].strength", "strong", "moderate")]), "append_target_not_array");
});

void test("Markdown resolver permits only unique section replacement and checks current body", () => {
  const source = "# Project\n\n## Research Question\n\nTBD\n\n## Scope\n\nBounded\n";
  const next = validateAndApplyContractOperations("specs/project.md", source, [patch("replace", "section[Research Question]", "TBD", "What is the effect?")]);
  assert.match(next, /## Research Question\n\nWhat is the effect\?/);
  assertContractError(() => validateAndApplyContractOperations("specs/project.md", source, [patch("replace", "section[Research Question]", "Changed", "New")]), "current_value_conflict");
  assertContractError(() => validateAndApplyContractOperations("specs/project.md", source, [patch("add", "section[Research Question]", undefined, "New")]), "invalid_markdown_operation");
});

function patch(operation: string, targetPath: string, currentValue: unknown, proposedValue: unknown): Record<string, unknown> {
  return {
    operation,
    target_path: targetPath,
    ...(currentValue !== undefined ? { current_value: currentValue } : {}),
    ...(proposedValue !== undefined ? { proposed_value: proposedValue } : {}),
  };
}

function assertContractError(action: () => unknown, code: string): void {
  assert.throws(action, (error: unknown) => error instanceof ContractChangeError && error.code === code);
}
