import { readFile } from "node:fs/promises";

import { AnnotationResolutionReportSchema, FrozenAnnotationSetSchema } from "../contracts/annotation.js";
import { AdaptiveCaseReceiptSchema } from "../contracts/adaptive-runtime.js";
import {
  CanonicalDraftPatchSchema,
  DraftPatchApplyReportSchema,
  StoredDraftPatchSchema,
} from "../contracts/draft-patch.js";
import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import { sha256 } from "../workspace/write-plan.js";
import { resolveRegisteredArtifactPath } from "./artifact-path.js";
import { AnnotationProvenanceError, validateAnnotationRawProvenance } from "./annotation-provenance.js";

export interface AnnotationCoverageFinding {
  code: string;
  message: string;
  path?: string;
  details?: unknown;
}

export interface AnnotationCoverageResult {
  complete: boolean;
  apply_report_count: number;
  resolution_report_count: number;
  findings: AnnotationCoverageFinding[];
}

export async function verifyAnnotationCoverage(
  snapshot: WorkspaceSnapshot,
  options: {
    evidenceArtifactIds?: readonly string[];
    requireApplyReport?: boolean;
    requiredAnnotationSetIds?: readonly string[];
  } = {},
): Promise<AnnotationCoverageResult> {
  const evidenceIds = options.evidenceArtifactIds ? new Set(options.evidenceArtifactIds) : undefined;
  const requiredAnnotationSetIds = new Set(options.requiredAnnotationSetIds ?? []);
  const applyArtifacts = snapshot.artifacts.filter((artifact) =>
    artifact.artifact_type === "apply_report"
    && typeof artifact.artifact_id === "string"
    && (!evidenceIds || evidenceIds.has(artifact.artifact_id)));
  const findings: AnnotationCoverageFinding[] = [];
  let resolutionReportCount = 0;
  const coveredAnnotationSetIds = new Set<string>();
  if ((options.requireApplyReport || requiredAnnotationSetIds.size > 0) && !applyArtifacts.length) {
    findings.push({
      code: "annotation_coverage_apply_report_missing",
      message: "Revision completeness evidence requires a registered apply report.",
    });
  }

  const referencedResolutionArtifacts = new Set<string>();
  for (const artifact of applyArtifacts) {
    const applyValue = await readRegisteredJson(snapshot, artifact, "annotation_coverage_apply_report", findings);
    if (!applyValue) continue;
    const apply = DraftPatchApplyReportSchema.safeParse(applyValue);
    if (!apply.success) {
      findings.push({
        code: "annotation_coverage_apply_report_invalid",
        message: `Apply report does not match its contract: ${String(artifact.artifact_id)}`,
        path: typeof artifact.path === "string" ? artifact.path : undefined,
        details: apply.error.issues,
      });
      continue;
    }
    const patchItem = snapshot.patches.find((item) => item.id === apply.data.patch_id);
    const patch = patchItem && CanonicalDraftPatchSchema.safeParse(patchItem.value);
    if (!patch?.success) {
      const storedPatch = patchItem && StoredDraftPatchSchema.safeParse(patchItem.value);
      if (storedPatch?.success && storedPatch.data.patch_format_version !== "3") {
        if (apply.data.annotation_resolution_report_artifact_id) {
          findings.push({
            code: "annotation_coverage_unexpected_legacy_report",
            message: `A legacy Draft Patch cannot own an Annotation Resolution Report: ${apply.data.patch_id}`,
            path: patchItem?.path,
          });
        }
        continue;
      }
      findings.push({
        code: "annotation_coverage_patch_missing",
        message: `Apply report does not resolve a current Draft Patch v3: ${apply.data.patch_id}`,
        path: patchItem?.path,
      });
      continue;
    }
    if (
      patch.data.base_artifact_id !== apply.data.base_artifact_id
      || patch.data.base_sha256 !== apply.data.base_sha256
      || patch.data.decision_id !== apply.data.decision_id
      || patch.data.applied_artifact_id !== apply.data.revised_artifact_id
    ) {
      findings.push({
        code: "annotation_coverage_apply_patch_mismatch",
        message: `Apply report and Draft Patch lifecycle disagree: ${apply.data.patch_id}`,
        path: patchItem?.path,
      });
      continue;
    }
    const revised = snapshot.artifacts.find((candidate) => candidate.artifact_id === apply.data.revised_artifact_id);
    if (!revised || revised.sha256 !== apply.data.revised_sha256) {
      findings.push({
        code: "annotation_coverage_revised_draft_mismatch",
        message: `Revised draft registry evidence is missing or drifted: ${apply.data.revised_artifact_id}`,
      });
      continue;
    }

    const reportArtifactId = apply.data.annotation_resolution_report_artifact_id;
    if (!patch.data.annotation_resolution) {
      if (reportArtifactId) {
        findings.push({
          code: "annotation_coverage_unexpected_report",
          message: `Apply report references an Annotation Resolution Report for a patch without annotation resolution: ${apply.data.patch_id}`,
        });
      }
      continue;
    }
    if (!reportArtifactId || patch.data.annotation_resolution_report_artifact_id !== reportArtifactId) {
      findings.push({
        code: "annotation_coverage_report_missing",
        message: `Applied annotation patch has no matching Annotation Resolution Report reference: ${apply.data.patch_id}`,
      });
      continue;
    }
    referencedResolutionArtifacts.add(reportArtifactId);
    if (evidenceIds && !evidenceIds.has(reportArtifactId)) {
      findings.push({
        code: "annotation_coverage_report_evidence_missing",
        message: `Gate evidence omits the Annotation Resolution Report: ${reportArtifactId}`,
      });
      continue;
    }
    const reportArtifact = snapshot.artifacts.find((candidate) =>
      candidate.artifact_id === reportArtifactId
      && candidate.artifact_type === "annotation_resolution_report");
    if (!reportArtifact) {
      findings.push({
        code: "annotation_coverage_report_unregistered",
        message: `Annotation Resolution Report is not registered: ${reportArtifactId}`,
      });
      continue;
    }
    const reportValue = await readRegisteredJson(snapshot, reportArtifact, "annotation_coverage_resolution_report", findings);
    if (!reportValue) continue;
    const report = AnnotationResolutionReportSchema.safeParse(reportValue);
    if (!report.success) {
      findings.push({
        code: "annotation_coverage_report_invalid",
        message: `Annotation Resolution Report is invalid: ${reportArtifactId}`,
        path: typeof reportArtifact.path === "string" ? reportArtifact.path : undefined,
        details: report.error.issues,
      });
      continue;
    }
    resolutionReportCount += 1;
    if (
      report.data.patch_id !== patch.data.patch_id
      || report.data.decision_id !== patch.data.decision_id
      || report.data.base_artifact_id !== patch.data.base_artifact_id
      || report.data.base_sha256 !== patch.data.base_sha256
      || report.data.revised_artifact_id !== apply.data.revised_artifact_id
      || report.data.revised_sha256 !== apply.data.revised_sha256
    ) {
      findings.push({
        code: "annotation_coverage_report_identity_mismatch",
        message: `Annotation Resolution Report identity does not match its apply chain: ${reportArtifactId}`,
      });
      continue;
    }

    const expectedAnnotations = new Set<string>();
    for (const setReference of report.data.annotation_sets) {
      coveredAnnotationSetIds.add(setReference.annotation_set_id);
      const setArtifact = snapshot.artifacts.find((candidate) =>
        candidate.artifact_id === setReference.artifact_id
        && candidate.artifact_type === "annotation_set"
        && candidate.annotation_set_id === setReference.annotation_set_id);
      if (!setArtifact || setArtifact.sha256 !== setReference.sha256) {
        findings.push({
          code: "annotation_coverage_set_registry_mismatch",
          message: `Annotation Set registry evidence is missing or drifted: ${setReference.annotation_set_id}`,
        });
        continue;
      }
      const setValue = await readRegisteredJson(snapshot, setArtifact, "annotation_coverage_annotation_set", findings);
      const set = setValue === undefined ? undefined : FrozenAnnotationSetSchema.safeParse(setValue);
      if (!set || !set.success) {
        findings.push({
          code: "annotation_coverage_set_invalid",
          message: `Annotation Set is invalid: ${setReference.annotation_set_id}`,
          details: set && !set.success ? set.error.issues : undefined,
        });
        continue;
      }
      try {
        await validateAnnotationRawProvenance({ workspace: snapshot.workspace, annotationSet: set.data });
      } catch (error) {
        findings.push({
          code: error instanceof AnnotationProvenanceError ? error.code : "annotation_coverage_provenance_invalid",
          message: error instanceof Error ? error.message : String(error),
          details: error instanceof AnnotationProvenanceError ? error.details : undefined,
        });
        continue;
      }
      if (set.data.base_artifact_id !== patch.data.base_artifact_id || set.data.base_sha256 !== patch.data.base_sha256) {
        findings.push({
          code: "annotation_coverage_set_base_mismatch",
          message: `Annotation Set does not bind the applied patch base: ${setReference.annotation_set_id}`,
        });
      }
      for (const annotation of set.data.annotations) {
        expectedAnnotations.add(annotationKey(set.data.annotation_set_id, annotation.annotation_id));
      }
    }

    const expectedEntries = new Map(patch.data.annotation_resolution.entries.map((entry) => [
      annotationKey(entry.annotation_set_id, entry.annotation_id),
      entry,
    ]));
    const reportEntries = new Map(report.data.entries.map((entry) => [
      annotationKey(entry.annotation_set_id, entry.annotation_id),
      entry,
    ]));
    const expectedKeys = [...expectedAnnotations].sort();
    const patchKeys = [...expectedEntries.keys()].sort();
    const reportKeys = [...reportEntries.keys()].sort();
    if (JSON.stringify(expectedKeys) !== JSON.stringify(patchKeys) || JSON.stringify(patchKeys) !== JSON.stringify(reportKeys)) {
      findings.push({
        code: "annotation_coverage_entry_set_mismatch",
        message: `Annotation resolution entries do not cover the registered Annotation Sets: ${reportArtifactId}`,
        details: { expected_annotations: expectedKeys, patch_entries: patchKeys, report_entries: reportKeys },
      });
      continue;
    }

    for (const [key, entry] of expectedEntries) {
      const actual = reportEntries.get(key);
      const operationIds = patch.data.ops
        .filter((operation) => operation.annotation_refs.some((reference) =>
          annotationKey(reference.annotation_set_id, reference.annotation_id) === key))
        .map((operation) => operation.operation_id);
      if (!actual || actual.disposition !== entry.disposition
        || JSON.stringify(actual.operation_ids) !== JSON.stringify(operationIds)
        || actual.answer !== entry.answer
        || actual.reason !== entry.reason
        || JSON.stringify(actual.superseded_by ?? null) !== JSON.stringify(entry.superseded_by ?? null)) {
        findings.push({
          code: "annotation_coverage_mapping_mismatch",
          message: `Annotation Resolution Report mapping differs from Draft Patch v3: ${key}`,
        });
      }
    }
    const counts = {
      total_count: report.data.entries.length,
      implemented_count: report.data.entries.filter((entry) => entry.disposition === "implemented").length,
      answered_count: report.data.entries.filter((entry) => entry.disposition === "answered_without_text_change").length,
      deferred_count: report.data.entries.filter((entry) => entry.disposition === "deferred").length,
      rejected_count: report.data.entries.filter((entry) => entry.disposition === "rejected").length,
      superseded_count: report.data.entries.filter((entry) => entry.disposition === "superseded").length,
      unresolved_count: report.data.entries.filter((entry) => entry.disposition === "unresolved").length,
    };
    if (JSON.stringify(counts) !== JSON.stringify(report.data.coverage)) {
      findings.push({
        code: "annotation_coverage_count_mismatch",
        message: `Annotation Resolution Report coverage counts are inconsistent: ${reportArtifactId}`,
      });
    }
    if (report.data.coverage.unresolved_count !== 0) {
      findings.push({
        code: "annotation_coverage_unresolved",
        message: `Annotation Resolution Report still contains unresolved annotations: ${reportArtifactId}`,
        details: { unresolved_count: report.data.coverage.unresolved_count },
      });
    }
  }

  for (const annotationSetId of requiredAnnotationSetIds) {
    if (!coveredAnnotationSetIds.has(annotationSetId)) {
      findings.push({
        code: "annotation_coverage_required_set_missing",
        message: `Gate evidence does not resolve the bound Annotation Set: ${annotationSetId}`,
      });
    }
  }

  if (!evidenceIds) {
    for (const artifact of snapshot.artifacts.filter((candidate) => candidate.artifact_type === "annotation_resolution_report")) {
      if (typeof artifact.artifact_id === "string" && !referencedResolutionArtifacts.has(artifact.artifact_id)) {
        findings.push({
          code: "annotation_coverage_orphan_report",
          message: `Annotation Resolution Report is not referenced by a trusted apply report: ${artifact.artifact_id}`,
          path: typeof artifact.path === "string" ? artifact.path : undefined,
        });
      }
    }
  }

  return {
    complete: findings.length === 0,
    apply_report_count: applyArtifacts.length,
    resolution_report_count: resolutionReportCount,
    findings,
  };
}

