import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";

import {
  MaterialPassportImportStateSchema,
  ImportedArtifactRecordSchema,
  ImportedDecisionEvidenceSchema,
  ImportedGateEvidenceSchema,
  MaterialPassportProjectionSchema,
  MaterialPassportSchema,
  ResumeCandidateSchema,
  type MaterialPassportImportState,
  type ImportedArtifactRecord,
  type ImportedDecisionEvidence,
  type ImportedGateEvidence,
  type MaterialPassport,
  type MaterialPassportImport,
  type ResumeCandidate,
} from "../contracts/material-passport.js";
import { parseJson, parseYaml } from "../validation/parse.js";
import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import { planFile, sha256, type PlannedWrite, type ReadPrecondition } from "../workspace/write-plan.js";

export class MaterialPassportImportError extends Error {
  constructor(public readonly code: string, message: string, public readonly kind: "usage" | "domain" | "conflict", public readonly details?: unknown) { super(message); }
}

interface PreparedFile { sourcePath: string; text: string; sha256: string; extension: string }
type PassportBoundary = Extract<NonNullable<MaterialPassport["reset_boundary"]>[number], { kind: "boundary" }>;

export interface PreparedMaterialPassportImport {
  request: MaterialPassportImport;
  source: PreparedFile;
  passport: MaterialPassport;
  selectedBoundary: PassportBoundary | null;
  accompanied?: PreparedFile & { artifactType: string };
  diagnostics: Array<{ code: string; message: string }>;
  identity: Record<string, unknown>;
}

export interface MaterialPassportImportPlan {
  importId: string;
  receiptSummary: { import_id: string; passport_sha256: string; boundary_hash: string | null; projection_artifact_id: string };
  stateEntry: MaterialPassportImportState;
  resumeCandidate: ResumeCandidate | null;
  artifacts: ImportedArtifactRecord[];
  gateEvidence: ImportedGateEvidence[];
  decisionEvidence: ImportedDecisionEvidence[];
  operations: PlannedWrite[];
  readPreconditions: ReadPrecondition[];
  projection: unknown;
}

export async function prepareMaterialPassportImport(snapshot: WorkspaceSnapshot, request: MaterialPassportImport, sourceRoot: string): Promise<PreparedMaterialPassportImport> {
  const source = await loadContainedTextFile(snapshot, request.passport_path, request.expected_passport_sha256, sourceRoot, true);
  const parsed = source.extension === ".json" ? parseJson(source.text, source.sourcePath) : parseYaml(source.text, source.sourcePath);
  if (!parsed.ok) throw new MaterialPassportImportError("invalid_material_passport", "Material Passport is not valid JSON/YAML.", "usage", parsed.diagnostic);
  const passportResult = MaterialPassportSchema.safeParse(parsed.value);
  if (!passportResult.success) throw new MaterialPassportImportError("invalid_material_passport", "Material Passport does not match Schema 9 import requirements.", "usage", passportResult.error.issues);
  const passport = passportResult.data;
  const boundaries = (passport.reset_boundary ?? []).filter((item) => item.kind === "boundary");
  const selectedBoundary = request.boundary_hash ? boundaries.find((item) => item.hash === request.boundary_hash) ?? null : null;
  if (request.boundary_hash && !selectedBoundary) throw new MaterialPassportImportError("material_passport_boundary_missing", `Boundary ${request.boundary_hash} was not found.`, "domain");
  if (request.boundary_hash && (passport.reset_boundary ?? []).some((item) => item.kind === "resume" && item.consumes_hash === request.boundary_hash)) throw new MaterialPassportImportError("material_passport_boundary_consumed", `Boundary ${request.boundary_hash} is already consumed in the passport.`, "conflict");

  let accompanied: PreparedMaterialPassportImport["accompanied"];
  if (request.accompanied_artifact) {
    const file = await loadContainedTextFile(snapshot, request.accompanied_artifact.path, request.accompanied_artifact.expected_sha256, sourceRoot, false);
    if (passport.content_hash?.length === 64 && passport.content_hash !== file.sha256) throw new MaterialPassportImportError("material_passport_artifact_hash_mismatch", "Passport content_hash differs from the accompanied artifact.", "conflict", { passport: passport.content_hash, actual: file.sha256 });
    accompanied = { ...file, artifactType: request.accompanied_artifact.artifact_type };
  }

  const known = new Set(Object.keys(MaterialPassportSchema.shape));
  const unknown = Object.keys(passport).filter((key) => !known.has(key));
  const diagnostics = [
    ...unknown.map((key) => ({ code: "material_passport_unknown_field", message: `Preserved unknown field: ${key}` })),
    ...(!request.accompanied_artifact && passport.content_hash ? [{ code: "material_passport_artifact_unresolved", message: "content_hash has no accompanied artifact path." }] : []),
    ...((passport.literature_corpus?.length ?? 0) > 0 ? [{ code: "material_passport_sources_require_proposal", message: "literature_corpus is projected as evidence; sources.yaml is unchanged." }] : []),
    ...((passport.experiment_provenance?.length ?? 0) > 0 ? [{ code: "material_passport_claims_require_proposal", message: "experiment provenance is projected as evidence; claims.yaml is unchanged." }] : []),
  ];
  return {
    request, source, passport, selectedBoundary, accompanied, diagnostics,
    identity: { passport_sha256: source.sha256, boundary_hash: request.boundary_hash ?? null, accompanied_artifact_sha256: accompanied?.sha256 ?? null, accompanied_artifact_type: accompanied?.artifactType ?? null },
  };
}

