import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { confirm, input, select } from "@inquirer/prompts";
import { stringify } from "yaml";

import { planToolDelivery, type InstallationRecord } from "../adapters/delivery.js";
import { detectTools, orderTools, parseToolExpression } from "../adapters/tools.js";
import { WorkItemSelectorSchema, WORKFLOW_PROFILE_IDS, type WorkflowProfileId } from "../core/contracts/workflow.js";
import { Sha256Schema, SubmitActorKindSchema, SubmitActorSchema } from "../core/contracts/artifact.js";
import { ArtifactSubmitError, executeArtifactSubmit, planArtifactSubmit } from "../core/runtime/artifact-submit.js";
import { archiveItem, decideItem, type DecisionChoice } from "../core/runtime/lifecycle.js";
import { assertProposalBasisCurrent, ContractChangeError, planContractChangeProposal } from "../core/runtime/contract-change.js";
import { renderHandoff } from "../core/runtime/handoff.js";
import { buildContextPack } from "../core/runtime/pack.js";
import { buildStatus, formatStatusHuman, listItems, showItem, type ListType } from "../core/runtime/query.js";
import { buildWorkflowInstructions } from "../core/runtime/workflow-control.js";
import { runWorkspaceChecks, type CheckTarget } from "../core/validation/check.js";
import type { Diagnostic } from "../core/validation/types.js";
import { resolveWorkspace } from "../core/workspace/discover.js";
import { getWorkspaceEntries, getWorkspaceTemplates, resolveInitTarget } from "../core/workspace/layout.js";
import { loadWorkspaceSnapshot } from "../core/workspace/snapshot.js";
import { executeWritePlan, planFile, sha256, type PlannedWrite } from "../core/workspace/write-plan.js";
import { fileExists, readOptionalText } from "../utils/fs.js";
import { CliError, success, type CommandContext, type CommandResult } from "./types.js";
import { searchableMultiSelect } from "./prompts/searchable-multi-select.js";

export interface InitOptions { tools?: string; profile?: string }
export interface UpdateOptions { tools?: string }
export interface HandoffOptions { stdout?: boolean; out?: string }
export interface PackOptions { out?: string; includeArtifacts?: boolean }
export interface DecideOptions { decision?: DecisionChoice; actorName?: string; reason?: string }
export interface ProposeOptions { input: string; actorKind: "human" | "agent"; actorName: string }
export interface SubmitOptions { input: string; actorKind: string; actorName: string; expectedSha256?: string }

