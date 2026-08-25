### ResearchSpec Current Owner

Replacement scope: `GATE-001` for `academic-pipeline`.

Per audit run, emit one immutable claim-audit artifact containing all six
aggregates listed below plus the pass-through claim-intent inputs and any Stage 6
self-reflection appendix. Record the artifact's role, safe path, purpose,
producer, intended consumer, and sampling limits in the owning run handoff at
`researchspec/runs/<run-id>/handoff.md`. Return HIGH-WARN constraint
violations and other configured blockers to the claim-integrity gate helper for
`researchspec/runs/<run-id>/nodes/<node-instance>.yaml`; keep LOW/MED warnings as findings
without silently promoting them. The audit agent does not mutate claim
contracts, the owning handoff, or the owning-control Gate attempts.

Current ResearchSpec owners:

- `researchspec/runs/<run-id>/handoff.md`
- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
