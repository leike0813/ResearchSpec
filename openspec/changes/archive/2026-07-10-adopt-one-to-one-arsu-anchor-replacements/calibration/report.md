# ARSU One-to-One Anchor Semantic Calibration

**Status:** Approved. The five authored bodies have been promoted to the formal v3 replacement directory; these copies remain audit evidence only.

The samples test five different failure-prone domains. The user confirmed that each after block preserves the useful local behavior of its complete before span while changing only incompatible ARS/Material Passport ownership, which unblocked the remaining 45 bodies and the v3 code migration.

| Stable id | Domain sample | Scope |
| --- | --- | --- |
| `STATE-005` | Pipeline orchestrator resume runtime | existing complete matched span |
| `CLAIM-003` | Deep-research synthesis claim intent | existing complete matched span |
| `REVIEW-006` | Methodology reviewer blind/visible phase model | existing complete matched span |
| `PATCH-004` | Pipeline orchestrator revision-round patch sequencing | expanded complete section |
| `GATE-003` | Compliance agent output contract | existing complete matched span |

## 1. `STATE-005` — Pipeline orchestrator resume runtime

- Source: `vendor/ars/academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Name: `pipeline.orchestrator.resume-runtime`
- Severity: `required`
- Semantic role: `runtime_state_boundary`
- ResearchSpec targets: `researchspec/runs/current/state.yaml`, `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/decision-ledger.jsonl`, `researchspec/runs/current/gate-ledger.jsonl`
- Rewrite rationale: Preserves hash validation, legacy boundary lookup, double-resume protection, acknowledgement formatting, verification handling, pending decisions, override precedence, and no-resummarization. It removes passport mutation and sole-input ownership, assigning atomic state, artifact, decision, and gate writes to their ResearchSpec owners.

### Before

````markdown
**Trigger:** user input starts with or contains `resume_from_passport=<12-hex>`.

**Contract:** full spec in [`../references/passport_as_reset_boundary.md`](../references/passport_as_reset_boundary.md) §"`resume_from_passport` mode contract".

**Orchestrator obligations:**
1. **Acquire passport lock.** Before reading the ledger or checking for a prior consuming entry, acquire an exclusive advisory lock on the passport file (see `references/passport_as_reset_boundary.md` §"Concurrency model"). Hold the lock across the read, the no-prior-resume check, and the append. Release after the append is durable on disk. Do NOT release between steps.
2. Parse `<hash>` from user input. Validate `^[0-9a-f]{12}$`.
3. Locate passport file: prefer explicit path in user input; else look in `./passports/` or `./material_passport*.yaml` relative to CWD; else ask the user for the path.
4. Load `reset_boundary[]`. Find the entry with `kind: boundary` and matching `hash`. No match → hard error: "Passport hash `<hash>` not found in `<path>`. Cannot resume."
5. Check for prior consumption. If any later entry has `kind: resume` and `consumes_hash == <hash>`, that boundary is already consumed, and the orchestrator emits a hard error: "Passport hash `<hash>` was already resumed at `<consume generated_at>`. Cannot resume twice." This prevents double-resume and diverging session histories.
6. Emit `### Resume Acknowledged` section using this exact template:

   ```
   ### Resume Acknowledged
   - Hash: <hash>
   - Source session: <session_marker> (generated <generated_at>)
   - Recovered stage: <stage>
   - Next stage: <next> [override: stage=<user-stage>, mode=<user-mode>]
   ```

   The `[override: ...]` clause appears only when the user supplied `stage=` or `mode=` overrides; omit the bracket entirely otherwise.

   When `pending_decision` is set on the boundary entry, replace `<next>` with `(pending user decision)` in the template above. The actual next stage is determined after the user picks a branch (step 8). After the user picks, print the resolved `next_stage` from the matched option as part of the decision-prompt flow.

   Example rendering (`pending_decision` set, resolved after user chose `revise`):
   ```
   ### Resume Acknowledged
   - Hash: a3f2b7c9d0e1
   - Source session: sess-42 (generated 2026-04-23T14:00:00Z)
   - Recovered stage: 3
   - Next stage: (pending user decision)

   [after user picks `revise`]
   - Resolved next stage: 4 (mode: revision)
   ```
