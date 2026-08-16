import assert from "node:assert/strict";
import { appendFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { stringify } from "yaml";

import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

function init(root: string): void {
  const result = runCli(["init", root, "--tools", "none", "--json"]);
  assert.equal(result.status, 0, result.stderr);
}

void test("graph list and show inspect profiles and changes", async () => {
  const root = await tempProject();
  try {
    init(root);
    const listed = parseEnvelope<{ items: Array<{ selector: string }> }>(runCli(["list", "profiles", "--json"], root));
    assert.equal(listed.ok, true);
    assert.ok(listed.data?.items.some((item) => item.selector === "profile:minimal"));

    const shown = parseEnvelope<{ kind: string; profile: { profile_id: string } }>(runCli(["show", "profile:minimal", "--json"], root));
    assert.equal(shown.ok, true);
    assert.equal(shown.data?.kind, "profile");
    assert.equal(shown.data?.profile.profile_id, "minimal");
  } finally {
    await cleanup(root);
  }
});

void test("graph propose, decide and archive manage schema 2 project changes", async () => {
  const root = await tempProject();
  try {
    init(root);
    const proposedRaw = runCli(["propose", "rejected-change", "--targets", "claims.yaml", "--with", "design,tasks", "--json"], root);
    const proposed = parseEnvelope(proposedRaw);
    assert.equal(proposed.ok, true, proposedRaw.stdout);
    const listedChanges = runCli(["list", "changes", "--json"], root);
    const listed = parseEnvelope<{ items: Array<{ id: string }> }>(listedChanges);
    assert.equal(listed.ok, true, listedChanges.stdout);
    assert.equal(listed.data?.items.some((item) => item.id === "rejected-change"), true, listedChanges.stdout);

    const decided = parseEnvelope(runCli(["decide", "change:rejected-change", "--decision", "reject", "--actor-name", "Researcher", "--reason", "Out of scope.", "--json"], root));
    assert.equal(decided.ok, true);
    const archived = parseEnvelope(runCli(["archive", "rejected-change", "--json"], root));
    assert.equal(archived.ok, true);
    assert.equal(parseEnvelope<{ items: Array<{ id: string; archived: boolean }> }>(runCli(["list", "changes", "--json"], root)).data?.items.some((item) => item.id === "rejected-change" && item.archived), true);
  } finally {
    await cleanup(root);
  }
});

void test("graph pack writes a deterministic context bundle", async () => {
  const root = await tempProject();
  try {
    init(root);
    const output = path.join(root, "pack.zip");
    const packed = parseEnvelope<{ bytes: number; sha256: string }>(runCli(["pack", "--output", output, "--scope", "all", "--json"], root));
    assert.equal(packed.ok, true);
    assert.ok((packed.data?.bytes ?? 0) > 0);
    assert.match(packed.data?.sha256 ?? "", /^[0-9a-f]{64}$/);
  } finally {
    await cleanup(root);
  }
});

void test("graph handoff renders a run handoff", async () => {
  const root = await tempProject();
  try {
    init(root);
    const startInput = path.join(root, "start.yaml");
    await writeFile(startInput, stringify({
      schema_version: "2",
      confirmed_at: "2026-08-15T12:00:00+08:00",
      entry_id: "main",
      entry_node_id: "rq",
      prerequisites: [],
      handoff_inputs: [],
      planned_outputs: [
        { role: "rq_brief", type: "markdown", path: "rq-brief.md", purpose: "research question brief" },
        { role: "research_report", type: "markdown", path: "report.md", purpose: "research report" },
      ],
      formal_gates: [],
      cost: { effort: "low", interaction: "low" },
    }), "utf8");
    const started = parseEnvelope<{ run_id: string }>(runCli(["start", "minimal", "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
    assert.equal(started.ok, true);
    const rendered = parseEnvelope<{ handoff: { run_id: string } }>(runCli(["handoff", `run:${started.data?.run_id ?? ""}`, "--json"], root));
    assert.equal(rendered.ok, true);
    assert.equal(rendered.data?.handoff.run_id, started.data?.run_id);
  } finally {
    await cleanup(root);
  }
});

void test("plugin list works outside and inside a schema 2 workspace", async () => {
  const root = await tempProject();
  try {
    const outside = parseEnvelope(runCli(["plugin", "list", "--summary", "--json"], root));
    assert.equal(outside.ok, true);
    init(root);
    const installed = parseEnvelope<{ selected_plugins: string[] }>(runCli(["plugin", "list", "--installed", "--json"], root));
    assert.equal(installed.ok, true);
    assert.deepEqual(installed.data?.selected_plugins ?? [], []);
    const checked = parseEnvelope<{ target: string }>(runCli(["check", "plugins", "--json"], root));
    assert.equal(checked.ok, true, JSON.stringify(checked.error));
    assert.equal(checked.data?.target, "plugins");
  } finally {
    await cleanup(root);
  }
});

void test("plugin uninstall blocks when a projected Skill has drifted", async () => {
  const root = await tempProject();
  try {
    const initialized = parseEnvelope(runCli(["init", root, "--tools", "codex", "--delivery", "skills", "--json"], root));
    assert.equal(initialized.ok, true, JSON.stringify(initialized.error));
    const installed = parseEnvelope(runCli(["plugin", "install", "ecology", "--yes", "--json"], root));
    assert.equal(installed.ok, true, JSON.stringify(installed.error));

    const projectedSkillPath = path.join(root, ".agents/skills/tooluniverse-ecology-biodiversity/SKILL.md");
    await appendFile(projectedSkillPath, "\n<!-- user drift -->\n", "utf8");

    const driftCheck = parseEnvelope<{ diagnostics: Array<{ code?: string }> }>(runCli(["check", "plugins", "--json"], root));
    assert.equal(driftCheck.ok, true, JSON.stringify(driftCheck.error));
    assert.equal(driftCheck.data?.diagnostics.some((item) => item.code === "plugin_projection_drift"), true);
    const strictDriftCheck = parseEnvelope<{ diagnostics: Array<{ code?: string }> }>(runCli(["check", "plugins", "--strict", "--json"], root));
    assert.equal(strictDriftCheck.ok, false);
    assert.equal(strictDriftCheck.data?.diagnostics.some((item) => item.code === "plugin_projection_drift"), true);

    const uninstalled = parseEnvelope(runCli(["plugin", "uninstall", "ecology", "--yes", "--json"], root));
    assert.equal(uninstalled.ok, false);
    assert.equal(uninstalled.error?.code, "plugin_projection_conflict");
    await readFile(projectedSkillPath, "utf8");

    const installedList = parseEnvelope<{ selected_plugins: string[] }>(runCli(["plugin", "list", "--installed", "--json"], root));
    assert.deepEqual(installedList.data?.selected_plugins ?? [], ["ecology"]);
  } finally {
    await cleanup(root);
  }
});

void test("plugin install, instructions, and uninstall reconcile graph workspace projections", async () => {
  const root = await tempProject();
  try {
    const initialized = parseEnvelope(runCli(["init", root, "--tools", "codex", "--delivery", "skills", "--json"], root));
    assert.equal(initialized.ok, true, JSON.stringify(initialized.error));

    const installed = parseEnvelope<{ selected_plugins: string[]; resolved_skill_ids: string[]; projected_tools: string[] }>(
      runCli(["plugin", "install", "ecology", "--yes", "--json"], root),
    );
    assert.equal(installed.ok, true, JSON.stringify(installed.error));
    assert.deepEqual(installed.data?.selected_plugins ?? [], ["ecology"]);
    assert.deepEqual(installed.data?.resolved_skill_ids ?? [], ["tooluniverse-ecology-biodiversity"]);
    assert.deepEqual(installed.data?.projected_tools ?? [], ["codex"]);

    const projectedSkillPath = path.join(root, ".agents/skills/tooluniverse-ecology-biodiversity/SKILL.md");
    await readFile(projectedSkillPath, "utf8");

    const status = parseEnvelope<{ plugins: { selected: string[]; resolved_skills: string[]; projected: string[] } }>(runCli(["status", "--json"], root));
    assert.equal(status.ok, true, JSON.stringify(status.error));
    assert.deepEqual(status.data?.plugins.selected ?? [], ["ecology"]);
    assert.deepEqual(status.data?.plugins.resolved_skills ?? [], ["tooluniverse-ecology-biodiversity"]);
    assert.deepEqual(status.data?.plugins.projected ?? [], ["ecology"]);

    const checked = parseEnvelope<{ target: string; diagnostics: unknown[] }>(runCli(["check", "plugins", "--json"], root));
    assert.equal(checked.ok, true, JSON.stringify(checked.error));
    assert.equal(checked.data?.target, "plugins");
    assert.deepEqual(checked.data?.diagnostics ?? [], []);

    const manifestPath = path.join(root, "researchspec/tool-installation-manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
      plugin_resolutions: Array<{ domain_id: string; resolved_skill_ids: string[] }>;
      installations: Array<{ source: { kind?: string; skill_id?: string } }>;
    };
    assert.equal(manifest.plugin_resolutions[0]?.domain_id, "ecology");
    assert.deepEqual(manifest.plugin_resolutions[0]?.resolved_skill_ids ?? [], ["tooluniverse-ecology-biodiversity"]);
    assert.equal(manifest.installations.some((item) => item.source.kind === "domain-skill" && item.source.skill_id === "tooluniverse-ecology-biodiversity"), true);

    const instructions = parseEnvelope<{ skill_id: string; entry_sha256: string; content: string; projected_tools: string[] }>(
      runCli(["plugin", "instructions", "tooluniverse-ecology-biodiversity", "--json"], root),
    );
    assert.equal(instructions.ok, true, JSON.stringify(instructions.error));
    assert.equal(instructions.data?.skill_id, "tooluniverse-ecology-biodiversity");
    assert.match(instructions.data?.entry_sha256 ?? "", /^[a-f0-9]{64}$/);
    assert.match(instructions.data?.content ?? "", /^---\nname: tooluniverse-ecology-biodiversity/);
    assert.deepEqual(instructions.data?.projected_tools ?? [], ["codex"]);

    const reconfigured = parseEnvelope(runCli(["update", "--tools", "none", "--json"], root));
    assert.equal(reconfigured.ok, true, JSON.stringify(reconfigured.error));
    await assert.rejects(readFile(projectedSkillPath, "utf8"), { code: "ENOENT" });
    const deferredInstructions = parseEnvelope(runCli(["plugin", "instructions", "tooluniverse-ecology-biodiversity", "--json"], root));
    assert.equal(deferredInstructions.ok, false);
    assert.equal(deferredInstructions.error?.code, "plugin_not_projected");

    const uninstalled = parseEnvelope<{ selected_plugins: string[] }>(runCli(["plugin", "uninstall", "ecology", "--yes", "--json"], root));
    assert.equal(uninstalled.ok, true, JSON.stringify(uninstalled.error));
    assert.deepEqual(uninstalled.data?.selected_plugins ?? [], []);
    await assert.rejects(readFile(projectedSkillPath, "utf8"), { code: "ENOENT" });

    const reconciledManifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
      plugin_resolutions: unknown[];
      installations: Array<{ source: { kind?: string } }>;
    };
    assert.deepEqual(reconciledManifest.plugin_resolutions, []);
    assert.equal(reconciledManifest.installations.some((item) => item.source.kind === "domain-skill"), false);
  } finally {
    await cleanup(root);
  }
});
