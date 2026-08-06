export const COMPANION_WORKFLOW_IDS = ["navigate", "propose", "decide", "verify", "cli-handbook"] as const;
export type CompanionWorkflowId = typeof COMPANION_WORKFLOW_IDS[number];
export type CompanionSkillId = `researchspec-${CompanionWorkflowId}`;

export interface CompanionWorkflowSource {
  id: CompanionWorkflowId;
  name: string;
  description: string;
  instructions: string;
}

export interface CompanionIntent extends CompanionWorkflowSource {
  id: CompanionWorkflowId;
  skillId: CompanionSkillId;
}
