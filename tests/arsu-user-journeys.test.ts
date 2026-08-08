import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { unzipSync } from "fflate";

import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";
import {
  advanceSubflow,
  cliJson,
  decideGate,
  drivePipeline,
  initialize,
  instructions,
  overrideGate,
  retryStart,
  showSubflow,
  startRoute,
  status,
  type ControlFrontierItem,
  type RouteFrontierItem,
  type RouteInstructions,
} from "./helpers/arsu-journey.js";

const PUBLIC_COMMANDS = [
  "init", "update", "status", "instructions", "start", "advance", "check", "doctor", "list",
  "show", "handoff", "pack", "propose", "decide", "archive", "plugin",
];
const INSTALLED_SKILLS = [
  "deep-research", "academic-paper", "academic-paper-reviewer", "academic-pipeline",
  "researchspec-navigate", "researchspec-propose", "researchspec-decide", "researchspec-verify", "researchspec-cli-handbook",
  "zotero-library-agent", "zotero-library-query", "zotero-literature-acquisition",
  "zotero-literature-analysis", "zotero-research-synthesis", "zotero-library-curation",
  "zotero-bridge-cli",
];

void test("[journey.bootstrap] packaged surface initializes current authority without starting academic work", async () => {
  const root = await tempProject();
  try {
    const initialized = runCli(["init", root, "--tools", "forgecode", "--literature-adapters", "zotero-library", "--json"]);
    assert.equal(initialized.status, 0, initialized.stderr || initialized.stdout);
    const workspace = path.join(root, "researchspec");
    assert.deepEqual((await readdir(workspace)).sort(), [
      "changes", "config.yaml", "profiles", "specs", "subflows", "tool-installation-manifest.json",
    ]);
    assert.equal(existsSync(path.join(workspace, "runs")), false);
    assert.equal(existsSync(path.join(workspace, "artifact-registry.json")), false);
    const current = parseEnvelope<{ subflows: { total: number; by_status: Record<string, number>; active_instances: { items: unknown[] } } }>(
      runCli(["status", "--json"], root),
    ).data;
    assert.deepEqual(current?.subflows.active_instances.items, []);
    assert.equal(current?.subflows.total, 0);
    assert.deepEqual(current?.subflows.by_status, {});
    for (const skill of INSTALLED_SKILLS) {
      assert.equal(existsSync(path.join(root, ".forge/skills", skill, "SKILL.md")), true, skill);
    }
    assert.deepEqual(helpCommandNames(runCli(["--help"], root).stdout), PUBLIC_COMMANDS);
  } finally { await cleanup(root); }
});

void test("[journey.routing] route summaries, Zotero readiness and consent boundaries remain read-only", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root, "forgecode", "zotero-library");
    const configPath = path.join(context.workspace, "config.yaml");
    const before = hash(await readFile(configPath));
    const standalone = instructions(context, "route:deep-research:quick") as RouteInstructions;
    const pipeline = instructions(context, "route:academic-pipeline:end-to-end") as RouteInstructions;
    const midEntry = instructions(context, "route:academic-pipeline:mid-entry") as RouteInstructions;
    assert.equal(standalone.confirmation_required, true);
    assert.deepEqual(standalone.boundary_outputs.map((item) => item.role), ["research_brief", "bibliography"]);
    assert.equal(pipeline.start_input.profile_entry, "end-to-end");
    assert.equal(pipeline.formal_gates.length, 0);
    assert.deepEqual(midEntry.entry_points.map((item) => item.entry_point), [
      "research", "write", "review", "revision", "re-review", "format", "final-integrity",
    ]);
    assert.equal(midEntry.start_input.entry_point, "<entry-point>");
    assert.equal(midEntry.entry_points.every((item) => item.route_ref && item.stable_prerequisites && item.formal_gates && item.risk_level && item.cost), true);
    assert.equal(hash(await readFile(configPath)), before);

    const current = status(context);
    assert.deepEqual(current.literature_adapters.items.map((adapter) => ({
      adapter_id: adapter.adapter_id,
      connection_state: adapter.connection_state,
    })), [{ adapter_id: "zotero-library", connection_state: "unchecked" }]);
    assert.equal(current.subflows.active_instances.total, 0);
    assert.equal(existsSync(path.join(root, ".forge/skills/zotero-library-agent/SKILL.md")), true);
    assert.equal(existsSync(path.join(root, ".forge/skills/zotero-library-query/SKILL.md")), true);
  } finally { await cleanup(root); }
});

