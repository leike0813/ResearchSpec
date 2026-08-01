import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import {
  advanceSubflow,
  appendGateAttempt,
  overrideFailedGate,
  recordLocalDecision,
  startSubflow,
  SubflowControlError,
} from "../src/core/runtime/subflow-control.js";
import { loadCurrentWorkspaceIndex } from "../src/core/runtime/workspace-index.js";
import { createCurrentWorkspace, startCommand } from "./helpers/current-workspace.js";

void test("Gate reverification appends attempts and a current fail can be overridden without advancing", async () => {
  const fixture = await createCurrentWorkspace();
  try {
    const evidencePath = path.join(fixture.root, "outputs/report.md");
    await mkdir(path.dirname(evidencePath), { recursive: true });
    await writeFile(evidencePath, "evidence\n", "utf8");
    let index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const started = await startSubflow({
      index,
      routeRef: "deep-research:full",
      command: startCommand("deep-research:full", "2026-08-02T10:00:00+08:00", {
        formal_gates: ["evidence-quality"],
        planned_outputs: [{ role: "research-report", type: "report", path: "outputs/report.md", purpose: "Gate review" }],
      }),
      confirmedBy: "researcher",
    });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const checkpoint = index.subflows[0]?.control.checkpoint;
    await appendGateAttempt({ index, instanceId: started.instance_id, gateId: "evidence-quality", verdict: "fail", confirmedBy: "researcher", confirmedAt: "2026-08-02T10:10:00+08:00", summary: "Evidence gap remains." });
    await appendGateAttempt({ index, instanceId: started.instance_id, gateId: "evidence-quality", verdict: "pass", confirmedBy: "researcher", confirmedAt: "2026-08-02T10:20:00+08:00", summary: "New evidence closes the gap.", evidenceRole: "research-report" });
    await appendGateAttempt({ index, instanceId: started.instance_id, gateId: "evidence-quality", verdict: "fail", confirmedBy: "researcher", confirmedAt: "2026-08-02T10:30:00+08:00", summary: "Residual limitation remains." });
    await overrideFailedGate({ index, instanceId: started.instance_id, gateId: "evidence-quality", approvedBy: "researcher", approvedAt: "2026-08-02T10:31:00+08:00", reason: "Proceed with the limitation disclosed." });

    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const control = index.subflows[0]?.control;
    assert.equal(control?.gates[0]?.attempts.length, 3);
    assert.equal(control?.gates[0]?.attempts[1]?.evidence?.[0]?.role, "research-report");
    assert.match(control?.gates[0]?.override?.decision_id ?? "", /^override-/);
    assert.equal(control?.checkpoint, checkpoint);
    assert.equal(control?.transitions.length, 0);
  } finally { await fixture.cleanup(); }
});

void test("local scope, claim, structure and branch-shaped Decisions remain in one control", async () => {
  const fixture = await createCurrentWorkspace();
  try {
    let index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const started = await startSubflow({ index, routeRef: "deep-research:quick", command: startCommand("deep-research:quick", "2026-08-02T11:00:00+08:00"), confirmedBy: "researcher" });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    for (const [offset, kind] of (["scope", "claim", "structure"] as const).entries()) {
      await recordLocalDecision({ index, instanceId: started.instance_id, decisionId: `${kind}-choice`, kind, choice: `choice-${kind}`, decidedBy: "researcher", decidedAt: `2026-08-02T11:0${String(offset + 1)}:00+08:00` });
    }
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    assert.deepEqual(index.subflows[0]?.control.decisions.map((item) => item.kind), ["scope", "claim", "structure"]);
    assert.equal(index.subflows[0]?.control.gates.length, 0);
  } finally { await fixture.cleanup(); }
});

void test("lifecycle transitions are explicit and control writes reject stale bytes", async () => {
  const fixture = await createCurrentWorkspace();
  try {
    let index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const first = await startSubflow({ index, routeRef: "deep-research:quick", command: startCommand("deep-research:quick", "2026-08-02T12:00:00+08:00"), confirmedBy: "researcher" });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const original = index.subflows[0];
    assert.ok(original);
    await advanceSubflow({ index, instanceId: first.instance_id, transition: "pause", actor: "agent", transitionedAt: "2026-08-02T12:01:00+08:00" });
    await assert.rejects(
      appendGateAttempt({ index, instanceId: first.instance_id, gateId: "missing", verdict: "pass", confirmedBy: "researcher", confirmedAt: "2026-08-02T12:02:00+08:00", summary: "No.", expectedControlText: original.controlText }),
      (error: unknown) => error instanceof SubflowControlError && error.code === "control_write_conflict",
    );
    await advanceSubflow({ index, instanceId: first.instance_id, transition: "resume", actor: "agent", transitionedAt: "2026-08-02T12:03:00+08:00" });
    await advanceSubflow({ index, instanceId: first.instance_id, transition: "cancel", actor: "agent", transitionedAt: "2026-08-02T12:04:00+08:00" });

    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    const second = await startSubflow({ index, routeRef: "deep-research:quick", command: startCommand("deep-research:quick", "2026-08-02T12:10:00+08:00"), confirmedBy: "researcher" });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    await advanceSubflow({ index, instanceId: second.instance_id, transition: "complete", actor: "agent", transitionedAt: "2026-08-02T12:11:00+08:00" });
    index = await loadCurrentWorkspaceIndex(fixture.workspace);
    assert.equal(index.subflows.find((item) => item.control.instance_id === first.instance_id)?.control.status, "cancelled");
    assert.deepEqual(index.subflows.find((item) => item.control.instance_id === first.instance_id)?.control.transitions.map((item) => item.transition_id), ["pause", "resume", "cancel"]);
    assert.equal(index.subflows.find((item) => item.control.instance_id === second.instance_id)?.control.status, "complete");
    assert.doesNotMatch(await readFile(original.controlPath, "utf8"), /plan_sha256|receipt/);
  } finally { await fixture.cleanup(); }
});
