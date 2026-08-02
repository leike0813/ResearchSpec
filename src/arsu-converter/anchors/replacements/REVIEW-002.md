### ResearchSpec Current Owner

Replacement scope: `REVIEW-002` for `academic-paper-reviewer`.

- **Sprint contract.** Resolve the mode-specific frozen contract JSON through
  `researchspec/subflows/<instance>/handoff.md`, then deep-copy it for permitted
  invocation fields. Preserve `panel_size`, `acceptance_dimensions`, severity
  and cross-reviewer quantifiers, measurement procedure, override ladder, and
  bounded amendments. Return the instantiated contract and each phase output to
  the producing subflow for handoff recording; send lint, panel-cardinality,
  and failure-condition results to the review Gate helper for
  `researchspec/subflows/<instance>/control.yaml`. The following synthesizer
  protocol and mode-specific panel sizes remain unchanged.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
