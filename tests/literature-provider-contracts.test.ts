import assert from "node:assert/strict";
import { test } from "node:test";

import {
  LITERATURE_SOURCE_POLICIES,
  LITERATURE_SOURCE_POLICY_MODES,
  ManagedLibraryAuthorizationSchema,
  ProviderReadinessSchema,
  ProviderRetrievalHandoffSchema,
  evaluateManagedLibraryAuthorization,
  getLiteratureSourcePolicy,
  planLiteratureProviderUse,
  renderLiteratureSourcePolicyProjection,
} from "../src/literature-adapters/index.js";

const SHA256 = "a".repeat(64);
const grantedAt = "2026-07-26T01:00:00.000Z";
const expiresAt = "2026-07-26T03:00:00.000Z";

const authorization = {
  schema_version: "1",
  authorization_id: "authorization-1",
  run_id: "run-1",
  route_ref: "deep-research:full",
  adapter_id: "zotero-library",
  acquisition_skill_id: "zotero-literature-acquisition",
  target_library_ref: "library-1",
  target_collection_ref: "collection-1",
  accepted_candidate_ids: ["candidate-1"],
  allowed_effects: ["item-import", "collection-link"],
  granted_by: { kind: "human", name: "researcher" },
  granted_at: grantedAt,
  expires_at: expiresAt,
  confirmation_basis_sha256: SHA256,
  revocation: null,
} as const;

const request = {
  run_id: "run-1",
  route_ref: "deep-research:full",
  adapter_id: "zotero-library",
  target_library_ref: "library-1",
  target_collection_ref: "collection-1",
  candidate_id: "candidate-1",
  effect: "item-import",
  evaluated_at: "2026-07-26T02:00:00.000Z",
} as const;

void test("literature source policy is a closed four-mode SSOT", () => {
  assert.deepEqual(LITERATURE_SOURCE_POLICY_MODES, [
    "adapter-native",
    "protocol-multi-source",
    "external-first",
    "library-bound",
  ]);
  assert.deepEqual(LITERATURE_SOURCE_POLICIES.map((policy) => policy.mode), [...LITERATURE_SOURCE_POLICY_MODES]);
  for (const mode of LITERATURE_SOURCE_POLICY_MODES) {
    assert.equal(getLiteratureSourcePolicy(mode).mode, mode);
  }
});

void test("provider readiness remains an invocation fact", () => {
  const readiness = {
    schema_version: "1",
    invocation_id: "invocation-1",
    adapter_id: "zotero-library",
    release_set_id: "hbrs-f9f28ddce98be3008e13bbdb",
    skill_id: "zotero-library-query",
    checked_at: "2026-07-26T02:00:00.000Z",
    status: "ready",
    checks: {
      profile: { status: "ready", diagnostic_codes: [] },
      bridge: { status: "ready", diagnostic_codes: [] },
      authentication: { status: "ready", diagnostic_codes: [] },
      capability: { status: "ready", diagnostic_codes: [] },
    },
  };
  assert.equal(ProviderReadinessSchema.safeParse(readiness).success, true);
  assert.equal(ProviderReadinessSchema.safeParse({ ...readiness, connection_state: "ready" }).success, false);
});

void test("provider handoff references upstream bytes without adopting their output envelope", () => {
  const handoff = {
    schema_version: "1",
    handoff_id: "handoff-1",
    run_id: "run-1",
    route_ref: "deep-research:full",
    source_policy: "adapter-native",
    provider: {
      adapter_id: "zotero-library",
      release_set_id: "hbrs-f9f28ddce98be3008e13bbdb",
      skill_id: "zotero-library-query",
    },
    operation: "library-query",
    request: { query: "adaptive research workflow", filters: [] },
    scope: {
      library_ref: "library-1",
      collection_refs: ["collection-1"],
      selection_refs: [],
      search_scope: "current library",
    },
    retrieved_at: "2026-07-26T02:00:00.000Z",
    paging: { complete: true, page_count: 1, continuation_ref: null },
    source_refs: {
      zotero_refs: ["item-1"],
      external_provenance: [],
    },
    evidence_depth: "metadata",
    diagnostics: { readiness_codes: [], duplicate_codes: [] },
    upstream_result: {
      path: "researchspec/runs/current/working/zotero/query-1.json",
      sha256: SHA256,
      schema_id: "zotero-library-task.result.v1",
    },
    coverage_limits: ["Only the current library was queried."],
    managed_authorization_ref: null,
  };
  assert.equal(ProviderRetrievalHandoffSchema.safeParse(handoff).success, true);
  assert.equal(ProviderRetrievalHandoffSchema.safeParse({ ...handoff, output: { status: "ok" } }).success, false);
});

