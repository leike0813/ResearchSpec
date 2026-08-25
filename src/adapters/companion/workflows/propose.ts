import type { CompanionWorkflowSource } from "../types.js";

export const proposeWorkflow = {
  id: "propose",
  name: "ResearchSpec Propose",
  description: "Create or refine a reviewable project change for a high-impact update to stable research specifications.",
  instructions: `## Mission

Turn one high-impact research change into an adaptable, directly editable project change package. A proposal explains and validates intended meaning; it does not apply edits to stable specs.

## Use this Skill when

- Research questions, scope, target output, source policy, claim strength, contribution, manuscript structure, or accepted limitations may change materially.
- A verification finding requires human review before current research meaning is edited.
- The user wants a reviewable record with optional design, tasks, or record-level source/claim delta material.

Ordinary low-impact edits to stable specs do not require a change. Manuscript revision operations belong to the responsible ARSU Skill.

## Inputs

- A safe new change ID.
- The affected stable specs: \`project.md\`, \`sources.yaml\`, \`claims.yaml\`, and/or \`manuscript.yaml\`.
- The reason, intended direction, boundaries, impact, evidence, and unresolved choices.
- Whether the package benefits from optional \`design.md\`, \`tasks.md\`, or \`delta.yaml\`.

## Workflow

1. Read the affected stable specs and relevant evidence. State the current meaning before drafting a proposed meaning.
2. Confirm that the change is high impact or benefits from review. If it is a normal direct edit, explain that route instead.
3. Choose the smallest useful document package. Create the skeleton with:

\`\`\`bash
researchspec propose <change-id> --targets <comma-separated-specs> [--with design,tasks,delta] --json
\`\`\`

4. Edit \`change.md\` directly so it clearly records background, proposed direction, boundaries, semantic delta, impact, evidence, and questions needing human judgment.
5. Use \`design.md\` only for substantial alternatives or cross-file consequences; use \`tasks.md\` only when staged work improves reviewability.
6. Use \`delta.yaml\` only for source/claim record add, update, or remove validation. It is never an executable patch and never edits stable specs.
7. Run \`researchspec check changes --json\` and inspect \`show change:<id>\`. Correct structural or reference errors without fabricating research content.
8. Leave the change proposed. Route a human decision to Decide.

## Output

Return the change selector, target specs, created documents, concise current/proposed meaning, evidence and impact, unresolved choices, validation result, and the statement that stable specs remain unchanged.

## Guardrails

- Direct editing of change documents remains valid; do not make the CLI their only authoring path.
- Do not accept, reject, defer, supersede, archive, or apply the change.
- Do not place run/node status, Gate attempts, transition history, boundary deliverable bytes, or workflow-state mutations in a project change.

## Completion

Finish when the proposal is understandable and structurally valid, its targets are explicit, and the next human decision is clear.`,
} satisfies CompanionWorkflowSource;
