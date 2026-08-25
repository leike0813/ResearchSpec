### ResearchSpec Current Owner

Replacement scope: `REVIEW-008` for `academic-paper-reviewer`.

### Commitment verification against revision evidence

Run this step for every commitment-bearing concern. Resolve the original review,
roadmap, current revised manuscript, response, and any optional patch or
annotation evidence from explicit inputs and the producer's `handoff.md`. An
ARSU patch must conform to
`assets/shared/contracts/patch/revision_patch.schema.json`, but schema validity
or a successful mechanical application is not proof of academic fulfillment.

For each commitment, assign one `fulfillment_status`:

- `fulfilled` — the required evidence exists and substantively satisfies it;
- `partial` — evidence exists but only partly satisfies it;
- `not-fulfilled` — required evidence is absent;
- `explicitly-rejected-with-rationale` — the author declined it with reasons.

For a non-fulfilled status, preserve the corresponding rationale. Verify prose,
citations, figures, tables, methods, and acknowledgments against their actual
boundary files rather than a framework-managed apply or resolution report. Return
the verification report through this run's `handoff.md`; a human records
the formal Gate verdict in the owning node state.

Current ResearchSpec owners:

- `assets/shared/contracts/patch/revision_patch.schema.json`
- `researchspec/runs/<run-id>/handoff.md`
- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
