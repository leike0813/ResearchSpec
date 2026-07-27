import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import type { ManagedInstallation } from "../src/adapters/installations.js";
import { strFromU8, unzipSync } from "fflate";

import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

void test("help, version, and usage errors expose the complete public boundary", () => {
  const help = runCli(["--help"]);
  assert.equal(help.status, 0);
  const commands = ["init", "update", "status", "instructions", "start", "submit", "advance", "check", "doctor", "list", "show", "handoff", "pack", "propose", "decide", "archive", "plugin"];
  assert.equal(commands.length, 17);
  for (const command of commands) assert.match(help.stdout, new RegExp(`\\b${command}\\b`));
  assert.equal(runCli(["--version"]).stdout.trim(), "0.1.0");
  const invalid = runCli(["unknown", "--json"]);
  assert.equal(invalid.status, 2);
  assert.equal(parseEnvelope(invalid).error?.code, "usage_error");
  assert.equal(parseEnvelope(invalid).data, null);
});

void test("init dry-run and execution share a protected workspace plan", async () => {
  const root = await tempProject();
  const dryRun = runCli(["init", root, "--tools", "none", "--dry-run"]);
  assert.equal(dryRun.status, 0);
  assert.match(dryRun.stdout, /Would create: .*researchspec/);
  assert.equal(existsSync(path.join(root, "researchspec")), false);

  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  assert.match(await readFile(path.join(root, "researchspec/config.yaml"), "utf8"), /^profile: adaptive$/m);
  assert.match(await readFile(path.join(root, "researchspec/config.yaml"), "utf8"), /plugins:\n\s+selected: \[\]/);
  assert.equal(runCli(["init", root, "--tools", "none", "--profile", "unknown", "--json"]).status, 2);
  for (const relative of ["config.yaml", "tool-installation-manifest.json", "specs/project.md", "runs/current/state.yaml"]) assert.equal(existsSync(path.join(root, "researchspec", relative)), true);
  const runtimePath = path.join(root, ".zotero-bridge/bin", process.platform === "win32" ? "zotero-bridge.exe" : "zotero-bridge");
  assert.equal(existsSync(runtimePath), true);
  const manifest = JSON.parse(await readFile(path.join(root, "researchspec/tool-installation-manifest.json"), "utf8")) as { literature_adapter_resolutions: Array<{ projection_state: string }> };
  assert.equal(manifest.literature_adapter_resolutions[0]?.projection_state, "deferred");
  await rm(runtimePath);
  assert.equal(runCli(["update", "--tools", "none"], root).status, 0);
  assert.equal(existsSync(runtimePath), true);
  await writeFile(runtimePath, "local drift", "utf8");
  assert.equal(runCli(["update", "--tools", "none"], root).status, 0);
  assert.equal(await readFile(runtimePath, "utf8"), "local drift");
  assert.equal(runCli(["update", "--tools", "none", "--force"], root).status, 0);
  assert.notEqual(await readFile(runtimePath, "utf8"), "local drift");
  const projectPath = path.join(root, "researchspec/specs/project.md");
  await writeFile(projectPath, "custom project text", "utf8");
  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  assert.equal(await readFile(projectPath, "utf8"), "custom project text");
  await cleanup(root);
});

void test("status and check use the versioned JSON envelope", async () => {
  const root = await tempProject();
  const missing = runCli(["status", "--json"], root);
  assert.equal(missing.status, 1);
  assert.equal(parseEnvelope(missing).error?.code, "workspace_missing");

  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  const status = parseEnvelope<{
    schema_version: string;
    workspace_id: string;
    run_id: string;
    lifecycle: string;
    profile: { mode: string };
    pending: { gate_count: number; decision_count: number };
    literature_adapters: Array<{
      adapter_id: string;
      state: string;
      connection_state: string;
      runtime_supported: boolean;
      projection_state: string;
      diagnostic_count: number;
    }>;
    next_selectors: string[];
  }>(runCli(["status", "--json"], root));
  assert.equal(status.ok, true);
  assert.equal(status.data?.schema_version, "1");
  assert.equal(status.data?.run_id, "current");
  assert.equal(status.data?.lifecycle, "open");
  assert.equal(status.data?.profile.mode, "adaptive");
  assert.equal(status.data?.pending.gate_count, 0);
  assert.equal(status.data?.pending.decision_count, 0);
  assert.deepEqual(status.data?.literature_adapters, [{
    adapter_id: "zotero-library",
    state: "installed",
    connection_state: "unchecked",
    runtime_supported: true,
    projection_state: "deferred",
    diagnostic_count: 1,
  }]);
  assert.ok(status.data?.next_selectors.includes("show:workflow:current"));
  assert.equal(status.data && "workflow_control" in status.data, false);
  assert.equal(status.data && "diagnostics" in status.data, false);
  const check = parseEnvelope<{ ok: boolean; target: string }>(runCli(["check", "contracts", "--json"], root));
  assert.equal(check.data?.ok, true);
  assert.equal(check.data?.target, "contracts");
  const pluginCheck = parseEnvelope<{ ok: boolean; target: string }>(runCli(["check", "plugins", "--json"], root));
  assert.equal(pluginCheck.data?.ok, true);
  assert.equal(pluginCheck.data?.target, "plugins");
  const literatureCheck = parseEnvelope<{ ok: boolean; target: string }>(runCli(["check", "literature-adapters", "--json"], root));
  assert.equal(literatureCheck.data?.ok, true);
  assert.equal(literatureCheck.data?.target, "literature-adapters");
  if (process.platform !== "win32") {
    await writeFile(path.join(root, ".zotero-bridge/bin/zotero-bridge"), "drift", "utf8");
    const drifted = parseEnvelope(runCli(["check", "literature-adapters", "--json"], root));
    assert.equal(drifted.ok, false);
    assert.ok(drifted.diagnostics.some((item) => typeof item === "object" && item !== null && (item as { code?: string }).code === "literature_adapter_file_drift"));
  }
  await cleanup(root);
});

void test("plugin catalog list and show are package-only outside a workspace", () => {
  const listed = runCli(["plugin", "list", "--json"]);
  assert.equal(listed.status, 0);
  assert.equal(parseEnvelope<{ domains: unknown[] }>(listed).data?.domains.length, 56);
  const installed = runCli(["plugin", "list", "--installed", "--json"]);
  assert.equal(installed.status, 0);
  assert.deepEqual(parseEnvelope<{ domains: unknown[] }>(installed).data?.domains, []);
  const missing = runCli(["plugin", "show", "unknown-plugin", "--json"]);
  assert.equal(missing.status, 1);
  assert.equal(parseEnvelope(missing).error?.code, "plugin_not_found");
  const empty = runCli(["plugin", "show", "architecture", "--json"]);
  assert.equal(empty.status, 1);
  assert.equal(parseEnvelope(empty).error?.code, "plugin_not_found");
  const compact = parseEnvelope<{ domains: Array<{ direct_skill_count: number; resolved_skill_count: number; direct_skills?: unknown }> }>(
    runCli(["plugin", "list", "--summary", "--json"]),
  );
  assert.equal(compact.data?.domains.length, 56);
  assert.equal(typeof compact.data?.domains[0]?.direct_skill_count, "number");
  assert.equal(compact.data?.domains[0]?.direct_skills, undefined);
  const compactDomain = parseEnvelope<{ domain: { resolved_skills: Array<{ description: string; entry_sha256: string }> } }>(
    runCli(["plugin", "show", "quantum-physics", "--summary", "--json"]),
  );
  assert.ok(compactDomain.data?.domain.resolved_skills.every((skill) => skill.description && /^[a-f0-9]{64}$/.test(skill.entry_sha256)));
  assert.match(runCli(["plugin", "--help"]).stdout, /\binstructions\b/);
});

