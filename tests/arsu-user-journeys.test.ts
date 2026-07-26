import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";
import {
  advanceTransition,
  applyRevisionPatch,
  cliJson,
  decideTransition,
  drive,
  initialize,
  instructions,
  overrideGate,
  startSubflow,
  status,
  submitGate,
  submitWork,
  type GatePacket,
  type SubflowPacket,
  type WorkflowControlView,
} from "./helpers/arsu-journey.js";

void test("[journey.bootstrap] init installs the fifteen-Skill surface without starting academic work", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    const current = status(context);
    assert.equal(current.run.status, "not_started");
    assert.equal(current.workflow_control.subflows.some((item) => item.kind === "instance"), false);
    for (const skill of ["deep-research", "academic-paper", "academic-paper-reviewer", "academic-pipeline", "researchspec-navigate", "researchspec-propose", "researchspec-decide", "researchspec-verify", "zotero-library-agent", "zotero-library-query", "zotero-literature-acquisition", "zotero-literature-analysis", "zotero-research-synthesis", "zotero-library-curation", "zotero-bridge-cli"]) {
      assert.equal(existsSync(path.join(root, ".forge/skills", skill, "SKILL.md")), true, skill);
    }
    const commandNames = [...runCli(["--help"], root).stdout.matchAll(/^ {2}([a-z]+)(?:\s|$)/gm)].map((item) => item[1]).filter((item) => item !== "help");
    assert.deepEqual(commandNames, ["init", "update", "status", "instructions", "start", "submit", "advance", "check", "doctor", "list", "show", "handoff", "pack", "propose", "decide", "archive", "plugin"]);
  } finally { await cleanup(root); }
});

void test("[journey.vague-routing] Navigate combines catalog route meaning with current CLI availability", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    const navigate = await readFile(path.join(root, ".forge/skills/researchspec-navigate/SKILL.md"), "utf8");
    for (const branch of ["Route", "Resume", "Explain", "Export"]) assert.match(navigate, new RegExp(`\\*\\*${branch}:\\*\\*`));
    assert.match(navigate, /academic-paper:lit-review/);
    assert.match(navigate, /deep-research:lit-review/);
    assert.match(navigate, /Near misses:/);
    assert.match(navigate, /plugin list --summary --json/);
    assert.match(navigate, /propose at most three domains in one batch/);
    assert.match(navigate, /continue the same canonical selector with the base ARSU producer/);
    const candidate = instructions(context, "subflow:tpl-academic-pipeline-end-to-end") as SubflowPacket;
    assert.equal(candidate.route.route_ref, "academic-pipeline:end-to-end");
    assert.ok(candidate.required_user_input_ids.includes("research_goal"));
    assert.ok(candidate.work_items.length > 0 || candidate.subflow_nodes.length > 0);
    assert.ok(candidate.gates.length > 0);
    assert.ok(candidate.transitions.length > 0);
    assert.equal(status(context).run.status, "not_started");
  } finally { await cleanup(root); }
});

void test("[journey.plugin-augmentation] confirmed plugin installation leaves the core frontier and producer unchanged", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    await startSubflow(context, "subflow:tpl-deep-research-quick");
    const before = status(context);
    const ready = before.workflow_control.ready_items[0];
    assert.ok(ready);
    const producerBefore = (instructions(context, ready) as { producer_skill: string }).producer_skill;

    const preview = cliJson<{ plan_sha256: string }>([
      "plugin", "install", "quantum-physics", "--dry-run", "--summary",
    ], root).data;
    assert.ok(preview?.plan_sha256);
    cliJson([
      "plugin", "install", "quantum-physics",
      "--expected-plan-sha256", preview.plan_sha256,
      "--yes", "--summary",
    ], root);

    const after = status(context);
    assert.deepEqual(after.workflow_control.frontier, before.workflow_control.frontier);
    assert.equal((instructions(context, ready) as { producer_skill: string }).producer_skill, producerBefore);
    const helper = cliJson<{
      skill_id: string;
      authority: { workflow_binding: string; producer_unchanged: boolean };
    }>(["plugin", "instructions", "scientific-agent-skills-qiskit"], root).data;
    assert.equal(helper?.skill_id, "scientific-agent-skills-qiskit");
    assert.equal(helper?.authority.workflow_binding, "none");
    assert.equal(helper?.authority.producer_unchanged, true);
  } finally { await cleanup(root); }
});

void test("[journey.plugin-fallback] failed augmentation leaves core work ready and does not add authority state", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    await startSubflow(context, "subflow:tpl-deep-research-quick");
    const before = status(context);
    const ready = before.workflow_control.ready_items[0];
    assert.ok(ready);
    const producerBefore = (instructions(context, ready) as { producer_skill: string }).producer_skill;

    const failed = runCli([
      "plugin", "install", "quantum-physics",
      "--expected-plan-sha256", "0".repeat(64),
      "--yes", "--summary", "--json",
    ], root);
    assert.equal(failed.status, 3);

    const installed = cliJson<{ domains: unknown[] }>(["plugin", "list", "--installed"], root).data;
    const afterFailure = status(context);
    assert.deepEqual(installed?.domains, []);
    assert.deepEqual(afterFailure.workflow_control.frontier, before.workflow_control.frontier);
    assert.deepEqual(afterFailure.pending_items, before.pending_items);
    assert.deepEqual(afterFailure.blocking_gates, before.blocking_gates);
    assert.equal((instructions(context, ready) as { producer_skill: string }).producer_skill, producerBefore);

    await submitWork(context, ready);
    assert.equal(status(context).workflow_control.ready_items.includes(ready), false);
  } finally { await cleanup(root); }
});

