## 1. Execution authority

- [x] 1.1 Replace ActionDescriptor v2 `dry_run` with policy-derived `execution_requirements` and update schemas/rendering.
- [x] 1.2 Add one shared plan-bound execution guard and route Gate, Decision, and patch application through it.
- [x] 1.3 Add table-driven interactive and non-interactive authorization tests, including rejection with no writes.

## 2. Adaptive Gate authority

- [x] 2.1 Add a shared Gate authority resolver for latest trusted events, passing verdicts, reverification, override freshness, and Decision evidence.
- [x] 2.2 Route adaptive instructions, availability, Gate submission, status, and completion through the resolver.
- [x] 2.3 Implement failed-reverification Gate override case actions and invalidate stale overrides after a new Gate event.
- [x] 2.4 Cover pass-with-conditions, stale/cross-Gate references, override outcomes, waiver/not-applicable evidence, Verify, and completion.

## 3. Adaptive recovery

- [x] 3.1 Add receipt schema v2 while retaining read-only receipt v1 compatibility.
- [x] 3.2 Record normalized semantic input, complete preconditions, action identity, and authority targets for adaptive writes.
- [x] 3.3 Implement exact idempotent retry across start, evidence, resolution, Gate, and completion interruption phases.
- [x] 3.4 Add shared bidirectional integrity checks to Doctor/static check and classify unreconstructable v1 receipts.
- [x] 3.5 Add fault-injection recovery tests for partial phases, conflicts, stale basis, duplicate prevention, and v1 diagnostics.

## 4. CLI and canonical contracts

- [x] 4.1 Make contextual help skip option values and select the longest catalog command path; add focused tests.
- [x] 4.2 Replace Unix build permission handling with the Node file API.
- [x] 4.3 Reconcile main OpenSpec requirements around bounded status, compact results, runtime defaults, strict compatibility, fixed surfaces, and behavioral acceptance.

## 5. Test and documentation cleanup

- [x] 5.1 Remove traceability fixtures/docs and merge durable acceptance principles into project `AGENTS.md`.
- [x] 5.2 Remove prose/order/source-layout assertions while retaining structured package, schema, hash, license, safety, drift, idempotence, and public-interface checks.
- [x] 5.3 Update canonical usage/runtime/CLI and ARSU/Companion guidance, then regenerate converter-owned Skills, manifests, reports, and handbook.

## 6. Verification

- [x] 6.1 Run OpenSpec strict validation, typecheck, lint, focused and full tests, build, handbook, release, ARSU/Zotero checks and idempotence, and `git diff --check`.
- [x] 6.2 Resolve validation failures and record any unavoidable limitation or remaining risk.
