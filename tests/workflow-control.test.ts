import assert from "node:assert/strict";
import { test } from "node:test";
import { writeFile } from "node:fs/promises";
import path from "node:path";

import {
  advanceSubflow,
  appendGateAttempt,
  recordLocalDecision,
  startSubflow,
} from "../src/core/runtime/subflow-control.js";
import { childStartCandidates, evaluateWorkflowControl } from "../src/core/runtime/workflow-control.js";
import { loadCurrentWorkspaceIndex, type CurrentWorkspaceIndex, type SubflowRecord } from "../src/core/runtime/workspace-index.js";
import { createCurrentWorkspace, startCommand } from "./helpers/current-workspace.js";

void test("pipeline frontier requires child completion, Gate confirmation, branch choice and separate parent advance", async () => {
  const fixture = await createCurrentWorkspace();
  try {
    let index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const parent = await startSubflow({ index, routeRef: "academic-pipeline:end-to-end", command: startCommand("academic-pipeline:end-to-end", "2026-08-02T13:00:00+08:00", { profile_entry: "end-to-end" }), confirmedBy: "researcher" });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    assert.ok(evaluateWorkflowControl(index).frontier.some((item) => item.kind === "route" && item.parent_instance_id === parent.instance_id && item.node_id === "research"));

    const research = await startChild(index, parent.instance_id, "research", "deep-research:full", 1, ["evidence-integrity"]);
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await passAndComplete(index, research.instance_id, "evidence-integrity", 2);
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    assert.equal(index.subflows.find((item) => item.control.instance_id === parent.instance_id)?.control.checkpoint, "research");
    assert.ok(evaluateWorkflowControl(index).frontier.some((item) => item.kind === "advance" && item.transition === "research-to-write"));
    await advanceSubflow({ index, instanceId: parent.instance_id, actor: "agent", transitionedAt: time(3) });

    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const write = await startChild(index, parent.instance_id, "write", "academic-paper:full", 4, ["manuscript-integrity"]);
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await passAndComplete(index, write.instance_id, "manuscript-integrity", 5);
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await advanceSubflow({ index, instanceId: parent.instance_id, actor: "agent", transitionedAt: time(6) });

    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const review = await startChild(index, parent.instance_id, "review", "academic-paper-reviewer:full", 7, ["review-confirmation"]);
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await appendGateAttempt({ index, instanceId: review.instance_id, gateId: "review-confirmation", verdict: "pass", confirmedBy: "researcher", confirmedAt: time(8), summary: "Review confirmed." });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    assert.ok(evaluateWorkflowControl(index).pending_decisions.includes(`decision:${review.instance_id}/editorial-outcome`));
    await recordLocalDecision({ index, instanceId: review.instance_id, decisionId: "editorial-outcome", kind: "branch", choice: "revision", decidedBy: "researcher", decidedAt: time(9) });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await advanceSubflow({ index, instanceId: review.instance_id, transition: "complete", actor: "agent", transitionedAt: time(10) });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await advanceSubflow({ index, instanceId: parent.instance_id, actor: "agent", transitionedAt: time(11) });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    assert.ok(evaluateWorkflowControl(index).frontier.some((item) => item.kind === "route" && item.node_id === "revision" && item.round === 1));
  } finally { await fixture.cleanup(); }
});

