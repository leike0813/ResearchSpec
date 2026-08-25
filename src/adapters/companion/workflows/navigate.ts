import { renderNavigateRoutingProjection } from "../../../arsu-converter/routing/navigation-projection.js";
import { renderLiteratureSourcePolicyProjection } from "../../../literature-adapters/provider-policy.js";
import type { CompanionWorkflowSource } from "../types.js";

export const navigateWorkflow = {
  id: "navigate",
  name: "ResearchSpec Navigate",
  description: "Route new, vague, cross-Skill, resume, explanation, and export requests through the current ResearchSpec graph and ARSU Skills.",
  instructions: `## Mission

Give the user one evidence-backed next graph action. Navigate reads current profiles, runs, nodes, handoffs, changes, and capability metadata; it does not create semantic work or make human decisions.

## Use this Skill when

- The request is vague, spans ARSU Skills, or does not name an explicit capability or profile.
- The user wants to resume, explain current state, inspect blockers, or export bounded context.
- A direct ARSU request still needs its graph selector and prerequisites checked.
- Optional Zotero or domain assistance must be selected without changing the producer or workflow authority.

## Inputs

- The user's intended outcome, known materials, time or interaction constraints, and any named Skill, capability, or profile.
- A workspace path when discovery cannot identify exactly one current workspace.
- For export, the audience, scope, privacy boundary, and destination path.

## Read protocol

\`\`\`bash
researchspec status --json
researchspec instructions profile:<profile-id> --json
researchspec instructions run:<run-id> --json
researchspec instructions node:<run-id>/<node-id>[@round] --json
researchspec instructions gate:<run-id>/<gate-id>[@round] --json
researchspec instructions decision:<run-id>/<decision-id>[@round] --json
researchspec show change:<change-id> --json
researchspec plugin list --summary --json
\`\`\`

Use only selectors returned by current status, instructions, list, or show. Capability metadata may explain a choice but never creates a runtime selector. Directory names are not run IDs.

## Workflow

1. Classify the request as Start, Resume, Explain, or Export. Complete a requested read-only explanation before proposing a write.
2. Read current status. Separate facts, blockers, pending human choices, pending child starts, and unknowns.
3. For new work, resolve the smallest suitable graph profile and entry, then read \`instructions profile:<profile-id>\`. Present:
   - profile and entry;
   - stable-spec and handoff-role prerequisites;
   - expected boundary outputs and intended consumers;
   - formal Gates and Decisions;
   - cost and interaction pattern;
   - any current blocker.
4. Ask for confirmation scoped to that exact root entry. If the entry summary materially changes, present it again and obtain a new confirmation.
5. Start only the confirmed root. Nodes and bound child runs declared by its frozen graph inherit that authorization; every formal Gate and Decision still requires separate confirmation. Start a pending child only through the exact eligible \`node:<parent-run>/<subgraph-node>[@round]\` selector returned by status.
6. If the producer proposes independent model review, keep it separate from root-run, Gate, and Decision confirmation. Name one host-available model and disclose the content category and expected cost. Dispatch only through the host's native subagent mechanism after confirmation for this exact run and node. Failure leaves the graph frontier unchanged and falls back to the current session model with disclosure.
7. Dispatch semantic production to the ARSU Skill named by the eligible Node Card. The producer writes ordinary project files outside \`researchspec/\` and submits role/path outputs through the CLI.
8. For Resume, follow the exact selector returned by status. Route an eligible execution node to its ARSU Skill, a formal Gate to Verify, a human choice to Decide, a pending child selector to \`start\`, and a high-impact stable-spec change to Propose.
9. For optional domain help, suggest at most three relevant domains. Keep plugin consent separate, preview the exact IDs, and install only after explicit consent. Return helper results to the original ARSU producer.
10. For Zotero work, use a direct Zotero Adapter Skill when the task is bounded; use \`zotero-library-agent\` for broad library requests. Zotero remains a nested provider when an ARSU producer owns the academic task.
11. For Explain, use targeted status/list/show/check reads and write nothing. For Export, use a bounded pack or an explicit run handoff; state that external bytes and private working material are excluded.

## Decision table

| Situation | Action |
| --- | --- |
| Vague or cross-Skill academic goal | Select a supported graph profile and present its exact entry summary. |
| Existing active run | Resume from the bounded selector returned by status. |
| Eligible execution node | Dispatch the Node Card's ARSU producer. |
| Pending child start | Start the exact eligible parent node selector; reuse an existing bound child if returned. |
| Formal Gate ready for review | Dispatch Verify; wait for human confirmation before Decide. |
| Scope, claim, structure, or branch choice | Dispatch Decide when the choice is known; otherwise Propose or ask the user. |
| High-impact stable research meaning change | Dispatch Propose. |
| Directly editable run handoff or stable spec | Edit through its supported path, then run a targeted check. |
| Plugin declined or unavailable | Continue with the same base ARSU producer. |

## Output

Return the selected graph action, evidence used, canonical selector, entry summary or current blocker, confirmation status, exact next Skill or command, and the next owning file. Mark unresolved facts as unknown.

## Completion

Finish when the user has one current, authorized next action and its owner is explicit. Do not start a different root, install a plugin, record a Gate verdict, or choose a Decision on the strength of an earlier confirmation.

${renderLiteratureSourcePolicyProjection()}

${renderNavigateRoutingProjection()}`,
} satisfies CompanionWorkflowSource;
