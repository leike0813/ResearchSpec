import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { parse } from "yaml";

import {
  executeAdaptivePlan,
  planAdaptiveCompletion,
  planAdaptiveGate,
  planAdaptiveObligationSubmit,
  planAdaptiveResolutionDecision,
  planAdaptiveStart,
} from "../src/core/runtime/adaptive-case-transactions.js";
import { loadWorkspaceSnapshot } from "../src/core/workspace/snapshot.js";
import { executeWritePlan } from "../src/core/workspace/write-plan.js";
import { cleanup, parseEnvelope, runCli, tempProject, type Envelope } from "./helpers/cli.js";

interface Availability {
  selector: string;
  disposition: "recommended" | "allowed" | "blocked";
  basis_sha256: string;
}

interface Descriptor {
  availability: Availability;
  minimal_input_template: Record<string, unknown> | null;
}

interface AdaptiveStatus {
  lifecycle: string;
  profile: { mode: string };
  unsatisfied_obligation_ids: string[];
  recommended_actions: Availability[];
  allowed_actions: Availability[];
  pending: { decision_count: number };
}

interface RegistryArtifact {
  artifact_id: string;
  artifact_type?: string;
  path?: string;
  sha256: string;
  obligation_id?: string;
}

interface ObligationPacket {
  obligation: {
    obligation_id: string;
    status: string;
    scope: { subflow_instance_id: string };
  };
  definition: {
    required_evidence_types: string[];
    outputs: Array<{ artifact_type: string; path_template: string }>;
  };
  attempts: Array<{ attempt_id: string }>;
  action_descriptor: Descriptor;
}

interface TransactionResult {
  identity: { selector: string; plan_sha256?: string };
  effects: Array<{ kind: string; refs: string[] }>;
}

void test("[adaptive.reorder-recovery] independent work survives local failure, retry, replacement and reordering", async () => {
  const root = await tempProject();
  try {
    initializeAdaptive(root);
    const instance = await startAdaptive(root, "subflow:tpl-deep-research-quick");
    const initial = adaptiveStatus(root);
    const obligationActions = [...initial.recommended_actions, ...initial.allowed_actions]
      .filter((item) => item.selector.startsWith(`obligation:${instance}/`));
    assert.equal(obligationActions.length, 2);
    assert.equal(obligationActions.filter((item) => item.disposition === "recommended").length, 1);
    const first = obligationActions[0]?.selector ?? "";
    const second = obligationActions[1]?.selector ?? "";
    assert.ok(first && second);

    const failed = await submitObligation(root, first, {
      operation: "record_attempt",
      method: "provider-query",
      input_refs: [],
      diagnostic_codes: ["provider-timeout"],
      retry_of_attempt_id: null,
      replaces_attempt_id: null,
      disposition: "failed",
      output_refs: [],
    });
    const failedAttemptId = failed.identity.selector.replace(/^attempt:/, "");
    assert.ok(failed.effects.some((item) => item.kind === "attempt_recorded"));
    assert.ok(currentActions(root).some((item) => item.selector === second && item.disposition !== "blocked"));

    const paused = await submitObligation(root, first, {
      operation: "pause",
      method: "provider-query",
      input_refs: [],
      diagnostic_codes: ["provider-unavailable"],
      retry_of_attempt_id: failedAttemptId,
      replaces_attempt_id: null,
      reason: "Provider is temporarily unavailable.",
    });
    const pauseAttemptId = paused.identity.selector.replace(/^attempt:/, "");
    assert.equal((instructions(root, first) as ObligationPacket).obligation.status, "blocked");
    assert.ok(currentActions(root).some((item) => item.selector === second && item.disposition !== "blocked"));

    await acceptEvidence(root, second, "A-bibliography");
    assert.equal((instructions(root, second) as ObligationPacket).obligation.status, "satisfied");
    assert.equal((instructions(root, first) as ObligationPacket).obligation.status, "blocked");

    await submitObligation(root, first, {
      operation: "record_attempt",
      method: "local-corpus-fallback",
      input_refs: [],
      diagnostic_codes: [],
      retry_of_attempt_id: pauseAttemptId,
      replaces_attempt_id: failedAttemptId,
      disposition: "working",
      output_refs: [],
    });
    assert.equal((instructions(root, first) as ObligationPacket).obligation.status, "unsatisfied");
    await acceptEvidence(root, first, "A-research-brief");

    const completion = currentActions(root).find((item) => item.selector.startsWith(`completion:${instance}/`) && item.disposition !== "blocked");
    assert.ok(completion);
    executeNoInput(root, "advance", completion?.selector ?? "");
    const after = adaptiveStatus(root);
    assert.equal(after.unsatisfied_obligation_ids.length, 0);
    const state = object(parse(await readFile(path.join(root, "researchspec/runs/current/state.yaml"), "utf8")));
    assert.equal("attempts" in state, false);
    assert.equal("playbook" in state, false);
    const history = cliJson<{ items: Array<{ type: string }> }>(root, ["list", "history", "--limit", "50"]).data;
    assert.ok((history?.items ?? []).filter((item) => item.type === "attempt").length >= 5);
    assert.equal(cliJson<{ ok: boolean }>(root, ["check", "runtime"]).data?.ok, true);
    assert.equal(cliJson<{ healthy: boolean }>(root, ["doctor"]).data?.healthy, true);
  } finally {
    await cleanup(root);
  }
});

