import type { CommandContent } from "../command-renderer.js";

export const COMPANION_WORKFLOW_IDS = ["explore", "propose", "check", "verify", "next", "context", "decide", "submit", "archive"] as const;
export type CompanionWorkflowId = typeof COMPANION_WORKFLOW_IDS[number];
export type CompanionSkillId = `researchspec-${CompanionWorkflowId}`;

export interface CompanionWorkflowSource {
  id: CompanionWorkflowId;
  name: string;
  description: string;
  instructions: string;
}

export interface CompanionIntent extends CommandContent {
  family: "companion";
  id: CompanionWorkflowId;
  skillId: CompanionSkillId;
  instructions: string;
}