export async function handleInit(inputPath: string | undefined, options: InitOptions, context: CommandContext): Promise<CommandResult> {
  if (options.profile !== undefined && !WORKFLOW_PROFILE_IDS.includes(options.profile as WorkflowProfileId)) throw new CliError("invalid_profile", `Unknown profile: ${options.profile}`, 2, `Supported profiles: ${WORKFLOW_PROFILE_IDS.join(", ")}.`);
  const workspace = context.workspace ? path.resolve(context.cwd, context.workspace) : resolveInitTarget(inputPath, context.cwd);
  const projectRoot = path.dirname(workspace);
  const existing = await fileExists(workspace);
  const priorSnapshot = existing ? await loadWorkspaceSnapshot(workspace) : undefined;
  const priorProfile = WORKFLOW_PROFILE_IDS.includes(priorSnapshot?.config.profile as WorkflowProfileId) ? priorSnapshot?.config.profile as WorkflowProfileId : "arsu-paper";
  if (existing && options.profile !== undefined && options.profile !== priorProfile) throw new CliError("profile_change_requires_migration", `Existing workspace uses profile ${priorProfile}; init cannot change it to ${options.profile}.`, 3, "Create an explicit contract migration instead of replacing workflow/state during init.");
  const profile = (options.profile ?? priorProfile) as WorkflowProfileId;
  const configured = strings(record(priorSnapshot?.config.agent_tools).selected);
  const detected = await detectTools(projectRoot);
  const explicitTools = options.tools !== undefined;
  let selected: string[];
  try {
    if (options.tools !== undefined) selected = parseToolExpression(options.tools);
    else if (context.interactive) {
      const ordered = orderTools(configured, detected);
      selected = await searchableMultiSelect({
        message: "Select agent tools",
        choices: ordered.map((tool) => ({ name: tool.name, value: tool.id, configured: configured.includes(tool.id), detected: detected.includes(tool.id), preSelected: configured.includes(tool.id) || (!existing && detected.includes(tool.id)) })),
      });
    } else if (configured.length) selected = configured;
    else if (detected.length) selected = detected;
    else throw new CliError("tools_required", "No agent tools were selected or detected.", 2, "Pass --tools all, --tools none, or a comma-separated tool list.");
  } catch (error) {
    if (error instanceof CliError) throw error;
    throw new CliError("invalid_tools", error instanceof Error ? error.message : String(error), 2);
  }
  if (!context.interactive && !explicitTools && selected.includes("codex")) throw new CliError("codex_global_write_requires_explicit_selection", "Non-interactive Codex delivery requires explicit --tools codex or --tools all.", 2);

  const operations: PlannedWrite[] = [];
  for (const template of getWorkspaceTemplates(profile)) {
    if (template.relativePath === "config.yaml" || template.relativePath === "tool-installation-manifest.json") continue;
    const target = path.join(workspace, template.relativePath);
    if (await fileExists(target)) {
      operations.push({ action: "skip-unchanged", path: target, relativePath: template.relativePath, scope: "workspace", ownership: "user", reason: "existing research content is protected" });
    } else {
      operations.push(await planFile({ path: target, relativePath: template.relativePath, content: template.content, scope: "workspace", ownership: template.overwritePolicy, force: context.force }));
    }
  }

  const currentInstallations = installationRecords(priorSnapshot?.manifest.installations);
  const delivery = await planToolDelivery({ projectRoot, toolIds: selected, existingInstallations: currentInstallations, force: context.force });
  operations.push(...delivery.operations);

  const retained = currentInstallations.filter((item) => typeof item.tool_id === "string" && selected.includes(item.tool_id));
  const desiredKeys = new Set(delivery.installations.map((item) => `${item.scope}:${item.path}`));
  for (const installation of currentInstallations) {
    if (typeof installation.tool_id !== "string" || selected.includes(installation.tool_id) || installation.scope === "shared-global") continue;
    if (typeof installation.path !== "string" || typeof installation.sha256 !== "string") continue;
    const target = path.resolve(projectRoot, installation.path);
    const bytes = await readBytes(target);
    if (bytes !== undefined && sha256(bytes) === installation.sha256) operations.push({ action: "remove-owned", path: target, relativePath: installation.path, scope: "project", ownership: "generated", previousHash: installation.sha256, reason: "tool was explicitly deselected" });
  }
  const installations = deduplicateInstallations([...retained.filter((item) => !desiredKeys.has(`${item.scope}:${item.path}`)), ...delivery.installations]);
  const configText = stringify({ schema_version: "0.1", profile, agent_tools: { selected, delivery: "both" } });
  const configPath = path.join(workspace, "config.yaml");
  operations.push(await authoritativeWrite(configPath, "config.yaml", configText, "workspace", "update selected tool intent"));
  const manifestText = `${JSON.stringify({ schema_version: "1", package_version: "0.1.0", installations }, null, 2)}\n`;
  const manifestPath = path.join(workspace, "tool-installation-manifest.json");
  operations.push(await authoritativeWrite(manifestPath, "tool-installation-manifest.json", manifestText, "workspace", "commit generated ownership last"));

  const plan = { operations };
  if (!context.dryRun && context.interactive && !context.yes) {
    const approved = await confirm({ message: `${previewSummary(operations)}\nApply these ${String(writableCount(operations))} planned file operations?`, default: true });
    if (!approved) throw new CliError("cancelled", "Initialization cancelled.", 1);
  }
  if (!context.dryRun) {
    for (const entry of getWorkspaceEntries(workspace, profile)) if (entry.kind === "dir") await mkdir(entry.path, { recursive: true });
    await executeWritePlan(plan);
  }
  const diagnostics = [...delivery.diagnostics, ...operationDiagnostics(operations)];
  const data = { workspace, profile, selected_tools: selected, dry_run: context.dryRun, plan: summarizePlan(operations) };
  return deliveryResult("init", data, { stdout: formatPlan(context.dryRun ? "ResearchSpec init dry run" : existing ? "ResearchSpec workspace updated" : "ResearchSpec workspace initialized", workspace, operations, context.dryRun) }, diagnostics);
}

