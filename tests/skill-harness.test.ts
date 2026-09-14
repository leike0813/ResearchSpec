import assert from "node:assert/strict";
import { mkdir, symlink, writeFile } from "node:fs/promises";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { test } from "node:test";

import { COMPANION_INTENTS, renderCompanionSkill } from "../src/adapters/companion/index.js";
import { LITERATURE_ADAPTER_SKILL_IDS } from "../src/literature-adapters/catalog.js";
import { loadProcedureCatalog } from "../src/procedures/catalog.js";
import { loadHarnessCatalog, readHarnessFile, validateHarnessSkillRoot, type HarnessFileTreeNode } from "../harness/catalog.js";
import { createSkillHarnessServer, HARNESS_DEFAULT_HOST, renderHarnessMarkdown } from "../harness/server.js";
import { cleanup, tempProject } from "./helpers/cli.js";

const REPO_ROOT = path.resolve(".");

void test("harness separates visible entries from the complete hidden procedure inventory", async () => {
  const loaded = await loadHarnessCatalog(REPO_ROOT);
  const procedureCatalog = await loadProcedureCatalog(REPO_ROOT);
  assert.equal(loaded.catalog.summary.visible_entries, 1 + LITERATURE_ADAPTER_SKILL_IDS.length);
  assert.equal(loaded.catalog.summary.procedures, procedureCatalog.size);
  assert.equal(loaded.catalog.summary.arsu_procedures, 4);
  assert.equal(loaded.catalog.summary.companion_procedures, COMPANION_INTENTS.length - 1);
  assert.equal(loaded.catalog.summary.core_procedures, 47);
  assert.equal(loaded.catalog.summary.plugin_procedures, 332);
  assert.equal(loaded.catalog.summary.literature_adapter_skills, LITERATURE_ADAPTER_SKILL_IDS.length);
  const adapterSkills = loaded.catalog.visible_entries.filter((skill) => skill.family === "literature-adapter");
  assert.equal(adapterSkills.length, 7);
  assert.equal(adapterSkills.filter((skill) => skill.adapter?.role === "router").length, 1);
  assert.equal(adapterSkills.filter((skill) => skill.adapter?.role === "task").length, 5);
  assert.equal(adapterSkills.filter((skill) => skill.adapter?.role === "mechanism").length, 1);
  assert.equal(adapterSkills.every((skill) => skill.files.some((file) => file.path === "assets/runner.json")), true);
  assert.equal(loaded.catalog.summary.domains, 218);
  assert.equal(loaded.catalog.summary.available_domains, loaded.catalog.domains.filter((domain) => domain.direct_procedure_ids.length > 0).length);
  assert.ok(loaded.catalog.domains.some((domain) => domain.available && domain.resolved_procedure_ids.length >= domain.direct_procedure_ids.length));
  assert.ok(loaded.catalog.procedures.some((skill) => skill.family === "plugin" && skill.resolved_domain_ids.length > 1));
  assert.deepEqual(loaded.catalog.visible_entries.filter((item) => item.family !== "literature-adapter").map((item) => item.skill_id), ["researchspec-navigate"]);
  assert.equal(loaded.catalog.procedures.some((item) => item.skill_id === "researchspec-navigate"), false);
  for (const skill of [...loaded.catalog.visible_entries, ...loaded.catalog.procedures]) {
    assert.deepEqual(treeFilePaths(skill.file_tree).sort(), skill.files.map((file) => file.path).sort());
  }
  assert.ok(loaded.catalog.procedures.find((skill) => skill.family === "arsu")?.file_tree.some((node) => node.node_type === "directory"));
  assert.deepEqual(loaded.catalog.procedures.find((skill) => skill.family === "companion")?.files.map((file) => file.path), ["LICENSE", "SKILL.md"]);
  for (const domain of loaded.catalog.domains) {
    const direct = new Set(domain.direct_procedure_ids);
    const dependencyOnly = domain.resolved_procedure_ids.filter((skillId) => !direct.has(skillId));
    assert.ok(dependencyOnly.every((skillId) => !direct.has(skillId)));
    assert.deepEqual([...new Set([...domain.direct_procedure_ids, ...dependencyOnly])].sort(), [...domain.resolved_procedure_ids].sort());
  }

  const companion = COMPANION_INTENTS.find((item) => item.id !== "navigate");
  assert.ok(companion);
  const rendered = await readHarnessFile(loaded, companion.skillId, "SKILL.md");
  assert.equal(rendered?.bytes.toString("utf8"), renderCompanionSkill(companion));
  assert.equal(await readHarnessFile(loaded, companion.skillId, "references/../SKILL.md"), undefined);
  assert.equal(await readHarnessFile(loaded, companion.skillId, "missing.md"), undefined);
});

