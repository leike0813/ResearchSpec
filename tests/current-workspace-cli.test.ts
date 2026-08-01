import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { strFromU8, unzipSync } from "fflate";

import { sha256 } from "../src/core/workspace/write-plan.js";

import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

void test("fresh init creates only the current workspace authority tree", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    assert.deepEqual((await readdir(workspace)).sort(), ["changes", "config.yaml", "profiles", "specs", "subflows", "tool-installation-manifest.json"]);
    for (const relativePath of ["runs", "playbooks", "draft-patches", "artifact-registry.json"]) assert.equal(existsSync(path.join(workspace, relativePath)), false);
    const config = await readFile(path.join(workspace, "config.yaml"), "utf8");
    assert.match(config, /^schema_version: "1"$/m);
    assert.doesNotMatch(config, /^profile:/m);
    const manifest = JSON.parse(await readFile(path.join(workspace, "tool-installation-manifest.json"), "utf8")) as { installations: Array<{ owner: string; source: { kind: string } }> };
    assert.equal(manifest.installations.filter((item) => item.owner === "framework" && item.source.kind === "framework-profile").length, 1);
    assert.equal(parseEnvelope(runCli(["status", "--json"], root)).ok, true);
    assert.equal(parseEnvelope(runCli(["check", "profiles", "--json"], root)).ok, true);
    assert.equal(parseEnvelope(runCli(["doctor", "--json"], root)).ok, true);
    assert.deepEqual(parseEnvelope<{ domains: unknown[] }>(runCli(["plugin", "list", "--installed", "--json"], root)).data?.domains, []);
    assert.equal(parseEnvelope(runCli(["init", root, "--tools", "none", "--json"])).error?.code, "workspace_exists");
  } finally {
    await cleanup(root);
  }
});

void test("unsupported workspace is rejected without mutation", async () => {
  const root = await tempProject();
  const workspace = path.join(root, "researchspec");
  try {
    await mkdir(path.join(workspace, "runs/current"), { recursive: true });
    const configPath = path.join(workspace, "config.yaml");
    const statePath = path.join(workspace, "runs/current/state.yaml");
    await writeFile(configPath, "schema_version: \"0.1\"\nprofile: adaptive\n", "utf8");
    await writeFile(statePath, "semantic: user-data\n", "utf8");
    for (const command of [["status", "--json"], ["check", "--json"], ["doctor", "--json"], ["update", "--tools", "none", "--json"]]) {
      const result = runCli(command, root);
      assert.equal(result.status, 1, command.join(" "));
      assert.equal(parseEnvelope(result).error?.code, "workspace_unsupported");
    }
    assert.equal(await readFile(configPath, "utf8"), "schema_version: \"0.1\"\nprofile: adaptive\n");
    assert.equal(await readFile(statePath, "utf8"), "semantic: user-data\n");
  } finally {
    await cleanup(root);
  }
});

void test("profile drift is reported, preserved, and force-refreshable", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const profile = path.join(root, "researchspec/profiles/academic-pipeline.yaml");
    await writeFile(profile, "schema_version: \"1\"\nprofile_id: drifted\n", "utf8");
    assert.equal(parseEnvelope(runCli(["check", "profiles", "--json"], root)).ok, false);
    assert.equal(runCli(["update", "--tools", "none"], root).status, 0);
    assert.equal(await readFile(profile, "utf8"), "schema_version: \"1\"\nprofile_id: drifted\n");
    assert.equal(runCli(["update", "--tools", "none", "--force"], root).status, 0);
    assert.match(await readFile(profile, "utf8"), /^profile_id: academic-pipeline$/m);
  } finally {
    await cleanup(root);
  }
});

void test("an unowned existing profile blocks update without claiming ownership", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const manifestPath = path.join(root, "researchspec/tool-installation-manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as { installations: Array<{ owner: string }> };
    manifest.installations = manifest.installations.filter((item) => item.owner !== "framework");
    const changed = `${JSON.stringify(manifest, null, 2)}\n`;
    await writeFile(manifestPath, changed, "utf8");
    const update = runCli(["update", "--tools", "none", "--json"], root);
    assert.equal(update.status, 1);
    assert.equal(parseEnvelope(update).error?.code, "static_projection_conflict");
    assert.equal(await readFile(manifestPath, "utf8"), changed);
  } finally {
    await cleanup(root);
  }
});

