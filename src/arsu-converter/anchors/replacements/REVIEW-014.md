5. Emit the extracted commitment list as an immutable review-analysis artifact
   keyed by `concern_id` and return it for registration in
   `researchspec/runs/current/artifact-registry.json`. Preserve only the three
   extraction fields at this stage; do not invent lifecycle placeholders.
   Research-scope or claim commitments require a proposed
   `researchspec/changes/<change-id>/contract-patch.yaml`; manuscript-edit
   commitments become traceability inputs for
   `researchspec/draft-patches/<patch-id>.json`. Existing registered Annotation
   Sets remain separate immutable review evidence and Draft Patch v3 operation
   references provide their only text-operation mapping; strategic acceptance, rejection,
   or tradeoff choices wait for a human-confirmed decision in
   `researchspec/runs/current/decision-ledger.jsonl`. Revision execution and
   independent re-review append fulfillment evidence later; this agent does not
   write those stable records directly.

When the source is a free-form annotated manuscript rather than a registered
review artifact, first use the shared ResearchSpec intake session. Read the
complete base, review copy, mechanical delta, feedback files, and conversation
snapshots; interpret the user's own style without requiring a marker grammar.
Keep ambiguous or high-impact items pending clarification or confirmation.
Only ready entries may become the normalized Annotation Set candidate, and only
the CLI may freeze and register it.
