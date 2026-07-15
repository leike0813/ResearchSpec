import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { parse } from "yaml";

import { availableDomains, loadPluginRegistry } from "../src/plugins/registry.js";
import { checkMaterialsIdempotence, checkMaterialsOutput, type MaterialsConversionManifest } from "../src/vendor-converters/materials-science-skills-for-llm/converter.js";
import { loadMaterialsPolicies } from "../src/vendor-converters/materials-science-skills-for-llm/policy.js";
import { walkFiles } from "../src/vendor-converters/shared/staging.js";

const REPO_ROOT = path.resolve(".");
const PLUGIN_ROOT = path.resolve("skills/plugins");
const VENDOR_ROOT = path.join(PLUGIN_ROOT, "vendors/materials-science-skills-for-llm");

void test("Materials production policy resolves every audited item, relationship, file, and resource gate", async () => {
  const policies = await loadMaterialsPolicies(REPO_ROOT);
  const admitted = policies.admission.decisions.filter((item) => item.disposition === "admitted");
  const excluded = policies.admission.decisions.filter((item) => item.disposition === "excluded");
  assert.equal(policies.audit.skills.length, 12);
  assert.equal(admitted.length, 7);
  assert.equal(excluded.length, 5);
  assert.equal(policies.relationships.decisions.length, 7);
  assert.equal(policies.relationships.decisions.filter((item) => item.disposition === "advisory").length, 3);
  assert.equal(policies.relationships.decisions.filter((item) => item.disposition === "source-excluded").length, 4);
  assert.ok(policies.relationships.decisions.every((item) => item.resolved_target === null));
  assert.equal(policies.files.decisions.length, 24);
  assert.equal(policies.files.decisions.filter((item) => item.disposition === "copy").length, 7);
  assert.equal(policies.files.decisions.filter((item) => item.disposition === "curate").length, 15);
  assert.equal(policies.files.decisions.filter((item) => item.disposition === "exclude").length, 2);
  assert.ok(admitted.every((item) => item.license?.expression === "MIT" && item.content_review.outcome === "passed" && item.permission_review.outcome === "passed"));
  assert.ok(admitted.every((item) => policies.externalResources.decisions.some((resource) => resource.upstream_skill_id === item.upstream_skill_id)));
  assert.ok(policies.externalResources.decisions.every((item) => ["preconfigured", "reference-only", "removed"].includes(item.disposition)));
});

void test("Materials generated bundle is attributable, dependency-free, and reachable only through reviewed domains", async () => {
  const bundle = JSON.parse(await readFile(path.join(PLUGIN_ROOT, "vendor-bundles/materials-science-skills-for-llm.json"), "utf8")) as { vendor: { vendor_id: string; skills: Array<{ skill_id: string; license: string; dependencies: string[] }> } };
  const manifest = JSON.parse(await readFile(path.join(PLUGIN_ROOT, "vendor-manifests/materials-science-skills-for-llm.json"), "utf8")) as MaterialsConversionManifest;
  assert.equal(bundle.vendor.vendor_id, "materials-science-skills-for-llm");
  assert.equal(bundle.vendor.skills.length, 7);
  assert.ok(bundle.vendor.skills.every((item) => item.skill_id.startsWith("materials-science-skills-") && item.license === "MIT" && item.dependencies.length === 0));
  assert.equal(manifest.generated_skills.length, 7);
  assert.equal(manifest.excluded_skill_ids.length, 5);
  assert.equal(manifest.file_dispositions.length, 24);
  assert.match(manifest.file_policy_sha256, /^[a-f0-9]{64}$/);

  const loaded = await loadPluginRegistry(PLUGIN_ROOT);
  assert.deepEqual([...loaded.vendors.keys()], ["finrobot", "histagent", "materials-science-skills-for-llm", "scientific-agent-skills", "tooluniverse"]);
  assert.equal(availableDomains(loaded).length, 53);
  assert.equal(loaded.domains.get("materials-engineering")?.skills.filter((id) => id.startsWith("materials-science-skills-")).length, 6);
  assert.equal(loaded.domains.get("macromolecular-and-materials-chemistry")?.skills.filter((id) => id.startsWith("materials-science-skills-")).length, 2);
  assert.equal(loaded.domains.get("computational-modeling-and-simulation")?.skills.filter((id) => id.startsWith("materials-science-skills-")).length, 7);
  assert.equal(loaded.domains.get("research-computing-infrastructure")?.skills.some((id) => id.startsWith("materials-science-skills-")), false);
  assert.ok(manifest.excluded_skill_ids.every((id) => !loaded.skills.has(id)));
});

void test("Materials curation emits valid entries, complete attribution, safe content, and resolved local links", async () => {
  const prohibited = /(?:\/Users\/|pip3?\s+install|conda\s+install|git\s+clone|curl\s+|wget\s+|docker\s+pull|token\s*=|password\s*=)/i;
  const skillRoots = (await readdir(VENDOR_ROOT, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(VENDOR_ROOT, entry.name));
  for (const skillRoot of skillRoots) {
    const skillId = path.basename(skillRoot);
    const entry = await readFile(path.join(skillRoot, "SKILL.md"), "utf8");
    const end = entry.indexOf("\n---\n", 4);
    assert.ok(end > 0, skillId);
    const frontmatter = parse(entry.slice(4, end)) as Record<string, unknown>;
    assert.equal(frontmatter.name, skillId);
    assert.equal(frontmatter.license, "MIT");
    assert.match(String(frontmatter.compatibility), /Requires/);
    assert.match(await readFile(path.join(skillRoot, "LICENSE"), "utf8"), /MIT License/);
    const notice = await readFile(path.join(skillRoot, "NOTICE.md"), "utf8");
    assert.match(notice, /snapshot-fafd3ab/);
    assert.match(notice, /fafd3ab011e4c363658a39c4bb62fc739839d58c/);

    for (const file of await walkFiles(skillRoot)) {
      if (path.extname(file) !== ".md" || path.basename(file) === "NOTICE.md") continue;
      const text = await readFile(file, "utf8");
      assert.equal(prohibited.test(text), false, file);
      for (const link of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
        const target = link[1]?.split("#", 1)[0];
        if (!target || target.startsWith("#") || /^[a-z]+:/i.test(target)) continue;
        await access(path.resolve(path.dirname(file), target));
      }
    }
  }
});

void test("Materials generated output validates and regenerates idempotently", async () => {
  const check = await checkMaterialsOutput(REPO_ROOT);
  assert.equal(check.ok, true, check.errors.join("\n"));
  const idempotence = await checkMaterialsIdempotence(REPO_ROOT);
  assert.deepEqual(idempotence, { ok: true, drift_paths: [] });
});
