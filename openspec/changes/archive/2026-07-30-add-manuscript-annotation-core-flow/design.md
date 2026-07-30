## Context

ResearchSpec already has deterministic artifact registration, versioned Draft
Patches, receipt-first transactions, adaptive and strict workflow control, and
formal Gate evidence. Human manuscript annotations are currently external to
those contracts. The implementation must connect review comments to a specific
registered Markdown draft, preserve exact target identity, trace each comment
through revision, and make mechanical coverage verifiable without granting
scripts semantic review authority.

The fixed public surface remains seventeen top-level commands, four ARSU
Skills, four Companion Skills, and seven Zotero Adapter Skills. ResearchSpec CLI
remains the only workflow-state authority. Generated ARSU files remain
converter-owned.

## Goals / Non-Goals

**Goals:**

- Freeze deterministic Annotation Sets against registered Markdown drafts.
- Reuse the established selector, descriptor, receipt-first, registry, retry,
  recovery, and fail-closed transaction patterns.
- Make Draft Patch v3 the unique annotation-to-operation mapping source while
  preserving older patches for read-only inspection.
- Derive immutable Resolution Reports only from successful patch application.
- Reuse one annotation coverage validator in Gate submission and artifact
  checks.
- Support adaptive standalone work and a strict annotated-revision mid-entry
  without adding workflow stages or hidden authority.

**Non-Goals:**

- Parse free-form Markdown comments or CriticMarkup.
- Support non-Markdown manuscripts, editor extensions, model execution, generic
  file import, or a new public command.
- Decide whether a response is academically sufficient or whether a human is
  satisfied.
- Turn ordinary annotation resolution into a Decision-ledger event.

## Decisions

### Use a frozen Annotation Set beside a fixed producer candidate

Instructions expose
`runs/current/annotation-sessions/<id>/candidate.json`. Submission validates it
and create-only writes `runs/current/annotation-sets/<id>.json`, then
`runs/current/receipts/annotation-submit/<id>.json`, then refreshes the artifact
registry. The frozen set is the stable evidence object; the candidate remains
producer-owned input.

This follows existing receipt-first recovery patterns and avoids treating chat
or mutable review files as authority. A generic import command was rejected
because annotation registration has domain-specific validation and
confirmation semantics.

### Bind annotations to registered draft bytes and shared Markdown blocks

The base artifact must be a registered `paper_draft`, `verified_draft`, or
`revised_draft` Markdown file whose current hash matches the registry. Targets
form a discriminated union: document, section, block, or quote. Block and quote
targets bind a stable block ID and full block SHA-256. Quote targets also carry
the exact quote plus prefix and suffix, and the quote must occur exactly once
inside the target block.

The Markdown block parser moves from patch lifecycle code into one shared
module. Keeping two parsers was rejected because block identity would drift
between registration and patch application.

### Make submission human-confirmed but not plan-bound

`annotation:<safe-id>` uses action schema
`researchspec://actions/submit-annotation/v1` and execution policy
`human_confirmed`. Non-interactive execution requires descriptor action basis,
`--confirmed-by`, and `--yes`; it does not require a plan hash. The transaction
still revalidates all read preconditions immediately before writes.

Plan-bound execution was rejected because registration confirms a bounded,
already-materialized review record and does not itself accept a research
Decision or formal Gate.

### Put the unique mapping in Draft Patch v3

Each v3 operation has an `operation_id` and zero or more
`{annotation_set_id, annotation_id}` references. Optional
`annotation_resolution.entries` covers every annotation in every referenced
set exactly once. Supported dispositions are `implemented`,
`answered_without_text_change`, `deferred`, `rejected`, `unresolved`, and
`superseded`, with disposition-specific evidence requirements.

Mapping is not duplicated in Annotation Sets or Resolution Reports. Reports
derive operation links from the accepted patch. Draft Patch v2 and legacy
formats remain read-only normalization inputs so existing workspaces stay
inspectable.

### Derive Resolution Reports only after successful apply

Patch Advance validates the accepted, fresh patch, writes the revised draft and
apply report, derives an immutable `annotation_resolution_report`, registers it,
and stores only its reference in the apply report. Stale or rejected patches
produce no report. The report records hashes, references, dispositions,
operation links, mechanical counts, and unresolved count; it does not claim
semantic adequacy.

### Reuse one coverage verifier at Gate and check boundaries

The `revision_completeness` Gate transaction resolves the apply report, patch,
Annotation Sets, Resolution Report, registry records, and current files, then
validates hashes, mappings, dispositions, and
`unresolved_count === 0`. Incomplete evidence may still be submitted with a
`fail` verdict. `check artifacts` calls the same verifier and reports drift or
forgery without mutating authority.

### Extend routes without extending workflow authority

Routing treats `annotation_set` as review feedback for revision-coach,
revision, re-review, and pipeline mid-entry. Strict mode adds
`enter-annotated-revision`, which starts the existing revision round with a
registered draft and Annotation Set. Adaptive mode binds the chosen Annotation
Set in the ordinary start receipt and continues through obligations and
completion. Resolution Reports may supplement re-review evidence, while full
peer review remains independent.

## Risks / Trade-offs

- **Markdown edits can invalidate block targets** → Registration binds complete
  draft and block hashes and fails closed on drift.
- **Receipt-first writes can be interrupted** → Exact orphan frozen-set or
  receipt states are recoverable; divergent content conflicts.
- **Resolution entries can overstate completion** → Mechanical validation
  checks structural coverage only, while Verify, reviewers, and Gate humans
  retain semantic judgment.
- **Format migration can invalidate old workspaces** → Older Draft Patch formats
  remain read-only normalization inputs; only newly submitted patches use v3.
- **Generated guidance can drift** → Converter sources are edited and normal
  ARSU check/idempotence verification regenerates and compares outputs.

## Migration Plan

1. Add and sync the OpenSpec contracts and runtime documentation.
2. Add Annotation Set contracts, layout, selectors, lifecycle transaction, and
   artifact checks.
3. Upgrade Draft Patch write validation to v3 while retaining legacy readers.
4. Add Resolution Report derivation and shared Gate coverage verification.
5. Update ARSU catalogs, Companion sources, converter anchors, and regenerate
   artifacts.
6. Validate fresh packaged adaptive, strict, mid-entry, pipeline, retry, stale,
   and recovery journeys.

Rollback is code removal plus converter regeneration. Existing workspaces remain
readable because no current contract file is rewritten during installation and
older patches retain read-only normalization.

## Open Questions

None. The change intentionally accepts only normalized JSON annotation
candidates; free-form annotation ingestion remains a separate future change.