void test("fresh CLI processes read instructions, start idempotently, decide a Gate and advance the owning control", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    const before = await readFile(path.join(workspace, "config.yaml"), "utf8");
    const instructions = runCli(["instructions", "route:deep-research:full", "--json"], root);
    assert.equal(instructions.status, 0);
    assert.equal(parseEnvelope<{ confirmation_required: boolean }>(instructions).data?.confirmation_required, true);
    assert.equal(await readFile(path.join(workspace, "config.yaml"), "utf8"), before);

    const evidence = path.join(root, "outputs/research-report.md");
    await mkdir(path.dirname(evidence), { recursive: true });
    await writeFile(evidence, "report\n", "utf8");
    const startInput = path.join(root, "start.json");
    await writeFile(startInput, JSON.stringify({
      schema_version: "1",
      confirmed_at: "2026-08-02T15:00:00+08:00",
      prerequisites: [],
      handoff_inputs: [],
      planned_outputs: [{ role: "research-report", type: "report", path: "outputs/research-report.md", purpose: "Gate evidence" }],
      formal_gates: ["evidence-quality"],
      cost: { effort: "high", interaction: "long_horizon" },
    }), "utf8");
    const started = parseEnvelope<{ instance_id: string }>(runCli(["start", "deep-research:full", "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
    assert.equal(started.ok, true);
    const instanceId = started.data?.instance_id;
    assert.ok(instanceId);
    assert.equal(parseEnvelope<{ status: string }>(runCli(["start", "deep-research:full", "--input", startInput, "--confirmed-by", "researcher", "--json"], root)).data?.status, "already_started");
    assert.equal((await readdir(path.join(workspace, "subflows"))).length, 1);

    const decided = runCli(["decide", `gate:${instanceId}/evidence-quality`, "--verdict", "pass", "--reason", "Evidence reviewed.", "--evidence-role", "research-report", "--actor-name", "researcher", "--json"], root);
    assert.equal(decided.status, 0, decided.stderr);
    assert.equal(runCli(["decide", `decision:${instanceId}/scope-choice`, "--kind", "scope", "--choice", "bounded", "--reason", "Keep the stated scope.", "--actor-name", "researcher", "--json"], root).status, 0);
    for (const type of ["subflows", "changes", "gates", "decisions", "handoffs", "profiles", "tools", "diagnostics", "history"]) {
      assert.equal(runCli(["list", type, "--json"], root).status, 0, type);
    }
    for (const selector of [`gate:${instanceId}/evidence-quality`, `decision:${instanceId}/scope-choice`, `handoff:${instanceId}`, "spec:sources"]) {
      assert.equal(runCli(["show", selector, "--json"], root).status, 0, selector);
    }
    const advanced = runCli(["advance", `subflow:${instanceId}`, "--transition", "complete", "--actor-name", "academic-pipeline", "--json"], root);
    assert.equal(advanced.status, 0, advanced.stderr);
    const status = parseEnvelope<{ active_instances: Array<{ instance_id: string }>; subflows: Record<string, number>; frontier: unknown[] }>(runCli(["status", "--json"], root));
    assert.equal(status.data?.subflows.complete, 1);
    assert.equal(status.data?.active_instances.some((item) => item.instance_id === instanceId), false);
  } finally { await cleanup(root); }
});

void test("current start dry-run and unsafe boundary failures are zero-write", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    const input = path.join(root, "unsafe-start.json");
    const base = {
      schema_version: "1",
      confirmed_at: "2026-08-02T16:00:00+08:00",
      prerequisites: [], handoff_inputs: [], formal_gates: [],
      cost: { effort: "low", interaction: "single_pass" },
    };
    await writeFile(input, JSON.stringify({ ...base, planned_outputs: [{ role: "brief", type: "report", path: "outputs/future.md", purpose: "result" }] }), "utf8");
    assert.equal(runCli(["start", "deep-research:quick", "--input", input, "--confirmed-by", "researcher", "--dry-run", "--json"], root).status, 0);
    assert.equal((await readdir(path.join(workspace, "subflows"))).length, 0);

    await writeFile(input, JSON.stringify({ ...base, planned_outputs: [{ role: "brief", type: "report", path: "researchspec/leak.md", purpose: "invalid" }] }), "utf8");
    const rejected = runCli(["start", "deep-research:quick", "--input", input, "--confirmed-by", "researcher", "--json"], root);
    assert.equal(rejected.status, 2);
    assert.equal(parseEnvelope(rejected).error?.code, "boundary_path_managed");
    assert.equal((await readdir(path.join(workspace, "subflows"))).length, 0);
  } finally { await cleanup(root); }
});

