## Why

Post-refactor acceptance exposed gaps where adaptive runtime authority, recovery, and user-visible contracts still disagree. Closing them together is necessary because partial fixes would preserve competing execution rules, incomplete receipts, and brittle tests that obscure the actual product contract.

## What Changes

- Make `execution_policy` the single source for plan-bound execution requirements and enforce one shared interactive/non-interactive guard for Gate, Decision, and patch application.
- Resolve adaptive Gate authority consistently across instructions, evidence, reverification, override, readiness, completion, and status.
- Introduce receipt schema v2 with enough action identity, semantic input, preconditions, and authority target data for exact idempotent retry and two-way Doctor reconciliation.
- Preserve receipt v1 readability while reporting cases that require human reconstruction instead of guessing or migrating semantics.
- Correct contextual help parsing when global option values resemble commands and replace Unix-only package build permission handling with a Node file API.
- Reconcile canonical specs with the current bounded status, compact result, adaptive-default, strict-compatibility, and fixed public-surface contracts.
- Remove brittle prose/order/source-scanning tests and retain behavior, schema, hash, drift, idempotence, licensing, safety, and public-interface coverage.
- Refresh canonical usage, runtime, CLI, ARSU/Companion guidance, generated Skills, manifests, reports, and handbook.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `cli-interface`: Plan-bound descriptors, contextual help parsing, compact output, and fixed command-surface requirements change.
- `case-obligation-control-plane`: Waiver/not-applicable readiness and typed Decision evidence requirements change.
- `gate-transition-control-plane`: Gate outcome, reverification, override, and completion authority rules change.
- `runtime-recovery`: Receipt v2, exact retry, reconciliation, and legacy diagnostic requirements change.
- `framework-core`: Adaptive-default and strict-compatibility runtime contracts become canonical.
- `arsu-run-usage`: User-visible adaptive runtime protocol and bounded status guidance change.
- `arsu-user-model-acceptance`: Current user-model acceptance requirements absorb the remaining valid behavioral scenarios.
- `artifact-submit`: Plan-bound submission and receipt recovery requirements change.
- `subflow-instance-control-plane`: Start/completion recovery and authority binding requirements change.
- `arsu-converter`: Generated guidance and portable build verification requirements change.
- `companion-skills`: Companion guidance for preview, confirmation, Gate evidence, and recovery changes.
- `mvp-release-readiness`: Release checks retain stable product/safety contracts while dropping brittle prose scanning.

## Impact

The change affects adaptive runtime DTOs, transition services, CLI parsing and rendering, Doctor/recovery logic, schemas, package scripts, existing tests, canonical OpenSpec requirements, project guidance, generated ARSU/Companion artifacts, and release verification. It adds no public command, dependency, runtime LLM integration, or automatic receipt migration, and it preserves the fixed Skill/wrapper/tool counts, Zotero admission, and strict runtime behavior.