void test("[adaptive.receipt-v2-retry] receipt-first adaptive phases resume the original plan exactly", async () => {
  const root = await tempProject();
  try {
    initializeAdaptive(root);
    const workspace = path.join(root, "researchspec");
    const selector = "subflow:tpl-deep-research-quick";
    const snapshot = await loadWorkspaceSnapshot(workspace);
    const first = await planAdaptiveStart({
      snapshot,
      selector,
      payload: {},
      actor: { kind: "agent", name: "adaptive-driver" },
      confirmedBy: "Acceptance Researcher",
    });
    const receiptOperation = first.writePlan.operations[0];
    assert.ok(receiptOperation);
    await executeWritePlan({
      operations: [receiptOperation],
      readPreconditions: first.writePlan.readPreconditions,
    });
    const doctor = runCli(["doctor", "--json"], root);
    assert.equal(doctor.status, 1);
    const diagnosis = parseEnvelope<{
      findings: Array<{ disposition: string; retry_selector?: string }>;
    }>(doctor).data;
    assert.ok(diagnosis?.findings.some((finding) =>
      finding.disposition === "retry_existing_transaction"
      && finding.retry_selector === selector));

    const retrySnapshot = await loadWorkspaceSnapshot(workspace);
    const retry = await planAdaptiveStart({
      snapshot: retrySnapshot,
      selector,
      payload: {},
      actor: { kind: "agent", name: "adaptive-driver" },
      confirmedBy: "Acceptance Researcher",
      expectedPlanSha256: first.plan_sha256,
    });
    assert.equal(retry.plan_sha256, first.plan_sha256);
    await executeAdaptivePlan(retry);
    let state = object(parse(await readFile(path.join(workspace, "runs/current/state.yaml"), "utf8")));
    let receipts = (Array.isArray(state.receipts) ? state.receipts : []).map(object);
    assert.equal(receipts.filter((receipt) => receipt.plan_sha256 === first.plan_sha256).length, 1);

    const firstObligation = object((Array.isArray(state.obligations) ? state.obligations : [])[0]);
    const instanceValue = object(firstObligation.scope).subflow_instance_id;
    const instance = typeof instanceValue === "string" ? instanceValue : "";
    assert.match(instance, /^sf-/);
    const obligationSelectors = currentActions(root)
      .filter((item) => item.selector.startsWith(`obligation:${instance}/`) && item.disposition !== "blocked")
      .map((item) => item.selector);
    assert.equal(obligationSelectors.length, 2);

    const evidenceSelector = obligationSelectors[0] ?? "";
    const evidencePacket = instructions(root, evidenceSelector) as ObligationPacket;
    const output = evidencePacket.definition.outputs[0];
    assert.ok(output);
    const evidencePath = output.path_template.replace("{subflow_instance_id}", instance);
    const evidenceBytes = Buffer.from("# Receipt-first evidence\n", "utf8");
    await mkdir(path.dirname(path.join(workspace, evidencePath)), { recursive: true });
    await writeFile(path.join(workspace, evidencePath), evidenceBytes);
    const evidencePayload = {
      operation: "accept_evidence",
      method: "arsu-producer",
      input_refs: [],
      diagnostic_codes: [],
      retry_of_attempt_id: null,
      replaces_attempt_id: null,
      evidence: [{
        artifact_id: "A-receipt-first",
        artifact_type: output.artifact_type,
        path: evidencePath,
        sha256: createHash("sha256").update(evidenceBytes).digest("hex"),
        provenance: "adaptive receipt recovery test",
      }],
    };
    let snapshotForPhase = await loadWorkspaceSnapshot(workspace);
    const evidencePlan = await planAdaptiveObligationSubmit({
      snapshot: snapshotForPhase,
      selector: evidenceSelector,
      payload: evidencePayload,
      actor: { kind: "agent", name: "adaptive-driver" },
    });
    await executeReceiptOnly(evidencePlan);
    snapshotForPhase = await loadWorkspaceSnapshot(workspace);
    const evidenceRetry = await planAdaptiveObligationSubmit({
      snapshot: snapshotForPhase,
      selector: evidenceSelector,
      payload: evidencePayload,
      actor: { kind: "agent", name: "adaptive-driver" },
      expectedPlanSha256: evidencePlan.plan_sha256,
    });
    assert.equal(evidenceRetry.plan_sha256, evidencePlan.plan_sha256);
    await executeAdaptivePlan(evidenceRetry);

    const resolutionSelector = obligationSelectors[1] ?? "";
    const resolutionPayload = {
      operation: "request_resolution",
      resolution: "waive",
      rationale: "Receipt-first recovery covers the formal resolution path.",
    };
    snapshotForPhase = await loadWorkspaceSnapshot(workspace);
    const requestPlan = await planAdaptiveObligationSubmit({
      snapshot: snapshotForPhase,
      selector: resolutionSelector,
      payload: resolutionPayload,
      actor: { kind: "agent", name: "adaptive-driver" },
    });
    await executeReceiptOnly(requestPlan);
    snapshotForPhase = await loadWorkspaceSnapshot(workspace);
    const requestRetry = await planAdaptiveObligationSubmit({
      snapshot: snapshotForPhase,
      selector: resolutionSelector,
      payload: resolutionPayload,
      actor: { kind: "agent", name: "adaptive-driver" },
      expectedPlanSha256: requestPlan.plan_sha256,
    });
    await executeAdaptivePlan(requestRetry);

    const actionSelector = currentActions(root)
      .find((item) => item.selector.startsWith("case-action:") && item.disposition !== "blocked")?.selector ?? "";
    snapshotForPhase = await loadWorkspaceSnapshot(workspace);
    const decisionPlan = await planAdaptiveResolutionDecision({
      snapshot: snapshotForPhase,
      selector: actionSelector,
      decision: "accept",
      actorName: "Acceptance Researcher",
      reason: "Approved after receipt-first recovery.",
    });
    await executeReceiptOnly(decisionPlan);
    snapshotForPhase = await loadWorkspaceSnapshot(workspace);
    const decisionRetry = await planAdaptiveResolutionDecision({
      snapshot: snapshotForPhase,
      selector: actionSelector,
      decision: "accept",
      actorName: "Acceptance Researcher",
      reason: "Approved after receipt-first recovery.",
      expectedPlanSha256: decisionPlan.plan_sha256,
    });
    await executeAdaptivePlan(decisionRetry);

    const completionSelector = currentActions(root)
      .find((item) => item.selector.startsWith(`completion:${instance}/`) && item.disposition !== "blocked")?.selector ?? "";
    snapshotForPhase = await loadWorkspaceSnapshot(workspace);
    const completionPlan = await planAdaptiveCompletion({
      snapshot: snapshotForPhase,
      selector: completionSelector,
      actor: { kind: "agent", name: "adaptive-driver" },
    });
    await executeReceiptOnly(completionPlan);
    snapshotForPhase = await loadWorkspaceSnapshot(workspace);
    const completionRetry = await planAdaptiveCompletion({
      snapshot: snapshotForPhase,
      selector: completionSelector,
      actor: { kind: "agent", name: "adaptive-driver" },
      expectedPlanSha256: completionPlan.plan_sha256,
    });
    await executeAdaptivePlan(completionRetry);

    state = object(parse(await readFile(path.join(workspace, "runs/current/state.yaml"), "utf8")));
    receipts = (Array.isArray(state.receipts) ? state.receipts : []).map(object);
    for (const plan of [first, evidencePlan, requestPlan, decisionPlan, completionPlan]) {
      assert.equal(receipts.filter((receipt) => receipt.plan_sha256 === plan.plan_sha256).length, 1);
    }
    const attempts = (await readFile(path.join(workspace, "runs/current/attempt-ledger.jsonl"), "utf8"))
      .trim().split("\n").filter(Boolean);
    const decisions = (await readFile(path.join(workspace, "runs/current/decision-ledger.jsonl"), "utf8"))
      .trim().split("\n").filter(Boolean);
    assert.equal(attempts.length, 1);
    assert.equal(decisions.length, 1);
    assert.equal(cliJson<{ healthy: boolean }>(root, ["doctor"]).data?.healthy, true);
  } finally {
    await cleanup(root);
  }
});

