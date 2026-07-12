import { randomUUID } from "node:crypto";
import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { parse, stringify } from "yaml";

import { fileExists, readOptionalText } from "../../utils/fs.js";
import type { IndexedItem, WorkspaceSnapshot } from "../workspace/snapshot.js";
import { resolveItem } from "../workspace/snapshot.js";
import { executeWritePlan, hashPath, sha256, type PlannedWrite } from "../workspace/write-plan.js";
import { validateAndApplyContractOperations, validateEvidenceReferences } from "./contract-change.js";
import { evaluateWorkflowControl } from "./workflow-control.js";
import { GateSubmitReceiptSchema } from "../contracts/gate-transition.js";

export type DecisionChoice = "accept" | "reject" | "postpone";

export interface DecisionOutcome {
  item: string;
  decision_id: string;
  status: "accepted" | "rejected" | "postponed";
  writes: string[];
}

export async function decideItem(input: { snapshot: WorkspaceSnapshot; selector: string; decision: DecisionChoice; actorName: string; reason?: string; dryRun: boolean }): Promise<DecisionOutcome> {
  const blockingDiagnostic = input.snapshot.diagnostics.find((diagnostic) => diagnostic.blocking);
  if (blockingDiagnostic) throw new Error(`Workspace is not valid for decisions: ${blockingDiagnostic.code}`);
  if (input.selector.startsWith("transition:")) return decideTransition(input);
  const resolved = resolveItem(input.snapshot, input.selector);
  if (!resolved.item) throw new Error(resolved.candidates.length > 1 ? `Ambiguous item: ${resolved.candidates.map((item) => item.selector).join(", ")}` : `Item not found: ${input.selector}`);
  const item = resolved.item;
  if (!(["change", "patch", "gate"] as string[]).includes(item.type)) throw new Error(`Item type cannot be decided: ${item.type}`);
  if (item.type !== "gate") assertSafeId(item.id, "item ID");
  if (item.type === "change" || item.type === "patch") {
    const currentStatus = string(record(item.value).status) || "proposed";
    if (!["proposed", "postponed"].includes(currentStatus)) throw new Error(`Item is already resolved: ${currentStatus}`);
  } else {
    const gate = record(item.value);
    const existingOverride = latestDecisions(input.snapshot).find((decision) => decision.gate_id === item.id && decision.status === "accepted");
    if (gate.blocking !== true || gate.verdict === "pass" || existingOverride) throw new Error("Gate is not a pending blocking item.");
    if (gate.schema_version === "1") await assertTrustedGateForOverride(input.snapshot, gate);
  }
  if ((input.decision === "accept" || input.decision === "reject") && !input.reason) throw new Error("--reason is required for accept or reject.");

  const now = new Date().toISOString();
  const decisionId = `D-${randomUUID()}`;
  const operations: PlannedWrite[] = [];
  if (input.decision !== "postpone" && (item.type === "change" || item.type === "patch")) {
    if (input.decision === "accept") operations.push(...await acceptItem(input.snapshot, item, decisionId, now));
    operations.push(await lifecycleWrite(item, input.decision === "accept" ? "applied" : "rejected", decisionId, now));
  }

  const ledgerPath = path.join(input.snapshot.workspace, "runs/current/decision-ledger.jsonl");
  const ledger = await readOptionalText(ledgerPath) ?? "";
  const event = {
    event_id: `E-${randomUUID()}`, decision_id: decisionId, timestamp: now,
    actor: { kind: "human", name: input.actorName }, decision_type: item.type === "gate" ? "gate_override" : "patch_acceptance",
    selected_option: input.decision, status: input.decision === "accept" ? "accepted" : input.decision === "reject" ? "rejected" : "postponed",
    rationale: input.reason, ...(item.type === "change" ? { change_id: item.id } : {}), ...(item.type === "patch" ? { draft_patch_id: item.id } : {}), ...(item.type === "gate" ? { gate_id: item.id } : {}),
    ...(item.type === "gate" && typeof record(item.value).event_id === "string" ? { gate_event_id: record(item.value).event_id, gate_receipt_sha256: string(record(record(item.value).receipt).sha256) } : {}),
  };
  operations.push({ action: await fileExists(ledgerPath) ? "refresh" : "create", path: ledgerPath, relativePath: "runs/current/decision-ledger.jsonl", content: `${ledger}${JSON.stringify(event)}\n`, scope: "workspace", ownership: "user", previousHash: sha256(ledger), nextHash: sha256(`${ledger}${JSON.stringify(event)}\n`), reason: "append human decision last" });
  if (!input.dryRun) await executeWritePlan({ operations });
  return { item: item.selector, decision_id: decisionId, status: event.status as DecisionOutcome["status"], writes: operations.map((operation) => operation.path) };
}