void test("[journey.expert-direct-route] an explicit route still requires one exact confirmed Start plan", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    const selector = "subflow:tpl-deep-research-quick";
    const packet = instructions(context, selector) as SubflowPacket;
    assert.equal(packet.route.route_ref, "deep-research:quick");
    assert.ok(packet.instruction_basis_sha256);
    const instance = await startSubflow(context, selector);
    assert.match(instance, /^subflow:sf-/);
    const active = status(context).workflow_control.subflows.find((item) => item.selector === instance);
    assert.equal(active?.state, "active");
  } finally { await cleanup(root); }
});

void test("[journey.standalone] standalone work submits candidates and advances from the public frontier", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    const instance = await startSubflow(context, "subflow:tpl-deep-research-quick");
    const complete = await drive(context, instance);
    assert.equal(complete.workflow_control.subflows.find((item) => item.selector === instance)?.state, "complete");
    assert.equal(complete.run.status, "in_progress");
    assert.ok(complete.workflow_control.startable_subflows.includes("subflow:tpl-deep-research-quick"));
    const nextInstance = await startSubflow(context, "subflow:tpl-deep-research-quick");
    assert.equal(status(context).workflow_control.subflows.find((item) => item.selector === nextInstance)?.state, "active");
    assert.equal(cliJson<{ ok: boolean }>(["check", "runtime"], root).data?.ok, true);
  } finally { await cleanup(root); }
});

void test("[journey.pipeline] pipeline dispatch starts parent-scoped children from CLI state", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    const parent = await startSubflow(context, "subflow:tpl-academic-pipeline-end-to-end");
    const child = status(context).workflow_control.subflows.find((item) => item.kind === "child" && item.state === "available");
    assert.ok(child);
    assert.match(child.selector, new RegExp(`^${escapeRegex(parent)}/`));
    const childInstance = await startSubflow(context, child.selector);
    const after = status(context);
    assert.equal(after.workflow_control.subflows.find((item) => item.selector === childInstance)?.parent_subflow_id, parent.slice("subflow:".length));
  } finally { await cleanup(root); }
});

void test("[journey.parallel-join] declared parallel capacity and all-join control downstream readiness", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    await startSubflow(context, "subflow:tpl-deep-research-full");
    let group: WorkflowControlView["parallel_groups"][number] | undefined;
    for (let step = 0; step < 20 && !group; step += 1) {
      const current = status(context);
      group = current.workflow_control.parallel_groups.find((item) => item.dispatchable_members.length > 1);
      if (!group) {
        const ready = current.workflow_control.ready_items[0];
        assert.ok(ready);
        await submitWork(context, ready);
      }
    }
    assert.ok(group);
    assert.equal(group.join_policy, "all");
    const initialMembers = [...group.dispatchable_members];
    await submitWork(context, initialMembers[0] ?? "");
    const pending = status(context).workflow_control.parallel_groups.find((item) => item.selector === group?.selector);
    assert.equal(pending?.state, "pending");
    for (const selector of initialMembers.slice(1)) if (status(context).workflow_control.ready_items.includes(selector)) await submitWork(context, selector);
    const satisfied = status(context).workflow_control.parallel_groups.find((item) => item.selector === group?.selector);
    assert.equal(satisfied?.state, "satisfied");
  } finally { await cleanup(root); }
});

void test("[journey.gate-challenge-override] challenge requires confirmed reverification before override", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    await startSubflow(context, "subflow:tpl-academic-paper-reviewer-methodology-focus");
    while (status(context).workflow_control.ready_items.length) await submitWork(context, status(context).workflow_control.ready_items[0] ?? "");
    const gate = status(context).workflow_control.gates.find((item) => item.state === "ready");
    assert.ok(gate);
    const initial = await submitGate(context, gate.selector, "fail", "initial");
    const challenged = instructions(context, gate.selector) as GatePacket;
    assert.equal(challenged.latest_attempt?.event_id, initial.event_id);
    const reverification = await submitGate(context, gate.selector, "fail", "reverification");
    assert.notEqual(reverification.event_id, initial.event_id);
    overrideGate(context, gate.selector);
    assert.equal(status(context).workflow_control.gates.find((item) => item.selector === gate.selector)?.state, "overridden");
  } finally { await cleanup(root); }
});

