import assert from "node:assert/strict";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { parse, stringify } from "yaml";

import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

interface Finding {
  finding_id: string;
  disposition: string;
  code: string;
  retry_selector: string | null;
  repair_available: boolean;
}

interface Report {
  healthy: boolean;
  findings: Finding[];
}

void test("public Doctor diagnoses damaged state and performs one approved hash-bound repair", async () => {
  const root = await tempProject();
  const workspace = path.join(root, "researchspec");
  const statePath = path.join(workspace, "runs/current/state.yaml");
  try {
    assert.equal(runCli(["init", root, "--tools", "none", "--profile", "strict"]).status, 0);
    const healthy = parseEnvelope<Report>(runCli(["doctor", "--json"], root));
    assert.equal(healthy.ok, true);
    assert.equal(healthy.data?.healthy, true);

    const invalidYaml = "schema_version: [\n";
    await writeFile(statePath, invalidYaml, "utf8");
    const syntax = parseEnvelope<Report>(runCli(["doctor", "--json"], root));
    assert.equal(syntax.ok, false);
    assert.equal(syntax.data?.healthy, false);
    assert.ok(syntax.data?.findings.some((item) => item.code === "invalid_yaml"));
    assert.equal(await readFile(statePath, "utf8"), invalidYaml);

    const initialized = await reinitialize(root);
    const invalid = parse(initialized) as Record<string, unknown>;
    invalid.status = "invented";
    const invalidShape = stringify(invalid);
    await writeFile(statePath, invalidShape, "utf8");
    const shape = parseEnvelope<Report>(runCli(["doctor", "--json"], root));
    assert.ok(shape.data?.findings.some((item) => item.code === "authority_schema_invalid"));
    assert.equal(await readFile(statePath, "utf8"), invalidShape);

    await writeFile(statePath, initialized, "utf8");
    await startViaCli(root);
    const state = parse(await readFile(statePath, "utf8")) as Record<string, unknown>;
    const startReceipt = ((state.subflows as Array<Record<string, unknown>>)[0]?.start_receipt) as Record<string, unknown>;
    startReceipt.sha256 = "0".repeat(64);
    await writeFile(statePath, stringify(state), "utf8");

    const diagnosis = parseEnvelope<Report>(runCli(["doctor", "--json"], root));
    const repair = diagnosis.data?.findings.find((item) => item.repair_available);
    assert.ok(repair);
    const preview = parseEnvelope<{ plan_sha256: string; backup_paths: string[] }>(
      runCli(["doctor", "--repair", repair.finding_id, "--dry-run", "--json"], root),
    );
    assert.match(preview.data?.plan_sha256 ?? "", /^[a-f0-9]{64}$/);
    const beforeDryRun = await readFile(statePath, "utf8");
    assert.equal(await readFile(statePath, "utf8"), beforeDryRun);

    const missingApproval = runCli(["doctor", "--repair", repair.finding_id, "--json"], root);
    assert.equal(missingApproval.status, 2);
    assert.equal(parseEnvelope(missingApproval).error?.code, "confirmation_required");

    await writeFile(statePath, `${beforeDryRun}\n`, "utf8");
    const stale = runCli([
      "doctor", "--repair", repair.finding_id,
      "--expected-plan-sha256", preview.data?.plan_sha256 ?? "",
      "--yes", "--json",
    ], root);
    assert.equal(stale.status, 3);
    assert.equal(parseEnvelope(stale).error?.code, "doctor_plan_stale");

    const refreshed = parseEnvelope<{ plan_sha256: string; backup_paths: string[] }>(
      runCli(["doctor", "--repair", repair.finding_id, "--dry-run", "--json"], root),
    );
    const damagedBytes = await readFile(statePath);
    const executed = parseEnvelope<{ outcome: string; effects: Array<{ kind: string }> }>(runCli([
      "doctor", "--repair", repair.finding_id,
      "--expected-plan-sha256", refreshed.data?.plan_sha256 ?? "",
      "--yes", "--json",
    ], root));
    assert.equal(executed.ok, true);
    assert.equal(executed.data?.outcome, "repaired");
    assert.equal(executed.data?.effects[0]?.kind, "runtime_repaired");
    const backup = refreshed.data?.backup_paths[0];
    assert.ok(backup);
    assert.deepEqual(await readFile(path.join(workspace, backup)), damagedBytes);
    assert.equal(parseEnvelope<Report>(runCli(["doctor", "--json"], root)).data?.healthy, true);
  } finally {
    await cleanup(root);
  }
});

