import type { CompanionWorkflowSource } from "../types.js";

export const nextWorkflow = {
  id: "next",
  name: "ResearchSpec Next",
  description: "Restore ResearchSpec context across sessions and recommend one primary next action from diagnostics, gates, pending items, archive readiness, and workflow stage. Use for navigation only; it performs no high-impact write.",
  instructions: `## Mission

Recover enough authoritative state to recommend one verifiable next action. Keep the response decisive without hiding blockers, and avoid turning a navigation request into execution.

## When to Use

- The user returns after a pause and asks what to do next.
- Several pending changes, gates, patches, or workflow activities compete for attention.
- Another agent needs a compact next-step recommendation grounded in current state.

## Do Not Use

- Do not execute decisions, archives, proposals, stage transitions, handoffs, packs, research, writing, or review.
- Do not use this workflow for a broad workspace explanation; use \`researchspec-explore\`.
- Do not guess an ARSU skill when the current workflow stage lacks an explicit mapping.

## Inputs

- Optional workspace path and user goal or deadline.
- Optional scope such as “next contract action” or “next paper-stage action.”
- No decision payload is collected because this workflow is read-only.

## CLI Examples

\`\`\`bash
researchspec status --json
researchspec instructions work:rq-brief --json
researchspec check runtime --json
researchspec list gates --json
researchspec list changes --json
researchspec show change:claim-strength --json
researchspec archive --json
\`\`\`

## Workflow

1. Run \`researchspec status --json\` and record run status, active stage, validation summary, pending items, blocking gates, recent artifacts, installed tools, and \`workflow_control\` work-item states.
2. If status or snapshot diagnostics are blocking, inspect the narrowest relevant check and make resolving the root deterministic blocker the primary action.
3. Otherwise inspect the latest blocking gate. Map any gate decision event to the originating \`gate:<id>\`; do not recommend deciding a ledger event selector.
4. Otherwise inspect pending contract changes and draft patches. Prefer an item already awaiting explicit review over creating new semantic work.
5. Otherwise run the no-selector \`archive --json\` view to identify resolved, evidence-complete items. Recommend archive only after the candidate is inspectable.
6. Otherwise select from \`status.data.workflow_control.ready_items\` and look up details in \`status.data.workflow_control.work_items\`. If several ready items have equal priority, show their selectors and ask the user to choose; do not invent an ordering absent from the graph.
7. Run \`researchspec instructions work:<id> --json\` for the selected item. Recommend its declared \`producer_skill\`, dependencies, output path, allowed writes, and completion policy; never reconstruct these from static Skill text.
8. If \`workflow_control.configured\` is false, make “configure or migrate the workflow work-item graph” the action. If it is invalid, route to \`researchspec-check\`; do not guess from stage title.
9. If the active stage has \`stage_work_complete: true\` and \`transition_required: true\`, report that a transition is required but unavailable in the current read-only control plane; do not claim the run is complete or edit state.
10. Form one primary recommendation with owner skill/command, reason, blockers, required inputs, and a verifiable completion condition. Add at most two genuinely viable, lower-priority alternatives, then stop without executing.

## Decision Table

| Highest-priority state | Primary recommendation |
| --- | --- |
| Blocking deterministic diagnostic | \`researchspec-check\` on the affected target. |
| Blocking gate | Inspect and route the originating gate to \`researchspec-decide\`. |
| Pending change or draft patch | Review/show, then decide the canonical item. |
| Resolved archivable item | \`researchspec-archive\` after its preview gate. |
| One ready work item | Fetch \`instructions work:<id>\` and recommend its declared producer Skill. |
| Several ready work items | Ask the user to choose among their canonical \`work:<id>\` selectors. |
| Work-item graph absent | Configure/migrate the workflow contract; do not infer a Skill. |
| Active stage work complete | Report the pending transition boundary; do not edit state. |

## Failure Recovery

- If status fails because the workspace is invalid, fall back only to the relevant check; do not synthesize a stage recommendation.
- If several equal-priority pending items exist, list concise evidence and ask the user to choose rather than using recency.
- If status and instructions disagree, cite the inconsistency and recommend check/explore before action.
- If the user's desired action would skip a higher-priority blocker, explain the dependency and leave execution to the owning workflow.

## Output Contract

Return exactly one “Primary next action” with canonical selector or skill, evidence, blockers, inputs, and completion test. Optionally return no more than two labeled alternatives. Include commands only as suggested invocations; do not run writing commands.

## Guardrails

- Priority is fixed: blocking diagnostic → blocking gate → pending item → archivable item → ready work item → transition/configuration boundary.
- User urgency may affect explanation but does not make an invalid lifecycle safe.
- Keep the workflow read-only even when the next action seems obvious.

## Completion

Finish after one primary recommendation and at most two alternatives are grounded in current CLI evidence with a clear completion condition.`,
} satisfies CompanionWorkflowSource;
