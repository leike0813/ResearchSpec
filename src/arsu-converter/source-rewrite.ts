import type { AnchorReplacementPlan } from "./anchors/types.js";
import type { RuntimePolicyPlan } from "./runtime-policy/types.js";

export function validateCombinedRewritePlan(anchorPlan: AnchorReplacementPlan, runtimePlan: RuntimePolicyPlan): string[] {
  const errors: string[] = [];
  const paths = new Set([...anchorPlan.spans_by_source.keys(), ...runtimePlan.spans_by_source.keys()]);
  for (const sourcePath of paths) {
    const spans = [
      ...(anchorPlan.spans_by_source.get(sourcePath) ?? []).map((span) => ({ id: span.anchor.id, start: span.start, end: span.end })),
      ...(runtimePlan.spans_by_source.get(sourcePath) ?? []).map((span) => ({ id: span.rewrite_id, start: span.start, end: span.end })),
    ].sort((left, right) => left.start - right.start || left.end - right.end || left.id.localeCompare(right.id));
    for (let index = 0; index < spans.length; index += 1) {
      const span = spans[index];
      if (!span || span.start < 0 || span.end <= span.start) errors.push(`invalid rewrite range: ${sourcePath}:${span?.id ?? "unknown"}`);
      const previous = spans[index - 1];
      if (previous && span && span.start < previous.end) errors.push(`cross-catalog rewrite overlap: ${sourcePath}:${previous.id}:${span.id}`);
    }
  }
  return errors.sort();
}