void test("managed authorization permits only an exact current Acquisition request", () => {
  assert.equal(ManagedLibraryAuthorizationSchema.safeParse(authorization).success, true);
  assert.deepEqual(evaluateManagedLibraryAuthorization(authorization, request), {
    disposition: "authorized",
    reason_code: "authorized",
  });
});

void test("managed authorization falls back to candidates at every authority boundary", () => {
  const cases: Array<[string, unknown, unknown, string]> = [
    ["missing", null, request, "authorization_missing"],
    ["invalid", { ...authorization, allowed_effects: ["curation"] }, request, "authorization_invalid"],
    ["revoked", { ...authorization, revocation: { revoked_at: "2026-07-26T01:30:00.000Z", revoked_by: "researcher", reason_code: "withdrawn" } }, request, "authorization_revoked"],
    ["expired", authorization, { ...request, evaluated_at: expiresAt }, "authorization_expired"],
    ["not yet valid", authorization, { ...request, evaluated_at: "2026-07-26T00:59:59.000Z" }, "authorization_not_yet_valid"],
    ["run", authorization, { ...request, run_id: "run-2" }, "run_mismatch"],
    ["route", authorization, { ...request, route_ref: "deep-research:systematic-review" }, "route_mismatch"],
    ["adapter", authorization, { ...request, adapter_id: "other-adapter" }, "adapter_mismatch"],
    ["library", authorization, { ...request, target_library_ref: "library-2" }, "library_mismatch"],
    ["collection", authorization, { ...request, target_collection_ref: "collection-2" }, "collection_mismatch"],
    ["candidate", authorization, { ...request, candidate_id: "candidate-2" }, "candidate_not_accepted"],
    ["effect", authorization, { ...request, effect: "attachment-import" }, "effect_not_allowed"],
  ];
  for (const [label, authorizationValue, requestValue, reasonCode] of cases) {
    assert.deepEqual(
      evaluateManagedLibraryAuthorization(authorizationValue, requestValue),
      { disposition: "candidate-only", reason_code: reasonCode },
      label,
    );
  }
});

void test("provider projection derives the seven-Skill task boundary from the catalog", () => {
  const projection = renderLiteratureSourcePolicyProjection();
  for (const skillId of [
    "zotero-library-agent",
    "zotero-library-query",
    "zotero-literature-acquisition",
    "zotero-literature-analysis",
    "zotero-research-synthesis",
    "zotero-library-curation",
  ]) {
    assert.match(projection, new RegExp(skillId));
  }
  for (const mode of LITERATURE_SOURCE_POLICY_MODES) assert.match(projection, new RegExp(mode));
  assert.match(projection, /candidate-only/);
  assert.match(projection, /working evidence/);
});

void test("literature provider journeys preserve source priority and local failure boundaries", () => {
  const cases = [
    {
      name: "ordinary gap fill",
      input: { source_policy: "adapter-native", readiness: "ready", coverage_gap: true, evidence_goal: "none" },
      expected: {
        disposition: "proceed",
        steps: ["zotero-library-query", "zotero-literature-acquisition"],
        coverage_limitation_required: true,
      },
    },
    {
      name: "systematic multi-source",
      input: { source_policy: "protocol-multi-source", readiness: "ready", coverage_gap: true, evidence_goal: "cross-source-synthesis" },
      expected: {
        disposition: "proceed",
        steps: ["systematic-review-protocol", "zotero-library-query", "zotero-literature-acquisition", "zotero-research-synthesis"],
        coverage_limitation_required: true,
      },
    },
    {
      name: "external first",
      input: { source_policy: "external-first", readiness: "ready", coverage_gap: false, evidence_goal: "source-analysis" },
      expected: {
        disposition: "proceed",
        steps: ["zotero-literature-acquisition", "zotero-library-query", "zotero-literature-analysis"],
        coverage_limitation_required: false,
      },
    },
    {
      name: "private library pause",
      input: { source_policy: "library-bound", readiness: "unavailable", coverage_gap: false, evidence_goal: "none" },
      expected: { disposition: "pause", steps: [], coverage_limitation_required: true },
    },
    {
      name: "ordinary Adapter failure",
      input: { source_policy: "adapter-native", readiness: "unavailable", coverage_gap: true, evidence_goal: "none" },
      expected: {
        disposition: "proceed",
        steps: ["external-or-user-supplied-sources"],
        coverage_limitation_required: true,
      },
    },
  ] as const;
  for (const scenario of cases) {
    assert.deepEqual(planLiteratureProviderUse(scenario.input), scenario.expected, scenario.name);
  }
});