7. Honor `verification_status`. If `STALE` or `UNVERIFIED`, show a warning and ask the user whether to re-verify before continuing. If `VERIFIED`, proceed without prompting.
8. If the boundary entry carries `pending_decision`, **stop and re-prompt the user**. Display `pending_decision.question` and each option's `value`. Do NOT use `next` to auto-advance. After the user picks, look up the matching entry in `options[]` by `value`. Use that entry's `next_stage` and `next_mode` to determine actual routing. Record the chosen `value` as `chosen_branch` on the resume entry (step 9). The boundary entry's `next` field is advisory only; the matched option's `next_stage` takes precedence. CLI `stage=`/`mode=` overrides from the resume command still win over option routing.
9. Append a `resume` entry to `reset_boundary[]` with `kind: resume`, `consumes_hash: <hash>`, fresh `generated_at` and `session_marker`, and (if applicable) `chosen_branch` and `user_override`. This marks the boundary as consumed for any downstream reader. Release the passport lock after this append is durable on disk.
10. Invoke the next stage with the passport as the sole input. Do NOT ask the user to re-summarize prior stages.
````

### After

````markdown
**Trigger:** user input starts with or contains `resume_from_passport=<12-hex>`.

**Compatibility contract:** the referenced ARS Material Passport boundary is
import evidence only. Active resume state is owned by
`researchspec/runs/current/state.yaml`; imported files and recovered outputs are
resolved through `researchspec/runs/current/artifact-registry.json`; human branch
choices are recorded through the decision runtime in
`researchspec/runs/current/decision-ledger.jsonl`; verification and blocking
conditions are recorded by the resume gate in
`researchspec/runs/current/gate-ledger.jsonl`.

**Orchestrator obligations:**

1. Parse `<hash>` from user input and validate `^[0-9a-f]{12}$`.
2. Locate the compatibility passport: prefer an explicit path in user input;
   otherwise look in `./passports/` or `./material_passport*.yaml` relative to
   the current working directory; if none is found, ask the user for the path.
3. Read `reset_boundary[]` without modifying the passport. Find the
   `kind: boundary` entry whose `hash` matches. No match is a hard error:
   `Passport hash <hash> not found in <path>. Cannot resume.`
4. Submit the passport path, its content hash, and the matched boundary payload
   to the ResearchSpec resume helper. The helper owns the exclusive run-state
   update lock and MUST atomically check whether this imported boundary has
   already been consumed in the current run. A prior consumption is a hard
   error and MUST identify when the boundary was resumed. Do not implement this
   check by appending a `resume` entry to the passport.
5. Resolve every recovered output by artifact id and recorded hash through
   `researchspec/runs/current/artifact-registry.json`. A missing, changed, or
   unregistered required artifact makes the resume stale and blocks automatic
   advancement until the resume gate records a verified result.
6. Emit the acknowledgement in this form:

   ```text
   ### Resume Acknowledged
   - Hash: <hash>
   - Source session: <session_marker> (generated <generated_at>)
   - Recovered stage: <stage>
   - Next stage: <next> [override: stage=<user-stage>, mode=<user-mode>]
   ```

   Include the bracketed override only when the user supplied `stage=` or
   `mode=`. When the imported boundary has `pending_decision`, print
   `(pending user decision)` as `<next>` until step 8 resolves it.
7. Honor the imported `verification_status` as evidence, not as a current gate
   result. For `STALE` or `UNVERIFIED`, warn the user and ask whether to
   re-verify. For `VERIFIED`, the resume gate may reuse it only after current
   artifact hashes and required gate receipts have been checked.
8. If `pending_decision` exists, stop and display its question and option
   values. After the user selects a value, resolve `next_stage` and `next_mode`
   from the matching option. Explicit `stage=` or `mode=` resume overrides take
   precedence. Return the confirmed choice and rationale to the ResearchSpec
   decision runtime before advancing; do not write the decision ledger directly.
9. Ask the resume helper to atomically register the imported passport as a
   compatibility artifact, mark the boundary consumed in run state, record any
   human-confirmed branch, and submit verification findings to the resume gate.
   The helper, decision runtime, and gate validator own their respective stable
   files; the orchestrator MUST NOT edit those files or the source passport.
10. Invoke the resolved next stage with the current ResearchSpec state and the
    registered artifact ids required by that stage. The passport is not the
    sole runtime input. Do not ask the user to re-summarize prior stages.
````

## 2. `CLAIM-003` — Deep-research synthesis claim intent

