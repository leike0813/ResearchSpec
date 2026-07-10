import { archiveWorkflow } from "./workflows/archive.js";
import { checkWorkflow } from "./workflows/check.js";
import { contextWorkflow } from "./workflows/context.js";
import { decideWorkflow } from "./workflows/decide.js";
import { exploreWorkflow } from "./workflows/explore.js";
import { nextWorkflow } from "./workflows/next.js";
import { proposeWorkflow } from "./workflows/propose.js";
import { submitWorkflow } from "./workflows/submit.js";
import { verifyWorkflow } from "./workflows/verify.js";
import { COMPANION_WORKFLOW_IDS, type CompanionIntent, type CompanionWorkflowSource } from "./types.js";

const WORKFLOWS: readonly CompanionWorkflowSource[] = [
  exploreWorkflow, proposeWorkflow, checkWorkflow, verifyWorkflow,
  nextWorkflow, contextWorkflow, decideWorkflow, submitWorkflow, archiveWorkflow,
];

export const COMPANION_INTENTS: readonly CompanionIntent[] = WORKFLOWS.map((workflow) => {
  const skillId = `researchspec-${workflow.id}` as const;
  return {
    id: workflow.id,
    skillId,
    family: "companion",
    name: workflow.name,
    description: workflow.description,
    category: "researchspec",
    tags: ["researchspec", "companion", workflow.id],
    instructions: workflow.instructions,
    body: `Use the installed \`${skillId}\` skill. Follow its complete workflow and pass through provided arguments. Do not duplicate its semantic procedure in this command wrapper.`,
  };
});

if (COMPANION_INTENTS.length !== COMPANION_WORKFLOW_IDS.length || new Set(COMPANION_INTENTS.map((item) => item.id)).size !== COMPANION_WORKFLOW_IDS.length) {
  throw new Error("Companion manifest must contain every workflow ID exactly once.");
}
