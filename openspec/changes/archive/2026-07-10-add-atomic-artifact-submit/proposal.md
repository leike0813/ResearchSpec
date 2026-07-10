## Why

ResearchSpec can now tell an Agent which work item is ready and where to write its candidate artifact, but no public runtime can safely register that candidate or make the workflow frontier advance. A receipt-backed, hash-bound submit transaction is required before ARSU Skills can complete the status → instructions → candidate → next-item loop without hand-editing runtime records.

## What Changes

- Add a high-level `submit work:<id>` command with dry-run, explicit hash binding, provenance input, confirmation, stable errors, and idempotent retry.
- Validate a workflow-owned candidate through a deterministic validation profile, then atomically create a submission receipt and register both candidate and receipt artifacts.
- Require receipt-backed evidence before a submitted artifact can complete a configured workflow node.
- Add read preconditions to the shared write-plan executor so candidate and dependency drift cannot race a commit.
- Add a ninth `researchspec-submit` companion and route candidate handoff through it from Next and converter-owned ARSU preflight guidance.
- Keep state transitions, Gate/Decision writes, semantic acceptance, artifact supersession, and full ARSU pipeline expansion out of scope.

## Capabilities

### New Capabilities

- `artifact-submit`: Workflow-owned candidate validation, receipt-backed registration, idempotency, conflict handling, and atomic write semantics.

### Modified Capabilities

- `framework-core`: Require trustworthy submission receipts for configured work-item completion and add read-side write preconditions.
- `cli-interface`: Add the public `submit` command and submit capability metadata in instructions.
- `companion-skills`: Add `researchspec-submit` and make Next route unregistered candidates to it.
- `arsu-converter`: Replace the nonexistent runtime-helper handoff with capability-aware Submit guidance in converter-owned preflight content.

## Impact

- Affects workflow/artifact contracts, write planning, runtime evaluation, CLI handlers, companion projection, ARSU conversion output, documentation, and tests.
- Adds one public command and one companion intent without changing JSON envelope version `1`.
- Writes only `runs/current/receipts/artifact-submit/*` and `artifact-registry.json`; candidate files, state, stable specs, and ledgers remain unchanged.
- Adds no external dependency or runtime LLM integration.
