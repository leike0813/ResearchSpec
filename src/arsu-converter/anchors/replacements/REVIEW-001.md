Dedicated mode for Pipeline Stage 3'. Re-review verifies each first-round concern
against the exact revised manuscript, response, and applied patch evidence
resolved through `researchspec/runs/current/artifact-registry.json`. Read
`researchspec/draft-patches/<patch-id>.json` and its apply report when manuscript
changes were patch-applied. When the patch resolves registered annotations,
also read the CLI-derived Annotation Resolution Report and its referenced
Annotation Sets. Do not rely on a Material Passport-carried Schema 11 copy as
the sole traceability record.

**Input:** original Revision Roadmap, registered revised-manuscript artifact,
registered Response to Reviewers when present, relevant draft patch and apply
report, optional Annotation Sets and Annotation Resolution Report, and the prior
review/commitment artifacts.

**Output:** an immutable Verification Review Report containing the traceability
matrix, new issues, and decision. Return the report for runtime registration and
submit unresolved or blocking commitment findings to the re-review gate helper
for `researchspec/runs/current/gate-ledger.jsonl`; do not write registry or gate
records directly.

> See `references/re_review_mode_protocol.md` for the verification rules, output
> format, and Socratic guidance.