void test("public Doctor prefers original retry and reports incompatible orphan receipts", async () => {
  const root = await tempProject();
  const workspace = path.join(root, "researchspec");
  const statePath = path.join(workspace, "runs/current/state.yaml");
  try {
    assert.equal(runCli(["init", root, "--tools", "none", "--profile", "strict"]).status, 0);
    const priorState = await readFile(statePath);
    await startViaCli(root);
    await writeFile(statePath, priorState);

    const retry = parseEnvelope<Report>(runCli(["doctor", "--json"], root));
    const retryFinding = retry.data?.findings.find((item) => item.disposition === "retry_existing_transaction");
    assert.ok(retryFinding);
    assert.equal(retryFinding.retry_selector, "subflow:tpl-deep-research-full");
    assert.equal(retryFinding.repair_available, false);

    const receiptRoot = path.join(workspace, "runs/current/receipts/subflow-start");
    const receiptName = (await readdir(receiptRoot))[0];
    assert.ok(receiptName);
    const conflict = JSON.parse(await readFile(path.join(receiptRoot, receiptName), "utf8")) as Record<string, unknown>;
    conflict.plan_sha256 = "f".repeat(64);
    await writeFile(path.join(receiptRoot, "conflicting.json"), `${JSON.stringify(conflict, null, 2)}\n`, "utf8");
    const conflicted = parseEnvelope<Report>(runCli(["doctor", "--json"], root));
    assert.ok(conflicted.data?.findings.some((item) => item.disposition === "conflicting_evidence"));
    assert.equal(conflicted.data?.findings.some((item) => item.repair_available), false);
  } finally {
    await cleanup(root);
  }
});

async function reinitialize(root: string): Promise<string> {
  const statePath = path.join(root, "researchspec/runs/current/state.yaml");
  const original = stringify({
    schema_version: "0.2",
    run_id: "current",
    workflow_id: "arsu-v0-1",
    status: "not_started",
    started_at: null,
    updated_at: null,
    subflows: [],
    material_passport_imports: [],
    resume_candidate: null,
    pending_decisions: [],
    diagnostics: [],
  });
  await writeFile(statePath, original, "utf8");
  return original;
}

async function startViaCli(root: string): Promise<void> {
  const selector = "subflow:tpl-deep-research-full";
  const instructions = parseEnvelope<{
    instruction_basis_sha256: string;
    action_descriptor: { availability: { basis_sha256: string } };
  }>(runCli(["instructions", selector, "--json"], root));
  assert.equal(instructions.ok, true);
  const inputPath = path.join(root, "doctor-start.json");
  await writeFile(inputPath, "{}\n", "utf8");
  const base = ["start", selector, "--input", inputPath, "--actor-kind", "agent", "--actor-name", "deep-research", "--confirmed-by", "researcher"];
  const preview = parseEnvelope<{ identity: { plan_sha256: string } }>(runCli([...base, "--dry-run", "--json"], root));
  assert.equal(preview.ok, true);
  const executed = runCli([
    ...base,
    "--expected-action-basis-sha256", instructions.data?.action_descriptor.availability.basis_sha256 ?? "",
    "--expected-plan-sha256", preview.data?.identity.plan_sha256 ?? "",
    "--yes", "--json",
  ], root);
  assert.equal(executed.status, 0, executed.stderr || executed.stdout);
}