export async function boundAnnotationSetIds(
  snapshot: WorkspaceSnapshot,
  instanceId: string,
): Promise<string[]> {
  const artifactIds = new Set<string>();
  if (snapshot.runState) {
    let current = snapshot.runState.subflows.find((item) => item.instance_id === instanceId);
    const visited = new Set<string>();
    while (current && !visited.has(current.instance_id)) {
      visited.add(current.instance_id);
      for (const artifactId of current.prerequisite_artifact_ids) artifactIds.add(artifactId);
      current = current.parent_subflow_id
        ? snapshot.runState.subflows.find((item) => item.instance_id === current?.parent_subflow_id)
        : undefined;
    }
  }

  if (snapshot.caseState) {
    const receiptReference = snapshot.caseState.receipts.find((item) =>
      item.receipt_type === "adaptive_start"
      && item.path.endsWith(`/${instanceId}.json`));
    if (receiptReference) {
      try {
        const bytes = await readFile(`${snapshot.workspace}/${receiptReference.path}`);
        if (sha256(bytes) === receiptReference.sha256) {
          const receipt = AdaptiveCaseReceiptSchema.safeParse(JSON.parse(bytes.toString("utf8")) as unknown);
          if (
            receipt.success
            && receipt.data.schema_version === "2"
            && receipt.data.action_identity.identity_selector === `subflow:${instanceId}`
          ) {
            const semanticInput = asRecord(receipt.data.semantic_input);
            const payload = asRecord(semanticInput.payload);
            const prerequisites = Array.isArray(payload.prerequisite_artifact_ids)
              ? payload.prerequisite_artifact_ids
              : [];
            for (const artifactId of prerequisites) {
              if (typeof artifactId === "string") artifactIds.add(artifactId);
            }
          }
        }
      } catch {
        // Snapshot diagnostics own malformed or drifted receipt reporting.
      }
    }
  }

  return [...new Set(snapshot.artifacts
    .filter((artifact) =>
      artifactIds.has(String(artifact.artifact_id))
      && artifact.artifact_type === "annotation_set"
      && typeof artifact.annotation_set_id === "string")
    .map((artifact) => String(artifact.annotation_set_id)))].sort();
}

