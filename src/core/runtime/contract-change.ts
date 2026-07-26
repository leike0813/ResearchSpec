import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { parse, stringify } from "yaml";
import { fileExists } from "../../utils/fs.js";
import {
  ProposalInputSchema,
  STABLE_CONTRACT_PATHS,
  type ContractPatchOperation,
  type ProposalInput,
  type ProposalRisk,
  type StableContractPath,
} from "../contracts/contract-change.js";
import { CaseSafeIdSchema } from "../contracts/case-state.js";
import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import { planFile, sha256, type PlannedWrite } from "../workspace/write-plan.js";

export {
  ProposalInputSchema,
  STABLE_CONTRACT_PATHS,
  type ContractPatchOperation,
  type ProposalInput,
  type ProposalRisk,
  type StableContractPath,
};

export interface CanonicalContractPatch extends ProposalInput {
  schema_version: "0.1";
  change_id: string;
  status: "proposed";
  created_at: string;
  created_by: { kind: "human" | "agent"; name: string };
  requires_human_decision: true;
  validation: {
    validated_at: string;
    target_hashes: Record<string, string>;
    artifact_ids: string[];
    decision_ids: string[];
  };
  patches: Array<ProposalInput["patches"][number] & { patch_id: string }>;
}

export class ContractChangeError extends Error {
  constructor(readonly kind: "usage" | "domain" | "conflict", readonly code: string, message: string, readonly details?: unknown) {
    super(message);
    this.name = "ContractChangeError";
  }
}

export async function planContractChangeProposal(input: {
  snapshot: WorkspaceSnapshot;
  changeId: string;
  payload: unknown;
  actorKind: "human" | "agent";
  actorName: string;
  now?: string;
}): Promise<{ patch: CanonicalContractPatch; operations: PlannedWrite[] }> {
  const idResult = CaseSafeIdSchema.safeParse(input.changeId);
  if (!idResult.success) throw usage("invalid_change_id", `Unsafe change ID: ${input.changeId}`, idResult.error.issues);
  if (!input.actorName.trim()) throw usage("invalid_actor", "Actor name must not be empty.");
  const payloadResult = ProposalInputSchema.safeParse(input.payload);
  if (!payloadResult.success) throw usage("invalid_proposal_input", "Proposal input does not match the strict schema.", payloadResult.error.issues);
  const blocker = input.snapshot.diagnostics.find((diagnostic) => diagnostic.blocking);
  if (blocker) throw domain("proposal_workspace_invalid", `Workspace must pass deterministic validation before proposing a contract change: ${blocker.code}`, blocker);

  await assertChangeIdAvailable(input.snapshot.workspace, input.changeId);
  const now = input.now ?? new Date().toISOString();
  const payload = payloadResult.data;
  validateEvidenceReferences(input.snapshot, payload.patches);

  const targetHashes: Record<string, string> = {};
  const grouped = new Map<StableContractPath, ProposalInput["patches"]>();
  for (const patch of payload.patches) grouped.set(patch.target_contract, [...(grouped.get(patch.target_contract) ?? []), patch]);
  for (const [targetContract, patches] of grouped) {
    const source = input.snapshot.files.get(targetContract)?.text;
    if (source === undefined) throw domain("proposal_target_missing", `Stable contract is unavailable: ${targetContract}`);
    validateAndApplyContractOperations(targetContract, source, patches);
    targetHashes[targetContract] = sha256(source);
  }

  const patch: CanonicalContractPatch = {
    schema_version: "0.1",
    change_id: input.changeId,
    title: payload.title,
    status: "proposed",
    created_at: now,
    created_by: { kind: input.actorKind, name: input.actorName.trim() },
    rationale: payload.rationale,
    risk_level: payload.risk_level,
    impact: payload.impact,
    requires_human_decision: true,
    validation: {
      validated_at: now,
      target_hashes: Object.fromEntries(Object.entries(targetHashes).sort(([left], [right]) => left.localeCompare(right))),
      artifact_ids: unique(payload.patches.flatMap((item) => item.source_artifact_ids)),
      decision_ids: unique(payload.patches.flatMap((item) => item.source_decision_ids)),
    },
    patches: payload.patches.map((item, index) => ({ patch_id: `P${String(index + 1).padStart(3, "0")}`, ...item })),
  };

  const root = path.join(input.snapshot.workspace, "changes", input.changeId);
  const files = [
    { name: "proposal.md", content: renderProposal(patch) },
    { name: "tasks.md", content: renderProposalTasks(patch) },
    { name: "contract-patch.yaml", content: stringify(patch) },
  ];
  const operations: PlannedWrite[] = [];
  for (const file of files) {
    const target = path.join(root, file.name);
    const operation = await planFile({ path: target, relativePath: `changes/${input.changeId}/${file.name}`, content: file.content, scope: "workspace", ownership: "user" });
    if (operation.action !== "create") throw conflict("proposal_target_exists", `Proposal target already exists: ${target}`);
    operations.push(operation);
  }
  return { patch, operations };
}

