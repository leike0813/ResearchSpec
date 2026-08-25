### ResearchSpec Current Owner

Replacement scope: `DECISION-001` for `academic-paper`.

- Answer `strict` → record `strict` in the PCR `Citation Verification` row and
  return the scholar's confirmed policy choice to the ResearchSpec decision
  runtime for `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`. The runtime
  validates that `strict` is a supported option in
  `researchspec/profiles/academic-pipeline.yaml` and exposes the accepted decision to the
  finalizer. This step selects policy; it never evaluates citations.
- Answer `mark only`, or no answer → record `advisory (mark only, default)` in
  the PCR row. Do not invent a decision-owning control record entry for silence; the workflow
  default remains advisory. No external input policy mutation is required in
  either branch.

Current ResearchSpec owners:

- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