- Source: `vendor/ars/deep-research/agents/synthesis_agent.md`
- Name: `deep.synthesis.claim-intent-passport`
- Severity: `required`
- Semantic role: `claim_contract_projection`
- ResearchSpec targets: `researchspec/specs/claims.yaml`, `researchspec/changes/<change-id>/contract-patch.yaml`, `researchspec/runs/current/artifact-registry.json`
- Rewrite rationale: Preserves the one-shot pre-prose claim baseline and downstream three-set audit while separating accepted claims, proposed meaning changes, and the immutable registered intent artifact. The synthesis agent no longer mutates either Material Passport or stable claims.

### Before

````markdown
Before drafting the first prose block of the synthesis output, append ONE `claim_intent_manifests[]` entry to the Material Passport listing the substantive claims the synthesis intends to make and any author-declared "must not" rules. The audit agent reads this baseline to run the three-set diff (intended ∩ emitted ∩ supported) per spec §4 step 5 (D6).
````

### After

````markdown
Before drafting the first prose block of the synthesis output, read the accepted
claim ids, support limits, evidence links, and wording constraints from
`researchspec/specs/claims.yaml`. Emit exactly ONE immutable
`claim_intent_manifest` artifact listing the substantive claims this synthesis
intends to make and every author-declared "must not" rule. Claims already
accepted by the contract must retain their stable claim ids; any new claim or
increase in claim strength must also be proposed through
`researchspec/changes/<change-id>/contract-patch.yaml`, never written directly
to `claims.yaml`. Return the manifest to the runtime for registration in
`researchspec/runs/current/artifact-registry.json`. The audit agent reads that
registered pre-commitment to run the three-set diff (intended ∩ emitted ∩
supported) per spec §4 step 5 (D6).
````

## 3. `REVIEW-006` — Methodology reviewer blind/visible phase model

- Source: `vendor/ars/academic-paper-reviewer/agents/methodology_reviewer_agent.md`
- Name: `reviewer.agent.methodology_reviewer.sprint-contract-phase-model`
- Severity: `recommended`
- Semantic role: `generator_evaluator_contract`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Rewrite rationale: Keeps the exact two-phase protocol that follows this introductory span and adds only the occurrence-specific ResearchSpec I/O seam: registered Phase 1 evidence, read-only reuse in Phase 2, methodology-specific outputs, and gate-helper ownership.

### Before

````markdown
You operate in two phases when invoked under a sprint contract. The orchestrator controls which phase via the system prompt you receive.
````

### After

````markdown
When invoked under a sprint contract, you still operate in two strictly
separated phases. The orchestrator selects the phase through the system prompt
and resolves the sprint contract and phase artifacts through
`researchspec/runs/current/artifact-registry.json`. Phase 1 is the
paper-content-blind methodology-rigor pre-commitment described below; its exact
output must be registered before Phase 2 begins. Phase 2 receives that registered
output as read-only data and performs the paper-visible methodology review
without silently changing the scoring plan. Return each phase output for runtime
registration, and return protocol violations or blocking methodology findings
to the review gate helper for `researchspec/runs/current/gate-ledger.jsonl`.
Do not write the registry or gate ledger directly.
````

## 4. `PATCH-004` — Pipeline orchestrator revision-round patch sequencing

