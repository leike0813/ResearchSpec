import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import {
  checkEducationAgentSkillsEvidenceArtifacts,
  EDUCATION_AGENT_SKILLS_EVIDENCE,
  EducationAgentSkillsEvidenceMapSchema,
  EvidenceDeclarationMappingSchema,
  EvidenceWorkSchema,
  parseEducationAgentSkillsEvidenceMap,
  renderEducationAgentSkillsEvidenceJson,
  renderEducationAgentSkillsEvidenceReport,
  validateEvidenceMapAgainstAudit,
  type EducationAgentSkillsEvidenceMap,
} from "../src/vendor-evidence/education-agent-skills/index.js";
import {
  EDUCATION_AGENT_SKILLS,
  EducationAgentSkillsAuditSchema,
  type EducationAgentSkillsAudit,
} from "../src/vendor-audits/education-agent-skills.js";
import { runCli } from "./helpers/cli.js";

const AUDIT_PATH = path.resolve(EDUCATION_AGENT_SKILLS.auditPath);
const MAP_PATH = path.resolve(EDUCATION_AGENT_SKILLS_EVIDENCE.mapPath);
const REPORT_PATH = path.resolve(EDUCATION_AGENT_SKILLS_EVIDENCE.reportPath);
let auditJson: string | undefined;
let audit: EducationAgentSkillsAudit | undefined;
let mapJson: string | undefined;
let evidenceMap: EducationAgentSkillsEvidenceMap | undefined;

void test("evidence map binds the exact immutable audit and covers all 872 declarations once", async () => {
  const values = await loadArtifacts();
  assert.equal(values.evidenceMap.declaration_mappings.length, 872);
  assert.equal(values.evidenceMap.summary.declarations, 872);
  assert.equal(values.evidenceMap.summary.skills, 165);
  assert.equal(values.evidenceMap.audit_binding.audit_sha256, createHash("sha256").update(values.auditJson).digest("hex"));
  assert.equal(values.evidenceMap.audit_binding.snapshot_id, values.audit.snapshot.snapshot_id);
  assert.equal(values.evidenceMap.audit_binding.revision, values.audit.snapshot.revision);
  assert.equal(values.evidenceMap.audit_binding.tree_hash, values.audit.snapshot.tree_hash);
  assert.deepEqual(
    values.evidenceMap.declaration_mappings.map((mapping) => mapping.evidence_id),
    values.audit.evidence.map((entry) => entry.evidence_id),
  );
  assert.doesNotThrow(() => validateEvidenceMapAgainstAudit(values.evidenceMap, values.audit, values.auditJson));

  const drifted = structuredClone(values.evidenceMap);
  if (drifted.declaration_mappings[0]) drifted.declaration_mappings[0].citation = "drifted";
  assert.throws(
    () => validateEvidenceMapAgainstAudit(drifted, values.audit, values.auditJson),
    /source identity differs/,
  );
});

void test("work catalog is normalized, fully referenced, and preserves reviewed existence boundaries", async () => {
  const { evidenceMap: value } = await loadArtifacts();
  assert.equal(new Set(value.works.map((work) => work.work_id)).size, value.works.length);
  assert.ok(value.works.length < value.declaration_mappings.length);
  assert.ok(value.works.every((work) => !work.claim_support_reviewed));
  const referenced = new Set(value.declaration_mappings.flatMap((mapping) => mapping.work_ids));
  assert.deepEqual([...referenced].sort(compareText), value.works.map((work) => work.work_id));
  for (const work of value.works) {
    assert.ok(work.review_reason);
    if (work.existence_status === "verified") {
      assert.ok(work.sources.some((source) => source.outcome === "matched" && source.returned_metadata));
    } else if (work.existence_status === "not-applicable") {
      assert.ok(["framework", "practice-method", "other"].includes(work.type));
      assert.equal(work.sources.length, 0);
    } else {
      assert.ok(work.sources.length >= 1);
    }
  }
  assert.equal(
    Object.values(value.summary.existence_status_counts).reduce((sum, count) => sum + count, 0),
    value.works.length,
  );

  const verified = value.works.find((work) => work.existence_status === "verified");
  assert.ok(verified);
  assert.throws(() => EvidenceWorkSchema.parse({ ...verified, claim_support_reviewed: true }));
  const invalidNotApplicable = structuredClone(value.works.find((work) => work.existence_status === "not-applicable"));
  assert.ok(invalidNotApplicable);
  invalidNotApplicable.type = "paper";
  assert.throws(() => EvidenceWorkSchema.parse(invalidNotApplicable), /non-publication evidence types/);
});

