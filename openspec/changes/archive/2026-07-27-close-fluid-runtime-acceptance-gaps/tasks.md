## 1. Action Contract V2

- [x] 1.1 Split every Agent-callable input into strict semantic and typed
  CLI-derived schemas while retaining one composed internal canonical DTO.
- [x] 1.2 Replace action-registry field lists and execution booleans with
  schema-derived metadata and `direct | human_confirmed | plan_bound`.
- [x] 1.3 Generate descriptor v2 templates and schema references from the
  semantic validators and reject caller-authored mechanical fields.

## 2. Risk-Tiered Transactions

- [x] 2.1 Resolve semantic Start inputs for adaptive and strict workspaces;
  execute external starts with named confirmation and delegated starts directly.
- [x] 2.2 Resolve automatic/manual artifact and adaptive-obligation inputs;
  execute direct or human-confirmed transactions without mandatory plan replay.
- [x] 2.3 Execute unique non-semantic transitions directly while retaining
  plan-bound Gate, Decision, patch/change apply and privileged transactions.
- [x] 2.4 Update generated instructions and compact transaction results to
  advertise and follow the v2 execution policy.

## 3. Status And Recovery

- [x] 3.1 Add a bounded status Adapter-health summary derived from the existing
  static literature-Adapter inspection SSOT.
- [x] 3.2 Commit Doctor backup, repair receipt and authority in evidence-first
  order and reconcile interrupted repair receipts idempotently.

## 4. Acceptance And Documentation

- [x] 4.1 Add descriptor round-trip and risk-tier black-box tests for adaptive
  and strict workspaces, including v1 mechanical-field rejection and stale
  preconditions.
- [x] 4.2 Add bounded Adapter status and interrupted Doctor repair tests.
- [x] 4.3 Add ARSU/Zotero routing and source-policy/consent journeys and complete
  capability traceability.
- [x] 4.4 Fix strict OpenSpec purpose validation and archive the historical
  runtime development guide with current canonical links.

## 5. Convergence Verification

- [x] 5.1 Regenerate/check affected ARSU and Adapter outputs and verify
  idempotence without overwriting user-owned drift.
- [x] 5.2 Run typecheck, lint, full tests, build, package verification, all
  required converter checks and strict OpenSpec validation.
