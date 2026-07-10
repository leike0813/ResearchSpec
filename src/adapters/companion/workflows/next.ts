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
researchspec submit work:rq-brief --input submission.json --actor-kind agent --actor-name deep-research --dry-run --json
researchspec check runtime --json
researchspec list gates --json
researchspec list changes --json
researchspec show change:claim-strength --json
researchspec archive --json
researchspec instructions gate:sf-<instance>/<node> --json
researchspec instructions transition:sf-<instance>/<node> --json
\`\`\`

## Workflow

1. Run \`researchspec status --json\` and record run status, active stage, validation summary, pending items, blocking gates, recent artifacts, installed tools, and \`workflow_control\` work-item states.
2. If status or snapshot diagnostics are blocking, inspect the narrowest relevant check and make resolving the root deterministic blocker the primary action.
3. Otherwise inspect the latest blocking gate. Map any gate decision event to the originating \`gate:<id>\`; do not recommend deciding a ledger event selector.
4. Otherwise inspect pending contract changes and draft patches. Prefer an item already awaiting explicit review over creating new semantic work.
5. Otherwise run the no-selector \`archive --json\` view to identify resolved, evidence-complete items. Recommend archive only after the candidate is inspectable.
6. Otherwise select from \`status.data.workflow_control.ready_items\` and look up details in \`status.data.workflow_control.work_items\`. If several ready items have equal priority, show their selectors and ask the user to choose; do not invent an ordering absent from the graph.
7. If no instance is active and \`startable_subflows\` is non-empty, request \`instructions subflow:<template> --json\`, present its exact route/prerequisite/artifact/Gate/cost summary, and ask for confirmation. Do not execute Start in this read-only workflow.
8. Otherwise request instructions for the selected canonical scoped or legacy work selector. Use returned dependencies, parallel metadata, output, allowed writes, validation, submission, and completion policy; never reconstruct them from static Skill text.
9. If a candidate is unregistered and submission is automatic with valid start authorization, recommend the producer Skill's direct hash-bound Submit sequence. Otherwise recommend \`researchspec-submit\` for manual/legacy registration.
10. If the frontier contains a ready Gate, request its instructions and route semantic assessment/confirmation to Verify. If it contains several decision-required transitions, route the exact candidates to Decide. If it contains one ready automatic transition, return its instructions and exact dry-run/Advance sequence as the primary action; keep this navigation workflow read-only.
11. If \`workflow_control.configured\` is false, recommend configuring or migrating the graph. If invalid, route to \`researchspec-check\`.
12. Form one primary recommendation with owner skill/command, reason, blockers, required inputs, and a verifiable completion condition. Add at most two viable alternatives, then stop without executing.

## Decision Table

| Highest-priority state | Primary recommendation |
| --- | --- |
| Blocking deterministic diagnostic | \`researchspec-check\` on the affected target. |
| Blocking gate | Inspect and route the originating gate to \`researchspec-decide\`. |
| Pending change or draft patch | Review/show, then decide the canonical item. |
| Resolved archivable item | \`researchspec-archive\` after its preview gate. |
| Ready work item without candidate | Fetch \`instructions work:<id>\` and recommend its declared producer Skill. |
| Startable subflow and no active instance | Present \`instructions subflow:<template>\` and request route confirmation. |
| Automatic item with candidate and trusted start authorization | Recommend the producer Skill's direct hash-bound Submit sequence. |
| Manual/legacy item with \`candidate_unregistered\` | Recommend \`researchspec-submit work:<id>\`. |
| Several ready work items | Ask the user to choose among their canonical \`work:<id>\` selectors. |
| Work-item graph absent | Configure/migrate the workflow contract; do not infer a Skill. |
| Ready formal Gate | Route its evidence contract and selector to Verify for user confirmation. |
| One ready automatic transition | Recommend its receipt-bound dry-run/Advance sequence. |
| Several transition candidates | Route their decision point and selectors to Decide. |

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
