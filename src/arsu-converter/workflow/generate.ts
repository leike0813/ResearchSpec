import { stringify } from "yaml";

import { PipelineProfileSchema, type PipelineProfile } from "../../core/contracts/pipeline-profile.js";
import { ACADEMIC_PIPELINE_PROFILE } from "./academic-pipeline.js";

export function renderAcademicPipelineProfile(
  profile: PipelineProfile = ACADEMIC_PIPELINE_PROFILE,
): string {
  return `${stringify(PipelineProfileSchema.parse(profile)).trimEnd()}\n`;
}

export const ACADEMIC_PIPELINE_PROFILE_PROJECTION = renderAcademicPipelineProfile();
