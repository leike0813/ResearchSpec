import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";

import { parse } from "yaml";

import { assertFinRobotProductionReady, loadFinRobotDraftPolicies } from "../src/vendor-converters/finrobot/policy.js";
import { renderFinRobotPreviewSet } from "../src/vendor-converters/finrobot/preview.js";

const REPO_ROOT = path.resolve(".");

void test("FinRobot policy closes the audit with dependency-aware executable decisions", async () => {
  const policies = await loadFinRobotDraftPolicies(REPO_ROOT);
  assert.equal(policies.admission.decisions.length, 6);
  assert.equal(policies.sourceEntries.decisions.length, 146);
  assert.equal(policies.surfaces.decisions.length, 66);
  assert.equal(policies.surfaces.decisions.filter((item) => item.disposition === "admitted-resource").length, 32);
  assert.equal(policies.surfaces.decisions.filter((item) => item.disposition === "excluded").length, 34);

  const distributed = policies.sourceEntries.decisions.filter((item) =>
    ["direct-resource", "adapted-resource", "prompt-resource"].includes(item.production_action),
  );
  assert.equal(distributed.length, 16);
  assert.equal(distributed.filter((item) => item.production_action === "direct-resource").length, 4);
  assert.equal(distributed.filter((item) => item.production_action === "adapted-resource").length, 6);
  assert.equal(distributed.filter((item) => item.production_action === "prompt-resource").length, 6);
  assert.ok(distributed.every((item) => item.finrobot_coupling !== "hard"));
  assert.ok(distributed.every((item) => item.converter_execution === "never"));
  assert.ok(distributed.every((item) => item.output_assets.length > 0));

  assert.equal(policies.origins.decisions.length, 5);
  assert.deepEqual(policies.origins.decisions.filter((item) => item.disposition === "production-source").map((item) => item.origin_id), ["root-apache"]);
  assert.equal(policies.licenses.decisions.length, 6);
  assert.deepEqual(policies.licenses.decisions.filter((item) => item.disposition === "preserve").map((item) => item.claim_id), ["root-apache", "trademark-attribution"]);
  assert.ok(policies.admission.decisions.every((item) => item.dependencies.length === 0));
  assert.ok(policies.relationships.decisions.every((item) => item.disposition === "advisory"));
  assert.ok(policies.resources.decisions.some((item) => item.kind === "calculation-tool" && item.disposition === "bundled"));
  assert.ok(policies.resources.decisions.some((item) => item.kind === "financial-service" && item.disposition === "user-configured"));
  assert.equal(policies.review.review_status, "approved");
  assert.equal(policies.review.approved_draft_set_sha256, "83cc17371bd3e0b82434f67e74adc5ed8a12cf11979480e1eb1f83debe1a9bb3");
  assert.doesNotThrow(() => assertFinRobotProductionReady(policies));
});

void test("FinRobot preview rendering produces six complete formally safe Skill trees", async () => {
  const policies = await loadFinRobotDraftPolicies(REPO_ROOT);
  const result = await renderFinRobotPreviewSet(REPO_ROOT);
  assert.equal(result.reviewStatus, "approved");
  assert.equal(result.previews.length, 6);
  assert.match(result.draftSetSha256, /^[a-f0-9]{64}$/);
  assert.equal(new Set(result.previews.map((item) => item.sha256)).size, 6);

  for (const preview of result.previews) {
    const closing = preview.content.indexOf("\n---\n", 4);
    assert.ok(closing > 0, preview.skillId);
    const frontmatter = parse(preview.content.slice(4, closing)) as Record<string, unknown>;
    assert.equal(frontmatter.name, preview.skillId);
    assert.equal(frontmatter.license, "Apache-2.0");
    assert.equal((frontmatter.metadata as Record<string, unknown>).vendor, "finrobot");
    assert.match(String(frontmatter.compatibility), /agent-invoked Python and AgentSpec resources/);
    assert.ok(preview.files.some((file) => file.path === "LICENSE"));
    assert.ok(preview.files.some((file) => file.path === "NOTICE"));
    assert.ok(preview.files.some((file) => file.path === "DERIVATION.json"));
    assert.ok(preview.files.some((file) => file.path === "dependencies.json"));
    assert.ok(preview.files.some((file) => file.path.startsWith("resources/")));
    for (const file of preview.files) assert.match(file.sha256, /^[a-f0-9]{64}$/);
    for (const section of policies.curation.required_output_sections) assert.equal(preview.content.split(`### ${section}`).length, 2, `${preview.skillId}:${section}`);
  }
});