void test("[journey.standalone] confirmed standalone work writes external outputs and advances one owning control", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    const started = await startRoute(context, "deep-research:quick");
    assert.equal(retryStart(context, started).status, "already_started");
    assert.equal((await readdir(path.join(context.workspace, "subflows"))).length, 1);
    const control = showSubflow(context, started.instanceId);
    assert.equal(control.status, "active");
    assert.equal(control.parent, null);
    assert.deepEqual(control.start_confirmation.expected_outputs, ["research_brief", "bibliography"]);
    for (const output of started.outputs) assert.equal(existsSync(path.join(root, output.path)), true, output.path);

    const completion = status(context).frontier.items.find((item): item is ControlFrontierItem =>
      item.kind === "advance" && item.instance_id === started.instanceId);
    assert.ok(completion);
    advanceSubflow(context, completion);
    assert.equal(showSubflow(context, started.instanceId).status, "complete");
    assert.equal(cliJson<{ ok: boolean }>(["check", "all"], root).data?.ok, true);
  } finally { await cleanup(root); }
});

void test("[journey.pipeline-confirmation] a parent exposes but does not pre-create its independently confirmed child", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    const parent = await startRoute(context, "academic-pipeline:end-to-end");
    assert.deepEqual(showSubflow(context, parent.instanceId).children, []);
    assert.equal((await readdir(path.join(context.workspace, "subflows"))).length, 1);
    const childCandidate = status(context).frontier.items.find((item): item is RouteFrontierItem =>
      item.kind === "route" && item.parent_instance_id === parent.instanceId);
    assert.ok(childCandidate);
    const summary = instructions(context, childCandidate.selector) as RouteInstructions;
    assert.equal(summary.confirmation_required, true);
    const child = await startRoute(context, childCandidate.route_ref, childCandidate);
    const childControl = showSubflow(context, child.instanceId);
    assert.deepEqual(childControl.parent, { instance_id: parent.instanceId, node_id: childCandidate.node_id });
    assert.equal(childControl.start_confirmation.confirmed_by, "Acceptance Researcher");
    assert.deepEqual(showSubflow(context, parent.instanceId).children, [child.instanceId]);
  } finally { await cleanup(root); }
});

void test("[journey.pipeline-mid-entry] existing research materials enter at writing without an empty frontier", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    const parent = await startRoute(context, "academic-pipeline:mid-entry", undefined, "write");
    const parentControl = showSubflow(context, parent.instanceId);
    assert.equal(parentControl.checkpoint, "write");
    assert.equal(parentControl.start_confirmation.entry_point, "write");
    assert.deepEqual(parentControl.children, []);
    const candidates = status(context).frontier.items.filter((item): item is RouteFrontierItem =>
      item.kind === "route" && item.parent_instance_id === parent.instanceId);
    assert.deepEqual(candidates.map((item) => item.node_id), ["write"]);
    const child = await startRoute(context, candidates[0]?.route_ref ?? "academic-paper:full", candidates[0]);
    assert.deepEqual(showSubflow(context, child.instanceId).parent, { instance_id: parent.instanceId, node_id: "write" });
  } finally { await cleanup(root); }
});

