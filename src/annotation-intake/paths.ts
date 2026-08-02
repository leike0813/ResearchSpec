import path from "node:path";

import { AnnotationIntakePathsSchema, type AnnotationIntakePaths } from "./contracts.js";

export function annotationIntakePaths(input: { workRoot: string; annotationSetId: string }): AnnotationIntakePaths {
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(input.annotationSetId)) throw new Error(`Unsafe annotation set ID: ${input.annotationSetId}`);
  const root = path.resolve(input.workRoot, "annotation-intake", input.annotationSetId);
  return AnnotationIntakePathsSchema.parse({
    root,
    session: path.join(root, "session.json"),
    review_copy: path.join(root, "review-copy.md"),
    interpretation: path.join(root, "interpretation.json"),
    review_delta: path.join(root, "review-delta.json"),
    raw_sources: path.join(root, "sources"),
    candidate: path.join(root, "candidate.json"),
  });
}
