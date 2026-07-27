import type { CompanionWorkflowSource } from "../types.js";

export const decideWorkflow = {
  id: "decide",
  name: "ResearchSpec Decide",
  description: "Review and explicitly resolve one pending ResearchSpec semantic change, draft patch, case action, or eligible Gate override. This is the only public semantic apply workflow.",
  instructions: `## Mission

Record one explicit human decision and, for acceptance, apply its already-authored Semantic v2 payload through the CLI lifecycle. Keep target selection, meaning, actor, rationale, confirmation, and postconditions auditable.

## When to Use

- The user wants to accept, reject, or postpone a pending contract change or manuscript draft patch.
- The user wants to resolve a \`case-action:<id>\`, an eligible Gate override, or a decision-required transition.
- A proposal or patch is authored and now requires human review.

## Do Not Use

- Do not author a new semantic change; use Propose. Do not author manuscript revision operations; use the responsible ARSU workflow.
- Do not guess a candidate, decide a ledger event directly, or treat \`--yes\` as acceptance.
- Do not hand-edit stable specs, patched drafts, receipts, artifact registry, change status, or decision ledger.

## Inputs

- One canonical \`change:<id>\`, \`patch:<id>\`, \`case-action:<id>\`, eligible \`gate:<id>\`, or decision-required \`transition:<instance>/<id>\` selector.
- The human decision, actor name, and rationale required by its action descriptor.

## CLI Examples

\`\`\`bash
researchspec status --json
researchspec instructions change:weaken-c001 --json
researchspec instructions case-action:<id> --json
researchspec show change:weaken-c001 --json
researchspec decide change:weaken-c001 --decision accept --actor-name "Research Lead" --reason "Evidence supports moderate strength" --json
researchspec check contracts --json
\`\`\`

## Workflow

1. Run bounded \`status --json\`. If no selector was supplied, present only the current decision-capable selectors; map ledger evidence back to its originating change, patch, case action, Gate, or transition.
2. Resolve exactly one target, then fetch \`instructions <selector> --json\`. Its Semantic v2 action descriptor defines allowed decisions, actor/reason fields, prerequisites, policy, and postconditions.
3. Inspect the selected item and its evidence: affected current/proposed values for changes, base artifact/hash for patches, exact event/receipt for Gate overrides, or candidate list for a branch action.
4. Explain accept, reject, and postpone in the descriptor's terms. Ask the human for the decision, actor, and rationale without strengthening their stated reason.
5. Apply the descriptor policy. Decide is normally \`plan_bound\`: preview the exact chosen decision, show semantic effect and writes, obtain explicit human confirmation, then execute the unchanged action with the returned plan hash. If a descriptor specifies another policy, follow it exactly.
6. Follow \`next_selectors\` for targeted visibility or checks. Report decision ID, lifecycle status, affected outputs, receipt evidence where applicable, and the next owner.

## Decision Table

| State | Allowed response |
| --- | --- |
| Pending Semantic v2 change or patch with valid basis | Only descriptor-allowed decision after human review. |
| Pending case action | Resolve the named case only; do not infer a different branch. |
| Failed Gate eligible for override | Bind the decision to the exact Gate event and receipt. |
| Multiple transition candidates | Accept exactly one canonical option; reject/postpone does not select another. |
| Target, evidence, base hash, or receipt drift | Stop and route to its owner; do not execute stale intent. |
| User has not stated a decision | Stop; \`--yes\` is irrelevant. |

## Failure Recovery

- Ambiguity: return canonical candidates and request a selector.
- Domain block: preserve files, cite the failed descriptor prerequisite, and route to Check, Propose, or ARSU patch authoring.
- Write conflict or post-check failure: inspect targeted receipts/state and report accurately; never manually finish or reverse a lifecycle.

## Output Contract

Return the reviewed selector, human decision and rationale, descriptor policy, semantic effect, confirmation, result, \`next_selectors\`, authoritative receipt/status/check evidence, and any unresolved blocker.

## Guardrails

- This workflow records human intent; the agent cannot manufacture consent.
- Acceptance revalidates targets and evidence through the CLI. Ledger writes are CLI-owned.

## Completion

Finish only when the exact reviewed decision has executed or been authoritatively blocked, and the next action is explicit.`,
} satisfies CompanionWorkflowSource;
