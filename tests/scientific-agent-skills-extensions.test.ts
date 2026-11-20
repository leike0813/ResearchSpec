import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { parse, stringify } from "yaml";

import { sha256 } from "../src/core/workspace/write-plan.js";
import { loadPluginExtensionRegistry, resolveDomainExtensions } from "../src/plugins/extensions.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

const CATALOG_PATH = path.resolve("audits/scientific-agent-skills/catalog.json");
const DOMAIN_CATALOG_PATH = path.resolve("src/plugins/domain-catalog.json");
const RAW_PREFIX = "scientific-agent-skills-";
const CAPABILITY_PREFIX = "plugin-" + RAW_PREFIX;

interface MaintenanceCatalog {
  extensions: Array<{ capability_id: string; execution_type: string }>;
}

interface DomainCatalog {
  domains: Array<{ domain_id: string; skills: string[] }>;
}

function brief(scope: string) {
  return {
    scope,
    source_ledger: [{ source: "local-input", state: "reviewed" }],
    method_plan: [{ step: 1, method: "reviewed Scientific Agent Skills workflow" }],
    work_products: [{ path: "work.json", state: "reviewed" }],
    validation_results: [{ check: "evidence", result: "complete" }],
    conclusions: "Evidence-backed result with limitations.",
  };
}

void test("Scientific Agent Skills bulk registry and domain assignments are complete", async () => {
  const catalog = JSON.parse(await readFile(CATALOG_PATH, "utf8")) as MaintenanceCatalog;
  const extensions = await loadPluginExtensionRegistry();
  const ids = [...extensions.capabilities.keys()].filter((id) => id.startsWith(CAPABILITY_PREFIX)).sort();
  const expectedIds = catalog.extensions.map((extension) => extension.capability_id).sort();
  assert.deepEqual(ids, expectedIds);
  assert.deepEqual([...extensions.profiles.keys()].filter((id) => id.startsWith(CAPABILITY_PREFIX)).sort(), expectedIds);

  const mixedCount = catalog.extensions.filter((extension) => extension.execution_type === "mixed").length;
  assert.equal(ids.filter((id) => extensions.capabilities.get(id)?.manifest.execution_type === "mixed").length, mixedCount);
  assert.equal(ids.filter((id) => extensions.capabilities.get(id)?.manifest.execution_type === "llm").length, expectedIds.length - mixedCount);

  const catalogDomains = JSON.parse(await readFile(DOMAIN_CATALOG_PATH, "utf8")) as DomainCatalog;
  const mappedDomains = catalogDomains.domains.filter((domain) => domain.skills.some((skill) => skill.startsWith(RAW_PREFIX)));
  assert.ok(mappedDomains.length > 0);
  for (const domain of mappedDomains) {
    const expected = domain.skills
      .filter((skill) => skill.startsWith(RAW_PREFIX))
      .map((skill) => CAPABILITY_PREFIX + skill.slice(RAW_PREFIX.length))
      .sort();
    const actualCapabilities = resolveDomainExtensions(extensions, [domain.domain_id]).capabilityIds.filter((id) => id.startsWith(CAPABILITY_PREFIX));
    const actualProfiles = resolveDomainExtensions(extensions, [domain.domain_id]).profileIds.filter((id) => id.startsWith(CAPABILITY_PREFIX));
    assert.deepEqual(actualCapabilities, expected, domain.domain_id);
    assert.deepEqual(actualProfiles, expected, domain.domain_id);
  }
});