export async function handleUpdate(inputPath: string | undefined, options: UpdateOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context, inputPath);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const projectRoot = path.dirname(workspace);
  const configured = strings(record(snapshot.config.agent_tools).selected);
  let targetTools = configured;
  let selected = configured;
  if (options.tools !== undefined) {
    try { targetTools = parseToolExpression(options.tools); } catch (error) { throw new CliError("invalid_tools", error instanceof Error ? error.message : String(error), 2); }
    if (options.tools !== "none") selected = [...new Set([...configured, ...targetTools])];
  }
  if (!targetTools.length) return success("update", { workspace, selected_tools: selected, plan: [] }, { stdout: "ResearchSpec update: nothing to do.\n" });
  const existingInstallations = installationRecords(snapshot.manifest.installations);
  const delivery = await planToolDelivery({ projectRoot, toolIds: targetTools, existingInstallations, force: context.force });
  const targetSet = new Set(targetTools);
  const untouched = existingInstallations.filter((item) => !targetSet.has(item.tool_id));
  const operations = [...delivery.operations];
  const diagnostics = [...delivery.diagnostics];
  const desiredKeys = new Set(delivery.installations.map((item) => `${item.scope}:${item.path}`));
  const retainedStale: InstallationRecord[] = [];
  for (const installation of existingInstallations.filter((item) => targetSet.has(item.tool_id) && !desiredKeys.has(`${item.scope}:${item.path}`))) {
    if (installation.scope === "shared-global") { retainedStale.push(installation); continue; }
    const target = path.resolve(projectRoot, installation.path);
    const bytes = await readBytes(target);
    if (bytes === undefined) continue;
    if (sha256(bytes) === installation.sha256) operations.push({ action: "remove-owned", path: target, relativePath: installation.path, scope: "project", ownership: "generated", previousHash: installation.sha256, reason: "remove stale manifest-owned generated file" });
    else {
      retainedStale.push(installation);
      diagnostics.push({ severity: "warning", code: "generated_file_drift", message: "Stale generated file has user modifications and was preserved.", path: target, blocking: false });
    }
  }
  const installations = deduplicateInstallations([...untouched, ...retainedStale, ...delivery.installations]);
  if (selected.join("\0") !== configured.join("\0")) {
    const configText = stringify({ ...snapshot.config, agent_tools: { ...record(snapshot.config.agent_tools), selected } });
    operations.push(await authoritativeWrite(path.join(workspace, "config.yaml"), "config.yaml", configText, "workspace", "add explicitly targeted tools"));
  }
  const manifestText = `${JSON.stringify({ schema_version: "1", package_version: "0.1.0", installations }, null, 2)}\n`;
  operations.push(await authoritativeWrite(path.join(workspace, "tool-installation-manifest.json"), "tool-installation-manifest.json", manifestText, "workspace", "commit generated ownership last"));
  if (!context.dryRun) await executeWritePlan({ operations });
  return deliveryResult("update", { workspace, selected_tools: selected, dry_run: context.dryRun, plan: summarizePlan(operations) }, { stdout: formatPlan(context.dryRun ? "ResearchSpec update dry run" : "ResearchSpec tools updated", workspace, operations, context.dryRun) }, [...diagnostics, ...operationDiagnostics(operations)]);
}

