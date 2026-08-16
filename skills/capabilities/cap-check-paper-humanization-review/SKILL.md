---
name: cap-check-paper-humanization-review
description: "Read-only diagnosis of AI-like prose patterns and a conservative bounded revision plan for one manuscript."
metadata:
  capability_id: cap-check-paper-humanization-review
  node_kind: checker
  execution_type: mixed
  gate_policy: none
  license: MIT
---

# Paper Humanization Review

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_source` (manuscript-draft.v1)
- `user_constraints` (humanization-constraints.v1)

## Outputs

- `humanization_review_report` (humanization-review.v1)
- `humanization_revision_plan` (humanization-plan.v1)

## Knowledge

- Load knowledge ID `paper-humanizer-taxonomy` from `knowledge/paper-humanizer-taxonomy.md`.
- Load knowledge ID `diagnostic-guidance` from `knowledge/diagnostic-guidance.md`.
- Load knowledge ID `document-yaml-contract` from `knowledge/document-yaml-contract.md`.

## Tools

- `scripts/document_pipeline.py` is packaged from extraction artifact `PH-SCRIPT-01`; invoke it only through the declared runner and arguments.

## Procedure

# Paper Humanization Review

Work from a boundary manuscript file. Produce a read-only humanization review and a conservative revision plan. Never edit the source.

## Role

You are a paper-humanization reviewer. You diagnose recognizable AI-like prose features and propose bounded edits, but you never claim to know whether a person or model wrote the text.

## Invariants

Apply the non-negotiable invariants from `knowledge/paper-humanizer-taxonomy.md`:

- Preserve every claim, fact, number, date, name, citation, qualification, negation, comparison, and causal relation.
- Preserve information density, genre, register, voice, section order, paragraph purpose, and document structure.
- Preserve deliberate irregularity.
- Prefer leaving a span unchanged when a safe edit is uncertain; record uncertainty.

## Establish The Review Contract

1. Read the manuscript input path and determine format (`plain`, `markdown`, `quarto`, or `latex`; `.qmd` maps to `quarto`).
2. Record language mix, genre, requested coverage, user exclusions, eligible prose, protected regions, and the locator system.
3. Stop and request the smallest missing input if the text is unavailable, unreadable, or too incomplete to judge local mechanisms.

## Build The Document Artifact

1. Run `python scripts/document_pipeline.py extract --input <source> --format <format> --output <task-local>/document.yaml` from the capability package directory.
2. Stop on a nonzero exit or a non-null `error` envelope.
3. Run `python scripts/document_pipeline.py analyze --input <task-local>/document.yaml --output <task-local>/analyzed.yaml`.
4. Read the contract in `knowledge/document-yaml-contract.md` before interpreting artifact fields.
5. Build a coverage ledger for every eligible prose segment or paragraph. Resolve every entry as `finding:<IDs>`, `clear`, `unresolved`, or `excluded`; never leave an entry pending.
6. Report the aggregate coverage, not the full ledger unless asked.

## Sentence Profile

Report eligible sentence count and unit label, mean, median, population standard deviation, coefficient of variation, quartiles, minimum, maximum, individual lengths when fewer than five sentences exist, uniform-run locators, parser warnings, and a genre- and language-aware interpretation. Statistics are descriptive; record a uniform-rhythm finding only when close reading also shows a mechanical mechanism.

## Exhaustive Scan

Complete every pass even after finding obvious issues.

### Pass A: information and claims

Test taxonomy patterns 1–6 and 34 for inflated significance, vague notability or attribution, participial pseudo-analysis, promotion, generic challenge/future movement, repetition, and zero-information expansion.

### Pass B: words and syntax

Test patterns 7–13, 23–24, 26–28, 35, 38, and 39. Confirm a mechanism rather than matching watched words alone.

### Pass C: organization and formatting

Test patterns 15–20, 25, 29–30, and 36 against headings, paragraphs, lists, openings, and conclusions.

### Pass D: rhythm and rhetoric

Test patterns 14, 21–22, 31–33, and 37. Combine sentence statistics with local reading.

### Pass E: false-positive and protection challenge

For every provisional finding ask: Is this eligible author prose? Is the mechanism visible? Does genre, discipline, translation, or structure explain it? Would the suggestion risk a fact, qualification, relation, register, stance, or voice feature? Can one cause cover related spans? Discard false positives and move context-dependent cases to unresolved items.

### Pass F: completeness reconciliation

Resolve every coverage entry and search once for unreviewed prose and uniform runs.

## Findings

Assign stable IDs in source order (`PH-001`, `PH-002`, …). One finding per primary mechanism. For each finding record locators, a bounded excerpt, pattern number and name, family, evidence (local, distributional, contextual), explanation, confidence (`high`/`medium`/`low`), severity (`high`/`medium`/`low`), a bounded suggestion, preservation constraints, and risk. Keep confidence and severity separate. Quote each unique passage once and cross-reference overlapping secondary findings. Use `UR-001`, `UR-002`, … for unresolved items with locators, uncertainty reason, and needed context.

## Revision Plan

Assign `RP-001`, `RP-002`, … and group findings only when they share one edit operation or must change together. Each plan item contains linked finding IDs and exact locators, one bounded operation, expected effect, preservation constraints, risk, recommendation (`include`/`optional`/`defer`), and disposition (`include`/`exclude`/`pending`). Use a conservative default. Never add stance, evidence, disagreement, limitations, or surprise absent from the source.

## Outputs

Write the two declared outputs:

1. `humanization_review_report`: a Markdown report containing scope and coverage, overall assessment, sentence-length profile, all supported findings, priorities, unresolved items, and coverage closeout.
2. `humanization_revision_plan`: a JSON-compatible plan object with `summary`, `user_constraints`, and `items`, where every item is bounded and preservation-constrained as above.

The review is read-only. Do not edit the manuscript or create workflow state.

## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
