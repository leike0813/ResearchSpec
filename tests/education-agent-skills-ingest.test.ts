import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { parse } from "yaml";

import { recoverEducationSourceBody } from "../src/vendor-converters/education-agent-skills/adaptation.js";
import { renderEducationCompleteTrees } from "../src/vendor-converters/education-agent-skills/complete-tree.js";
import {
  checkEducationAgentSkillsIdempotence,
  checkEducationAgentSkillsOutput,
  convertEducationAgentSkills,
} from "../src/vendor-converters/education-agent-skills/converter.js";
import {
  assertEducationProductionApproved,
  loadEducationAgentSkillsPolicies,
} from "../src/vendor-converters/education-agent-skills/policy.js";
import { writeEducationAgentSkillsPreview } from "../src/vendor-converters/education-agent-skills/preview.js";
import { loadPluginRegistry } from "../src/plugins/registry.js";

const REPO_ROOT = path.resolve(".");
const SOURCE_ROOT = path.join(REPO_ROOT, "vendor/education-agent-skills");
const EXPECTED_TREE_SET_SHA256 = "c4fc2f93a7553a1c02538d15491ed108afd36ad4a4a291ca4db3bad39e74775d";

void test("Education production policy expands every immutable decision exactly once", async () => {
  const policies = await loadEducationAgentSkillsPolicies(REPO_ROOT);
  assert.equal(policies.policySha256, "fcb818163c79058ac084f944700c187c36b06b1698b1c9242454b973e259256f");
  assert.equal(policies.admission.length, 165);
  assert.equal(policies.admission.filter((item) => item.disposition === "admitted").length, 136);
  assert.equal(policies.admission.filter((item) => item.reason_code === "original-framework-origin-unproved").length, 19);
  assert.equal(policies.admission.filter((item) => item.reason_code === "third-party-author-authorization-required").length, 10);
  assert.equal(policies.evidenceAdaptations.length, 872);
  assert.equal(policies.relationships.length, 813);
  assert.equal(policies.safetyDomains.length, 136);
  assert.ok(policies.relationships.every((item) => item.semantics === "advisory" && !item.hard_dependency));
  assert.ok(policies.admission.filter((item) => item.disposition === "admitted").every((item) => item.license === "CC-BY-SA-4.0"));
  assert.deepEqual(domainCounts(policies.safetyDomains), {
    "curriculum-and-pedagogy": 54,
    "education-systems": 9,
    "specialist-studies-in-education": 73,
  });
  assert.equal(policies.review.review_status, "approved");
  assert.equal(policies.review.candidate_tree_set_sha256, EXPECTED_TREE_SET_SHA256);
  assert.equal(policies.review.approved_tree_set_sha256, EXPECTED_TREE_SET_SHA256);
  assert.equal(policies.review.approved_by, "user");
});

void test("Education production approval fails closed for pending or mismatched review state", async () => {
  const policies = await loadEducationAgentSkillsPolicies(REPO_ROOT);
  assert.throws(
    () => assertEducationProductionApproved({
      ...policies,
      review: {
        ...policies.review,
        review_status: "pending-human-review",
        approved_tree_set_sha256: null,
        approved_by: null,
        approved_at: null,
      },
    }, EXPECTED_TREE_SET_SHA256),
    /requires explicit approval of aggregate SHA-256/,
  );
  assert.throws(
    () => assertEducationProductionApproved(policies, "0".repeat(64)),
    /requires explicit approval of aggregate SHA-256/,
  );
});

