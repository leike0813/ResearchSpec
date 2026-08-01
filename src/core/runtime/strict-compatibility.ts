import { z } from "zod";

import { CaseSha256Schema } from "../contracts/case-state.js";
import { StrictCaseProfileSchema } from "../contracts/case-profile.js";
import { RunStateSchema, type RunState } from "../contracts/run-state.js";
import { WorkflowDefinitionSchema, type WorkflowDefinition } from "../contracts/workflow.js";
import type { WorkflowControlResult } from "./legacy-workflow-control.js";
import { createArsuStrictCaseProfile } from "../../arsu-converter/workflow/catalog.js";

const StrictReadinessStateSchema = z.enum([
  "unconfigured",
  "not_started",
  "blocked",
  "ready",
  "stage_work_complete",
  "gate_required",
  "transition_ready",
  "decision_required",
  "complete",
]);

export const StrictCompatibilityProjectionSchema = z.strictObject({
  schema_version: z.literal("1"),
  mode: z.literal("strict"),
  authority_source: z.literal("schema-0.2"),
  migrated: z.literal(false),
  profile: StrictCaseProfileSchema,
  source_hashes: z.record(z.string(), CaseSha256Schema),
  run: z.strictObject({
    run_id: z.string().min(1),
    workflow_id: z.string().min(1),
    lifecycle: z.string().min(1),
    subflow_instance_ids: z.array(z.string().min(1)),
  }),
  readiness: z.strictObject({
    state: StrictReadinessStateSchema,
    configured: z.boolean(),
    valid: z.boolean(),
    frontier: z.array(z.string().min(1)),
    startable_subflows: z.array(z.string().min(1)),
    ready_work_items: z.array(z.string().min(1)),
    gate_selectors: z.array(z.string().min(1)),
    transition_selectors: z.array(z.string().min(1)),
  }),
  strict_facts: z.strictObject({
    work_items: z.array(z.strictObject({
      selector: z.string().min(1),
      state: z.enum(["done", "ready", "blocked"]),
      missing_dependency_refs: z.array(z.string().min(1)),
    })),
    parallel_groups: z.array(z.strictObject({
      selector: z.string().min(1),
      state: z.enum(["satisfied", "pending"]),
      join_policy: z.enum(["all", "quorum"]),
    })),
    gates: z.array(z.strictObject({
      selector: z.string().min(1),
      state: z.enum(["blocked", "ready", "passed", "failed", "overridden"]),
    })),
    transitions: z.array(z.strictObject({
      selector: z.string().min(1),
      state: z.enum(["blocked", "ready", "decision_required", "advanced"]),
      effects: z.array(z.union([
        z.strictObject({ kind: z.literal("activate_stage"), stage_id: z.string().min(1) }),
        z.strictObject({ kind: z.literal("complete_subflow") }),
        z.strictObject({ kind: z.literal("complete_run") }),
      ])).min(1),
    })),
    accepted_artifacts: z.array(z.strictObject({
      selector: z.string().min(1),
      artifact_id: z.string().min(1),
    })),
    formal_gate_refs: z.array(z.strictObject({
      selector: z.string().min(1),
      event_id: z.string().min(1).nullable(),
      state: z.enum(["passed", "overridden"]),
    })),
    receipt_refs: z.array(z.strictObject({
      kind: z.enum(["subflow_start", "transition_advance"]),
      path: z.string().min(1),
      sha256: CaseSha256Schema,
      plan_sha256: CaseSha256Schema,
    })),
  }),
});

export interface StrictCompatibilityInput {
  runState: RunState;
  workflow: WorkflowDefinition;
  control: WorkflowControlResult;
  sourceHashes: Readonly<Record<string, string>>;
}

export function projectStrictCompatibility(input: StrictCompatibilityInput) {
  const runState = RunStateSchema.parse(input.runState);
  const workflow = WorkflowDefinitionSchema.parse(input.workflow);
  if (runState.workflow_id !== workflow.workflow_id) {
    throw new Error("Schema 0.2 run state and workflow identities differ.");
  }

  return StrictCompatibilityProjectionSchema.parse({
    schema_version: "1",
    mode: "strict",
    authority_source: "schema-0.2",
    migrated: false,
    profile: {
      ...createArsuStrictCaseProfile(input.sourceHashes.workflow ?? ""),
      profile_id: input.control.profile,
      workflow_graph_ref: {
        schema_version: "0.2",
        workflow_id: workflow.workflow_id,
        path: "specs/workflow.yaml",
        sha256: input.sourceHashes.workflow ?? "",
      },
    },
    source_hashes: input.sourceHashes,
    run: {
      run_id: runState.run_id,
      workflow_id: runState.workflow_id,
      lifecycle: runState.status,
      subflow_instance_ids: runState.subflows.map((item) => item.instance_id),
    },
    readiness: {
      state: input.control.state,
      configured: input.control.configured,
      valid: input.control.valid,
      frontier: input.control.frontier,
      startable_subflows: input.control.startable_subflows,
      ready_work_items: input.control.ready_items,
      gate_selectors: input.control.gates.filter((item) => item.state === "ready").map((item) => item.selector),
      transition_selectors: input.control.transitions
        .filter((item) => item.state === "ready" || item.state === "decision_required")
        .map((item) => item.selector),
    },
    strict_facts: {
      work_items: input.control.work_items.map((item) => ({
        selector: item.selector,
        state: item.state,
        missing_dependency_refs: item.missing_dependencies.map((dependency) => `${dependency.kind}:${dependency.id}`),
      })),
      parallel_groups: input.control.parallel_groups.map((item) => ({
        selector: item.selector,
        state: item.state,
        join_policy: item.join_policy,
      })),
      gates: input.control.gates.map((item) => ({ selector: item.selector, state: item.state })),
      transitions: input.control.transitions.map((item) => ({
        selector: item.selector,
        state: item.state,
        effects: item.effects,
      })),
      accepted_artifacts: input.control.work_items.flatMap((item) =>
        item.state === "done" && item.artifact_id
          ? [{ selector: item.selector, artifact_id: item.artifact_id }]
          : []
      ),
      formal_gate_refs: input.control.gates.flatMap((item) =>
        item.state === "passed" || item.state === "overridden"
          ? [{ selector: item.selector, event_id: item.latest_event_id ?? null, state: item.state }]
          : []
      ),
      receipt_refs: runState.subflows.flatMap((subflow) => [
        {
          kind: "subflow_start" as const,
          path: subflow.start_receipt.path,
          sha256: subflow.start_receipt.sha256,
          plan_sha256: subflow.start_receipt.plan_sha256,
        },
        ...subflow.transition_receipts.map((receipt) => ({
          kind: "transition_advance" as const,
          path: receipt.path,
          sha256: receipt.sha256,
          plan_sha256: receipt.plan_sha256,
        })),
      ]),
    },
  });
}

export type StrictCompatibilityProjection = z.infer<typeof StrictCompatibilityProjectionSchema>;
