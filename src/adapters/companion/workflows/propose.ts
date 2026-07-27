import type { CompanionWorkflowSource } from "../types.js";

export const proposeWorkflow = {
  id: "propose",
  name: "ResearchSpec Propose",
  description: "Turn an evidence-backed high-impact research semantic change into a validated pending ResearchSpec contract change. Use for changes to research intent, claims, constraints, source policy, or workflow meaning; never to apply the change.",
  instructions: `## Mission

Convert one clearly stated semantic change into a reviewable pending Semantic v2 contract change. Stable specs remain unchanged until a separate human decision resolves the proposal.

## When to Use

- Research intent, scope, target output, claims, source policy, manuscript constraints, workflow meaning, or a case action needs a high-impact semantic change.
- Verification finds a semantic mismatch that cannot be repaired mechanically.

## Do Not Use

- Do not use for syntax-only repair, artifact registration, Gate submission, stage transition, or manuscript prose revision.
- Do not accept, apply, reject, postpone, or archive the created change; route that later choice to Decide.

## Inputs

- A new safe change ID and the user-facing rationale, risk, and impact.
- Semantic v2 patches with target contract, operation, target path, current/proposed values where required, reason, and evidence references.
- A \`case-action:<id>\` selector when the descriptor says a pending case needs a proposal rather than a direct semantic patch.
- Actor identity and the confirmation required by the descriptor.

## CLI Examples

\`\`\`bash
researchspec status --json
researchspec instructions change:weaken-c001 --json
researchspec instructions case-action:<id> --json
researchspec propose weaken-c001 --input /tmp/weaken-c001.json --actor-kind agent --actor-name reviewer --json
researchspec show change:weaken-c001 --json
researchspec check contracts --json
\`\`\`

## Workflow

1. Restate the requested semantic change and identify the evidence that makes it high impact. If it is still exploratory, route to Navigate or the relevant ARSU producer.
2. Run bounded \`status --json\`, select the canonical \`change:\`, \`patch:\`, or \`case-action:\` selector, and read its instructions/action descriptor before building input.
3. Inspect only the affected contract objects and evidence references. Record current values from CLI-visible state, not memory.
4. Build the smallest coherent Semantic v2 payload. Split unrelated choices into separate changes; do not add CLI-owned lifecycle fields.
5. Apply the descriptor policy: execute \`direct\` once, obtain named confirmation for \`human_confirmed\`, or preview and bind the exact \`plan_bound\` payload. Explain before/after meaning, evidence, impact, and risk before any required confirmation.
6. Follow the returned \`next_selectors\`. Use targeted \`show\` or \`check\` to verify visibility and validation; do not declare the proposal accepted or applied.

## Decision Table

| Situation | Action |
| --- | --- |
| Current value is uncertain | Reinspect the target; do not omit it when the descriptor requires it. |
| Selector matches zero or multiple records | Correct the selector or stop; never choose a match. |
| Evidence ID is missing | Register or produce evidence through its owner, or remove it only when it is genuinely not a basis. |
| Case requires a human branch choice | Preserve the \`case-action:\` selector and route the final choice to Decide. |
| User asks to apply immediately | Create or identify the pending proposal, then use Decide as a separate confirmed workflow. |

## Failure Recovery

- Exit 2: correct the descriptor-declared Semantic v2 input or arguments; preserve the rejected payload for review.
- Exit 1: reread the target and evidence. A current-value or selector conflict means the proposal basis is stale or ambiguous.
- Exit 3: choose a new create-only ID or resolve the existing target explicitly; never overwrite it.

## Output Contract

Return the selector, title and risk, patch-by-patch before/after summary, evidence IDs, descriptor policy used, confirmation status, execution result, relevant \`next_selectors\`, and the explicit statement that the item is pending and not accepted or applied.

## Guardrails

- Stable specs, runtime state, registry, and ledgers remain CLI-owned during propose.
- Never turn lack of evidence into confident semantic content or proposal creation into acceptance.

## Completion

Finish when the pending change or case action is visible through its returned selector, its evidence and impact are understandable, and the next owner is explicit.`,
} satisfies CompanionWorkflowSource;
