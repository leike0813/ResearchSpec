### ResearchSpec Current Owner: Deterministic Panel Check

The sprint contract and panel synthesis remain machine-checked working
artifacts. Before starting a contract-backed panel, confirm that the local host
provides Python 3.11 or newer and `jsonschema>=4.17`. These are user-managed
prerequisites: do not install, upgrade, or fetch them. If either prerequisite is
missing, pause the panel flow and report the missing prerequisite. Agent judgment
cannot replace the deterministic checks.

1. Validate the role-scoped v2 sprint contract with
   `scripts/check_sprint_contract.py <contract.json>`.
2. Before synthesis, run role and phase conformance with
   `scripts/check_phase_conformance.py --contract <contract.json> --role
   <dispatch-role> --phase1 <phase1.md> --phase2 <phase2.md> --manuscript
   <paper> --metadata <metadata.json>`.
3. After all reviewer reports and the synthesis exist, run
   `scripts/check_panel_synthesis.py --contract <contract.json> --report
   <r1.md> ... --report <rN.md> --synthesis <synthesis.md>`. For a
   `reviewer_full` panel, build and replay-validate the provenance artifact
   with `scripts/review_panel_provenance.py` before synthesis; bind it to the
   `reviewer/reviewer_full/v2` contract and the exact five-seat roster.
4. Treat a nonzero exit as a failed candidate check and follow the bounded retry
   or abort behavior reported by the checker. Never rewrite a checker verdict or
   accept a malformed candidate by inspection. Role eligibility, fatal versus
   repairable blocks, and the closed decision enum remain contract data; a
   passing checker does not decide a ResearchSpec Gate.
5. Record accepted review and synthesis files as boundary outputs in
   `researchspec/runs/<run-id>/handoff.md`. A passing checker establishes
   only mechanical self-consistency. It does not confirm a formal ResearchSpec
   Gate; Verify prepares that judgment and only a human-confirmed Decide action
   records it in `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`.

The packaged checker closure is exactly:

- `scripts/check_sprint_contract.py`
- `scripts/check_phase_conformance.py`
- `scripts/check_panel_synthesis.py`
- `scripts/recompute_receipts.py`
- `scripts/review_panel_provenance.py`
- `assets/shared/sprint_contract.schema.json`
- `assets/shared/contracts/reviewer/full.json`
- `assets/shared/contracts/reviewer/methodology_focus.json`
- `assets/shared/contracts/reviewer/review_panel_provenance_input.schema.json`
- `assets/shared/contracts/reviewer/review_panel_provenance.schema.json`
- `assets/shared/contracts/reviewer/review_panel_provenance_carrier.schema.json`
