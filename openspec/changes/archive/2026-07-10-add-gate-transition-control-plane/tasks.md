## 1. Contracts And Frontier

- [x] 1.1 Add strict additive Schema 0.2 Gate, transition, receipt-reference and scoped-selector contracts with legacy reads.
- [x] 1.2 Extend snapshot validation and workflow checks for Gate/transition graphs, trusted attempts and receipts.
- [x] 1.3 Compute per-instance Gate, ambiguous branch and eligible transition frontier plus executable instructions.

## 2. Runtime Transactions

- [x] 2.1 Implement receipt-backed confirmed Gate dry-run/commit/idempotency/reverification transaction.
- [x] 2.2 Tighten failed-Gate override and add workflow-branch Decision selection.
- [x] 2.3 Implement receipt-backed unique transition dry-run/commit/idempotency with stage and terminal effects.

## 3. CLI And Representative Profile

- [x] 3.1 Dispatch `submit work:` and `submit gate:` through one public command and add `advance transition:` with stable JSON and exit classes.
- [x] 3.2 Add a representative research-completion Gate and terminal transition to the opt-in research Slice.

## 4. Agent Projection And Documentation

- [x] 4.1 Update Verify, Decide and Next guidance for confirmation, challenge/reverify, override, branch choice and unique advancement.
- [x] 4.2 Upgrade converter-owned ARSU preflight, regenerate generated outputs and preserve converter validation/idempotence.
- [x] 4.3 Update canonical/current-state design docs and mark umbrella task 4.1 complete.

## 5. Verification

- [x] 5.1 Add focused Gate/transition contract, transaction, branch, compatibility and CLI regression tests.
- [x] 5.2 Run test, lint, converter checks and strict OpenSpec validation for both changes.