void test("[adaptive.artifact-path] shared consumers use only the workspace-relative registry basis", async () => {
  const root = await tempProject();
  try {
    initializeAdaptive(root);
    const instance = await startAdaptive(root, "subflow:tpl-deep-research-quick");
    const obligation = currentActions(root).find((item) =>
      item.selector.startsWith(`obligation:${instance}/`) && item.disposition !== "blocked");
    assert.ok(obligation);
    await acceptEvidence(root, obligation?.selector ?? "", "A-runtime-basis");

    const registry = JSON.parse(
      await readFile(path.join(root, "researchspec/runs/current/artifact-registry.json"), "utf8"),
    ) as { artifacts: RegistryArtifact[] };
    const artifact = registry.artifacts.find((item) => item.artifact_id === "A-runtime-basis");
    assert.ok(artifact?.path?.startsWith("runs/"));
    const lurePath = path.join(root, artifact?.path ?? "");
    await mkdir(path.dirname(lurePath), { recursive: true });
    await writeFile(lurePath, "project-root lure with different bytes\n", "utf8");

    assert.equal(cliJson<{ ok: boolean }>(root, ["check", "artifacts"]).data?.ok, true);
    assert.equal(cliJson<{ ok: boolean }>(root, ["check", "all"]).data?.ok, true);
    assert.equal(cliJson<{ healthy: boolean }>(root, ["doctor"]).data?.healthy, true);
  } finally {
    await cleanup(root);
  }
});

