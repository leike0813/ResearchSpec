import type { CapabilityGraphProfile } from "../../../core/contracts/capability-graph.js";

import { ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE, ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE_TEXT } from "./academic-paper-reviewer.js";
import { ACADEMIC_PAPER_GRAPH_PROFILE, ACADEMIC_PAPER_GRAPH_PROFILE_TEXT } from "./academic-paper.js";
import { ACADEMIC_PIPELINE_GRAPH_PROFILE, ACADEMIC_PIPELINE_GRAPH_PROFILE_TEXT } from "./academic-pipeline.js";
import { MINIMAL_GRAPH_PROFILE, MINIMAL_GRAPH_PROFILE_TEXT } from "./minimal.js";
import { PAPER_HUMANIZER_GRAPH_PROFILE, PAPER_HUMANIZER_GRAPH_PROFILE_TEXT } from "./paper-humanizer.js";
import { RESEARCH_MAIN_GRAPH_PROFILE, RESEARCH_MAIN_GRAPH_PROFILE_TEXT } from "./research-main.js";
import { REVIEW_RESPONSE_GRAPH_PROFILE, REVIEW_RESPONSE_GRAPH_PROFILE_TEXT } from "./review-response.js";
import { PATENT_GRAPH_PROFILES } from "./patent.js";

export interface AuthoredGraphProfile {
  profile: CapabilityGraphProfile;
  projection: string;
}

export const AUTHORED_GRAPH_PROFILES: readonly AuthoredGraphProfile[] = [
  { profile: ACADEMIC_PAPER_GRAPH_PROFILE, projection: ACADEMIC_PAPER_GRAPH_PROFILE_TEXT },
  { profile: ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE, projection: ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE_TEXT },
  { profile: ACADEMIC_PIPELINE_GRAPH_PROFILE, projection: ACADEMIC_PIPELINE_GRAPH_PROFILE_TEXT },
  { profile: MINIMAL_GRAPH_PROFILE, projection: MINIMAL_GRAPH_PROFILE_TEXT },
  { profile: PAPER_HUMANIZER_GRAPH_PROFILE, projection: PAPER_HUMANIZER_GRAPH_PROFILE_TEXT },
  { profile: RESEARCH_MAIN_GRAPH_PROFILE, projection: RESEARCH_MAIN_GRAPH_PROFILE_TEXT },
  { profile: REVIEW_RESPONSE_GRAPH_PROFILE, projection: REVIEW_RESPONSE_GRAPH_PROFILE_TEXT },
  ...PATENT_GRAPH_PROFILES,
].sort((left, right) => left.profile.profile_id.localeCompare(right.profile.profile_id));

export {
  ACADEMIC_PAPER_GRAPH_PROFILE,
  ACADEMIC_PAPER_REVIEWER_GRAPH_PROFILE,
  ACADEMIC_PIPELINE_GRAPH_PROFILE,
  MINIMAL_GRAPH_PROFILE,
  PAPER_HUMANIZER_GRAPH_PROFILE,
  RESEARCH_MAIN_GRAPH_PROFILE,
  REVIEW_RESPONSE_GRAPH_PROFILE,
};
