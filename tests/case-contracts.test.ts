import assert from "node:assert/strict";
import { test } from "node:test";

import { ArtifactSubmitInputSchema } from "../src/core/contracts/artifact.js";
import { ACTION_SCHEMA_REGISTRY, ActionAvailabilitySchema, CaseStatusSummarySchema, DecisionInputSchema } from "../src/core/contracts/case-control.js";
import { ProposalInputSchema } from "../src/core/contracts/contract-change.js";
import { CompactTransactionResultSchema, RuntimePageSchema, ValidationViolationSchema } from "../src/core/contracts/runtime-protocol.js";
import { AdaptiveCaseProfileSchema, StrictCaseProfileSchema } from "../src/core/contracts/case-profile.js";
import { CaseStateSchema, WorkingEvidenceSchema } from "../src/core/contracts/case-state.js";
import { GateSubmitPayloadSchema } from "../src/core/contracts/gate-transition.js";
import { DoctorFindingSchema, DoctorRepairPlanSchema } from "../src/core/contracts/runtime-recovery.js";
import { SubflowStartInputSchema } from "../src/core/contracts/subflow.js";

const SHA = "a".repeat(64);
const NOW = "2026-07-26T00:00:00.000Z";

void test("case contracts accept representative current facts and reject authority leakage", () => {
  const validCases: Array<[string, { safeParse(value: unknown): { success: boolean } }, unknown]> = [
    ["case state", CaseStateSchema, {
      schema_version: "1",
      case_id: "case-current",
      run_id: "current",
      profile_mode: "adaptive",
      lifecycle: "open",
      obligations: [{
        obligation_id: "sources",
        title: "Accepted sources",
        scope: { run_id: "current", subflow_instance_id: null },
        owner: "researchspec-cli",
        status: "satisfied",
        policy_justification: "The manuscript requires a reviewed source set.",
        dependencies: [],
        accepted_evidence_ids: ["evidence-sources"],
        formal_gate_refs: [],
        formal_decision_refs: [],
      }],
      accepted_evidence: [{
        evidence_id: "evidence-sources",
        obligation_id: "sources",
        artifact_id: "bibliography",
        artifact_type: "bibliography",
        path: "artifacts/bibliography.md",
        sha256: SHA,
        accepted_at: NOW,
        acceptance_receipt: { path: "runs/current/receipts/submit.json", sha256: SHA },
      }],
      formal_gate_refs: [],
      formal_decision_refs: [],
      case_actions: [],
      completion_effects: [],
      receipts: [],
      updated_at: NOW,
    }],
    ["working evidence", WorkingEvidenceSchema, {
      evidence_id: "working-1",
      obligation_id: "sources",
      owner: "literature-adapter",
      path: "artifacts/provider-result.json",
      sha256: SHA,
      provenance: "Invocation-scoped Zotero query result.",
      created_at: NOW,
    }],
    ["availability", ActionAvailabilitySchema, {
      selector: "work:sf-one/sources",
      disposition: "allowed",
      reason_code: "dependencies_satisfied",
      obligation_scope: ["sources"],
      blocking_refs: [],
      basis_sha256: SHA,
      expires_when: [{ path: "runs/current/state.yaml", sha256: SHA }],
    }],
    ["adaptive profile", AdaptiveCaseProfileSchema, {
      schema_version: "1",
      profile_id: "adaptive-default",
      mode: "adaptive",
      obligations: [],
      completion_criteria: [],
      playbook_ref: null,
    }],
    ["strict profile", StrictCaseProfileSchema, {
      schema_version: "1",
      profile_id: "arsu-v0-1",
      mode: "strict",
      obligations: [],
      completion_criteria: [],
      playbook_ref: null,
      workflow_graph_ref: { schema_version: "0.2", workflow_id: "arsu-v0-1", path: "specs/workflow.yaml", sha256: SHA },
    }],
    ["doctor finding", DoctorFindingSchema, {
      finding_id: "finding-1",
      disposition: "requires_human_reconstruction",
      scope: "run:current",
      code: "semantic_authority_missing",
      affected_paths: ["runs/current/state.yaml"],
      evidence_refs: [],
      retry_selector: null,
      repair_available: false,
    }],
    ["doctor plan", DoctorRepairPlanSchema, {
      schema_version: "1",
      finding_id: "finding-2",
      read_preconditions: [{ path: "runs/current/state.yaml", sha256: SHA }],
      backup_paths: ["runs/current/recovery/finding-2/state.yaml"],
      operations: [{ kind: "restore_bytes", target_path: "runs/current/state.yaml", source_path: "runs/current/recovery/finding-2/state.yaml", source_sha256: SHA }],
      postconditions: [{ path: "runs/current/state.yaml", sha256: SHA }],
      plan_sha256: SHA,
    }],
  ];

  for (const [name, schema, value] of validCases) {
    assert.equal(schema.safeParse(value).success, true, name);
  }

  const authorityWithWorkingEvidence = {
    ...(validCases[0]?.[2] as Record<string, unknown>),
    working_evidence: [validCases[1]?.[2]],
  };
  assert.equal(CaseStateSchema.safeParse(authorityWithWorkingEvidence).success, false);
  assert.equal(CaseStatusSummarySchema.safeParse({
    schema_version: "1",
    workspace_id: "workspace",
    run_id: "current",
    lifecycle: "open",
    profile: { mode: "strict", path: "specs/workflow.yaml", sha256: SHA },
    active_instance_ids: Array.from({ length: 21 }, (_, index) => `sf-${String(index + 1)}`),
    idle_instance_ids: [],
    recent_instance_ids: [],
    unsatisfied_obligation_ids: [],
    blocker_refs: [],
    recommended_actions: [],
    allowed_actions: [],
    pending: { gate_ids: [], gate_count: 0, decision_ids: [], decision_count: 0, patch_ids: [], patch_count: 0, change_ids: [], change_count: 0 },
    diagnostic_counts: {},
    next_selectors: [],
  }).success, false);
});

