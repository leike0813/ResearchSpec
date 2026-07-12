import assert from "node:assert/strict";
import { test } from "node:test";
import { parse } from "yaml";

import { ARSU_V0_1_WORKFLOW, validateArsuWorkflowCatalog } from "../src/arsu-converter/workflow/catalog.js";
import { DEFAULT_WORKFLOW_PROFILE_ID, WORKFLOW_PROFILE_IDS, WorkflowDefinitionSchema } from "../src/core/contracts/workflow.js";
import { RunStateSchema } from "../src/core/contracts/run-state.js";
import { getWorkspaceTemplates } from "../src/core/workspace/layout.js";

void test("arsu-v0-1 is the only current profile and covers the generated routing catalog", () => {
  assert.deepEqual(WORKFLOW_PROFILE_IDS, ["arsu-v0-1"]);
  assert.equal(DEFAULT_WORKFLOW_PROFILE_ID, "arsu-v0-1");
  assert.deepEqual(validateArsuWorkflowCatalog(), []);
  assert.equal(WorkflowDefinitionSchema.safeParse(ARSU_V0_1_WORKFLOW).success, true);
});

void test("workspace templates emit only the current workflow and run-state contracts", () => {
  const templates = getWorkspaceTemplates();
  const workflow = WorkflowDefinitionSchema.parse(parse(templates.find((item) => item.relativePath === "specs/workflow.yaml")?.content ?? "") as unknown);
  const state = RunStateSchema.parse(parse(templates.find((item) => item.relativePath === "runs/current/state.yaml")?.content ?? "") as unknown);
  assert.equal(WorkflowDefinitionSchema.safeParse(workflow).success, true);
  assert.equal(RunStateSchema.safeParse(state).success, true);
  assert.equal("active_stage_id" in state, false);
  assert.deepEqual(state.material_passport_imports, []);
});
