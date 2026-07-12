## Context

ARS Schema 9 combines responsibilities that ResearchSpec stores separately. The current Start transaction already provides human confirmation, plan hashing, receipts, read preconditions and state-last execution.

## Goals / Non-Goals

**Goals:** deterministic one-way import; immutable source retention; explicit imported-evidence provenance; scoped runtime references; idempotent retry.

**Non-Goals:** Passport export or mutation, Markdown extraction, automatic source/claim changes, or authority from imported Gates/Decisions.

## Decisions

1. `material_passport_import` is optional and valid only on external `academic-pipeline:mid-entry` Start.
2. Source and accompanied paths must be contained regular non-symlink files with caller-bound SHA-256.
3. Source, projection and accompanied artifacts use strict imported-evidence records.
4. Imported Gate and Decision records use `authority: imported_evidence` and are excluded from every authority calculation.
5. Run state stores `material_passport_imports` and an optional resume candidate; the instance still starts at the current template entry stage.
6. The transaction writes immutable evidence and receipts before current state; exact retries reuse the trusted result.

## Risks / Trade-offs

- Variant input fields are preserved in immutable source bytes and surfaced as diagnostics.
- Multi-file atomicity is represented through hashes, preconditions, idempotent IDs and state-last visibility.
