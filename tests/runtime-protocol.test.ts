import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { parse, stringify } from "yaml";

import { cleanup, parseEnvelope, runCli, tempProject, type Envelope } from "./helpers/cli.js";

interface Page<T = Record<string, unknown>> {
  items: T[];
  page: { limit: number; total: number; next_cursor: string | null };
}

interface Availability {
  selector: string;
  disposition: "recommended" | "allowed" | "blocked";
  basis_sha256: string;
}

interface Descriptor {
  schema_version: string;
  selector: string;
  action_schema_ref: string;
  availability: Availability;
  cli_derived_fields: string[];
  semantic_input_slots: Array<{ field_path: string; expectation: string }>;
  minimal_input_template: Record<string, unknown> | null;
  execution_policy: "direct" | "human_confirmed" | "plan_bound";
  dry_run: "optional";
  possible_next_selectors: string[];
}

void test("descriptor v2 round-trips semantic Start input in adaptive and strict workspaces", async () => {
  for (const profile of ["adaptive", "strict"] as const) {
    const root = await tempProject();
    try {
      assert.equal(runCli(["init", root, "--tools", "none", "--profile", profile]).status, 0);
      const selector = "subflow:tpl-deep-research-quick";
      const packet = parseEnvelope<{ action_descriptor: Descriptor }>(
        runCli(["instructions", selector, "--json"], root),
      );
      assert.equal(packet.ok, true);
      assert.equal(packet.data?.action_descriptor.schema_version, "2");
      assert.equal(packet.data?.action_descriptor.execution_policy, "human_confirmed");
      assert.equal(packet.data?.action_descriptor.dry_run, "optional");
      assert.deepEqual(packet.data?.action_descriptor.minimal_input_template, {});
      assert.ok(packet.data?.action_descriptor.cli_derived_fields.includes("instruction_basis_sha256"));

      const mechanicalPath = path.join(root, `${profile}-mechanical.json`);
      await writeFile(mechanicalPath, `${JSON.stringify({
        schema_version: "1",
        instruction_basis_sha256: "0".repeat(64),
        acknowledged_user_input_ids: [],
        prerequisite_artifact_ids: [],
        prerequisite_decision_ids: [],
        parent_subflow_selector: null,
      })}\n`, "utf8");
      const rejected = runCli([
        "start", selector, "--input", mechanicalPath,
        "--actor-kind", "agent", "--actor-name", "round-trip",
        "--confirmed-by", "Researcher", "--dry-run", "--json",
      ], root);
      assert.equal(rejected.status, 2);
      assert.equal(parseEnvelope(rejected).error?.code, "invalid_start_input");
      assert.ok(parseEnvelope(rejected).error?.validation?.some((item) =>
        item.code === "unrecognized_key"
        && item.schema_ref === "researchspec://actions/start/v2"));

      const semanticPath = path.join(root, `${profile}-semantic.json`);
      await writeFile(semanticPath, "{}\n", "utf8");
      const executed = parseEnvelope<{ outcome: string }>(runCli([
        "start", selector, "--input", semanticPath,
        "--actor-kind", "agent", "--actor-name", "round-trip",
        "--confirmed-by", "Researcher", "--json",
      ], root));
      assert.equal(executed.ok, true);
      assert.ok(["started", "applied"].includes(executed.data?.outcome ?? ""));
    } finally {
      await cleanup(root);
    }
  }
});