void test("[adaptive.receipt-v1-recovery] legacy orphan semantics require human reconstruction", async () => {
  const root = await tempProject();
  try {
    initializeAdaptive(root);
    const receiptDirectory = path.join(root, "researchspec/runs/current/receipts/adaptive-start");
    await mkdir(receiptDirectory, { recursive: true });
    await writeFile(path.join(receiptDirectory, "sf-legacy.json"), `${JSON.stringify({
      schema_version: "1",
      receipt_type: "adaptive_start",
      receipt_id: "R-start-legacy",
      selector: "subflow:tpl-deep-research-quick",
      plan_sha256: "0".repeat(64),
      actor: { kind: "agent", name: "legacy-agent" },
      effects: [{ kind: "subflow_started", refs: ["subflow:sf-legacy"] }],
      committed_at: "2026-07-27T00:00:00.000Z",
    }, null, 2)}\n`);
    const doctor = runCli(["doctor", "--json"], root);
    assert.equal(doctor.status, 1);
    const diagnosis = parseEnvelope<{
      findings: Array<{ disposition: string; code: string }>;
    }>(doctor).data;
    assert.ok(diagnosis?.findings.some((finding) =>
      finding.disposition === "requires_human_reconstruction"
      && finding.code === "legacy_receipt_requires_human_reconstruction"));
  } finally {
    await cleanup(root);
  }
});

void test("[adaptive.resolution] waive and not-applicable require formal case decisions", async () => {
  for (const resolution of ["waive", "not_applicable"] as const) {
    const root = await tempProject();
    try {
      initializeAdaptive(root);
      const instance = await startAdaptive(root, "subflow:tpl-deep-research-quick");
      const obligation = currentActions(root).find((item) => item.selector.startsWith(`obligation:${instance}/`) && item.disposition !== "blocked");
      assert.ok(obligation);
      await submitObligation(root, obligation?.selector ?? "", {
        operation: "request_resolution",
        resolution,
        rationale: `The researcher explicitly approved ${resolution}.`,
      });
      const pending = cliJson<{ items: Array<{ selector: string }> }>(root, ["list", "case-actions"]).data?.items ?? [];
      assert.equal(pending.length, 1);
      const actionSelector = pending[0]?.selector ?? "";
      assert.match(actionSelector, /^case-action:CA-/);
      assert.equal(adaptiveStatus(root).pending.decision_count, 1);
      const workspace = path.join(root, "researchspec");
      const decisionLedgerPath = path.join(workspace, "runs/current/decision-ledger.jsonl");
      const statePath = path.join(workspace, "runs/current/state.yaml");
      const ledgerBefore = await readFile(decisionLedgerPath, "utf8");
      const stateBefore = await readFile(statePath, "utf8");
      const unbound = runCli([
        "decide",
        actionSelector,
        "--decision",
        "accept",
        "--actor-name",
        "Acceptance Researcher",
        "--reason",
        "Explicit obligation resolution approval",
        "--json",
      ], root);
      assert.equal(unbound.status, 2);
      assert.equal(parseEnvelope(unbound).error?.code, "confirmation_required");
      assert.equal(await readFile(decisionLedgerPath, "utf8"), ledgerBefore);
      assert.equal(await readFile(statePath, "utf8"), stateBefore);
      decideCaseAction(root, actionSelector);
      assert.equal((instructions(root, obligation?.selector ?? "") as ObligationPacket).obligation.status, resolution === "waive" ? "waived" : "not_applicable");
      const decisions = cliJson<{ items: Array<{ value: { decision_type: string; case_action_id?: string } }> }>(root, ["list", "decisions"]).data?.items ?? [];
      assert.ok(decisions.some((item) => item.value.case_action_id === actionSelector.slice("case-action:".length)));
      assert.equal(cliJson<{ ok: boolean }>(root, ["check", "runtime"]).data?.ok, true);
    } finally {
      await cleanup(root);
    }
  }
});

