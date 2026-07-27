import assert from "node:assert/strict";
import { cp, lstat, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { prepareMaterialPassportImport } from "../src/core/runtime/material-passport-import.js";
import { buildSubflowInstructions, executeSubflowStart, planSubflowStart, SubflowStartError } from "../src/core/runtime/subflow-control.js";
import { evaluateWorkflowControl } from "../src/core/runtime/workflow-control.js";
import { getWorkspaceEntries } from "../src/core/workspace/layout.js";
import { loadWorkspaceSnapshot } from "../src/core/workspace/snapshot.js";
import { sha256 } from "../src/core/workspace/write-plan.js";
import { parseEnvelope, runCli } from "./helpers/cli.js";

const fixture = path.resolve("tests/fixtures/material-passport/schema9.yaml");
const selector = "subflow:tpl-academic-pipeline-mid-entry";

void test("Material Passport import projects evidence and runtime context without granting authority", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    const passportPath = path.join(root, "passports/material_passport.yaml");
    const artifactPath = path.join(root, "artifacts/paper.md");
    await mkdir(path.dirname(passportPath), { recursive: true });
    await mkdir(path.dirname(artifactPath), { recursive: true });
    await cp(fixture, passportPath);
    await writeFile(artifactPath, "# Imported paper\n", "utf8");
    const passportBytes = await readFile(passportPath);
    const artifactBytes = await readFile(artifactPath);
    const snapshot = await loadWorkspaceSnapshot(workspace);
    const instructions = await buildSubflowInstructions(snapshot, selector);
    assert.equal(instructions.ok, true);
    if (!instructions.ok) throw new Error("mid-entry instructions unavailable");
    const payload = {
      material_passport_import: { kind: "ars-material-passport", passport_path: "passports/material_passport.yaml", expected_passport_sha256: sha256(passportBytes), boundary_hash: "a3f2b7c9d0e1", accompanied_artifact: { path: "artifacts/paper.md", artifact_type: "paper_draft", expected_sha256: sha256(artifactBytes) } },
    };
    const plan = await planSubflowStart({ snapshot, selector, payload, actor: { kind: "agent", name: "academic-pipeline" }, confirmedBy: "researcher", sourceRoot: root, now: "2026-07-11T09:00:00.000Z" });
    assert.equal(plan.material_passport_import?.artifact_ids.length, 3);
    assert.equal(plan.material_passport_import?.gate_evidence_ids.length, 3);
    assert.equal(plan.material_passport_import?.decision_evidence_ids.length, 2);
    assert.equal(await exists(path.join(workspace, `runs/current/imports/material-passports/${sha256(passportBytes)}.yaml`)), false);
    await executeSubflowStart(plan, workspace);

    const imported = await loadWorkspaceSnapshot(workspace);
    assert.ok(imported.runState);
    if (!imported.runState) throw new Error("run state missing");
    assert.equal(imported.runState.material_passport_imports.length, 1);
    assert.equal(imported.runState.resume_candidate?.status, "awaiting_current_confirmation");
    assert.ok(imported.gates.every((item) => item.authority === "imported_evidence" && item.verdict === "not_run"));
    assert.ok(imported.decisions.every((item) => item.authority === "imported_evidence" && item.status === "observed"));
    const control = await evaluateWorkflowControl(imported);
    assert.ok(control.transitions.filter((item) => item.subflow_instance_id === plan.instance.instance_id).every((item) => item.state !== "ready"));
    const instanceInstructions = await buildSubflowInstructions(imported, `subflow:${plan.instance.instance_id}`);
    assert.equal(instanceInstructions.ok, true);
    if (instanceInstructions.ok) {
      assert.equal(instanceInstructions.packet.runtime_context.imports.length, 1);
      assert.equal(instanceInstructions.packet.runtime_context.artifacts.length, 3);
      assert.ok(instanceInstructions.packet.runtime_context.diagnostics.includes("material_passport_unknown_field"));
      assert.equal(JSON.stringify(instanceInstructions.packet.runtime_context).includes("unknown_extension"), false);
    }
    assert.equal((await lstat(passportPath)).isFile(), true);
    assert.deepEqual(await readFile(passportPath), passportBytes);

    const retried = await planSubflowStart({ snapshot: imported, selector, payload, actor: { kind: "agent", name: "academic-pipeline" }, confirmedBy: "researcher", expectedPlanSha256: plan.plan_sha256, sourceRoot: root });
    assert.equal(retried.status, "already_started");
    const laterInstructions = await buildSubflowInstructions(imported, selector);
    assert.equal(laterInstructions.ok, true);
    if (laterInstructions.ok) {
      await assert.rejects(() => planSubflowStart({ snapshot: imported, selector, payload, actor: { kind: "agent", name: "academic-pipeline" }, confirmedBy: "researcher", sourceRoot: root }), (error: unknown) => error instanceof SubflowStartError && error.code === "material_passport_import_conflict");
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("Material Passport loader rejects hash drift, Markdown, symlinks and path escape", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    const snapshot = await loadWorkspaceSnapshot(workspace);
    const markdown = path.join(root, "passport.md");
    await writeFile(markdown, "# Material Passport\n", "utf8");
    await assert.rejects(() => prepareMaterialPassportImport(snapshot, { kind: "ars-material-passport", passport_path: "passport.md", expected_passport_sha256: sha256("# Material Passport\n") }, root), /JSON or YAML/);
    const passport = path.join(root, "passport.yaml");
    await cp(fixture, passport);
    const passportHash = sha256(await readFile(passport));
    await assert.rejects(() => prepareMaterialPassportImport(snapshot, { kind: "ars-material-passport", passport_path: "passport.yaml", expected_passport_sha256: "0".repeat(64) }, root), /hash differs/);
    const link = path.join(root, "passport-link.yaml");
    await symlink(passport, link);
    await assert.rejects(() => prepareMaterialPassportImport(snapshot, { kind: "ars-material-passport", passport_path: "passport-link.yaml", expected_passport_sha256: passportHash }, root), /non-symlink/);
    await assert.rejects(() => prepareMaterialPassportImport(snapshot, { kind: "ars-material-passport", passport_path: "../outside.yaml", expected_passport_sha256: "0".repeat(64) }, root), /unavailable|project root/);
    const jsonPath = path.join(root, "passport.json");
    await writeFile(jsonPath, JSON.stringify({ origin_skill: "academic-paper", origin_mode: "full", origin_date: "2026-07-11T00:00:00Z", verification_status: "UNVERIFIED", version_label: "v1" }), "utf8");
    const json = await prepareMaterialPassportImport(snapshot, { kind: "ars-material-passport", passport_path: "passport.json", expected_passport_sha256: sha256(await readFile(jsonPath)) }, root);
    assert.equal(json.passport.version_label, "v1");
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("Material Passport import is rejected outside the mid-entry route", async () => {
  const root = await createWorkspace();
  try {
    const workspace = path.join(root, "researchspec");
    const passportPath = path.join(root, "passport.yaml");
    await cp(fixture, passportPath);
    const passportHash = sha256(await readFile(passportPath));
    const snapshot = await loadWorkspaceSnapshot(workspace);
    const direct = "subflow:tpl-deep-research-quick";
    const instructions = await buildSubflowInstructions(snapshot, direct);
    assert.equal(instructions.ok, true);
    if (!instructions.ok) return;
    await assert.rejects(() => planSubflowStart({ snapshot, selector: direct, payload: { material_passport_import: { kind: "ars-material-passport", passport_path: "passport.yaml", expected_passport_sha256: passportHash } }, actor: { kind: "agent", name: "deep-research" }, confirmedBy: "researcher", sourceRoot: root }), (error: unknown) => error instanceof SubflowStartError && error.code === "invalid_start_input");
  } finally { await rm(root, { recursive: true, force: true }); }
});

void test("[journey.resume-passport] public CLI imports a passport and resumes from ResearchSpec context", async () => {
  const root = await createWorkspace();
  try {
    const passportPath = path.join(root, "passport.yaml");
    await cp(fixture, passportPath);
    const instructionResult = parseEnvelope<{ instruction_basis_sha256: string; action_descriptor: { availability: { basis_sha256: string } } }>(runCli(["instructions", selector, "--json"], root));
    assert.equal(instructionResult.ok, true);
    const inputPath = path.join(root, "start.json");
    await writeFile(inputPath, JSON.stringify({ material_passport_import: { kind: "ars-material-passport", passport_path: "passport.yaml", expected_passport_sha256: sha256(await readFile(passportPath)), boundary_hash: "a3f2b7c9d0e1" } }), "utf8");
    const base = ["start", selector, "--input", inputPath, "--actor-kind", "agent", "--actor-name", "academic-pipeline", "--confirmed-by", "researcher"];
    const preview = parseEnvelope<{ identity: { plan_sha256?: string }; effects: Array<{ kind: string }> }>(runCli([...base, "--dry-run", "--json"], root));
    assert.equal(preview.ok, true);
    const executed = parseEnvelope<{ identity: { selector: string }; effects: Array<{ kind: string }> }>(runCli([...base, "--expected-action-basis-sha256", instructionResult.data?.action_descriptor.availability.basis_sha256 ?? "", "--expected-plan-sha256", preview.data?.identity.plan_sha256 ?? "", "--yes", "--json"], root));
    assert.equal(executed.ok, true);
    assert.ok(executed.data?.effects.some((effect) => effect.kind === "material_passport_imported"));
    const resumed = parseEnvelope<{ runtime_context: { imports: unknown[]; resume_candidate: { boundary_hash: string } } }>(runCli(["instructions", executed.data?.identity.selector ?? "", "--json"], root));
    assert.equal(resumed.data?.runtime_context.imports.length, 1);
    assert.equal(resumed.data?.runtime_context.resume_candidate.boundary_hash, "a3f2b7c9d0e1");
  } finally { await rm(root, { recursive: true, force: true }); }
});

async function createWorkspace(): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "researchspec-passport-"));
  const workspace = path.join(root, "researchspec");
  for (const entry of getWorkspaceEntries(workspace, "strict")) {
    if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    else { await mkdir(path.dirname(entry.path), { recursive: true }); await writeFile(entry.path, entry.content, "utf8"); }
  }
  return root;
}

async function exists(filePath: string): Promise<boolean> { try { await lstat(filePath); return true; } catch { return false; } }
