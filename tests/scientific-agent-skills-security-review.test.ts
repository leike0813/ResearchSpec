import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import path from "node:path";

import {
  assertScientificAgentSkillsSecurityReviewComplete,
  loadScientificAgentSkillsIdentity,
  loadScientificAgentSkillsSecurityReview,
  validateScientificAgentSkillsSecurityReview,
  type ScientificAgentSkillsIdentity,
  type ScientificAgentSkillsSecurityReviewCatalog,
} from "../src/vendor-converters/scientific-agent-skills/security-review.js";

const REPO_ROOT = path.resolve(".");
const ADMISSION_PATH = path.resolve("src/vendor-converters/scientific-agent-skills/admission-decisions.json");

interface AdmissionSummary {
  decisions: Array<{ upstream_skill_id: string; disposition: string; reason_codes: string[] }>;
}

void test("manual security review covers the approved pinned inventory and is complete", async () => {
  const identity = await loadScientificAgentSkillsIdentity(REPO_ROOT);
  const catalog = await loadScientificAgentSkillsSecurityReview(REPO_ROOT, identity);
  const required = requiredReviewSkillIds(identity, await readAdmission(), catalog.target_reason);
  const reviewById = new Map(catalog.reviews.map((review) => [review.skill_id, review]));
  const auditById = new Map(identity.audit.skills.map((skill) => [skill.skill_id, skill]));

  for (const skillId of required) assert.ok(reviewById.has(skillId), skillId);
  for (const review of catalog.reviews) {
    const skill = auditById.get(review.skill_id);
    assert.ok(skill, review.skill_id);
    assert.equal(review.upstream.finding_count, skill.security.findings, review.skill_id);
    assert.equal(review.upstream.highest_severity, skill.security.highest_severity, review.skill_id);
    assert.equal(review.findings.length, review.upstream.finding_count, review.skill_id);
  }
  assert.doesNotThrow(() => assertScientificAgentSkillsSecurityReviewComplete(catalog));

  const pending = mutate(catalog, (copy) => {
    copy.reviews[0].recommendation = "pending";
    copy.reviews[0].maintainer_decision = "pending";
  });
  assert.throws(() => assertScientificAgentSkillsSecurityReviewComplete(pending));
});

void test("manual security review validation rejects structural and source drift", async () => {
  const original = await loadScientificAgentSkillsSecurityReview(REPO_ROOT);
  const identity = await loadScientificAgentSkillsIdentity(REPO_ROOT);
  const required = requiredReviewSkillIds(identity, await readAdmission(), original.target_reason);
  const requiredSkillId = [...required].find((skillId) => original.reviews.some((review) => review.skill_id === skillId));
  assert.ok(requiredSkillId, "the pinned catalog must review at least one required Skill");
  const invalidCatalogs: Array<() => ScientificAgentSkillsSecurityReviewCatalog> = [
    () => mutate(original, (catalog) => { catalog.reviews[1].skill_id = catalog.reviews[0].skill_id; }),
    () => mutate(original, (catalog) => { catalog.reviews[0].skill_id = "unknown-security-review-skill"; }),
    () => mutate(original, (catalog) => { catalog.reviews[0].inventory.files[0].bytes += 1; }),
    () => mutate(original, (catalog) => { catalog.reviews[0].reviewed_paths.push("skills/absent-security-review-path.md"); }),
    () => mutate(original, (catalog) => {
      const review = catalog.reviews.find((item) => item.findings.length > 0);
      assert.ok(review);
      review.findings.pop();
    }),
    () => mutate(original, (catalog) => {
      const review = catalog.reviews.find((item) => item.inventory.files.some((file) => file.source_path.includes("/scripts/") && file.source_path.endsWith(".py")));
      assert.ok(review);
      const script = review.inventory.files.find((file) => file.source_path.includes("/scripts/") && file.source_path.endsWith(".py"));
      assert.ok(script);
      review.adaptations.push({ kind: "fixed-configuration", source_path: script.source_path, note: "Patch executable behavior." });
    }),
    () => mutate(original, (catalog) => { catalog.reviews = catalog.reviews.filter((review) => review.skill_id !== requiredSkillId); }),
  ];
  for (const makeInvalid of invalidCatalogs) await assert.rejects(validateScientificAgentSkillsSecurityReview(REPO_ROOT, makeInvalid()));

  const stale = mutate(original, (catalog) => { catalog.revision = "0".repeat(40); });
  await assert.rejects(validateScientificAgentSkillsSecurityReview(REPO_ROOT, stale));
});

void test("completed manual security reviews require full paths, findings, decisions, and curation evidence", async () => {
  const original = await loadScientificAgentSkillsSecurityReview(REPO_ROOT);
  const complete = mutate(original, (catalog) => {
    for (const review of catalog.reviews) {
      review.recommendation = "clear";
      review.maintainer_decision = "clear";
      review.reviewed_paths = review.inventory.files.map((item) => item.source_path);
      review.adaptations = [];
      for (const finding of review.findings) {
        finding.verdict = "false-positive";
        finding.analysis = "The pinned Skill tree does not contain the behavior claimed by this finding.";
        finding.residual_risk = "Static review does not certify target-Agent runtime behavior.";
      }
    }
  });
  assert.doesNotThrow(() => assertScientificAgentSkillsSecurityReviewComplete(complete));

  const incompleteFinding = mutate(complete, (catalog) => {
    const review = catalog.reviews.find((item) => item.findings.length > 0);
    assert.ok(review);
    review.findings[0].analysis = null;
  });
  assert.throws(() => assertScientificAgentSkillsSecurityReviewComplete(incompleteFinding));

  const missingCuration = mutate(complete, (catalog) => {
    const review = catalog.reviews[0];
    review.recommendation = "clear-with-adaptation";
    review.maintainer_decision = "clear-with-adaptation";
  });
  assert.throws(() => assertScientificAgentSkillsSecurityReviewComplete(missingCuration));
});

function requiredReviewSkillIds(identity: ScientificAgentSkillsIdentity, admission: AdmissionSummary, targetReason: string): Set<string> {
  const admittedIds = new Set(admission.decisions.filter((decision) => decision.disposition === "admitted").map((decision) => decision.upstream_skill_id));
  const required = new Set<string>();
  for (const skill of identity.audit.skills) {
    if (["critical", "high"].includes(skill.security.highest_severity) && admittedIds.has(skill.skill_id)) required.add(skill.skill_id);
  }
  for (const decision of admission.decisions) if (decision.reason_codes.includes(targetReason)) required.add(decision.upstream_skill_id);
  return required;
}

async function readAdmission(): Promise<AdmissionSummary> {
  return JSON.parse(await readFile(ADMISSION_PATH, "utf8")) as AdmissionSummary;
}

function mutate(
  source: ScientificAgentSkillsSecurityReviewCatalog,
  mutation: (catalog: ScientificAgentSkillsSecurityReviewCatalog) => void,
): ScientificAgentSkillsSecurityReviewCatalog {
  const copy = structuredClone(source);
  mutation(copy);
  return copy;
}
