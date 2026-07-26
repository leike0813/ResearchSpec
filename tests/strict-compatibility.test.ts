import assert from "node:assert/strict";
import { test } from "node:test";

import type { WorkflowControlResult } from "../src/core/runtime/workflow-control.js";
import { projectStrictCompatibility } from "../src/core/runtime/strict-compatibility.js";
import { TEST_RUN_STATE, TEST_WORKFLOW } from "./helpers/test-workflow.js";

const SHA = "a".repeat(64);

void test("Schema 0.2 projects to read-only strict facts from evaluator readiness", () => {
  const control: WorkflowControlResult = {
    profile: "arsu-v0-1",
    state: "not_started",
    configured: true,
    valid: true,
    work_items: [],
    ready_items: [],
    stage_work_complete: false,
    transition_required: false,
    frontier: ["subflow:tpl-research"],
    startable_subflows: ["subflow:tpl-research"],
    subflows: [],
    parallel_groups: [],
    gates: [],
    transitions: [],
  };
  const beforeState = structuredClone(TEST_RUN_STATE);
  const beforeWorkflow = structuredClone(TEST_WORKFLOW);

  const projection = projectStrictCompatibility({
    runState: TEST_RUN_STATE,
    workflow: TEST_WORKFLOW,
    control,
    sourceHashes: {
      workflow: SHA,
      state: "b".repeat(64),
      registry: "c".repeat(64),
      gate_ledger: "d".repeat(64),
      decision_ledger: "e".repeat(64),
    },
  });

  assert.equal(projection.authority_source, "schema-0.2");
  assert.equal(projection.mode, "strict");
  assert.equal(projection.migrated, false);
  assert.equal(projection.profile.workflow_graph_ref.workflow_id, TEST_WORKFLOW.workflow_id);
  assert.deepEqual(projection.readiness.frontier, control.frontier);
  assert.deepEqual(projection.readiness.startable_subflows, control.startable_subflows);
  assert.deepEqual(TEST_RUN_STATE, beforeState);
  assert.deepEqual(TEST_WORKFLOW, beforeWorkflow);
  assert.equal("workspace" in projection, false);
});
