import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import { strFromU8, unzipSync } from "fflate";

import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

void test("help, version, and usage errors expose the complete public boundary", () => {
  const help = runCli(["--help"]);
  assert.equal(help.status, 0);
  for (const command of ["init", "update", "status", "check", "list", "show", "handoff", "pack", "propose", "decide", "archive"]) assert.match(help.stdout, new RegExp(`\\b${command}\\b`));
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
  assert.equal(runCli(["init", root, "--tools", "none", "--profile", "unknown", "--json"]).status, 2);
  for (const relative of ["config.yaml", "tool-installation-manifest.json", "specs/project.md", "runs/current/state.yaml"]) assert.equal(existsSync(path.join(root, "researchspec", relative)), true);
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
  const status = parseEnvelope<{ status: string; run: { status: string }; tools: { selected: string[] } }>(runCli(["status", "--json"], root));
  assert.equal(status.ok, true);
  assert.equal(status.data?.status, "initialized");
  assert.equal(status.data?.run.status, "not_started");
  assert.deepEqual(status.data?.tools.selected, []);
  const check = parseEnvelope<{ ok: boolean; target: string }>(runCli(["check", "contracts", "--json"], root));
  assert.equal(check.data?.ok, true);
  assert.equal(check.data?.target, "contracts");
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
  await writeFile(path.join(root, "researchspec/runs/current/artifact-registry.json"), `${JSON.stringify({ schema_version: "0.1", run_id: "current", artifacts: [{ artifact_id: "SAME", path: "artifact.md" }] }, null, 2)}\n`, "utf8");
  const list = parseEnvelope<{ items: unknown[] }>(runCli(["list", "artifacts", "--json"], root));
  assert.equal(list.data?.items.length, 1);
  assert.equal(runCli(["show", "claim:SAME", "--json"], root).status, 0);
  const ambiguous = runCli(["show", "SAME", "--json"], root);
  assert.equal(ambiguous.status, 2);
  assert.equal(parseEnvelope(ambiguous).error?.code, "item_ambiguous");
  assert.equal(runCli(["check", "artifacts"], root).status, 0);
  assert.equal(runCli(["check", "artifacts", "--strict"], root).status, 1);
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
  const dryRun = parseEnvelope<{ plan: Array<{ action: string; path: string }>; dry_run: boolean }>(runCli(["propose", "change-one", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer", "--dry-run", "--json"], root));
  assert.equal(dryRun.data?.dry_run, true);
  assert.deepEqual(dryRun.data?.plan.map((item) => item.action), ["create", "create", "create"]);
  assert.match(dryRun.data?.plan.at(-1)?.path ?? "", /contract-patch\.yaml$/);
  assert.equal(existsSync(path.join(workspace, "changes/change-one")), false);
  assert.equal(await readFile(path.join(workspace, "specs/claims.yaml"), "utf8"), stableBefore);
  assert.equal(runCli(["propose", "change-one", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer", "--json"], root).status, 2);
  const proposed = runCli(["propose", "change-one", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer", "--yes", "--json"], root);
  assert.equal(proposed.status, 0, proposed.stderr || proposed.stdout);
  const changeRoot = path.join(workspace, "changes/change-one");
  for (const file of ["proposal.md", "tasks.md", "contract-patch.yaml"]) assert.equal(existsSync(path.join(changeRoot, file)), true);
  assert.equal(await readFile(path.join(workspace, "specs/claims.yaml"), "utf8"), stableBefore);
  assert.equal(runCli(["show", "change:change-one", "--json"], root).status, 0);
  assert.equal(runCli(["propose", "change-one", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer", "--yes", "--json"], root).status, 3);
  const decided = runCli(["decide", "change:change-one", "--decision", "accept", "--actor-name", "Researcher", "--reason", "Evidence supports moderation", "--json"], root);
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
  assert.equal(runCli(["propose", "drifted", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer", "--yes", "--json"], root).status, 0);
  await writeFile(path.join(workspace, "specs/claims.yaml"), 'schema_version: "0.1"\nclaims:\n  - claim_id: C001\n    strength: weak\n', "utf8");
  const ledgerBefore = await readFile(path.join(workspace, "runs/current/decision-ledger.jsonl"), "utf8");
  assert.equal(runCli(["decide", "change:drifted", "--decision", "accept", "--actor-name", "Researcher", "--reason", "Review complete", "--json"], root).status, 1);
  assert.equal(await readFile(path.join(workspace, "runs/current/decision-ledger.jsonl"), "utf8"), ledgerBefore);
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
  assert.equal(runCli(["propose", "markdown-drift", "--input", payloadPath, "--actor-kind", "agent", "--actor-name", "reviewer", "--yes", "--json"], root).status, 0);
  const projectPath = path.join(workspace, "specs/project.md");
  await writeFile(projectPath, (await readFile(projectPath, "utf8")).replace("\nTBD\n\n## Scope", "\nChanged outside the proposal.\n\n## Scope"), "utf8");
  const decided = runCli(["decide", "change:markdown-drift", "--decision", "accept", "--actor-name", "Researcher", "--reason", "Reviewed", "--json"], root);
  assert.equal(decided.status, 1);
  assert.equal(parseEnvelope(decided).error?.code, "current_value_conflict");
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

void test("decide rejects draft artifact paths outside the project root", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  const outside = path.join(path.dirname(root), `${path.basename(root)}-outside.md`);
  const draft = "<!--block:B0001-->\nOutside draft.\n";
  await writeFile(outside, draft, "utf8");
  const workspace = path.join(root, "researchspec");
  await writeFile(path.join(workspace, "runs/current/artifact-registry.json"), `${JSON.stringify({ schema_version: "0.1", run_id: "current", artifacts: [{ artifact_id: "A-OUT", path: `../${path.basename(outside)}`, sha256: hash(draft) }] }, null, 2)}\n`, "utf8");
  const patch = { patch_format_version: "1.0", patch_id: "dp-escape", revision_round: 1, status: "proposed", base_artifact_id: "A-OUT", base_draft_hash: hash(draft), emitted_by: "writer", ops: [{ op: "replace_block", block_id: "B0001", old_hash: hash("Outside draft.").slice(0, 12), new_text: "Escaped" }] };
  await writeFile(path.join(workspace, "draft-patches/dp-escape.json"), `${JSON.stringify(patch, null, 2)}\n`, "utf8");
  assert.equal(runCli(["decide", "patch:dp-escape", "--decision", "accept", "--actor-name", "Researcher", "--reason", "test", "--json"], root).status, 1);
  assert.equal(await readFile(outside, "utf8"), draft);
  await rm(outside, { force: true });
  await cleanup(root);
});

void test("decide applies ARSU standalone block-marker draft patches without changing untouched blocks", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
  const workspace = path.join(root, "researchspec");
  const draft = "---\ntitle: Draft\n---\n\n<!--block:B0001-->\nOriginal first paragraph.\n\n<!--block:B0002-->\nUntouched second paragraph.\n";
  await writeFile(path.join(root, "draft.md"), draft, "utf8");
  await writeFile(path.join(workspace, "runs/current/artifact-registry.json"), `${JSON.stringify({ schema_version: "0.1", run_id: "current", artifacts: [{ artifact_id: "A-DRAFT", artifact_type: "paper_draft", path: "draft.md", sha256: hash(draft) }] }, null, 2)}\n`, "utf8");
  const patch = {
    patch_format_version: "1.0", patch_id: "dp-one", revision_round: 1, status: "proposed",
    base_artifact_id: "A-DRAFT", base_draft_hash: hash(draft), emitted_by: { kind: "agent", name: "writer" },
    ops: [{ op: "replace_block", block_id: "B0001", old_hash: hash("Original first paragraph.").slice(0, 12), new_text: "Revised first paragraph." }],
  };
  await writeFile(path.join(workspace, "draft-patches/dp-one.json"), `${JSON.stringify(patch, null, 2)}\n`, "utf8");
  const decided = runCli(["decide", "patch:dp-one", "--decision", "accept", "--actor-name", "Researcher", "--reason", "Apply reviewed revision", "--json"], root);
  assert.equal(decided.status, 0, decided.stderr || decided.stdout);
  const revised = await readFile(path.join(root, "draft.dp-one.md"), "utf8");
  assert.match(revised, /<!--block:B0001-->\nRevised first paragraph\./);
  assert.match(revised, /<!--block:B0002-->\nUntouched second paragraph\./);
  assert.equal(runCli(["archive", "patch:dp-one", "--json"], root).status, 0);
  await cleanup(root);
});

void test("update preserves drifted manifest-owned files", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "forgecode"]).status, 0);
  for (const skillId of ["deep-research", "academic-paper", "academic-paper-reviewer", "academic-pipeline"]) {
    assert.equal(existsSync(path.join(root, ".forge/skills", skillId, "SKILL.md")), true);
  }
  for (const skillId of ["researchspec-explore", "researchspec-propose", "researchspec-check", "researchspec-verify", "researchspec-next", "researchspec-context", "researchspec-decide", "researchspec-archive"]) {
    assert.equal(existsSync(path.join(root, ".forge/skills", skillId, "SKILL.md")), true);
    assert.equal(existsSync(path.join(root, ".forge/skills", skillId, "references/cli-discipline.md")), false);
  }
  const skillPath = path.join(root, ".forge/skills/researchspec-check/SKILL.md");
  await writeFile(skillPath, "user customization", "utf8");
  const update = runCli(["update", "--tools", "forgecode", "--json"], root);
  assert.equal(update.status, 0);
  assert.match(update.stdout, /generated_file_drift/);
  assert.equal(await readFile(skillPath, "utf8"), "user customization");
  const forced = runCli(["update", "--tools", "forgecode", "--force", "--json"], root);
  assert.equal(forced.status, 0, forced.stderr || forced.stdout);
  assert.notEqual(await readFile(skillPath, "utf8"), "user customization");
  const manifestPath = path.join(root, "researchspec/tool-installation-manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
    installations: Array<{ tool_id: string; path: string; scope: "project" | "shared-global"; sha256: string; source: string; adapter_version: string }>;
  };
  assert.ok(manifest.installations.some((entry) => entry.path.endsWith("researchspec-check/SKILL.md") && entry.source === "companion:researchspec-check/SKILL.md"));
  const stalePath = path.join(root, ".forge/skills/researchspec-check/references/cli-discipline.md");
  const staleContent = "old generated companion reference";
  await mkdir(path.dirname(stalePath), { recursive: true });
  await writeFile(stalePath, staleContent, "utf8");
  manifest.installations.push({
    tool_id: "forgecode",
    path: ".forge/skills/researchspec-check/references/cli-discipline.md",
    scope: "project",
    sha256: hash(staleContent),
    source: "companion:researchspec-check/references/cli-discipline.md",
    adapter_version: "1",
  });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  assert.equal(runCli(["update", "--tools", "forgecode", "--json"], root).status, 0);
  assert.equal(existsSync(stalePath), false);
  const driftedReference = path.join(root, ".forge/skills/researchspec-archive/references/cli-discipline.md");
  const oldReference = "old generated reference";
  await mkdir(path.dirname(driftedReference), { recursive: true });
  await writeFile(driftedReference, "user-modified reference", "utf8");
  const refreshedManifest = JSON.parse(await readFile(manifestPath, "utf8")) as typeof manifest;
  refreshedManifest.installations.push({
    tool_id: "forgecode",
    path: ".forge/skills/researchspec-archive/references/cli-discipline.md",
    scope: "project",
    sha256: hash(oldReference),
    source: "companion:researchspec-archive/references/cli-discipline.md",
    adapter_version: "1",
  });
  await writeFile(manifestPath, `${JSON.stringify(refreshedManifest, null, 2)}\n`, "utf8");
  const preserve = runCli(["update", "--tools", "forgecode", "--json"], root);
  assert.match(preserve.stdout, /generated_file_drift/);
  assert.equal(await readFile(driftedReference, "utf8"), "user-modified reference");
  await cleanup(root);
});

void test("command-capable delivery emits ARSU and companion wrappers in the registered format", async () => {
  const root = await tempProject();
  assert.equal(runCli(["init", root, "--tools", "gemini"]).status, 0);
  for (const commandId of ["deep-research", "academic-paper", "academic-paper-reviewer", "academic-pipeline", "explore", "propose", "check", "verify", "next", "context", "decide", "archive"]) {
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
  await writeFile(path.join(root, "researchspec/runs/current/artifact-registry.json"), `${JSON.stringify({ schema_version: "0.1", run_id: "current", artifacts: [{ artifact_id: "A-SECRET", path: "linked-secret.txt" }] }, null, 2)}\n`, "utf8");
  const output = path.join(root, "safe.zip");
  assert.equal(runCli(["pack", "--include-artifacts", "--out", output], root).status, 0);
  assert.equal(Object.keys(unzipSync(await readFile(output))).some((entry) => entry.includes("linked-secret")), false);
  await rm(outside, { force: true });
  await cleanup(root);
});

function hash(value: string | Uint8Array): string { return createHash("sha256").update(value).digest("hex"); }