async function readRegisteredJson(
  snapshot: WorkspaceSnapshot,
  artifact: Record<string, unknown>,
  codePrefix: string,
  findings: AnnotationCoverageFinding[],
): Promise<unknown> {
  if (typeof artifact.path !== "string" || typeof artifact.sha256 !== "string") {
    findings.push({ code: `${codePrefix}_unregistered`, message: "Registered artifact path or hash is missing." });
    return undefined;
  }
  const resolved = resolveRegisteredArtifactPath(snapshot, artifact.path);
  if (!resolved.contained) {
    findings.push({ code: `${codePrefix}_path_escape`, message: `Registered artifact path escapes its runtime root: ${artifact.path}`, path: artifact.path });
    return undefined;
  }
  let bytes: Buffer;
  try {
    bytes = await readFile(resolved.absolutePath);
  } catch {
    findings.push({ code: `${codePrefix}_missing`, message: `Registered artifact file is missing: ${artifact.path}`, path: artifact.path });
    return undefined;
  }
  if (sha256(bytes) !== artifact.sha256) {
    findings.push({ code: `${codePrefix}_hash_mismatch`, message: `Registered artifact file hash has drifted: ${artifact.path}`, path: artifact.path });
    return undefined;
  }
  try {
    return JSON.parse(bytes.toString("utf8")) as unknown;
  } catch {
    findings.push({ code: `${codePrefix}_invalid_json`, message: `Registered artifact is not valid JSON: ${artifact.path}`, path: artifact.path });
    return undefined;
  }
}

function annotationKey(annotationSetId: string, annotationId: string): string {
  return `${annotationSetId}:${annotationId}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}