void test("action registry reuses every current write validator and declares advance as no-input", () => {
  assert.equal(ACTION_SCHEMA_REGISTRY.start.validator, SubflowStartInputSchema);
  assert.equal(ACTION_SCHEMA_REGISTRY.submit_artifact.validator, ArtifactSubmitInputSchema);
  assert.equal(ACTION_SCHEMA_REGISTRY.submit_gate.validator, GateSubmitPayloadSchema);
  assert.equal(ACTION_SCHEMA_REGISTRY.propose.validator, ProposalInputSchema);
  assert.equal(ACTION_SCHEMA_REGISTRY.decide.validator, DecisionInputSchema);
  assert.equal(ACTION_SCHEMA_REGISTRY.advance.kind, "no-input");
  assert.equal(ACTION_SCHEMA_REGISTRY.advance.schema_ref, "researchspec://actions/advance/no-input");
  for (const registration of Object.values(ACTION_SCHEMA_REGISTRY)) {
    assert.ok(registration.schema_ref);
    assert.equal(registration.requires_dry_run, true);
  }
});

void test("runtime protocol contracts accept bounded pages, compact writes, and stable validation fields", () => {
  assert.equal(RuntimePageSchema.safeParse({
    schema_version: "1",
    type: "history",
    items: [{ selector: "decision-event:E-1" }],
    page: { limit: 20, total: 1, next_cursor: null },
  }).success, true);
  assert.equal(CompactTransactionResultSchema.safeParse({
    schema_version: "1",
    command: "decide",
    selector: "change:change-one",
    outcome: "accepted",
    dry_run: false,
    identity: { kind: "decision", selector: "decision:D-1", plan_sha256: SHA },
    effects: [{ kind: "decision_recorded", refs: ["decision:D-1"] }],
    next_selectors: ["status", "list:history"],
  }).success, true);
  assert.equal(ValidationViolationSchema.safeParse({
    code: "required",
    field_path: "/reason",
    expectation: "string",
    schema_ref: "researchspec://actions/decide/v1",
  }).success, true);
});