async function assertTrustedGateForOverride(snapshot: WorkspaceSnapshot, gate: Record<string, unknown>): Promise<void> {
  if (gate.verification_kind !== "reverification" || typeof gate.confirmed_by !== "object" || typeof gate.receipt !== "object") throw new Error("Gate override requires the latest trusted confirmed reverification.");
  const reference = record(gate.receipt);
  if (typeof reference.path !== "string" || typeof reference.sha256 !== "string" || typeof reference.plan_sha256 !== "string") throw new Error("Gate override receipt reference is invalid.");
  const receiptPath = path.resolve(snapshot.workspace, reference.path);
  try {
    const bytes = await readFile(receiptPath);
    const receipt = GateSubmitReceiptSchema.parse(JSON.parse(Buffer.from(bytes).toString("utf8")) as unknown);
    if (sha256(bytes) !== reference.sha256 || receipt.plan_sha256 !== reference.plan_sha256 || receipt.event_id !== gate.event_id
      || receipt.gate_id !== gate.gate_id || receipt.verdict !== gate.verdict || receipt.verification_kind !== gate.verification_kind
      || JSON.stringify(receipt.evidence) !== JSON.stringify(gate.evidence) || JSON.stringify(receipt.confirmed_by) !== JSON.stringify(gate.confirmed_by)) throw new Error("receipt mismatch");
  } catch (error) { throw new Error(`Gate override requires a trusted receipt: ${error instanceof Error ? error.message : String(error)}`); }
}

async function decideTransition(input: { snapshot: WorkspaceSnapshot; selector: string; decision: DecisionChoice; actorName: string; reason?: string; dryRun: boolean }): Promise<DecisionOutcome> {
  const control = await evaluateWorkflowControl(input.snapshot);
  const transition = control.transitions.find((item) => item.selector === input.selector);
  if (!transition || transition.state !== "decision_required" || !transition.decision_point_id) throw new Error("Transition is not awaiting a branch Decision.");
  if ((input.decision === "accept" || input.decision === "reject") && !input.reason) throw new Error("--reason is required for accept or reject.");
  const existingAccepted = latestDecisions(input.snapshot).find((decision) => decision.decision_type === "workflow_branch" && decision.status === "accepted" && decision.decision_point_id === transition.decision_point_id);
  if (existingAccepted) throw new Error(`Decision point is already resolved: ${transition.decision_point_id}`);
  const now = new Date().toISOString();
  const decisionId = `D-${randomUUID()}`;
  const event = {
    event_id: `E-${randomUUID()}`, decision_id: decisionId, timestamp: now, actor: { kind: "human", name: input.actorName },
    decision_type: "workflow_branch", decision_point_id: transition.decision_point_id, transition_id: transition.transition_id,
    subflow_instance_id: transition.subflow_instance_id, selected_option: transition.transition_node_id,
    status: input.decision === "accept" ? "accepted" : input.decision === "reject" ? "rejected" : "postponed", rationale: input.reason,
  };
  const ledgerPath = path.join(input.snapshot.workspace, "runs/current/decision-ledger.jsonl");
  const ledger = await readOptionalText(ledgerPath) ?? "";
  const content = `${ledger}${JSON.stringify(event)}\n`;
  const operation: PlannedWrite = { action: await fileExists(ledgerPath) ? "refresh" : "create", path: ledgerPath, relativePath: "runs/current/decision-ledger.jsonl", content, scope: "workspace", ownership: "user", previousHash: sha256(ledger), nextHash: sha256(content), reason: "append workflow branch decision" };
  if (!input.dryRun) await executeWritePlan({ operations: [operation] });
  return { item: input.selector, decision_id: decisionId, status: event.status as DecisionOutcome["status"], writes: [ledgerPath] };
}

