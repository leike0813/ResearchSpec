import assert from "node:assert/strict";
import { test } from "node:test";
import path from "node:path";

import {
  assertScientificAgentSkillsSecurityReviewComplete,
  loadScientificAgentSkillsSecurityReview,
  ScientificAgentSkillsSecurityReviewCatalogSchema,
  type ScientificAgentSkillsSecurityReviewCatalog,
  validateScientificAgentSkillsSecurityReview,
} from "../src/vendor-converters/scientific-agent-skills/security-review.js";

const REPO_ROOT = path.resolve(".");

void test("manual security review covers the approved pinned inventory and is complete", async () => {
  const catalog = await loadScientificAgentSkillsSecurityReview(REPO_ROOT);
  assert.equal(catalog.reviews.length, 40);
  assert.equal(catalog.reviews.reduce((sum, review) => sum + review.findings.length, 0), 313);
  assert.equal(catalog.reviews.reduce((sum, review) => sum + review.inventory.summary.files, 0), 430);
  assert.ok(catalog.reviews.every((review) => review.recommendation === review.maintainer_decision));
  assert.doesNotThrow(() => assertScientificAgentSkillsSecurityReviewComplete(catalog));

  const pending = mutate(catalog, (copy) => {
    copy.reviews[0].recommendation = "pending";
    copy.reviews[0].maintainer_decision = "pending";
  });
  assert.throws(() => assertScientificAgentSkillsSecurityReviewComplete(pending));
});

void test("manual security review validation rejects structural and source drift", async () => {
  const original = await loadScientificAgentSkillsSecurityReview(REPO_ROOT);
  const invalidCatalogs: Array<() => ScientificAgentSkillsSecurityReviewCatalog> = [
    () => mutate(original, (catalog) => { catalog.reviews[1].skill_id = catalog.reviews[0].skill_id; }),
    () => mutate(original, (catalog) => { catalog.reviews[0].skill_id = "unknown-security-review-skill"; }),
    () => mutate(original, (catalog) => { catalog.reviews[0].batch = 2; }),
    () => mutate(original, (catalog) => { catalog.reviews[0].inventory.files[0].bytes += 1; }),
    () => mutate(original, (catalog) => { catalog.reviews[0].reviewed_paths.push("skills/fluidsim/absent.md"); }),
    () => mutate(original, (catalog) => { catalog.reviews[0].findings.pop(); }),
    () => mutate(original, (catalog) => {
      const review = catalog.reviews.find((item) => item.skill_id === "infographics");
      assert.ok(review);
      const script = review.inventory.files.find((item) => item.source_path.includes("/scripts/") && item.source_path.endsWith(".py"));
      assert.ok(script);
      review.adaptations.push({ kind: "fixed-configuration", source_path: script.source_path, note: "Patch executable behavior." });
    }),
  ];
  for (const makeInvalid of invalidCatalogs) await assert.rejects(validateScientificAgentSkillsSecurityReview(REPO_ROOT, makeInvalid()));

  const missing = structuredClone(original);
  missing.reviews.pop();
  assert.throws(() => ScientificAgentSkillsSecurityReviewCatalogSchema.parse(missing));

  const stale = { ...structuredClone(original), revision: "0000000000000000000000000000000000000000" };
  assert.throws(() => ScientificAgentSkillsSecurityReviewCatalogSchema.parse(stale));
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
    const review = catalog.reviews[0];
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

function mutate(
  source: ScientificAgentSkillsSecurityReviewCatalog,
  mutation: (catalog: ScientificAgentSkillsSecurityReviewCatalog) => void,
): ScientificAgentSkillsSecurityReviewCatalog {
  const copy = structuredClone(source);
  mutation(copy);
  return copy;
}
