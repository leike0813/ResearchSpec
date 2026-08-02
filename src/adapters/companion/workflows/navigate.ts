import { renderNavigateRoutingProjection } from "../../../arsu-converter/routing/navigation-projection.js";
import { renderLiteratureSourcePolicyProjection } from "../../../literature-adapters/provider-policy.js";
import type { CompanionWorkflowSource } from "../types.js";

export const navigateWorkflow = {
  id: "navigate",
  name: "ResearchSpec Navigate",
  description: "Route new, vague, cross-Skill, resume, explanation, and export requests through the current ResearchSpec workspace and ARSU Skills.",
  instructions: `## Mission

Give the user one evidence-backed next route or action. Navigate reads the current profile, controls, handoffs, changes, and route metadata; it does not create semantic work or make human decisions.

## Use this Skill when

- The request is vague, spans ARSU Skills, or does not name a supported mode.
- The user wants to resume, explain current state, inspect blockers, or export bounded context.
- A direct ARSU request still needs its prerequisites and route summary checked.
- Optional Zotero or domain assistance must be selected without changing the producer or workflow authority.

## Inputs

- The user's intended outcome, known materials, time or interaction constraints, and any named Skill or mode.
- A workspace path when discovery cannot identify exactly one current workspace.
- For export, the audience, scope, privacy boundary, and destination path.

## Read protocol

\`\`\`bash
researchspec status --json
researchspec list subflows --json
researchspec instructions route:<skill-id>:<mode> --json
researchspec instructions subflow:<instance-id> --json
researchspec instructions handoff:<instance-id> --json
researchspec show change:<change-id> --json
researchspec plugin list --summary --json
\`\`\`

Use only selectors returned by current status, list, show, or the catalog-derived route reference. Do not use directory names as instance IDs.

## Workflow

1. Classify the request as Route, Resume, Explain, or Export. Complete a requested read-only explanation before proposing a write.
2. Read current status. Separate facts, blockers, pending human choices, and unknowns.
3. For a new route, match the goal to the catalog reference, then read \`instructions route:<skill>:<mode>\`. Present:
   - Skill and mode;
   - stable-spec and handoff-role prerequisites;
   - expected boundary outputs and their intended consumers;
   - formal Gates;
   - cost and interaction pattern;
   - any current blocker.
4. Ask for confirmation scoped to this exact instance. If the route summary materially changes, present the new summary and obtain a new confirmation.
5. Start only the confirmed instance. A pipeline parent never pre-creates children; each child, branch, and dynamic round repeats the route-summary check and confirmation.
6. If the producer proposes independent model review, keep it separate from route confirmation. Name one host-available model and disclose the content category and expected cost. Dispatch only through the host's native subagent mechanism after confirmation for this exact subflow; never configure or call a model service. Failure leaves the route unchanged and falls back to the current session model with disclosure.
7. Dispatch semantic production to the named ARSU Skill. The producer writes ordinary project files outside \`researchspec/\` and maintains its own handoff.
8. For Resume, read the exact subflow instructions and handoff. Route a ready producer to its ARSU Skill, a formal Gate to Verify, a human choice to Decide, and a high-impact stable-spec change to Propose.
9. For optional domain help, suggest at most three relevant domains. Keep plugin consent separate, preview the exact IDs, and install only after explicit consent. Return helper results to the original ARSU producer.
10. For Zotero work, use a direct Zotero Adapter Skill when the task is bounded; use \`zotero-library-agent\` for broad library requests. Zotero remains a nested provider when an ARSU producer owns the academic task.
11. For Explain, use targeted status/list/show/check reads and write nothing. For Export, use a bounded pack or an explicit handoff; state that external bytes and private \`work/\` content are excluded.

## Decision table

| Situation | Route |
| --- | --- |
| Vague or cross-Skill academic goal | Select a supported ARSU route and present its exact summary. |
| Existing active instance | Resume by machine instance ID and its current instructions. |
| Formal Gate ready for review | Dispatch Verify; wait for human confirmation before Decide. |
| Scope, claim, structure, or branch choice | Dispatch Decide when the choice is known; otherwise Propose or ask the user. |
| High-impact stable research meaning change | Dispatch Propose. |
| Directly editable handoff or stable spec | Edit the owning file, then run a targeted check. |
| Plugin declined or unavailable | Continue with the same base ARSU producer. |

## Output

Return the selected branch, evidence used, canonical selector, route summary or current blocker, confirmation status, exact next Skill or command, and the next owning file. Mark unresolved facts as unknown.

## Completion

Finish when the user has one current, authorized next action and its owner is explicit. Do not start a different instance, child, plugin install, Gate decision, or branch on the strength of an earlier confirmation.

${renderLiteratureSourcePolicyProjection()}

${renderNavigateRoutingProjection()}`,
} satisfies CompanionWorkflowSource;
