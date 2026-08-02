import assert from "node:assert/strict";
import { cp, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { buildAnchorReplacementPlan } from "../src/arsu-converter/anchors/match.js";
import { ARSU_RUNTIME_POLICY_CATALOG, FORBIDDEN_ACTIVE_GUIDANCE } from "../src/arsu-converter/runtime-policy/catalog.js";
import { buildRuntimePolicyPlan } from "../src/arsu-converter/runtime-policy/planner.js";
import { validateCombinedRewritePlan } from "../src/arsu-converter/source-rewrite.js";
import { ArsuConverterError } from "../src/arsu-converter/types.js";

const COMMIT = "828ef3b613b0e8b91830da3328a1e33d4eb5ab4c";

void test("runtime-policy catalog completely classifies ARS v3.19.0", async () => {
  const sourceRoot = path.resolve("vendor/ars");
  const plan = await buildRuntimePolicyPlan(process.cwd(), sourceRoot, COMMIT);
  const anchors = await buildAnchorReplacementPlan(process.cwd(), sourceRoot, COMMIT);

  assert.equal(plan.classified_source_count, 33);
  assert.equal(plan.adapted_source_count + plan.retained_source_count, plan.classified_source_count);
  assert.equal(new Set(ARSU_RUNTIME_POLICY_CATALOG.entries.map((entry) => entry.source_path)).size, 33);
  assert.deepEqual(
    plan.checker_closure.map((item) => item.source_path).sort(),
    ["scripts/check_panel_synthesis.py", "scripts/check_sprint_contract.py"],
  );
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
