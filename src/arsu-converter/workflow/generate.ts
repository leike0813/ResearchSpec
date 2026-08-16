import { stringify } from "yaml";

import { PipelineProfileSchema, type PipelineProfile } from "../../core/contracts/pipeline-profile.js";
import { ACADEMIC_PIPELINE_PROFILE } from "./academic-pipeline.js";
import { renderReviewResponseProfile, REVIEW_RESPONSE_PROFILE } from "./review-response.js";

export function renderAcademicPipelineProfile(
  profile: PipelineProfile = ACADEMIC_PIPELINE_PROFILE,
): string {
  return `${stringify(PipelineProfileSchema.parse(profile)).trimEnd()}\n`;
}

export const ACADEMIC_PIPELINE_PROFILE_PROJECTION = renderAcademicPipelineProfile();
export const REVIEW_RESPONSE_PROFILE_PROJECTION = renderReviewResponseProfile(REVIEW_RESPONSE_PROFILE);
