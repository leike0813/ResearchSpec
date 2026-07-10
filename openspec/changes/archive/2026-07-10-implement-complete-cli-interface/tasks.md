## 1. CLI Foundation

- [x] 1.1 Add the approved runtime dependencies and package metadata.
- [x] 1.2 Define shared command context, result envelope, diagnostics, errors, and exit-code types.
- [x] 1.3 Replace the hand-written parser with the complete Commander command registry and unified presenter.

## 2. Workspace Foundation

- [x] 2.1 Consolidate workspace templates, required paths, file kinds, config, and manifest metadata into one definition registry.
- [x] 2.2 Implement typed workspace discovery, YAML/JSON/JSONL loading, Zod validation, and a reusable workspace snapshot.
- [x] 2.3 Implement shared hash-backed WritePlan preflight/execution and generated-file ownership policy.
- [x] 2.4 Align fresh workspace templates with the documented contract shapes and lifecycle metadata.

## 3. Read Commands

- [x] 3.1 Implement complete status aggregation from workflow, runtime, pending items, gates, artifacts, and tools.
- [x] 3.2 Implement targeted and strict workspace checks for contracts, runtime, artifacts, and tools.
- [x] 3.3 Implement list views and canonical/bare item resolution for show.

## 4. Derived Artifacts And Lifecycle Commands

- [x] 4.1 Implement deterministic handoff rendering and stdout/out/dry-run behavior.
- [x] 4.2 Implement deterministic ZIP context packs with entry/hash manifest and optional registered artifacts.
- [x] 4.3 Implement accept/reject/postpone decision handling, receipts, registry updates, and ledger-last writes.
- [x] 4.4 Implement resolved change/draft-patch archive preflight and dated moves.

## 5. Agent Tool Delivery

- [x] 5.1 Implement the 31-tool registry, detection paths, tool-expression parsing, and selection ordering.
- [x] 5.2 Implement the 28 command-adapter formats plus the three skills-only diagnostics.
- [x] 5.3 Implement recursive four-skill delivery as WritePlan operations, including Codex shared-global rules.
- [x] 5.4 Implement hash-manifest refresh, drift, force, stale-file, and partial-failure behavior.

## 6. Init And Update Experience

- [x] 6.1 Rebuild init around workspace templates, interactive searchable selection, preview, confirmation, and safe reconfiguration.
- [x] 6.2 Implement update for configured or explicit tool subsets without implicit deselection.

## 7. Tests, Documentation, And Validation

- [x] 7.1 Add reusable CLI/workspace fixtures and focused command contract tests.
- [x] 7.2 Add table-driven registry, adapter format/path, detection, delivery, and drift tests.
- [x] 7.3 Align CLI design and related contract documentation with implemented current behavior.
- [x] 7.4 Run strict OpenSpec validation, build, lint, tests, ARSU checks, and idempotence checks.
