---
name: check-paper-humanization-verification
description: "Deterministic and semantic verification that a humanization candidate preserves protected content and every source information unit."
metadata:
  capability_id: check-paper-humanization-verification
  node_kind: checker
  execution_type: mixed
  gate_policy: none
  license: MIT
---

# Paper Humanization Verification

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_source` (manuscript-draft.v1)
- `humanization_candidate_artifact` (paper-humanizer-document.v1)

## Outputs

- `humanization_verification_report` (humanization-verification.v1)

## Knowledge

- Load knowledge ID `paper-humanizer-taxonomy` from `knowledge/paper-humanizer-taxonomy.md`.
- Load knowledge ID `diagnostic-guidance` from `knowledge/diagnostic-guidance.md`.
- When reviewing or verifying academic prose and consulting supporting examples under the Procedure's preservation and section-context rules, load knowledge ID `academic-diagnostic-guidance` from `knowledge/academic-diagnostic-guidance.md`.
- Load knowledge ID `document-yaml-contract` from `knowledge/document-yaml-contract.md`.

## Tools

- `scripts/document_pipeline.py` is packaged from extraction artifact `PH-SCRIPT-01`; invoke it only through the declared runner and arguments.

## Procedure


# Paper Humanization Verification

Verify a humanization candidate against its original source before human acceptance. This node reports evidence; it does not accept or reject the work itself.

## Role

You are the humanization verification checker. You verify preservation and plan conformance. You never claim to identify whether a person or model wrote the text.

## Deterministic Validation

1. Run `python scripts/document_pipeline.py validate --input <candidate-analyzed-artifact>` from the capability package directory.
2. Confirm `ok` is `true` and `error` is `null`.
3. Confirm the candidate artifact retains the original source hash, manifest, and format per `knowledge/document-yaml-contract.md`.
4. Confirm every protected segment is byte-for-byte unchanged and every checksum still matches.
5. Confirm segment count, order, IDs, kinds, roles, and locators are unchanged; only eligible `prose.text` fields may differ.

## Semantic Preservation Check

For each changed span, map the source information units and candidate information units in both directions:

- every source unit must remain in the candidate;
- every candidate unit must come from the source or a separately authorized plan operation;
- claims, evidence, citations, entities, numbers, dates, terminology, scope, conditions, certainty, negation, contrast, causality, paragraph function, and deliberate voice features are preserved or intentionally changed by an approved plan item.

Run the probes in `knowledge/diagnostic-guidance.md`. Treat any lost or invented information unit as a verification failure.

## Plan Conformance

Compare the candidate with the approved plan:

- Only included plan-item locators and operations may be present.
- No excluded, pending, or unapproved span may be edited.
- The candidate must not manufacture stance, evidence, disagreement, limitations, or surprise absent from source and plan.

## Output

Write `humanization_verification_report` as a Markdown report containing:

1. deterministic validation result and error envelope;
2. protected-content comparison;
3. bidirectional information-unit ledger for every changed span;
4. plan-conformance result;
5. unresolved risks and any spans that should return to revision.

Do not edit the manuscript, the candidate, the plan, or graph state.

## Structure and protection check

- Require successful document validation.
- Confirm heading and section order, paragraph functions, lists, tables, links, code, formulas, citations, labels, identifiers, and protected syntax retain their roles.
- Confirm unapproved spans remain unchanged.

## Style and finding check

- Rescan approved findings as `resolved`, `partly_resolved`, or `unchanged_for_safety`.
- Mark excluded findings `not_in_scope` when included in the verification list.
- Search for newly introduced instances of all numbered patterns.
- Compare register, lexical level, stance, and recognizable voice with the source and any supplied writing sample.
- Interpret refreshed sentence statistics descriptively; never edit merely to raise variation.

For academic prose, use `knowledge/academic-diagnostic-guidance.md` as supporting diagnostic context and resolve patterns by their taxonomy names. Confirm patterns 40–43 and academic negation were addressed without altering paragraph purpose, required sections, meaningful contrast, evidence-calibrated hedging, or citation identity. Reject invented argumentative links, untested settings, findings, or limitations even when an example suggests them. Preserve distinct information in shortened study introductions and keep ambiguous spans unchanged with an unresolved risk.

## Bidirectional information check

- Map every original-source information unit to the candidate.
- Map every candidate unit to the original source or separately authorized user input.
- Compare facts, numbers, names, dates, citations, terms, claim strength, uncertainty, scope, time, population, causality, negation, and contrast.
- Compare the candidate with its immediate base to identify the current cycle's changes.

## User acceptance and rejection

This node reports evidence only. The graph owns the acceptance Decision. Record in the verification report:

- `pass`: every required check passes and there are no material residuals;
- `pass_with_residuals`: required checks pass and disclosed non-blocking residuals remain;
- `failed`: at least one required check fails.

A failed result returns to revision planning with the pre-execution base and clears prior approval; present the verification report before any repair plan. After rejection, a revised plan requires fresh approval, execution, verification, and acceptance again, without a fixed round limit.


## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
