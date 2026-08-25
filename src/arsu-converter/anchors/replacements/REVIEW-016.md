### ResearchSpec Current Owner: Deterministic Panel Check

The sprint contract and panel synthesis remain machine-checked working
artifacts. Before starting a contract-backed panel, confirm that the local host
provides Python 3.11 or newer and `jsonschema>=4.17`. These are user-managed
prerequisites: do not install, upgrade, or fetch them. If either prerequisite is
missing, pause the panel flow and report the missing prerequisite. Agent judgment
cannot replace the deterministic checks.

1. Validate the sprint contract with
   `scripts/check_sprint_contract.py <contract.json>`.
2. After all reviewer reports and the synthesis exist, run
   `scripts/check_panel_synthesis.py --contract <contract.json> --report
   <r1.md> ... --report <rN.md> --synthesis <synthesis.md>`.
3. Treat a nonzero exit as a failed candidate check and follow the bounded retry
   or abort behavior reported by the checker. Never rewrite a checker verdict or
   accept a malformed candidate by inspection.
4. Record accepted review and synthesis files as boundary outputs in
   `researchspec/runs/<run-id>/handoff.md`. A passing checker establishes
   only mechanical self-consistency. It does not confirm a formal ResearchSpec
   Gate; Verify prepares that judgment and only a human-confirmed Decide action
   records it in `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`.

The packaged checker closure is exactly:

- `scripts/check_sprint_contract.py`
- `scripts/check_panel_synthesis.py`
- `assets/shared/sprint_contract.schema.json`