void test("Markdown rendering disables raw HTML and rewrites local resources", () => {
  const rendered = renderHarnessMarkdown("<script>alert(1)</script>\n\n[Guide](references/guide.md)\n\n![Plot](assets/plot.png)", "deep-research", "SKILL.md");
  assert.doesNotMatch(rendered, /<script>/);
  assert.match(rendered, /&lt;script&gt;/);
  assert.match(rendered, /#\/skills\/deep-research\/files\/references\/guide\.md/);
  assert.match(rendered, /\/api\/skills\/deep-research\/files\/assets\/plot\.png\?raw=1/);
});

void test("Skill tree enumeration rejects symbolic links", async () => {
  const root = await tempProject();
  try {
    await mkdir(path.join(root, "skill"), { recursive: true });
    await writeFile(path.join(root, "target.txt"), "outside Skill root", "utf8");
    await symlink(path.join(root, "target.txt"), path.join(root, "skill", "linked.txt"));
    await assert.rejects(validateHarnessSkillRoot(path.join(root, "skill")), /Symbolic links are not supported/);
  } finally {
    await cleanup(root);
  }
});

void test("HTTP harness is read-only and serves structured catalog and file previews", async () => {
  const server = createSkillHarnessServer({ repoRoot: REPO_ROOT });
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, HARNESS_DEFAULT_HOST, resolve);
  });
  try {
    const address = server.address() as AddressInfo;
    assert.equal(address.address, HARNESS_DEFAULT_HOST);
    const origin = `http://127.0.0.1:${String(address.port)}`;
    const catalogResponse = await fetch(`${origin}/api/catalog`);
    assert.equal(catalogResponse.status, 200);
    assert.match(catalogResponse.headers.get("content-security-policy") ?? "", /default-src 'self'/);
    const catalog = await catalogResponse.json() as { visible_entries: Array<{ skill_id: string }>; procedures: Array<{ skill_id: string }> };
    assert.ok(catalog.visible_entries.some((skill) => skill.skill_id === "researchspec-navigate"));
    assert.ok(catalog.procedures.some((procedure) => procedure.skill_id === "deep-research"));

    const detailResponse = await fetch(`${origin}/api/skills/researchspec-navigate`);
    assert.equal(detailResponse.status, 200);
    const detail = await detailResponse.json() as { files: Array<{ path: string }> };
    assert.ok(detail.files.some((file) => file.path === "SKILL.md"));

    const fileResponse = await fetch(`${origin}/api/skills/researchspec-navigate/files/SKILL.md`);
    assert.equal(fileResponse.status, 200);
    const file = await fileResponse.json() as { source: string; rendered_html: string };
    assert.match(file.source, /name: researchspec-navigate/);
    assert.match(file.rendered_html, /ResearchSpec Navigate/);

    const arsuDetailResponse = await fetch(`${origin}/api/skills/deep-research`);
    assert.equal(arsuDetailResponse.status, 200);
    const arsuDetail = await arsuDetailResponse.json() as { files: Array<{ path: string; kind: string }>; file_tree: HarnessFileTreeNode[] };
    assert.ok(arsuDetail.file_tree.some((node) => node.node_type === "directory"));
    const nonEntryMarkdown = arsuDetail.files.find((candidate) => candidate.kind === "markdown" && candidate.path.includes("/") && candidate.path !== "SKILL.md");
    assert.ok(nonEntryMarkdown);
    const nestedResponse = await fetch(`${origin}/api/skills/deep-research/files/${encodePath(nonEntryMarkdown.path)}`);
    assert.equal(nestedResponse.status, 200);
    const nestedFile = await nestedResponse.json() as { source: string; rendered_html: string };
    assert.ok(nestedFile.source.length > 0);
    assert.ok(nestedFile.rendered_html.length > 0);

    const missing = await fetch(`${origin}/api/skills/researchspec-navigate/files/missing.md`);
    assert.equal(missing.status, 404);
    const mutation = await fetch(`${origin}/api/catalog`, { method: "POST" });
    assert.equal(mutation.status, 405);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});

function treeFilePaths(nodes: readonly HarnessFileTreeNode[]): string[] {
  return nodes.flatMap((node) => node.node_type === "file" ? [node.path] : treeFilePaths(node.children));
}

function encodePath(value: string): string {
  return value.split("/").map(encodeURIComponent).join("/");
}