void test("non-interactive plugin install binds the preview and exposes immediate Skill instructions", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "forgecode"]).status, 0);
    const preview = parseEnvelope<{
      plan_sha256: string;
      domain_versions: Array<{ domain_id: string; version: string }>;
      plan: { operation_count: number; writable_count: number };
    }>(runCli(["plugin", "install", "quantum-physics", "--dry-run", "--summary", "--json"], root));
    assert.equal(preview.ok, true);
    assert.match(preview.data?.plan_sha256 ?? "", /^[a-f0-9]{64}$/);
    assert.deepEqual(preview.data?.domain_versions.map((item) => item.domain_id), ["quantum-physics"]);
    assert.ok((preview.data?.plan.operation_count ?? 0) > 0);

    const unbound = runCli(["plugin", "install", "quantum-physics", "--yes", "--summary", "--json"], root);
    assert.equal(unbound.status, 2);
    assert.equal(parseEnvelope(unbound).error?.code, "confirmation_required");
    const stale = runCli(["plugin", "install", "quantum-physics", "--expected-plan-sha256", "0".repeat(64), "--yes", "--summary", "--json"], root);
    assert.equal(stale.status, 3);
    assert.equal(parseEnvelope(stale).error?.code, "plugin_install_plan_conflict");

    const installed = parseEnvelope<{ plan_sha256: string }>(runCli([
      "plugin", "install", "quantum-physics",
      "--expected-plan-sha256", preview.data?.plan_sha256 ?? "",
      "--yes", "--summary", "--json",
    ], root));
    assert.equal(installed.ok, true);
    assert.equal(installed.data?.plan_sha256, preview.data?.plan_sha256);

    const instructions = parseEnvelope<{
      skill_id: string;
      entry_sha256: string;
      instructions: string;
      authority: { kind: string; workflow_binding: string; producer_unchanged: boolean };
    }>(runCli(["plugin", "instructions", "scientific-agent-skills-qiskit", "--json"], root));
    assert.equal(instructions.ok, true);
    assert.equal(instructions.data?.skill_id, "scientific-agent-skills-qiskit");
    assert.match(instructions.data?.entry_sha256 ?? "", /^[a-f0-9]{64}$/);
    assert.match(instructions.data?.instructions ?? "", /^---\nname: scientific-agent-skills-qiskit/m);
    assert.deepEqual(instructions.data?.authority, {
      kind: "advisory-semantic-helper",
      workflow_binding: "none",
      producer_unchanged: true,
      executes_resources: false,
      forbidden_writes: [
        "researchspec/runs/current/state.yaml",
        "researchspec/runs/current/artifact-registry.json",
        "researchspec/runs/current/decision-ledger.jsonl",
        "researchspec/runs/current/gate-ledger.jsonl",
        "researchspec/runs/current/receipts/**",
      ],
    });
  } finally { await cleanup(root); }
});

