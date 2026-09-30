# Tasks

## 1. Source and extraction

- [x] 1.1 Pin v3.22.2 and document the changed source inventory; verify clean submodule identity and old-to-new diff.
- [x] 1.2 Refresh affected extraction and add language-pair knowledge; verify extraction:index:check and unchanged-artifact bytes.

## 2. Semantic conversion

- [x] 2.1 Adapt affected procedures and shared data boundary; verify per-capability semantic evidence and generation parity.
- [x] 2.2 Update runtime policy, anchors and maintenance instructions; verify anchor/runtime-policy checks and OpenSpec strict validation.
- [x] 2.3 Regenerate packages twice; verify identical hashes and ARSU check/idempotence.

## 3. Integration and audit

- [x] 3.1 Run typecheck, lint, full tests and real checker verification; record actual outcomes.
- [x] 3.2 Review all changed modes and generated HTML, record semantic decisions, then freeze the new anchor; verify maintenance check and archive the old-to-new audit diff.