void test("Scientific Agent Skills regeneration removes only retired declared resources", async () => {
  const root = await tempProject();
  try {
    const writeFixture = async (relativePath: string, content: string | Buffer) => {
      const file = path.join(root, relativePath);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, content);
    };
    const rawSkillId = "scientific-agent-skills-fixture";
    const capabilityId = `plugin-${rawSkillId}`;
    const packageRoot = `skills/plugins/extensions/capabilities/${capabilityId}`;
    const keptResource = "references/kept.bin";
    const keptTarget = `${packageRoot}/${keptResource}`;
    const reviewedBytes = Buffer.from([0x00, 0xff, 0xc3, 0x80]);
    const retiredTarget = `${packageRoot}/references/retired.md`;
    const untouchedTarget = `${packageRoot}/references/untouched.md`;
    const aliasedTarget = `${packageRoot}/alias/untouched.md`;
    const symlinkedRetiredCapability = "plugin-scientific-agent-skills-retired";
    const symlinkedRetiredRoot = `skills/plugins/extensions/capabilities/${symlinkedRetiredCapability}`;
    const symlinkedRetiredTarget = `${symlinkedRetiredRoot}/references/retired.md`;

    await writeFixture(`skills/plugins/vendors/scientific-agent-skills/${rawSkillId}/SKILL.md`, [
      "---",
      `name: ${rawSkillId}`,
      "description: Synthetic fixture workflow.",
      "license: BSD-3-Clause",
      "---",
      "# Fixture workflow",
      "",
      "Use reviewed evidence.",
      "",
    ].join("\n"));
    await writeFixture(`skills/plugins/vendors/scientific-agent-skills/${rawSkillId}/${keptResource}`, reviewedBytes);
    await writeFixture(`skills/plugins/vendors/scientific-agent-skills/${rawSkillId}/LICENSE`, "reviewed license\n");
    await writeFixture(`skills/plugins/vendors/scientific-agent-skills/${rawSkillId}/NOTICE.md`, "reviewed notice\n");
    await writeFixture(`${packageRoot}/references/retired.md`, "retired\n");
    await writeFixture(untouchedTarget, "untouched\n");
    await symlink(path.join(root, packageRoot, "references"), path.join(root, packageRoot, "alias"), "dir");
    await writeFixture("outside.txt", "outside\n");
    await writeFixture("retired-package/references/retired.md", "symlinked retired\n");
    await mkdir(path.dirname(path.join(root, symlinkedRetiredRoot)), { recursive: true });
    await symlink(path.join(root, "retired-package"), path.join(root, symlinkedRetiredRoot), "dir");
    await writeFixture("scripts/scientific-agent-skills-validator-template.py", "# synthetic validator\n");
    await mkdir(path.join(root, "skills/plugins/extensions/profiles"), { recursive: true });
    await writeFixture("skills/plugins/vendor-bundles/scientific-agent-skills.json", JSON.stringify({
      vendor: {
        license: "MIT",
        release: "vfixture",
        revision: "a".repeat(40),
        skills: [{ skill_id: rawSkillId, license: "BSD-3-Clause" }],
      },
    }, null, 2));
    await writeFixture("src/plugins/domain-catalog.json", JSON.stringify({ domains: [] }, null, 2));
    await writeFixture("audits/scientific-agent-skills/catalog.json", JSON.stringify({
      schema_version: "1",
      vendor_id: "scientific-agent-skills",
      anchor_id: "synthetic",
      extensions: [{
        capability_id: capabilityId,
        tool_files: [
          { source: `skills/plugins/vendors/scientific-agent-skills/${rawSkillId}/${keptResource}`, target: keptTarget },
          { source: `skills/plugins/vendors/scientific-agent-skills/${rawSkillId}/references/retired.md`, target: retiredTarget },
          { source: `skills/plugins/vendors/scientific-agent-skills/${rawSkillId}/alias/untouched.md`, target: aliasedTarget },
          { source: "outside.txt", target: "outside.txt" },
        ],
      }, {
        capability_id: symlinkedRetiredCapability,
        tool_files: [{ source: "retired-package/references/retired.md", target: symlinkedRetiredTarget }],
      }],
    }, null, 2));

    const generated = spawnSync(process.execPath, [path.resolve("scripts/generate-scientific-agent-skills-extensions.mjs")], {
      cwd: root,
      encoding: "utf8",
    });
    assert.equal(generated.status, 0, generated.stderr || generated.error?.message);
    await assert.rejects(readFile(path.join(root, retiredTarget)), { code: "ENOENT" });
    assert.deepEqual(await readFile(path.join(root, keptTarget)), reviewedBytes);
    const manifest = parse(await readFile(path.join(root, packageRoot, "manifest.yaml"), "utf8")) as {
      license: string;
      knowledge_refs: Array<{ path: string; content_hash: string }>;
    };
    assert.equal(manifest.license, "BSD-3-Clause");
    assert.equal(await readFile(path.join(root, packageRoot, "LICENSE"), "utf8"), "reviewed license\n");
    assert.equal(await readFile(path.join(root, packageRoot, "NOTICE.md"), "utf8"), "reviewed notice\n");
    assert.equal(manifest.knowledge_refs.find((reference) => reference.path === keptResource)?.content_hash, sha256(reviewedBytes));
    assert.equal(await readFile(path.join(root, untouchedTarget), "utf8"), "untouched\n");
    assert.equal(await readFile(path.join(root, "outside.txt"), "utf8"), "outside\n");
    assert.equal(await readFile(path.join(root, symlinkedRetiredTarget), "utf8"), "symlinked retired\n");

    const catalog = JSON.parse(await readFile(path.join(root, "audits/scientific-agent-skills/catalog.json"), "utf8")) as {
      extensions: Array<{ tool_files: Array<{ target: string }> }>;
    };
    assert.deepEqual(catalog.extensions[0]?.tool_files.map((file) => file.target), [keptTarget]);
  } finally {
    await cleanup(root);
  }
});

