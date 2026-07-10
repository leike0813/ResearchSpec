import type { CompanionWorkflowSource } from "../types.js";

export const decideWorkflow = {
  id: "decide",
  name: "ResearchSpec Decide",
  description: "Review, dry-run, explicitly confirm, and accept, reject, or postpone one pending ResearchSpec change, draft patch, or blocking gate. This is the only public semantic apply workflow.",
  instructions: `## Mission

Record one explicit human decision and, for acceptance, apply its already-authored semantic payload through the CLI's validated lifecycle. Keep target selection, meaning, actor, rationale, preview, confirmation, and postconditions auditable.

## When to Use

- The user wants to accept, reject, or postpone a pending contract change or manuscript draft patch.
- The user wants to resolve an eligible blocking gate through an explicit human override decision.
- Multiple transition candidates require one explicit workflow-branch choice.
- A proposal or patch has already been authored and now requires review.

## Do Not Use

- Do not author a new semantic change; use propose. Do not author manuscript revision ops; use the responsible ARSU workflow.
- Do not decide a decision-ledger event directly, guess a candidate, or treat \`--yes\` as acceptance.
- Do not hand-edit stable specs, patched drafts, receipts, artifact registry, change status, or decision ledger.

## Inputs

- One canonical \`change:<id>\`, \`patch:<id>\`, eligible \`gate:<id>\`, or decision-required \`transition:<instance>/<id>\` selector.
- Decision: accept, reject, or postpone.
- Human actor name and rationale required for accept/reject.
- Explicit confirmation after review of semantic impact and dry-run writes.

## CLI Examples

\`\`\`bash
researchspec decide --json
researchspec status --json
researchspec show change:weaken-c001 --json
researchspec decide change:weaken-c001 --decision accept --actor-name "Research Lead" --reason "Evidence supports moderate strength" --dry-run --json
researchspec decide change:weaken-c001 --decision accept --actor-name "Research Lead" --reason "Evidence supports moderate strength" --json
researchspec check contracts --json
researchspec decide transition:sf-<instance>/<node> --decision accept --actor-name "Research Lead" --reason "Selected branch" --dry-run --json
\`\`\`

## Workflow

1. If no selector is supplied, inspect \`decide --json\`, status, and relevant lists. Map pending decision events back to their change, draft patch, or gate IDs.
2. Resolve exactly one canonical target. If multiple items remain, present title/status/risk/evidence and ask the user; do not preselect.
3. Run \`show <selector> --json\` where applicable. For changes, inspect every target/current/proposed value and evidence reference. For draft patches, inspect base artifact/hash and operations. For gates, require the latest confirmed failed reverification and its trusted receipt. For transitions, inspect all candidates from status/instructions and the shared decision point.
4. Explain what accept, reject, and postpone mean for this item. Acceptance may change stable specs or create a revised draft and receipt; rejection resolves without applying; postponement records the pending choice without resolving the item.
5. Ask the user for the decision, actor name, and rationale. Preserve their meaning; do not strengthen a vague statement into a different rationale.
6. Construct the complete command and run it with \`--dry-run --json\`. Never preview with placeholder actor/reason or a different decision.
7. Inspect all planned writes and semantic effects. For contract changes, verify stable targets, current values, evidence IDs, lifecycle update, receipt, registry, and ledger order. For draft patches, verify base hash, output path, artifact IDs, receipt, registry, and ledger. For gates, verify only the authorized decision record.
8. Treat target drift, missing evidence, ambiguous selector, invalid base hash, blocking prerequisite, receipt conflict, or output conflict as authoritative blockers. Return to propose/ARSU/check as appropriate.
9. Present a confirmation summary containing selector, risk, decision, actor, rationale, before/after meaning, paths written, and irreversible/external consequences. Ask for explicit confirmation.
10. Execute the identical command without \`--dry-run\`. Do not add \`--yes\` as a proxy for confirmation and do not alter reason or decision.
11. Re-run \`show\` when the active item remains visible, \`status --json\`, and the relevant contract/runtime/artifact check. Inspect receipt and registry evidence for accepted change/patch items.
12. Report the decision ID, final lifecycle status, affected outputs, post-check result, and whether the item is now eligible for archive.

## Decision Table

| State | Allowed response |
| --- | --- |
| Proposed/postponed change with valid targets | Accept, reject, or postpone after preview. |
| Proposed/postponed draft patch with valid base | Accept, reject, or postpone after preview. |
| Blocking failed reverification eligible for override | Bind the override to its exact Gate event and receipt. |
| Multiple eligible transition candidates | Accept exactly one canonical transition option; reject/postpone does not select another implicitly. |
| Already applied/rejected/superseded item | Stop; do not record a second resolution. |
| Target/current value changed since proposal | Block acceptance; revise or supersede proposal. |
| Missing artifact/decision evidence | Block acceptance until authoritative evidence exists. |
| User has not stated a decision | Stop; \`--yes\` is irrelevant. |

## Failure Recovery

- Ambiguity: return candidates and request a canonical selector.
- Domain block: preserve all files, cite the failed precondition, and route to check, propose, or ARSU patch authoring.
- Write conflict: inspect existing receipt/output/ledger state before retrying; never delete evidence to make the command succeed.
- Partial-looking state: run status/check and inspect the transactional outputs. Do not manually finish an interrupted lifecycle.
- Post-check failure: report the decision and resulting evidence accurately, then use check; do not conceal or reverse it outside a new authorized workflow.

## Output Contract

Before execution return review summary, complete dry-run command, semantic effect, planned writes, risks, and explicit confirmation request. After execution return selector, decision ID/status, actor/rationale, outputs and receipt/registry/ledger evidence, post-checks, archive eligibility, and any unresolved blocker.

## Guardrails

- This workflow records human intent; the agent cannot manufacture consent.
- Acceptance revalidates targets and evidence against current workspace state.
- Ledger append is last and CLI-owned. Never reorder or recreate lifecycle writes manually.

## Completion

Finish only when the exact reviewed decision has executed, authoritative receipts/status/checks confirm its outcome, and the user knows whether archive or further repair is next.`,
} satisfies CompanionWorkflowSource;
