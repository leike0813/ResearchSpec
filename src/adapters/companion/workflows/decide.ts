import type { CompanionWorkflowSource } from "../types.js";

export const decideWorkflow = {
  id: "decide",
  name: "ResearchSpec Decide",
  description: "Record one explicit human decision in the project change or subflow control that owns it.",
  instructions: `## Mission

Help a human review one exact choice, then record the confirmed result in its owning file through \`researchspec decide\`. A decision never silently edits another authority or advances a checkpoint.

## Supported decisions

- Project change: accept, reject, defer, or supersede in the owning \`change.md\`.
- Formal Gate: append a pass, pass-with-conditions, or fail attempt in the owning \`control.yaml\`.
- Local scope, claim, structure, or branch choice in the owning \`control.yaml\`.
- Explicit override of the current failed Gate, with approver and reason, in that Gate entry.

## Inputs

- One exact \`change:<id>\`, \`gate:<instance>/<gate>\`, or \`decision:<instance>/<decision>\` selector.
- The human actor, confirmed choice, and reason.
- For a Gate, the Verify recommendation, its limitations, and any handoff evidence role.

## Workflow

1. Read \`instructions <selector> --json\` and \`show <selector> --json\`. Resolve exactly one owner and expose any blocker or prior attempt.
2. Present the meaningful options and consequences. Keep the recommendation separate from the human's decision.
3. Obtain an explicit decision, actor name, and reason. Do not treat \`--yes\`, chat inference, a prior route confirmation, or a Verify recommendation as consent.
4. Record only the selected action:

\`\`\`bash
researchspec decide change:<id> --decision <accept|reject|defer|supersede> --actor-name "<human>" --reason "<reason>" --json
researchspec decide gate:<instance>/<gate> --verdict <pass|pass_with_conditions|fail> --actor-name "<human>" --reason "<summary>" --json
researchspec decide decision:<instance>/<decision> --kind <scope|claim|structure|branch> --choice "<choice>" --actor-name "<human>" --reason "<reason>" --json
researchspec decide gate:<instance>/<gate> --override --actor-name "<human>" --reason "<reason>" --json
\`\`\`

5. Re-read the targeted selector or run the narrow check. Report the owning file that changed.
6. Stop after recording. If the workflow may progress, tell the user that \`advance subflow:<instance>\` is a separate action.

## Decision rules

- Accepting a project change records agreement only. Stable specs remain byte-identical until directly edited and validated; \`applied\` is distinct from \`accepted\`.
- A Gate reverification appends an attempt and preserves prior attempts.
- An override is allowed only for the current failed Gate and requires an explicit reason.
- A branch or scope decision applies only to its owning subflow. It does not authorize a child start.

## Output

Return the selector, owner, options reviewed, human actor, confirmed choice and reason, recorded result, unchanged authorities, and the next separate action if any.

## Guardrails

- Never hand-edit \`control.yaml\`.
- Do not apply stable-spec edits, patch a manuscript, create boundary files, start a child, or advance a checkpoint.
- Do not duplicate the decision in a ledger, receipt, global state, or another control.

## Completion

Finish when the exact human decision is durably recorded in its sole owner or a current blocker is clearly reported.`,
} satisfies CompanionWorkflowSource;
