import type { CompanionWorkflowSource } from "../types.js";

export const proposeWorkflow = {
  id: "propose",
  name: "ResearchSpec Propose",
  description: "Turn an evidence-backed high-impact research semantic change into a validated pending ResearchSpec contract change. Use for changes to research intent, claims, constraints, source policy, or workflow meaning; never to apply the change.",
  instructions: `## Mission

Convert a clearly stated semantic change into a reviewable, deterministic pending contract change. Preserve current stable specs until a separate human decision accepts the proposal.

## When to Use

- The research question, scope, target output, claim wording/strength/limits, source policy, manuscript constraint, or workflow semantics should change.
- Check or verify finds a semantic mismatch that cannot be repaired mechanically.
- New evidence justifies a bounded contract update and the user wants a reviewable proposal rather than a direct edit.

## Do Not Use

- Do not use for syntax-only repairs, generated tool refresh, artifact registration, gate append, stage transition, or manuscript prose revision.
- Do not create unsupported targets outside the five stable specs.
- Do not accept, apply, reject, postpone, or archive the created change; use decide and archive separately.

## Inputs

- A new safe change ID that is not active or archived.
- Title, rationale, risk level, and explicit impact statements.
- For each patch: stable target contract, operation, unique target path, exact current value where required, proposed value where required, reason, artifact IDs, and decision IDs.
- Actor kind (human or agent), actor name, and explicit confirmation to create a pending proposal.

## CLI Examples

\`\`\`bash
researchspec show claim:C001 --json
researchspec list artifacts --json
researchspec propose weaken-c001 --input /tmp/weaken-c001.json --actor-kind agent --actor-name reviewer --dry-run --json
researchspec propose weaken-c001 --input /tmp/weaken-c001.json --actor-kind agent --actor-name reviewer --yes --json
researchspec show change:weaken-c001 --json
researchspec check contracts --json
\`\`\`

Example semantic input:

\`\`\`json
{
  "title": "Weaken claim C001",
  "rationale": "Evidence supports association rather than causality.",
  "risk_level": "high",
  "impact": ["Changes permitted wording for C001."],
  "patches": [{
    "target_contract": "specs/claims.yaml",
    "operation": "replace",
    "target_path": "claims[C001].strength",
    "current_value": "strong",
    "proposed_value": "moderate",
    "reason": "Align strength with evidence.",
    "source_artifact_ids": ["A0007"],
    "source_decision_ids": []
  }]
}
\`\`\`

## Workflow

1. Restate the requested semantic change and identify why it is high impact. If the desired outcome is still exploratory, use explore or ARSU research before authoring a patch.
2. Run targeted check and show/list views for every affected contract object and evidence reference. Record exact current values from CLI-visible files, not memory.
3. Choose the smallest patch set that expresses one coherent decision. Split unrelated research choices into separate change IDs.
4. Select only one of the five stable contracts. YAML paths use dot segments and unique \`collection[id]\` selectors. Project Markdown permits only \`replace section[Heading]\`.
5. Choose operation by invariant:
   - add: target absent, no current value, proposed value present;
   - replace: target present, exact current and proposed values present;
   - remove: target present, exact current value, no proposed value;
   - append: target is an array, exact current array and proposed appended value;
   - merge: target and proposed value are objects, exact current object.
6. Cite registered artifact and ledger decision IDs that justify each patch. Empty arrays are allowed only when the rationale genuinely has no such evidence; do not invent IDs.
7. Build a strict JSON payload with no extra keys. Store it outside the proposal directory or in a temporary location; the CLI creates only canonical proposal outputs.
8. Run the complete \`propose\` command with \`--dry-run --json\`. Inspect derived patch IDs, target validation, three create operations, user ownership, risk, and human-decision requirement.
9. Explain the semantic before/after values, evidence, impact, risk, and the fact that no stable spec will change. Resolve any selector, current-value, reference, ID collision, or output conflict before continuing.
10. Obtain explicit confirmation to create the pending proposal. In non-interactive use, \`--yes\` confirms creation only.
11. Execute the identical command without \`--dry-run\`. Do not add \`--force\` and do not change the payload between preview and execution.
12. Run \`show change:<id> --json\`, \`list changes --json\`, and the relevant check. Report the pending selector and that a human must use decide to resolve it.

## Decision Table

| Situation | Action |
| --- | --- |
| Current value is uncertain | Reinspect target; do not omit it for replace/remove/append/merge. |
| Selector matches zero or multiple records | Correct the contract/selector or stop; never choose a match. |
| Evidence ID is missing | Register/produce evidence through its owner or remove only if truly not a basis. |
| Request changes manuscript prose only | Route to ARSU draft-patch authoring. |
| Multiple unrelated semantic choices | Create separate proposals. |
| Change ID exists active or archived | Choose a new ID; force is forbidden. |
| User asks to apply immediately | Create pending proposal, then use decide as a separate confirmed workflow. |

## Failure Recovery

- Exit 2: correct strict JSON shape, actor, ID, operation values, or arguments. Preserve the rejected payload for review.
- Exit 1: reread target and evidence. Current-value or selector conflicts indicate the proposal basis is stale or ambiguous.
- Exit 3: choose a new create-only change ID or resolve the existing target explicitly; never overwrite it.
- If post-create show/check fails, do not hand-edit the generated machine contract. Report the files and route structural repair through check.

## Output Contract

Return change selector, title and risk, patch-by-patch before/after summary, evidence IDs, dry-run operation paths/order, confirmation, execution result, post-create visibility/check result, and the explicit statement “pending; not accepted or applied.”

## Guardrails

- Stable specs, runtime state, registry, and ledgers must remain byte-for-byte unchanged during propose.
- \`contract-patch.yaml\` is the final create operation and the authoritative pending machine contract.
- Never turn lack of evidence into confident semantic content and never use proposal creation as acceptance.

## Completion

Finish when a validated pending change is visible through show/list/check, its evidence and impact are understandable, and the next required action is explicit human review through \`researchspec-decide\`.`,
} satisfies CompanionWorkflowSource;
