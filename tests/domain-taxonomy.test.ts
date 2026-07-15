import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { availableDomains, loadPluginRegistry } from "../src/plugins/registry.js";
import { anzsrcGroupDomainId, loadAnzsrcSnapshot } from "../src/plugins/taxonomy.js";

const SNAPSHOT_PATH = path.resolve("src/plugins/taxonomy/anzsrc-for-2020.json");

void test("ANZSRC 2020 snapshot preserves the official hierarchy and attribution", async () => {
  const snapshot = await loadAnzsrcSnapshot(SNAPSHOT_PATH);
  assert.equal(snapshot.divisions.length, 23);
  assert.equal(snapshot.groups.length, 213);
  assert.equal(snapshot.fields.length, 1_967);
  assert.equal(snapshot.source_release, "2025-10-24");
  assert.equal(snapshot.source_sha256, "92b94664eb1e43db1cbcaeb54e60575e3f8573cd10e5e4bb3a9c806cbe462e35");
  assert.equal(snapshot.license, "CC-BY-4.0");
});

void test("internal catalog contains every Group and five tools while public catalog is non-empty", async () => {
  const snapshot = await loadAnzsrcSnapshot(SNAPSHOT_PATH);
  const registry = await loadPluginRegistry();
  const discipline = registry.registry.domains.filter((domain) => domain.domain_type === "discipline");
  const tools = registry.registry.domains.filter((domain) => domain.domain_type === "tool");
  assert.equal(discipline.length, 213);
  assert.equal(tools.length, 5);
  assert.deepEqual(new Set(discipline.map((domain) => domain.anzsrc_group_code)), new Set(snapshot.groups.map((group) => group.code)));
  for (const group of snapshot.groups) {
    const domain = registry.domains.get(anzsrcGroupDomainId(group.title));
    assert.equal(domain?.domain_type, "discipline");
    if (domain?.domain_type === "discipline") assert.equal(domain.anzsrc_group_code, group.code);
  }
  assert.equal(availableDomains(registry).length, 53);
  assert.equal(tools.filter((domain) => domain.skills.length > 0).length, 5);
});

void test("all 318 vendor audit records carry valid Field metadata independent of membership", async () => {
  const snapshot = await loadAnzsrcSnapshot(SNAPSHOT_PATH);
  const fields = new Set(snapshot.fields.map((field) => field.code));
  const sources = [
    { path: path.resolve("audits/tooluniverse/v1.3.1/skill-audit.json"), records: "skills" },
    { path: path.resolve("audits/scientific-agent-skills/v2.53.0/skill-audit.json"), records: "skills" },
    { path: path.resolve("audits/materials-science-skills-for-llm/snapshot-fafd3ab/skill-audit.json"), records: "skills" },
    { path: path.resolve("audits/finrobot/snapshot-297a8d2/capability-audit.json"), records: "candidate_capabilities" },
    { path: path.resolve("audits/histagent/snapshot-47bbe21/capability-audit.json"), records: "candidate_skills" },
  ];
  let records = 0;
  for (const source of sources) {
    const audit = JSON.parse(await readFile(source.path, "utf8")) as Record<string, AuditFieldRecord[]>;
    for (const item of audit[source.records] ?? []) {
      records += 1;
      const recordId = item.skill_id ?? item.capability_id;
      if (item.primary_anzsrc_field === null) {
        assert.ok(item.anzsrc_unclassified_reason, recordId);
        assert.deepEqual(item.additional_anzsrc_fields, [], recordId);
      } else {
        assert.ok(fields.has(item.primary_anzsrc_field), recordId);
        assert.equal(item.anzsrc_unclassified_reason, null, recordId);
        assert.ok(item.additional_anzsrc_fields.every((field) => fields.has(field) && field !== item.primary_anzsrc_field), recordId);
        assert.equal(new Set(item.additional_anzsrc_fields).size, item.additional_anzsrc_fields.length, recordId);
      }
    }
  }
  assert.equal(records, 318);
});

interface AuditFieldRecord {
  skill_id?: string;
  capability_id?: string;
  primary_anzsrc_field: string | null;
  additional_anzsrc_fields: string[];
  anzsrc_unclassified_reason: string | null;
}