void test("[adaptive.gate-authority] reverification is current and pass-with-conditions unlocks completion", async () => {
  const root = await tempProject();
  try {
    initializeAdaptive(root);
    const instance = await startAdaptive(root, "subflow:tpl-deep-research-full");
    let artifactIndex = 0;
    while (true) {
      const obligation = currentActions(root).find((item) =>
        item.selector.startsWith(`obligation:${instance}/`) && item.disposition !== "blocked");
      if (!obligation) break;
      artifactIndex += 1;
      await acceptEvidence(root, obligation.selector, `A-gate-${String(artifactIndex)}`);
    }
    const gate = currentActions(root).find((item) =>
      item.selector.startsWith(`gate:${instance}/`) && item.disposition !== "blocked");
    assert.ok(gate);
    const registry = JSON.parse(
      await readFile(path.join(root, "researchspec/runs/current/artifact-registry.json"), "utf8"),
    ) as { artifacts: RegistryArtifact[] };
    const evidence = registry.artifacts
      .filter((artifact) => artifact.obligation_id)
      .map((artifact) => ({ kind: "artifact" as const, artifact_id: artifact.artifact_id, sha256: artifact.sha256 }));
    const initialPayload = {
      verdict: "fail",
      verification_kind: "initial",
      evidence,
      findings: [{ code: "needs-review", summary: "One review condition remains.", evidence_indexes: [0] }],
    };
    const initialInput = await payloadFile(root, "gate", initialPayload);
    const ledgerPath = path.join(root, "researchspec/runs/current/gate-ledger.jsonl");
    const ledgerBefore = await readFile(ledgerPath, "utf8");
    const unbound = runCli([
      "submit",
      gate?.selector ?? "",
      "--input",
      initialInput,
      "--actor-kind",
      "validator",
      "--actor-name",
      "researchspec-verify",
      "--confirmed-by",
      "Acceptance Researcher",
      "--json",
    ], root);
    assert.equal(unbound.status, 2);
    assert.equal(parseEnvelope(unbound).error?.code, "confirmation_required");
    assert.equal(await readFile(ledgerPath, "utf8"), ledgerBefore);
    const workspace = path.join(root, "researchspec");
    let gateSnapshot = await loadWorkspaceSnapshot(workspace);
    const initialPlan = await planAdaptiveGate({
      snapshot: gateSnapshot,
      selector: gate?.selector ?? "",
      payload: initialPayload,
      actor: { kind: "validator", name: "researchspec-verify" },
      confirmedBy: "Acceptance Researcher",
    });
    await executeReceiptOnly(initialPlan);
    gateSnapshot = await loadWorkspaceSnapshot(workspace);
    const initialRetry = await planAdaptiveGate({
      snapshot: gateSnapshot,
      selector: gate?.selector ?? "",
      payload: initialPayload,
      actor: { kind: "validator", name: "researchspec-verify" },
      confirmedBy: "Acceptance Researcher",
      expectedPlanSha256: initialPlan.plan_sha256,
    });
    assert.equal(initialRetry.plan_sha256, initialPlan.plan_sha256);
    await executeAdaptivePlan(initialRetry);
    const firstEvent = JSON.parse((await readFile(ledgerPath, "utf8")).trim()) as { event_id: string };
    const currentGate = (instructions(root, gate?.selector ?? "") as { action_descriptor: Descriptor }).action_descriptor;
    const staleInput = await payloadFile(root, "gate-stale", {
      verdict: "pass_with_conditions",
      verification_kind: "reverification",
      evidence,
      findings: [],
      supersedes_event_id: "E-cross-gate",
    });
    const stale = runCli([
      "submit",
      gate?.selector ?? "",
      "--input",
      staleInput,
      "--actor-kind",
      "validator",
      "--actor-name",
      "researchspec-verify",
      "--confirmed-by",
      "Acceptance Researcher",
      "--dry-run",
      "--json",
    ], root);
    assert.equal(stale.status, 3);
    assert.equal((await readFile(ledgerPath, "utf8")).trim().split("\n").length, 1);

    const passingInput = await payloadFile(root, "gate-pass", {
      verdict: "fail",
      verification_kind: "reverification",
      evidence,
      findings: [{ code: "still-needs-review", summary: "The condition still needs an explicit override.", evidence_indexes: [0] }],
      supersedes_event_id: firstEvent.event_id,
    });
    executePlanned(
      root,
      ["submit", gate?.selector ?? "", "--input", passingInput, "--actor-kind", "validator", "--actor-name", "researchspec-verify", "--confirmed-by", "Acceptance Researcher"],
      currentGate.availability.basis_sha256,
    );
    const failedReverification = JSON.parse((await readFile(ledgerPath, "utf8")).trim().split("\n").at(-1) ?? "{}") as { event_id: string };
    const override = currentActions(root).find((item) => item.selector.startsWith("case-action:") && item.disposition !== "blocked");
    assert.ok(override);
    decideCaseAction(root, override?.selector ?? "", "postpone");
    assert.ok(currentActions(root).some((item) => item.selector === override?.selector));
    decideCaseAction(root, override?.selector ?? "", "accept");
    assert.ok(currentActions(root).some((item) =>
      item.selector.startsWith(`completion:${instance}/`) && item.disposition !== "blocked"));

    const afterOverride = (instructions(root, gate?.selector ?? "") as { action_descriptor: Descriptor }).action_descriptor;
    assert.notEqual(afterOverride.availability.disposition, "blocked");
    const nextFailedInput = await payloadFile(root, "gate-fail-after-override", {
      verdict: "fail",
      verification_kind: "reverification",
      evidence,
      findings: [{ code: "new-failure", summary: "New evidence invalidates the prior override.", evidence_indexes: [0] }],
      supersedes_event_id: failedReverification.event_id,
    });
    executePlanned(
      root,
      ["submit", gate?.selector ?? "", "--input", nextFailedInput, "--actor-kind", "validator", "--actor-name", "researchspec-verify", "--confirmed-by", "Acceptance Researcher"],
      afterOverride.availability.basis_sha256,
    );
    assert.equal(currentActions(root).some((item) =>
      item.selector.startsWith(`completion:${instance}/`) && item.disposition !== "blocked"), false);
    const replacementOverride = currentActions(root).find((item) =>
      item.selector.startsWith("case-action:") && item.selector !== override?.selector && item.disposition !== "blocked");
    assert.ok(replacementOverride);
    decideCaseAction(root, replacementOverride?.selector ?? "", "reject");

    const latestFailed = JSON.parse((await readFile(ledgerPath, "utf8")).trim().split("\n").at(-1) ?? "{}") as { event_id: string };
    const finalGate = (instructions(root, gate?.selector ?? "") as { action_descriptor: Descriptor }).action_descriptor;
    const finalPassingInput = await payloadFile(root, "gate-pass-with-conditions", {
      verdict: "pass_with_conditions",
      verification_kind: "reverification",
      evidence,
      findings: [],
      supersedes_event_id: latestFailed.event_id,
    });
    executePlanned(
      root,
      ["submit", gate?.selector ?? "", "--input", finalPassingInput, "--actor-kind", "validator", "--actor-name", "researchspec-verify", "--confirmed-by", "Acceptance Researcher"],
      finalGate.availability.basis_sha256,
    );
    const completion = currentActions(root).find((item) =>
      item.selector.startsWith(`completion:${instance}/`) && item.disposition !== "blocked");
    assert.ok(completion);
    const state = object(parse(await readFile(path.join(root, "researchspec/runs/current/state.yaml"), "utf8")));
    const gateReceiptRef = (Array.isArray(state.receipts) ? state.receipts : [])
      .map(object)
      .find((receipt) => receipt.receipt_type === "gate_submit");
    assert.equal(typeof gateReceiptRef?.plan_sha256, "string");
    const gateReceipt = JSON.parse(
      await readFile(path.join(root, "researchspec", String(gateReceiptRef?.path)), "utf8"),
    ) as { schema_version: string; action_identity: { action_type: string } };
    assert.equal(gateReceipt.schema_version, "2");
    assert.equal(gateReceipt.action_identity.action_type, "gate_submit");
  } finally {
    await cleanup(root);
  }
});