void test("Google Scholar discovery preserves initial unresolved coverage without becoming a verification source", async () => {
  const { evidenceMap: value } = await loadArtifacts();
  const discovery = value.google_scholar_discovery;
  const covered = [
    ...discovery.results.map((result) => result.work_id),
    ...discovery.no_result_work_ids,
    ...discovery.blocked_work_ids,
  ];
  assert.equal(discovery.initial_unresolved_works, 428);
  assert.equal(covered.length, 428);
  assert.equal(new Set(covered).size, 428);
  assert.deepEqual(value.summary.google_scholar_discovery, {
    searches: 428,
    outcome_counts: {
      "results-returned": 18,
      "no-results": 11,
      blocked: 399,
    },
  });
  assert.ok(discovery.results.every((result) => result.candidates.length >= 1));
  assert.ok(discovery.blocked_reason);
  assert.ok(value.works.every((work) => work.sources.every((source) => !new URL(source.url).hostname.endsWith("scholar.google.com"))));
  const independentlyVerified = new Set([
    "work-0294",
    "work-0295",
    "work-0298",
    "work-0299",
    "work-0300",
    "work-0301",
    "work-0309",
    "work-0310",
    "work-0312",
    "work-0313",
    "work-0314",
    "work-0315",
    "work-0316",
    "work-0317",
    "work-0318",
    "work-0319",
    "work-0320",
  ]);
  for (const work of value.works.filter((entry) => independentlyVerified.has(entry.work_id))) {
    assert.equal(work.existence_status, "verified");
    assert.ok(work.sources.some((source) => source.outcome === "matched"));
  }
  assert.equal(value.works.find((work) => work.work_id === "work-0311")?.existence_status, "unresolved");
});

void test("mapping semantics permit explicit composites and reject ordinary fan-out", async () => {
  const { evidenceMap: value } = await loadArtifacts();
  const representative = value.declaration_mappings[0];
  assert.ok(representative);
  assert.doesNotThrow(() => EvidenceDeclarationMappingSchema.parse({
    ...representative,
    match_type: "composite",
    work_ids: ["work-0001", "work-0002"],
    rationale: "The declaration explicitly identifies two publication versions.",
  }));
  assert.throws(() => EvidenceDeclarationMappingSchema.parse({
    ...representative,
    match_type: "normalized",
    work_ids: ["work-0001", "work-0002"],
  }), /only composite mappings/);
  assert.ok(value.declaration_mappings.some((mapping) => mapping.match_type === "composite" && mapping.work_ids.length > 1));
  assert.ok(value.declaration_mappings.every((mapping) => mapping.match_type === "composite" || mapping.work_ids.length === 1));
});

void test("incremental rebinding inherits the prior evidence map and re-binds only the changed Skills", async () => {
  const values = await loadArtifacts();
  const previous = JSON.parse(
    await readFile(path.resolve("audits/education-agent-skills/snapshot-32fce5c/evidence-map.json"), "utf8"),
  ) as EducationAgentSkillsEvidenceMap;
  assert.deepEqual(values.evidenceMap.works, previous.works);
  assert.deepEqual(values.evidenceMap.summary.existence_status_counts, previous.summary.existence_status_counts);
  assert.deepEqual(values.evidenceMap.google_scholar_discovery, previous.google_scholar_discovery);
  const previousById = new Map(previous.declaration_mappings.map((mapping) => [mapping.evidence_id, mapping]));
  const changed = values.evidenceMap.declaration_mappings.filter((mapping) => previousById.get(mapping.evidence_id)?.source_sha256 !== mapping.source_sha256);
  assert.deepEqual([...new Set(changed.map((mapping) => mapping.skill_id))].sort(compareText), [
    "student-learning/unassisted-evidence-checkpoint",
    "student-learning/weekly-agency-review",
  ]);
  for (const mapping of values.evidenceMap.declaration_mappings) {
    if (changed.includes(mapping)) continue;
    assert.deepEqual(mapping, previousById.get(mapping.evidence_id), mapping.evidence_id);
  }
  const citationChanged = values.evidenceMap.declaration_mappings.filter((mapping) => previousById.get(mapping.evidence_id)?.citation !== mapping.citation);
  assert.deepEqual(citationChanged.map((mapping) => mapping.evidence_id), ["evidence-0768"]);
  assert.deepEqual(citationChanged[0]?.work_ids, ["work-0317"]);
  const binding = JSON.parse(
    await readFile(path.resolve("audits/education-agent-skills/snapshot-6bbbce4/incremental-binding.json"), "utf8"),
  ) as { new_audit_sha256: string; new_evidence_map_sha256: string; rebound: { declarations: number; citation_changed: number; unaffected_declarations: number } };
  assert.equal(binding.rebound.declarations, 10);
  assert.equal(binding.rebound.citation_changed, 1);
  assert.equal(binding.rebound.unaffected_declarations, 862);
  assert.equal(binding.new_audit_sha256, createHash("sha256").update(values.auditJson).digest("hex"));
  assert.equal(binding.new_evidence_map_sha256, createHash("sha256").update(values.mapJson).digest("hex"));
});

