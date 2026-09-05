### ResearchSpec Current Owner

Replacement scope: `REVIEW-002` for `academic-paper-reviewer`.

- **Reviewer v2 sprint contract.** Resolve the mode-specific frozen contract JSON through
   `researchspec/runs/<run-id>/handoff.md`, then deep-copy it for permitted
   invocation fields. Preserve `panel_size`, `acceptance_dimensions`, each
   dimension's `eligible_roles` and `owner_role`, fatal versus repairable
   blocks, severity and cross-reviewer quantifiers, measurement procedure,
   override ladder, and bounded amendments. Bind full and methodology contracts
   to their v2 identifiers; do not infer a role score for an ineligible
   dimension. Return the instantiated contract and each phase output to the
   producing node for handoff recording; send lint, panel-cardinality,
   and conformance results to the review Gate helper for
   `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`. The following synthesizer
   protocol and mode-specific panel sizes remain contract-defined.

Current ResearchSpec owners:

- `researchspec/runs/<run-id>/handoff.md`
- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
