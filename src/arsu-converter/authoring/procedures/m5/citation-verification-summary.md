# Procedure

Generate the report with `validators/citation-verification-summary.py` using the executable report contract below.

Supply the structured citation verification report, including per-resolver observations.

1. Aggregate citation verification outcomes without collapsing resolver details.
2. Produce counts by verdict and source, including the distinction between
   `true`, identifier-backed `false`, and coverage-safe `unresolvable`.
3. Report each resolver outcome, degradation and retry status, and any supplied
   bibliographic integrity/retraction signal as a separate advisory surface.
4. Preserve the current policy-independent summary; terminal policy is selected
   and evaluated by the ResearchSpec owning workflow, not this checker.
5. Return a machine-readable summary.

## Output Format

Structured verifier findings from the script.