export async function archiveItem(input: { snapshot: WorkspaceSnapshot; selector: string; dryRun: boolean }): Promise<{ source: string; target: string }> {
  const resolved = resolveItem(input.snapshot, input.selector);
  const item = resolved.item;
  if (!item || (item.type !== "change" && item.type !== "patch") || !item.path) throw new Error(`Archivable item not found: ${input.selector}`);
  assertSafeId(item.id, "item ID");
  const status = string(record(item.value).status) || "proposed";
  if (!["applied", "rejected", "superseded"].includes(status)) throw new Error(`Item is not resolved: ${status}`);
  const itemValue = record(item.value);
  const decisionId = string(itemValue.decision_id);
  if (!decisionId) throw new Error("Resolved item has no decision record link.");
  const linkKey = item.type === "change" ? "change_id" : "draft_patch_id";
  const decision = input.snapshot.decisions.filter((event) => event.decision_id === decisionId).at(-1);
  const allowedDecisionStatuses = status === "applied" ? ["accepted"] : status === "rejected" ? ["rejected"] : ["accepted", "rejected"];
  if (!decision || !allowedDecisionStatuses.includes(String(decision.status)) || decision[linkKey] !== item.id) throw new Error("Item lifecycle is not backed by a matching decision ledger event.");
  const linkedBlockingGate = latestLinkedBlockingGate(input.snapshot, linkKey, item.id);
  if (linkedBlockingGate) {
    const gateId = string(linkedBlockingGate.gate_id);
    const override = latestDecisions(input.snapshot).find((decision) => decision.gate_id === gateId && decision.status === "accepted");
    if (!override) throw new Error(`Linked blocking gate is unresolved: ${gateId}`);
  }
  if (status === "applied") {
    const receiptId = string(itemValue.apply_receipt_artifact_id);
    const receipt = input.snapshot.artifacts.find((artifact) => artifact.artifact_id === receiptId);
    if (!receipt || typeof receipt.path !== "string" || typeof receipt.sha256 !== "string") throw new Error("Applied item is missing its registered receipt.");
    const projectRoot = path.dirname(input.snapshot.workspace);
    const receiptPath = path.resolve(projectRoot, receipt.path);
    if (!(await fileExists(receiptPath))) throw new Error(`Apply receipt is missing: ${receiptPath}`);
    await assertContained(projectRoot, receiptPath, "apply receipt");
    const receiptBytes = await readFile(receiptPath);
    if (sha256(receiptBytes) !== receipt.sha256) throw new Error("Apply receipt hash does not match the artifact registry.");
    const receiptBody = record(JSON.parse(receiptBytes.toString("utf8")) as unknown);
    if (receiptBody.item_selector !== item.selector || receiptBody.decision_id !== decisionId) throw new Error("Apply receipt does not match the archived item and decision.");
  }
  const date = new Date().toISOString().slice(0, 10);
  const target = item.type === "change"
    ? path.join(input.snapshot.workspace, "changes/archive", `${date}-${item.id}`)
    : path.join(input.snapshot.workspace, "draft-patches/archive", `${date}-${path.basename(item.path)}`);
  if (await fileExists(target)) throw writeConflict(`Archive target already exists: ${target}`);
  const operation: PlannedWrite = { action: "move", path: target, sourcePath: item.path, scope: "workspace", ownership: "user", previousHash: await hashPath(item.path), reason: "archive resolved lifecycle item" };
  if (!input.dryRun) await executeWritePlan({ operations: [operation] });
  return { source: item.path, target };
}

async function acceptItem(snapshot: WorkspaceSnapshot, item: IndexedItem, decisionId: string, now: string): Promise<PlannedWrite[]> {
  if (item.type === "change") return acceptContractChange(snapshot, item, decisionId, now);
  if (item.type === "patch") return acceptDraftPatch(snapshot, item, decisionId, now);
  return [];
}

async function acceptContractChange(snapshot: WorkspaceSnapshot, item: IndexedItem, decisionId: string, now: string): Promise<PlannedWrite[]> {
  const patch = record(item.value);
  validateEvidenceReferences(snapshot, records(patch.patches));
  const grouped = new Map<string, Record<string, unknown>[]>();
  for (const operation of records(patch.patches)) {
    if (typeof operation.target_contract !== "string") throw new Error("Contract patch is missing target_contract.");
    grouped.set(operation.target_contract, [...(grouped.get(operation.target_contract) ?? []), operation]);
  }
  const writes: PlannedWrite[] = [];
  const outputHashes: Record<string, string> = {};
  for (const [relativePath, operations] of grouped) {
    const absolutePath = path.resolve(snapshot.workspace, relativePath);
    await assertContained(snapshot.workspace, absolutePath, "contract patch target");
    const original = await readFile(absolutePath, "utf8");
    const next = validateAndApplyContractOperations(relativePath, original, operations);
    outputHashes[relativePath] = sha256(next);
    writes.push({ action: "refresh", path: absolutePath, relativePath, content: next, scope: "workspace", ownership: "user", previousHash: sha256(original), nextHash: sha256(next), reason: `accepted contract change ${item.id}` });
  }
  writes.push(...receiptWrites(snapshot, item, decisionId, now, outputHashes));
  return writes;
}