void test("[adaptive.case-actions] high-impact patch blocks only its scope until the linked change is applied", async () => {
  const root = await tempProject();
  try {
    initializeAdaptive(root);
    const sourceInstance = await startAdaptive(root, "subflow:tpl-deep-research-quick");
    const sourceSelector = currentActions(root).find((item) => item.selector.startsWith(`obligation:${sourceInstance}/`) && item.disposition !== "blocked")?.selector ?? "";
    const sourcePacket = instructions(root, sourceSelector) as ObligationPacket;
    const sourceOutput = sourcePacket.definition.outputs[0];
    assert.ok(sourceOutput);
    const sourceRelative = sourceOutput.path_template.replace("{subflow_instance_id}", sourceInstance);
    const draft = Buffer.from("<!--block:B0001-->\nOriginal adaptive draft.\n", "utf8");
    await mkdir(path.dirname(path.join(root, "researchspec", sourceRelative)), { recursive: true });
    await writeFile(path.join(root, "researchspec", sourceRelative), draft);
    await submitObligation(root, sourceSelector, {
      operation: "accept_evidence",
      method: "arsu-producer",
      input_refs: [],
      diagnostic_codes: [],
      retry_of_attempt_id: null,
      replaces_attempt_id: null,
      evidence: [{
        artifact_id: "A-adaptive-base",
        artifact_type: sourceOutput.artifact_type,
        path: sourceRelative,
        sha256: createHash("sha256").update(draft).digest("hex"),
        provenance: "adaptive patch base",
      }],
    });
    const unrelated = currentActions(root).find((item) => item.selector.startsWith(`obligation:${sourceInstance}/`) && item.disposition !== "blocked")?.selector ?? "";
    assert.ok(unrelated);

    const revisionInstance = await startAdaptive(root, "subflow:tpl-academic-paper-revision");
    const state = object(parse(await readFile(path.join(root, "researchspec/runs/current/state.yaml"), "utf8")));
    const revisionScope = (Array.isArray(state.obligations) ? state.obligations : [])
      .map(object)
      .filter((obligation) => object(obligation.scope).subflow_instance_id === revisionInstance
        && typeof obligation.definition_id === "string"
        && (obligation.definition_id.endsWith("--revised-draft") || obligation.definition_id.endsWith("--apply-report")))
      .map((obligation) => `obligation:${revisionInstance}/${String(obligation.obligation_id)}`);
    assert.equal(revisionScope.length, 2);

    const patchSelector = "patch:adaptive-high";
    const patchInput = await payloadFile(root, "patch", {
      revision_round: 1,
      base_artifact_id: "A-adaptive-base",
      base_sha256: createHash("sha256").update(draft).digest("hex"),
      producer_skill: "academic-paper",
      producer_mode: "revision",
      subflow_instance_id: revisionInstance,
      obligation_scope: revisionScope.map((selector) => selector.split("/").at(-1)),
      evidence_artifact_ids: ["A-adaptive-base"],
      semantic_delta: {
        level: "high",
        categories: ["scope"],
        summary: "The revised paragraph narrows the governing scope.",
        linked_change_id: "adaptive-scope",
      },
      ops: [{ op: "replace_block", block_id: "B0001", old_hash: createHash("sha256").update("Original adaptive draft.").digest("hex").slice(0, 12), new_text: "Revised adaptive draft." }],
    });
    const patchPacket = instructions(root, patchSelector) as { action_descriptor: Descriptor };
    executePlanned(root, ["submit", patchSelector, "--input", patchInput, "--actor-kind", "agent", "--actor-name", "academic-paper"], patchPacket.action_descriptor.availability.basis_sha256);

    for (const selector of revisionScope) {
      const descriptor = (instructions(root, selector) as ObligationPacket).action_descriptor;
      assert.equal(descriptor.availability.disposition, "blocked");
    }
    assert.notEqual((instructions(root, unrelated) as ObligationPacket).action_descriptor.availability.disposition, "blocked");

    const pendingPatch = instructions(root, patchSelector) as { action_descriptor: Descriptor };
    executePlanned(root, ["decide", patchSelector, "--decision", "accept", "--actor-name", "Acceptance Researcher", "--reason", "Patch reviewed"], pendingPatch.action_descriptor.availability.basis_sha256);
    assert.equal((instructions(root, patchSelector) as { action_descriptor: Descriptor }).action_descriptor.availability.disposition, "blocked");

    const changeSelector = "change:adaptive-scope";
    const changeInput = await payloadFile(root, "change", {
      title: "Narrow research scope",
      rationale: "The accepted revision requires a matching current contract.",
      risk_level: "high",
      impact: ["Changes the governing research scope."],
      obligation_scope: revisionScope.map((selector) => selector.split("/").at(-1)),
      patches: [{
        target_contract: "specs/project.md",
        operation: "replace",
        target_path: "section[Research Question]",
        current_value: "TBD",
        proposed_value: "What changes within the narrowed adaptive scope?",
        reason: "Bind the high-impact draft delta.",
        source_artifact_ids: ["A-adaptive-base"],
        source_decision_ids: [],
      }],
    });
    const changePacket = instructions(root, changeSelector) as { action_descriptor: Descriptor };
    executePlanned(root, ["propose", "adaptive-scope", "--input", changeInput, "--actor-kind", "agent", "--actor-name", "academic-paper"], changePacket.action_descriptor.availability.basis_sha256);
    const decisionPacket = instructions(root, changeSelector) as { action_descriptor: Descriptor };
    executePlanned(root, ["decide", changeSelector, "--decision", "accept", "--actor-name", "Acceptance Researcher", "--reason", "Contract delta approved"], decisionPacket.action_descriptor.availability.basis_sha256);

    const advancePacket = instructions(root, patchSelector) as { action_descriptor: Descriptor };
    assert.notEqual(advancePacket.action_descriptor.availability.disposition, "blocked");
    const baseBeforeAdvance = await readFile(path.join(root, "researchspec", sourceRelative));
    const unboundAdvance = runCli([
      "advance",
      patchSelector,
      "--actor-kind",
      "agent",
      "--actor-name",
      "academic-paper",
      "--json",
    ], root);
    assert.equal(unboundAdvance.status, 2);
    assert.equal(parseEnvelope(unboundAdvance).error?.code, "confirmation_required");
    assert.deepEqual(await readFile(path.join(root, "researchspec", sourceRelative)), baseBeforeAdvance);
    executePlanned(root, ["advance", patchSelector, "--actor-kind", "agent", "--actor-name", "academic-paper"], advancePacket.action_descriptor.availability.basis_sha256);
    const registry = JSON.parse(await readFile(path.join(root, "researchspec/runs/current/artifact-registry.json"), "utf8")) as { artifacts: RegistryArtifact[] };
    assert.ok(registry.artifacts.some((artifact) => artifact.artifact_type === "revised_draft"));
    assert.ok(registry.artifacts.some((artifact) => artifact.artifact_type === "apply_report"));
    assert.equal(registry.artifacts.some((artifact) => artifact.artifact_type === "revision_patch"), false);
    const lifecycleArtifacts = registry.artifacts.filter((artifact) =>
      ["revised_draft", "apply_report", "apply_receipt"].includes(artifact.artifact_type ?? ""));
    assert.equal(lifecycleArtifacts.length, 4);
    assert.ok(lifecycleArtifacts.every((artifact) => artifact.path?.startsWith("runs/")));
    assert.ok(lifecycleArtifacts.every((artifact) => !artifact.path?.startsWith("researchspec/")));
    assert.equal(cliJson<{ ok: boolean }>(root, ["check", "artifacts"]).data?.ok, true);
    assert.equal(cliJson<{ ok: boolean }>(root, ["check", "runtime"]).data?.ok, true);
    assert.equal(cliJson<{ healthy: boolean }>(root, ["doctor"]).data?.healthy, true);
  } finally {
    await cleanup(root);
  }
});