void test("universal init exposes dynamic status and resolved instructions", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "none", "--profile", "strict"]).status, 0);
  const workspace = path.join(root, "researchspec");
  assert.equal(existsSync(path.join(workspace, "runs/current/subflows")), false);

  const status = parseEnvelope<{ lifecycle: string; allowed_actions: Array<{ selector: string }> }>(runCli(["status", "--json"], root));
  assert.equal(status.ok, true);
  assert.equal(status.data?.lifecycle, "open");
  assert.ok((status.data?.allowed_actions.length ?? 0) > 0);
  const workflow = parseEnvelope<{ workflow_control: { profile: string; state: string; configured: boolean; valid: boolean; ready_items: string[]; startable_subflows: string[]; work_items: unknown[] } }>(
    runCli(["show", "workflow:current", "--json"], root),
  );
  assert.equal(workflow.data?.workflow_control.configured, true);
  assert.equal(workflow.data?.workflow_control.valid, true);
  assert.equal(workflow.data?.workflow_control.profile, "strict");
  assert.equal(workflow.data?.workflow_control.state, "not_started");
  assert.deepEqual(workflow.data?.workflow_control.ready_items, []);
  assert.ok(workflow.data?.workflow_control.startable_subflows.includes("subflow:tpl-deep-research-full"));
  assert.deepEqual(workflow.data?.workflow_control.work_items, []);

  const subflow = parseEnvelope<{
    selector: string; route: { route_ref: string }; route_coverage: string; instruction_basis_sha256: string; required_user_input_ids: string[];
    action_descriptor: { availability: { basis_sha256: string } };
  }>(runCli(["instructions", "subflow:tpl-deep-research-full", "--json"], root));
  assert.equal(subflow.ok, true);
  assert.equal(subflow.data?.route.route_ref, "deep-research:full");
  assert.equal(subflow.data?.route_coverage, "complete");
  assert.ok(subflow.data?.required_user_input_ids.includes("research_goal"));
  const startInput = path.join(root, "start.json");
  await writeFile(startInput, "{}\n", "utf8");
  const startPreview = parseEnvelope<{ outcome: string; identity: { plan_sha256?: string } }>(runCli(["start", "subflow:tpl-deep-research-full", "--input", startInput, "--actor-kind", "agent", "--actor-name", "academic-pipeline", "--confirmed-by", "researcher", "--dry-run", "--json"], root));
  assert.equal(startPreview.data?.outcome, "would_start");
  const start = parseEnvelope<{ outcome: string; identity: { selector: string } }>(runCli(["start", "subflow:tpl-deep-research-full", "--input", startInput, "--actor-kind", "agent", "--actor-name", "academic-pipeline", "--confirmed-by", "researcher", "--expected-action-basis-sha256", subflow.data?.action_descriptor.availability.basis_sha256 ?? "", "--expected-plan-sha256", startPreview.data?.identity.plan_sha256 ?? "", "--yes", "--json"], root));
  assert.equal(start.data?.outcome, "started");
  const afterStart = parseEnvelope<{ workflow_control: { ready_items: string[] } }>(runCli(["show", "workflow:current", "--json"], root));
  const workSelector = afterStart.data?.workflow_control.ready_items[0] ?? "";
  assert.match(workSelector, /^work:sf-.+\/rq-brief$/);

  const instructions = parseEnvelope<{
    selector: string; work_item_id: string; stage_id: string; producer_skill: string; state: string;
    description: string; context: { schema_version: string; instance_id: string; resume_candidate: null; imports: unknown[]; artifacts: unknown[]; gate_evidence: unknown[]; decision_evidence: unknown[]; diagnostics: string[] }; template: string; forbidden_writes: string[];
    output: { workspace_path: string; resolved_path: string; template_ref: string };
    validation: { profile: string; suggested_command: string };
    completion: {
      submit_available: boolean;
      submit?: { selector: string; candidate_path: string; command: string; execution_policy: string; dry_run: string; updates_state: boolean };
      policy: { required_gate_ids: string[] };
    };
    submission: { policy: string; requires_user_confirmation: boolean; authorization: { valid: boolean } };
  }>(runCli(["instructions", workSelector, "--json"], root));
  assert.equal(instructions.ok, true);
  assert.equal(instructions.data?.selector, workSelector);
  assert.equal(instructions.data?.work_item_id, "rq-brief");
  assert.equal(instructions.data?.stage_id, "work");
  assert.equal(instructions.data?.producer_skill, "deep-research");
  assert.equal(instructions.data?.state, "ready");
  assert.equal(instructions.data?.context.schema_version, "1");
  assert.equal(instructions.data?.context.instance_id, workSelector.slice("work:".length).split("/", 1)[0]);
  assert.deepEqual(instructions.data?.context.imports, []);
  assert.deepEqual(instructions.data?.context.gate_evidence, []);
  assert.match(instructions.data?.output.workspace_path ?? "", /^runs\/current\/subflows\/sf-.+\/artifacts\/rq-brief\.md$/);
  assert.equal(instructions.data?.output.template_ref, "arsu-artifact:rq_brief");
  assert.match(instructions.data?.template ?? "", /Artifact type: `rq_brief`/);
  assert.ok(instructions.data?.output.resolved_path.endsWith("/artifacts/rq-brief.md"));
  assert.ok(instructions.data?.forbidden_writes.includes("runs/current/state.yaml"));
  assert.equal(instructions.data?.validation.profile, "text-artifact");
  assert.equal(instructions.data?.completion.submit_available, true);
  assert.equal(instructions.data?.completion.submit?.selector, workSelector);
  assert.equal(instructions.data?.completion.submit?.candidate_path, instructions.data?.output.resolved_path);
  assert.match(instructions.data?.completion.submit?.command ?? "", /submit work:sf-/);
  assert.equal(instructions.data?.completion.submit?.execution_policy, "direct");
  assert.equal(instructions.data?.completion.submit?.dry_run, "optional");
  assert.equal(instructions.data?.completion.submit?.updates_state, false);
  assert.deepEqual(instructions.data?.completion.policy.required_gate_ids, []);
  assert.equal(instructions.data?.submission.policy, "automatic");
  assert.equal(instructions.data?.submission.authorization.valid, true);
  assert.equal(instructions.data?.submission.requires_user_confirmation, false);

  const blocked = runCli(["instructions", workSelector.replace("/rq-brief", "/bibliography"), "--json"], root);
  assert.equal(blocked.status, 1);
  assert.equal(parseEnvelope(blocked).error?.code, "work_item_blocked");
  assert.equal(runCli(["instructions", "rq-brief", "--json"], root).status, 2);
  const unsafeSelector = runCli(["instructions", "work:../rq-brief", "--json"], root);
  assert.equal(unsafeSelector.status, 2);
  assert.equal(parseEnvelope(unsafeSelector).error?.code, "invalid_runtime_selector");
  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  assert.equal(runCli(["init", root, "--tools", "none", "--profile", "arsu-paper", "--json"]).status, 2);
  await cleanup(root);
});

void test("submit previews an exact candidate hash then atomically registers its receipt", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "none", "--profile", "strict"]).status, 0);
  const workspace = path.join(root, "researchspec");
  const instanceId = await startSliceViaCli(root);
  const selector = `work:${instanceId}/rq-brief`;
  const candidatePath = path.join(workspace, `runs/current/subflows/${instanceId}/artifacts/rq-brief.md`);
  const inputPath = path.join(root, "submission.json");
  await mkdir(path.dirname(candidatePath), { recursive: true });
  await writeFile(candidatePath, "# RQ Brief\n\nA bounded research question.\n", "utf8");
  await writeFile(inputPath, `${JSON.stringify({ producer_mode: "full" }, null, 2)}\n`, "utf8");
  const protectedPaths = ["runs/current/state.yaml", "runs/current/gate-ledger.jsonl", "runs/current/decision-ledger.jsonl"];
  const protectedBefore = await Promise.all(protectedPaths.map((item) => readFile(path.join(workspace, item), "utf8")));

  const preview = parseEnvelope<{
    outcome: string;
    identity: { selector: string; sha256?: string };
    effects: Array<{ kind: string; refs: string[] }>;
    next_selectors: string[];
  }>(runCli(["submit", selector, "--input", inputPath, "--actor-kind", "agent", "--actor-name", "deep-research", "--dry-run", "--json"], root));
  assert.equal(preview.ok, true);
  assert.equal(preview.data?.outcome, "would_submit");
  assert.match(preview.data?.identity.sha256 ?? "", /^[a-f0-9]{64}$/);
  assert.match(preview.data?.identity.selector ?? "", /^artifact:/);
  assert.equal(preview.data?.effects[0]?.kind, "artifact_registered");
  assert.ok(preview.data?.next_selectors.includes("show:workflow:current"));
  assert.equal(preview.data && "workflow_control_after" in preview.data, false);
  assert.equal(preview.data && "plan" in preview.data, false);
  assert.deepEqual(await Promise.all(protectedPaths.map((item) => readFile(path.join(workspace, item), "utf8"))), protectedBefore);

  const directArgs = ["submit", selector, "--input", inputPath, "--actor-kind", "agent", "--actor-name", "deep-research", "--json"];
  const submitted = parseEnvelope<{ outcome: string }>(runCli(directArgs, root));
  assert.equal(submitted.ok, true);
  assert.equal(submitted.data?.outcome, "submitted");
  const workflow = parseEnvelope<{ workflow_control: { ready_items: string[] } }>(runCli(["show", "workflow:current", "--json"], root));
  assert.deepEqual(workflow.data?.workflow_control.ready_items, [`work:${instanceId}/methodology-blueprint`, `work:${instanceId}/bibliography`]);
  const retried = parseEnvelope<{ outcome: string; effects: Array<{ kind: string }> }>(runCli(directArgs, root));
  assert.equal(retried.data?.outcome, "already_submitted");
  assert.equal(retried.data?.effects[0]?.kind, "no_change");
  assert.deepEqual(await Promise.all(protectedPaths.map((item) => readFile(path.join(workspace, item), "utf8"))), protectedBefore);

  const invalidActor = runCli(["submit", selector, "--input", inputPath, "--actor-kind", "model", "--actor-name", "bad", "--dry-run", "--json"], root);
  assert.equal(invalidActor.status, 2);
  assert.equal(parseEnvelope(invalidActor).error?.code, "invalid_actor_kind");
  await cleanup(root);
});