void test("current handoff update, query, and checks use only the owning files", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    const startInput = path.join(root, "start.json");
    await writeFile(startInput, JSON.stringify({
      schema_version: "1", confirmed_at: "2026-08-02T17:00:00+08:00", prerequisites: [], handoff_inputs: [],
      planned_outputs: [{ role: "brief", type: "report", path: "outputs/future.md", purpose: "downstream use" }],
      formal_gates: [], cost: { effort: "low", interaction: "single_pass" },
    }), "utf8");
    const started = parseEnvelope<{ instance_id: string }>(runCli(["start", "deep-research:quick", "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
    const instanceId = started.data?.instance_id;
    assert.ok(instanceId);
    const [directoryName] = await readdir(path.join(workspace, "subflows"));
    assert.ok(directoryName);
    const directory = path.join(workspace, "subflows", directoryName);
    const controlPath = path.join(directory, "control.yaml");
    const handoffPath = path.join(directory, "handoff.md");
    const controlBefore = await readFile(controlPath, "utf8");
    const handoffInput = path.join(root, "handoff.json");
    await writeFile(handoffInput, JSON.stringify({
      inputs: [{ role: "upstream-report", type: "report", path: "outputs/not-created.md", purpose: "future consumption" }],
      outputs: [{ role: "brief", type: "report", path: "outputs/future.md", purpose: "downstream use" }],
      body: "# Notes\n\nReady for review.\n",
    }), "utf8");
    assert.equal(runCli(["handoff", `subflow:${instanceId}`, "--input", handoffInput, "--json"], root).status, 0);
    assert.equal(await readFile(controlPath, "utf8"), controlBefore);
    assert.match(await readFile(handoffPath, "utf8"), /upstream-report/);
    assert.equal(runCli(["check", "handoffs", "--json"], root).status, 0);
    const afterUpdate = await readFile(handoffPath, "utf8");
    for (const command of [
      ["status", "--json"], ["list", "subflows", "--json"], ["list", "history", "--json"],
      ["show", `subflow:${instanceId}`, "--json"], ["show", "spec:project", "--json"],
      ["show", "profile:academic-pipeline", "--json"], ["handoff", `subflow:${instanceId}`, "--json"],
    ]) assert.equal(runCli(command, root).status, 0, command.join(" "));
    assert.equal(await readFile(controlPath, "utf8"), controlBefore);
    assert.equal(await readFile(handoffPath, "utf8"), afterUpdate);
  } finally { await cleanup(root); }
});

void test("current project change decisions stay separate from spec edits and resolved changes archive", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    const claimsPath = path.join(workspace, "specs/claims.yaml");
    const claimsBefore = await readFile(claimsPath, "utf8");
    assert.equal(runCli(["propose", "accepted-change", "--targets", "claims.yaml", "--with", "design,delta", "--json"], root).status, 0);
    assert.deepEqual((await readdir(path.join(workspace, "changes/accepted-change"))).sort(), ["change.md", "delta.yaml", "design.md"]);
    assert.equal(runCli(["decide", "change:accepted-change", "--decision", "accept", "--actor-name", "Researcher", "--reason", "Reviewed.", "--json"], root).status, 0);
    assert.equal(await readFile(claimsPath, "utf8"), claimsBefore);
    const blocked = runCli(["archive", "accepted-change", "--json"], root);
    assert.equal(blocked.status, 3);
    assert.equal(parseEnvelope(blocked).error?.code, "change_not_archivable");

    assert.equal(runCli(["propose", "rejected-change", "--targets", "project.md", "--json"], root).status, 0);
    assert.equal(runCli(["decide", "change:rejected-change", "--decision", "reject", "--actor-name", "Researcher", "--reason", "Out of scope.", "--json"], root).status, 0);
    assert.equal(runCli(["archive", "rejected-change", "--json"], root).status, 0);
    assert.equal(existsSync(path.join(workspace, "changes/archive/rejected-change/change.md")), true);
    assert.equal(runCli(["show", "change:rejected-change", "--json"], root).status, 0);
  } finally { await cleanup(root); }
});