void test("[journey.revision-round] a revision branch exposes isolated round one and round two", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    const parent = await startSubflow(context, "subflow:tpl-academic-pipeline-end-to-end");
    let sawRoundOne = false;
    let sawRoundTwo = false;
    for (let step = 0; step < 300 && !sawRoundTwo; step += 1) {
      const current = status(context);
      sawRoundOne ||= current.workflow_control.subflows.some((item) => item.kind === "instance" && item.parent_subflow_id === parent.slice(8) && item.round_number === 1);
      sawRoundTwo ||= current.workflow_control.subflows.some((item) => item.parent_subflow_id === parent.slice(8) && item.round_number === 2);
      if (sawRoundTwo) break;
      const revision = current.workflow_control.subflows.find((item) =>
        item.kind === "instance"
        && item.state === "active"
        && item.template_id === "tpl-academic-paper-revision");
      if (revision && await applyRevisionPatch(context, revision.selector)) continue;
      const ready = current.workflow_control.ready_items[0];
      if (ready) { await submitWork(context, ready); continue; }
      const child = current.workflow_control.subflows.find((item) => item.kind === "child" && item.state === "available");
      if (child) { await startSubflow(context, child.selector); continue; }
      const gate = current.workflow_control.gates.find((item) => item.state === "ready");
      if (gate) { await submitGate(context, gate.selector, "pass"); continue; }
      const decisions = current.workflow_control.transitions.filter((item) => item.state === "decision_required");
      if (decisions.length) {
        const revision = decisions.find((item) => item.transition_node_id === "revise-review" || item.transition_node_id === "revise-round");
        decideTransition(context, (revision ?? decisions[0])?.selector ?? "");
        continue;
      }
      const transition = current.workflow_control.transitions.find((item) => item.state === "ready");
      if (transition) { advanceTransition(context, transition.selector); continue; }
      throw new Error(`Revision journey stalled: ${JSON.stringify(current.workflow_control.frontier)}`);
    }
    assert.equal(sawRoundOne, true);
    assert.equal(sawRoundTwo, true);
  } finally { await cleanup(root); }
});

void test("[journey.resume] a fresh CLI process resumes only from persisted frontier evidence", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    const instance = await startSubflow(context, "subflow:tpl-deep-research-quick");
    const before = status(context).workflow_control.frontier;
    assert.ok(before.length > 0);
    const resumed = status(context).workflow_control;
    assert.deepEqual(resumed.frontier, before);
    const navigate = await readFile(path.join(root, ".forge/skills/researchspec-navigate/SKILL.md"), "utf8");
    assert.match(navigate, /Resume follows only the CLI frontier|\*\*Resume:\*\*/);
    assert.ok(resumed.ready_items.every((selector) => selector.includes(instance.slice(8))));
  } finally { await cleanup(root); }
});

void test("[journey.context-export] handoff and pack remain derived and do not advance state", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    await startSubflow(context, "subflow:tpl-deep-research-quick");
    const statePath = path.join(context.workspace, "runs/current/state.yaml");
    const before = hash(await readFile(statePath));
    const handoff = path.join(context.workspace, "runs/current/handoff.md");
    cliJson(["handoff", "--out", handoff, "--dry-run"], root);
    cliJson(["handoff", "--out", handoff], root);
    const pack = path.join(root, "acceptance-context.zip");
    const preview = cliJson<{ entries: Array<{ path: string }> }>(["pack", "--out", pack, "--dry-run"], root).data;
    assert.equal(preview?.entries.some((item) => item.path.startsWith("artifacts/")), false);
    cliJson(["pack", "--out", pack], root);
    assert.equal(existsSync(handoff), true);
    assert.equal(existsSync(pack), true);
    assert.equal(hash(await readFile(statePath)), before);
  } finally { await cleanup(root); }
});

void test("[journey.terminal-completion] the full pipeline reaches terminal state through public actions", async () => {
  const root = await tempProject();
  try {
    const context = initialize(root);
    const parent = await startSubflow(context, "subflow:tpl-academic-pipeline-end-to-end");
    const complete = await drive(context, parent);
    assert.equal(complete.workflow_control.subflows.find((item) => item.selector === parent)?.state, "complete");
    assert.equal(complete.run.status, "complete");
    assert.equal(complete.workflow_control.frontier.some((selector) => selector.includes(parent.slice(8))), false);
    const blockedInput = path.join(root, "terminal-start.json");
    await writeFile(blockedInput, `${JSON.stringify({
      schema_version: "1",
      instruction_basis_sha256: "0".repeat(64),
      acknowledged_user_input_ids: [],
      prerequisite_artifact_ids: [],
      prerequisite_decision_ids: [],
      parent_subflow_selector: null,
    }, null, 2)}\n`, "utf8");
    const blocked = runCli([
      "start", "subflow:tpl-deep-research-quick", "--input", blockedInput,
      "--actor-kind", "agent", "--actor-name", "acceptance-driver",
      "--confirmed-by", "Acceptance Researcher", "--dry-run", "--json",
    ], root);
    assert.notEqual(blocked.status, 0);
    assert.equal(parseEnvelope(blocked).error?.code, "run_terminal");
    assert.equal(cliJson<{ ok: boolean }>(["check", "all"], root).data?.ok, true);
  } finally { await cleanup(root); }
});

function hash(bytes: Uint8Array): string { return createHash("sha256").update(bytes).digest("hex"); }
function escapeRegex(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