- Source: `vendor/ars/academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Name: `pipeline.orchestrator.revision-patch-toolchain`
- Severity: `required`
- Semantic role: `draft_patch_protocol`
- ResearchSpec targets: `researchspec/draft-patches/<patch-id>.json`, `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/decision-ledger.jsonl`, `researchspec/runs/current/gate-ledger.jsonl`
- Scope decision: Expanded in v3 from the introductory line to the entire Revision-Round Patch Sequencing block, ending after the apply-failure path.
- Rewrite rationale: Expands the v2 one-line scope to the complete operational block. The rewrite preserves normal and integrity-correction routes, immutable preparation/apply ordering, finalizer timing, response mechanics, preservation reporting, structural escalation, retry-once behavior, and human choice. ARS script and phase-directory ownership is replaced by deterministic ResearchSpec helpers and registered artifacts.

### Before

````markdown
When a revision stage dispatches `academic-paper` revision mode (Stage 3 → 4 / 3' → 4'; "Resolved next stage: 4 (mode: revision)" — and equally the integrity-FAIL correction rounds, Stage 2.5 FAIL → 2 and Stage 4.5 FAIL → 5 (revision), where the integrity correction list serves as the round's revision requirements; #89 Item 8, destination differences in the integrity-correction variant below — note the FAIL arrow lands on Stage 5's **revision** sub-step, not the PASS-path Stage 4.5 → 5 finalization handoff, and re-verification by the issuing gate is mandatory before finalization), the writer's deliverable is a **patch document**, not a re-emitted draft, and the orchestrator owns the deterministic steps around it. Spec: `docs/design/2026-06-10-390-diff-patch-revision-mode-spec.md` §3.3–§3.6. Protocol + exact commands: `academic-paper/references/revision_patch_protocol.md`. The toolchain is Slice A (#423): `scripts/ars_anchorize_draft.py` + `scripts/ars_apply_revision_patch.py`.

**Normative order per revision round — nothing may rewrite the draft between steps 1 and 3:**

1. **Anchorize (manifest refresh):** `python scripts/ars_anchorize_draft.py <draft.md>` — idempotent, content-neutral; stamps any unlabeled blocks and regenerates `<draft>.block-manifest.json`. Run it at every round entry (including legacy pre-anchor drafts at revision-mode intake) so the manifest matches the exact text the writer is about to see.
2. **Dispatch the writer** with the anchored draft + the block manifest + the round's Revision Roadmap in context. The writer emits the patch as `phase6_*/revision_patch_round<N>.json` plus provisional Schema 8 response items (see `draft_writer_agent.md` § Patch-Document Revision Emission).
3. **Apply:** `python scripts/ars_apply_revision_patch.py <draft.md> <patch.json> --output <draft.rev<N>.md>` — two-phase fail-closed; the output is a NEW versioned artifact (supersession convention above) and the apply report lands beside it. The touched-ratio trigger defaults to the #424 ship decision (0.6, strict `>`); do not pass a different threshold without a recorded user decision.
4. **Finalizer pass:** the Cite-Time Provenance Finalizer runs on the apply OUTPUT, resolving any newly inserted bare `<!--ref:-->` markers per its shipped contract. A finalizer pass between steps 1 and 3 would legitimately mutate `<!--ref:-->` status tokens and produce spurious hash mismatches at apply — the sequencing exists to make every hash mismatch MEAN staleness, not pipeline noise.
5. **Complete Schema 8 mechanical fields** from the apply report (§3.5 role split): `change_block_ids` per response item (including fresh insert IDs from `ops_applied[].new_block_ids` / `fresh_block_ids`), `word_count_delta`, counters. The writer's provisional items carry the judgment content; the orchestrator fills in the post-apply facts. Then the response moves to re-review with the **apply report named as a required input** alongside it.
6. **Surface `preserved_ratio`** from the apply report's counters next to the accumulated round-trip count in the stage checkpoint line (the #389 interaction-count budget surface; advisory, one line — e.g. `round-trips: 3/9 · preserved_ratio: 0.91`).

**Integrity-correction variant (Stage 2.5 / 4.5 FAIL rounds, #89 Item 8).** A correction round follows steps 1–4 and 6 unchanged, with two destination differences. (a) **No Schema 8 response items in this round** — response items are review-round artifacts and no review round occurred; the writer maps each patch op's `roadmap_item_ids` to the integrity report's stable correction IDs instead (the `IL-<SEVERITY>-<n>` Issue List IDs, or a finding's native `EA-NNN`; see `integrity_verification_agent.md` § Issue List and `draft_writer_agent.md` § Patch-Document Revision Emission), and step 5's mechanical completion is skipped. (b) **The applied output returns to the SAME integrity gate that issued the FAIL** (Stage 2.5 or 4.5) for re-verification — never forward to review or finalization on the strength of the apply report alone; the apply report is a required input to that re-verification, not a substitute for it. The integrity gate's own caps are unchanged (max 3 correction rounds; abort after the 2nd Stage 4.5 FAIL).

**Escalation gate (§3.6) — the only road to full re-emission, and it runs through the user.** Two trigger layers:

- **Layer 1 (pre-drafting):** the writer returns `[PATCH-ESCALATION-REQUIRED: layer=pre_drafting, ...]` instead of a patch — a roadmap item demands restructuring.
- **Layer 2 (apply-time):** the apply script exits 3 (`refused_structural`) — heading-block ops, section-count change, or touched-ratio above threshold on an emitted patch (the writer misclassified a structural change as local). Note the heading-anchor exemption (#424): an `insert_after` merely anchored on a heading does not flag; rewriting/deleting a heading or inserting heading-bearing text does.

On either trigger, STOP and present the MANDATORY checkpoint:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ MANDATORY CHECKPOINT — Structural revision detected (#390)

Trigger: [pre-drafting classification: items REV-00X (reason) |
          apply-time shape flags: heading ops at indexes [...], section_count_delta=N, touched_ratio=0.NN > 0.6]

Proceeding by full re-emission exposes the ENTIRE document to the
silent-distortion risk patch mode exists to remove (DELEGATE-52) —
for this round, every untouched paragraph is regenerated by the model.

Your options:
  (a) narrow — drop/defer the structural items, re-dispatch the writer
      on the remaining local items as a normal patch round
  (b) [layer 2 only] acknowledge — apply this patch as-is; the flags are
      recorded in the apply report (--acknowledge-structural)
  (c) re-emit in full — this round runs as legacy full re-emission,
      provenance-stamped mode: full_reemission_escalated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Only on explicit user choice (c) does a round run as full re-emission; afterwards **re-anchorize from scratch** (new ID generation — old patches never apply across a re-emission boundary) and record `mode: full_reemission_escalated` in the round's report so provenance never pretends a patch round happened. NEVER auto-fallback to full re-emission — not on structural flags, not on apply failure. MVP granularity is per-round, binary (one confirmed restructure item ⇒ the whole round re-emits; mixed rounds are deferred forward-scope, spec §9.3).

**Apply-failure path (distinct from escalation):** a Phase 1 rejection (exit 2 — stale hash, unknown target, schema failure) feeds the structured failure report back to the writer for ONE patch re-emission against the current base (retry-once, v3.6.6 convention). Second failure → escalate to the user with three options: re-anchorize + retry the round / escalated full re-emission (checkpoint above) / abort. The base draft is byte-untouched on every rejection — there is no partial apply to clean up.
````

### After

````markdown
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
   hash, block preconditions, operations, and roadmap traceability. In review
   rounds it also emits provisional response items containing judgment content;
   it does not apply the patch or update registries and ledgers.
3. **Validate and apply deterministically.** The draft-patch apply helper first
   validates schema, target artifact identity, base hash, block preconditions,
   operation shape, and structural-change limits. Validation is fail-closed and
   byte-preserving on rejection. A successful apply creates a new manuscript
   artifact plus a separate apply report; it never overwrites the registered
   base. The default structural touched-ratio threshold remains `0.6` with a
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
   report while preserving the writer's judgment text. Return the response and
   apply report as artifacts for runtime registration, then require the apply
   report as an input to re-review.
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
````

## 5. `GATE-003` — Compliance agent output contract

- Source: `vendor/ars/shared/agents/compliance_agent.md`
- Name: `shared.compliance-agent.output-passport`
- Severity: `required`
- Semantic role: `gate_policy`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Rewrite rationale: Preserves Schema 12, standalone report output, orchestrator validation, tiered findings, evidence, and material-gap behavior. It replaces Passport history append with separate artifact registration and compliance-gate submission, without granting the agent direct runtime-file writes.

### Before

````markdown
`compliance_report` conforming to `shared/compliance_report.schema.json` (Schema 12). Appended to `material_passport.compliance_history[]` by the orchestrator.
````

### After

````markdown
Return a `compliance_report` conforming to
`shared/compliance_report.schema.json` (Schema 12) as a standalone artifact. The
orchestrator must first validate the report, then pass its path, hash, producer,
stage, and mode to the runtime registration helper for
`researchspec/runs/current/artifact-registry.json`. Pass the validated decision,
tiered findings, evidence, and material gaps to the compliance gate helper for
`researchspec/runs/current/gate-ledger.jsonl`. The compliance agent and
orchestrator MUST NOT append the report to a Material Passport or edit either
ResearchSpec runtime file directly.
````

## Approval Gate

Approval means the remaining bodies should follow these rules:

1. Audit and, where necessary, expand the full semantic scope before writing the replacement.
2. Preserve valid operational detail rather than replacing it with generic ResearchSpec prose.
3. Keep each body local to its role and surrounding Markdown structure.
4. Assign stable-file mutation to runtime helpers, validators, human decisions, or accepted contract patches only where that occurrence performs a write.
5. Add no renderer-generated headings, macros, or generic mutation section.
