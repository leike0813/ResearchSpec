# Tasks

## 1. Freeze campaign contracts

- [x] 1.1 Save hash-verified original catalog copies for the two awaiting-review campaigns; verify each copy hashes to its campaign `catalog_hash` without changing attempt evidence.
- [x] 1.2 Persist a catalog copy for new campaigns and load it for assessment, review, report and HTML scenario data; verify a completed campaign remains reviewable after the live catalog changes and a damaged copy is rejected.

## 2. Repair scenario setup

- [x] 2.1 Stage a real zero-result first Procedure query from scenario metadata, record its result for the Agent and assessor, and stop before host invocation if it ceases to miss; verify locally against the current catalog.
- [x] 2.2 Replace the two-capability case with revision-roadmap parsing followed by pre-submission self-check, and check current packet roles plus fixture files before the host call; verify the declared path link and fixture inputs locally.
- [x] 2.3 Update the two scenarios' prompts, assertions and playbook guidance so no-query behavior is a failure after valid setup and unresolved author choices remain explicit; verify catalog and playbook tests.
- [x] 2.4 Seed a matching confirmed project intent and exact-run note for run precedence, plan entry node outputs in the root handoff, and preflight the relationship before host invocation; preserve the standalone note fixture.

## 3. Validate the change

- [x] 3.1 Run focused harness and playbook tests, `openspec validate --strict`, and reopen both historical campaign reports; verify old prompts/assertions remain available and no existing source edits were overwritten.
- [x] 3.2 Validate the new run-precedence fixture locally, then run two independent Codex `gpt-6-sol` attempts with `gpt-6-sol` assessment and inspect the evidence-bound reports without rewriting historical attempts.
