---
name: transform-revision-patching
description: "Deterministically anchors and applies revision patches fail-closed."
metadata:
  capability_id: transform-revision-patching
  node_kind: checker
  execution_type: mixed
  gate_policy: required
  license: CC BY-NC 4.0
---

# Revision Patching

Execute exactly one ResearchSpec capability node.

## Inputs

- `revision_patch` (revision-patch.v1)

## Outputs

- `patched_manuscript` (patched-manuscript.v1)
- `response_to_reviewers` (response-to-reviewers.v1)

## Knowledge

- Load knowledge ID `revision-patch-protocol` from `knowledge/revision-patch-protocol.md`.

## Procedure

# Procedure

Work from a structured `revision_patch`. Produce `patched_manuscript`.

1. Validate the ResearchSpec current patch schema and target manuscript hash. Use `authorization_context: review_roadmap` for review-driven changes and `integrity_correction` for supplied integrity findings; an omitted context has review-roadmap semantics.
2. Apply changes using the deterministic anchor/apply tooling:
   - anchorize the target into stable blocks
   - apply only declared changes
   - fail closed on any unmatched block
3. Verify untouched block bytes are preserved.
4. Before applying changes to structure, research intent or claim strength, read the referenced ResearchSpec change and verify that the user accepted the relevant scope. An ID in the patch is a reference, not proof of authorization. Surface missing or mismatched approval before applying the patch.
5. Return the patched manuscript and an apply report.

## Claim-Strength Changes

For a review-driven operation that changes an established claim's strength, record `claim_strength_changes` with the `claim_id`, accepted `change_id`, `from_strength`, `to_strength`, `direction` and a concrete rationale. Strength values follow the stable claims contract (`tentative`, `supported`, `strong`). Inspect the manuscript evidence and accepted change; structural validation cannot determine whether prose actually strengthens a claim or whether the referenced decision was accepted.

Integrity corrections preserve claim scope and strength and cannot carry claim-strength changes. If a correction requires such a change, surface it for a separate ResearchSpec proposal and author decision. Preserve all unrelated block bytes and do not introduce collateral edits. The local annotation mapping records implemented, answered, deferred, rejected, unresolved or superseded author dispositions; upstream adjudication sidecars do not replace it.

## Response-To-Reviewers Co-Emission

After a successful apply, co-emit `response_to_reviewers` at an ordinary project path outside `researchspec/`:

- One provisional response item per roadmap item addressed by the patch.
- Each item carries: response text, status (`addressed` / `declined` / `partial`), decline justification when applicable, and the `roadmap_item_ids` or stable correction IDs (`IL-SERIOUS-<n>`, `IL-MEDIUM-<n>`, `IL-MINOR-<n>`, or native experiment-alignment IDs) it claims.
- Integrity-correction rounds emit no response items because no review round occurred.
- Never fabricate a response for an item the patch did not address; mark it `not_addressed` and route it for human decision.

```markdown
## Response to Reviewers (provisional)

| item_id | response | status | justification |
|---|---|---|---|
```

## Output Format

```markdown
## Patch Apply Report
- applied_actions: [...]
- untouched_blocks: N
- escalations: [...]
- output_hash: [...]
```


## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