void test("bounded runtime reads page long multi-round history and keep action surfaces consistent", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none", "--profile", "strict"]).status, 0);
    const workspace = path.join(root, "researchspec");
    await writeLongRunState(workspace, 32);
    for (let index = 0; index < 45; index += 1) {
      await writePendingChange(workspace, `long-${String(index).padStart(3, "0")}`);
    }

    const statusResult = runCli(["status", "--json"], root);
    assert.equal(statusResult.status, 0, statusResult.stderr || statusResult.stdout);
    const status = parseEnvelope<{
      recent_instance_ids: string[];
      pending: { change_ids: string[]; change_count: number };
      allowed_actions: Availability[];
      next_selectors: string[];
    }>(statusResult);
    assert.equal(status.data?.recent_instance_ids.length, 20);
    assert.equal(status.data?.pending.change_count, 45);
    assert.equal(status.data?.pending.change_ids.length, 20);
    assert.ok(status.data?.next_selectors.includes("list:history"));
    assert.ok(status.data?.next_selectors.includes("list:case-actions"));
    assert.equal(status.data && "workflow" in status.data, false);
    assert.equal(status.data && "workflow_control" in status.data, false);
    assert.equal(status.data && "history" in status.data, false);

    const history = collectPages<{ selector: string; value?: { round_number?: number | null } }>(root, "history", 11);
    assert.equal(history.length, 32);
    assert.equal(new Set(history.map((item) => item.selector)).size, history.length);
    assert.ok(history.some((item) => item.value?.round_number === 32));

    const firstChanges = listPage(root, "changes", 13);
    assert.equal(firstChanges.data?.items.length, 13);
    assert.equal(firstChanges.data?.page.total, 45);
    assert.ok(firstChanges.data?.page.next_cursor);
    const firstCursor = firstChanges.data?.page.next_cursor ?? "";
    const secondChanges = listPage(root, "changes", 13, firstCursor);
    assert.equal(secondChanges.data?.items.length, 13);
    assert.equal(
      new Set([
        ...(firstChanges.data?.items ?? []).map(selectorOf),
        ...(secondChanges.data?.items ?? []).map(selectorOf),
      ]).size,
      26,
    );

    const wrongCollection = runCli(["list", "artifacts", "--cursor", firstCursor, "--json"], root);
    assert.equal(wrongCollection.status, 2);
    assert.equal(parseEnvelope(wrongCollection).error?.code, "page_cursor_invalid");
    await writePendingChange(workspace, "long-045");
    const stale = runCli(["list", "changes", "--cursor", firstCursor, "--json"], root);
    assert.equal(stale.status, 3);
    assert.equal(parseEnvelope(stale).error?.code, "page_cursor_stale");

    const caseActions = listPage(root, "case-actions", 50);
    assert.equal(caseActions.data?.page.total, 46);
    assert.equal(caseActions.data?.items.length, 46);

    const selector = "change:long-000";
    const statusAvailability = status.data?.allowed_actions.find((item) => item.selector === selector);
    assert.ok(statusAvailability);
    const instructions = parseEnvelope<{ action_descriptor: Descriptor }>(
      runCli(["instructions", selector, "--json"], root),
    );
    assert.equal(instructions.ok, true);
    const actions = listPage<Descriptor>(root, "actions", 50);
    const listed = actions.data?.items.find((item) => item.selector === selector);
    assert.ok(listed);
    assert.deepEqual(instructions.data?.action_descriptor.availability, statusAvailability);
    assert.deepEqual(listed?.availability, statusAvailability);
    assert.ok(listed?.possible_next_selectors.includes("list:actions"));

    const proposal = parseEnvelope<{ action_descriptor: Descriptor }>(
      runCli(["instructions", "change:new-proposal", "--json"], root),
    );
    assert.equal(proposal.ok, true);
    assert.equal(proposal.data?.action_descriptor.action_schema_ref, "researchspec://actions/propose/v2");
    assert.ok(proposal.data?.action_descriptor.semantic_input_slots.some((slot) => slot.field_path === "/patches"));
    assert.equal("schema_version" in (proposal.data?.action_descriptor.minimal_input_template ?? {}), false);
  } finally {
    await cleanup(root);
  }
});

void test("write protocol rejects stale descriptors and reports stable schema violations", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    await writeFile(
      path.join(workspace, "specs/claims.yaml"),
      'schema_version: "0.1"\nclaims:\n  - claim_id: C001\n    strength: strong\n',
      "utf8",
    );
    const payload = proposalPayload();
    const payloadPath = path.join(root, "proposal.json");
    await writeFile(payloadPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

    const staleInstructions = parseEnvelope<{ action_descriptor: Descriptor }>(
      runCli(["instructions", "change:stale", "--json"], root),
    );
    const staleBasis = staleInstructions.data?.action_descriptor.availability.basis_sha256 ?? "";
    const gateLedger = path.join(workspace, "runs/current/gate-ledger.jsonl");
    await writeFile(gateLedger, `${await readFile(gateLedger, "utf8")}\n`, "utf8");
    const stale = runCli([
      "propose", "stale",
      "--input", payloadPath,
      "--actor-kind", "agent",
      "--actor-name", "reviewer",
      "--expected-action-basis-sha256", staleBasis,
      "--dry-run",
      "--json",
    ], root);
    assert.equal(stale.status, 3);
    assert.equal(parseEnvelope(stale).error?.code, "action_basis_stale");

    const invalidPath = path.join(root, "invalid-proposal.json");
    await writeFile(invalidPath, "{}\n", "utf8");
    const invalidProposal = runCli([
      "propose", "invalid",
      "--input", invalidPath,
      "--actor-kind", "agent",
      "--actor-name", "reviewer",
      "--dry-run",
      "--json",
    ], root);
    assert.equal(invalidProposal.status, 2);
    const proposalError = parseEnvelope(invalidProposal).error;
    assert.equal(proposalError?.code, "invalid_proposal_input");
    assert.ok(proposalError?.validation?.some((item) =>
      item.code === "required"
      && item.field_path === "/title"
      && item.schema_ref === "researchspec://actions/propose/v2"
      && item.expectation.length > 0));

    await writePendingChange(workspace, "pending-decision", payload);
    const invalidDecision = runCli([
      "decide", "change:pending-decision",
      "--decision", "accept",
      "--actor-name", "Researcher",
      "--dry-run",
      "--json",
    ], root);
    assert.equal(invalidDecision.status, 2);
    const decisionError = parseEnvelope(invalidDecision).error;
    assert.equal(decisionError?.code, "invalid_decision_input");
    assert.ok(decisionError?.validation?.some((item) =>
      item.code === "required"
      && item.field_path === "/reason"
      && item.schema_ref === "researchspec://actions/decide/v2"
      && item.expectation.length > 0));

    const preview = parseEnvelope<Record<string, unknown>>(runCli([
      "propose", "compact-preview",
      "--input", payloadPath,
      "--actor-kind", "agent",
      "--actor-name", "reviewer",
      "--dry-run",
      "--json",
    ], root));
    assert.equal(preview.ok, true);
    assert.equal(preview.data?.schema_version, "1");
    assert.equal(preview.data && "identity" in preview.data, true);
    assert.equal(preview.data && "effects" in preview.data, true);
    assert.equal(preview.data && "next_selectors" in preview.data, true);
    for (const unbounded of ["workflow", "workflow_control", "run", "plan", "operations", "writes"]) {
      assert.equal(preview.data && unbounded in preview.data, false);
    }
  } finally {
    await cleanup(root);
  }
});

