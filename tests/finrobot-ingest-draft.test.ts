import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";

import { renderFinRobotCompleteTrees } from "../src/vendor-converters/finrobot/complete-tree.js";
import { assertFinRobotProductionReady, loadFinRobotDraftPolicies } from "../src/vendor-converters/finrobot/policy.js";
import { FINROBOT_SKILL_DEFINITIONS } from "../src/vendor-converters/finrobot/skill-definitions.js";

const REPO_ROOT = path.resolve(".");
const APPROVED_HASH = "eecf6fc9e7669f46ef9c58d4fd5938cabedb6d8d7aceac59e15688e178f3765e";

void test("FinRobot policy preserves immutable audit decisions and maps 32 admitted surfaces", async () => {
  const policies = await loadFinRobotDraftPolicies(REPO_ROOT);
  assert.equal(policies.admission.decisions.length, 6);
  assert.equal(policies.sourceEntries.decisions.length, 146);
  assert.equal(policies.surfaces.decisions.length, 66);
  assert.equal(policies.surfaces.decisions.filter((item) => item.disposition === "admitted-capability").length, 32);
  assert.equal(policies.surfaces.decisions.filter((item) => item.disposition === "excluded").length, 34);
  assert.ok(policies.admission.decisions.every((item) => item.disposition === "admitted"));
  assert.ok(policies.sourceEntries.decisions.every((item) => item.output_assets.length === 0));
  assert.equal(policies.surfaces.decisions.filter((item) => item.implementation_kind === "agent-procedure").length, 16);
  assert.equal(policies.surfaces.decisions.filter((item) => item.implementation_kind === "bundled-script").length, 16);
  assert.equal(Object.values(FINROBOT_SKILL_DEFINITIONS).flatMap((item) => item.capabilities).length, 32);
  assert.equal(new Set(Object.values(FINROBOT_SKILL_DEFINITIONS).flatMap((item) => item.capabilities.map((capability) => capability.id))).size, 32);

  assert.deepEqual(policies.origins.decisions.filter((item) => item.disposition === "production-source").map((item) => item.origin_id), ["root-apache"]);
  assert.deepEqual(policies.licenses.decisions.filter((item) => item.disposition === "preserve").map((item) => item.claim_id), ["root-apache", "trademark-attribution"]);
  assert.ok(policies.admission.decisions.every((item) => item.dependencies.length === 0));
  assert.ok(policies.relationships.decisions.every((item) => item.disposition === "advisory"));
  assert.equal(policies.review.published.tree_set_sha256, APPROVED_HASH);
  assert.equal(policies.review.published.converter_version, "2");
  assert.equal(policies.review.candidate, null);
  assert.doesNotThrow(() => assertFinRobotProductionReady(policies));
});

void test("FinRobot approved version 2 trees are complete and progressively disclosed", async () => {
  const rendered = await renderFinRobotCompleteTrees(REPO_ROOT);

  assert.equal(rendered.reviewStatus, "approved");
  assert.equal(rendered.treeSetSha256, APPROVED_HASH);
  assert.equal(rendered.trees.length, 6);
  assert.equal(new Set(rendered.trees.map((item) => item.sha256)).size, 6);

  for (const tree of rendered.trees) {
    const paths = tree.files.map((file) => file.path);
    assert.ok(paths.includes("SKILL.md"), tree.skillId);
    assert.ok(paths.includes("LICENSE"), tree.skillId);
    assert.ok(paths.includes("NOTICE"), tree.skillId);
    assert.ok(paths.includes("DERIVATION.json"), tree.skillId);
    assert.equal(paths.some((item) => item.startsWith("references/")), false, tree.skillId);
    assert.equal(paths.some((item) => item === "dependencies.json" || item.includes("agent-specs/") || item.includes("provider_")), false, tree.skillId);
    assert.equal(paths.some((item) => ["runner.json", "RUNTIME.json", "agents/openai.yaml"].includes(item)), false, tree.skillId);
    if (tree.tier === 3) {
      assert.ok(paths.includes("lib/financial_support.py"), tree.skillId);
      assert.equal(paths.filter((item) => item.startsWith("scripts/")).length, 1, tree.skillId);
    } else {
      assert.equal(paths.some((item) => item.startsWith("lib/") || item.startsWith("scripts/") || item.startsWith("references/")), false, tree.skillId);
    }
  }
});