export async function handleStatus(context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  const data = await buildStatus(snapshot);
  const ok = snapshot.diagnostics.every((item) => !item.blocking);
  return { ...success("status", data, { stdout: formatStatusHuman(data) }, snapshot.diagnostics), ok, exitCode: ok ? 0 : 1 };
}

export async function handleInstructions(selector: string, context: CommandContext): Promise<CommandResult> {
  if (!WorkItemSelectorSchema.safeParse(selector).success) throw new CliError("invalid_work_item_selector", `Invalid work-item selector: ${selector}`, 2, "Use the canonical form work:<safe-id>.");
  const workspace = await requireWorkspace(context);
  const result = await buildWorkflowInstructions(await loadWorkspaceSnapshot(workspace), selector.slice("work:".length));
  if (!result.ok) {
    const messages = {
      workflow_unconfigured: "The current workflow has no dynamic work-item graph.",
      workflow_invalid: "The current workflow graph is invalid.",
      work_item_not_found: `Work item not found: ${selector}`,
      work_item_blocked: `Work item is blocked: ${selector}`,
      work_item_already_done: `Work item is already complete: ${selector}`,
      workflow_resource_unavailable: `The work-item template could not be resolved: ${selector}`,
    } as const;
    throw new CliError(result.code, messages[result.code], 1, undefined, { selector, item: result.item, resolver: result.details });
  }
  const packet = result.packet;
  return success("instructions", packet, { stdout: [`Work item: ${packet.selector}`, `Producer skill: ${packet.producer_skill}`, `Output: ${packet.output.resolved_path}`, `Template: ${packet.output.template_ref}`, ""].join("\n") });
}

export async function handleSubmit(selector: string, options: SubmitOptions, context: CommandContext): Promise<CommandResult> {
  if (!WorkItemSelectorSchema.safeParse(selector).success) throw new CliError("invalid_work_item_selector", `Invalid work-item selector: ${selector}`, 2, "Use the canonical form work:<safe-id>.");
  if (options.expectedSha256 !== undefined && !Sha256Schema.safeParse(options.expectedSha256).success) throw new CliError("invalid_expected_sha256", "--expected-sha256 must be 64 lowercase hexadecimal characters.", 2);
  if (!SubmitActorKindSchema.safeParse(options.actorKind).success) throw new CliError("invalid_actor_kind", "--actor-kind must be human, agent, script, converter, or validator.", 2);
  const actorResult = SubmitActorSchema.safeParse({ kind: options.actorKind, name: options.actorName });
  if (!actorResult.success) throw new CliError("invalid_submission_input", "Submit actor is invalid.", 2, undefined, actorResult.error.issues);
  if (!context.dryRun && !context.interactive && (!context.yes || !options.expectedSha256)) {
    throw new CliError("confirmation_required", "Non-interactive Submit requires --expected-sha256 and --yes.", 2, "Run the identical payload with --dry-run --json first; --yes authorizes registration only.");
  }
  const workspace = await requireWorkspace(context);
  const inputPath = path.resolve(context.cwd, options.input);
  let payload: unknown;
  try { payload = JSON.parse(await readFile(inputPath, "utf8")) as unknown; }
  catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    throw new CliError("invalid_submission_input", nodeError.code === "ENOENT" ? `Submission input file not found: ${inputPath}` : `Cannot read submission input: ${error instanceof Error ? error.message : String(error)}`, 2);
  }
  try {
    const plan = await planArtifactSubmit({ snapshot: await loadWorkspaceSnapshot(workspace), selector, payload, actor: actorResult.data, expectedSha256: options.expectedSha256 });
    if (!context.dryRun && plan.status !== "already_submitted" && !context.yes) {
      const approved = await confirm({ message: `Submit ${selector} at SHA-256 ${plan.candidate_sha256} and register its receipt? This does not update state, Gates, or Decisions.`, default: false });
      if (!approved) throw new CliError("cancelled", "Artifact submission cancelled.", 1);
    }
    const result = context.dryRun ? undefined : await executeArtifactSubmit(plan, workspace);
    const status = context.dryRun ? plan.status : result?.status ?? plan.status;
    return success("submit", {
      status,
      selector,
      candidate_sha256: plan.candidate_sha256,
      artifact: plan.artifact,
      receipt_artifact: plan.receipt_artifact,
      validation: plan.validation,
      projected_completion: plan.projected_completion,
      dry_run: context.dryRun,
      plan: summarizePlan(plan.writePlan.operations),
      workflow_control_after: result?.workflow_control_after ?? null,
      state_updated: false,
      gate_appended: false,
      decision_appended: false,
    }, { stdout: `${context.dryRun ? "Would submit" : status === "already_submitted" ? "Already submitted" : "Submitted"} ${selector} at ${plan.candidate_sha256}.\n` });
  } catch (error) {
    if (error instanceof CliError) throw error;
    if (error instanceof ArtifactSubmitError) throw new CliError(error.code, error.message, error.kind === "usage" ? 2 : error.kind === "conflict" ? 3 : 1, undefined, error.details);
    if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") throw new CliError("submission_conflict", error instanceof Error ? error.message : String(error), 3);
    if (isFileSystemError(error)) throw error;
    throw new CliError("internal_error", error instanceof Error ? error.message : String(error), 4);
  }
}

