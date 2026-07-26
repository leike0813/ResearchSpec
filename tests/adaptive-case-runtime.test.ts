import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { parse } from "yaml";

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
      patch_format_version: "2",
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
    executePlanned(root, ["advance", patchSelector, "--actor-kind", "agent", "--actor-name", "academic-paper"], advancePacket.action_descriptor.availability.basis_sha256);
    const registry = JSON.parse(await readFile(path.join(root, "researchspec/runs/current/artifact-registry.json"), "utf8")) as { artifacts: Array<{ artifact_type: string }> };
    assert.ok(registry.artifacts.some((artifact) => artifact.artifact_type === "revised_draft"));
    assert.ok(registry.artifacts.some((artifact) => artifact.artifact_type === "apply_report"));
    assert.equal(registry.artifacts.some((artifact) => artifact.artifact_type === "revision_patch"), false);
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
  const payload = {
    schema_version: "1",
    instruction_basis_sha256: packet.action_descriptor.availability.basis_sha256,
    acknowledged_user_input_ids: [],
    prerequisite_artifact_ids: [],
    prerequisite_decision_ids: [],
    parent_subflow_selector: null,
  };
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

function decideCaseAction(root: string, selector: string): void {
  const packet = instructions(root, selector) as { action_descriptor: Descriptor };
  executePlanned(root, ["decide", selector, "--decision", "accept", "--actor-name", "Acceptance Researcher", "--reason", "Explicit obligation resolution approval"], packet.action_descriptor.availability.basis_sha256);
}

function executeNoInput(root: string, command: "advance", selector: string): TransactionResult {
  const packet = instructions(root, selector) as { action_descriptor: Descriptor };
  return executePlanned(root, [command, selector, "--actor-kind", "agent", "--actor-name", "adaptive-driver"], packet.action_descriptor.availability.basis_sha256);
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
