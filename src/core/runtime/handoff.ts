import { readFile } from "node:fs/promises";

import {
  renderSubflowHandoff,
  SubflowHandoffInputSchema,
  SubflowHandoffSchema,
  type SubflowHandoff,
} from "../contracts/subflow-handoff.js";
import { executeWritePlan, planDirectFileEdit } from "../workspace/write-plan.js";
import { resolveBoundaryPath } from "./boundary-path.js";
import type { CurrentWorkspaceIndex, SubflowScanRecord } from "./workspace-index.js";


export class CurrentHandoffError extends Error {
  constructor(readonly code: string, message: string, readonly kind: "usage" | "domain" | "conflict" = "domain", readonly details?: unknown) {
    super(message);
    this.name = "CurrentHandoffError";
  }
}

export function currentHandoff(index: CurrentWorkspaceIndex, instanceId: string): { handoff: SubflowHandoff; body: string; content: string; path: string } {
  const entry = requireSubflowEntry(index, instanceId);
  if (!entry.handoff || entry.handoffBody === undefined || entry.handoffText === undefined) {
    throw new CurrentHandoffError(entry.handoffText === undefined ? "handoff_missing" : "handoff_invalid", `Handoff is unavailable for subflow: ${instanceId}`);
  }
  return { handoff: entry.handoff, body: entry.handoffBody, content: entry.handoffText, path: entry.handoffPath };
}

export async function updateCurrentHandoff(input: {
  index: CurrentWorkspaceIndex;
  instanceId: string;
  semanticInput: unknown;
  updatedAt: string;
  dryRun?: boolean;
}): Promise<{ handoff: SubflowHandoff; body: string; content: string; path: string; created: boolean }> {
  const entry = requireSubflowEntry(input.index, input.instanceId);
  if (entry.handoffText !== undefined && !entry.handoff) {
    throw new CurrentHandoffError("handoff_invalid", `Existing handoff must be repaired before CLI update: ${entry.handoffPath}`, "conflict");
  }
  const parsedInput = SubflowHandoffInputSchema.safeParse(input.semanticInput);
  if (!parsedInput.success) throw new CurrentHandoffError("handoff_input_invalid", "Handoff input does not match the current semantic contract.", "usage", parsedInput.error.issues);
  for (const item of parsedInput.data.inputs) {
    if (item.source_instance_id && input.index.subflows.filter((candidate) => candidate.control.instance_id === item.source_instance_id).length !== 1) {
      throw new CurrentHandoffError("handoff_source_instance_invalid", `Handoff source instance must resolve exactly once: ${item.source_instance_id}`, "usage");
    }
  }
  for (const item of [...parsedInput.data.inputs, ...parsedInput.data.outputs]) {
    try { await resolveBoundaryPath(input.index.projectRoot, item.path); }
    catch (error) { throw new CurrentHandoffError("handoff_path_invalid", error instanceof Error ? error.message : String(error), "usage"); }
  }
  const handoff = SubflowHandoffSchema.parse({
    schema_version: "1",
    subflow_instance_id: input.instanceId,
    updated_at: input.updatedAt,
    inputs: parsedInput.data.inputs,
    outputs: parsedInput.data.outputs,
  });
  const body = parsedInput.data.body ?? entry.handoffBody ?? "\n# Subflow handoff\n";
  const content = renderSubflowHandoff(handoff, body);
  if (entry.handoffText !== undefined) {
    const currentText = await readFile(entry.handoffPath, "utf8");
    if (currentText !== entry.handoffText) throw new CurrentHandoffError("handoff_write_conflict", "Handoff changed after workspace scan.", "conflict");
  }
  const operation = planDirectFileEdit({
    path: entry.handoffPath,
    relativePath: entry.handoffPath.slice(input.index.workspace.length + 1),
    content,
    ...(entry.handoffText === undefined ? {} : { previousContent: entry.handoffText }),
    reason: entry.handoffText === undefined ? "recover missing subflow handoff" : "update directly editable subflow handoff",
  });
  if (!input.dryRun) {
    try { await executeWritePlan({ operations: [operation], readPreconditions: [{ path: entry.directoryPath, expectedHash: entry.directoryHash, reason: "subflow handoff directory scan" }] }); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EWRITE_CONFLICT") throw new CurrentHandoffError("handoff_write_conflict", error instanceof Error ? error.message : String(error), "conflict");
      throw error;
    }
  }
  return { handoff, body, content, path: entry.handoffPath, created: entry.handoffText === undefined };
}

function requireSubflowEntry(index: CurrentWorkspaceIndex, instanceId: string): SubflowScanRecord {
  const entries = index.subflowEntries.filter((item) => item.control?.instance_id === instanceId);
  if (entries.length !== 1) throw new CurrentHandoffError(entries.length === 0 ? "subflow_not_found" : "subflow_identity_ambiguous", `Subflow selector must resolve exactly once: ${instanceId}`, entries.length === 0 ? "usage" : "conflict");
  return entries[0];
}