export async function handleCheck(target: string | undefined, strict: boolean, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const validTargets = ["all", "contracts", "runtime", "artifacts", "tools"];
  const resolvedTarget = target ?? "all";
  if (!validTargets.includes(resolvedTarget)) throw new CliError("invalid_check_target", `Unknown check target: ${resolvedTarget}`, 2);
  const data = await runWorkspaceChecks(workspace, resolvedTarget as CheckTarget, strict);
  const human = data.ok
    ? { stdout: `ResearchSpec check passed: ${workspace}\n` }
    : { stderr: `ResearchSpec check failed: ${workspace}\n${data.diagnostics.map((item) => `- [${item.code}] ${item.path ?? ""} ${item.message}`).join("\n")}\n` };
  return { command: "check", ok: data.ok, exitCode: data.ok ? 0 : 1, data, diagnostics: data.diagnostics, human };
}

export async function handleList(type: string | undefined, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const allowed = ["changes", "artifacts", "gates", "decisions", "tools"];
  const listType = type ?? "changes";
  if (!allowed.includes(listType)) throw new CliError("invalid_list_type", `Unknown list type: ${listType}`, 2);
  const items = listItems(await loadWorkspaceSnapshot(workspace), listType as ListType);
  return success("list", { type: listType, items }, { stdout: items.length ? `${items.map((item) => `${item.selector}\t${item.path ?? ""}`).join("\n")}\n` : `No ${listType}.\n` });
}

export async function handleShow(selector: string, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const result = showItem(await loadWorkspaceSnapshot(workspace), selector);
  if (!result.item) {
    if (result.candidates.length) throw new CliError("item_ambiguous", `Item selector is ambiguous: ${selector}`, 2, undefined, { candidates: result.candidates.map((item) => item.selector) });
    throw new CliError("item_not_found", `Item not found: ${selector}`, 1);
  }
  return success("show", result.item, { stdout: `${JSON.stringify(result.item.value, null, 2)}\n` });
}

export async function handleHandoff(options: HandoffOptions, context: CommandContext): Promise<CommandResult> {
  if (options.stdout && options.out) throw new CliError("conflicting_options", "--stdout and --out cannot be used together.", 2);
  const workspace = await requireWorkspace(context);
  const content = await renderHandoff(await loadWorkspaceSnapshot(workspace));
  if (options.stdout) return success("handoff", { workspace, written: false, content }, { stdout: content });
  const target = options.out ? path.resolve(context.cwd, options.out) : path.join(workspace, "runs/current/handoff.md");
  const operation = await authoritativeWrite(target, path.relative(workspace, target), content, "workspace", "render handoff view");
  if (!context.dryRun) await executeWritePlan({ operations: [operation] });
  return success("handoff", { workspace, path: target, sha256: sha256(content), dry_run: context.dryRun, plan: summarizePlan([operation]) }, { stdout: `${context.dryRun ? "Would write" : "Wrote"} handoff: ${target}\n` });
}