async function acceptDraftPatch(snapshot: WorkspaceSnapshot, item: IndexedItem, decisionId: string, now: string): Promise<PlannedWrite[]> {
  const patch = record(item.value);
  const baseId = string(patch.base_artifact_id);
  const base = snapshot.artifacts.find((artifact) => artifact.artifact_id === baseId);
  if (!base || typeof base.path !== "string") throw new Error(`Base artifact not found: ${baseId}`);
  const projectRoot = path.dirname(snapshot.workspace);
  const basePath = path.resolve(projectRoot, base.path);
  await assertContained(projectRoot, basePath, "base draft artifact");
  const original = await readFile(basePath, "utf8");
  const declaredHash = string(patch.base_draft_hash).replace(/^sha256:/, "");
  if (declaredHash && !sha256(original).startsWith(declaredHash)) throw new Error("Draft base hash is stale.");
  const revised = applyDraftOperations(original, records(patch.ops));
  const extension = path.extname(basePath);
  const output = path.join(path.dirname(basePath), `${path.basename(basePath, extension)}.${item.id}${extension || ".md"}`);
  if (!inside(projectRoot, output)) throw new Error("Revised draft output escapes the project root.");
  const outputRelative = path.relative(projectRoot, output).split(path.sep).join("/");
  const revisedArtifact = { artifact_id: `A-${item.id}`, artifact_type: "paper_draft", path: outputRelative, sha256: sha256(revised), status: "created", produced_by: "researchspec decide", created_at: now, derived_from_artifact_ids: [baseId] };
  const writes: PlannedWrite[] = [{ action: "create", path: output, content: revised, scope: "project", ownership: "generated", nextHash: sha256(revised), reason: `accepted draft patch ${item.id}` }];
  writes.push(...receiptWrites(snapshot, item, decisionId, now, { [outputRelative]: sha256(revised) }, [revisedArtifact]));
  return writes;
}

function receiptWrites(snapshot: WorkspaceSnapshot, item: IndexedItem, decisionId: string, now: string, outputHashes: Record<string, string>, createdArtifacts: Record<string, unknown>[] = []): PlannedWrite[] {
  const receiptPath = path.join(snapshot.workspace, "runs/current/receipts", `${item.id}.json`);
  const projectRoot = path.dirname(snapshot.workspace);
  const receiptRelative = path.relative(projectRoot, receiptPath).split(path.sep).join("/");
  const receiptArtifact: Record<string, unknown> = { artifact_id: `A-receipt-${item.id}`, artifact_type: "apply_receipt", path: receiptRelative, status: "verified", produced_by: "researchspec decide", created_at: now };
  const receipt = `${JSON.stringify({ schema_version: "1", receipt_type: item.type === "change" ? "contract_patch_apply" : "draft_patch_apply", item_selector: item.selector, decision_id: decisionId, applied_at: now, output_hashes: outputHashes, created_artifact_ids: createdArtifacts.map((artifact) => artifact.artifact_id) }, null, 2)}\n`;
  receiptArtifact.sha256 = sha256(receipt);
  const registryPath = path.join(snapshot.workspace, "runs/current/artifact-registry.json");
  const registrySource = snapshot.files.get("runs/current/artifact-registry.json")?.text ?? `${JSON.stringify({ schema_version: "0.1", run_id: "current", artifacts: [] }, null, 2)}\n`;
  const registry = record(JSON.parse(registrySource) as unknown);
  const existingArtifacts = records(registry.artifacts).filter((artifact) => ![receiptArtifact.artifact_id, ...createdArtifacts.map((created) => created.artifact_id)].includes(artifact.artifact_id));
  registry.artifacts = [...existingArtifacts, ...createdArtifacts, receiptArtifact];
  const registryText = `${JSON.stringify(registry, null, 2)}\n`;
  return [
    { action: "create", path: receiptPath, relativePath: path.relative(snapshot.workspace, receiptPath), content: receipt, scope: "workspace", ownership: "generated", nextHash: sha256(receipt), reason: "write apply receipt" },
    { action: "refresh", path: registryPath, relativePath: "runs/current/artifact-registry.json", content: registryText, scope: "workspace", ownership: "user", previousHash: sha256(registrySource), nextHash: sha256(registryText), reason: "register revised artifacts and receipt" },
  ];
}

