### Commitment Verification Against Registered Revision Evidence

Run this step for every commitment-bearing concern, regardless of priority.
Resolve the original review and roadmap, the registered revised manuscript and
response artifacts, the relevant
`researchspec/draft-patches/<patch-id>.json`, and its apply report through
`researchspec/runs/current/artifact-registry.json`. Verify the evidence itself;
do not accept an author's claim or an imported Schema 11 status as proof.

For each commitment, assign one `fulfillment_status`:

- `fulfilled` — the required evidence exists and substantively satisfies the
  commitment. Verify `new_section`, `new_figure`, `new_table`, `new_citation`,
  `methods_paragraph`, `discussion_paragraph`, and `prose_edit` against the
  revised manuscript and patch/apply evidence at the stated location. Verify an
  `acknowledgment_only` commitment against the registered Response to Reviewers,
  because no manuscript diff is expected.
- `partial` — evidence exists but only partly satisfies the commitment.
- `not-fulfilled` — the required evidence is absent.
- `explicitly-rejected-with-rationale` — the author explicitly declined the
  commitment and supplied the rationale.

For `required_evidence_type: other`, surface the advisory
`EVIDENCE_TYPE_UNSPECIFIED`. If `revision_location` is absent, request it; if it
is present, verify there while retaining the advisory. This advisory is distinct
from a missing-rationale gap.

For `partial`, `not-fulfilled`, or `explicitly-rejected-with-rationale`, require
`unfulfilled_rationale` on the same commitment object. If missing, add an
advisory `COMMITMENT_GAP`. Keep per-commitment status/rationale pairing intact;
do not reconstruct parallel lists or pair by index.

A concern-level `residual_action` may coexist with fulfilled individual
commitments. It states what remains for the whole concern and is not evidence of
a contradiction by itself.

Return the completed verification report as an artifact for registration. Send
unresolved, worsened, or blocking commitment findings to the re-review gate
helper for `researchspec/runs/current/gate-ledger.jsonl`. The reviewer does not
apply patches or write registry/gate records directly.