void test("dynamic revision template exposes the next independently confirmed round only after continue branch", async () => {
  const fixture = await createCurrentWorkspace();
  try {
    let index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const parent = await startSubflow({ index, routeRef: "academic-pipeline:end-to-end", command: startCommand("academic-pipeline:end-to-end", time(0), { profile_entry: "end-to-end" }), confirmedBy: "researcher" });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await reachRevision(index, fixture.workspace, parent.instance_id);
    index = await loadCurrentWorkspaceIndex(fixture.workspace);

    const revision = await startChild(index, parent.instance_id, "revision", "academic-paper:revision", 20, ["revision-completeness"], 1);
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await passAndComplete(index, revision.instance_id, "revision-completeness", 21);
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await advanceSubflow({ index, instanceId: parent.instance_id, actor: "agent", transitionedAt: time(22) });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const rereview = await startChild(index, parent.instance_id, "re-review", "academic-paper-reviewer:re-review", 23, ["re-review-confirmation"], 1);
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await appendGateAttempt({ index, instanceId: rereview.instance_id, gateId: "re-review-confirmation", verdict: "pass", confirmedBy: "researcher", confirmedAt: time(24), summary: "Re-review confirmed." });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await recordLocalDecision({ index, instanceId: rereview.instance_id, decisionId: "revision-outcome", kind: "branch", choice: "continue-revision", decidedBy: "researcher", decidedAt: time(25) });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await advanceSubflow({ index, instanceId: rereview.instance_id, transition: "complete", actor: "agent", transitionedAt: time(26) });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await advanceSubflow({ index, instanceId: parent.instance_id, actor: "agent", transitionedAt: time(27) });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const candidate = evaluateWorkflowControl(index).frontier.find((item) => item.kind === "route" && item.node_id === "revision" && item.round === 2);
    assert.ok(candidate);
    assert.equal(index.subflows.filter((item) => item.control.parent?.node_id === "revision").length, 1);
  } finally { await fixture.cleanup(); }
});

void test("accepted review reaches format before final integrity and carries both final inputs", async () => {
  const fixture = await createCurrentWorkspace();
  try {
    await writeFile(path.join(fixture.root, "paper.md"), "# Paper\n", "utf8");
    let index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const parent = await startSubflow({ index, routeRef: "academic-pipeline:end-to-end", command: startCommand("academic-pipeline:end-to-end", time(0), { profile_entry: "end-to-end" }), confirmedBy: "researcher" });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const research = await startChild(index, parent.instance_id, "research", "deep-research:full", 1, ["evidence-integrity"]);
    index = await loadCurrentWorkspaceIndex(fixture.workspace); await passAndComplete(index, research.instance_id, "evidence-integrity", 2);
    index = await loadCurrentWorkspaceIndex(fixture.workspace); await advanceSubflow({ index, instanceId: parent.instance_id, actor: "agent", transitionedAt: time(3) });
    index = await loadCurrentWorkspaceIndex(fixture.workspace); const write = await startChild(index, parent.instance_id, "write", "academic-paper:full", 4, ["manuscript-integrity"]);
    index = await loadCurrentWorkspaceIndex(fixture.workspace); await passAndComplete(index, write.instance_id, "manuscript-integrity", 5);
    index = await loadCurrentWorkspaceIndex(fixture.workspace); await advanceSubflow({ index, instanceId: parent.instance_id, actor: "agent", transitionedAt: time(6) });
    index = await loadCurrentWorkspaceIndex(fixture.workspace); const review = await startChild(index, parent.instance_id, "review", "academic-paper-reviewer:full", 7, ["review-confirmation"]);
    index = await loadCurrentWorkspaceIndex(fixture.workspace); await appendGateAttempt({ index, instanceId: review.instance_id, gateId: "review-confirmation", verdict: "pass", confirmedBy: "researcher", confirmedAt: time(8), summary: "Review confirmed." });
    index = await loadCurrentWorkspaceIndex(fixture.workspace); await recordLocalDecision({ index, instanceId: review.instance_id, decisionId: "editorial-outcome", kind: "branch", choice: "accepted", decidedBy: "researcher", decidedAt: time(9) });
    index = await loadCurrentWorkspaceIndex(fixture.workspace); await advanceSubflow({ index, instanceId: review.instance_id, transition: "complete", actor: "agent", transitionedAt: time(10) });
    index = await loadCurrentWorkspaceIndex(fixture.workspace); await advanceSubflow({ index, instanceId: parent.instance_id, actor: "agent", transitionedAt: time(11) });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    assert.ok(evaluateWorkflowControl(index).frontier.some((item) => item.kind === "route" && item.node_id === "format"));
    assert.equal(evaluateWorkflowControl(index).frontier.some((item) => item.kind === "route" && item.node_id === "final-integrity"), false);

    const format = await startSubflow({
      index,
      routeRef: "academic-paper:format-convert",
      command: startCommand("academic-paper:format-convert", time(12), {
        parent: { instance_id: parent.instance_id, node_id: "format" },
        handoff_inputs: [{ role: "manuscript_source", type: "manuscript", path: "paper.md", purpose: "format", format: "markdown" }],
        planned_outputs: [{ role: "formatted_manuscript", type: "manuscript", path: "paper.pdf", purpose: "final check", format: "pdf" }],
      }),
      confirmedBy: "format-approver",
    });
    index = await loadCurrentWorkspaceIndex(fixture.workspace); await advanceSubflow({ index, instanceId: format.instance_id, transition: "complete", actor: "agent", transitionedAt: time(13) });
    index = await loadCurrentWorkspaceIndex(fixture.workspace); await advanceSubflow({ index, instanceId: parent.instance_id, actor: "agent", transitionedAt: time(14) });
    await writeFile(path.join(fixture.root, "paper.pdf"), "rendered\n", "utf8");
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    assert.ok(evaluateWorkflowControl(index).frontier.some((item) => item.kind === "route" && item.node_id === "final-integrity"));
    const final = await startSubflow({
      index,
      routeRef: "academic-paper:citation-check",
      command: startCommand("academic-paper:citation-check", time(15), {
        parent: { instance_id: parent.instance_id, node_id: "final-integrity" },
        handoff_inputs: [
          { role: "manuscript_source", type: "manuscript", path: "paper.md", purpose: "source integrity", format: "markdown" },
          { role: "formatted_manuscript", type: "manuscript", path: "paper.pdf", purpose: "render integrity", format: "pdf" },
        ],
        formal_gates: ["final-integrity"],
      }),
      confirmedBy: "integrity-approver",
    });
    assert.deepEqual(final.handoff.inputs.map((item) => item.role), ["manuscript_source", "formatted_manuscript"]);
  } finally { await fixture.cleanup(); }
});