export async function buildMaterialPassportImportPlan(snapshot: WorkspaceSnapshot, prepared: PreparedMaterialPassportImport, instanceId: string, now: string): Promise<MaterialPassportImportPlan> {
  const importId = `mpi-${sha256(`${JSON.stringify(prepared.identity)}\n`).slice(0, 16)}`;
  const existing = snapshot.runState?.material_passport_imports.find((item) => item.import_id === importId || (prepared.request.boundary_hash && item.boundary_hash === prepared.request.boundary_hash));
  if (existing) throw new MaterialPassportImportError("material_passport_import_conflict", "Passport or boundary is already bound to this run.", "conflict", existing);

  const base = `runs/current/imports/material-passports/${prepared.source.sha256}`;
  const passportRelativePath = `${base}${prepared.source.extension}`;
  const projectionRelativePath = `${base}.projection.json`;
  const passportArtifactId = `A-mp-${prepared.source.sha256.slice(0, 16)}`;
  const projectionArtifactId = `A-mpp-${prepared.source.sha256.slice(0, 16)}`;
  const accompaniedArtifactId = prepared.accompanied ? `A-mpa-${prepared.accompanied.sha256.slice(0, 16)}` : null;
  const projection = MaterialPassportProjectionSchema.parse({ schema_version: "1", import_id: importId, passport_sha256: prepared.source.sha256, passport: prepared.passport, selected_boundary: prepared.selectedBoundary, diagnostics: prepared.diagnostics });
  const projectionText = `${JSON.stringify(projection, null, 2)}\n`;

  const common = { status: "imported" as const, authority: "imported_evidence" as const, source_import_id: importId, producer: { kind: "converter" as const, name: "ars-material-passport-import" as const }, producer_skill: prepared.passport.origin_skill, producer_mode: prepared.passport.origin_mode, version_label: prepared.passport.version_label, created_at: now, depends_on: prepared.passport.upstream_dependencies ?? [] };
  const reportedVerification = prepared.passport.verification_status === "STALE" ? "stale" as const : "unverified" as const;
  const artifacts: ImportedArtifactRecord[] = [
    ImportedArtifactRecordSchema.parse({ ...common, artifact_id: passportArtifactId, artifact_type: "material_passport", path: passportRelativePath, sha256: prepared.source.sha256, verification_state: reportedVerification, source_pointer: "/" }),
    ImportedArtifactRecordSchema.parse({ ...common, artifact_id: projectionArtifactId, artifact_type: "material_passport_projection", path: projectionRelativePath, sha256: sha256(projectionText), verification_state: "verified", source_pointer: "/" }),
  ];
  let accompaniedRelativePath: string | undefined;
  if (prepared.accompanied && accompaniedArtifactId) {
    accompaniedRelativePath = `runs/current/imports/material-passports/${prepared.accompanied.sha256}${prepared.accompanied.extension}`;
    artifacts.push(ImportedArtifactRecordSchema.parse({ ...common, artifact_id: accompaniedArtifactId, artifact_type: prepared.accompanied.artifactType, path: accompaniedRelativePath, sha256: prepared.accompanied.sha256, verification_state: "verified", source_pointer: "/accompanied_artifact" }));
  }

  const gateEvidence = [
    ...(prepared.passport.compliance_history ?? []).map((payload, index) => gate(importId, now, "imported_ars_compliance", `/compliance_history/${String(index)}`, payload, index)),
    ...(prepared.passport.audit_artifact ?? []).map((payload, index) => gate(importId, now, "imported_ars_audit", `/audit_artifact/${String(index)}`, payload, 1000 + index)),
    ...(prepared.passport.experiment_alignment_results ?? []).map((payload, index) => gate(importId, now, "imported_ars_experiment_alignment", `/experiment_alignment_results/${String(index)}`, payload, 2000 + index)),
  ];
  const decisionEvidence: ImportedDecisionEvidence[] = [];
  if (prepared.passport.experiment_intake_declaration) decisionEvidence.push(decision(importId, now, "experiment_intake_declaration", "/experiment_intake_declaration", prepared.passport.experiment_intake_declaration, 0));
  const pendingDecision = prepared.selectedBoundary?.pending_decision;
  if (pendingDecision && typeof pendingDecision === "object" && !Array.isArray(pendingDecision)) decisionEvidence.push(decision(importId, now, "imported_ars_pending_decision", `/reset_boundary/${prepared.request.boundary_hash ?? "selected"}/pending_decision`, pendingDecision, 1));

  const registryFile = requiredFile(snapshot, "runs/current/artifact-registry.json");
  const registry = { ...(registryFile.value as Record<string, unknown>), artifacts: [...snapshot.artifacts, ...artifacts] };
  const gateFile = requiredFile(snapshot, "runs/current/gate-ledger.jsonl");
  const decisionFile = requiredFile(snapshot, "runs/current/decision-ledger.jsonl");
  const appendLines = (text: string, values: unknown[]) => values.length ? `${text}${text && !text.endsWith("\n") ? "\n" : ""}${values.map((item) => JSON.stringify(item)).join("\n")}\n` : text;
  const operations: PlannedWrite[] = [];
  operations.push(await plannedImmutable(snapshot, passportRelativePath, prepared.source.text));
  operations.push(await plannedImmutable(snapshot, projectionRelativePath, projectionText));
  if (prepared.accompanied && accompaniedRelativePath) operations.push(await plannedImmutable(snapshot, accompaniedRelativePath, prepared.accompanied.text));
  operations.push(refresh(snapshot, "runs/current/artifact-registry.json", `${JSON.stringify(registry, null, 2)}\n`, "register imported Material Passport evidence"));
  if (gateEvidence.length) operations.push(refresh(snapshot, "runs/current/gate-ledger.jsonl", appendLines(gateFile.text, gateEvidence), "append imported Gate evidence"));
  if (decisionEvidence.length) operations.push(refresh(snapshot, "runs/current/decision-ledger.jsonl", appendLines(decisionFile.text, decisionEvidence), "append imported Decision evidence"));

  const stateEntry = MaterialPassportImportStateSchema.parse({ import_id: importId, instance_id: instanceId, passport_artifact_id: passportArtifactId, projection_artifact_id: projectionArtifactId, accompanied_artifact_id: accompaniedArtifactId, passport_sha256: prepared.source.sha256, boundary_hash: prepared.request.boundary_hash ?? null, status: "consumed", imported_at: now, diagnostic_codes: prepared.diagnostics.map((item) => item.code) });
  const resumeCandidate = prepared.selectedBoundary && prepared.request.boundary_hash ? ResumeCandidateSchema.parse({ import_id: importId, instance_id: instanceId, boundary_hash: prepared.request.boundary_hash, source_stage: String(prepared.selectedBoundary.stage), proposed_next_stage: prepared.selectedBoundary.next === null ? null : String(prepared.selectedBoundary.next), source_mode: typeof prepared.selectedBoundary.mode === "string" ? prepared.selectedBoundary.mode : null, pending_decision: Boolean(prepared.selectedBoundary.pending_decision), status: "awaiting_current_confirmation" }) : null;
  return {
    importId, receiptSummary: { import_id: importId, passport_sha256: prepared.source.sha256, boundary_hash: prepared.request.boundary_hash ?? null, projection_artifact_id: projectionArtifactId }, stateEntry, resumeCandidate, artifacts, gateEvidence, decisionEvidence, operations, projection,
    readPreconditions: [{ path: prepared.source.sourcePath, expectedHash: prepared.source.sha256, reason: "Material Passport source" }, ...(prepared.accompanied ? [{ path: prepared.accompanied.sourcePath, expectedHash: prepared.accompanied.sha256, reason: "Material Passport accompanied artifact" }] : [])],
  };
}