void test("JSON and report are deterministic, JSON-derived, and checked read-only", async () => {
  const values = await loadArtifacts();
  assert.equal(renderEducationAgentSkillsEvidenceJson(values.evidenceMap), values.mapJson);
  assert.equal(renderEducationAgentSkillsEvidenceReport(values.evidenceMap), values.report);
  assert.deepEqual(
    checkEducationAgentSkillsEvidenceArtifacts(values.auditJson, values.mapJson, values.report),
    [],
  );
  const compactJson = JSON.stringify(JSON.parse(values.mapJson));
  const jsonDrift = checkEducationAgentSkillsEvidenceArtifacts(values.auditJson, compactJson, values.report);
  assert.equal(jsonDrift.length, 1);
  assert.match(jsonDrift[0] ?? "", /canonical deterministic JSON/);
  assert.deepEqual(
    checkEducationAgentSkillsEvidenceArtifacts(values.auditJson, values.mapJson, `${values.report} `),
    [`${EDUCATION_AGENT_SKILLS_EVIDENCE.reportPath} differs from the JSON-derived report.`],
  );
});

void test("evidence verification and conversion policy remain maintainer-only after ingestion", async () => {
  const packageJson = JSON.parse(await readFile(path.resolve("package.json"), "utf8")) as {
    files: string[];
    scripts: Record<string, string>;
  };
  assert.ok(packageJson.files.includes("!dist/src/vendor-evidence"));
  assert.deepEqual(
    Object.keys(packageJson.scripts).filter((name) => name.startsWith("education-agent-skills:")).sort(compareText),
    [
      "education-agent-skills:audit",
      "education-agent-skills:audit:check",
      "education-agent-skills:check",
      "education-agent-skills:convert",
      "education-agent-skills:evidence:check",
      "education-agent-skills:idempotence",
      "education-agent-skills:preview",
    ],
  );
  const registry = JSON.parse(await readFile(path.resolve("skills/plugins/registry.json"), "utf8")) as {
    vendors: Array<{ vendor_id: string }>;
  };
  assert.equal(registry.vendors.some((vendor) => vendor.vendor_id === "education-agent-skills"), true);
  const help = runCli(["--help"]);
  assert.equal(help.status, 0);
  assert.doesNotMatch(help.stdout, /education-agent-skills/);
});

async function loadArtifacts(): Promise<{
  auditJson: string;
  audit: EducationAgentSkillsAudit;
  mapJson: string;
  evidenceMap: EducationAgentSkillsEvidenceMap;
  report: string;
}> {
  auditJson ??= await readFile(AUDIT_PATH, "utf8");
  audit ??= EducationAgentSkillsAuditSchema.parse(JSON.parse(auditJson));
  mapJson ??= await readFile(MAP_PATH, "utf8");
  evidenceMap ??= parseEducationAgentSkillsEvidenceMap(mapJson);
  const report = await readFile(REPORT_PATH, "utf8");
  assert.doesNotThrow(() => EducationAgentSkillsEvidenceMapSchema.parse(evidenceMap));
  return { auditJson, audit, mapJson, evidenceMap, report };
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
