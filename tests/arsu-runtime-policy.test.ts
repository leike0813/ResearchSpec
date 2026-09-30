import assert from "node:assert/strict";
import { cp, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { buildAnchorReplacementPlan } from "../src/arsu-converter/anchors/match.js";
import { ARSU_RUNTIME_POLICY_CATALOG, FORBIDDEN_ACTIVE_GUIDANCE, RUNTIME_POLICY_SOURCE_COMMIT } from "../src/arsu-converter/runtime-policy/catalog.js";
import { buildRuntimePolicyPlan } from "../src/arsu-converter/runtime-policy/planner.js";
import { validateCombinedRewritePlan } from "../src/arsu-converter/source-rewrite.js";
import { ArsuConverterError } from "../src/arsu-converter/types.js";

const COMMIT = RUNTIME_POLICY_SOURCE_COMMIT;

void test("runtime-policy catalog completely classifies the pinned ARS release", async () => {
  const sourceRoot = path.resolve("vendor/ars");
  const plan = await buildRuntimePolicyPlan(process.cwd(), sourceRoot, COMMIT);
  const anchors = await buildAnchorReplacementPlan(process.cwd(), sourceRoot, COMMIT);

  assert.equal(plan.classified_source_count, 41);
  assert.equal(plan.adapted_source_count + plan.retained_source_count, plan.classified_source_count);
  assert.equal(new Set(ARSU_RUNTIME_POLICY_CATALOG.entries.map((entry) => entry.source_path)).size, 41);
  assert.deepEqual(
    plan.checker_closure.map((item) => item.source_path).sort(),
    [
      "scripts/check_panel_synthesis.py",
      "scripts/check_phase_conformance.py",
      "scripts/check_sprint_contract.py",
      "scripts/recompute_receipts.py",
      "scripts/review_panel_provenance.py",
    ],
  );
  const provenanceRewrite = plan.spans_by_source.get("scripts/review_panel_provenance.py")?.[0];
  assert.equal(provenanceRewrite?.replacement_text, 'REPO_ROOT = Path(__file__).resolve().parent.parent / "assets"');
  assert.equal(plan.records.find((record) => record.rewrite_id === "checker-reviewer-assets-root")?.disposition, "adapt");
  assert.deepEqual(
    ARSU_RUNTIME_POLICY_CATALOG.unavailable_runtime_references.map((item) => `${item.source_path}:${item.reference}`).sort(),
    [
      "academic-paper/SKILL.md:**Acronym check (#849):**",
      "academic-paper/SKILL.md:Acronym report (#849):",
      "academic-paper-reviewer/SKILL.md:scripts/check_acronyms.py",
      "academic-pipeline/SKILL.md:docs/design/2026-08-10-673-cross-run-adjudication-activity-spec.md",
      "academic-pipeline/SKILL.md:docs/design/2026-08-17-743-inquiry-branch-ledger-design.md",
      "academic-pipeline/SKILL.md:scripts/build_cross_document_consistency_advisory.py",
      "academic-pipeline/SKILL.md:scripts/check_re_review_synthesis.py",
      "academic-pipeline/SKILL.md:scripts/inquiry_branch_ledger.py",
      "academic-pipeline/references/pipeline_state_machine.md:**Run ledger (#887).**",
      "academic-pipeline/references/pipeline_state_machine.md:`pending_decision` stays authoritative for the reset path",
      "deep-research/SKILL.md:scripts/build_cross_document_consistency_advisory.py",
    ].sort(),
  );
  for (const item of ARSU_RUNTIME_POLICY_CATALOG.unavailable_runtime_references) {
    const rewriteId = `unavailable-${item.source_path.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase()}-${item.reference.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase()}`;
    assert.equal(plan.records.find((record) => record.rewrite_id === rewriteId)?.disposition, "adapt");
    assert.match(item.replacement, /unresolved|not_checked/);
  }
  assert.equal(plan.records.find((record) => record.source_path === "shared/agents/compliance_agent.md")?.disposition, "adapt");
  assert.deepEqual(validateCombinedRewritePlan(anchors, plan), []);
});

void test("an unclassified runtime-policy match blocks planning", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-runtime-policy-"));
  try {
    for (const runtimeRoot of ["deep-research", "academic-paper", "academic-paper-reviewer", "academic-pipeline", "shared", "scripts"]) {
      await cp(path.join("vendor/ars", runtimeRoot), path.join(root, runtimeRoot), { recursive: true });
    }
    await writeFile(path.join(root, "shared/unclassified-policy.md"), "Dispatch with model: sonnet.\n", "utf8");
    await assert.rejects(
      () => buildRuntimePolicyPlan(process.cwd(), root, COMMIT),
      (error) => error instanceof ArsuConverterError && error.code === "runtime_policy_invalid" && error.details.some((item) => item.includes("unclassified-policy.md")),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

void test("converter-owned runtime guidance contains no direct model-service enablement", async () => {
  const plan = await buildRuntimePolicyPlan(process.cwd(), path.resolve("vendor/ars"), COMMIT);
  const replacements = [...plan.spans_by_source.values()].flat().map((span) => span.replacement_text).join("\n");
  assert.match(replacements, /host(?:'s)? native subagent|host-native/i);
  assert.doesNotMatch(replacements, /\b(?:opus|sonnet|haiku)(?:-class)?\b/i);
  for (const rule of FORBIDDEN_ACTIVE_GUIDANCE) assert.doesNotMatch(replacements, rule.pattern, rule.label);
});