void test("parallel prerequisite groups honor any/all joins and one multiplicity", async () => {
  const fixture = await createCurrentWorkspace();
  try {
    let index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await startSubflow({ index, routeRef: "academic-pipeline:end-to-end", command: startCommand("academic-pipeline:end-to-end", time(0), { profile_entry: "end-to-end" }), confirmedBy: "researcher" });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const parentRecord = index.subflows[0];
    assert.ok(parentRecord);
    const profile = structuredClone(index.profile);
    profile.children.push(
      { node_id: "parallel-a", route_ref: "deep-research:quick", prerequisites: [], required_gate_ids: [], branch_ids: [], multiplicity: "one", round_role: null },
      { node_id: "parallel-b", route_ref: "deep-research:quick", prerequisites: [], required_gate_ids: [], branch_ids: [], multiplicity: "one", round_role: null },
      { node_id: "joined", route_ref: "deep-research:quick", prerequisites: ["parallel-a", "parallel-b"], required_gate_ids: [], branch_ids: [], multiplicity: "one", round_role: null },
    );
    profile.parallel_groups.push({ group_id: "parallel", child_node_ids: ["parallel-a", "parallel-b"], join_policy: "any" });
    const syntheticParent = cloneRecord(parentRecord, { ...parentRecord.control, checkpoint: "joined" });
    const a = childRecord(syntheticParent, "parallel-a", "sf-parallel-a", "complete");
    const anyIndex: CurrentWorkspaceIndex = { ...index, profile, subflows: [syntheticParent, a] };
    assert.ok(childStartCandidates(anyIndex).some((item) => item.node.node_id === "joined"));

    const allProfile = structuredClone(profile);
    const group = allProfile.parallel_groups.at(-1);
    assert.ok(group);
    group.join_policy = "all";
    const allIndex = { ...anyIndex, profile: allProfile };
    assert.equal(childStartCandidates(allIndex).some((item) => item.node.node_id === "joined"), false);
    const b = childRecord(syntheticParent, "parallel-b", "sf-parallel-b", "complete");
    const joined = childRecord(syntheticParent, "joined", "sf-joined", "active");
    assert.ok(childStartCandidates({ ...allIndex, subflows: [syntheticParent, a, b] }).some((item) => item.node.node_id === "joined"));
    assert.equal(childStartCandidates({ ...allIndex, subflows: [syntheticParent, a, b, joined] }).some((item) => item.node.node_id === "joined"), false);
  } finally { await fixture.cleanup(); }
});

