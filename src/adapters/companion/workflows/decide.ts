import type { CompanionWorkflowSource } from "../types.js";

export const decideWorkflow = {
  id: "decide",
  name: "ResearchSpec Decide",
  description: "Record one explicit human decision in the project change or graph node instance that owns it.",
  instructions: `## Mission

Help a human review one exact choice, then record the confirmed result in its sole owner through \`researchspec decide\`. A decision never edits another authority or completes an execution node.

## Supported decisions

- Project change: accept, reject, defer, or supersede in the owning \`change.md\`.
- Formal Gate: append a pass, pass-with-conditions, or fail attempt in the owning Gate node instance.
- Graph Decision: record one declared option in the owning Decision node instance.
- Explicit override of the current failed Gate, with approver and reason, in that Gate record.

## Inputs

- One exact \`change:<id>\`, \`gate:<run>/<gate>[@round]\`, or \`decision:<run>/<decision>[@round]\` selector.
- The human actor, confirmed choice, and reason.
- For a Gate, the Verify recommendation, its limitations, and any handoff evidence role.

## Workflow

1. Read \`instructions <selector> --json\` and \`show <selector> --json\`. Resolve exactly one owner and expose any blocker or prior attempt.
2. Present the meaningful options and consequences. Keep the recommendation separate from the human's decision.
3. Obtain an explicit decision, actor name, and reason. Do not treat \`--yes\`, chat inference, a prior root-run confirmation, or a Verify recommendation as consent.
4. Record only the selected action:

\`\`\`bash
researchspec decide change:<id> --decision <accept|reject|defer|supersede> --actor-name "<human>" --reason "<reason>" --json
researchspec decide gate:<run>/<gate>[@round] --verdict <pass|pass_with_conditions|fail> --actor-name "<human>" --reason "<summary>" --json
researchspec decide decision:<run>/<decision>[@round] --choice "<choice>" --actor-name "<human>" --reason "<reason>" --json
researchspec decide gate:<run>/<gate>[@round] --override --actor-name "<human>" --reason "<reason>" --json
\`\`\`

5. Re-read the targeted selector or run the narrow check. Report the owning file that changed.
6. Stop after recording. If an execution node is now eligible, explain that \`advance node:<run>/<node>[@round]\` is a separate validated action.

## Decision rules

- Accepting a project change records agreement only. Stable specs remain byte-identical until directly edited and validated; \`applied\` is distinct from \`accepted\`.
- A Gate reverification appends an attempt and preserves prior attempts.
- An override is allowed only for the current failed Gate and requires an explicit reason.
- A graph Decision applies only to its owning run and node. It cannot expand the frozen graph's authorization.
- Gate verdicts and Decision choices satisfy graph controls but never write execution-node completion.

## Output

Return the selector, owner, options reviewed, human actor, confirmed choice and reason, recorded result, unchanged authorities, and the next separate action if any.

## Guardrails

- Never hand-edit run or node instance state.
- Do not apply stable-spec edits, patch a manuscript, create boundary files, start a child, or advance a node.
- Do not duplicate the decision in a ledger, receipt, global state, or another node.

## Completion

Finish when the exact human decision is durably recorded in its sole owner or a current blocker is clearly reported.`,
} satisfies CompanionWorkflowSource;