void test("check reports missing and malformed contracts without fragile text assertions", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  await rm(path.join(root, "researchspec/specs/claims.yaml"));
  let result = runCli(["check", "--json"], root);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /required_file_missing/);
  await writeFile(path.join(root, "researchspec/specs/claims.yaml"), "schema_version: [oops", "utf8");
  result = runCli(["check", "--json"], root);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /invalid_yaml/);
  await cleanup(root);
});

void test("list and show use canonical selectors and reject ambiguous bare IDs", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  await writeFile(path.join(root, "researchspec/specs/claims.yaml"), 'schema_version: "0.1"\nclaims:\n  - claim_id: SAME\n    statement: test\n', "utf8");
  await writeFile(path.join(root, "artifact.md"), "artifact", "utf8");
  await writeFile(path.join(root, "researchspec/runs/current/artifact-registry.json"), `${JSON.stringify({ schema_version: "0.1", run_id: "current", artifacts: [draftArtifact("SAME", "artifact.md", "artifact")] }, null, 2)}\n`, "utf8");
  const list = parseEnvelope<{ items: unknown[] }>(runCli(["list", "artifacts", "--json"], root));
  assert.equal(list.data?.items.length, 1);
  assert.equal(runCli(["show", "claim:SAME", "--json"], root).status, 0);
  const ambiguous = runCli(["show", "SAME", "--json"], root);
  assert.equal(ambiguous.status, 2);
  assert.equal(parseEnvelope(ambiguous).error?.code, "item_ambiguous");
  await cleanup(root);
});

void test("handoff is a derived view and context packs are deterministic", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  const stdout = runCli(["handoff", "--stdout"], root);
  assert.equal(stdout.status, 0);
  assert.match(stdout.stdout, /# ResearchSpec Handoff/);
  assert.equal(existsSync(path.join(root, "researchspec/runs/current/handoff.md")), false);
  assert.equal(runCli(["handoff"], root).status, 0);
  assert.equal(existsSync(path.join(root, "researchspec/runs/current/handoff.md")), true);

  const first = path.join(root, "one.zip");
  const second = path.join(root, "two.zip");
  assert.equal(runCli(["pack", "--out", first], root).status, 0);
  assert.equal(runCli(["pack", "--out", second], root).status, 0);
  assert.deepEqual(await readFile(first), await readFile(second));
  const entries = unzipSync(await readFile(first));
  const manifest = JSON.parse(strFromU8(entries["manifest.json"])) as { entries: Array<{ path: string; sha256: string }> };
  assert.ok(manifest.entries.some((entry) => entry.path === "runs/current/handoff.md"));
  for (const entry of manifest.entries) assert.equal(hash(entries[entry.path]), entry.sha256);
  assert.equal(runCli(["pack", "--out", first, "--json"], root).status, 3);
  await cleanup(root);
});