export async function assertProposalBasisCurrent(workspace: string, patch: CanonicalContractPatch): Promise<void> {
  for (const [relativePath, expectedHash] of Object.entries(patch.validation.target_hashes)) {
    const target = path.join(workspace, relativePath);
    let current: string;
    try { current = await readFile(target, "utf8"); }
    catch { throw domain("proposal_target_missing", `Proposal target became unavailable after planning: ${relativePath}`); }
    if (sha256(current) !== expectedHash) throw domain("proposal_basis_changed", `Proposal target changed after planning: ${relativePath}`);
  }
}

export function validateAndApplyContractOperations(relativePath: string, source: string, operations: readonly Record<string, unknown>[]): string {
  if (!STABLE_CONTRACT_PATHS.includes(relativePath as StableContractPath)) throw domain("unsupported_contract", `Unsupported contract target: ${relativePath}`);
  if (relativePath.endsWith(".md")) return applyMarkdownOperations(source, operations);
  let document: unknown;
  try { document = parse(source); }
  catch (error) { throw domain("invalid_contract_source", `Cannot parse contract target ${relativePath}: ${error instanceof Error ? error.message : String(error)}`); }
  const next = applyYamlOperations(document, operations);
  return stringify(next);
}

export function validateEvidenceReferences(snapshot: WorkspaceSnapshot, operations: readonly Record<string, unknown>[]): void {
  const artifacts = new Set(snapshot.artifacts.map((item) => string(item.artifact_id)).filter(Boolean));
  const decisions = new Set(snapshot.decisions.map((item) => string(item.decision_id)).filter(Boolean));
  for (const operation of operations) {
    for (const id of strings(operation.source_artifact_ids)) if (!artifacts.has(id)) throw domain("artifact_reference_missing", `Referenced artifact does not exist: ${id}`);
    for (const id of strings(operation.source_decision_ids)) if (!decisions.has(id)) throw domain("decision_reference_missing", `Referenced decision does not exist: ${id}`);
  }
}

function applyYamlOperations(root: unknown, operations: readonly Record<string, unknown>[]): unknown {
  for (const operation of operations) {
    const targetPath = requiredString(operation.target_path, "target_path");
    const op = operationName(operation.operation);
    const location = resolveYamlLocation(root, targetPath, op === "add");
    const exists = Object.hasOwn(location.parent, location.key);
    const current = location.parent[location.key];
    validateOperationValues(op, exists, current, operation, targetPath);
    if (op === "remove") Reflect.deleteProperty(location.parent, location.key);
    else if (op === "append") (current as unknown[]).push(operation.proposed_value);
    else if (op === "merge") Object.assign(current as Record<string, unknown>, operation.proposed_value as Record<string, unknown>);
    else location.parent[location.key] = operation.proposed_value;
  }
  return root;
}

