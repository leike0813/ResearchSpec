import { createHash } from "node:crypto";

import { renderReplacement } from "./templates.js";
export { markerEnd, markerStart } from "./markers.js";
import type {
  AnchorMatchRecord,
  AnchorReplacementPlan,
  SerializableAnchorMatchRecord,
  SerializableAnchorReplacementPlan,
} from "./types.js";

export function applyAnchorReplacements(
  text: string,
  sourcePath: string,
  outputPath: string,
  plan: AnchorReplacementPlan,
): string {
  const spans = [...(plan.spans_by_source.get(sourcePath) ?? [])].sort((left, right) => right.start - left.start);
  let rewritten = text;
  for (const span of spans) {
    const before = rewritten.slice(span.start, span.end);
    const lineEnding = before.endsWith("\r\n") ? "\r\n" : before.endsWith("\n") ? "\n" : "";
    const rendered = renderReplacement(span.anchor);
    const replacement = `${rendered}${lineEnding}`;
    rewritten = `${rewritten.slice(0, span.start)}${replacement}${rewritten.slice(span.end)}`;
    markReplaced(plan, span.anchor.id, outputPath, rendered);
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
    marker_id: record.marker_id,
    source_path: record.source_path,
    owner_skill: record.owner_skill,
    contract_category: record.contract_category,
    severity: record.severity,
    template_id: record.template_id,
    semantic_role: record.semantic_role,
    researchspec_targets: [...record.researchspec_targets].sort(),
    replacement_shape: record.replacement_shape,
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
