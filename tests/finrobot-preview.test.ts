import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { FinRobotAuditSchema } from "../src/vendor-audits/finrobot.js";
import { renderFinRobotCompleteTrees, type FinRobotTreeFile } from "../src/vendor-converters/finrobot/complete-tree.js";
import { loadFinRobotDraftPolicies } from "../src/vendor-converters/finrobot/policy.js";
import { finRobotCandidateInputs } from "../src/vendor-converters/finrobot/preview.js";
import { loadPluginExtensionRegistry, resolveDomainExtensions } from "../src/plugins/extensions.js";

const ROOT = path.resolve(".");
const ANCHOR = path.join(ROOT, "audits/finrobot/snapshot-2717499");

void test("FinRobot candidate audit preserves old evidence and excludes third-party Skills", async () => {
  const audit = FinRobotAuditSchema.parse(await json(path.join(ANCHOR, "capability-audit.json")));
  const old = FinRobotAuditSchema.parse(await json(path.join(ROOT, "audits/finrobot/snapshot-297a8d2/capability-audit.json")));
  assert.equal(audit.source.revision, "2717499b8e30f242640af08c4ad9afd1113c2d45");
  assert.equal(audit.source_entries.length, 1049);
  assert.equal(audit.knowledge_surfaces.length, 129);
  assert.equal(audit.source_entries.filter((item) => item.path.endsWith("/SKILL.md")).length, 60);
  const thirdParty = audit.knowledge_surfaces.filter((item) => item.content_origin_id === "anthropic-derived");
  assert.equal(thirdParty.length, 56);
  assert.ok(thirdParty.every((item) => item.disposition === "exclude"));
  for (const surface of old.knowledge_surfaces) {
    const migrated = audit.knowledge_surfaces.find((item) => item.surface_id === surface.surface_id);
    assert.ok(migrated);
    assert.equal(migrated.disposition, surface.disposition);
    assert.equal(migrated.symbol, surface.symbol);
    const prior = old.source_entries.find((item) => item.path === surface.source_path);
    const current = audit.source_entries.find((item) => item.path === migrated.source_path);
    assert.ok(prior);
    assert.ok(current);
    assert.equal(current.git_object_id, prior.git_object_id);
    assert.equal(current.sha256, prior.sha256);
  }
  for (const mutate of [
    (value: typeof audit) => { value.summary.tracked_entries++; },
    (value: typeof audit) => { value.summary.knowledge_surfaces++; },
    (value: typeof audit) => { value.source_entries.push(value.source_entries[0]); },
    (value: typeof audit) => { value.knowledge_surfaces[0].source_path = "not/in/tree.py"; },
    (value: typeof audit) => { value.content_origins[0].scope = ["not/in/tree"]; },
    (value: typeof audit) => { value.license_claims[0].evidence = ["not/in/tree.py"]; },
  ]) {
    const invalid = structuredClone(audit);
    mutate(invalid);
    assert.equal(FinRobotAuditSchema.safeParse(invalid).success, false);
  }
});

void test("FinRobot candidate complete trees reproduce the pending review without source checkout", async () => {
  // The committed exact candidate bytes provide the seven selected source hashes for offline tests.
  const inputs = finRobotCandidateInputs(ROOT, ANCHOR, path.join(ANCHOR, "artifacts/source-evidence"));
  const policies = await loadFinRobotDraftPolicies(ROOT, inputs);
  assert.equal(policies.admission.review_status, "pending-human-review");
  assert.equal(policies.review.candidate?.review_status, "pending-human-review");
  assert.equal(policies.surfaces.decisions.filter((item) => item.disposition === "admitted-capability").length, 39);
  const rendered = await renderFinRobotCompleteTrees(ROOT, inputs);
  assert.equal(rendered.reviewStatus, "pending-human-review");
  assert.equal(rendered.treeSetSha256, policies.review.candidate?.tree_set_sha256);
  assert.notEqual(rendered.treeSetSha256, policies.review.published.tree_set_sha256);
  assert.equal(rendered.trees.length, 6);
  for (const tree of rendered.trees) for (const file of tree.files) {
    assert.deepEqual(await readFile(path.join(ANCHOR, "artifacts/candidate/vendors/finrobot", tree.skillId, file.path)), file.content);
  }
  const extensions = await loadPluginExtensionRegistry(path.join(ANCHOR, "artifacts/candidate/extensions"));
  assert.equal(extensions.capabilities.size, 6);
  assert.equal(extensions.profiles.size, 6);
  assert.equal(resolveDomainExtensions(extensions, ["banking-finance-and-investment"]).capabilityIds.length, 6);
  assert.equal(resolveDomainExtensions(extensions, ["accounting-auditing-and-accountability"]).capabilityIds.length, 2);
  for (const capability of extensions.capabilities.values()) {
    const rawId = capability.manifest.capability_id.replace("plugin-financial-", "financial-research-");
    const tree = rendered.trees.find((item) => item.skillId === rawId);
    assert.ok(tree);
    for (const ref of capability.manifest.knowledge_refs) {
      const bytes = await readFile(path.join(capability.packageRoot, ref.path));
      assert.equal(createHash("sha256").update(bytes).digest("hex"), ref.content_hash);
      const name = path.basename(ref.path);
      const raw: FinRobotTreeFile | undefined = tree.files.find((item) => path.basename(item.path) === name);
      assert.ok(raw);
      assert.deepEqual(bytes, raw.content);
    }
  }
});

void test("FinRobot candidate rejects stale tree approval and inconsistent policy provenance", async () => {
  const temporary = await mkdtemp(path.join(tmpdir(), "researchspec-finrobot-review-"));
  try {
    await cp(path.join(ANCHOR, "candidate-policies"), temporary, { recursive: true });
    const inputs = { ...finRobotCandidateInputs(ROOT, ANCHOR, path.join(ANCHOR, "artifacts/source-evidence")), policyRoot: temporary };
    const reviewFile = path.join(temporary, "review-decision.json");
    const review = JSON.parse(await readFile(reviewFile, "utf8")) as { candidate: { tree_set_sha256: string } };
    review.candidate.tree_set_sha256 = "a".repeat(64);
    await writeFile(reviewFile, JSON.stringify(review));
    await assert.rejects(renderFinRobotCompleteTrees(ROOT, inputs), /candidate trees differ/);
    const admissionFile = path.join(temporary, "admission-decisions.json");
    const admission = JSON.parse(await readFile(admissionFile, "utf8")) as { revision: string };
    admission.revision = "b".repeat(40);
    await writeFile(admissionFile, JSON.stringify(admission));
    await assert.rejects(loadFinRobotDraftPolicies(ROOT, inputs), /provenance/);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

async function json(file: string): Promise<unknown> { return JSON.parse(await readFile(file, "utf8")) as unknown; }