function resolveYamlLocation(root: unknown, targetPath: string, allowMissingFinal: boolean): { parent: Record<string, unknown>; key: string } {
  if (!targetPath || targetPath.startsWith(".") || targetPath.endsWith(".") || targetPath.includes("..") || /[/\\]/.test(targetPath)) {
    throw domain("invalid_target_path", `Invalid YAML target path: ${targetPath}`);
  }
  const segments = targetPath.split(".");
  let current = asRecordOrThrow(root, "contract root");
  for (let index = 0; index < segments.length - 1; index += 1) current = resolveYamlSegment(current, segments[index]);
  const final = segments.at(-1) ?? "";
  if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(final)) throw domain("invalid_target_path", `Final YAML target must be a property: ${final}`);
  if (!allowMissingFinal && !Object.hasOwn(current, final)) throw domain("proposal_target_missing", `Patch target does not exist: ${targetPath}`);
  return { parent: current, key: final };
}

function resolveYamlSegment(parent: Record<string, unknown>, segment: string): Record<string, unknown> {
  const selector = /^([A-Za-z_][A-Za-z0-9_-]*)\[([A-Za-z0-9][A-Za-z0-9._-]*)\]$/.exec(segment);
  if (selector) {
    const collection = parent[selector[1]];
    if (!Array.isArray(collection)) throw domain("selector_target_not_array", `Selector target is not an array: ${selector[1]}`);
    const matches = collection.filter((item) => Object.entries(asRecord(item)).some(([key, value]) => key.endsWith("_id") && value === selector[2]));
    if (matches.length !== 1) throw domain("selector_not_unique", `Selector must match exactly one item: ${segment}`, { matches: matches.length });
    return asRecordOrThrow(matches[0], segment);
  }
  if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(segment)) throw domain("invalid_target_path", `Invalid YAML path segment: ${segment}`);
  if (!Object.hasOwn(parent, segment)) throw domain("proposal_target_missing", `Patch path segment does not exist: ${segment}`);
  return asRecordOrThrow(parent[segment], segment);
}