void test("[journey.gate-override] failed Gate attempts append before one explicit owning-control override", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    const started = await startRoute(context, "academic-paper-reviewer:methodology-focus");
    const gate = status(context).frontier.items.find((item): item is ControlFrontierItem =>
      item.kind === "gate" && item.instance_id === started.instanceId);
    assert.ok(gate);
    decideGate(context, gate.selector, "fail");
    decideGate(context, gate.selector, "fail");
    overrideGate(context, gate.selector);
    const current = showSubflow(context, started.instanceId);
    assert.equal(current.gates[0]?.attempts.length, 2);
    assert.equal(current.gates[0]?.attempts.at(-1)?.verdict, "fail");
    assert.ok(current.gates[0]?.override?.decision_id);
    const completion = status(context).frontier.items.find((item): item is ControlFrontierItem =>
      item.kind === "advance" && item.instance_id === started.instanceId);
    assert.ok(completion);
    advanceSubflow(context, completion);
    assert.equal(showSubflow(context, started.instanceId).status, "complete");
  } finally { await cleanup(root); }
});

void test("[journey.change] acceptance leaves stable specs untouched and terminal decisions can archive", async () => {
  const root = await tempProject();
  try {
    initialize(root, "none");
    const claimsPath = path.join(root, "researchspec/specs/claims.yaml");
    const claimsBefore = await readFile(claimsPath, "utf8");
    cliJson(["propose", "accepted-scope", "--targets", "claims.yaml", "--with", "design,delta"], root);
    const accepted = cliJson<{ stable_specs_modified: boolean }>([
      "decide", "change:accepted-scope", "--decision", "accept", "--actor-name", "Acceptance Researcher",
      "--reason", "The proposed claim scope is reviewable.",
    ], root).data;
    assert.equal(accepted?.stable_specs_modified, false);
    assert.equal(await readFile(claimsPath, "utf8"), claimsBefore);
    const blocked = runCli(["archive", "accepted-scope", "--json"], root);
    assert.equal(parseEnvelope(blocked).error?.code, "change_not_archivable");

    cliJson(["propose", "rejected-scope", "--targets", "project.md"], root);
    cliJson([
      "decide", "change:rejected-scope", "--decision", "reject", "--actor-name", "Acceptance Researcher",
      "--reason", "The proposed scope exceeds the agreed research question.",
    ], root);
    cliJson(["archive", "rejected-scope"], root);
    assert.equal(existsSync(path.join(root, "researchspec/changes/archive/rejected-scope/change.md")), true);
  } finally { await cleanup(root); }
});

void test("[journey.plugin-zotero] plugin failure or installation never changes the ARSU frontier or provider authority", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root, "forgecode", "zotero-library");
    const started = await startRoute(context, "deep-research:quick");
    const before = status(context);
    const failed = runCli([
      "plugin", "install", "not-a-reviewed-domain", "--yes", "--summary", "--json",
    ], root);
    assert.notEqual(failed.status, 0);
    assert.deepEqual(status(context).frontier, before.frontier);

    const preview = cliJson<{ plan: { operation_count: number; writable_count: number } }>([
      "plugin", "install", "quantum-physics", "--dry-run", "--summary",
    ], root).data;
    assert.ok((preview?.plan.operation_count ?? 0) > 0);
    assert.ok((preview?.plan.writable_count ?? 0) > 0);
    cliJson([
      "plugin", "install", "quantum-physics", "--yes", "--summary",
    ], root);
    const after = status(context);
    assert.deepEqual(after.frontier, before.frontier);
    assert.equal(after.literature_adapters.items[0]?.state, "installed");
    assert.equal(after.literature_adapters.items[0]?.connection_state, "unchecked");
    assert.equal(existsSync(path.join(root, ".forge/skills/zotero-library-agent/SKILL.md")), true);
    assert.equal(showSubflow(context, started.instanceId).route_ref, "deep-research:quick");
  } finally { await cleanup(root); }
});