void test("Education complete trees preserve capability and apply evidence and safety boundaries", async () => {
  const rendered = await renderEducationCompleteTrees(REPO_ROOT);
  assert.equal(rendered.treeSetSha256, EXPECTED_TREE_SET_SHA256);
  assert.equal(rendered.trees.length, 136);
  const evidenceById = new Map(rendered.policies.evidenceAdaptations.map((item) => [item.evidence_id, item]));
  let markedFrontmatter = 0;
  let markedBodyUnits = 0;
  let unmatchedBody = 0;
  for (const tree of rendered.trees) {
    assert.deepEqual(tree.files.map((file) => file.path), ["SKILL.md", "LICENSE", "NOTICE.md"]);
    const source = parseSkill(await readFile(path.join(SOURCE_ROOT, tree.sourcePath), "utf8"));
    const generatedText = tree.files.find((file) => file.path === "SKILL.md")?.content.toString("utf8");
    assert.ok(generatedText);
    const generated = parseSkill(generatedText);
    assert.equal(recoverEducationSourceBody(generatedText), source.body, tree.skillId);
    assert.deepEqual(generated.frontmatter.input_schema, source.frontmatter.input_schema, tree.skillId);
    assert.deepEqual(generated.frontmatter.output_schema, source.frontmatter.output_schema, tree.skillId);
    assert.equal(generated.frontmatter.name, tree.skillId);
    assert.equal(generated.frontmatter.license, "CC-BY-SA-4.0");
    assert.match(tree.files.find((file) => file.path === "LICENSE")?.content.toString("utf8") ?? "", /Attribution-ShareAlike 4\.0/);
    assert.match(tree.files.find((file) => file.path === "NOTICE.md")?.content.toString("utf8") ?? "", /Gareth Manning/);
    assertMarkerIntegrity(generatedText);
    markedFrontmatter += tree.markedFrontmatterEvidenceIds.length;
    markedBodyUnits += tree.bodyEvidenceMatches.length;
    unmatchedBody += tree.unmatchedBodyEvidenceIds.length;
    for (const evidenceId of tree.markedFrontmatterEvidenceIds) {
      const decision = evidenceById.get(evidenceId);
      assert.ok(decision?.work_statuses.some((status) => status === "unresolved" || status === "conflicting"), evidenceId);
    }
    for (const match of tree.bodyEvidenceMatches) {
      assert.ok(match.evidence_ids.length > 0);
      for (const evidenceId of match.evidence_ids) {
        const decision = evidenceById.get(evidenceId);
        assert.equal(decision?.body_strategy, "author-year-complete-unit", evidenceId);
      }
    }
  }
  assert.equal(markedFrontmatter, 360);
  assert.equal(markedBodyUnits, 628);
  assert.equal(unmatchedBody, 43);

  const student = rendered.trees.find((tree) => tree.skillId === "education-agent-skills-stuck-and-error-diagnosis-coach");
  assert.ok(student);
  const studentText = student.files.find((file) => file.path === "SKILL.md")?.content.toString("utf8") ?? "";
  assert.match(studentText, /ResearchSpec minors boundary/);
  assert.match(studentText, /When a learner gets something wrong or feels stuck/);

  const diagnosis = rendered.trees.find((tree) => tree.skillId === "education-agent-skills-error-analysis-protocol");
  assert.ok(diagnosis);
  const diagnosisText = diagnosis.files.find((file) => file.path === "SKILL.md")?.content.toString("utf8") ?? "";
  assert.match(diagnosisText, /ResearchSpec diagnosis boundary/);
  assert.match(diagnosisText, /error pattern/);

  const wellbeing = rendered.trees.find((tree) => tree.skillId === "education-agent-skills-trauma-informed-practice-designer");
  assert.ok(wellbeing);
  const wellbeingText = wellbeing.files.find((file) => file.path === "SKILL.md")?.content.toString("utf8") ?? "";
  assert.match(wellbeingText, /ResearchSpec privacy boundary/);
  assert.match(wellbeingText, /ResearchSpec wellbeing boundary/);
  assert.match(wellbeingText, /Trauma-Informed Practice Designer/);
});

void test("verified-only Education declarations stay unmarked in frontmatter", async () => {
  const rendered = await renderEducationCompleteTrees(REPO_ROOT);
  const treeByUpstream = new Map(rendered.trees.map((tree) => [tree.upstreamSkillId, tree]));
  const decisionsBySkill = new Map<string, typeof rendered.policies.evidenceAdaptations>();
  for (const decision of rendered.policies.evidenceAdaptations.filter((item) => item.generated_skill_admitted)) {
    const values = decisionsBySkill.get(decision.skill_id) ?? [];
    values.push(decision);
    decisionsBySkill.set(decision.skill_id, values);
  }
  for (const [skillId, decisions] of decisionsBySkill) {
    const tree = treeByUpstream.get(skillId);
    assert.ok(tree);
    const generated = parseSkill(tree.files.find((file) => file.path === "SKILL.md")?.content.toString("utf8") ?? "");
    const sources = generated.frontmatter.evidence_sources;
    assert.ok(Array.isArray(sources));
    assert.equal(sources.length, decisions.length);
    for (let index = 0; index < decisions.length; index += 1) {
      const decision = decisions[index];
      const sourceCitation: string = String(sources[index]);
      if (decision?.frontmatter_disposition === "unmarked") {
        assert.equal(sourceCitation, decision.citation, decision.evidence_id);
      } else {
        assert.equal(sourceCitation, `⟦UNRESOLVED⟧${decision?.citation}⟦/UNRESOLVED⟧`, decision?.evidence_id);
      }
    }
  }
});

