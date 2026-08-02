import { createHash } from "node:crypto";

import { markerEnd, markerStart } from "./markers.js";
import type {
  AnchorMatchRecord,
  AnchorReplacementPlan,
  SerializableAnchorMatchRecord,
  SerializableAnchorReplacementPlan,
} from "./types.js";
import { markRuntimePolicyAdapted } from "../runtime-policy/planner.js";
import type { RuntimePolicyPlan } from "../runtime-policy/types.js";

export { markerEnd, markerStart } from "./markers.js";

export function applyCombinedReplacements(
  text: string,
  sourcePath: string,
  outputPath: string,
  anchorPlan: AnchorReplacementPlan,
  runtimePlan: RuntimePolicyPlan,
): string {
  const rewrites = [
    ...(anchorPlan.spans_by_source.get(sourcePath) ?? []).map((span) => ({
      id: span.anchor.id,
      start: span.start,
      end: span.end,
      replacementBody: span.replacement_body,
      kind: "anchor" as const,
    })),
    ...(runtimePlan.spans_by_source.get(sourcePath) ?? []).map((span) => ({
      id: span.rewrite_id,
      start: span.start,
      end: span.end,
      replacementBody: span.replacement_text,
      kind: "runtime" as const,
    })),
  ].sort((left, right) => right.start - left.start || right.end - left.end || right.id.localeCompare(left.id));

  let rewritten = text;
  for (const rewrite of rewrites) {
    const before = rewritten.slice(rewrite.start, rewrite.end);
    const lineEnding = before.includes("\r\n") ? "\r\n" : "\n";
    const trailingLineEnding = before.endsWith("\r\n") ? "\r\n" : before.endsWith("\n") ? "\n" : "";
    const body = rewrite.replacementBody.replace(/\n/g, lineEnding);
    const rendered = rewrite.kind === "anchor"
      ? [markerStart(rewrite.id), body, markerEnd(rewrite.id)].join(lineEnding)
      : body;
    rewritten = `${rewritten.slice(0, rewrite.start)}${rendered}${trailingLineEnding}${rewritten.slice(rewrite.end)}`;
    if (rewrite.kind === "anchor") markReplaced(anchorPlan, rewrite.id, outputPath, rendered);
    else markRuntimePolicyAdapted(runtimePlan, rewrite.id, outputPath, rendered);
  }
  return rewritten;
}

function markReplaced(plan: AnchorReplacementPlan, anchorId: string, outputPath: string, afterText: string): void {
  const record = plan.records.find((item) => item.anchor_id === anchorId);
  if (!record) return;
  record.replaced = true;
  if (!record.output_paths.includes(outputPath)) record.output_paths.push(outputPath);
  record.after_text = afterText;
  record.after_sha256 = sha256Text(afterText);
  plan.replaced_anchors = plan.records.filter((item) => item.replaced).length;
}

export function serializableAnchorReplacementPlan(plan: AnchorReplacementPlan): SerializableAnchorReplacementPlan {
  return {
    profile_id: plan.profile_id,
    coverage_policy: plan.coverage_policy,
    source_commit: plan.source_commit,
    total_anchors: plan.total_anchors,
    replaceable_anchors: plan.replaceable_anchors,
    diagnostic_anchors: plan.diagnostic_anchors,
    matched_anchors: plan.matched_anchors,
    replaced_anchors: plan.replaced_anchors,
    diagnostic_matched: plan.diagnostic_matched,
    missing_blocking: plan.missing_blocking,
    missing_diagnostic: plan.missing_diagnostic,
    records: plan.records
      .map(serializableRecord)
      .sort((left, right) => left.anchor_id.localeCompare(right.anchor_id)),
  };
}

function serializableRecord(record: AnchorMatchRecord): SerializableAnchorMatchRecord {
  return {
    anchor_id: record.anchor_id,
    anchor_name: record.anchor_name,
    source_path: record.source_path,
    owner_skill: record.owner_skill,
    contract_category: record.contract_category,
    severity: record.severity,
    semantic_role: record.semantic_role,
    researchspec_targets: [...record.researchspec_targets].sort(),
    replacement_shape: record.replacement_shape,
    replacement_body_sha256: record.replacement_body_sha256,
    matched: record.matched,
    replacement_mode: record.replacement_mode,
    replaced: record.replaced,
    output_paths: [...record.output_paths].sort(),
    before_sha256: record.before_sha256,
    after_sha256: record.after_sha256,
    diagnostics: [...record.diagnostics].sort(),
  };
}

function sha256Text(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}