function initializeAdaptive(root: string): void {
  const result = runCli(["init", root, "--tools", "none", "--profile", "adaptive", "--json"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(adaptiveStatus(root).profile.mode, "adaptive");
}

async function startAdaptive(root: string, selector: string): Promise<string> {
  const packet = instructions(root, selector) as { action_descriptor: Descriptor };
  const payload = {};
  const inputPath = await payloadFile(root, "start", payload);
  const result = executePlanned(root, ["start", selector, "--input", inputPath, "--actor-kind", "agent", "--actor-name", "adaptive-driver", "--confirmed-by", "Acceptance Researcher"], packet.action_descriptor.availability.basis_sha256);
  return result.identity.selector.replace(/^subflow:/, "");
}

async function submitObligation(root: string, selector: string, payload: unknown): Promise<TransactionResult> {
  const packet = instructions(root, selector) as ObligationPacket;
  const inputPath = await payloadFile(root, "obligation", payload);
  return executePlanned(root, ["submit", selector, "--input", inputPath, "--actor-kind", "agent", "--actor-name", "adaptive-driver"], packet.action_descriptor.availability.basis_sha256);
}

async function acceptEvidence(root: string, selector: string, artifactId: string): Promise<void> {
  const packet = instructions(root, selector) as ObligationPacket;
  const output = packet.definition.outputs[0];
  assert.ok(output);
  const relativePath = output.path_template.replace("{subflow_instance_id}", packet.obligation.scope.subflow_instance_id);
  const bytes = Buffer.from(`# Adaptive evidence\n\n${selector}\n`, "utf8");
  const absolutePath = path.join(root, "researchspec", relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes);
  await submitObligation(root, selector, {
    operation: "accept_evidence",
    method: "arsu-producer",
    input_refs: [],
    diagnostic_codes: [],
    retry_of_attempt_id: null,
    replaces_attempt_id: null,
    evidence: [{
      artifact_id: artifactId,
      artifact_type: output.artifact_type,
      path: relativePath,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      provenance: "adaptive acceptance journey",
    }],
  });
}

function decideCaseAction(
  root: string,
  selector: string,
  decision: "accept" | "reject" | "postpone" = "accept",
): void {
  const packet = instructions(root, selector) as { action_descriptor: Descriptor };
  executePlanned(root, ["decide", selector, "--decision", decision, "--actor-name", "Acceptance Researcher", "--reason", "Explicit obligation resolution approval"], packet.action_descriptor.availability.basis_sha256);
}

function executeNoInput(root: string, command: "advance", selector: string): TransactionResult {
  const packet = instructions(root, selector) as { action_descriptor: Descriptor };
  return executePlanned(root, [command, selector, "--actor-kind", "agent", "--actor-name", "adaptive-driver"], packet.action_descriptor.availability.basis_sha256);
}

async function executeReceiptOnly(plan: Awaited<ReturnType<typeof planAdaptiveStart>>): Promise<void> {
  const receiptOperation = plan.writePlan.operations.find((operation) =>
    operation.relativePath?.startsWith("runs/current/receipts/"));
  assert.ok(receiptOperation);
  await executeWritePlan({
    operations: [receiptOperation],
    readPreconditions: plan.writePlan.readPreconditions,
  });
}

function executePlanned(root: string, base: string[], basis: string): TransactionResult {
  const preview = cliJson<TransactionResult>(root, [...base, "--dry-run"]).data;
  const planSha256 = preview?.identity.plan_sha256;
  assert.ok(planSha256);
  const execution = cliJson<TransactionResult>(root, [...base, "--expected-action-basis-sha256", basis, "--expected-plan-sha256", planSha256, "--yes"]).data;
  assert.ok(execution);
  return execution;
}

function adaptiveStatus(root: string): AdaptiveStatus {
  const data = cliJson<AdaptiveStatus>(root, ["status"]).data;
  assert.ok(data);
  return data;
}

function currentActions(root: string): Availability[] {
  const status = adaptiveStatus(root);
  return [...status.recommended_actions, ...status.allowed_actions];
}

function instructions(root: string, selector: string): unknown {
  const data = cliJson<unknown>(root, ["instructions", selector]).data;
  assert.ok(data);
  return data;
}

function cliJson<T>(root: string, args: string[]): Envelope<T> {
  const result = runCli([...args, "--json"], root);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const envelope = parseEnvelope<T>(result);
  assert.equal(envelope.ok, true, JSON.stringify(envelope.error));
  return envelope;
}

let payloadCounter = 0;
async function payloadFile(root: string, kind: string, payload: unknown): Promise<string> {
  payloadCounter += 1;
  const filePath = path.join(root, `${kind}-${String(payloadCounter)}.json`);
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return filePath;
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