void test("[journey.revision-rounds] the public frontier completes two independently confirmed revision rounds", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    const parent = await startRoute(context, "academic-pipeline:end-to-end");
    const complete = await drivePipeline(context, parent.instanceId, { revisionRounds: 2 });
    assert.equal(showSubflow(context, parent.instanceId).status, "complete");
    assert.equal(complete.subflows.active_instances.items.some((item) => item.selector === `subflow:${parent.instanceId}`), false);
    const revisions = context.starts.filter((item) => item.routeRef === "academic-paper:revision");
    assert.deepEqual(revisions.map((item) => item.candidate?.round), [1, 2]);
    assert.equal(new Set(revisions.map((item) => item.instanceId)).size, 2);
    assert.equal(existsSync(path.join(context.workspace, "runs")), false);
    assert.equal(existsSync(path.join(context.workspace, "draft-patches")), false);
    assert.equal(existsSync(path.join(context.workspace, "artifact-registry.json")), false);
  } finally { await cleanup(root); }
});

void test("[journey.resume-pack-failure] fresh reads resume exactly, packs stay bounded, and invalid workspaces are zero-write", async () => {
  const root = await tempProject();
  const unsupportedRoot = await tempProject();
  try {
    const context = initialize(root, "none");
    const started = await startRoute(context, "deep-research:quick");
    const before = status(context);
    assert.deepEqual(status(context).frontier, before.frontier);
    assert.equal(showSubflow(context, started.instanceId).status, "active");

    const packPath = path.join(root, "exports/context.zip");
    cliJson(["pack", "--output", packPath, "--scope", `subflow:${started.instanceId}`], root);
    const entries = Object.keys(unzipSync(await readFile(packPath)));
    assert.ok(entries.some((entry) => entry.endsWith("/control.yaml")));
    assert.ok(entries.some((entry) => entry.endsWith("/handoff.md")));
    assert.equal(entries.some((entry) => entry.includes("/work/")), false);
    for (const output of started.outputs) assert.equal(entries.includes(output.path), false);

    const unsafeInput = path.join(root, "unsafe-start.json");
    await writeFile(unsafeInput, JSON.stringify({
      schema_version: "1",
      confirmed_at: "2026-08-02T18:00:00+08:00",
      prerequisites: [], handoff_inputs: [], formal_gates: [],
      planned_outputs: [{ role: "brief", type: "report", path: "researchspec/leak.md", purpose: "invalid" }],
      cost: { effort: "low", interaction: "single_pass" },
    }), "utf8");
    const countBefore = (await readdir(path.join(context.workspace, "subflows"))).length;
    const unsafe = runCli([
      "start", "deep-research:quick", "--input", unsafeInput, "--confirmed-by", "Acceptance Researcher", "--json",
    ], root);
    assert.equal(parseEnvelope(unsafe).error?.code, "boundary_path_managed");
    assert.equal((await readdir(path.join(context.workspace, "subflows"))).length, countBefore);

    const unsupportedWorkspace = path.join(unsupportedRoot, "researchspec");
    await mkdir(path.join(unsupportedWorkspace, "runs/current"), { recursive: true });
    const config = "schema_version: \"0.2\"\nprofile: strict\n";
    const state = "semantic: preserve-me\n";
    await writeFile(path.join(unsupportedWorkspace, "config.yaml"), config, "utf8");
    await writeFile(path.join(unsupportedWorkspace, "runs/current/state.yaml"), state, "utf8");
    for (const args of [["status", "--json"], ["check", "all", "--json"], ["doctor", "--json"], ["update", "--tools", "none", "--json"]]) {
      const failure = runCli(args, unsupportedRoot);
      assert.equal(parseEnvelope(failure).error?.code, "workspace_unsupported", args.join(" "));
    }
    assert.equal(await readFile(path.join(unsupportedWorkspace, "config.yaml"), "utf8"), config);
    assert.equal(await readFile(path.join(unsupportedWorkspace, "runs/current/state.yaml"), "utf8"), state);
  } finally {
    await cleanup(root);
    await cleanup(unsupportedRoot);
  }
});

function hash(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function helpCommandNames(help: string): string[] {
  const commandSection = help.split(/Commands:\r?\n/)[1] ?? "";
  return [...commandSection.matchAll(/^ {2}([a-z][a-z-]*)(?:\s|$)/gm)]
    .map((item) => item[1])
    .filter((item): item is string => Boolean(item) && item !== "help");
}
