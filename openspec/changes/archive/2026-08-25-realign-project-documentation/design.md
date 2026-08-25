## Context

Most existing documents contain useful current-state material, but their names and placement preserve the chronology of prior refactors. Architecture is split across four top-level documents and a runtime folder; user journeys duplicate the product model; vendor maintenance guidance sits beside user-facing docs.

## Decisions

### Organize by reader and maintenance lifetime

`docs/user` explains how to use ResearchSpec. `docs/developer` explains architecture, contracts, CLI, graph behavior, adapters, and extension boundaries. `docs/maintainer` contains release and vendor-maintenance knowledge. Every directory has a short index.

### Keep one canonical user model

`docs/user/usage-model.md` is the product-level authority. It begins with a compact mental model, then follows the actual lifecycle from init through routing, confirmation, execution, Gate/Decision handling, resume, verification, and export. Acceptance rehearsals become archived artifacts rather than a parallel documentation system.

### Consolidate without flattening useful detail

The compact architecture overview absorbs the former architecture, schema, and workflow-contract summaries. Detailed runtime workflow pages and diagrams remain under `docs/developer/runtime/`. Vendor-specific pages move together under `docs/maintainer/vendors/`.

### Artifacts are categorized by status

`artifacts/generated` contains reproducible reports, `artifacts/release` contains current release evidence, and `artifacts/archive` contains superseded proposals, rehearsals, decision logs, and completed review records.

## Verification

Check all local Markdown links, generated handbook drift, package allowlists, website and README references, stale model phrases, strict OpenSpec specs, TypeScript, lint, build, tests, and package verification.
