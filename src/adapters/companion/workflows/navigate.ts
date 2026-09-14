import type { CompanionWorkflowSource } from "../types.js";

export const navigateWorkflow = {
  id: "navigate",
  name: "ResearchSpec Navigate",
  description: "Discover and activate ResearchSpec procedures while choosing the lightest suitable standalone or governed execution mode.",
  instructions: `## Mission

Turn the user's request into the smallest useful next action without treating the ResearchSpec procedure catalog as an execution whitelist.

## Discovery

1. For a bounded request, search compact candidates with \`researchspec list procedures --query "<terms>" --json\`.
2. Inspect one candidate with \`researchspec show procedure:<id> --json\`.
3. Load its body only when selected with \`researchspec instructions procedure:<id> --json\`.
4. Read package resources only when the activation packet and procedure require them.

Discovery works outside a workspace. Procedure activation requires a current schema \`"2"\` workspace.

## Choose a mode

- Use standalone activation for bounded one-shot work. It may read and write ordinary project files outside \`researchspec/\`, pass explicit file paths to another procedure, and return output paths to the user. It must not mutate runs, nodes, handoffs, Gates, Decisions, profiles, or other workflow state.
- Use the graph when work needs persistence, resume, formal Gates or Decisions, parallel or joined execution, or auditable workflow state. Begin with \`researchspec status --json\`, use only current selectors, and read \`researchspec instructions <selector> --json\` before acting.
- If no procedure fits, use the host Agent's native capabilities and say that the work is outside a governed ResearchSpec run.

## Boundaries

- The ResearchSpec CLI is the only workflow-state mutation authority.
- Root runs require confirmation of the exact profile entry summary. Every formal Gate and Decision keeps its own confirmation.
- Plugin discovery does not authorize installation. Suggest at most three relevant domains, preview exact IDs, and install only after explicit consent. Unselected plugin procedures are discoverable but not activatable.
- Alternate-model review requires separate confirmation of model, content category, and cost for the current run and node, using only host-native subagents.
- Zotero remains an optional seven-Skill Adapter. Use its Skills directly for bounded library work and as a nested provider when another procedure owns the academic task.

## Completion

Return the selected mode, evidence used, exact procedure or graph selector, current blocker if any, and the next owning file or command. Do not invent workflow state or silently switch modes.`,
} satisfies CompanionWorkflowSource;
