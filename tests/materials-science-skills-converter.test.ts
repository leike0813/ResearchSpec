import assert from "node:assert/strict";
import { access, cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { parse } from "yaml";

import { availableDomains, loadPluginRegistry } from "../src/plugins/registry.js";
import { renderMaterialsCompleteTrees } from "../src/vendor-converters/materials-science-skills-for-llm/complete-tree.js";
import { checkMaterialsIdempotence, checkMaterialsOutput, type MaterialsConversionManifest } from "../src/vendor-converters/materials-science-skills-for-llm/converter.js";
import { loadMaterialsPolicies } from "../src/vendor-converters/materials-science-skills-for-llm/policy.js";
import { MATERIALS_SKILL_DEFINITIONS } from "../src/vendor-converters/materials-science-skills-for-llm/skill-definitions.js";
import { PRODUCTION_VENDOR_IDS } from "../src/vendor-converters/shared/production-vendors.js";
import { walkFiles } from "../src/vendor-converters/shared/staging.js";

const REPO_ROOT = path.resolve(".");
const PLUGIN_ROOT = path.resolve("skills/plugins");
const VENDOR_ROOT = path.join(PLUGIN_ROOT, "vendors/materials-science-skills-for-llm");
const APPROVED_HASH = "c45bafc4be7e4fa540cc119cbaa81cec8f0e453d60fc9f2efd0124d8ec717e3e";

void test("Materials version 2 policy preserves admission while resolving complete-tree implementation", async () => {
  const policies = await loadMaterialsPolicies(REPO_ROOT);
  const admitted = policies.admission.decisions.filter((item) => item.disposition === "admitted");
  const excluded = policies.admission.decisions.filter((item) => item.disposition === "excluded");
  const definitions = Object.values(MATERIALS_SKILL_DEFINITIONS);
  const capabilities = definitions.flatMap((definition) => definition.capabilities);
  assert.equal(policies.audit.skills.length, 12);
  assert.equal(admitted.length, 7);
  assert.equal(excluded.length, 5);
  assert.equal(policies.relationships.decisions.length, 7);
  assert.equal(policies.externalResources.decisions.length, 14);
  assert.equal(policies.files.decisions.length, 24);
  assert.equal(policies.files.decisions.filter((item) => item.disposition === "adapted").length, 22);
  assert.equal(policies.files.decisions.filter((item) => item.disposition === "excluded").length, 2);
  assert.equal(definitions.length, 7);
  assert.equal(definitions.filter((item) => item.tier === 1).length, 1);
  assert.equal(definitions.filter((item) => item.tier === 2).length, 6);
  assert.equal(definitions.reduce((count, item) => count + item.references.length, 0), 6);
  assert.equal(capabilities.filter((item) => item.implementation.kind === "agent-procedure").length, 14);
  assert.equal(capabilities.filter((item) => item.implementation.kind === "external-tool").length, 9);
  assert.ok(definitions.every((item) => item.scripts.length === 0 && item.resources.length === 0 && item.state === undefined && item.hardDependencies.length === 0));
  assert.equal(policies.review.published.converter_version, "2");
  assert.equal(policies.review.published.tree_set_sha256, APPROVED_HASH);
  assert.equal(policies.review.candidate, null);
});

void test("Materials complete trees validate exact tiers, provenance, and progressive disclosure", async () => {
  const rendered = await renderMaterialsCompleteTrees(REPO_ROOT);
  assert.equal(rendered.treeSetSha256, APPROVED_HASH);
  assert.equal(rendered.reviewStatus, "approved");
  assert.equal(rendered.trees.length, 7);
  for (const tree of rendered.trees) {
    const definition = MATERIALS_SKILL_DEFINITIONS[tree.skillId];
    assert.ok(definition);
    assert.equal(tree.files.length, tree.tier === 1 ? 4 : 5);
    const paths = tree.files.map((file) => file.path);
    assert.ok(paths.includes("SKILL.md"));
    assert.ok(paths.includes("LICENSE"));
    assert.ok(paths.includes("NOTICE.md"));
    assert.ok(paths.includes("DERIVATION.json"));
    assert.equal(paths.filter((file) => file.startsWith("references/")).length, tree.tier === 1 ? 0 : 1);
    assert.equal(paths.some((file) => /^(?:scripts|lib|assets|resources)\//u.test(file)), false);

    const skillText = tree.files.find((file) => file.path === "SKILL.md")?.content.toString("utf8") ?? "";
    const end = skillText.indexOf("\n---\n", 4);
    const frontmatter = parse(skillText.slice(4, end)) as Record<string, unknown>;
    assert.equal(frontmatter.name, tree.skillId);
    assert.equal(frontmatter.license, "MIT");
    for (const reference of definition.references) {
      assert.match(skillText, new RegExp(escapeRegExp(reference.path)));
      assert.match(skillText.toLowerCase(), new RegExp(escapeRegExp(reference.readWhen.toLowerCase())));
    }
    const derivation = JSON.parse(tree.files.find((file) => file.path === "DERIVATION.json")?.content.toString("utf8") ?? "{}") as {
      audit_sha256?: string;
      capability_map?: unknown[];
      source_file_map?: unknown[];
    };
    assert.equal(derivation.audit_sha256, "03a12b5547b140c68458b5bf988f8df7056178a56c8fe41be2a3ffd29cf16589");
    assert.equal(derivation.capability_map?.length, definition.capabilities.length);
    assert.ok((derivation.source_file_map?.length ?? 0) > 0);
  }
});

void test("Materials generated bundle is hash-bound, dependency-free, and in only reviewed domains", async () => {
  const bundle = JSON.parse(await readFile(path.join(PLUGIN_ROOT, "vendor-bundles/materials-science-skills-for-llm.json"), "utf8")) as { vendor: { vendor_id: string; converter_version: string; skills: Array<{ skill_id: string; license: string; dependencies: string[] }> } };
  const manifest = JSON.parse(await readFile(path.join(PLUGIN_ROOT, "vendor-manifests/materials-science-skills-for-llm.json"), "utf8")) as MaterialsConversionManifest;
  assert.equal(bundle.vendor.vendor_id, "materials-science-skills-for-llm");
  assert.equal(bundle.vendor.converter_version, "2");
  assert.equal(bundle.vendor.skills.length, 7);
  assert.ok(bundle.vendor.skills.every((item) => item.skill_id.startsWith("materials-science-skills-") && item.license === "MIT" && item.dependencies.length === 0));
  assert.equal(manifest.converter_version, "2");
  assert.equal(manifest.approved_tree_set_sha256, APPROVED_HASH);
  assert.equal(manifest.generated_skills.length, 7);
  assert.equal(manifest.excluded_skill_ids.length, 5);
  assert.equal(manifest.source_file_dispositions.length, 24);
  assert.equal(manifest.generated_file_dispositions.length, 34);
  assert.deepEqual(manifest.implementation_counts, { agent_procedures: 14, external_tools: 9, references: 6, bundled_scripts: 0 });

  const loaded = await loadPluginRegistry(PLUGIN_ROOT);
  assert.deepEqual([...loaded.vendors.keys()], [...PRODUCTION_VENDOR_IDS]);
  const domainCatalog = JSON.parse(await readFile(path.resolve("src/plugins/domain-catalog.json"), "utf8")) as { domains: Array<{ skills: string[] }> };
  assert.equal(availableDomains(loaded).length, domainCatalog.domains.filter((domain) => domain.skills.length > 0).length);
  assert.equal(loaded.domains.get("materials-engineering")?.skills.filter((id) => id.startsWith("materials-science-skills-")).length, 6);
  assert.equal(loaded.domains.get("macromolecular-and-materials-chemistry")?.skills.filter((id) => id.startsWith("materials-science-skills-")).length, 2);
  assert.equal(loaded.domains.get("computational-modeling-and-simulation")?.skills.filter((id) => id.startsWith("materials-science-skills-")).length, 7);
  assert.equal(loaded.domains.get("research-computing-infrastructure")?.skills.some((id) => id.startsWith("materials-science-skills-")), false);
});

void test("Materials complete trees remain portable outside the repository", async () => {
  const rendered = await renderMaterialsCompleteTrees(REPO_ROOT);
  const copiedRoot = await mkdtemp(path.join(tmpdir(), "researchspec-materials-copied-trees-"));
  try {
    for (const tree of rendered.trees) {
      const skillRoot = path.join(copiedRoot, tree.skillId);
      for (const file of tree.files) {
        const target = path.join(skillRoot, file.path);
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, file.content);
      }
      const entry = await readFile(path.join(skillRoot, "SKILL.md"), "utf8");
      assert.equal(/src\/vendor-converters|vendor\/materials-science-skills-for-llm|audits\/materials-science-skills-for-llm/u.test(entry), false);
      for (const file of await walkFiles(skillRoot)) {
        if (path.extname(file) !== ".md" || path.basename(file) === "NOTICE.md") continue;
        const text = await readFile(file, "utf8");
        for (const link of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/gu)) {
          const target = link[1]?.split("#", 1)[0];
          if (!target || target.startsWith("#") || /^[a-z]+:/iu.test(target)) continue;
          await access(path.resolve(path.dirname(file), target));
        }
      }
    }
  } finally { await rm(copiedRoot, { recursive: true, force: true }); }
});

void test("Materials approval rejects any authored tree byte drift", async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), "researchspec-materials-review-drift-"));
  try {
    await cp(path.join(REPO_ROOT, "audits/materials-science-skills-for-llm"), path.join(temporaryRoot, "audits/materials-science-skills-for-llm"), { recursive: true });
    await cp(path.join(REPO_ROOT, "vendor/materials-science-skills-for-llm"), path.join(temporaryRoot, "vendor/materials-science-skills-for-llm"), { recursive: true });
    await cp(path.join(REPO_ROOT, "src/vendor-converters/materials-science-skills-for-llm"), path.join(temporaryRoot, "src/vendor-converters/materials-science-skills-for-llm"), { recursive: true });
    const skillPath = path.join(temporaryRoot, "src/vendor-converters/materials-science-skills-for-llm/skills/materials-science-skills-atomsk-cli/SKILL.md");
    await writeFile(skillPath, `${await readFile(skillPath, "utf8")}\n`, "utf8");
    const drifted = await renderMaterialsCompleteTrees(temporaryRoot, { enforceReview: false });
    assert.notEqual(drifted.treeSetSha256, APPROVED_HASH);
    await assert.rejects(renderMaterialsCompleteTrees(temporaryRoot), /differ from the approved review decision/u);
  } finally { await rm(temporaryRoot, { recursive: true, force: true }); }
});

void test("Materials generated output validates and regenerates idempotently", async () => {
  const skillRoots = (await readdir(VENDOR_ROOT, { withFileTypes: true })).filter((entry) => entry.isDirectory());
  assert.equal(skillRoots.length, 7);
  const check = await checkMaterialsOutput(REPO_ROOT);
  assert.equal(check.ok, true, check.errors.join("\n"));
  const idempotence = await checkMaterialsIdempotence(REPO_ROOT);
  assert.deepEqual(idempotence, { ok: true, drift_paths: [] });
});

function escapeRegExp(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"); }
