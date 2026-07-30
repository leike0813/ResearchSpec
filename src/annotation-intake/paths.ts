import {
  annotationCandidateRelativePath,
  annotationDeltaRelativePath,
  annotationInterpretationRelativePath,
  annotationRawSourcesRelativeDirectory,
  annotationReviewCopyRelativePath,
  annotationSessionRelativePath,
} from "../core/runtime/annotation-lifecycle.js";
import { AnnotationIntakePathsSchema, type AnnotationIntakePaths } from "./contracts.js";

export function annotationIntakePaths(annotationSetId: string): AnnotationIntakePaths {
  return AnnotationIntakePathsSchema.parse({
    session: annotationSessionRelativePath(annotationSetId),
    review_copy: annotationReviewCopyRelativePath(annotationSetId),
    interpretation: annotationInterpretationRelativePath(annotationSetId),
    review_delta: annotationDeltaRelativePath(annotationSetId),
    raw_sources: annotationRawSourcesRelativeDirectory(annotationSetId),
    candidate: annotationCandidateRelativePath(annotationSetId),
  });
}