export async function handlePack(options: PackOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const bundle = await buildContextPack(await loadWorkspaceSnapshot(workspace), Boolean(options.includeArtifacts));
  const projectRoot = path.dirname(workspace);
  const target = options.out ? path.resolve(context.cwd, options.out) : path.join(projectRoot, `${path.basename(projectRoot)}-researchspec-context.zip`);
  if ((await fileExists(target)) && !context.force) throw new CliError("output_exists", `Pack output already exists: ${target}`, 3, "Use --force to replace this derived bundle.");
  const existing = await readBytes(target);
  const operation: PlannedWrite = { action: existing === undefined ? "create" : "refresh", path: target, content: bundle.bytes, scope: "project", ownership: "generated", ...(existing ? { previousHash: sha256(existing) } : {}), nextHash: bundle.sha256, reason: "write deterministic context bundle" };
  if (!context.dryRun) await executeWritePlan({ operations: [operation] });
  return success("pack", { path: target, bytes: bundle.bytes.length, sha256: bundle.sha256, entries: bundle.entries, dry_run: context.dryRun, plan: summarizePlan([operation]) }, { stdout: `${context.dryRun ? "Would write" : "Wrote"} context pack: ${target}\n` });
}

export async function handlePropose(changeId: string, options: ProposeOptions, context: CommandContext): Promise<CommandResult> {
  if (context.force) throw new CliError("force_not_supported", "--force does not apply to create-only proposals.", 2);
  const workspace = await requireWorkspace(context);
  let payload: unknown;
  const inputPath = path.resolve(context.cwd, options.input);
  try { payload = JSON.parse(await readFile(inputPath, "utf8")) as unknown; }
  catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    throw new CliError("invalid_proposal_input", nodeError.code === "ENOENT" ? `Proposal input file not found: ${inputPath}` : `Cannot read proposal input: ${error instanceof Error ? error.message : String(error)}`, 2);
  }
  try {
    const snapshot = await loadWorkspaceSnapshot(workspace);
    const proposal = await planContractChangeProposal({ snapshot, changeId, payload, actorKind: options.actorKind, actorName: options.actorName });
    if (!context.dryRun && !context.yes) {
      if (!context.interactive) throw new CliError("confirmation_required", "Non-interactive proposal creation requires --yes.", 2, "This confirms creation of a pending proposal only; it does not accept the change.");
      const approved = await confirm({ message: `Create pending ${proposal.patch.risk_level}-risk change ${changeId} with ${String(proposal.patch.patches.length)} patch(es)?`, default: false });
      if (!approved) throw new CliError("cancelled", "Proposal creation cancelled.", 1);
    }
    if (!context.dryRun) {
      await assertProposalBasisCurrent(workspace, proposal.patch);
      await executeWritePlan({ operations: proposal.operations });
    }
    return success("propose", {
      workspace,
      selector: `change:${changeId}`,
      status: proposal.patch.status,
      risk_level: proposal.patch.risk_level,
      requires_human_decision: true,
      dry_run: context.dryRun,
      plan: summarizePlan(proposal.operations),
    }, { stdout: `${context.dryRun ? "Would create" : "Created"} pending contract change change:${changeId}.\n` });
  } catch (error) {
    if (error instanceof CliError) throw error;
    if (error instanceof ContractChangeError) {
      const exitCode = error.kind === "usage" ? 2 : error.kind === "conflict" ? 3 : 1;
      throw new CliError(error.code, error.message, exitCode, undefined, error.details);
    }
    if (isFileSystemError(error)) throw error;
    throw new CliError("proposal_blocked", error instanceof Error ? error.message : String(error), 1);
  }
}