async function lifecycleWrite(item: IndexedItem, status: string, decisionId: string, now: string): Promise<PlannedWrite> {
  if (!item.path) throw new Error("Item has no source path.");
  if (item.type === "change") {
    const patchPath = path.join(item.path, "contract-patch.yaml");
    const original = await readFile(patchPath, "utf8");
    const value = record(parse(original));
    Object.assign(value, { status, decision_id: decisionId, resolved_at: now, apply_receipt_artifact_id: status === "applied" ? `A-receipt-${item.id}` : undefined });
    const next = stringify(value);
    return { action: "refresh", path: patchPath, content: next, scope: "workspace", ownership: "user", previousHash: sha256(original), nextHash: sha256(next), reason: "update change lifecycle" };
  }
  const original = await readFile(item.path, "utf8");
  const value = record(JSON.parse(original) as unknown);
  Object.assign(value, { status, decision_id: decisionId, resolved_at: now, applied_artifact_id: status === "applied" ? `A-${item.id}` : undefined, apply_receipt_artifact_id: status === "applied" ? `A-receipt-${item.id}` : undefined });
  const next = `${JSON.stringify(value, null, 2)}\n`;
  return { action: "refresh", path: item.path, content: next, scope: "workspace", ownership: "user", previousHash: sha256(original), nextHash: sha256(next), reason: "update draft patch lifecycle" };
}

function applyDraftOperations(text: string, operations: Record<string, unknown>[]): string {
  const blocks = parseAnchoredBlocks(text);
  const byId = new Map(blocks.map((block) => [block.id, block]));
  const usedTargets = new Set<string>();
  let nextId = Math.max(0, ...blocks.map((block) => /^B(\d+)$/.exec(block.id)).filter((match): match is RegExpExecArray => Boolean(match)).map((match) => Number(match[1]))) + 1;
  const edits: Array<{ start: number; end: number; replacement: string; order: number }> = [];

  for (const [order, operation] of operations.entries()) {
    const op = string(operation.op);
    const blockId = string(operation.block_id || operation.anchor_block_id);
    if (!blockId) throw new Error("Draft operation is missing block_id.");
    if (usedTargets.has(blockId)) throw new Error(`Draft block has more than one operation: ${blockId}`);
    usedTargets.add(blockId);
    if (!["replace_block", "insert_after", "delete_block"].includes(op)) throw new Error(`Unsupported draft operation: ${op}`);
    const newText = string(operation.new_text);
    if ((op === "replace_block" || op === "insert_after") && !newText.trim()) throw new Error(`${op} requires new_text.`);
    if (/<!--\s*block:/i.test(newText)) throw new Error("Draft patch text cannot inject block markers.");

    if (blockId === "DOC-BODY-START") {
      if (op !== "insert_after" || string(operation.old_hash)) throw new Error("DOC-BODY-START is only valid for hash-less insert_after.");
      const replacement = anchorize(newText, undefined);
      edits.push({ start: blocks[0]?.markerStart ?? bodyStart(text), end: blocks[0]?.markerStart ?? bodyStart(text), replacement: `${replacement}\n\n`, order });
      continue;
    }

    const block = byId.get(blockId);
    if (!block) throw new Error(`Draft block not found: ${blockId}`);
    const oldHash = string(operation.old_hash);
    if (!oldHash || !block.hash.startsWith(oldHash.replace(/^sha256:/, ""))) throw new Error(`Draft block hash is stale: ${blockId}`);
    if (op === "delete_block") edits.push({ start: block.markerStart, end: block.end, replacement: "", order });
    else if (op === "replace_block") edits.push({ start: block.markerStart, end: block.end, replacement: `${anchorize(newText, block.id)}\n\n`, order });
    else edits.push({ start: block.end, end: block.end, replacement: `${anchorize(newText, undefined)}\n\n`, order });
  }

  let result = text;
  for (const edit of edits.sort((left, right) => right.start - left.start || right.order - left.order)) result = `${result.slice(0, edit.start)}${edit.replacement}${result.slice(edit.end)}`;
  return result;

  function anchorize(value: string, firstId: string | undefined): string {
    return splitMarkdownBlocks(value).map((content, index) => {
      const id = index === 0 && firstId ? firstId : `B${String(nextId++).padStart(4, "0")}`;
      return `<!--block:${id}-->\n${content}`;
    }).join("\n\n");
  }
}