async function loadContainedTextFile(snapshot: WorkspaceSnapshot, inputPath: string, expectedHash: string, sourceRoot: string, passport: boolean): Promise<PreparedFile> {
  const projectRoot = await realpath(path.dirname(snapshot.workspace));
  const candidate = path.resolve(sourceRoot, inputPath);
  let info;
  try { info = await lstat(candidate); } catch (error) { throw new MaterialPassportImportError("material_passport_source_missing", `Import source is unavailable: ${candidate}`, "usage", error); }
  if (!info.isFile() || info.isSymbolicLink()) throw new MaterialPassportImportError("material_passport_source_unsafe", "Import source must be a regular non-symlink file.", "usage");
  const sourcePath = await realpath(candidate);
  if (!isInside(projectRoot, sourcePath)) throw new MaterialPassportImportError("material_passport_source_escape", "Import source must remain inside the project root.", "usage");
  const extension = path.extname(sourcePath).toLowerCase();
  if (passport && ![".json", ".yaml", ".yml"].includes(extension)) throw new MaterialPassportImportError("material_passport_format_unsupported", "Material Passport must be JSON or YAML.", "usage");
  const bytes = await readFile(sourcePath);
  let text: string;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { throw new MaterialPassportImportError("material_passport_source_encoding", "Import source must be UTF-8 text.", "usage"); }
  const actual = sha256(bytes);
  if (actual !== expectedHash) throw new MaterialPassportImportError("material_passport_hash_mismatch", "Import source hash differs from the confirmed hash.", "conflict", { expected: expectedHash, actual });
  return { sourcePath, text, sha256: actual, extension };
}

