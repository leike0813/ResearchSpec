- Answer `strict` → record `strict` in the PCR `Citation Verification` row and
  return the scholar's confirmed policy choice to the ResearchSpec decision
  runtime for `researchspec/runs/current/decision-ledger.jsonl`. The runtime
  validates that `strict` is a supported option in
  `researchspec/specs/workflow.yaml` and exposes the accepted decision to the
  finalizer. This step selects policy; it never evaluates citations.
- Answer `mark only`, or no answer → record `advisory (mark only, default)` in
  the PCR row. Do not invent a decision-ledger entry for silence; the workflow
  default remains advisory. No Material Passport policy mutation is required in
  either branch.
