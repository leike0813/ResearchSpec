import { decideWorkflow } from "./workflows/decide.js";
import { navigateWorkflow } from "./workflows/navigate.js";
import { proposeWorkflow } from "./workflows/propose.js";
import { verifyWorkflow } from "./workflows/verify.js";
import { COMPANION_WORKFLOW_IDS, type CompanionIntent, type CompanionWorkflowSource } from "./types.js";

const WORKFLOWS: readonly CompanionWorkflowSource[] = [
  navigateWorkflow, proposeWorkflow, decideWorkflow, verifyWorkflow,
];

export const COMPANION_INTENTS: readonly CompanionIntent[] = WORKFLOWS.map((workflow) => {
  const skillId = `researchspec-${workflow.id}` as const;
  return {
    ...workflow,
    skillId,
  };
});

if (COMPANION_INTENTS.length !== COMPANION_WORKFLOW_IDS.length || new Set(COMPANION_INTENTS.map((item) => item.id)).size !== COMPANION_WORKFLOW_IDS.length) {
  throw new Error("Companion manifest must contain every workflow ID exactly once.");
}