export async function handleDecide(selector: string | undefined, options: DecideOptions, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  if (!selector) {
    const items = [...snapshot.changes, ...snapshot.patches].filter((item) => !["applied", "rejected", "superseded"].includes(String(record(item.value).status)));
    return success("decide", { pending_items: items }, { stdout: items.length ? `${items.map((item) => item.selector).join("\n")}\n` : "No pending items.\n" });
  }
  let decision = options.decision;
  const selectedItem = snapshot.items.find((item) => item.selector === selector);
  const rawRisk = selectedItem ? record(selectedItem.value).risk_level : undefined;
  const risk = typeof rawRisk === "string" ? rawRisk : "unspecified";
  if (!decision && context.interactive) decision = await select({ message: `Decision for ${selector} (${selectedItem?.type ?? "item"}, risk: ${risk})`, choices: [{ name: "Accept", value: "accept" as const }, { name: "Reject", value: "reject" as const }, { name: "Postpone", value: "postpone" as const }] });
  if (!decision) throw new CliError("decision_required", "A decision is required outside a TTY.", 2, "Pass --decision accept, reject, or postpone.");
  const actorName = options.actorName ?? (context.interactive ? await input({ message: "Human actor name", validate: (value) => Boolean(value.trim()) || "Actor name is required." }) : undefined);
  if (!actorName) throw new CliError("actor_required", "--actor-name is required for a human decision.", 2);
  const reason = options.reason ?? (context.interactive && decision !== "postpone" ? await input({ message: "Decision rationale", validate: (value) => Boolean(value.trim()) || "Rationale is required." }) : undefined);
  try {
    const outcome = await decideItem({ snapshot, selector, decision, actorName, reason, dryRun: context.dryRun });
    return success("decide", { ...outcome, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would record" : "Recorded"} ${outcome.status} decision for ${outcome.item}.\n` });
  } catch (error) {
    if (error instanceof ContractChangeError) throw new CliError(error.code, error.message, 1, undefined, error.details);
    if (isFileSystemError(error)) throw error;
    throw new CliError("decision_blocked", error instanceof Error ? error.message : String(error), 1);
  }
}

export async function handleArchive(selector: string | undefined, context: CommandContext): Promise<CommandResult> {
  const workspace = await requireWorkspace(context);
  const snapshot = await loadWorkspaceSnapshot(workspace);
  if (!selector) {
    const items = [...snapshot.changes, ...snapshot.patches].filter((item) => ["applied", "rejected", "superseded"].includes(String(record(item.value).status)));
    return success("archive", { archivable_items: items }, { stdout: items.length ? `${items.map((item) => item.selector).join("\n")}\n` : "No archivable items.\n" });
  }
  try {
    const result = await archiveItem({ snapshot, selector, dryRun: context.dryRun });
    return success("archive", { ...result, dry_run: context.dryRun }, { stdout: `${context.dryRun ? "Would archive" : "Archived"} ${selector} to ${result.target}.\n` });
  } catch (error) { if (isFileSystemError(error)) throw error; throw new CliError("archive_blocked", error instanceof Error ? error.message : String(error), 1); }
}

async function requireWorkspace(context: CommandContext, positional?: string): Promise<string> {
  const explicit = context.workspace ?? positional;
  const resolution = await resolveWorkspace(context.cwd, explicit);
  if (resolution.status === "found") return resolution.workspace;
  if (resolution.status === "invalid") throw new CliError("workspace_invalid", `Invalid ResearchSpec workspace: ${resolution.path}`, 1);
  throw new CliError("workspace_missing", "No researchspec workspace found.", 1, "Run researchspec init to create one.");
}

async function authoritativeWrite(target: string, relativePath: string, content: string | Uint8Array, scope: PlannedWrite["scope"], reason: string): Promise<PlannedWrite> {
  const existing = await readOptionalText(target);
  const nextHash = sha256(content);
  const previousHash = existing === undefined ? undefined : sha256(existing);
  return { action: existing === undefined ? "create" : previousHash === nextHash ? "skip-unchanged" : "refresh", path: target, relativePath, content, scope, ownership: "user", ...(previousHash ? { previousHash } : {}), nextHash, reason };
}

function summarizePlan(operations: PlannedWrite[]) {
  return operations.map((operation) => ({ action: operation.action, path: operation.path, relativePath: operation.relativePath, scope: operation.scope, ownership: operation.ownership, previousHash: operation.previousHash, nextHash: operation.nextHash, reason: operation.reason }));
}
function writableCount(operations: PlannedWrite[]): number { return operations.filter((item) => item.action === "create" || item.action === "refresh" || item.action === "remove-owned").length; }
function formatPlan(title: string, workspace: string, operations: PlannedWrite[], dryRun: boolean): string {
  const labels: Record<PlannedWrite["action"], string> = dryRun
    ? { create: "Would create", refresh: "Would refresh", "remove-owned": "Would remove", move: "Would move", "skip-unchanged": "skip-unchanged", "skip-drift": "skip-drift", conflict: "conflict" }
    : { create: "Created", refresh: "Refreshed", "remove-owned": "Removed", move: "Moved", "skip-unchanged": "skip-unchanged", "skip-drift": "skip-drift", conflict: "conflict" };
  return `${title}\nWorkspace: ${workspace}\n${operations.map((item) => `${labels[item.action]}: ${item.path}`).join("\n")}\n`;
}
function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function records(value: unknown): Record<string, unknown>[] { return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : []; }
function strings(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; }
function installationRecords(value: unknown): InstallationRecord[] {
  return records(value).filter((item): item is Record<string, unknown> & InstallationRecord =>
    typeof item.tool_id === "string" && typeof item.path === "string" &&
    (item.scope === "project" || item.scope === "shared-global") && typeof item.sha256 === "string" &&
    typeof item.source === "string" && item.adapter_version === "1");
}
function deduplicateInstallations(items: InstallationRecord[]): InstallationRecord[] { return [...new Map(items.map((item) => [`${item.scope}:${item.path}`, item])).values()].sort((a, b) => a.tool_id.localeCompare(b.tool_id) || a.path.localeCompare(b.path)); }
function operationDiagnostics(operations: PlannedWrite[]): Diagnostic[] { return operations.filter((item) => item.action === "skip-drift" || item.action === "conflict").map((item) => ({ severity: "warning", code: item.action === "skip-drift" ? "generated_file_drift" : "generated_file_conflict", message: item.reason, path: item.path, blocking: false })); }
function deliveryResult<T>(command: string, data: T, human: { stdout: string }, diagnostics: Diagnostic[]): CommandResult<T> {
  const base = success(command, data, human, diagnostics);
  return diagnostics.some((item) => item.blocking)
    ? { ...base, ok: false, exitCode: 1, error: { code: "tool_delivery_incomplete", message: "One or more selected tools could not be delivered." } }
    : base;
}

async function readBytes(filePath: string): Promise<Uint8Array | undefined> {
  try { return await readFile(filePath); }
  catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") return undefined;
    throw error;
  }
}

function previewSummary(operations: PlannedWrite[]): string {
  const counts = new Map<string, number>();
  for (const operation of operations) counts.set(operation.action, (counts.get(operation.action) ?? 0) + 1);
  const globals = operations.filter((operation) => operation.scope === "shared-global").map((operation) => operation.path);
  return [`Plan: ${[...counts].map(([action, count]) => `${action}=${String(count)}`).join(", ")}`, ...(globals.length ? ["Shared-global writes:", ...globals.map((filePath) => `- ${filePath}`)] : [])].join("\n");
}

function isFileSystemError(value: unknown): value is NodeJS.ErrnoException { return value instanceof Error && typeof (value as NodeJS.ErrnoException).code === "string"; }