void test("representative Scientific Agent Skills profiles run through the graph engine", async () => {
  const catalogDomains = JSON.parse(await readFile(DOMAIN_CATALOG_PATH, "utf8")) as DomainCatalog;
  const cases = catalogDomains.domains
    .filter((domain) => domain.skills.some((skill) => skill.startsWith(RAW_PREFIX)))
    .sort((left, right) => left.domain_id.localeCompare(right.domain_id, "en"))
    .slice(0, 2)
    .map((domain) => {
      const skill = [...domain.skills].filter((item) => item.startsWith(RAW_PREFIX)).sort()[0];
      assert.ok(skill, domain.domain_id);
      return { domain_id: domain.domain_id, profile_id: CAPABILITY_PREFIX + skill.slice(RAW_PREFIX.length) };
    });
  assert.equal(cases.length, 2);

  const root = await tempProject();
  try {
    const initialized = parseEnvelope(runCli(["init", root, "--tools", "codex", "--delivery", "skills", "--json"], root));
    assert.equal(initialized.ok, true, JSON.stringify(initialized.error));

    for (const entry of cases) {
      const installed = parseEnvelope<{ resolved_capability_ids: string[] }>(
        runCli(["plugin", "install", entry.domain_id, "--yes", "--json"], root),
      );
      assert.equal(installed.ok, true, JSON.stringify(installed.error));
      assert.equal(installed.data?.resolved_capability_ids.includes(entry.profile_id), true, entry.profile_id);

      const startInput = path.join(root, "start-" + entry.profile_id + ".yaml");
      const advanceInput = path.join(root, "advance-" + entry.profile_id + ".yaml");
      const briefRelative = "brief-" + entry.profile_id + ".json";
      const briefPath = path.join(root, briefRelative);
      await writeFile(path.join(root, "task-" + entry.profile_id + ".md"), "# Research task\n", "utf8");
      await writeFile(startInput, stringify({
        schema_version: "2",
        confirmed_at: "2026-08-17T04:00:00+08:00",
        entry_id: "main",
        entry_node_id: "research",
        prerequisites: [],
        handoff_inputs: [{ role: "task_request", type: "markdown", path: "task-" + entry.profile_id + ".md", purpose: entry.profile_id }],
        planned_outputs: [{ role: "research_brief", type: "json", path: briefRelative, purpose: entry.profile_id + " brief" }],
        formal_gates: [],
        cost: { effort: "low", interaction: "single_pass" },
      }), "utf8");

      const started = parseEnvelope<{ run_id: string }>(runCli(["start", entry.profile_id, "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
      assert.equal(started.ok, true, entry.profile_id + ": " + JSON.stringify(started.error));
      const runId = started.data?.run_id ?? "";
      assert.match(runId, /^run-[a-f0-9]+$/);

      const instructions = parseEnvelope<{ capability: { capability_id: string } }>(runCli(["instructions", "node:" + runId + "/research", "--json"], root));
      assert.equal(instructions.ok, true, JSON.stringify(instructions.error));
      assert.equal(instructions.data?.capability.capability_id, entry.profile_id);

      await writeFile(advanceInput, stringify({ outputs: [{ role: "research_brief", path: briefRelative }] }), "utf8");
      await writeFile(briefPath, JSON.stringify({ scope: "incomplete" }), "utf8");
      const invalid = parseEnvelope(runCli(["advance", "node:" + runId + "/research", "--input", advanceInput, "--json"], root));
      assert.equal(invalid.ok, false, entry.profile_id + " invalid advance unexpectedly succeeded");
      assert.match(invalid.error?.code ?? "", /node_validators_failed/);

      await writeFile(briefPath, JSON.stringify(brief(entry.profile_id)), "utf8");
      const advanced = parseEnvelope<{ node: { state: string } }>(runCli(["advance", "node:" + runId + "/research", "--input", advanceInput, "--json"], root));
      assert.equal(advanced.ok, true, entry.profile_id + ": " + JSON.stringify(advanced.error));
      assert.equal(advanced.data?.node.state, "complete");
    }
  } finally {
    await cleanup(root);
  }
});
