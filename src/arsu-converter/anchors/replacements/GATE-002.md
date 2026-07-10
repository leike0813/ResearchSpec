1. **Resolve the policy.** Read supported submission-package policy values from
   `researchspec/specs/workflow.yaml`. Use the latest human-confirmed choice for
   this run from `researchspec/runs/current/decision-ledger.jsonl`; absence
   resolves to `advisory`. Always pass the resolved value explicitly to the
   deterministic verifier. The orchestrator selects policy but never
   re-evaluates package findings itself.
2. **Resolve and verify the package inputs.** Resolve the formatted manuscript,
   figures, tables, supplementary material, venue profile, provenance inputs,
   and prior verifier reports by artifact id and hash through
   `researchspec/runs/current/artifact-registry.json`. Run the local package
   verifier with the resolved policy and exact input set so its package and
   inputs fingerprints are reproducible. Return the new report for registration.
3. **Gate on structured verifier tokens, never on exit code alone.** Under
   `strict`, `TERMINAL-BLOCK policy=submission_package` starts a formatter repair
   loop bounded to two rounds; after the second failure, stop and surface the
   findings. `VERIFICATION-INCOMPLETE` also blocks, but missing policy inputs or
   parsers are not formatter-fixable: ask the scholar to provide the missing
   input or choose advisory policy. Return every pass, warning, incomplete, and
   blocking outcome to the submission-package gate helper for
   `researchspec/runs/current/gate-ledger.jsonl`.
4. **Preserve the advisory path.** After a report is registered, dispatch the
   formatter once in append-only mode to copy package advisories into
   `provenance_summary.md`. This may add the report and advisories section but
   must not change manuscript bytes or reference markers. Register the updated
   provenance summary as a new artifact version.
5. **Require freshness before reuse.** A resume, re-entry, or later finalization
   pass may reuse a report only after the verifier confirms the current package,
   input-set, and policy fingerprints. Stale, unreadable, null-policy, or
   mismatched reports are re-run; a fresh report still re-emits and re-evaluates
   its verdict. Never infer pass merely from freshness.
6. **Recompute every pass.** The gate result is a function of current registered
   package bytes, current resolved inputs, and the current accepted policy.
   Package edits or policy changes invalidate prior permission. Do not cache a
   previously granted delivery result across resume or finalization.

The orchestrator returns artifacts, human choices, and gate findings to their
responsible runtime helpers; it does not edit the registry, decision ledger, or
gate ledger directly.