function gate(importId: string, now: string, type: string, pointer: string, payload: Record<string, unknown>, index: number): ImportedGateEvidence {
  const suffix = `${importId.slice(4)}-${String(index)}`;
  return ImportedGateEvidenceSchema.parse({ schema_version: "1", authority: "imported_evidence", event_id: `E-mpg-${suffix}`, gate_id: `G-mp-${suffix}`, timestamp: now, actor: { kind: "converter", name: "ars-material-passport-import" }, stage_id: "imported", gate_type: type, verdict: "not_run", blocking: false, source_import_id: importId, source_pointer: pointer, reported_payload: payload });
}

function decision(importId: string, now: string, type: string, pointer: string, value: unknown, index: number): ImportedDecisionEvidence {
  const suffix = `${importId.slice(4)}-${String(index)}`;
  return ImportedDecisionEvidenceSchema.parse({ schema_version: "1", authority: "imported_evidence", event_id: `E-mpd-${suffix}`, decision_id: `D-mp-${suffix}`, timestamp: now, actor: { kind: "converter", name: "ars-material-passport-import" }, decision_type: type, selected_option: value, status: "observed", source_import_id: importId, source_pointer: pointer });
}

async function plannedImmutable(snapshot: WorkspaceSnapshot, relativePath: string, content: string): Promise<PlannedWrite> {
  const operation = await planFile({ path: path.join(snapshot.workspace, relativePath), relativePath, content, scope: "workspace", ownership: "user" });
  if (operation.action === "conflict") throw new MaterialPassportImportError("material_passport_import_conflict", `Immutable import conflicts: ${relativePath}`, "conflict");
  return operation;
}

function refresh(snapshot: WorkspaceSnapshot, relativePath: string, content: string, reason: string): PlannedWrite {
  const file = requiredFile(snapshot, relativePath);
  return { action: "refresh", path: file.absolutePath, relativePath, content, scope: "workspace", ownership: "user", previousHash: file.hash, nextHash: sha256(content), reason };
}

function requiredFile(snapshot: WorkspaceSnapshot, relativePath: string) {
  const file = snapshot.files.get(relativePath);
  if (!file) throw new MaterialPassportImportError("material_passport_workspace_invalid", `Required runtime file is missing: ${relativePath}`, "domain");
  return file;
}

function isInside(root: string, target: string): boolean { return target === root || target.startsWith(`${root}${path.sep}`); }
