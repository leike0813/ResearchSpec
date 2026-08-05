import assert from "node:assert/strict";
import { mkdir, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { ACADEMIC_PIPELINE_PROFILE } from "../src/arsu-converter/workflow/academic-pipeline.js";
import { ControlSelectorSchema, InspectionSelectorSchema } from "../src/core/contracts/control-selector.js";
import { PipelineProfileSchema } from "../src/core/contracts/pipeline-profile.js";
import { ProjectChangeDeltaSchema, ProjectChangeFrontmatterSchema } from "../src/core/contracts/project-change.js";
import { ClaimsSpecSchema, ManuscriptSpecSchema, SourcesSpecSchema, parseProjectSpec } from "../src/core/contracts/stable-specs.js";
import { SubflowControlSchema } from "../src/core/contracts/subflow-control.js";
import { SubflowHandoffSchema } from "../src/core/contracts/subflow-handoff.js";
import { CurrentWorkspaceConfigSchema } from "../src/core/contracts/workspace-format.js";
import { BoundaryPathError, resolveBoundaryPath } from "../src/core/runtime/boundary-path.js";
import { cleanup, tempProject } from "./helpers/cli.js";

const NOW = "2026-08-01T12:00:00+08:00";

void test("current workspace contracts accept empty stable skeletons", () => {
  assert.equal(CurrentWorkspaceConfigSchema.safeParse({ schema_version: "1", agent_tools: { selected: [], delivery: "both" }, literature_adapters: { selected: [] }, plugins: { selected: [] } }).success, true);
  assert.equal(CurrentWorkspaceConfigSchema.safeParse({ schema_version: "1", agent_tools: { selected: [], delivery: "both" }, plugins: { selected: [] } }).success, false);
  assert.equal(SourcesSpecSchema.safeParse({ schema_version: "1", sources: [] }).success, true);
  assert.equal(ClaimsSpecSchema.safeParse({ schema_version: "1", claims: [] }).success, true);
  const manuscript = { schema_version: "1", manuscript_id: "manuscript", output_type: null, working_title: null, language: null, audience: null, venue: null, citation_requirements: [], format_requirements: [], delivery: { working_format: null, final_output_format: null }, outline: [] };
  assert.equal(ManuscriptSpecSchema.safeParse(manuscript).success, true);
  assert.equal(ManuscriptSpecSchema.safeParse({ ...manuscript, delivery: { working_format: "markdown", final_output_format: null } }).success, true);
  assert.equal(ManuscriptSpecSchema.safeParse({ ...manuscript, delivery: { working_format: "qmd", final_output_format: "pdf" } }).success, true);
  assert.equal(ManuscriptSpecSchema.safeParse({ ...manuscript, delivery: { working_format: "qmd", final_output_format: null } }).success, false);
  assert.equal(ManuscriptSpecSchema.safeParse({ ...manuscript, delivery: { working_format: "qmd", final_output_format: "../pdf" } }).success, false);
  assert.equal(parseProjectSpec("---\nschema_version: \"1\"\nproject_id: project\n---\n\n# Project intent\n").frontmatter.project_id, "project");
});

void test("pipeline profile and local subflow authority reject duplicate or leaked facts", () => {
  assert.equal(PipelineProfileSchema.safeParse(ACADEMIC_PIPELINE_PROFILE).success, true);
  const control = {
    schema_version: "1",
    instance_id: "sf-revision-1",
    route_ref: "academic-paper:revision",
    skill_id: "academic-paper",
    mode_id: "revision",
    profile: { id: "academic-pipeline", version: "1", path: "profiles/academic-pipeline.yaml" },
    parent: { instance_id: "sf-pipeline", node_id: "revision" },
    round: 1,
    started_at: NOW,
    start_confirmation: { confirmed_by: "user", confirmed_at: NOW, prerequisites: ["current-manuscript"], expected_outputs: ["revised-manuscript"], formal_gates: ["revision-completeness"], cost: { effort: "high", interaction: "iterative" } },
    status: "active",
    checkpoint: "revise",
    gates: [],
    decisions: [],
    transitions: [],
  };
  assert.equal(SubflowControlSchema.safeParse(control).success, true);
  assert.equal(SubflowControlSchema.safeParse({ ...control, parent: null, round: undefined }).success, true);
  assert.equal(SubflowControlSchema.safeParse({ ...control, artifact_registry: [] }).success, false);
  assert.equal(SubflowControlSchema.safeParse({ ...control, profile: null }).success, false);
  assert.equal(SubflowControlSchema.safeParse({ ...control, decisions: [
    { decision_id: "d-1", kind: "branch", choice: "revision", decided_by: "user", decided_at: NOW },
    { decision_id: "d-1", kind: "branch", choice: "accepted", decided_by: "user", decided_at: NOW },
  ] }).success, false);
  assert.equal(SubflowControlSchema.safeParse({ ...control, gates: [{ gate_id: "review", attempts: [
    { attempt_id: "attempt-1", verdict: "fail", confirmed_by: "user", confirmed_at: NOW, summary: "gap" },
    { attempt_id: "attempt-1", verdict: "pass", confirmed_by: "user", confirmed_at: NOW, summary: "fixed" },
  ] }] }).success, false);

  const invalidProfile = structuredClone(ACADEMIC_PIPELINE_PROFILE);
  invalidProfile.children[0]?.prerequisites.push("missing-child");
  invalidProfile.transitions[0]?.required_gate_ids.push("missing-gate");
  assert.equal(PipelineProfileSchema.safeParse(invalidProfile).success, false);
});

void test("handoff and project change contracts preserve single ownership", () => {
  assert.equal(SubflowHandoffSchema.safeParse({ schema_version: "1", subflow_instance_id: "sf-one", updated_at: NOW, inputs: [], outputs: [{ role: "current-manuscript", type: "manuscript", path: "paper/manuscript.md", purpose: "independent review" }] }).success, true);
  assert.equal(SubflowHandoffSchema.safeParse({ schema_version: "1", subflow_instance_id: "sf-one", updated_at: NOW, inputs: [{ role: "qmd-source", type: "manuscript", path: "paper/manuscript.qmd", purpose: "render", format: "qmd" }], outputs: [{ role: "rendered-manuscript", type: "manuscript", path: "paper/manuscript.pdf", purpose: "submit", format: "pdf", renderer: "quarto" }] }).success, true);
  assert.equal(SubflowHandoffSchema.safeParse({ schema_version: "1", subflow_instance_id: "sf-one", updated_at: NOW, inputs: [{ role: "qmd-source", type: "manuscript", path: "paper/manuscript.md", purpose: "render", format: "qmd" }], outputs: [] }).success, false);
  assert.equal(SubflowHandoffSchema.safeParse({ schema_version: "1", subflow_instance_id: "sf-one", updated_at: NOW, inputs: [], outputs: [{ role: "rendered-manuscript", type: "manuscript", path: "paper/manuscript.pdf", purpose: "submit", renderer: "quarto" }] }).success, false);
  assert.equal(SubflowHandoffSchema.safeParse({ schema_version: "1", subflow_instance_id: "sf-one", updated_at: NOW, inputs: [], outputs: [
    { role: "draft", type: "manuscript", path: "paper/a.md", purpose: "review" },
    { role: "draft", type: "manuscript", path: "paper/b.md", purpose: "review" },
  ] }).success, false);
  assert.equal(ProjectChangeFrontmatterSchema.safeParse({ schema_version: "1", id: "narrow-claim", status: "accepted", targets: ["claims.yaml"], decision: { outcome: "accepted", decided_by: "user", decided_at: NOW, reason: "Evidence supports a narrower claim." } }).success, true);
  assert.equal(ProjectChangeFrontmatterSchema.safeParse({ schema_version: "1", id: "narrow-claim", status: "draft", targets: ["claims.yaml"] }).success, true);
  assert.equal(ProjectChangeFrontmatterSchema.safeParse({ schema_version: "1", id: "narrow-claim", status: "proposed", targets: ["claims.yaml", "claims.yaml"] }).success, false);
  assert.equal(ProjectChangeFrontmatterSchema.safeParse({ schema_version: "1", id: "narrow-claim", status: "applied", targets: ["claims.yaml"], decision: { outcome: "rejected", decided_by: "user", decided_at: NOW, reason: "No." } }).success, false);
  assert.equal(ProjectChangeDeltaSchema.safeParse({ schema_version: "1", operations: [{ operation: "remove", target: "claims", id: "claim-1", value: { wording: "leak" } }] }).success, false);
  assert.equal(ProjectChangeDeltaSchema.safeParse({ schema_version: "1", operations: [{ operation: "add", target: "sources", id: "source-1", value: { source_id: "different", title: "Source", source_type: "article" } }] }).success, false);
  assert.equal(ProjectChangeDeltaSchema.safeParse({ schema_version: "1", operations: [
    { operation: "remove", target: "claims", id: "claim-1" },
    { operation: "remove", target: "claims", id: "claim-1" },
  ] }).success, false);
});

void test("current selectors require explicit immutable IDs", () => {
  for (const selector of ["route:academic-paper:revision", "subflow:sf-revision-1", "gate:sf-revision-1/revision-completeness", "decision:sf-revision-1/revision-outcome", "change:narrow-claim", "handoff:sf-revision-1"]) {
    assert.equal(ControlSelectorSchema.safeParse(selector).success, true, selector);
  }
  for (const selector of ["latest", "subflow:../current", "gate:recent", "handoff:paper/manuscript.md"]) assert.equal(ControlSelectorSchema.safeParse(selector).success, false, selector);
  for (const selector of ["spec:project", "spec:sources", "spec:claims", "spec:manuscript", "profile:academic-pipeline", "tool:codex"]) assert.equal(InspectionSelectorSchema.safeParse(selector).success, true, selector);
});

void test("external boundary paths reject escape, managed paths and existing symlink components", { skip: process.platform === "win32" }, async () => {
  const root = await tempProject();
  try {
    await mkdir(path.join(root, "outputs"), { recursive: true });
    await writeFile(path.join(root, "outputs/input.md"), "input\n", "utf8");
    assert.equal((await resolveBoundaryPath(root, "outputs/future.md")).relativePath, "outputs/future.md");
    assert.equal((await resolveBoundaryPath(root, "outputs/input.md", "consume-input")).relativePath, "outputs/input.md");
    for (const candidate of ["../outside.md", path.join(root, "absolute.md"), "researchspec/subflows/leak.md"]) {
      await assert.rejects(resolveBoundaryPath(root, candidate), BoundaryPathError);
    }
    await symlink(path.join(root, "outputs"), path.join(root, "linked"));
    await assert.rejects(resolveBoundaryPath(root, "linked/future.md"), (error: unknown) => error instanceof BoundaryPathError && error.code === "boundary_path_symlink");
    await assert.rejects(resolveBoundaryPath(root, "outputs/missing.md", "consume-input"), (error: unknown) => error instanceof BoundaryPathError && error.code === "boundary_input_missing");
  } finally { await cleanup(root); }
});
