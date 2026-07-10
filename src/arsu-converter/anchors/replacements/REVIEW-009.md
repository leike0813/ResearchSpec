A reviewer sprint contract is a frozen, machine-checkable acceptance baseline.
Resolve the selected template through
`researchspec/runs/current/artifact-registry.json`, deep-copy it for permitted
runtime fields, and register the instantiated contract before reviewer calls.
The protocol prevents post-hoc standard rationalization by physically separating
paper-blind Phase 1 from paper-visible Phase 2.

For every reviewer required by `panel_size`:

1. **Prepare the contract.** Preserve baseline acceptance dimensions, failure
   conditions, measurement procedure, override ladder, mode, stage, contract id,
   baseline version, and panel size. Add only allowed runtime fields such as
   `generated_at` and bounded agent amendments. Validate deterministically; on
   failure, stop before dispatch and submit the finding to the review gate helper.
2. **Run Phase 1 paper-blind.** Provide only the registered contract and paper
   metadata. Require the role-specific contract paraphrase, scoring plan, and
   terminal acknowledgement.
3. **Lint and register Phase 1.** Apply the existing structural and content-blind
   checks. Retry once with the specific lint gap; a second failure aborts that
   reviewer. Register the accepted Phase 1 output before Phase 2.
4. **Run Phase 2 paper-visible.** Re-inject the same contract, the exact registered
   Phase 1 output inside the read-only data delimiter, and the manuscript.
5. **Lint and register Phase 2.** Require the declared scores, failure-condition
   checks, review body, and decision; retain the dissent limits and retry policy.
6. **Enforce panel cardinality.** If usable Phase 2 outputs do not equal
   `panel_size`, emit `[PANEL-SHRUNK]`, submit a blocking review-gate finding,
   and abort the round rather than synthesizing a smaller panel.
7. Pass only the complete registered Phase 2 panel to the editorial synthesizer.

The orchestrator returns contract and phase artifacts to the runtime registration
helper and gate findings to
`researchspec/runs/current/gate-ledger.jsonl`; it does not edit either file.
