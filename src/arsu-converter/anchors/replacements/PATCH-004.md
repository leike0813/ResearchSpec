When a revision stage dispatches `academic-paper` revision mode—normal review
rounds (Stage 3 → 4 / 3' → 4') and integrity-FAIL correction rounds (Stage 2.5
FAIL → 2 or Stage 4.5 FAIL → 5 revision)—the writer's deliverable is a
ResearchSpec draft patch, not a re-emitted manuscript. The orchestrator owns the
deterministic preparation, apply, registration, and gate steps around that
patch. The Stage 4.5 FAIL route enters Stage 5's revision sub-step, not the
PASS-path finalization handoff, and the gate that issued any FAIL must re-verify
the applied result before finalization.

**Normative order per revision round — nothing may rewrite the draft between
steps 1 and 3:**

1. **Prepare the immutable base.** Resolve the current manuscript artifact and
   its recorded hash through
   `researchspec/runs/current/artifact-registry.json`. Run the deterministic
   draft-patch preparation helper to assign stable block ids where missing and
   refresh the block manifest without changing prose. Register the refreshed
   manifest as a derived artifact before dispatch.
2. **Dispatch the writer.** Provide the exact registered draft, its block
   manifest, and the round's accepted Revision Roadmap. The writer emits
   `researchspec/draft-patches/<patch-id>.json` with target artifact id, target
   hash, block preconditions, stable operation ids, Annotation references when
   present, complete Annotation resolution entries, and roadmap traceability.
   In review rounds it also emits provisional response items containing judgment
   content; it does not apply the patch or update registries and ledgers.
3. **Validate and apply deterministically.** The draft-patch apply helper first
   validates schema, target artifact identity, base hash, block preconditions,
   operation shape, and structural-change limits. Validation is fail-closed and
   byte-preserving on rejection. A successful apply creates a new manuscript
   artifact plus a separate apply report; when Annotation resolution is present,
   it also derives and registers an immutable Annotation Resolution Report from
   the v3 operation mapping. It never overwrites the registered base. The
   default structural touched-ratio threshold remains `0.6` with a
   strict `>` comparison. A different threshold requires a human-confirmed
   decision returned to the decision runtime for
   `researchspec/runs/current/decision-ledger.jsonl` before apply.
4. **Run the provenance finalizer on the apply output.** Do not run it between
   base preparation and apply: changes to reference-status markers in that
   interval would create hash mismatches that do not represent stale writer
   input. After apply, resolve newly inserted bare `<!--ref:-->` markers under
   the existing finalizer contract.
5. **Complete mechanical response facts.** For review rounds, fill response-item
   block ids, fresh insertion ids, word-count delta, and counters from the apply
   report while preserving the writer's judgment text. Return the response,
   apply report, and any CLI-derived Annotation Resolution Report as registered
   evidence, then require the apply report as an input to re-review.
6. **Surface preservation and interaction state.** Include `preserved_ratio`
   from the apply report beside the accumulated round-trip count in the stage
   checkpoint, for example `round-trips: 3/9 · preserved_ratio: 0.91`.

**Integrity-correction variant (Stage 2.5 / 4.5 FAIL).** Follow steps 1–4 and 6
unchanged, with two differences:

- Do not create Schema 8 response items because no review round occurred.
  Instead, every patch operation's `roadmap_item_ids` must reference the stable
  correction ids issued by the integrity report.
- Return the new manuscript and apply report to the same integrity gate that
  issued the FAIL. The apply report is required evidence, not a substitute for
  re-verification. Submit the new gate result to the gate helper for
  `researchspec/runs/current/gate-ledger.jsonl`; do not advance on an unresolved
  blocking result. Existing round caps remain in force.

**Structural-revision escalation — the only path to full re-emission.** A
pre-drafting classification that requires restructuring, or an apply-time
structural refusal caused by heading changes, section-count change, or a
touched ratio above the accepted threshold, MUST stop at a human checkpoint.
Present the trigger and these choices:

1. narrow or defer the structural items and re-dispatch the remaining local
   items as a patch round;
2. for apply-time flags only, acknowledge and apply the same patch while
   preserving the structural flags in the apply report;
3. re-emit the full manuscript for this round.

Only an explicit human choice of full re-emission permits option 3. Return that
choice and its rationale to the decision runtime before continuing. After full
re-emission, prepare a fresh block manifest with new block ids, invalidate all
patches tied to the prior manuscript hash, and mark the round report
`mode: full_reemission_escalated`. Never auto-fallback to full re-emission.

**Apply-failure path (not structural escalation).** On stale hash, unknown
target, schema failure, or failed block precondition, keep the base manuscript
byte-unchanged and return the structured failure report to the writer for one
new patch against the current registered base. A second failure stops for a
human choice among: prepare a fresh block manifest and retry the round, approve
full re-emission through the checkpoint above, or abort. Send failure and
blocking findings to the responsible gate helper; artifact registration,
decision recording, and gate-ledger writes remain owned by their ResearchSpec
runtime helpers.