function applyMarkdownOperations(source: string, operations: readonly Record<string, unknown>[]): string {
  let result = source;
  for (const operation of operations) {
    const op = operationName(operation.operation);
    if (op !== "replace") throw domain("invalid_markdown_operation", "Markdown contracts support only replace.");
    const targetPath = requiredString(operation.target_path, "target_path");
    const match = /^section\[([^\]\r\n]+)\]$/.exec(targetPath);
    if (!match) throw domain("invalid_markdown_target", `Markdown target must use section[Heading]: ${targetPath}`);
    const heading = escapeRegExp(match[1]);
    const pattern = new RegExp(`(^## ${heading}\\r?\\n)([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "gm");
    const matches = [...result.matchAll(pattern)];
    if (matches.length !== 1) throw domain("markdown_section_not_unique", `Markdown section must exist exactly once: ${match[1]}`, { matches: matches.length });
    const current = matches[0][2].trim();
    validateOperationValues(op, true, current, operation, targetPath);
    if (typeof operation.proposed_value !== "string") throw domain("invalid_proposed_value", "Markdown proposed_value must be a string.");
    const replacement = `${matches[0][1]}\n${operation.proposed_value.trim()}\n\n`;
    result = `${result.slice(0, matches[0].index)}${replacement}${result.slice((matches[0].index ?? 0) + matches[0][0].length)}`;
  }
  return result;
}

function validateOperationValues(op: ContractPatchOperation, exists: boolean, current: unknown, operation: Record<string, unknown>, targetPath: string): void {
  const hasCurrent = Object.hasOwn(operation, "current_value") && operation.current_value !== undefined;
  const hasProposed = Object.hasOwn(operation, "proposed_value") && operation.proposed_value !== undefined;
  if (op === "add") {
    if (exists) throw domain("proposal_target_exists", `Add target already exists: ${targetPath}`);
    if (hasCurrent || !hasProposed) throw usage("invalid_patch_values", "Add requires proposed_value and forbids current_value.");
    return;
  }
  if (!exists) throw domain("proposal_target_missing", `Patch target does not exist: ${targetPath}`);
  if (!hasCurrent || !deepEqual(current, operation.current_value)) throw domain("current_value_conflict", `Patch current_value conflict at ${targetPath}`, { actual: current, expected: operation.current_value });
  if (op === "remove") {
    if (hasProposed) throw usage("invalid_patch_values", "Remove forbids proposed_value.");
  } else if (!hasProposed) throw usage("invalid_patch_values", `${op} requires proposed_value.`);
  if (op === "append" && !Array.isArray(current)) throw domain("append_target_not_array", `Append target is not an array: ${targetPath}`);
  if (op === "merge" && (!isRecord(current) || !isRecord(operation.proposed_value))) throw domain("merge_target_not_object", `Merge requires object target and proposed_value: ${targetPath}`);
}

async function assertChangeIdAvailable(workspace: string, changeId: string): Promise<void> {
  const active = path.join(workspace, "changes", changeId);
  if (await fileExists(active)) throw conflict("change_id_active", `Active change ID already exists: ${changeId}`);
  for (const archiveRoot of [path.join(workspace, "changes", "archive")]) {
    if (!(await fileExists(archiveRoot))) continue;
    const entries = await readdir(archiveRoot, { withFileTypes: true });
    if (entries.some((entry) => entry.name === changeId || entry.name.endsWith(`-${changeId}`))) throw conflict("change_id_archived", `Archived change ID already exists: ${changeId}`);
  }
}

function renderProposal(patch: CanonicalContractPatch): string {
  return `# ${patch.title}\n\n## Rationale\n\n${patch.rationale}\n\n## Impact\n\n${patch.impact.map((item) => `- ${item}`).join("\n")}\n\n## Risk And Decision\n\nRisk: **${patch.risk_level}**. This pending change requires an explicit human decision before any stable contract is modified.\n`;
}

function renderProposalTasks(patch: CanonicalContractPatch): string {
  return `# Review Tasks\n\n- [ ] Inspect the current values and evidence for ${String(patch.patches.length)} proposed patch${patch.patches.length === 1 ? "" : "es"}.\n- [ ] Confirm the stated impact and ${patch.risk_level} risk classification.\n- [ ] Accept, reject, or postpone this change through \`researchspec decide change:${patch.change_id}\`.\n`;
}

function operationName(value: unknown): ContractPatchOperation {
  if (value === "add" || value === "replace" || value === "remove" || value === "append" || value === "merge") return value;
  throw usage("invalid_patch_operation", `Unsupported patch operation: ${String(value)}`);
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value) throw usage("invalid_patch_input", `${label} must be a non-empty string.`);
  return value;
}

function strings(value: unknown): string[] { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []; }
function string(value: unknown): string { return typeof value === "string" ? value : ""; }
function unique(values: string[]): string[] { return [...new Set(values)].sort(); }
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function asRecord(value: unknown): Record<string, unknown> { return isRecord(value) ? value : {}; }
function asRecordOrThrow(value: unknown, label: string): Record<string, unknown> { if (!isRecord(value)) throw domain("target_not_object", `Patch path is not an object at ${label}.`); return value; }
function deepEqual(left: unknown, right: unknown): boolean { return isDeepStrictEqual(left, right); }
function escapeRegExp(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function usage(code: string, message: string, details?: unknown): ContractChangeError { return new ContractChangeError("usage", code, message, details); }
function domain(code: string, message: string, details?: unknown): ContractChangeError { return new ContractChangeError("domain", code, message, details); }
function conflict(code: string, message: string, details?: unknown): ContractChangeError { return new ContractChangeError("conflict", code, message, details); }