async function reachRevision(index: CurrentWorkspaceIndex, workspace: string, parentId: string): Promise<void> {
  let current = index;
  const research = await startChild(current, parentId, "research", "deep-research:full", 1, ["evidence-integrity"]);
  current = await loadCurrentWorkspaceIndex(workspace); await passAndComplete(current, research.instance_id, "evidence-integrity", 2);
  current = await loadCurrentWorkspaceIndex(workspace); await advanceSubflow({ index: current, instanceId: parentId, actor: "agent", transitionedAt: time(3) });
  current = await loadCurrentWorkspaceIndex(workspace); const write = await startChild(current, parentId, "write", "academic-paper:full", 4, ["manuscript-integrity"]);
  current = await loadCurrentWorkspaceIndex(workspace); await passAndComplete(current, write.instance_id, "manuscript-integrity", 5);
  current = await loadCurrentWorkspaceIndex(workspace); await advanceSubflow({ index: current, instanceId: parentId, actor: "agent", transitionedAt: time(6) });
  current = await loadCurrentWorkspaceIndex(workspace); const review = await startChild(current, parentId, "review", "academic-paper-reviewer:full", 7, ["review-confirmation"]);
  current = await loadCurrentWorkspaceIndex(workspace); await appendGateAttempt({ index: current, instanceId: review.instance_id, gateId: "review-confirmation", verdict: "pass", confirmedBy: "researcher", confirmedAt: time(8), summary: "Review confirmed." });
  current = await loadCurrentWorkspaceIndex(workspace); await recordLocalDecision({ index: current, instanceId: review.instance_id, decisionId: "editorial-outcome", kind: "branch", choice: "revision", decidedBy: "researcher", decidedAt: time(9) });
  current = await loadCurrentWorkspaceIndex(workspace); await advanceSubflow({ index: current, instanceId: review.instance_id, transition: "complete", actor: "agent", transitionedAt: time(10) });
  current = await loadCurrentWorkspaceIndex(workspace); await advanceSubflow({ index: current, instanceId: parentId, actor: "agent", transitionedAt: time(11) });
}

async function startChild(index: CurrentWorkspaceIndex, parentId: string, nodeId: string, routeRef: Parameters<typeof startCommand>[0], minute: number, gates: string[], round?: number) {
  return startSubflow({ index, routeRef, command: startCommand(routeRef, time(minute), { parent: { instance_id: parentId, node_id: nodeId }, formal_gates: gates, ...(round === undefined ? {} : { round }) }), confirmedBy: `approver-${nodeId}-${String(round ?? 0)}` });
}

async function passAndComplete(index: CurrentWorkspaceIndex, instanceId: string, gateId: string, minute: number): Promise<void> {
  await appendGateAttempt({ index, instanceId, gateId, verdict: "pass", confirmedBy: "researcher", confirmedAt: time(minute), summary: "Gate passed." });
  const current = await loadCurrentWorkspaceIndex(index.workspace);
  await advanceSubflow({ index: current, instanceId, transition: "complete", actor: "agent", transitionedAt: time(minute + 1) });
}

function time(minute: number): string {
  return new Date(Date.UTC(2026, 7, 2, 6, minute)).toISOString();
}

function cloneRecord(record: SubflowRecord, control: SubflowRecord["control"]): SubflowRecord {
  return { ...record, control };
}

function childRecord(parent: SubflowRecord, nodeId: string, instanceId: string, status: "active" | "complete"): SubflowRecord {
  const control = {
    ...structuredClone(parent.control), instance_id: instanceId, route_ref: "deep-research:quick" as const,
    skill_id: "deep-research", mode_id: "quick", parent: { instance_id: parent.control.instance_id, node_id: nodeId },
    status, checkpoint: nodeId, gates: [], decisions: [], transitions: [],
  };
  return { ...parent, directoryName: instanceId, directoryPath: instanceId, controlPath: `${instanceId}/control.yaml`, handoffPath: `${instanceId}/handoff.md`, controlText: "", handoffText: "", control, handoff: { ...parent.handoff, subflow_instance_id: instanceId } };
}