void test("handoff command can recover a missing handoff without changing control", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    const startInput = path.join(root, "start.json");
    await writeFile(startInput, JSON.stringify({
      schema_version: "1", confirmed_at: "2026-08-02T17:30:00+08:00", prerequisites: [], handoff_inputs: [], planned_outputs: [],
      formal_gates: [], cost: { effort: "low", interaction: "single_pass" },
    }), "utf8");
    const started = parseEnvelope<{ instance_id: string }>(runCli(["start", "deep-research:quick", "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
    const instanceId = started.data?.instance_id;
    assert.ok(instanceId);
    const [directoryName] = await readdir(path.join(workspace, "subflows"));
    assert.ok(directoryName);
    const directory = path.join(workspace, "subflows", directoryName);
    const controlPath = path.join(directory, "control.yaml");
    const handoffPath = path.join(directory, "handoff.md");
    const controlBefore = await readFile(controlPath, "utf8");
    await rm(handoffPath);
    const semantic = path.join(root, "handoff.json");
    await writeFile(semantic, JSON.stringify({ inputs: [], outputs: [] }), "utf8");
    assert.equal(runCli(["handoff", `subflow:${instanceId}`, "--input", semantic, "--json"], root).status, 0);
    assert.equal(existsSync(handoffPath), true);
    assert.equal(await readFile(controlPath, "utf8"), controlBefore);
  } finally { await cleanup(root); }
});

void test("current packs are deterministic, scoped, and exclude private or external bytes", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    const startInput = path.join(root, "start.json");
    await mkdir(path.join(root, "outputs"), { recursive: true });
    await writeFile(path.join(root, "outputs/report.md"), "external secret bytes\n", "utf8");
    await writeFile(startInput, JSON.stringify({
      schema_version: "1", confirmed_at: "2026-08-02T18:00:00+08:00", prerequisites: [], handoff_inputs: [],
      planned_outputs: [{ role: "report", type: "report", path: "outputs/report.md", purpose: "handoff" }],
      formal_gates: [], cost: { effort: "low", interaction: "single_pass" },
    }), "utf8");
    const started = parseEnvelope<{ instance_id: string }>(runCli(["start", "deep-research:quick", "--input", startInput, "--confirmed-by", "researcher", "--json"], root));
    const instanceId = started.data?.instance_id;
    assert.ok(instanceId);
    assert.equal(runCli(["propose", "pack-change", "--targets", "project.md", "--json"], root).status, 0);
    const [directoryName] = await readdir(path.join(workspace, "subflows"));
    assert.ok(directoryName);
    const directory = path.join(workspace, "subflows", directoryName);
    await writeFile(path.join(directory, "work/private.md"), "private bytes\n", "utf8");
    const first = path.join(root, "first.zip");
    const second = path.join(root, "second.zip");
    assert.equal(runCli(["pack", "--output", first, "--json"], root).status, 0);
    assert.equal(runCli(["pack", "--output", second, "--scope", "all", "--json"], root).status, 0);
    assert.deepEqual(await readFile(first), await readFile(second));
    const archive = unzipSync(await readFile(first));
    const entries = Object.keys(archive).sort();
    assert.ok(entries.includes("manifest.json"));
    assert.ok(entries.some((entry) => entry.endsWith("/control.yaml")));
    assert.ok(entries.some((entry) => entry.endsWith("/handoff.md")));
    assert.equal(entries.some((entry) => entry.includes("/work/")), false);
    assert.equal(entries.some((entry) => entry.startsWith("outputs/")), false);
    assert.equal(entries.some((entry) => /registry|ledger|receipt|runs\//.test(entry)), false);
    const manifestBytes = archive["manifest.json"];
    assert.ok(manifestBytes);
    const manifest = JSON.parse(strFromU8(manifestBytes)) as { entries: Array<{ path: string; sha256: string }> };
    for (const entry of manifest.entries) {
      const entryBytes = archive[entry.path];
      assert.ok(entryBytes);
      assert.equal(sha256(entryBytes), entry.sha256);
    }
    const scoped = path.join(root, "subflow.zip");
    assert.equal(runCli(["pack", "--output", scoped, "--scope", `subflow:${instanceId}`, "--json"], root).status, 0);
    assert.deepEqual(Object.keys(unzipSync(await readFile(scoped))).sort().filter((entry) => entry !== "manifest.json").map((entry) => path.basename(entry)).sort(), ["control.yaml", "handoff.md"]);
    for (const scope of ["specs", "profile", "subflows", "changes", "change:pack-change"]) {
      const scopedOutput = path.join(root, `${scope.replace(/[:]/g, "-")}.zip`);
      assert.equal(runCli(["pack", "--output", scopedOutput, "--scope", scope, "--json"], root).status, 0, scope);
    }
    assert.equal(runCli(["pack", "--output", first, "--json"], root).status, 3);
  } finally { await cleanup(root); }
});