void test("Education approved preview is deterministic and production conversion is isolated and idempotent", async () => {
  const first = await mkdtemp(path.join(tmpdir(), "researchspec-education-preview-a-"));
  const second = await mkdtemp(path.join(tmpdir(), "researchspec-education-preview-b-"));
  try {
    const left = await writeEducationAgentSkillsPreview(REPO_ROOT, first);
    const right = await writeEducationAgentSkillsPreview(REPO_ROOT, second);
    assert.equal(left.treeSetSha256, EXPECTED_TREE_SET_SHA256);
    assert.equal(right.treeSetSha256, EXPECTED_TREE_SET_SHA256);
    assert.equal(await readFile(path.join(first, "preview-manifest.json"), "utf8"), await readFile(path.join(second, "preview-manifest.json"), "utf8"));
    assert.equal(await readFile(path.join(first, "decision-catalogs.json"), "utf8"), await readFile(path.join(second, "decision-catalogs.json"), "utf8"));
    assert.equal(await readFile(path.join(first, "review-report.zh-CN.md"), "utf8"), await readFile(path.join(second, "review-report.zh-CN.md"), "utf8"));
    const manifest = await convertEducationAgentSkills({ repoRoot: REPO_ROOT, dryRun: true });
    assert.equal(manifest.approved_tree_set_sha256, EXPECTED_TREE_SET_SHA256);
    assert.equal(manifest.generated_skills.length, 136);
    const registry = await loadPluginRegistry();
    assert.equal(registry.vendors.get("education-agent-skills")?.skills.length, 136);
    assert.equal(registry.domains.get("curriculum-and-pedagogy")?.skills.length, 54);
    assert.equal(registry.domains.get("education-systems")?.skills.length, 9);
    assert.equal(registry.domains.get("specialist-studies-in-education")?.skills.length, 73);
    assert.deepEqual(await checkEducationAgentSkillsOutput(REPO_ROOT), { ok: true, errors: [], warnings: [] });
    assert.deepEqual(await checkEducationAgentSkillsIdempotence(REPO_ROOT), { ok: true, drift_paths: [] });
  } finally {
    await rm(first, { recursive: true, force: true });
    await rm(second, { recursive: true, force: true });
  }
});

function parseSkill(text: string): { frontmatter: Record<string, unknown>; body: string } {
  assert.ok(text.startsWith("---\n"));
  const end = text.indexOf("\n---\n", 4);
  assert.ok(end > 0);
  const value = parse(text.slice(4, end)) as unknown;
  assert.ok(value && typeof value === "object" && !Array.isArray(value));
  return { frontmatter: value as Record<string, unknown>, body: text.slice(end + 5) };
}

function assertMarkerIntegrity(text: string): void {
  let depth = 0;
  for (const match of text.matchAll(/⟦UNRESOLVED⟧|⟦\/UNRESOLVED⟧/g)) {
    if (match[0] === "⟦UNRESOLVED⟧") {
      depth += 1;
      assert.equal(depth, 1, "unresolved markers must not nest");
    } else {
      depth -= 1;
      assert.equal(depth, 0, "unresolved closing marker must match an open marker");
    }
  }
  assert.equal(depth, 0, "unresolved markers must be paired");
}

function domainCounts(decisions: Array<{ domain_id: string }>): Record<string, number> {
  return Object.fromEntries([...new Set(decisions.map((item) => item.domain_id))].sort().map((domain) => [domain, decisions.filter((item) => item.domain_id === domain).length]));
}
