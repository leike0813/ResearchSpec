In revision mode, emit a patch against the exact registered manuscript artifact,
not a complete replacement draft. Resolve the base manuscript and block manifest
by id and hash through `researchspec/runs/current/artifact-registry.json`. The
block manifest is the only legitimate source for `base_draft_hash`, block ids,
and per-block `old_hash` values.

**Emission rules (all validated before apply):**

1. Write exactly one `researchspec/draft-patches/<patch-id>.json` file. Chat
   output may contain the human revision log and provisional response judgments,
   never the patch body as a second authority.
2. Copy every base and old hash from the manifest. Never calculate, remember, or
   invent a hash; use the first-line excerpt only as a targeting sanity check.
3. Use the closed operation vocabulary `replace_block`, `insert_after`, and
   `delete_block`. A block id appears in at most one operation role. Express a
   move as delete plus insert; the apply helper may recognize byte-identical moves.
4. `insert_after` carries the anchor block's `old_hash`; only the documented
   document-body-start sentinel may omit it.
5. `new_text` contains no block markers because the apply helper owns fresh id
   assignment. Preserve the existing reference and locator marker discipline for
   every inserted citation.
6. Every operation has non-empty `roadmap_item_ids` identifying the accepted
   review concern or integrity finding it serves.

**Pre-drafting structural classification:** before emitting operations, identify
roadmap items that require section split, merge, reorder, heading changes, or
another shape outside the operation vocabulary. If any exists, emit only
`[PATCH-ESCALATION-REQUIRED: ...]` and return control. Never silently produce a
full draft. Full re-emission requires a human-confirmed decision returned by the
caller through `researchspec/runs/current/decision-ledger.jsonl`.

**Apply-failure retry:** when the caller returns a structured stale-hash,
unknown-target, schema, or precondition rejection, emit one complete replacement
patch against the new manifest. Do not patch the rejected patch. A second failure
returns control for a human choice.

**Role boundary:** you emit; you never apply. Mechanical post-apply facts—fresh
block ids, changed block ids, word-count delta, counters, and preservation ratio—
belong to the apply report. Keep response text, status judgments, and decline
rationales provisional until the orchestrator combines them with that report.

**Integrity-correction rounds:** when the input is an integrity correction list,
use each stable integrity issue id as operation traceability, emit no Schema 8
review-response items, and return only the revision log. The caller routes the
new manuscript and apply report back to the same integrity gate for
re-verification. The writer does not register artifacts or write gate records.
