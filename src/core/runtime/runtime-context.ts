import { RuntimeContextSchema, type RuntimeContext } from "../contracts/material-passport.js";
import type { WorkspaceSnapshot } from "../workspace/snapshot.js";

export function buildRuntimeContext(snapshot: WorkspaceSnapshot, instanceId?: string): RuntimeContext {
  const state = snapshot.runState;
  const imports = (state?.material_passport_imports ?? []).filter((item) => !instanceId || item.instance_id === instanceId);
  const importIds = new Set(imports.map((item) => item.import_id));
  const artifacts = snapshot.artifacts.filter((item) => item.authority === "imported_evidence" && typeof item.source_import_id === "string" && importIds.has(item.source_import_id)).map((item) => ({
    artifact_id: String(item.artifact_id), artifact_type: String(item.artifact_type), path: String(item.path), sha256: String(item.sha256), authority: "imported_evidence" as const,
  }));
  const gateEvidence = snapshot.gates.filter((item) => item.authority === "imported_evidence" && typeof item.source_import_id === "string" && importIds.has(item.source_import_id)).map((item) => ({ event_id: String(item.event_id), gate_type: String(item.gate_type), source_pointer: String(item.source_pointer) }));
  const decisionEvidence = snapshot.decisions.filter((item) => item.authority === "imported_evidence" && typeof item.source_import_id === "string" && importIds.has(item.source_import_id)).map((item) => ({ event_id: String(item.event_id), decision_type: String(item.decision_type), source_pointer: String(item.source_pointer) }));
  const diagnostics = imports.flatMap((item) => item.diagnostic_codes);
  const resume = state?.resume_candidate && (!instanceId || state.resume_candidate.instance_id === instanceId) ? state.resume_candidate : null;
  return RuntimeContextSchema.parse({ schema_version: "1", instance_id: instanceId ?? null, resume_candidate: resume, imports, artifacts, gate_evidence: gateEvidence, decision_evidence: decisionEvidence, diagnostics });
}