void test("propose creates a pending change that decide applies and archive closes", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  const workspace = path.join(root, "researchspec");
  await writeFile(path.join(workspace, "specs/claims.yaml"), 'schema_version: "0.1"\nclaims:\n  - claim_id: C001\n    strength: strong\n', "utf8");
  const stableBefore = await readFile(path.join(workspace, "specs/claims.yaml"), "utf8");
  const payloadPath = path.join(root, "proposal.json");
  const payload = {
    title: "Weaken claim", rationale: "Evidence boundary", risk_level: "high", impact: ["Changes permitted claim wording."],
    patches: [{ target_contract: "specs/claims.yaml", operation: "replace", target_path: "claims[C001].strength", current_value: "strong", proposed_value: "moderate", reason: "Evidence supports moderation.", source_artifact_ids: [], source_decision_ids: [] }],
  };
  await writeFile(payloadPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  const dryRun = parseEnvelope<{ dry_run: boolean; identity: { kind: string; plan_sha256?: string }; effects: Array<{ kind: string }> }>(runCli(["propose", "change-one", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer", "--dry-run", "--json"], root));
  assert.equal(dryRun.data?.dry_run, true);
  assert.equal(dryRun.data?.identity.kind, "plan");
  assert.match(dryRun.data?.identity.plan_sha256 ?? "", /^[a-f0-9]{64}$/);
  assert.equal(dryRun.data?.effects[0]?.kind, "change_proposed");
  assert.equal(existsSync(path.join(workspace, "changes/change-one")), false);
  assert.equal(await readFile(path.join(workspace, "specs/claims.yaml"), "utf8"), stableBefore);
  const proposed = runCli(["propose", "change-one", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer", "--json"], root);
  assert.equal(proposed.status, 0, proposed.stderr || proposed.stdout);
  const changeRoot = path.join(workspace, "changes/change-one");
  for (const file of ["proposal.md", "tasks.md", "contract-patch.yaml"]) assert.equal(existsSync(path.join(changeRoot, file)), true);
  assert.equal(await readFile(path.join(workspace, "specs/claims.yaml"), "utf8"), stableBefore);
  assert.equal(runCli(["show", "change:change-one", "--json"], root).status, 0);
  assert.equal(runCli(["propose", "change-one", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer", "--yes", "--json"], root).status, 3);
  const decided = executeDecision(root, ["decide", "change:change-one", "--decision", "accept", "--actor-name", "Researcher", "--reason", "Evidence supports moderation"]);
  assert.equal(decided.status, 0, decided.stderr || decided.stdout);
  assert.match(await readFile(path.join(workspace, "specs/claims.yaml"), "utf8"), /strength: moderate/);
  assert.equal(existsSync(path.join(workspace, "runs/current/receipts/change-one.json")), true);
  assert.match(await readFile(path.join(workspace, "runs/current/decision-ledger.jsonl"), "utf8"), /"status":"accepted"/);
  const ledgerBefore = await readFile(path.join(workspace, "runs/current/decision-ledger.jsonl"), "utf8");
  assert.equal(runCli(["decide", "change:change-one", "--decision", "reject", "--actor-name", "Researcher", "--reason", "Second decision", "--json"], root).status, 1);
  assert.equal(await readFile(path.join(workspace, "runs/current/decision-ledger.jsonl"), "utf8"), ledgerBefore);
  const archived = runCli(["archive", "change:change-one", "--json"], root);
  assert.equal(archived.status, 0, archived.stderr || archived.stdout);
  assert.equal(existsSync(changeRoot), false);
  await cleanup(root);
});

void test("propose validates strict targets, evidence, and current-value drift at acceptance", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  const workspace = path.join(root, "researchspec");
  await writeFile(path.join(workspace, "specs/claims.yaml"), 'schema_version: "0.1"\nclaims:\n  - claim_id: C001\n    strength: strong\n', "utf8");
  const payloadPath = path.join(root, "proposal.json");
  const base = { title: "Change claim", rationale: "Evidence", risk_level: "high", impact: ["Claim changes."], patches: [{ target_contract: "specs/claims.yaml", operation: "replace", target_path: "claims[C001].strength", current_value: "strong", proposed_value: "moderate", reason: "Align evidence.", source_artifact_ids: [], source_decision_ids: [] }] };
  await writeFile(payloadPath, JSON.stringify({ ...base, patches: [{ ...base.patches[0], source_artifact_ids: ["A-MISSING"] }] }), "utf8");
  assert.equal(runCli(["propose", "missing-evidence", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer", "--yes", "--json"], root).status, 1);
  await writeFile(payloadPath, JSON.stringify({ ...base, patches: [{ ...base.patches[0], target_path: "claims[C404].strength" }] }), "utf8");
  assert.equal(runCli(["propose", "missing-target", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer", "--yes", "--json"], root).status, 1);
  await writeFile(path.join(workspace, "specs/claims.yaml"), 'schema_version: "0.1"\nclaims:\n  - claim_id: C001\n    strength: strong\n  - claim_id: C001\n    strength: strong\n', "utf8");
  await writeFile(payloadPath, JSON.stringify(base), "utf8");
  assert.equal(runCli(["propose", "ambiguous-target", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer", "--yes", "--json"], root).status, 1);
  await writeFile(path.join(workspace, "specs/claims.yaml"), 'schema_version: "0.1"\nclaims:\n  - claim_id: C001\n    strength: strong\n', "utf8");
  await writeFile(payloadPath, JSON.stringify({ ...base, patches: [{ ...base.patches[0], target_contract: "specs/other.yaml" }] }), "utf8");
  assert.equal(runCli(["propose", "unknown-contract", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer", "--yes", "--json"], root).status, 2);
  await writeFile(payloadPath, JSON.stringify({ ...base, patches: [{ ...base.patches[0], target_path: "../claims[C001].strength" }] }), "utf8");
  assert.equal(runCli(["propose", "escaping-target", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer", "--yes", "--json"], root).status, 1);
  await writeFile(payloadPath, JSON.stringify({ ...base, unexpected: true }), "utf8");
  assert.equal(runCli(["propose", "strict-payload", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer", "--yes", "--json"], root).status, 2);
  await writeFile(payloadPath, JSON.stringify(base), "utf8");
  assert.equal(executePropose(root, ["propose", "drifted", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer"]).status, 0);
  await writeFile(path.join(workspace, "specs/claims.yaml"), 'schema_version: "0.1"\nclaims:\n  - claim_id: C001\n    strength: weak\n', "utf8");
  const drifted = executeDecision(root, ["decide", "change:drifted", "--decision", "accept", "--actor-name", "Researcher", "--reason", "Review complete"]);
  assert.equal(drifted.status, 0, drifted.stderr || drifted.stdout);
  assert.match(await readFile(path.join(workspace, "runs/current/decision-ledger.jsonl"), "utf8"), /"change_id":"drifted"/);
  assert.match(await readFile(path.join(workspace, "changes/drifted/contract-patch.yaml"), "utf8"), /status: stale/);
  assert.match(await readFile(path.join(workspace, "specs/claims.yaml"), "utf8"), /strength: weak/);
  await cleanup(root);
});

void test("decide revalidates Markdown section current values before applying a proposal", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  const workspace = path.join(root, "researchspec");
  const payloadPath = path.join(root, "markdown-proposal.json");
  const payload = {
    title: "Refine research question", rationale: "Narrow the population", risk_level: "high", impact: ["Changes the governing research question."],
    patches: [{ target_contract: "specs/project.md", operation: "replace", target_path: "section[Research Question]", current_value: "TBD", proposed_value: "What changes in the target population?", reason: "Make the population explicit.", source_artifact_ids: [], source_decision_ids: [] }],
  };
  await writeFile(payloadPath, JSON.stringify(payload), "utf8");
  assert.equal(executePropose(root, ["propose", "markdown-drift", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer"]).status, 0);
  const projectPath = path.join(workspace, "specs/project.md");
  await writeFile(projectPath, (await readFile(projectPath, "utf8")).replace("\nTBD\n\n## Scope", "\nChanged outside the proposal.\n\n## Scope"), "utf8");
  const decided = executeDecision(root, ["decide", "change:markdown-drift", "--decision", "accept", "--actor-name", "Researcher", "--reason", "Reviewed"]);
  assert.equal(decided.status, 0, decided.stderr || decided.stdout);
  assert.equal(parseEnvelope<{ effects: Array<{ kind: string }> }>(decided).data?.effects.some((effect) => effect.kind === "change_marked_stale"), true);
  assert.match(await readFile(projectPath, "utf8"), /Changed outside the proposal/);
  await cleanup(root);
});

void test("archive rejects forged lifecycle state without matching ledger evidence", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  const changeRoot = path.join(root, "researchspec/changes/forged");
  await mkdir(changeRoot, { recursive: true });
  await writeFile(path.join(changeRoot, "contract-patch.yaml"), 'schema_version: "0.1"\nchange_id: forged\ntitle: Forged\nstatus: applied\ncreated_at: "2026-07-10T00:00:00Z"\ncreated_by: {kind: agent, name: test}\nrationale: test\nrisk_level: high\nrequires_human_decision: true\ndecision_id: D-fake\napply_receipt_artifact_id: A-fake\npatches: []\n', "utf8");
  assert.equal(runCli(["archive", "change:forged", "--json"], root).status, 1);
  assert.equal(existsSync(changeRoot), true);
  await cleanup(root);
});

void test("advance rejects draft artifact paths outside the project root", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  const outside = path.join(path.dirname(root), `${path.basename(root)}-outside.md`);
  const draft = "<!--block:B0001-->\nOutside draft.\n";
  await writeFile(outside, draft, "utf8");
  const workspace = path.join(root, "researchspec");
  await writeFile(path.join(workspace, "runs/current/artifact-registry.json"), `${JSON.stringify({ schema_version: "0.1", run_id: "current", artifacts: [draftArtifact("A-OUT", `../${path.basename(outside)}`, draft)] }, null, 2)}\n`, "utf8");
  const patch = { patch_format_version: "1.0", patch_id: "dp-escape", revision_round: 1, status: "proposed", base_artifact_id: "A-OUT", base_draft_hash: hash(draft), emitted_by: "writer", ops: [{ op: "replace_block", block_id: "B0001", old_hash: hash("Outside draft.").slice(0, 12), new_text: "Escaped" }] };
  await writeFile(path.join(workspace, "draft-patches/dp-escape.json"), `${JSON.stringify(patch, null, 2)}\n`, "utf8");
  assert.equal(executeDecision(root, ["decide", "patch:dp-escape", "--decision", "accept", "--actor-name", "Researcher", "--reason", "test"]).status, 0);
  assert.equal(runCli(["advance", "patch:dp-escape", "--actor-kind", "agent", "--actor-name", "academic-paper", "--dry-run", "--json"], root).status, 1);
  assert.equal(await readFile(outside, "utf8"), draft);
  await rm(outside, { force: true });
  await cleanup(root);
});

void test("advance applies accepted ARSU block-marker patches without changing untouched blocks", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  const workspace = path.join(root, "researchspec");
  const draft = "---\ntitle: Draft\n---\n\n<!--block:B0001-->\nOriginal first paragraph.\n\n<!--block:B0002-->\nUntouched second paragraph.\n";
  await writeFile(path.join(root, "draft.md"), draft, "utf8");
  await writeFile(path.join(workspace, "runs/current/artifact-registry.json"), `${JSON.stringify({ schema_version: "0.1", run_id: "current", artifacts: [draftArtifact("A-DRAFT", "draft.md", draft)] }, null, 2)}\n`, "utf8");
  const patch = {
    revision_round: 1,
    base_artifact_id: "A-DRAFT", base_sha256: hash(draft),
    producer_skill: "academic-paper", producer_mode: "revision", subflow_instance_id: null,
    obligation_scope: [], evidence_artifact_ids: [],
    semantic_delta: { level: "ordinary", summary: "Apply the reviewed paragraph revision." },
    ops: [{ op: "replace_block", block_id: "B0001", old_hash: hash("Original first paragraph.").slice(0, 12), new_text: "Revised first paragraph." }],
  };
  const inputPath = path.join(root, "patch-input.json");
  await writeFile(inputPath, `${JSON.stringify(patch, null, 2)}\n`, "utf8");
  const submitted = executePatchSubmit(root, ["submit", "patch:dp-one", "--input", inputPath, "--actor-kind", "agent", "--actor-name", "writer"]);
  assert.equal(submitted.status, 0, submitted.stderr || submitted.stdout);
  const registryAfterSubmit = JSON.parse(await readFile(path.join(workspace, "runs/current/artifact-registry.json"), "utf8")) as { artifacts: Array<{ artifact_type: string }> };
  assert.equal(registryAfterSubmit.artifacts.some((artifact) => artifact.artifact_type === "revision_patch"), false);
  const decided = executeDecision(root, ["decide", "patch:dp-one", "--decision", "accept", "--actor-name", "Researcher", "--reason", "Apply reviewed revision"]);
  assert.equal(decided.status, 0, decided.stderr || decided.stdout);
  assert.equal(existsSync(path.join(root, "draft.dp-one.md")), false);
  const advanced = executeAdvance(root, ["advance", "patch:dp-one", "--actor-kind", "agent", "--actor-name", "academic-paper"]);
  assert.equal(advanced.status, 0, advanced.stderr || advanced.stdout);
  const revised = await readFile(path.join(root, "draft.dp-one.md"), "utf8");
  assert.match(revised, /<!--block:B0001-->\nRevised first paragraph\./);
  assert.match(revised, /<!--block:B0002-->\nUntouched second paragraph\./);
  assert.equal(executeAdvance(root, ["advance", "patch:dp-one", "--actor-kind", "agent", "--actor-name", "academic-paper"]).status, 0);
  assert.equal(runCli(["archive", "patch:dp-one", "--json"], root).status, 0);
  await cleanup(root);
});

void test("patch decisions do not apply text and stale Advance remains atomic", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  const workspace = path.join(root, "researchspec");
  const draft = "<!--block:B0001-->\nOriginal.\n";
  await writeFile(path.join(root, "draft.md"), draft, "utf8");
  await writeFile(path.join(workspace, "runs/current/artifact-registry.json"), `${JSON.stringify({ schema_version: "0.1", run_id: "current", artifacts: [draftArtifact("A-DRAFT", "draft.md", draft)] }, null, 2)}\n`, "utf8");
  const inputPath = path.join(root, "patch-stale-input.json");
  await writeFile(inputPath, `${JSON.stringify({
    revision_round: 1,
    base_artifact_id: "A-DRAFT",
    base_sha256: hash(draft),
    producer_skill: "academic-paper",
    producer_mode: "revision",
    subflow_instance_id: null,
    obligation_scope: [],
    evidence_artifact_ids: [],
    semantic_delta: { level: "none" },
    ops: [{ op: "replace_block", block_id: "B0001", old_hash: hash("Original.").slice(0, 12), new_text: "Revised." }],
  }, null, 2)}\n`, "utf8");
  assert.equal(executePatchSubmit(root, ["submit", "patch:dp-stale", "--input", inputPath, "--actor-kind", "agent", "--actor-name", "writer"]).status, 0);
  assert.equal(executePatchSubmit(root, ["submit", "patch:dp-stale", "--input", inputPath, "--actor-kind", "agent", "--actor-name", "writer"]).status, 0);
  for (const decision of ["reject", "postpone"] as const) {
    const selector = `patch:dp-${decision}`;
    assert.equal(executePatchSubmit(root, ["submit", selector, "--input", inputPath, "--actor-kind", "agent", "--actor-name", "writer"]).status, 0);
    assert.equal(executeDecision(root, ["decide", selector, "--decision", decision, "--actor-name", "Researcher", ...(decision === "reject" ? ["--reason", "Not approved"] : [])]).status, 0);
    assert.equal(existsSync(path.join(root, `draft.dp-${decision}.md`)), false);
  }
  assert.equal(executeDecision(root, ["decide", "patch:dp-stale", "--decision", "accept", "--actor-name", "Researcher", "--reason", "Reviewed"]).status, 0);
  assert.equal(await readFile(path.join(root, "draft.md"), "utf8"), draft);
  assert.equal(existsSync(path.join(root, "draft.dp-stale.md")), false);
  await writeFile(path.join(root, "draft.md"), "<!--block:B0001-->\nChanged after review.\n", "utf8");
  const advanced = executeAdvance(root, ["advance", "patch:dp-stale", "--actor-kind", "agent", "--actor-name", "academic-paper"]);
  assert.equal(advanced.status, 0, advanced.stderr || advanced.stdout);
  assert.equal(parseEnvelope<{ outcome: string }>(advanced).data?.outcome, "stale");
  assert.equal(existsSync(path.join(root, "draft.dp-stale.md")), false);
  assert.equal(existsSync(path.join(workspace, "runs/current/apply-reports/dp-stale.json")), false);
  assert.match(await readFile(path.join(workspace, "draft-patches/dp-stale.json"), "utf8"), /"status": "stale"/);
  await cleanup(root);
});

void test("update preserves drifted manifest-owned files", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "forgecode"]).status, 0);
  for (const skillId of ["deep-research", "academic-paper", "academic-paper-reviewer", "academic-pipeline"]) {
    assert.equal(existsSync(path.join(root, ".forge/skills", skillId, "SKILL.md")), true);
  }
  for (const skillId of ["researchspec-navigate", "researchspec-propose", "researchspec-decide", "researchspec-verify"]) {
    assert.equal(existsSync(path.join(root, ".forge/skills", skillId, "SKILL.md")), true);
    assert.equal(existsSync(path.join(root, ".forge/skills", skillId, "references/cli-discipline.md")), false);
  }
  const skillPath = path.join(root, ".forge/skills/researchspec-navigate/SKILL.md");
  await writeFile(skillPath, "user customization", "utf8");
  const update = runCli(["update", "--tools", "forgecode", "--json"], root);
  assert.equal(update.status, 0);
  assert.match(update.stdout, /generated_file_drift/);
  assert.equal(await readFile(skillPath, "utf8"), "user customization");
  const forced = runCli(["update", "--tools", "forgecode", "--force", "--json"], root);
  assert.equal(forced.status, 0, forced.stderr || forced.stdout);
  assert.notEqual(await readFile(skillPath, "utf8"), "user customization");
  const manifestPath = path.join(root, "researchspec/tool-installation-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as { installations: ManagedInstallation[] };
  assert.ok(manifest.installations.some((entry) => entry.target.path.endsWith("researchspec-navigate/SKILL.md") && entry.source.kind === "companion-skill" && entry.source.skill_id === "researchspec-navigate"));
  const stalePath = path.join(root, ".forge/skills/researchspec-check/references/cli-discipline.md");
  const staleContent = "old generated companion reference";
  await mkdir(path.dirname(stalePath), { recursive: true });
  await writeFile(stalePath, staleContent, "utf8");
  manifest.installations.push(fixtureInstallation("forgecode", ".forge/skills/researchspec-check/references/cli-discipline.md", "project", hash(staleContent), "researchspec-check"));
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  assert.equal(runCli(["update", "--tools", "forgecode", "--json"], root).status, 0);
  assert.equal(existsSync(stalePath), false);
  const driftedReference = path.join(root, ".forge/skills/researchspec-archive/references/cli-discipline.md");
  const oldReference = "old generated reference";
  await mkdir(path.dirname(driftedReference), { recursive: true });
  await writeFile(driftedReference, "user-modified reference", "utf8");
  const refreshedManifest = JSON.parse(await readFile(manifestPath, "utf8")) as typeof manifest;
  refreshedManifest.installations.push(fixtureInstallation("forgecode", ".forge/skills/researchspec-archive/references/cli-discipline.md", "project", hash(oldReference), "researchspec-archive"));
  await writeFile(manifestPath, `${JSON.stringify(refreshedManifest, null, 2)}\n`, "utf8");
  const preserve = runCli(["update", "--tools", "forgecode", "--json"], root);
  assert.match(preserve.stdout, /generated_file_drift/);
  assert.equal(await readFile(driftedReference, "utf8"), "user-modified reference");
  await cleanup(root);
});

void test("update and existing-workspace init generically reconcile obsolete project-local projections", async () => {
  for (const command of ["update", "init"] as const) {
    const root = await tempProject();
    assert.equal(runCli(["init", root, "--tools", "forgecode"]).status, 0);
    const manifestPath = path.join(root, "researchspec/tool-installation-manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as { installations: ManagedInstallation[] };
    const cleanPath = path.join(root, ".forge/skills/obsolete-clean/SKILL.md");
    const driftedPath = path.join(root, ".forge/skills/obsolete-modified/SKILL.md");
    const userOwnedPath = path.join(root, ".forge/skills/unmanifested-user/SKILL.md");
    await mkdir(path.dirname(cleanPath), { recursive: true });
    await mkdir(path.dirname(driftedPath), { recursive: true });
    await mkdir(path.dirname(userOwnedPath), { recursive: true });
    await writeFile(cleanPath, "generated clean", "utf8");
    await writeFile(driftedPath, "user-modified generated file", "utf8");
    await writeFile(userOwnedPath, "unmanifested user workflow", "utf8");
    manifest.installations.push(
      fixtureInstallation("forgecode", ".forge/skills/obsolete-clean/SKILL.md", "project", hash("generated clean"), "obsolete-clean"),
      fixtureInstallation("forgecode", ".forge/skills/obsolete-modified/SKILL.md", "project", hash("generated original"), "obsolete-modified"),
      fixtureInstallation("forgecode", ".forge/skills/obsolete-missing/SKILL.md", "project", hash("missing"), "obsolete-missing"),
    );
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

    const result = command === "update"
      ? runCli(["update", "--tools", "forgecode", "--force", "--json"], root)
      : runCli(["init", root, "--tools", "forgecode", "--force", "--json"]);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /generated_file_drift/);
    assert.equal(existsSync(cleanPath), false);
    assert.equal(await readFile(driftedPath, "utf8"), "user-modified generated file");
    assert.equal(await readFile(userOwnedPath, "utf8"), "unmanifested user workflow");
    const reconciled = JSON.parse(await readFile(manifestPath, "utf8")) as typeof manifest;
    assert.equal(reconciled.installations.some((item) => item.source.kind === "companion-skill" && item.source.skill_id === "obsolete-clean"), false);
    assert.equal(reconciled.installations.some((item) => item.source.kind === "companion-skill" && item.source.skill_id === "obsolete-missing"), false);
    assert.equal(reconciled.installations.some((item) => item.source.kind === "companion-skill" && item.source.skill_id === "obsolete-modified"), true);
    assert.equal(runCli(["update", "--tools", "forgecode", "--json"], root).status, 0);
    await cleanup(root);
  }
});

void test("shared-global projections are never removed by project reconciliation", async () => {
  const root = await tempProject();
  const codexHome = path.join(root, "codex-home");
  const env = { CODEX_HOME: codexHome };
  assert.equal(runCli(["init", root, "--tools", "codex"], process.cwd(), env).status, 0);
  const manifestPath = path.join(root, "researchspec/tool-installation-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as { installations: ManagedInstallation[] };
  const cleanPath = path.join(codexHome, "prompts/obsolete-clean.md");
  const driftedPath = path.join(codexHome, "prompts/obsolete-modified.md");
  await mkdir(path.dirname(cleanPath), { recursive: true });
  await writeFile(cleanPath, "generated clean", "utf8");
  await writeFile(driftedPath, "user-modified generated file", "utf8");
  manifest.installations.push(
    fixtureInstallation("codex", cleanPath, "shared-global", hash("generated clean"), "obsolete-clean"),
    fixtureInstallation("codex", driftedPath, "shared-global", hash("generated original"), "obsolete-modified"),
  );
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const update = runCli(["update", "--tools", "codex", "--force", "--json"], root, env);
  assert.equal(update.status, 0, update.stderr || update.stdout);
  assert.equal(await readFile(cleanPath, "utf8"), "generated clean");
  assert.equal(await readFile(driftedPath, "utf8"), "user-modified generated file");

  const deselectedPath = path.join(codexHome, "prompts/obsolete-deselected.md");
  await writeFile(deselectedPath, "generated deselected", "utf8");
  const afterUpdate = JSON.parse(await readFile(manifestPath, "utf8")) as typeof manifest;
  afterUpdate.installations.push(fixtureInstallation("codex", deselectedPath, "shared-global", hash("generated deselected"), "obsolete-deselected"));
  await writeFile(manifestPath, `${JSON.stringify(afterUpdate, null, 2)}\n`, "utf8");
  assert.equal(runCli(["init", root, "--tools", "none", "--json"], process.cwd(), env).status, 0);
  assert.equal(await readFile(deselectedPath, "utf8"), "generated deselected");
  const afterDeselection = JSON.parse(await readFile(manifestPath, "utf8")) as typeof manifest;
  assert.equal(afterDeselection.installations.some((item) => item.target.path === deselectedPath), true);
  await cleanup(root);
});

void test("command-capable delivery emits ARSU and companion wrappers in the registered format", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "gemini"]).status, 0);
  for (const commandId of ["deep-research", "academic-paper", "academic-paper-reviewer", "academic-pipeline", "navigate", "propose", "decide", "verify"]) {
    const command = await readFile(path.join(root, ".gemini/commands/researchspec", `${commandId}.toml`), "utf8");
    assert.match(command, /^description = /);
    assert.match(command, /prompt = """/);
  }
  await cleanup(root);
});

void test("pack excludes registered artifacts whose symlink resolves outside the project", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  const outside = path.join(path.dirname(root), `${path.basename(root)}-secret.txt`);
  await writeFile(outside, "secret", "utf8");
  await symlink(outside, path.join(root, "linked-secret.txt"));
  await writeFile(path.join(root, "researchspec/runs/current/artifact-registry.json"), `${JSON.stringify({ schema_version: "0.1", run_id: "current", artifacts: [draftArtifact("A-SECRET", "linked-secret.txt", "secret")] }, null, 2)}\n`, "utf8");
  const output = path.join(root, "safe.zip");
  assert.equal(runCli(["pack", "--include-artifacts", "--out", output], root).status, 0);
  assert.equal(Object.keys(unzipSync(await readFile(output))).some((entry) => entry.includes("linked-secret")), false);
  await rm(outside, { force: true });
  await cleanup(root);
});

async function startSliceViaCli(root: string): Promise<string> {
  const instruction = parseEnvelope<{ instruction_basis_sha256: string; action_descriptor: { availability: { basis_sha256: string } } }>(runCli(["instructions", "subflow:tpl-deep-research-full", "--json"], root));
  assert.equal(instruction.ok, true);
  const inputPath = path.join(root, "start-helper.json");
  await writeFile(inputPath, "{}\n", "utf8");
  const base = ["start", "subflow:tpl-deep-research-full", "--input", inputPath, "--actor-kind", "agent", "--actor-name", "academic-pipeline", "--confirmed-by", "researcher"];
  const preview = parseEnvelope<{ identity: { plan_sha256?: string } }>(runCli([...base, "--dry-run", "--json"], root));
  assert.equal(preview.ok, true);
  const result = parseEnvelope<{ identity: { selector: string } }>(runCli([...base, "--expected-action-basis-sha256", instruction.data?.action_descriptor.availability.basis_sha256 ?? "", "--expected-plan-sha256", preview.data?.identity.plan_sha256 ?? "", "--yes", "--json"], root));
  assert.equal(result.ok, true);
  return result.data?.identity.selector.replace(/^subflow:/, "") ?? "";
}

function actionBasis(root: string, selector: string): string {
  const instructions = parseEnvelope<{ action_descriptor: { availability: { basis_sha256: string } } }>(
    runCli(["instructions", selector, "--json"], root),
  );
  assert.equal(instructions.ok, true, JSON.stringify(instructions.error));
  return instructions.data?.action_descriptor.availability.basis_sha256 ?? "";
}

function executePropose(root: string, base: string[]): ReturnType<typeof runCli> {
  const changeId = base[1] ?? "";
  const selector = `change:${changeId}`;
  const basis = actionBasis(root, selector);
  const preview = parseEnvelope<{ identity: { plan_sha256?: string } }>(runCli([...base, "--dry-run", "--json"], root));
  assert.equal(preview.ok, true, JSON.stringify(preview.error));
  return runCli([...base, "--expected-action-basis-sha256", basis, "--expected-plan-sha256", preview.data?.identity.plan_sha256 ?? "", "--yes", "--json"], root);
}

function executeDecision(root: string, base: string[]): ReturnType<typeof runCli> {
  const selector = base[1] ?? "";
  const basis = actionBasis(root, selector);
  const preview = parseEnvelope<{ identity: { plan_sha256?: string } }>(runCli([...base, "--dry-run", "--json"], root));
  assert.equal(preview.ok, true, JSON.stringify(preview.error));
  return runCli([...base, "--expected-action-basis-sha256", basis, "--expected-plan-sha256", preview.data?.identity.plan_sha256 ?? "", "--yes", "--json"], root);
}

function executePatchSubmit(root: string, base: string[]): ReturnType<typeof runCli> {
  const selector = base[1] ?? "";
  const basis = actionBasis(root, selector);
  const preview = parseEnvelope<{ identity: { plan_sha256?: string } }>(runCli([...base, "--dry-run", "--json"], root));
  assert.equal(preview.ok, true, JSON.stringify(preview.error));
  return runCli([...base, "--expected-action-basis-sha256", basis, "--expected-plan-sha256", preview.data?.identity.plan_sha256 ?? "", "--yes", "--json"], root);
}

function executeAdvance(root: string, base: string[]): ReturnType<typeof runCli> {
  const selector = base[1] ?? "";
  const basis = actionBasis(root, selector);
  const preview = parseEnvelope<{ identity: { plan_sha256?: string } }>(runCli([...base, "--dry-run", "--json"], root));
  assert.equal(preview.ok, true, JSON.stringify(preview.error));
  return runCli([...base, "--expected-action-basis-sha256", basis, "--expected-plan-sha256", preview.data?.identity.plan_sha256 ?? "", "--yes", "--json"], root);
}

function fixtureInstallation(toolId: string, targetPath: string, scope: "project" | "shared-global", sha: string, skillId: string): ManagedInstallation {
  return {
    owner: "agent-tool",
    tool_id: toolId,
    source: { kind: "companion-skill", skill_id: skillId },
    target: { scope, path: targetPath, executable: false },
    sha256: sha,
  };
}
function hash(value: string | Uint8Array): string { return createHash("sha256").update(value).digest("hex"); }
function draftArtifact(artifactId: string, artifactPath: string, content: string | Uint8Array) {
  return { artifact_id: artifactId, artifact_type: "paper_draft", path: artifactPath, sha256: hash(content), status: "created", produced_by: "researchspec decide", created_at: "2026-07-10T00:00:00.000Z", derived_from_artifact_ids: ["A-SOURCE"] };
}
