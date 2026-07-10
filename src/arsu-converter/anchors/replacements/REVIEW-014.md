5. Emit the extracted commitment list as an immutable review-analysis artifact
   keyed by `concern_id` and return it for registration in
   `researchspec/runs/current/artifact-registry.json`. Preserve only the three
   extraction fields at this stage; do not invent lifecycle placeholders.
   Research-scope or claim commitments require a proposed
   `researchspec/changes/<change-id>/contract-patch.yaml`; manuscript-edit
   commitments become traceability inputs for
   `researchspec/draft-patches/<patch-id>.json`; strategic acceptance, rejection,
   or tradeoff choices wait for a human-confirmed decision in
   `researchspec/runs/current/decision-ledger.jsonl`. Revision execution and
   independent re-review append fulfillment evidence later; this agent does not
   write those stable records directly.
