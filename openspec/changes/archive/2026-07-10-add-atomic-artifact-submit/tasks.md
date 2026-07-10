## 1. Contracts And Transaction Foundations

- [x] 1.1 Add strict Submit input, candidate record, receipt record, registry, and receipt payload schemas while preserving legacy artifact reads.
- [x] 1.2 Add optional read preconditions to the shared WritePlan executor and cover drift-before-staging behavior.
- [x] 1.3 Add `require_receipt` to Slice completion and implement receipt-backed workflow evaluation.

## 2. Artifact Submit Runtime And CLI

- [x] 2.1 Implement `research-artifact` candidate/dependency validation, deterministic IDs, provenance, and projected records.
- [x] 2.2 Implement receipt-first/registry-last atomic planning, dry-run, idempotent retry, orphan recovery, and conflict handling.
- [x] 2.3 Add `submit work:<id>` CLI parsing, confirmation/hash binding, JSON result states, and stable exit-code mapping.
- [x] 2.4 Extend instructions with additive Submit capability metadata and post-submit workflow control.

## 3. Agent Workflow Integration

- [x] 3.1 Add the ninth `researchspec-submit` companion and update manifest/delivery expectations.
- [x] 3.2 Update `researchspec-next` to distinguish semantic production from candidate submission.
- [x] 3.3 Update converter-owned ARSU preflight guidance, regenerate generated output, and preserve converter idempotence.

## 4. Documentation And Verification

- [x] 4.1 Update CLI, contract schema, Skill/command, and ARSU workflow documentation with Submit authority boundaries.
- [x] 4.2 Add focused unit/integration tests for validation, atomicity, receipts, idempotency, conflicts, Gates, instructions, companions, and converter output.
- [x] 4.3 Run TypeScript, lint, test, ARSU validation/idempotence, OpenSpec strict validation, whitespace checks, and an end-to-end Submit smoke flow.
