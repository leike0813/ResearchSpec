import assert from "node:assert/strict";
import { test } from "node:test";
import { parse } from "yaml";

import {
  ARSU_ADAPTIVE_PLAYBOOK,
  ARSU_V0_1_WORKFLOW,
  createArsuAdaptiveProfile,
  createArsuStrictCaseProfile,
  validateArsuWorkflowCatalog,
} from "../src/arsu-converter/workflow/catalog.js";
import { CaseProfileSchema, SoftPlaybookSchema } from "../src/core/contracts/case-profile.js";
import { CaseStateSchema } from "../src/core/contracts/case-state.js";
import { DEFAULT_WORKFLOW_PROFILE_ID, WORKFLOW_PROFILE_IDS, WorkflowDefinitionSchema } from "../src/core/contracts/workflow.js";
import { RunStateSchema } from "../src/core/contracts/run-state.js";
import { getWorkspaceTemplates } from "../src/core/workspace/layout.js";

void test("ARSU strict and adaptive projections cover the generated routing catalog", () => {
  assert.deepEqual(WORKFLOW_PROFILE_IDS, ["arsu-v0-1"]);
  assert.equal(DEFAULT_WORKFLOW_PROFILE_ID, "arsu-v0-1");
  assert.deepEqual(validateArsuWorkflowCatalog(), []);
  assert.equal(WorkflowDefinitionSchema.safeParse(ARSU_V0_1_WORKFLOW).success, true);
  const adaptive = createArsuAdaptiveProfile("0".repeat(64));
  const strict = createArsuStrictCaseProfile("1".repeat(64));
  assert.equal(CaseProfileSchema.safeParse(adaptive).success, true);
  assert.equal(CaseProfileSchema.safeParse(strict).success, true);
  assert.equal(adaptive.routes.length, 27);
  assert.equal(new Set(adaptive.routes.map((item) => item.route_ref)).size, 27);
  const independent = adaptive.obligations.filter((item) =>
    item.obligation_id === "deep-research-quick--research-brief"
    || item.obligation_id === "deep-research-quick--bibliography");
  assert.equal(independent.length, 2);
  assert.ok(independent.every((item) => item.dependencies.length === 0));
  const revisionRoute = adaptive.routes.find((item) => item.route_ref === "academic-paper:revision");
  assert.ok(revisionRoute);
  assert.equal(revisionRoute?.obligation_ids.some((id) => id.endsWith("--revision-patch")), false);
  const strictRevision = ARSU_V0_1_WORKFLOW.subflow_templates.find((item) => item.route_ref === "academic-paper:revision");
  assert.equal(strictRevision?.work_items.some((item) => item.output.artifact_type === "revision_patch"), false);
  assert.equal(strictRevision?.work_items.some((item) => item.output.artifact_type === "annotation_resolution_report"), false);
  const midEntry = ARSU_V0_1_WORKFLOW.subflow_templates.find((item) => item.route_ref === "academic-pipeline:mid-entry");
  const annotatedRevision = midEntry?.transitions.find((item) => item.id === "enter-annotated-revision");
  assert.deepEqual(annotatedRevision?.requires.artifact_types, ["paper_draft", "annotation_set"]);
  assert.equal(annotatedRevision?.branch?.option_id, "annotated-revision");
  assert.equal(SoftPlaybookSchema.safeParse(ARSU_ADAPTIVE_PLAYBOOK).success, true);
});

void test("workspace templates default to adaptive and preserve explicit strict authority", () => {
  const templates = getWorkspaceTemplates();
  const adaptiveProfile = CaseProfileSchema.parse(parse(templates.find((item) => item.relativePath === "specs/workflow.yaml")?.content ?? "") as unknown);
  const adaptiveState = CaseStateSchema.parse(parse(templates.find((item) => item.relativePath === "runs/current/state.yaml")?.content ?? "") as unknown);
  const playbook = SoftPlaybookSchema.parse(parse(templates.find((item) => item.relativePath === "playbooks/arsu-adaptive.yaml")?.content ?? "") as unknown);
  assert.equal(adaptiveProfile.mode, "adaptive");
  assert.equal(adaptiveState.profile_mode, "adaptive");
  assert.deepEqual(adaptiveState.obligations, []);
  assert.ok(playbook.recommended_steps.length > 27);
  assert.equal("recommended_steps" in adaptiveState, false);
  assert.equal(templates.find((item) => item.relativePath === "playbooks/arsu-adaptive.yaml")?.required, false);

  const strictTemplates = getWorkspaceTemplates("strict");
  const strictWorkflow = WorkflowDefinitionSchema.parse(parse(strictTemplates.find((item) => item.relativePath === "specs/workflow.yaml")?.content ?? "") as unknown);
  const strictState = RunStateSchema.parse(parse(strictTemplates.find((item) => item.relativePath === "runs/current/state.yaml")?.content ?? "") as unknown);
  assert.equal(WorkflowDefinitionSchema.safeParse(strictWorkflow).success, true);
  assert.equal(RunStateSchema.safeParse(strictState).success, true);
  assert.equal("active_stage_id" in strictState, false);
  assert.deepEqual(strictState.material_passport_imports, []);
});