interface AnchoredBlock { id: string; markerStart: number; end: number; content: string; hash: string }

function parseAnchoredBlocks(text: string): AnchoredBlock[] {
  const marker = /^<!--block:([A-Za-z0-9][A-Za-z0-9._-]*)-->[ \t]*(?:\r?\n|$)/gm;
  const matches = [...text.matchAll(marker)];
  const markerOccurrences = text.match(/<!--\s*block:/gi)?.length ?? 0;
  if (matches.length !== markerOccurrences) throw new Error("Draft contains a malformed or non-standalone block marker.");
  if (!matches.length) throw new Error("Draft has no ResearchSpec block markers.");
  const ids = new Set<string>();
  return matches.map((match, index) => {
    const id = match[1];
    if (ids.has(id)) throw new Error(`Draft contains duplicate block marker: ${id}`);
    ids.add(id);
    const markerStart = match.index;
    const contentStart = markerStart + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    const content = text.slice(contentStart, end);
    return { id, markerStart, end, content, hash: sha256(normalizeBlock(content)).slice(0, 12) };
  });
}

function splitMarkdownBlocks(value: string): string[] {
  const normalized = value.replaceAll("\r\n", "\n").trim();
  if (!normalized) throw new Error("Inserted draft text is empty.");
  const lines = normalized.split("\n");
  const blocks: string[] = [];
  let current: string[] = [];
  let fence: string | undefined;
  const flush = () => { if (current.length) { blocks.push(current.join("\n").trim()); current = []; } };
  for (const line of lines) {
    const fenceMatch = /^\s*(```+|~~~+)/.exec(line);
    if (fenceMatch) fence = fence ? undefined : fenceMatch[1][0];
    if (!fence && /^(?: {0,3}(?:=+|-+)\s*$|<[^!][^>]*>\s*$|\[\^[^\]]+\]:)/.test(line)) throw new Error("Inserted text contains an unsupported ambiguous Markdown block shape.");
    if (!fence && !line.trim()) { flush(); continue; }
    if (!fence && /^#{1,6}\s+/.test(line)) { flush(); current.push(line); flush(); continue; }
    current.push(line);
  }
  if (fence) throw new Error("Inserted text contains an unclosed code fence.");
  flush();
  return blocks;
}

function normalizeBlock(value: string): string { return value.replaceAll("\r\n", "\n").replace(/^\n+|\n+$/g, ""); }

function bodyStart(text: string): number {
  if (!text.startsWith("---")) return 0;
  const end = text.indexOf("\n---", 3);
  return end === -1 ? 0 : text.indexOf("\n", end + 4) + 1;
}

function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function records(value: unknown): Record<string, unknown>[] { return Array.isArray(value) ? value.map(record) : []; }
function string(value: unknown): string { return typeof value === "string" ? value : ""; }
function assertSafeId(value: string, label: string): void {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value) || value.includes("..")) throw new Error(`Unsafe ${label}: ${value}`);
}

async function assertContained(root: string, candidate: string, label: string): Promise<void> {
  if (!inside(root, candidate)) throw new Error(`${label} escapes its allowed root.`);
  const [realRoot, realCandidate] = await Promise.all([realpath(root), realpath(candidate)]);
  if (!inside(realRoot, realCandidate)) throw new Error(`${label} resolves outside its allowed root.`);
}

function inside(root: string, candidate: string): boolean { return candidate === root || candidate.startsWith(`${root}${path.sep}`); }

function latestLinkedBlockingGate(snapshot: WorkspaceSnapshot, linkKey: string, itemId: string): Record<string, unknown> | undefined {
  const latest = new Map<string, Record<string, unknown>>();
  for (const gate of snapshot.gates) if (typeof gate.gate_id === "string") latest.set(gate.gate_id, gate);
  return [...latest.values()].find((gate) => gate[linkKey] === itemId && gate.blocking === true && gate.verdict !== "pass");
}

function latestDecisions(snapshot: WorkspaceSnapshot): Record<string, unknown>[] {
  const latest = new Map<string, Record<string, unknown>>();
  for (const decision of snapshot.decisions) if (typeof decision.decision_id === "string") latest.set(decision.decision_id, decision);
  return [...latest.values()];
}

function writeConflict(message: string): NodeJS.ErrnoException {
  const error = new Error(message) as NodeJS.ErrnoException;
  error.code = "EWRITE_CONFLICT";
  return error;
}