function collectPages<T>(root: string, type: string, limit: number): T[] {
  const items: T[] = [];
  let cursor: string | null = null;
  do {
    const page: Envelope<Page<T>> = listPage<T>(root, type, limit, cursor ?? undefined);
    assert.equal(page.ok, true);
    items.push(...(page.data?.items ?? []));
    cursor = page.data?.page.next_cursor ?? null;
  } while (cursor);
  return items;
}

function listPage<T = Record<string, unknown>>(
  root: string,
  type: string,
  limit: number,
  cursor?: string,
): Envelope<Page<T>> {
  return parseEnvelope<Page<T>>(runCli([
    "list", type,
    "--limit", String(limit),
    ...(cursor ? ["--cursor", cursor] : []),
    "--json",
  ], root));
}

async function writeLongRunState(workspace: string, count: number): Promise<void> {
  const workflow = object(parse(await readFile(path.join(workspace, "specs/workflow.yaml"), "utf8")));
  const templates = Array.isArray(workflow.subflow_templates)
    ? workflow.subflow_templates.map(object)
    : [];
  const template = templates.find((item) => typeof item.route_ref === "string");
  assert.ok(template);
  const statePath = path.join(workspace, "runs/current/state.yaml");
  const state = object(parse(await readFile(statePath, "utf8")));
  const zero = "0".repeat(64);
  state.status = "in_progress";
  state.started_at = "2026-01-01T00:00:00.000Z";
  state.updated_at = "2026-02-01T00:00:00.000Z";
  state.subflows = Array.from({ length: count }, (_, index) => {
    const instanceId = `sf-history-${String(index + 1).padStart(3, "0")}`;
    return {
      instance_id: instanceId,
      template_id: String(template.template_id),
      route_ref: String(template.route_ref),
      parent_subflow_id: null,
      parent_node_id: null,
      round_number: index + 1,
      status: "complete",
      active_stage_id: String(template.entry_stage_id),
      acknowledged_user_input_ids: [],
      prerequisite_artifact_ids: [],
      prerequisite_decision_ids: [],
      start_receipt: {
        path: `runs/current/receipts/subflow-start/${instanceId}.json`,
        sha256: zero,
        plan_sha256: zero,
      },
      transition_receipts: [],
      started_at: new Date(Date.UTC(2026, 0, 1, index)).toISOString(),
    };
  });
  await writeFile(statePath, stringify(state), "utf8");
}

async function writePendingChange(
  workspace: string,
  changeId: string,
  payload: ReturnType<typeof proposalPayload> = proposalPayload(),
): Promise<void> {
  const directory = path.join(workspace, "changes", changeId);
  await mkdir(directory, { recursive: true });
  const patch = {
    schema_version: "0.1",
    change_id: changeId,
    title: payload.title,
    status: "proposed",
    created_at: "2026-07-26T00:00:00.000Z",
    created_by: { kind: "agent", name: "runtime-protocol-test" },
    rationale: payload.rationale,
    risk_level: payload.risk_level,
    requires_human_decision: true,
    impact: payload.impact,
    validation: {
      validated_at: "2026-07-26T00:00:00.000Z",
      target_hashes: { "specs/claims.yaml": "0".repeat(64) },
      artifact_ids: [],
      decision_ids: [],
    },
    patches: payload.patches.map((operation, index) => ({
      patch_id: `${changeId}-${String(index + 1)}`,
      ...operation,
    })),
  };
  await writeFile(path.join(directory, "contract-patch.yaml"), stringify(patch), "utf8");
}

function proposalPayload() {
  return {
    title: "Refine claim strength",
    rationale: "Keep the claim within the accepted evidence boundary.",
    risk_level: "high" as const,
    impact: ["Changes permitted claim wording."],
    patches: [{
      target_contract: "specs/claims.yaml" as const,
      operation: "replace" as const,
      target_path: "claims[C001].strength",
      current_value: "strong",
      proposed_value: "moderate",
      reason: "The evidence supports a narrower claim.",
      source_artifact_ids: [],
      source_decision_ids: [],
    }],
  };
}

function selectorOf(value: unknown): string {
  const selector = object(value).selector;
  return typeof selector === "string" ? selector : "";
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}
