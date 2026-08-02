# ARSU Anchor Replacement Report

This report is for human audit of generated ARSU contract replacements. It is not a runtime ResearchSpec contract.

## Replaced Anchors

### CLAIM-001

- Anchor name: `paper.draft-writer.claim-intent-passport`
- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/draft_writer_agent.md`
- Severity: `required`
- Semantic role: `stable_claim_contract`
- Replacement shape: `artifact_projection_block`
- Replacement body SHA-256: `70a669b030f206da92dc038352aa16b567b233ea1eaa7fb04bafcb1acf1e3384`
- ResearchSpec targets: `researchspec/specs/claims.yaml`, `researchspec/changes/<change-id>/change.md`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/agents/draft_writer_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `academic-pipeline/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `deep-research/references/cross-skill/academic-paper/agents/draft_writer_agent.md`
- Before SHA-256: `cd600a01478b854779f28248cfde9c4be266358c4ba2232ca4e88b4f51f22134`
- After SHA-256: `7a9ee150b564cd7478d5133e1d15dc4082e19178393cd6cb1d471d7eb8f76b9e`

#### Before

````markdown
Before drafting the first prose block of the paper draft, append ONE `claim_intent_manifests[]` entry to the Material Passport listing the substantive claims the draft intends to make and any author-declared "must not" rules. The audit agent reads this baseline to run the three-set diff (intended ∩ emitted ∩ supported) per spec §4 step 5 (D6).
````

#### After

````markdown
<!--rs:CLAIM-001-->
### ResearchSpec Current Owner

Replacement scope: `CLAIM-001` for `academic-paper`.

Before drafting the first prose block of the paper, read accepted claim ids,
allowed wording, support strength, evidence links, and limits from
`researchspec/specs/claims.yaml`. Emit exactly ONE immutable
`claim_intent_manifest` artifact that lists the claims this draft intends to
make and all author-declared "must not" rules. Reuse stable ids for accepted
claims. Any new claim, stronger wording, or changed limit must also be proposed
through `researchspec/changes/<change-id>/change.md`; never edit
`claims.yaml` from the drafting agent. Record the manifest by role and path in
`researchspec/subflows/<instance>/handoff.md`. The audit
agent uses that handoff-referenced pre-commitment for the intended ∩ emitted ∩ supported
diff in spec §4 step 5 (D6).

Current ResearchSpec owners:

- `researchspec/specs/claims.yaml`
- `researchspec/changes/<change-id>/change.md`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:CLAIM-001-->
````

### IO-001

- Anchor name: `paper.draft-writer.phase-boundary`
- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/draft_writer_agent.md`
- Severity: `recommended`
- Semantic role: `boundary_deliverable_contract`
- Replacement shape: `io_contract_block`
- Replacement body SHA-256: `6129080a91595c34561b00aafa447ba80a076ec42e4c3084afef5143a0216e71`
- ResearchSpec targets: `researchspec/specs/manuscript.yaml`, `researchspec/specs/claims.yaml`, `researchspec/subflows/<instance>/handoff.md`, `assets/shared/contracts/patch/revision_patch.schema.json`
- Generated output paths: `academic-paper/agents/draft_writer_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `academic-pipeline/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `deep-research/references/cross-skill/academic-paper/agents/draft_writer_agent.md`
- Before SHA-256: `0208068fc817d98c4c38fb0ef2da645475a0707080ccdef4d400f91b73e3a246`
- After SHA-256: `6978fb740efb070e6db9ec664b76f76d0e0703ab27d7bfed9c630a6c65b989e9`

#### Before

````markdown
You are a phase-scoped agent assigned to **academic-paper Phase 4 (Drafting)** OR **Phase 6 (Revision after review)** per caller invocation. You are single-phase per invocation. **In Phase 4 (and in a Phase 6 round the caller has explicitly confirmed as `full_reemission_escalated`, §3.6) your deliverable is the complete paper draft, per the Output Format below.** In a normal Phase 6 revision round your deliverable is instead a **patch document** (see § Patch-Document Revision Emission (#390)), NOT a re-emitted draft — the patch contract supersedes the full-draft Output Format for that case.

You MUST NOT:
- WRITE files in `phase{M}_*/` directories where M ≠ {your invocation's phase} (no inflate)
- Produce content classified as a downstream-phase deliverable type (citation-compliance report, abstract, peer-review verdict, formatted manuscript) even if you can see the end-goal
- Invoke or simulate any other agent persona's output (e.g., do not produce citation format check — that's `citation_compliance_agent`'s Phase 5a; do not produce peer-review verdict — that's `peer_reviewer_agent`'s Phase 6)
- "Helpfully" continue past your assigned deliverable

You MAY READ files in upstream phases (`phase0_*/` through `phase{N-1}_*/`) plus your own phase. For Phase 4 invocation: read Phase 0-3 (config, literature, structure, arguments). For Phase 6 invocation: read Phase 0-5 (all prior + Phase 5 citation/abstract + Phase 6 reviewer feedback).

If downstream work is needed, return control to the caller. The v3.6.6 generator-evaluator contract block below also constrains your Phase 4a/4b sub-phase behavior — the Phase Boundary is about pipeline-phase scope, the v3.6.6 contract is about within-phase generator-evaluator discipline; both apply.

**Enforcement (v3.9.2):** prompt-level fence + advisory verifier (`scripts/check_pipeline_integrity.py`). Since the #134 rescope (PR #294), a deterministic PreToolUse write-scope guard enforces the WRITE clause where a hook runs; where none runs, this fence is the enforcement layer.
````

#### After

````markdown
<!--rs:IO-001-->
### ResearchSpec Current Owner

Replacement scope: `IO-001` for `academic-paper`.

You are a phase-scoped Draft Writer assigned to Phase 4 initial drafting or one
explicitly dispatched Phase 6 revision round. The caller's invocation determines
the phase. Phase 4 and a human-approved `full_reemission_escalated` round may
emit a complete manuscript; a normal Phase 6 round emits only
`assets/shared/contracts/patch/revision_patch.schema.json`.

**Contract inputs:** read manuscript structure and claim limits from
`researchspec/specs/manuscript.yaml` and `researchspec/specs/claims.yaml`.
Resolve the exact outline, argument blueprint, bibliography, current manuscript,
review roadmap, and other permitted upstream artifacts by role and safe path through
`researchspec/subflows/<instance>/handoff.md`. Do not infer permission from
`phase*_` directory names or consume unregistered downstream output.

**Contract outputs:** produce only the deliverable for this invocation: an
initial draft artifact, an approved full re-emission artifact, or a draft patch.
Do not produce citation-compliance reports, abstracts, peer-review verdicts,
formatted manuscripts, or another agent's output. Return downstream work to the
caller.

**Writes allowed:** write the new deliverable file only. Return ordinary
artifacts to the owning subflow handoff; write manuscript revision
operations only to the dedicated draft-patch file. Do not edit stable specs,
the owning control, handoff, Decisions, or Gates directly. Contract preflight and
runtime validation enforce this boundary; platform hooks and ARS directory
verifiers are optional diagnostics, not the source of authority.

Current ResearchSpec owners:

- `researchspec/specs/manuscript.yaml`
- `researchspec/specs/claims.yaml`
- `researchspec/subflows/<instance>/handoff.md`
- `assets/shared/contracts/patch/revision_patch.schema.json`
<!--/rs:IO-001-->
````

### PATCH-002

- Anchor name: `paper.draft-writer.patch-emission`
- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/draft_writer_agent.md`
- Severity: `required`
- Semantic role: `revision_patch_protocol`
- Replacement shape: `patch_protocol_block`
- Replacement body SHA-256: `353763f0687e861ca11cc77e7d7d6f8d19b3606d8e8a81eb4af1f5369f28f0b6`
- ResearchSpec targets: `assets/shared/contracts/patch/revision_patch.schema.json`, `scripts/apply-revision-patch.mjs`, `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/agents/draft_writer_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `academic-pipeline/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `deep-research/references/cross-skill/academic-paper/agents/draft_writer_agent.md`
- Before SHA-256: `303cf33ae73e69553a6cc6b2da370857fe0640a3a418fd7648e018d9cff493fd`
- After SHA-256: `e3d9422aa9c789ef44f62930802a7ecb4c219dc90a4c6388c0dca49f6f7f9d70`

#### Before

````markdown
In **revision mode** (standalone `academic-paper` revision, which is also what pipeline revision stages dispatch), your draft deliverable is NOT a re-emitted complete paper. It is a **patch document**: a JSON list of block operations against the anchored base draft, schema `shared/contracts/patch/revision_patch.schema.json`. Full re-emission exposes every character of the paper to silent-distortion on every round (DELEGATE-52, arXiv:2604.15597); the patch shape confines exposure to the blocks your operations explicitly touch. Spec: `docs/design/2026-06-10-390-diff-patch-revision-mode-spec.md` §3.2/§3.5/§3.6. Protocol: `academic-paper/references/revision_patch_protocol.md`. This section governs revision-mode invocations only — Phase 4 initial drafting and `academic-paper full` in-pair Phase 6→4 loops are unchanged (the full-mode loop is the Item 9 boundary, spec §5.2).

Your revision-invocation context carries the **anchored draft** (every block stamped `<!--block:BNNNN-->`) and its **block manifest** (`<draft>.block-manifest.json`: `base_draft_hash` + one `{block_id, old_hash, first_line_excerpt}` entry per block). The manifest is the ONLY legitimate source for every hash you emit.

**Emission rules (all machine-checked at apply time — a violation rejects the whole patch):**

1. **Write the patch as a sidecar file**, not fenced chat JSON: `phase6_*/revision_patch_round<N>.json` inside your write fence (#424 emission-format decision). Your chat output carries the human-facing revision log (the existing Revision Log table) and your provisional response items — never the patch body.
2. **Copy hashes, never compute them.** `base_draft_hash` and every per-op `old_hash` are mechanical copies from the block manifest. You cannot compute SHA-256 (all Bash denied, #134) — an invented or "remembered" hash fails at apply exactly like a stale one. Use `first_line_excerpt` to sanity-check you are naming the block you think you are.
3. **Closed op vocabulary**: `replace_block` / `insert_after` / `delete_block`. Each `block_id` appears in at most ONE op, in any role. Multi-block insertion goes inside one `insert_after.new_text`. No move op — express relocation as `delete_block` + `insert_after` (byte-identical relocations are machine-recognized as `pure_move`).
4. **`insert_after` carries the anchor's `old_hash`** (position is meaningful only relative to the anchor's content). The `DOC-BODY-START` sentinel (insert before the first body block) is the ONLY legal hash-less op shape.
5. **`new_text` MUST NOT contain `<!--block:` markers** — ID assignment is the apply script's exclusive authority. Citation discipline is NOT relaxed: every new citation in `new_text` carries the v3.7.1/v3.7.3 `<!--ref:slug--><!--anchor:kind:value-->` layers; the finalizer resolves them on its normal post-apply pass.
6. **`roadmap_item_ids` is required and non-empty on every op** — each edit publicly claims which reviewer concern it serves (Anti-Pattern 7 made visible).

**Pre-drafting escalation classification (§3.6 trigger layer 1).** BEFORE emitting any op, classify the round's roadmap items. If any item demands restructuring — section split/merge/reorder, a commitment with `commitment_type: restructure`, or a change you cannot express in the op vocabulary — do NOT emit a patch and do NOT silently fall back to a full draft. Emit only:

```
[PATCH-ESCALATION-REQUIRED: layer=pre_drafting, items=<comma-separated roadmap item IDs>, reason=<one line per item>]
```

and return control to the caller. The escalation decision (re-emit in full vs narrow the items) belongs to the user at the orchestrator's MANDATORY checkpoint, never to you. Only when the caller explicitly re-dispatches you with full re-emission confirmed do you produce a complete draft (that round is provenance-stamped `mode: full_reemission_escalated` downstream).

**Apply-failure retry (once).** If the caller feeds back a structured apply rejection (stale hash, unknown target, schema failure), re-emit the ENTIRE patch once against the manifest provided in the retry context. Do not patch the patch. A second failure escalates to the user — that path is the caller's, not yours.

**Role boundary (§3.5).** You emit; you never apply. You cannot run `ars_apply_revision_patch.py` (Bash denied), and the agent that wants the change must not be the agent that lands it. Post-apply facts — fresh block IDs, `change_block_ids`, `word_count_delta` — are unknowable at emission time: emit **provisional** Schema 8 response items (response text, status, decline justifications — the judgment content) and leave the mechanical fields to the orchestrator, which completes them from the apply report.

**Integrity-correction rounds (#89 Item 8).** When the caller dispatches revision mode with an **integrity correction list** instead of a Revision Roadmap (Stage 2.5 / 4.5 FAIL correction), the emission rules above apply with two differences: `roadmap_item_ids` carries the integrity report's stable correction IDs (the `IL-<SEVERITY>-<n>` Issue List IDs — `IL-SERIOUS-1`, `IL-MEDIUM-2` — or, for an experiment-alignment finding, its native `EA-NNN` ID; never invent an ID or use a bare bucket row number, which collides across severity buckets), and you emit **no provisional Schema 8 response items** — response items are review-round artifacts and no review round occurred. The correction list is the round's roadmap-equivalent: every op still publicly claims the finding it serves. Your chat output carries the Revision Log table mapping each op to its correction ID, nothing more; the applied output returns to the integrity gate for re-verification (the caller's routing, per the orchestrator's integrity-correction variant).
````

#### After

````markdown
<!--rs:PATCH-002-->
### ResearchSpec Current Owner

Replacement scope: `PATCH-002` for `academic-paper`.

In revision mode, emit a patch against the exact manuscript bytes supplied by
the caller. Validate the document against
`assets/shared/contracts/patch/revision_patch.schema.json` and use stable
`operation_id` values, block IDs, twelve-character `old_hash` preconditions,
the closed `replace_block`/`insert_after`/`delete_block` vocabulary, a revision
rationale, and non-empty roadmap traceability.

When annotations are in scope, each implemented annotation must be referenced
by an operation and represented in `annotation_mapping`. Non-edit dispositions
carry the answer, reason, or successor required by the schema and must not be
attached to an operation. The patch is the only machine-readable mapping; a
prose revision log may explain it but cannot replace it.

You emit the patch; you do not silently apply it or mutate ResearchSpec control.
The caller may review it, edit the manuscript manually, or invoke
`node scripts/apply-revision-patch.mjs` with explicit paths. A failed preflight
produces no output. After revision, expose only the boundary files needed by
another subflow through the owning `handoff.md`. Formal adequacy remains a
human-confirmed Gate in the owning `control.yaml`.

Current ResearchSpec owners:

- `assets/shared/contracts/patch/revision_patch.schema.json`
- `scripts/apply-revision-patch.mjs`
- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:PATCH-002-->
````

### REVIEW-012

- Anchor name: `paper.draft-writer.generator-contract-runtime`
- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/draft_writer_agent.md`
- Severity: `required`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `checklist`
- Replacement body SHA-256: `d57b76c09b323d5abe8569e57d27f74780066db0314ccd3f147bb04792a59a9a`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/agents/draft_writer_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `academic-pipeline/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `deep-research/references/cross-skill/academic-paper/agents/draft_writer_agent.md`
- Before SHA-256: `e63341155ff9ca906c4cdcadf2c49149d211c5cda6745813b54f684c8de8ff08`
- After SHA-256: `041aa07c3734db6c0e3b43e77344af36c6553efcd05cf3579ba2cfe89a1b6c3b`

#### Before

````markdown
> Authoritative system-prompt sub-sections for the v3.6.6 writer half of the contract-gated phase split. Used by `academic-paper full` mode only. Pinned by the orchestrator block in `academic-paper/SKILL.md` § "v3.6.6 Generator-Evaluator Contract Protocol". Schema 13.1 contract template: `shared/contracts/writer/full.json`. Design spec: `docs/design/2026-04-27-ars-v3.6.6-generator-evaluator-contract-design.md` §5.
````

#### After

````markdown
<!--rs:REVIEW-012-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-012` for `academic-paper`.

> This block is the authoritative writer-side system-prompt protocol for the
> `academic-paper full` generator/evaluator split. Resolve the frozen writer
> contract and the exact handoff-referenced Phase 4a/4b inputs and outputs through
> `researchspec/subflows/<instance>/handoff.md`. Preserve the paper-blind
> Phase 4a pre-commitment, paper-visible Phase 4b drafting, verbatim system-prompt
> subsections, data-delimiter rules, and lint checks below. Record an accepted
> Phase 4a output before Phase 4b consumes it, then record the Phase 4b draft.
> Return lint or contract failures to the gate helper for
> `researchspec/subflows/<instance>/control.yaml`; the writer and orchestrator do
> not write the owning handoff or Gate records directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-012-->
````

### DECISION-001

- Anchor name: `paper.intake.terminal-policy-passport`
- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/intake_agent.md`
- Severity: `required`
- Semantic role: `control_decision_record`
- Replacement shape: `checklist`
- Replacement body SHA-256: `4dcc50f1eb45e98cc22dc3aae9558fc7a77174bafcf0e925d32f611c9b02b6ab`
- ResearchSpec targets: `researchspec/profiles/academic-pipeline.yaml`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/agents/intake_agent.md`
- Before SHA-256: `66fffc1747a10574b1ba1cbacb3fdcb5d0e8ce221b60fc4e8c4114a1c31ea0c5`
- After SHA-256: `56e39f7cfa8e071269e648733f9c2a5ee9a33b219f67bfdd5d3bb12e082f1586`

#### Before

````markdown
- Answer `strict` → record `strict` in the PCR `Citation Verification` row, and ensure the Material Passport carries `terminal_policies.citation_existence: strict` at the point the passport is materialized or next updated in this run (corpus creation, adapter import, or pre-finalizer setup). The finalizer remains the sole policy *evaluator* — this step only writes the scholar's declared policy, never evaluates it.
- Answer `mark only`, or no answer → record `advisory (mark only, default)` in the PCR row and **write nothing to the passport** (per-key absence already means advisory; writing an explicit key would break byte-equivalence with pre-#392 runs for no semantic gain).
````

#### After

````markdown
<!--rs:DECISION-001-->
### ResearchSpec Current Owner

Replacement scope: `DECISION-001` for `academic-paper`.

- Answer `strict` → record `strict` in the PCR `Citation Verification` row and
  return the scholar's confirmed policy choice to the ResearchSpec decision
  runtime for `researchspec/subflows/<instance>/control.yaml`. The runtime
  validates that `strict` is a supported option in
  `researchspec/profiles/academic-pipeline.yaml` and exposes the accepted decision to the
  finalizer. This step selects policy; it never evaluates citations.
- Answer `mark only`, or no answer → record `advisory (mark only, default)` in
  the PCR row. Do not invent a decision-owning control record entry for silence; the workflow
  default remains advisory. No external input policy mutation is required in
  either branch.

Current ResearchSpec owners:

- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:DECISION-001-->
````

### SOURCE-001

- Anchor name: `paper.literature-strategist.corpus-passport`
- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/literature_strategist_agent.md`
- Severity: `required`
- Semantic role: `stable_source_contract`
- Replacement shape: `artifact_projection_block`
- Replacement body SHA-256: `3270a7d9cb706cfd6bd10c576e1174704b75e2798a875705e67116683309d15f`
- ResearchSpec targets: `researchspec/specs/sources.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/agents/literature_strategist_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/agents/literature_strategist_agent.md`, `academic-pipeline/references/cross-skill/academic-paper/agents/literature_strategist_agent.md`, `deep-research/references/cross-skill/academic-paper/agents/literature_strategist_agent.md`
- Before SHA-256: `c91c0b02261c8f02fd616f201a5531d6822ad17ce31dd2a79cc2fd36dec838a8`
- After SHA-256: `bcac30c57864a5630b2bfc6f55ce2f31fc6a29ef85e455800e603c955d425481`

#### Before

````markdown
When the input Material Passport carries a non-empty `literature_corpus[]`, this agent enters the **corpus-first, search-fills-gap** flow. The flow has five steps and four Iron Rules; the PRE-SCREENED block makes corpus utilisation reproducible. The merged `final_included` set feeds the Annotated Bibliography, Literature Matrix, Research Gap Identification, and Recommended Sources by Paper Section sections above without altering their formats.
````

#### After

````markdown
<!--rs:SOURCE-001-->
### ResearchSpec Current Owner

Replacement scope: `SOURCE-001` for `academic-paper`.

When `researchspec/specs/sources.yaml` contains included literature sources,
resolve their bibliography, screening, and full-text artifacts through
`researchspec/subflows/<instance>/handoff.md` and expose them to this agent
as a read-only `literature_corpus[]` working projection. Enter the existing
**corpus-first, search-fills-gap** flow using that projection. Preserve the five
steps, four Iron Rules, PRE-SCREENED reproducibility block, and the formats of
the Annotated Bibliography, Literature Matrix, Research Gap Identification, and
Recommended Sources by Paper Section. Consumer output may propose new source
candidates as artifacts, but this agent must not edit `sources.yaml` or the
handoff-referenced corpus in place.

Current ResearchSpec owners:

- `researchspec/specs/sources.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:SOURCE-001-->
````

### REVIEW-013

- Anchor name: `paper.peer-reviewer.evaluator-contract-runtime`
- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/peer_reviewer_agent.md`
- Severity: `required`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `checklist`
- Replacement body SHA-256: `92e27db8296188e5b36e229c70df643838efa3241b8ce077d543e3bc19dca9b1`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/agents/peer_reviewer_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/agents/peer_reviewer_agent.md`, `academic-pipeline/references/cross-skill/academic-paper/agents/peer_reviewer_agent.md`, `deep-research/references/cross-skill/academic-paper/agents/peer_reviewer_agent.md`
- Before SHA-256: `4ab16f5faffe69438ca13115b19eede4d3b4cea8bd173d4112910d9243820158`
- After SHA-256: `c908dcbfb336491f2d2d8785b3f25e6c981af80305e98b5e2893e1af1c7315b1`

#### Before

````markdown
> Authoritative system-prompt sub-sections for the v3.6.6 evaluator half of the contract-gated phase split. Used by `academic-paper full` mode only. Pinned by the orchestrator block in `academic-paper/SKILL.md` § "v3.6.6 Generator-Evaluator Contract Protocol". Schema 13.1 contract template: `shared/contracts/evaluator/full.json`. Design spec: `docs/design/2026-04-27-ars-v3.6.6-generator-evaluator-contract-design.md` §5.
>
> **`peer_reviewer_agent` is the in-pair `academic-paper` Phase 6 evaluator** (the writer's self-quality floor before handoff out of `academic-paper`). It is **not** the v3.6.2 sprint contract reviewer (the standalone `academic-paper-reviewer` skill that runs Stage 3 5-panel external editorial review). Both layers run in `academic-pipeline full` deployments; the v3.6.6 contract gate operates on this in-pair Phase 6 evaluator only.
````

#### After

````markdown
<!--rs:REVIEW-013-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-013` for `academic-paper`.

> This block is the authoritative evaluator-side system-prompt protocol for the
> `academic-paper full` generator/evaluator split. Resolve the frozen evaluator
> contract, the writer's handoff-referenced pre-commitment, the draft, and exact Phase
> 6a/6b artifacts through `researchspec/subflows/<instance>/handoff.md`.
> Preserve the distinction between this in-pair quality evaluator and the
> external Stage 3 reviewer panel, plus the paper-blind Phase 6a commitment,
> paper-visible Phase 6b evaluation, verbatim prompt sections, scoring plan,
> dissent rules, and lint checks below. Record accepted phase outputs in order
> and return blocking failures to the gate helper for
> `researchspec/subflows/<instance>/control.yaml`; do not write the owning
> handoff or control directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-013-->
````

### REVIEW-014

- Anchor name: `paper.revision-coach.commitment-ledger`
- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/revision_coach_agent.md`
- Severity: `required`
- Semantic role: `review_handoff_tracking`
- Replacement shape: `schema_projection_table`
- Replacement body SHA-256: `8a730526aba2d22bbbe5bcc66b87eeab5e4c5f631dd95234aa068a42134d7751`
- ResearchSpec targets: `researchspec/changes/<change-id>/change.md`, `assets/shared/contracts/patch/revision_patch.schema.json`, `researchspec/subflows/<instance>/work/annotation-intake/`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/agents/revision_coach_agent.md`
- Before SHA-256: `58ab269816913477f725577ef4eec70c4c805150153c59ebf2058f7a0920680b`
- After SHA-256: `9bb96da2af4f3333117aa4a272994180394b3c991a13dd9d428bcf298886706e`

#### Before

````markdown
5. Output: write the commitment list into `commitment_extracted` field of the Schema 11 row for that `concern_id`. At this stage each commitment object carries only the three extraction fields (`commitment_text` / `commitment_type` / `required_evidence_type`). The lifecycle fields `fulfillment_status` and `unfulfilled_rationale` are **nested inside the same object** but are **absent now** — they are appended per-object during revision execution and verified in re-review (Schema 11 nested-object shape, #268). Do not emit placeholder keys for them.
````

#### After

````markdown
<!--rs:REVIEW-014-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-014` for `academic-paper`.

5. Emit the extracted commitment list as review working material or as a
   boundary deliverable at an ordinary project path. If another subflow needs
   it, record its role, purpose, producer, consumer, and safe path in the owning
   `handoff.md`. Research-scope or claim commitments require a proposed
   `researchspec/changes/<change-id>/` package; manuscript-edit commitments may
   become roadmap traceability in an ARSU revision patch conforming to
   `assets/shared/contracts/patch/revision_patch.schema.json`.

When the source is a free-form annotated manuscript, use the owning revision
subflow's `work/annotation-intake/` directory. Preserve the complete base, raw
feedback, mechanical delta, stable annotation IDs, normalized interpretations,
and proposed patch mappings. Keep ambiguous or high-impact items pending human
clarification. This working directory does not create a separate freeze,
control record, or annotation lifecycle. If the normalized annotation set must
cross a subflow boundary,
write an explicit copy outside `researchspec/` and reference it in the handoff.

Current ResearchSpec owners:

- `researchspec/changes/<change-id>/change.md`
- `assets/shared/contracts/patch/revision_patch.schema.json`
- `researchspec/subflows/<instance>/work/annotation-intake/`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:REVIEW-014-->
````

### PATCH-003

- Anchor name: `paper.revision-patch-reference`
- Owner skill: `academic-paper`
- Source path: `academic-paper/references/revision_patch_protocol.md`
- Severity: `required`
- Semantic role: `revision_patch_protocol`
- Replacement shape: `patch_protocol_block`
- Replacement body SHA-256: `4027e85d43433c12dac1bf04ff078f1a27ac7fc4c79da0abd6d1f03133b112db`
- ResearchSpec targets: `assets/shared/contracts/patch/revision_patch.schema.json`, `scripts/apply-revision-patch.mjs`, `researchspec/subflows/<instance>/work/annotation-intake/`, `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/references/revision_patch_protocol.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/references/revision_patch_protocol.md`, `academic-pipeline/references/cross-skill/academic-paper/references/revision_patch_protocol.md`, `deep-research/references/cross-skill/academic-paper/references/revision_patch_protocol.md`
- Before SHA-256: `18dba4bb77ed7bc1b408655dfff094f53bc726e9575395c7d6c4d19b75f32cb3`
- After SHA-256: `5f4c1e10d057ed42353351a4c27cd38e1debf9388ec8871d1997cb59bb0f7b00`

#### Before

````markdown
**Spec:** `docs/design/2026-06-10-390-diff-patch-revision-mode-spec.md` (mechanism §3, coverage claim §4, escalation §3.6).
**Toolchain:** Slice A (#423) — `scripts/_block_parser.py`, `scripts/ars_anchorize_draft.py`, `scripts/ars_apply_revision_patch.py`, schemas under `shared/contracts/patch/`.
**Audience:** the pipeline orchestrator (Mode A) and any user running revision rounds phase-by-phase across sessions (Mode B). The commands below are the same in both modes — Mode A wraps them, Mode B types them.

**What this buys, stated honestly:** under patch apply, a block no operation names cannot be silently distorted, because no generation pass runs over it — that is a property of the apply script, not of the model. It does NOT make the edits themselves better, and structural rewrites are not patch-protected (they escalate, §3.6). Every summary of this feature must survive that sentence.

---

## Artifacts and naming

| Artifact | Produced by | Convention |
|---|---|---|
| Anchored draft | `ars_anchorize_draft.py` (in place) | every block carries `<!--block:BNNNN-->`; IDs never renumbered |
| Block manifest | same run, sidecar | `<draft>.block-manifest.json` — `base_draft_hash` + `{block_id, old_hash, first_line_excerpt}` per block; the ONLY legitimate hash source for a patch |
| Patch document | `draft_writer_agent` (revision invocation) | `phase6_*/revision_patch_round<N>.json`, schema `shared/contracts/patch/revision_patch.schema.json` |
| Revised draft | `ars_apply_revision_patch.py` | `--output` MUST be a new file (versioned artifact; the base is never modified) |
| Apply report | same run, sidecar | `<output>.apply-report.json` — ops applied, fresh block IDs, structural flags, `preserved_ratio` |

The apply report shares the revised draft's lifecycle: it is a **required input to re-review and the Stage 4.5 integrity gate** — re-reviewers read it to see exactly which blocks changed (`ops_applied[]`, `fresh_block_ids`, `pure_move_pairs`) and which are machine-guaranteed untouched.

## Mode B command sequence (one revision round)

```bash
# 1. Anchorize / refresh the manifest (idempotent; safe on legacy drafts).
#    Run at EVERY round entry, and rewrite nothing afterwards until apply —
#    any rewrite (including a finalizer pass) invalidates the manifest.
python scripts/ars_anchorize_draft.py draft.md

# 2. Hand the writer its revision context:
#    draft.md + draft.md.block-manifest.json + the round's Revision Roadmap.
#    The writer emits phase6_*/revision_patch_round1.json (never a full draft).

# 3. Apply — two-phase fail-closed; output must be a NEW file.
python scripts/ars_apply_revision_patch.py draft.md \
    phase6_revision/revision_patch_round1.json \
    --output draft.rev1.md

# 4. Run your normal post-revision steps (finalizer / citation checks)
#    on draft.rev1.md, then re-review with draft.rev1.md.apply-report.json
#    attached.
```

Exit codes: `0` applied · `2` Phase 1 rejection (structured failure report on stdout; base byte-untouched) · `3` structural refusal (see escalation) · `4` post-write self-check bug.

**On exit 2 (stale hash / unknown target / schema failure):** feed the failure report back to the writer for ONE re-emission of the whole patch against the current manifest. On a second failure, stop and decide: re-anchorize and retry the round, escalate to full re-emission, or abort. Never hand-edit a patch to force it through — a hash mismatch means the writer was looking at different text than the file holds.

**On exit 3 (structural flags):** the patch touches structure — heading rewrites/deletes, net section-count change, or `touched_ratio` strictly above **0.6** (the #424 ship decision; `insert_after` merely *anchored* on a heading is exempt — inserting body text under a section heading is routine, not structural). Read the flags in the refusal output, then either narrow the patch, or — if the structural change is intended — re-run with the acknowledgment recorded:

```bash
python scripts/ars_apply_revision_patch.py draft.md patch.json \
    --output draft.rev1.md --acknowledge-structural
```

`--acknowledge-structural` is a deliberate user decision, never a default; the flags stay recorded in the apply report either way. `--touched-ratio-threshold 1.0` disables the ratio trigger (the comparator is strict `>`); overriding 0.6 in pipeline runs requires a recorded user decision.

**Full re-emission (escalated rounds only):** when a round genuinely demands restructuring, the round runs as legacy full re-emission after explicit confirmation — never as a silent fallback. Afterwards, re-anchorize from scratch (a NEW ID generation; the old manifest and any old patches are dead) and record the round as `mode: full_reemission_escalated`.
````

#### After

````markdown
<!--rs:PATCH-003-->
### ResearchSpec Current Owner

Replacement scope: `PATCH-003` for `academic-paper`.

## ResearchSpec revision patch protocol

The adapted contract at
`assets/shared/contracts/patch/revision_patch.schema.json` is the only
manuscript patch schema. A revision patch is an ARSU revision input/output file,
not a ResearchSpec framework lifecycle record or lifecycle object.

One bounded mechanical application is:

1. Select an anchored Markdown manuscript and create a patch whose
   `base_draft_hash` matches those exact bytes.
2. Review the operation IDs, block targets, `old_hash` values, roadmap links,
   rationale, and any complete annotation mapping.
3. Run `node scripts/apply-revision-patch.mjs --base <base.md> --patch <patch.json>
   --output <revised.md>` and add `--report <summary.json>` only when a derived
   diagnostic summary is useful.
4. On any preflight failure, correct the inputs or revise manually. The helper
   creates no partial output and never changes a subflow control or handoff.

Untouched anchored blocks remain byte-identical under helper application. That
mechanical guarantee says nothing about whether edited text answers the review.
The current manuscript, response to reviewers, optional patch/summary, and
external review material may inform a formal revision Gate, but a human records
the verdict in the owning subflow `control.yaml`.

Annotation intake material is private under `work/annotation-intake/` by
default. Cross-subflow patch, manuscript, annotation, response, or report files
must use safe project-relative paths outside `researchspec/` and be listed by
role in the owning `handoff.md`.

Current ResearchSpec owners:

- `assets/shared/contracts/patch/revision_patch.schema.json`
- `scripts/apply-revision-patch.mjs`
- `researchspec/subflows/<instance>/work/annotation-intake/`
- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:PATCH-003-->
````

### IO-005

- Anchor name: `paper.skill.phase-boundary`
- Owner skill: `academic-paper`
- Source path: `academic-paper/SKILL.md`
- Severity: `recommended`
- Semantic role: `boundary_deliverable_contract`
- Replacement shape: `io_contract_block`
- Replacement body SHA-256: `6d7f1df45c82b6f94c531fead8f923aa1f1b05905ddbb8ecff1204cbdf9095b7`
- ResearchSpec targets: `researchspec/profiles/academic-pipeline.yaml`, `researchspec/subflows/<instance>/control.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/SKILL.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/SKILL.md`, `academic-pipeline/references/cross-skill/academic-paper/SKILL.md`, `deep-research/references/cross-skill/academic-paper/SKILL.md`
- Before SHA-256: `3bd2f9351b27b5857b7cec2bcaf47d51ba7356a7add6d378c7a6d095175f5a2e`
- After SHA-256: `88038f8a356b4b173d6419fb65a6c1855e5dbf0e9119ac71a7c4851f8bf97140`

#### Before

````markdown
In Mode B, **single-phase agents (Bucket A per `docs/design/2026-05-18-ars-v3.9.2-agent-phase-classification.md`) stay strictly within their assigned phase for writes**. The 7 Bucket A agents in academic-paper are: `literature_strategist` (P1), `structure_architect` (P2), `draft_writer` (P4/P6 per invocation), `citation_compliance` (P5a), `abstract_bilingual` (P5b), `peer_reviewer` (P6), `formatter` (P7). Reads from upstream phases are allowed.

Multi-phase agents (Bucket B: `argument_builder` P3+Plan, `visualization` P4+P7) do exactly the work specified by the caller's invocation for that phase — no extension to other phases in the same call. The v3.6.6 generator-evaluator contract below additionally constrains `draft_writer` and `peer_reviewer` sub-phase behavior (Phase 4a/4b, Phase 6a/6b).

Routing into Mode B requires explicit user signal — `/ars-<mode>` slash command or `[direct-mode]` prefix. Ambiguous cross-phase input defaults to clarification per `.claude/CLAUDE.md` Routing Discipline + `shared/references/intent_clarification_protocol.md`.

**Enforcement (v3.9.2):** Phase Boundary blocks on Bucket A agents + advisory verifier (`scripts/check_pipeline_integrity.py`) + a deterministic PreToolUse write-scope guard in hook-enabled runtimes (#134 rescope, PR #294). Multi-phase envelope remains forward-scope (#134 Slices 3-5).
````

#### After

````markdown
<!--rs:IO-005-->
### ResearchSpec Current Owner

Replacement scope: `IO-005` for `academic-paper`.

In phase-by-phase mode, the literature strategist, structure architect, draft
writer, citation compliance, bilingual abstract, peer review, and formatting
roles may write only the outputs declared by the selected route instructions. They may
read handoff-referenced upstream artifacts required by that work. The argument-building
and visualization roles may span their documented stages only when the current
frontier instructions explicitly select that work; one invocation does not
authorize work in another stage. The generator-evaluator contract continues to
constrain the draft-writer and peer-review call pairs within their selected
work.

Phase-by-phase routing requires an explicit user signal. Ambiguous cross-stage
material must be clarified before dispatch. The configured graph in
`researchspec/profiles/academic-pipeline.yaml`, the frontier in
`researchspec/subflows/<instance>/control.yaml`, and handoff-referenced inputs in
`researchspec/subflows/<instance>/handoff.md` define the permitted read and
write boundary.

Current ResearchSpec owners:

- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:IO-005-->
````

### PATCH-001

- Anchor name: `paper.skill.revision-patch-mode`
- Owner skill: `academic-paper`
- Source path: `academic-paper/SKILL.md`
- Severity: `required`
- Semantic role: `revision_patch_protocol`
- Replacement shape: `patch_protocol_block`
- Replacement body SHA-256: `c2578f839535b9ee5bd84a2c4a720c2f7325473bdc5a97baa06ee44bd05350b4`
- ResearchSpec targets: `assets/shared/contracts/patch/revision_patch.schema.json`, `scripts/apply-revision-patch.mjs`, `researchspec/subflows/<instance>/work/annotation-intake/`, `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/SKILL.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/SKILL.md`, `academic-pipeline/references/cross-skill/academic-paper/SKILL.md`, `deep-research/references/cross-skill/academic-paper/SKILL.md`
- Before SHA-256: `3746fd60636d23f14f9740192da44549c9fa0427537852d370a54d20acbdcde2`
- After SHA-256: `100f20cecd514970f27227c777b76f8f76e907d0a17a621efba8b9d6a8d6bece`

#### Before

````markdown
In revision mode, `draft_writer_agent` does NOT re-emit the complete paper. The round runs **anchorize → patch → deterministic apply → finalizer**, confining the regeneration surface to the blocks the revision explicitly touches (DELEGATE-52 blast-radius containment; spec `docs/design/2026-06-10-390-diff-patch-revision-mode-spec.md`):

1. **Anchorize** the draft (`scripts/ars_anchorize_draft.py` — idempotent, content-neutral): every block gets a stable `<!--block:BNNNN-->` marker; a block manifest (`base_draft_hash` + per-block `old_hash`) is regenerated. Nothing may rewrite the draft between this step and apply.
2. **The writer emits a patch document** (`shared/contracts/patch/revision_patch.schema.json`) as a sidecar file in its `phase6_*/` fence — block ops with hash preconditions copied from the manifest, each op tracing to `roadmap_item_ids`. See `agents/draft_writer_agent.md` § Patch-Document Revision Emission.
3. **Deterministic apply** (`scripts/ars_apply_revision_patch.py`): two-phase fail-closed — one stale hash rejects the whole patch with the base byte-untouched; untouched blocks are preserved byte-identical by construction. Structural shapes (heading rewrites/deletes, section-count change, touched-ratio > 0.6) refuse without an explicit acknowledge that only the §3.6 escalation checkpoint may grant. The apply report (`preserved_ratio`, ops, fresh block IDs, structural flags) is a **required input to re-review** alongside the revised draft.
4. **Escalation, never silent fallback:** restructure-demanding rounds go to a MANDATORY user checkpoint; a confirmed full re-emission round is provenance-stamped `mode: full_reemission_escalated` and the draft is re-anchorized afterwards (new ID generation).

Orchestrated runs follow `pipeline_orchestrator_agent.md` § Revision-Round Patch Sequencing; Mode B (phase-by-phase manual) users run the same scripts by hand — exact commands in `references/revision_patch_protocol.md`. Honest boundary, stated once: patch mode removes the silent-distortion channel for text the revision does not touch; it does not make the revision itself better. The `academic-paper full` in-pair Phase 6→4 loop is NOT patch-adopted (its Phase 4b lint requires a full `## Draft Body`; Item 9 boundary, spec §5.2/§7).
````

#### After

````markdown
<!--rs:PATCH-001-->
### ResearchSpec Current Owner

Replacement scope: `PATCH-001` for `academic-paper`.

In `academic-paper` revision mode, the writer may emit a bounded revision patch
instead of rewriting the complete manuscript. The adapted ARSU contract at
`assets/shared/contracts/patch/revision_patch.schema.json` is the sole manuscript
patch schema. It preserves stable operation IDs, block IDs and `old_hash`
preconditions, replace/insert/delete operations, annotation dispositions,
revision rationale, and roadmap traceability.

The patch and manuscript are explicit files selected by the caller. They are not
handoff-referenced ResearchSpec runtime entities. When safe mechanical application is
useful, run `node scripts/apply-revision-patch.mjs` with explicit `--base`, `--patch`,
and `--output` paths and, optionally, `--report`. The helper validates the whole
patch before creating output. Schema errors, stale hashes, unknown blocks,
duplicate targets, injected block markers, or incomplete annotation mappings
leave the selected manuscript and destination unchanged.

Annotation intake normally stays under the owning revision subflow's
`work/annotation-intake/` directory. If an annotation set, patch, revised
manuscript, response, or report must cross a subflow boundary, write it to an
ordinary project path outside `researchspec/` and record its role and path in
that subflow's `handoff.md`.

Mechanical success does not settle academic adequacy. The revision Gate remains
human-confirmed in the owning subflow `control.yaml`. Manual editing and
human-confirmed full re-emission remain valid revision paths; the helper is an
optional safety tool and never mutates control state.

This patch protocol does not apply to the `academic-paper full` in-pair Phase
6→4 loop when that loop's contract requires a complete `## Draft Body`.

Current ResearchSpec owners:

- `assets/shared/contracts/patch/revision_patch.schema.json`
- `scripts/apply-revision-patch.mjs`
- `researchspec/subflows/<instance>/work/annotation-intake/`
- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:PATCH-001-->
````

### REVIEW-010

- Anchor name: `paper.skill.generator-evaluator-contract`
- Owner skill: `academic-paper`
- Source path: `academic-paper/SKILL.md`
- Severity: `required`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `checklist`
- Replacement body SHA-256: `0f353e001a0f7d32f653a7c916404787e62e47687c45c58bee1e2defb99ece32`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/SKILL.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/SKILL.md`, `academic-pipeline/references/cross-skill/academic-paper/SKILL.md`, `deep-research/references/cross-skill/academic-paper/SKILL.md`
- Before SHA-256: `f946f4b2af4d0f2988d516e7be7441defc3f3b1973f80e8a545acb57260bbf94`
- After SHA-256: `3709da69037c54573bc3ed7098a9c97815d25b9b2ea211cf0405e307e8010ccd`

#### Before

````markdown
> Authoritative orchestration block for the v3.6.6 contract-gated phase splits inside `academic-paper full` mode. Schema 13.1 since v3.6.6 (`shared/sprint_contract.schema.json`). Templates: `shared/contracts/writer/full.json` + `shared/contracts/evaluator/full.json`. Design spec: `docs/design/2026-04-27-ars-v3.6.6-generator-evaluator-contract-design.md` §5.
````

#### After

````markdown
<!--rs:REVIEW-010-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-010` for `academic-paper`.

> This block defines the `academic-paper full` generator/evaluator split. Resolve
> the frozen `writer_full` and `evaluator_full` contract JSON plus every Phase
> 4a/4b and 6a/6b artifact through
> `researchspec/subflows/<instance>/handoff.md`. Preserve the four-call
> paper-blind/paper-visible separation, mode exclusions, baseline fields, system
> prompt text, lint rules, and writer/evaluator role distinction described
> below. Record each accepted phase output before it is consumed downstream;
> return lint, disagreement, or failure-condition results to the responsible gate
> helper for `researchspec/subflows/<instance>/control.yaml`. The orchestrator may
> instantiate allowed invocation fields but must not mutate the frozen contract
> or write the owning handoff or control directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-010-->
````

### REVIEW-011

- Anchor name: `paper.skill.rebuttal-audit-boundary`
- Owner skill: `academic-paper`
- Source path: `academic-paper/SKILL.md`
- Severity: `recommended`
- Semantic role: `boundary_deliverable_provenance`
- Replacement shape: `artifact_projection_block`
- Replacement body SHA-256: `259f15b05905e32e311f315273b583ec463ceff1591f5c5aa3a5b300dd9a162b`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/SKILL.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/SKILL.md`, `academic-pipeline/references/cross-skill/academic-paper/SKILL.md`, `deep-research/references/cross-skill/academic-paper/SKILL.md`
- Before SHA-256: `9c9e7b8667bdd300ce840cc9ef5290ceba98e67aa5428ee9d60ecc90a402ea70`
- After SHA-256: `3ff15e30d70f2c8f06f7806cd50694a7856b2c07d51cae1d481cecfa29e4087d`

#### Before

````markdown
**IRON RULE — integrity boundary (no false certification):** `rebuttal-audit` reuses `revision_coach_agent`'s comment-parsing capability, but a standalone invocation runs **outside** the pipeline and therefore never passes Stage 4.5 final integrity. It **MUST NOT** emit a Schema 11 `commitment_extracted` ledger, **MUST NOT** write to the Material Passport, and **MUST NOT** mark the package `ready_to_submit` or any verified status. Producing a Schema 11 artifact would falsely imply the response entered the pipeline's traceability system. The output is an advisory QA report only.
````

#### After

````markdown
<!--rs:REVIEW-011-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-011` for `academic-paper`.

**IRON RULE — advisory integrity boundary:** standalone `rebuttal-audit` may
reuse comment parsing, but it remains outside Stage 4.5 integrity and produces
only an advisory response-letter QA artifact. Return the coverage table, gap
list, tone/evidence risks, and suggestions for the producing subflow to record
in
`researchspec/subflows/<instance>/handoff.md`. It MUST NOT emit verified
commitment status, apply a draft patch, mark a delivery package ready, or
write ResearchSpec authority files. If its findings imply a change in
accepted response strategy or claim scope, propose that change and wait for a
human decision recorded through
`researchspec/subflows/<instance>/control.yaml`; the audit itself never
certifies acceptance.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-011-->
````

### STATE-001

- Anchor name: `paper.skill.material-passport-state`
- Owner skill: `academic-paper`
- Source path: `academic-paper/SKILL.md`
- Severity: `required`
- Semantic role: `subflow_control_boundary`
- Replacement shape: `protocol_block`
- Replacement body SHA-256: `68027da058d430ad6645b944a1658831b54e344669f465813bb316511634e80c`
- ResearchSpec targets: `researchspec/profiles/academic-pipeline.yaml`, `researchspec/subflows/<instance>/control.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/SKILL.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/SKILL.md`, `academic-pipeline/references/cross-skill/academic-paper/SKILL.md`, `deep-research/references/cross-skill/academic-paper/SKILL.md`
- Before SHA-256: `a4996c0d2b682365c4675cb5bde7b106fdad529c301bff428e303b418615f63d`
- After SHA-256: `eaabcbbfe2157fa00a7330afa989b913c32ce13bf8da97077e05161809633c1f`

#### Before

````markdown
**Mode A — orchestrator-driven (default):** `pipeline_orchestrator_agent` (in `academic-pipeline` skill) runs all phases end-to-end with state tracking via Material Passport.

**Mode B — phase-by-phase (cross-session resume):** User invokes one agent per phase across sessions for long-running projects. Common pattern: write the draft in one session, return next week to citation-check / abstract / peer-review independently.
````

#### After

````markdown
<!--rs:STATE-001-->
### ResearchSpec Current Owner

Replacement scope: `STATE-001` for `academic-paper`.

Resume only from the selected subflow's control and handoff. Read the project
profile when pipeline graph rules apply, use status and directed instructions to
derive the current frontier, and let the CLI perform every lifecycle, Gate,
Decision, override, or transition change. External files may provide explicit
inputs but never replace current control authority.

Current ResearchSpec owners:

- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:STATE-001-->
````

### REVIEW-003

- Anchor name: `reviewer.agent.devils_advocate_reviewer.sprint-contract-phase-model`
- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md`
- Severity: `recommended`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `io_contract_block`
- Replacement body SHA-256: `ffc07c1e0fcc29b3398854c1d59b45b7aaa8a71a76ff452dc2a41949563cc042`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md`, `deep-research/references/cross-skill/academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md`
- Before SHA-256: `8f4f7fb28a599cbccf8ec5b8030db24d4d60bd3b3c18cb9541dcb9edf1d25d00`
- After SHA-256: `1b1ae83ea4e8f05cf20df5e37a3323983f8d91bb7ea28a9e7eb2be84b07de68b`

#### Before

````markdown
You operate in two phases when invoked under a sprint contract. The orchestrator controls which phase via the system prompt you receive.
````

#### After

````markdown
<!--rs:REVIEW-003-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-003` for `academic-paper-reviewer`.

When invoked under a sprint contract, you operate in two strictly separated
phases. The orchestrator selects the phase through the system prompt and resolves
the sprint contract and prior phase artifacts through
`researchspec/subflows/<instance>/handoff.md`. Phase 1 is a
paper-content-blind adversarial pre-commitment: define the challenge standard
without seeing the paper. Its exact output must be handoff-referenced before Phase 2.
Phase 2 receives that output as read-only data and stress-tests the visible paper
against the committed standard without silently changing the plan. Return each
phase output to the producing subflow for handoff recording and return protocol
violations or blocking adversarial findings to the review gate helper for
`researchspec/subflows/<instance>/control.yaml`. Do not write the owning handoff
or control directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-003-->
````

### REVIEW-004

- Anchor name: `reviewer.agent.sprint-contract-phase-model`
- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/agents/domain_reviewer_agent.md`
- Severity: `recommended`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `io_contract_block`
- Replacement body SHA-256: `4e7e29131d366eb028e981243f8d94c87427759ddc9ef7868bedec83cb41c016`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper-reviewer/agents/domain_reviewer_agent.md`
- Before SHA-256: `8f4f7fb28a599cbccf8ec5b8030db24d4d60bd3b3c18cb9541dcb9edf1d25d00`
- After SHA-256: `9ae06574118e6c2c234c6684726efcbb64181e1825312ff200a0108bc3b8b8d7`

#### Before

````markdown
You operate in two phases when invoked under a sprint contract. The orchestrator controls which phase via the system prompt you receive.
````

#### After

````markdown
<!--rs:REVIEW-004-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-004` for `academic-paper-reviewer`.

When invoked under a sprint contract, you operate in two strictly separated
phases selected by the orchestrator's system prompt. Resolve the frozen contract
and phase artifacts through
`researchspec/subflows/<instance>/handoff.md`. Phase 1 is a
paper-content-blind domain-accuracy pre-commitment and must be handoff-referenced before
Phase 2. Phase 2 receives that exact output as read-only data, examines the paper
for field-specific accuracy and significance, and may deviate only through the
declared dissent channel. Return both outputs to the producing subflow for
handoff recording and send protocol
violations or blocking domain findings to the review gate helper for
`researchspec/subflows/<instance>/control.yaml`; do not edit either authority
file directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-004-->
````

### REVIEW-005

- Anchor name: `reviewer.agent.eic.sprint-contract-phase-model`
- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/agents/eic_agent.md`
- Severity: `recommended`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `io_contract_block`
- Replacement body SHA-256: `c62258b56e8458fab591429b2d6ddb262be834ff3667cee1160437c3bc80aeb1`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper-reviewer/agents/eic_agent.md`
- Before SHA-256: `8f4f7fb28a599cbccf8ec5b8030db24d4d60bd3b3c18cb9541dcb9edf1d25d00`
- After SHA-256: `9369d5d3d37cfd67d4ba3bb68962f8caddfbca9714fea54f5e278f0b40eb1065`

#### Before

````markdown
You operate in two phases when invoked under a sprint contract. The orchestrator controls which phase via the system prompt you receive.
````

#### After

````markdown
<!--rs:REVIEW-005-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-005` for `academic-paper-reviewer`.

When invoked under a sprint contract, you operate in two strictly separated
phases selected by the orchestrator's system prompt. Resolve the frozen contract
and phase artifacts through
`researchspec/subflows/<instance>/handoff.md`. Phase 1 is a
paper-content-blind editorial pre-commitment covering the acceptance dimensions,
decision precedence, and oversight standard; record it before Phase 2. Phase 2
receives that exact output as read-only data and applies the committed editorial
standard to the visible paper. Return both outputs to the producing subflow for
handoff recording and return
protocol violations, panel-level blockers, and the editorial verdict to the
review gate helper for `researchspec/subflows/<instance>/control.yaml`; do not
edit the owning handoff or control directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-005-->
````

### REVIEW-006

- Anchor name: `reviewer.agent.methodology_reviewer.sprint-contract-phase-model`
- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/agents/methodology_reviewer_agent.md`
- Severity: `recommended`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `io_contract_block`
- Replacement body SHA-256: `68624c4914b15aa4019cda9cc0cddaad6b4b81bec11fb60a915476e77c7372ac`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper-reviewer/agents/methodology_reviewer_agent.md`
- Before SHA-256: `8f4f7fb28a599cbccf8ec5b8030db24d4d60bd3b3c18cb9541dcb9edf1d25d00`
- After SHA-256: `3b0b967dedf5fa6445d61b1dbb34120d30b9bf5838220aa143f9277b2358a041`

#### Before

````markdown
You operate in two phases when invoked under a sprint contract. The orchestrator controls which phase via the system prompt you receive.
````

#### After

````markdown
<!--rs:REVIEW-006-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-006` for `academic-paper-reviewer`.

When invoked under a sprint contract, you still operate in two strictly
separated phases. The orchestrator selects the phase through the system prompt
and resolves the sprint contract and phase artifacts through
`researchspec/subflows/<instance>/handoff.md`. Phase 1 is the
paper-content-blind methodology-rigor pre-commitment described below; its exact
output must be handoff-referenced before Phase 2 begins. Phase 2 receives that handoff-referenced
output as read-only data and performs the paper-visible methodology review
without silently changing the scoring plan. Return each phase output to the
producing subflow for handoff recording, and return protocol violations or
blocking methodology findings to the review gate helper for
`researchspec/subflows/<instance>/control.yaml`.
Do not write the owning handoff or Gate attempts directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-006-->
````

### REVIEW-007

- Anchor name: `reviewer.agent.perspective_reviewer.sprint-contract-phase-model`
- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/agents/perspective_reviewer_agent.md`
- Severity: `recommended`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `io_contract_block`
- Replacement body SHA-256: `4a502f7dcb796a66a859a70c599f562557bc384ea333af118f459dcee916f754`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper-reviewer/agents/perspective_reviewer_agent.md`
- Before SHA-256: `8f4f7fb28a599cbccf8ec5b8030db24d4d60bd3b3c18cb9541dcb9edf1d25d00`
- After SHA-256: `9380cf38edf7da0623d79ec3e49f2e039dcdd857ed3136139c036f23fb3b30c0`

#### Before

````markdown
You operate in two phases when invoked under a sprint contract. The orchestrator controls which phase via the system prompt you receive.
````

#### After

````markdown
<!--rs:REVIEW-007-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-007` for `academic-paper-reviewer`.

When invoked under a sprint contract, you operate in two strictly separated
phases selected by the orchestrator's system prompt. Resolve the frozen contract
and phase artifacts through
`researchspec/subflows/<instance>/handoff.md`. Phase 1 is a
paper-content-blind cross-disciplinary pre-commitment focused on relevance,
framing, transferability, and overlooked perspectives; record it before Phase
2. Phase 2 receives that exact output as read-only data and evaluates the visible
paper without silently changing the plan or taking over the devil's-advocate
role. Return both outputs to the producing subflow for handoff recording and
send protocol violations or blocking perspective findings to the review gate helper for
`researchspec/subflows/<instance>/control.yaml`; do not write either authority
file directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-007-->
````

### REVIEW-008

- Anchor name: `reviewer.reference.rereview-commitment-verification`
- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/references/re_review_mode_protocol.md`
- Severity: `required`
- Semantic role: `review_handoff_tracking`
- Replacement shape: `gate_rule_block`
- Replacement body SHA-256: `258435dda9ecb5abe38c531808bf4da3fb6574b6f5d6eba392d12868f5adaaff`
- ResearchSpec targets: `assets/shared/contracts/patch/revision_patch.schema.json`, `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/references/cross-skill/academic-paper-reviewer/references/re_review_mode_protocol.md`, `academic-paper-reviewer/references/re_review_mode_protocol.md`
- Before SHA-256: `7c8c2df7ae376490050837455ab372d71a8f81db66ccfb4cc29c6cb7f27f888c`
- After SHA-256: `ae38161c2ff0f763b6f5ff38160c3c8bc4e3aaf5220491220c49f9841fcb8362`

#### Before

````markdown
### Commitment Ledger Verification (Kong A1 / v3.11)

This step runs **for every Schema 11 row** (any priority) that carries a non-empty `commitment_extracted` list from `revision_coach_agent` Step 3.5. It is independent of the Priority 1/2/3 Traceability Rule above — every parsed reviewer comment may produce commitments, and every commitment must be verified, regardless of the parent concern's priority.

For each commitment, verify per-commitment `fulfillment_status`:

- `fulfilled` — the `required_evidence_type` is present and substantively addresses the `commitment_text`. Verification site depends on `required_evidence_type`:
  - For `new_section` / `new_figure` / `new_table` / `new_citation` / `methods_paragraph` / `discussion_paragraph` / `prose_edit` — verify against the **revised manuscript** at `revision_location`. `prose_edit` items (typo fixes, terminology clarifications, equation formatting, citation-style corrections) are sentence- or paragraph-level changes; verify the specific text at `revision_location` rather than expecting a new structural block.
  - For `acknowledgment_only` — verify against the **Response to Reviewers (Schema 8)** instead of the manuscript diff. `acknowledgment_only` items by definition do not require manuscript changes; expecting a manuscript diff would produce false `not-fulfilled` classifications. The response letter must explicitly acknowledge or address the commitment in writing.
  - For `other` — the evidence type is intentionally underspecified (escape hatch for genuinely uncategorizable commitments). Surface a soft **`EVIDENCE_TYPE_UNSPECIFIED`** advisory (advisory only, **not** a hard block): if `revision_location` is empty, prompt the author to specify it so the re-reviewer can verify; if `revision_location` is already populated, the advisory simply flags that the evidence type was left uncategorized — verify at the stated location. This is distinct from `COMMITMENT_GAP` (which fires on missing rationale for a non-`fulfilled` status); `EVIDENCE_TYPE_UNSPECIFIED` fires whenever `required_evidence_type == other`, regardless of `fulfillment_status`.
- `partial` — required evidence exists but does not fully address the commitment (e.g., experiment run on dataset Y when reviewer asked for dataset X; 3-seed std error when 5-seed was requested with rationale provided).
- `not-fulfilled` — required evidence is absent (rationale presence is a separate axis — see `COMMITMENT_GAP` rule below).
- `explicitly-rejected-with-rationale` — author has explicitly declined to address the commitment; status name implies rationale, but `unfulfilled_rationale` is still the field that carries the actual rationale text (per Schema 11 Validation rule).

For any commitment object with `fulfillment_status` ∈ `{partial, not-fulfilled, explicitly-rejected-with-rationale}` where the object's `unfulfilled_rationale` is empty or missing, surface a **`COMMITMENT_GAP`** entry in re-review output (advisory only, **not** a hard block — author retains final responsibility per `POSITIONING.md`). This mirrors the Schema 11 Validation rule: any non-`fulfilled` status requires a rationale on the same commitment object. Because `fulfillment_status` and `unfulfilled_rationale` are nested fields of the commitment object (not separate parallel lists), there is no index-walking step and no way to pair a status with the wrong commitment — the #268 desync failure mode is structurally absent.

**A populated `residual_action` alongside one or more commitment objects with `fulfillment_status: fulfilled` is not a contradiction.** `residual_action` operates at the concern level (forward-looking: what still remains for the whole concern), while `fulfillment_status` is per-commitment (carried on each commitment object). A concern can have some commitments fully fulfilled and still carry a concern-level residual action (e.g., the core ablation was added but the concern's broader generalization claim still needs a follow-up experiment flagged in `residual_action`). Do **not** raise a gap or inconsistency flag merely because `residual_action` is non-empty while one or more commitments are `fulfilled` — see `shared/handoff_schemas.md` Schema 11 `residual_action` convention (a).

This section is the verification analog of `revision_coach_agent` Step 3.5 (Kong A1). Per-commitment lifecycle gating is what closes the Kong §7.4.3 commitment-fulfillment gap.
````

#### After

````markdown
<!--rs:REVIEW-008-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-008` for `academic-paper-reviewer`.

### Commitment verification against revision evidence

Run this step for every commitment-bearing concern. Resolve the original review,
roadmap, current revised manuscript, response, and any optional patch or
annotation evidence from explicit inputs and the producer's `handoff.md`. An
ARSU patch must conform to
`assets/shared/contracts/patch/revision_patch.schema.json`, but schema validity
or a successful mechanical application is not proof of academic fulfillment.

For each commitment, assign one `fulfillment_status`:

- `fulfilled` — the required evidence exists and substantively satisfies it;
- `partial` — evidence exists but only partly satisfies it;
- `not-fulfilled` — required evidence is absent;
- `explicitly-rejected-with-rationale` — the author declined it with reasons.

For a non-fulfilled status, preserve the corresponding rationale. Verify prose,
citations, figures, tables, methods, and acknowledgments against their actual
boundary files rather than a framework-managed apply or resolution report. Return
the verification report through this subflow's `handoff.md`; a human records
the formal Gate verdict in the owning `control.yaml`.

Current ResearchSpec owners:

- `assets/shared/contracts/patch/revision_patch.schema.json`
- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-008-->
````

### REVIEW-009

- Anchor name: `reviewer.reference.sprint-contract-protocol`
- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/references/sprint_contract_protocol.md`
- Severity: `required`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `artifact_projection_block`
- Replacement body SHA-256: `194f321732c1233b0d56f1ba8f69884508f4bef6e98ae553453a73d89bcc80dd`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/references/cross-skill/academic-paper-reviewer/references/sprint_contract_protocol.md`, `academic-paper-reviewer/references/sprint_contract_protocol.md`, `academic-pipeline/references/cross-skill/academic-paper-reviewer/references/sprint_contract_protocol.md`, `deep-research/references/cross-skill/academic-paper-reviewer/references/sprint_contract_protocol.md`
- Before SHA-256: `18f2761d610a2273d90963b19f490963f8600c8aa8b581e60fcab15c153f799c`
- After SHA-256: `7c8555149bdd61d04f4514915e0444390a13069ce2f85195ad88d527a23d0f1d`

#### Before

````markdown
A reviewer sprint contract is a machine-checkable pre-registered acceptance criterion. The orchestrator loads a frozen template, inlines runtime fields (`generated_at`, optional `agent_amendments`), and drives each reviewer through a paper-content-blind Phase 1 followed by a paper-visible Phase 2. The synthesizer then runs a three-step mechanical protocol over the `panel_size` reviewer outputs to emit an editorial decision.

This protocol exists to destroy the "read the paper, then rationalise the scoring standard" drift path. The load-bearing mechanism is the **physical separation of calls**: Phase 1 never sees paper content.

## 2. Two-phase reviewer call

For each reviewer in `range(panel_size)`:

1. **Prepare contract.** Load template from `shared/contracts/<domain>/<mode>.json`. Populate `generated_at` (ISO-8601 UTC). Optionally populate `agent_amendments` (field-specific notes from `field_analyst_agent`). Run `check_sprint_contract.py` on the in-memory object; abort on error.
2. **Phase 1 call (paper-content-blind).**
   - System prompt: the `### Phase 1 — Paper-content-blind pre-commitment` sub-section of the reviewer agent's `## v3.6.2 Sprint Contract Protocol` block.
   - User content: contract JSON + paper metadata ONLY (`title`, `field`, `word_count`).
   - Expected output: `## Contract Paraphrase`, `## Scoring Plan`, terminal `[CONTRACT-ACKNOWLEDGED]` tag.
3. **Phase 1 output lint.** See §4 below.
4. **Phase 2 call (paper-visible).**
   - System prompt: the `### Phase 2 — Paper-visible review` sub-section of the same `## v3.6.2 Sprint Contract Protocol` block.
   - User content: contract JSON (re-injected) + Phase 1 output wrapped in `<phase1_output>...</phase1_output>` data delimiter + full paper.
   - Expected output: optional `## Scoring Plan Dissent`, `## Dimension Scores`, `## Failure Condition Checks`, `## Review Body`, `## Editorial Decision`.
5. **Phase 2 output lint.** See §5 below.
6. **Panel cardinality invariant.** After all reviewers complete, verify `len(usable_phase2_outputs) == panel_size`. If any reviewer was dropped, emit `[PANEL-SHRUNK]` and abort the round (see §6).
7. Feed usable Phase 2 outputs into synthesizer (see §7).
````

#### After

````markdown
<!--rs:REVIEW-009-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-009` for `academic-paper-reviewer`.

A reviewer sprint contract is a frozen, machine-checkable acceptance baseline.
Resolve the selected template through
`researchspec/subflows/<instance>/handoff.md`, deep-copy it for permitted
runtime fields, and record the instantiated contract before reviewer calls.
The protocol prevents post-hoc standard rationalization by physically separating
paper-blind Phase 1 from paper-visible Phase 2.

For every reviewer required by `panel_size`:

1. **Prepare the contract.** Preserve baseline acceptance dimensions, failure
   conditions, measurement procedure, override ladder, mode, stage, contract id,
   baseline version, and panel size. Add only allowed runtime fields such as
   `generated_at` and bounded agent amendments. Validate deterministically; on
   failure, stop before dispatch and return the finding to the review gate helper.
2. **Run Phase 1 paper-blind.** Provide only the handoff-referenced contract and paper
   metadata. Require the role-specific contract paraphrase, scoring plan, and
   terminal acknowledgement.
3. **Lint and record Phase 1.** Apply the existing structural and content-blind
   checks. Retry once with the specific lint gap; a second failure aborts that
   reviewer. Record the accepted Phase 1 output before Phase 2.
4. **Run Phase 2 paper-visible.** Re-inject the same contract, the exact handoff-referenced
   Phase 1 output inside the read-only data delimiter, and the manuscript.
5. **Lint and record Phase 2.** Require the declared scores, failure-condition
   checks, review body, and decision; retain the dissent limits and retry policy.
6. **Enforce panel cardinality.** If usable Phase 2 outputs do not equal
   `panel_size`, emit `[PANEL-SHRUNK]`, return a blocking review-gate finding,
   and abort the round rather than synthesizing a smaller panel.
7. Pass only the complete handoff-referenced Phase 2 panel to the editorial synthesizer.

The orchestrator returns contract and phase artifacts to the producing subflow
for handoff recording and returns Gate findings to
`researchspec/subflows/<instance>/control.yaml`; it does not edit either file.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-009-->
````

### IO-006

- Anchor name: `reviewer.skill.phase-boundary`
- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/SKILL.md`
- Severity: `recommended`
- Semantic role: `boundary_deliverable_contract`
- Replacement shape: `io_contract_block`
- Replacement body SHA-256: `426a948c715f989ce3ca157b3dbde0cf0d4adf13f03f6b1dd8fa932fde224f36`
- ResearchSpec targets: `researchspec/profiles/academic-pipeline.yaml`, `researchspec/subflows/<instance>/control.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/cross-skill/academic-paper-reviewer/SKILL.md`, `academic-paper-reviewer/SKILL.md`, `academic-pipeline/references/cross-skill/academic-paper-reviewer/SKILL.md`, `deep-research/references/cross-skill/academic-paper-reviewer/SKILL.md`
- Before SHA-256: `705235af035ad4891b186f930f741fc99f46bf5f4dae3e5d0b77e281da29cc27`
- After SHA-256: `d54c3cc26779415a75c66a631b07faad15c324df67232576eb0582878f85897f`

#### Before

````markdown
In Mode B, **single-phase agents (Bucket A per `docs/design/2026-05-18-ars-v3.9.2-agent-phase-classification.md`) stay strictly within their assigned phase for writes**. The 6 Bucket A agents in academic-paper-reviewer are: `eic_agent`, `methodology_reviewer`, `domain_reviewer`, `perspective_reviewer`, `devils_advocate_reviewer` (all Phase 1 panel) + `editorial_synthesizer` (Phase 2 synthesis). Reading the full paper draft is **expected** for all reviewers — without context they cannot evaluate.

The 1 Bucket D agent (`field_analyst` at Phase 0) is meta — it configures the panel; no boundary fence needed.

The v3.6.2 Sprint Contract Protocol (paper-blind Phase 1 + paper-visible Phase 2 + data delimiter) additionally constrains all reviewer agents' within-phase discipline. Phase Boundary (phase scope) and Sprint Contract (within-phase paper-blind/paper-visible discipline) both apply — neither overrides the other.

Routing into Mode B requires explicit user signal — `/ars-<mode>` slash command or `[direct-mode]` prefix. Ambiguous cross-phase input defaults to clarification per `.claude/CLAUDE.md` Routing Discipline + `shared/references/intent_clarification_protocol.md`.

**Enforcement (v3.9.2):** Phase Boundary blocks on Bucket A agents + advisory verifier (`scripts/check_pipeline_integrity.py`) + a deterministic PreToolUse write-scope guard in hook-enabled runtimes (#134 rescope, PR #294). Multi-phase envelope remains forward-scope (#134 Slices 3-5).
````

#### After

````markdown
<!--rs:IO-006-->
### ResearchSpec Current Owner

Replacement scope: `IO-006` for `academic-paper-reviewer`.

In phase-by-phase mode, the review panel and editorial synthesizer may write only
the outputs declared by the selected review route instructions. Reviewers are expected
to read the complete handoff-referenced manuscript needed for evaluation; read access
does not extend their write scope. `field_analyst` remains a panel-configuration
role and may emit only its declared configuration artifact. The Sprint Contract
paper-blind and paper-visible call discipline remains active inside these stage
boundaries; neither rule overrides the other.

Phase-by-phase routing requires an explicit user signal. Ambiguous cross-stage
material must be clarified before dispatch. The configured graph in
`researchspec/profiles/academic-pipeline.yaml`, the frontier in
`researchspec/subflows/<instance>/control.yaml`, and handoff-referenced inputs in
`researchspec/subflows/<instance>/handoff.md` define the permitted read and
write boundary.

Current ResearchSpec owners:

- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:IO-006-->
````

### REVIEW-001

- Anchor name: `reviewer.skill.rereview-schema11`
- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/SKILL.md`
- Severity: `required`
- Semantic role: `review_handoff_tracking`
- Replacement shape: `checklist`
- Replacement body SHA-256: `ba8a503d486e5bea68009f175365af848ce49eb4b45b79dd67061a8a08374eab`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/references/cross-skill/academic-paper-reviewer/SKILL.md`, `academic-paper-reviewer/SKILL.md`, `academic-pipeline/references/cross-skill/academic-paper-reviewer/SKILL.md`, `deep-research/references/cross-skill/academic-paper-reviewer/SKILL.md`
- Before SHA-256: `d3e0caa77bc3053aa43336f81ce022ff312362f4618320db26d3db729c51b733`
- After SHA-256: `82494847e18c6800f56274dc8943f8f09ebfd556f8728f52f212a43d425715f1`

#### Before

````markdown
Dedicated mode for Pipeline Stage 3' — verifies whether revisions address first-round review comments. Uses R&R Traceability Matrix (Schema 11) with Author's Claim + Verified? columns.

**Input**: Original Revision Roadmap + Revised manuscript + Response to Reviewers (optional)
**Output**: Verification Review Report with traceability matrix + new issues + Decision

> See `references/re_review_mode_protocol.md` for full verification logic, output format template, and Socratic guidance details.
````

#### After

````markdown
<!--rs:REVIEW-001-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-001` for `academic-paper-reviewer`.

Dedicated mode for Pipeline Stage 3'. Re-review verifies each first-round
concern against the current revised manuscript and the response to reviewers.
When the revision producer exposed an ARSU patch, annotation set, or helper
summary, resolve those files by role and safe project-relative path from the
producer subflow's `handoff.md`; do not infer them from directory names or
another authority file.

**Input:** the original Revision Roadmap, revised manuscript, response to
reviewers when present, prior review material, and any explicitly handed-off
patch or annotation evidence relevant to the concern.

**Output:** a Verification Review Report at an ordinary project path outside
`researchspec/`, recorded as an output in this subflow's `handoff.md`. The
reviewer assesses semantic fulfillment independently. Mechanical application or
annotation disposition never proves that a concern was answered. A human
records the formal re-review Gate verdict in the owning subflow `control.yaml`.

> See `references/re_review_mode_protocol.md` for the verification rules,
> output format, and Socratic guidance.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-001-->
````

### REVIEW-002

- Anchor name: `reviewer.skill.sprint-contract`
- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/SKILL.md`
- Severity: `required`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `checklist`
- Replacement body SHA-256: `5ba5d6ecfe58cb158c40108e936acbff63d3435aa2654afba7d82eed41981303`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/references/cross-skill/academic-paper-reviewer/SKILL.md`, `academic-paper-reviewer/SKILL.md`, `academic-pipeline/references/cross-skill/academic-paper-reviewer/SKILL.md`, `deep-research/references/cross-skill/academic-paper-reviewer/SKILL.md`
- Before SHA-256: `298ff2410ac39704bbef06179f6b97818d0716e074aedbf4c28719aee43ede2e`
- After SHA-256: `8eed7542b5d63903c76839f6ebf2effb3bfe6c1e30604ccc41b3dffa4d50137e`

#### Before

````markdown
- **Schema 13 sprint contract.** Template-driven acceptance criteria with `panel_size`, `acceptance_dimensions`, `failure_conditions` (with `severity` precedence + `cross_reviewer_quantifier` panel-relative thresholds), `measurement_procedure`, optional `override_ladder`, bounded `agent_amendments`. Validator: `scripts/check_sprint_contract.py`. Schema: `shared/sprint_contract.schema.json`.
````

#### After

````markdown
<!--rs:REVIEW-002-->
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
<!--/rs:REVIEW-002-->
````

### GATE-001

- Anchor name: `pipeline.claim-audit.output-contract`
- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/claim_ref_alignment_audit_agent.md`
- Severity: `required`
- Semantic role: `gate_policy`
- Replacement shape: `gate_rule_block`
- Replacement body SHA-256: `c4b2d202928cc03ae4872c0e6873ca95cc5e5819dc6e43044f25752fb7e3d579`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/agents/claim_ref_alignment_audit_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/agents/claim_ref_alignment_audit_agent.md`, `academic-pipeline/agents/claim_ref_alignment_audit_agent.md`, `deep-research/references/cross-skill/academic-pipeline/agents/claim_ref_alignment_audit_agent.md`
- Before SHA-256: `c879665cdb2c55aa75c9c8493988fa201ee146b78e0e9c3ecdcdcee7ea206008`
- After SHA-256: `918eb1d9e76265f7070135ef38e453bf3391cf50d65fdeeda13c981a34d8dfdb`

#### Before

````markdown
Per audit run, populate the six aggregates:
````

#### After

````markdown
<!--rs:GATE-001-->
### ResearchSpec Current Owner

Replacement scope: `GATE-001` for `academic-pipeline`.

Per audit run, emit one immutable claim-audit artifact containing all six
aggregates listed below plus the pass-through claim-intent inputs and any Stage 6
self-reflection appendix. Record the artifact's role, safe path, purpose,
producer, intended consumer, and sampling limits in the owning subflow handoff at
`researchspec/subflows/<instance>/handoff.md`. Return HIGH-WARN constraint
violations and other configured blockers to the claim-integrity gate helper for
`researchspec/subflows/<instance>/control.yaml`; keep LOW/MED warnings as findings
without silently promoting them. The audit agent does not mutate claim
contracts, the owning handoff, or the owning-control Gate attempts.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:GATE-001-->
````

### GATE-002

- Anchor name: `pipeline.orchestrator.submission-package-gate`
- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Severity: `recommended`
- Semantic role: `gate_policy`
- Replacement shape: `gate_rule_block`
- Replacement body SHA-256: `6eb338975acf1056e2b28ac2892defcde513538848346d22493777775950623a`
- ResearchSpec targets: `researchspec/subflows/<instance>/control.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-pipeline/agents/pipeline_orchestrator_agent.md`, `deep-research/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Before SHA-256: `42d9ea2b008ebe3229aa685f60ff584be9ea2250879a5180f1392ce7f11b8591`
- After SHA-256: `cf6d64b53c9ff57c2d5cd47be1bbacf158b7d2b0fabfd4e618b126d2f4bebf36`

#### Before

````markdown
1. **Resolve the policy.** Read `terminal_policies.submission_package` from the Material Passport. Key absence — or absence of the whole `terminal_policies` object — resolves to `advisory` (the same per-key runtime convention as the existing keys). ALWAYS pass the resolved value explicitly: the CLI is never run policy-less in the pipeline (an unflagged run stamps `policy_slug: null` = a standalone unevaluated report, which can never satisfy the freshness guard below).
2. **Run the verifier** on the package directory: `python scripts/verify_submission_package.py <package_dir> --policy <resolved>` plus `--passport` / `--venue-profile` / `--join-map` when the run has them — the SAME input set the freshness invocation (step 5) will carry, or the inputs fingerprint can never match.
3. **Gate on stdout tokens, NEVER on exit codes.** Exit 1 also covers nonterminal advisory/heuristic fails (a strict-mode heuristic fail exits 1 with NO terminal token and must not block — heuristic findings never promote, structurally). Match each token as a line PREFIX, not full-line equality — the emitted lines carry a `strict_eligible_fails=<ids>` / `strict_eligible_not_checked=<ids>` suffix. The terminal signals are exactly:
   - `TERMINAL-BLOCK policy=submission_package` (a strict-eligible check FAILED under `strict`) → return the package to the formatter fix loop, **bounded: 2 fix rounds**, then surface to the scholar (mirrors the revision-loop cap philosophy). One round = dispatch the formatter to remediate the named findings, then re-run the verifier; if the 2nd round still emits the token, STOP and surface — never a 3rd. Never carry a verdict across rounds.
   - `VERIFICATION-INCOMPLETE` (a strict-eligible check is NOT-CHECKED under `strict`) → blocks emission like a fail DOES (fail-closed §5.2: a missing parser or input must not waive the one check class the scholar opted into blocking on) — but its remediation is NOT the formatter fix loop: a missing venue profile or parser is not a formatter-fixable defect. Remediation, stated plainly to the scholar: declare a venue profile (under `strict`, Family B checks without one are strict-eligible NOT-CHECKED), or — the other way out — flip `submission_package` back to `advisory` and re-finalize.
4. **Advisory path:** after the verifier writes its report, dispatch the formatter ONCE MORE in append-only mode to write the `Submission Package Advisories` section into `provenance_summary.md` from the report's findings (any fail / warn / NOT-CHECKED — see `formatter_agent.md`); then the pipeline completes. This re-entry is advisory transcription, not a content revision (no manuscript bytes change; Invariant 13 preserved). Byte-equivalence holds for non-opting users: no manuscript, ref-marker, or formatted-artifact bytes change — the report file and the advisories section are the only additions.
5. **Report reuse REQUIRES the freshness guard.** Before ever reusing an existing report (resume, re-entry, second finalization pass), run `--check-freshness --policy <resolved>` first, WITH the same `--venue-profile` / `--passport` / `--join-map` arguments the reuse context carries (the guard compares an inputs fingerprint too — a report produced under a different venue profile is stale). `STALE-REPORT` (fingerprint, inputs, or policy mismatch; null-stamped; missing/unreadable) → re-run the verifier; NEVER evaluate a stale report (§5.2 — the package-level analog of the `policy_hash` stamp). A FRESH report re-emits its verdict (token + exit semantics identical to a live run) — gate on that re-emitted token exactly as in step 3; "fresh" alone is never a pass.
6. **Recompute each pass; nothing cached.** The gate verdict is a pure function of the CURRENT passport policy and the CURRENT package bytes — recomputed at every finalization pass and across every `resume_from_passport` re-entry (the C-V6(h) mirror). A previously-granted emission never survives a policy flip or a package edit without re-passing the gate.
````

#### After

````markdown
<!--rs:GATE-002-->
### ResearchSpec Current Owner

Replacement scope: `GATE-002` for `academic-pipeline`.

1. **Resolve the policy.** Read supported submission-package policy values from
   `researchspec/profiles/academic-pipeline.yaml`. Use the latest human-confirmed choice for
   this run from `researchspec/subflows/<instance>/control.yaml`; absence
   resolves to `advisory`. Always pass the resolved value explicitly to the
   deterministic verifier. The orchestrator selects policy but never
   re-evaluates package findings itself.
2. **Resolve and verify the package inputs.** Resolve the formatted manuscript,
   figures, tables, supplementary material, venue profile, provenance inputs,
   and prior verifier reports by explicit handoff role and path through
   `researchspec/subflows/<instance>/handoff.md`. Run the local package
   verifier with the resolved policy and exact input set so its package and
   inputs fingerprints are reproducible. Return the new report to the producing
   subflow for handoff recording.
3. **Gate on structured verifier tokens, never on exit code alone.** Under
   `strict`, `TERMINAL-BLOCK policy=submission_package` starts a formatter repair
   loop bounded to two rounds; after the second failure, stop and surface the
   findings. `VERIFICATION-INCOMPLETE` also blocks, but missing policy inputs or
   parsers are not formatter-fixable: ask the scholar to provide the missing
   input or choose advisory policy. Return every pass, warning, incomplete, and
   blocking outcome to the submission-package gate helper for
   `researchspec/subflows/<instance>/control.yaml`.
4. **Preserve the advisory path.** After a report is handoff-referenced, dispatch the
   formatter once in append-only mode to copy package advisories into
   `provenance_summary.md`. This may add the report and advisories section but
   must not change manuscript bytes or reference markers. Record the updated
   Record the updated provenance summary as an updated boundary deliverable.
5. **Require freshness before reuse.** A resume, re-entry, or later finalization
   pass may reuse a report only after the verifier confirms the current package,
   input-set, and policy fingerprints. Stale, unreadable, null-policy, or
   mismatched reports are re-run; a fresh report still re-emits and re-evaluates
   its verdict. Never infer pass merely from freshness.
6. **Recompute every pass.** The gate result is a function of current handoff-referenced
   package bytes, current resolved inputs, and the current accepted policy.
   Package edits or policy changes invalidate prior permission. Do not cache a
   previously granted delivery result across resume or finalization.

The orchestrator returns artifacts, human choices, and Gate findings to their
owning subflow and CLI; it does not edit the handoff, Decision records, or Gate
attempts directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:GATE-002-->
````

### HANDOFF-001

- Anchor name: `pipeline.orchestrator.schema-handoff-table`
- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Severity: `required`
- Semantic role: `handoff_projection`
- Replacement shape: `schema_projection_table`
- Replacement body SHA-256: `d1a6f5470479398326cebbff6cca6acdd556524710c2389bb24b17351e6d342f`
- ResearchSpec targets: `researchspec/specs/project.md`, `researchspec/specs/sources.yaml`, `researchspec/specs/claims.yaml`, `researchspec/specs/manuscript.yaml`, `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`, `assets/shared/contracts/patch/revision_patch.schema.json`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-pipeline/agents/pipeline_orchestrator_agent.md`, `deep-research/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Before SHA-256: `c4da59716b0f456089bd4e96ca36de57011f33eeca6c40296efa82564f89f465`
- After SHA-256: `6ea0a7cb5f64b9806e598611f4e60cc2cd3a30fe78469445500088ac0e65607e`

#### Before

````markdown
**All artifacts must carry a Material Passport (Schema 9)** with `origin_skill`, `origin_mode`, `origin_date`, `verification_status`, and `version_label`. From v3.7.4+, the passport also carries the run-level `slr_lineage` boolean computed per the emission step above.
````

#### After

````markdown
<!--rs:HANDOFF-001-->
### ResearchSpec Current Owner

Replacement scope: `HANDOFF-001` for `academic-pipeline`.

Record every boundary input and output in the owning subflow's
`researchspec/subflows/<instance>/handoff.md`. Each entry identifies its role,
type, safe project-relative path, purpose, producer or intended consumer, and
relevant limits. The referenced file remains an ordinary project file outside
`researchspec/`; external metadata may stay in that file but does not become
ResearchSpec authority.

Place stable research intent, source identity, accepted claims, and manuscript
structure in their four owning specs. Place formal Gate attempts, Decisions,
and the active frontier in the owning `control.yaml`. Manuscript revision
operations may use the ARSU revision patch contract, but the patch remains a
stateless boundary file and creates no separate ResearchSpec lifecycle.

Current ResearchSpec owners:

- `researchspec/specs/project.md`
- `researchspec/specs/sources.yaml`
- `researchspec/specs/claims.yaml`
- `researchspec/specs/manuscript.yaml`
- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
- `assets/shared/contracts/patch/revision_patch.schema.json`
<!--/rs:HANDOFF-001-->
````

### PATCH-004

- Anchor name: `pipeline.orchestrator.revision-patch-toolchain`
- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Severity: `required`
- Semantic role: `revision_patch_protocol`
- Replacement shape: `patch_protocol_block`
- Replacement body SHA-256: `90ba6240b0ce635923b8789ad56ec57a67f77844a2a26774581cde0d4c183255`
- ResearchSpec targets: `assets/shared/contracts/patch/revision_patch.schema.json`, `scripts/apply-revision-patch.mjs`, `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-pipeline/agents/pipeline_orchestrator_agent.md`, `deep-research/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Before SHA-256: `cd54fc8af9aab880c01c0cbc083475c7dffdc0f0a16c83873c46017f26fc3878`
- After SHA-256: `159a2aea83c9d1e193f124a88ce1b661be259f3edc002d5682c54c90b88fdd14`

#### Before

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

#### After

````markdown
<!--rs:PATCH-004-->
### ResearchSpec Current Owner

Replacement scope: `PATCH-004` for `academic-pipeline`.

When an `academic-pipeline` revision child dispatches `academic-paper` revision
mode, the child may produce a patch conforming to
`assets/shared/contracts/patch/revision_patch.schema.json`. The patch, revised
manuscript, response to reviewers, and optional derived summary are ordinary
files: keep private working copies below that child's `work/`, and expose only
required boundary deliverables at safe project paths through the child's
`handoff.md`.

`node scripts/apply-revision-patch.mjs` is an optional stateless application helper.
Invoke it only with explicit base, patch, output, and optional report paths. It
validates all operations and annotation mappings before atomically creating the
destination. It does not read the pipeline profile, mutate `control.yaml` or
`handoff.md`, or decide whether the revision is academically complete. Manual
revision remains valid.

Each revision child has its own start confirmation and formal Gates. After the
producer finishes, the current manuscript and relevant boundary evidence return
through the handoff. A human records the revision Gate verdict in the owning
child `control.yaml`; the parent advances only under the profile's declared
join and transition rules. Structural re-emission, scope changes, and other
research choices follow the same explicit confirmation discipline.

Current ResearchSpec owners:

- `assets/shared/contracts/patch/revision_patch.schema.json`
- `scripts/apply-revision-patch.mjs`
- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:PATCH-004-->
````

### STATE-004

- Anchor name: `pipeline.orchestrator.reset-boundary-ledger`
- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Severity: `required`
- Semantic role: `subflow_control_boundary`
- Replacement shape: `protocol_block`
- Replacement body SHA-256: `8ce21ff901760108b379ccd9c835e8a7a785c23726cec4252a9eef4c4c3ac085`
- ResearchSpec targets: `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-pipeline/agents/pipeline_orchestrator_agent.md`, `deep-research/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Before SHA-256: `72382a607b0750669bffe9274ede6c7f76e64853b606432c80f13122c85fb760`
- After SHA-256: `55e9710edf25135aaea61c72cb61f28508ea7a769ddbcce1971a6c7fc48d727d`

#### Before

````markdown
1. `state_tracker` stages a new `kind: boundary` entry for `reset_boundary[]` (Schema 9). Entry matches `shared/contracts/passport/reset_ledger_entry.schema.json` `#/$defs/boundary`.
2. Orchestrator computes `hash` using the normative byte serialization defined in protocol doc §"The reset boundary protocol" step 2: JSON Canonical Form (RFC 8785) per entry, LF-separated, new entry appended with `hash` set to placeholder `"000000000000"`, SHA-256 first 12 lowercase hex. Write the computed hash back into the new entry, then append to the ledger. Follow the protocol doc exactly — any deviation breaks cross-session resume.
3. If the checkpoint co-occurs with a MANDATORY user decision (e.g., Stage 3 review outcome, Stage 5 finalization format), set `pending_decision` on the new entry. Each option is an object with `value` (branch identifier), `next_stage` (stage to route to, or `null` to terminate), and optional `next_mode`. `next` on the boundary entry is still populated as a best-guess default but must NOT be used to auto-advance — on resume the orchestrator looks up the chosen `value` in `options[]` and routes via that option's `next_stage`/`next_mode` (see §Resume Mode obligations).
4. In the checkpoint notification, orchestrator emits — as a distinct block below the Decision Dashboard but above the continue/pause prompt:

   ```
   [PASSPORT-RESET: hash=<hash>, stage=<completed>, next=<next>]

   ### Resume Instruction
   - Passport file: <path>
   - To continue, start a fresh Claude Code session and invoke:
     resume_from_passport=<hash>
   - Continuing in-session defeats the token-savings intent of `ARS_PASSPORT_RESET=1`.
   ```

   `<hash>` is 12 lowercase hex characters per `reset_ledger_entry.schema.json` — the schema is authoritative for the format.

5. Orchestrator halts after emission. For `systematic-review` mode, orchestrator refuses any in-session `continue` and repeats the Resume Instruction. For other modes, an in-session `continue` is honored once but the orchestrator uses ONLY the passport ledger as input to the next stage (no replay of prior turns).

**Iron rules (reset boundary):**

1. Flag OFF produces byte-identical output to pre-v3.6.3 for every mode.
2. Ledger append-only. Re-runs append new `kind: boundary` entries with bumped `version_label`; resume adds `kind: resume` entries; prior entries are never deleted, reordered, or mutated.
3. Hash is computed over the JCS-serialized, LF-separated ledger with `hash` set to placeholder `"000000000000"` on the new entry. Any deviation from the protocol doc's byte-serialization rules breaks cross-implementation interoperability.
4. The `[PASSPORT-RESET: ...]` tag is the sole machine-stable handoff anchor. The `### Resume Instruction` subsection is for user ergonomics.
5. Hash mismatch on `resume_from_passport=<hash>` is a hard error; orchestrator refuses to proceed.
6. A `boundary` is consumed only by appending a `kind: resume` entry with matching `consumes_hash`. Double-resume (second resume of an already-consumed boundary) is a hard error.
7. MANDATORY checkpoints (Stage 2.5 / 4.5, review decisions, Stage 5) remain MANDATORY even when reset co-occurs. Integrity gates are never diluted. If the boundary carries `pending_decision`, resume must re-prompt the user; `next` is advisory. Actual routing comes from the matched option's `next_stage`/`next_mode`, not from the boundary `next` field.
8. `collaboration_depth_agent` observer fires on FULL checkpoints as before; its output is included in the checkpoint notification regardless of reset state. Observer state does NOT cross reset boundaries.
9. Resume consumption MUST hold an exclusive advisory lock on the passport file for the entire read-check-append sequence (acquire the lock on the "Acquire passport lock" obligation, hold across the read-ledger, no-prior-resume check, and resume-entry append steps, release only after the append is durable). Releasing the lock between the no-prior-resume check and the resume-entry append reopens the double-resume race this rule exists to prevent. Non-POSIX implementations that cannot provide OS-level exclusion MUST refuse to resume rather than degrade silently (fail with an explicit error surfaced to the user). See §"Concurrency model" in the protocol doc.
````

#### After

````markdown
<!--rs:STATE-004-->
### ResearchSpec Current Owner

Replacement scope: `STATE-004` for `academic-pipeline`.

Checkpoint by recording the produced artifacts and advancing only through current ResearchSpec Gate and transition CLI actions. Do not write or append an ARS external input. When an external external input is supplied later, import it as explicit evidence and preserve the original bytes unchanged.
Checkpoint authority remains in `researchspec/subflows/<instance>/control.yaml`.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:STATE-004-->
````

### STATE-005

- Anchor name: `pipeline.orchestrator.resume-runtime`
- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Severity: `required`
- Semantic role: `subflow_control_boundary`
- Replacement shape: `protocol_block`
- Replacement body SHA-256: `d81167bc2b4f7993261896370686f5979c5f7abe04f6307c958004f92aaa8174`
- ResearchSpec targets: `researchspec/subflows/<instance>/control.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-pipeline/agents/pipeline_orchestrator_agent.md`, `deep-research/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Before SHA-256: `c8adfde9beb5b3fac35351b03b749cbd4102b469601dae18a026480f5b53a758`
- After SHA-256: `3d011e18d28950470cdda90567bb9cdd718542dcc08d9384754e328c52067bec`

#### Before

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

#### After

````markdown
<!--rs:STATE-005-->
### ResearchSpec Current Owner

Replacement scope: `STATE-005` for `academic-pipeline`.

Existing project materials are ordinary mid-entry inputs:

1. Select explicit safe project-relative paths outside `researchspec/` and state
   the role, type, purpose, and relevant limits of each input.
2. Request current mid-entry route instructions and verify only the prerequisites
   required by the chosen entry point.
3. Present Skill, mode, inputs, outputs, formal Gates, risk, and cost; start only
   after a fresh human confirmation.
4. Record the actual input roles and paths in the new subflow handoff.
5. Keep all prior Gate, Decision, checkpoint, and completion claims outside the
   new control. They may inform verification but cannot satisfy current rules.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:STATE-005-->
````

### ARTIFACT-001

- Anchor name: `pipeline.state-tracker.version-passport`
- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/state_tracker_agent.md`
- Severity: `recommended`
- Semantic role: `boundary_deliverable_provenance`
- Replacement shape: `artifact_projection_block`
- Replacement body SHA-256: `f0c8057204781318976940736df40e9bdb8c407d4afea0931608ea3a85849cfd`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-pipeline/agents/state_tracker_agent.md`
- Before SHA-256: `eb48ce56ef73b0581071ff2d2d383a45f562b4258980ce910035f67cf2fe1cfd`
- After SHA-256: `de2f08e4ecf142cff961170c63eeaf627df1dbefb6649949ceaff6e8cedd9507`

#### Before

````markdown
Every material artifact produced by the pipeline carries a version label. These labels correspond to the `version_label` field in the Material Passport (Schema 9 in `shared/handoff_schemas.md`).

| Material | Version Format | Example | Schema Reference |
|----------|---------------|---------|-----------------|
| Research output | `research_v{N}` | `research_v1` (initial), `research_v2` (after keyword expansion) | Schema 1-3 |
| Paper draft | `paper_draft_v{N}` | `paper_draft_v1` (initial), `paper_draft_v2` (post-review revision) | Schema 4 |
| Integrity report | `integrity_{mid|final}_v{N}` | `integrity_mid_v1`, `integrity_final_v1` | Schema 5 |
| Review report | `review_v{N}` | `review_v1` (initial review), `review_v2` (re-review after revision) | Schema 6 |
| Revision roadmap | `roadmap_v{N}` | `roadmap_v1` (first review), `roadmap_v2` (re-review) | Schema 7 |
| Revision | `revision_v{N}` | `revision_v1` (first revision round) | Schema 8 |

**Rules**:
- Version numbers are monotonically increasing (never reused)
- `redo` command increments the version of the affected stage's output
- All versions are preserved (no overwriting) — enables rollback and audit trail
- The `current_version` pointer indicates which version is active
- Cross-references between materials use explicit version labels (e.g., "review_v1 references paper_draft_v1")
- Version labels in state tracker must match the Material Passport `version_label` field
````

#### After

````markdown
<!--rs:ARTIFACT-001-->
### ResearchSpec Current Owner

Replacement scope: `ARTIFACT-001` for `academic-pipeline`.

Boundary deliverables remain ordinary project files outside `researchspec/`.
The producing subflow records each actual output in its handoff with a unique
role, type, safe project-relative path, purpose, producer or intended consumer,
and relevant limits. ResearchSpec does not assign another file identity, copy
the file, or manage its version history. The owning control records only
the subflow's lifecycle and formal decisions.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:ARTIFACT-001-->
````

### STATE-006

- Anchor name: `pipeline.state-tracker.runtime-owner`
- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/state_tracker_agent.md`
- Severity: `required`
- Semantic role: `subflow_control_boundary`
- Replacement shape: `protocol_block`
- Replacement body SHA-256: `a24e9d17ec4d30aa24c958fe882d260187edf3d52ad91e39f3b352a11bf1b7ae`
- ResearchSpec targets: `researchspec/profiles/academic-pipeline.yaml`, `researchspec/subflows/<instance>/control.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-pipeline/agents/state_tracker_agent.md`
- Before SHA-256: `af2c12271685216e4047e8bf9797f886641df29709779b5310c612e5dced4d5c`
- After SHA-256: `2a9fa37acf454a59cf6f8907c9d2aee95c96c8b188e02286d4ffbbfdb28a3c74`

#### Before

````markdown
The State Tracker is the **single source of truth** for pipeline state. No other agent may directly modify pipeline state variables.

### Write Access Control

| Agent | Can Update | Cannot Update |
|-------|-----------|---------------|
| `pipeline_orchestrator` | Request state changes via `request_update(field, value)` | Direct state mutation |
| `state_tracker` | All fields (sole writer) | N/A (is the writer) |
| `integrity_verification` | `integrity_report` field only (via `submit_report()`) | `pipeline_state`, `current_stage`, materials |
| `collaboration_depth_agent` | `collaboration_depth_history[]` append-only (via `append_observer_report()`); never writes `pipeline_state`, `current_stage`, blocking flags, or materials | All other fields |
| Sub-skill agents | Their own `stage_output` (via `submit_output()`) | Any other field |

### Dialogue log references (v3.3.0)

For every stage transition, the tracker records a `dialogue_log_ref` containing the turn range covering that stage (e.g. `turns #47..#91`). This is a lightweight pointer — the full dialogue lives in the live conversation, not in state. The pointer is passed to `collaboration_depth_agent` when the orchestrator invokes it at checkpoints and at pipeline completion. Turn-range entries are immutable once a stage closes.

### `collaboration_depth_history[]`

Append-only list. Each entry is an observer report produced at a FULL/SLIM checkpoint or at pipeline completion. Entries never gate state transitions — they are stored for the final Process Record's "Collaboration Depth Trajectory" chapter only. The tracker must reject any write request that attempts to turn observer output into a blocking condition.

### State Update Protocol

1. Requesting agent calls `request_update(field, new_value, reason)`
2. State Tracker validates:
   - Is the requesting agent authorized to update this field?
   - Is the state transition valid? (e.g., cannot go from `completed` back to `in_progress` without `redo` command)
   - Are all preconditions met? (e.g., cannot advance to Stage 3 without Stage 2 output)
3. If valid -> apply update, log the change with timestamp and requester
4. If invalid -> reject with reason, notify requesting agent
````

#### After

````markdown
<!--rs:STATE-006-->
### ResearchSpec Current Owner

Replacement scope: `STATE-006` for `academic-pipeline`.

`researchspec/subflows/<instance>/control.yaml` is the sole runtime authority for
the selected pipeline or child instance. ARSU roles may inspect current context,
prepare outputs, recommend Gate verdicts, and propose transitions, but only the
ResearchSpec CLI validates and commits control changes.

### Write Access Control

| Role | May return | Must not do |
| --- | --- | --- |
| pipeline orchestrator | route, branch, and transition recommendation | edit a control or authorize a child |
| state tracker | progress summary and structured mutation proposal | persist lifecycle, Gate, Decision, or transition state |
| integrity and review roles | reports and Gate recommendations | confirm or advance a Gate |
| phase agents | declared boundary outputs and handoff updates | write another subflow's private work or control |

For a formal change, request current instructions, validate the profile and
actual handoff roles, obtain any required human confirmation, and execute the
single owning CLI action. Keep dialogue summaries and observer reports as
working material or explicit boundary files; they do not advance the frontier.

Current ResearchSpec owners:

- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:STATE-006-->
````

### SOURCE-002

- Anchor name: `pipeline.reference.literature-consumer-runtime`
- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/references/literature_corpus_consumers.md`
- Severity: `required`
- Semantic role: `stable_source_contract`
- Replacement shape: `artifact_projection_block`
- Replacement body SHA-256: `9e48469a81a6a9fb39e39a667dbca040d891dd1975686f50228d41f3c8a52f6f`
- ResearchSpec targets: `researchspec/specs/sources.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/references/literature_corpus_consumers.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/references/literature_corpus_consumers.md`, `academic-pipeline/references/literature_corpus_consumers.md`, `deep-research/references/cross-skill/academic-pipeline/references/literature_corpus_consumers.md`
- Before SHA-256: `590a6addf7c5280e4096aacd741ce56750e4ac47885a7a0db3ff9ac307477123`
- After SHA-256: `6f7d8155230470a8d9d54872aba810ebba1126dfad64dfa6e454515e7690b5bb`

#### Before

````markdown
This is the contract every literature-reading consumer agent must follow. The v3.6.4 input port (`shared/contracts/passport/literature_corpus_entry.schema.json`) defines what enters a Material Passport; this document defines how Phase 1 agents read it.
````

#### After

````markdown
<!--rs:SOURCE-002-->
### ResearchSpec Current Owner

Replacement scope: `SOURCE-002` for `academic-pipeline`.

This is the contract every literature-reading consumer follows after
ResearchSpec has projected source records from
`researchspec/specs/sources.yaml` and resolved associated corpus artifacts
through `researchspec/subflows/<instance>/handoff.md`. The resulting
read-only `literature_corpus[]` working payload retains citation keys, titles,
authors, dates, source pointers, inclusion state, and trust metadata required by
the protocol below. Consumers apply the existing corpus-first,
search-fills-gap flow, four Iron Rules, PRE-SCREENED block, and graceful parse
fallback without mutating the payload, the source contract, or the owning
handoff.

Current ResearchSpec owners:

- `researchspec/specs/sources.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:SOURCE-002-->
````

### STATE-007

- Anchor name: `pipeline.reference.passport-reset-protocol`
- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/references/passport_as_reset_boundary.md`
- Severity: `required`
- Semantic role: `subflow_control_boundary`
- Replacement shape: `protocol_block`
- Replacement body SHA-256: `6d53a42d14508cb3bbc294d541617e70906cfc11d43684238a0ade9303bf714c`
- ResearchSpec targets: `researchspec/subflows/<instance>/control.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/references/passport_as_reset_boundary.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/references/passport_as_reset_boundary.md`, `academic-pipeline/references/passport_as_reset_boundary.md`, `deep-research/references/cross-skill/academic-pipeline/references/passport_as_reset_boundary.md`
- Before SHA-256: `f5373d307584b4ace1e95535a60b5b54f489d30a47bb67a2d00ee9454b8114aa`
- After SHA-256: `68a7415db94a6334396388731949794f00c2000e3e4ab282d3d807602369eb56`

#### Before

````markdown
Material Passport ledger (`compliance_history[]` + new `reset_boundary` entries) is append-only:
- Every checkpoint with the flag ON appends one `reset_boundary` entry of kind `boundary` under Schema 9's `reset_boundary` field.
- Re-running a stage (e.g., after a review rejection) appends a new entry with `version_label` bumped (`v1.0 → v1.1-revised`).
- `resume_from_passport` consumption appends one entry of kind `resume` to the same ledger, carrying the `consumes_hash` pointer to the `boundary` entry it resolves. This is how resume leaves a trace — no mutation of prior entries.
- Prior entries are never deleted, reordered, or mutated.
- Stage-re-run cases produce adjacent entries for the same `stage`; both are preserved.

### Computing `awaiting_resume` from the ledger

A `boundary` entry with hash `H` is considered **awaiting resume** iff no `resume` entry exists later in the ledger with `consumes_hash == H`. Downstream readers (state machine, observers, external audit tools) compute this by a single pass over `reset_boundary[]` — no out-of-band state required.

## Concurrency model

Resume consumption is a three-step read-modify-write on the passport ledger:

1. Read the ledger and locate the target `boundary` entry by `hash`.
2. Verify no `resume` entry later in the ledger carries `consumes_hash` equal to that hash.
3. Append a new `resume` entry.

Without coordination, two processes can complete step 2 in parallel before either reaches step 3, both observe "no prior resume", and both append. The append-only-ledger invariant survives, but the "one boundary, one resume" invariant breaks. To prevent this, every compliant orchestrator implementation MUST hold an exclusive advisory lock on the passport file for the entire read-check-append sequence.

**POSIX requirement.** On POSIX systems the lock is an `fcntl` exclusive advisory lock (`fcntl.flock(fd, fcntl.LOCK_EX)` in Python, `flock(fd, LOCK_EX)` in C). Acquire before step 1, release after step 3. Do not release between steps under any circumstance. Releasing between steps 2 and 3 reopens the exact race this rule prevents.

**Lock timeout.** Acquisition MUST use a bounded timeout not exceeding 60 seconds; 30 seconds is RECOMMENDED. The passport write is a few-KB append and fsync, so this bound is two orders of magnitude above any reasonable write latency. 60 s is the hard ceiling because a user waiting longer will assume the orchestrator hung; 30 s leaves slack for slow fsync on NFS or sandboxed filesystems. A timeout at this scale indicates a stuck or crashed peer rather than lock contention. Timeout is a hard error; the orchestrator surfaces it to the user with a "passport locked by another session" message and does NOT retry automatically.

**Non-POSIX (Windows).** `fcntl` is unavailable. Compliant implementations use `msvcrt.locking` with `LK_NBLCK`/`LK_LOCK`, or a cross-platform library like `portalocker`. Implementations that cannot provide OS-level exclusion MUST fail loudly on resume with a "concurrency protection unavailable on this platform" error and refuse to consume the boundary. Silent best-effort is forbidden.

**Observability.** The lock is advisory: external readers that don't honor the protocol can still read the passport. Only cooperating writers get safety. This is acceptable because the passport is intended to be consumed by one tool family (ARS-compatible orchestrators).

## Iron rules

1. Flag OFF is pre-v3.6.3 behavior, bit-for-bit.
2. Ledger is append-only. No exception, no "clean up" operation.
3. Reset tag is the sole machine-stable handoff. Human-readable `### Resume Instruction` is for user ergonomics; consumers parse the tag.
4. `systematic-review` with flag ON refuses in-session continuation across FULL checkpoints.
5. Hash mismatch on resume is a hard error; orchestrator never proceeds on a guessed or coerced hash.
6. MANDATORY checkpoints are not downgraded by reset; they co-occur.
7. Hash is computed over the entry with the canonical placeholder `"000000000000"` in the `hash` field, serialized per the byte rules in §"The reset boundary protocol" step 2. `kind: resume` entries are never included in a `boundary` hash computation — the hash covers only prior `boundary` entries plus the new boundary entry itself. Any other convention (exclude-field, variable-length placeholder, post-hoc mutation, including resume entries) breaks cross-implementation interoperability and is forbidden.
8. A `boundary` entry is "consumed" only by appending a `resume` entry with matching `consumes_hash`. If a `boundary` entry has `pending_decision` set, the orchestrator MUST re-prompt the user on resume and MUST NOT auto-advance using `next`. Each option in `pending_decision.options[]` carries its own routing (`next_stage`/`next_mode`); the boundary entry's `next` field is advisory only and MAY be `null` when all branches terminate or no sensible default exists. Actual routing on resume comes from the matched option's `next_stage`/`next_mode`, not from the boundary `next` field.
9. Resume consumption MUST hold an exclusive advisory lock on the passport file for the entire read-check-append sequence. Releasing the lock between the no-prior-resume check and the resume-entry append reopens the double-resume race the rule exists to prevent. Non-POSIX implementations that cannot provide OS-level exclusion MUST refuse to resume rather than degrade silently.
````

#### After

````markdown
<!--rs:STATE-007-->
### ResearchSpec Current Owner

Replacement scope: `STATE-007` for `academic-pipeline`.

ResearchSpec reset and resume state lives only in current subflow instances, artifact records, human-confirmed Gate attempts and Decisions. external input handling is one-way: the importer reads immutable external bytes, registers their normalized evidence and records consumption in current state. Re-running work creates new explicit artifacts; it never appends boundary or resume entries to the source external input.
Current resume state lives in `researchspec/subflows/<instance>/control.yaml`.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:STATE-007-->
````

### HANDOFF-002

- Anchor name: `pipeline.team-handoff.passport-checklist`
- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/references/team_collaboration_protocol.md`
- Severity: `recommended`
- Semantic role: `handoff_projection`
- Replacement shape: `schema_projection_table`
- Replacement body SHA-256: `afb2115635549409cd4b1d04c423586904e9e125ff0eba87581c98a4fd3c7169`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-pipeline/references/team_collaboration_protocol.md`
- Before SHA-256: `b7b3d15b245fd412b906ce9f391fd247a21b2e54fe3eed96fe6bbb1036c4a1aa`
- After SHA-256: `08462cc1732677afff63396b1af2a270f4bb1b30a1a352f294f7111bb6f5541e`

#### Before

````markdown
| **Handoff checklist** | All Material Passports (Schema 9) attached; Bibliography minimum source count met; Synthesis has 3+ themes |
````

#### After

````markdown
<!--rs:HANDOFF-002-->
### ResearchSpec Current Owner

Replacement scope: `HANDOFF-002` for `academic-pipeline`.

| **Handoff checklist** | Resolve every required source, bibliography, and synthesis input from explicit handoff roles and safe project-relative paths; check current readability only when the consuming action needs the file; apply the declared source and theme requirements; and require the relevant current human-confirmed Gate or Decision from the owning control. External files do not carry workflow authority. |

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:HANDOFF-002-->
````

### IO-002

- Anchor name: `pipeline.skill.phase-boundary-enforcement`
- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/SKILL.md`
- Severity: `recommended`
- Semantic role: `boundary_deliverable_contract`
- Replacement shape: `io_contract_block`
- Replacement body SHA-256: `e4fc5ca2733d91a905570924f9f240baf88ae59d34434d1eef4961ee3c6551a3`
- ResearchSpec targets: `researchspec/profiles/academic-pipeline.yaml`, `researchspec/subflows/<instance>/control.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/SKILL.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/SKILL.md`, `academic-pipeline/SKILL.md`, `deep-research/references/cross-skill/academic-pipeline/SKILL.md`
- Before SHA-256: `a6431f1c70388ec07a0dc28a1ec2ee850e25386648beb3c32e51602da59068d9`
- After SHA-256: `eaae176c4946547ab78c9fbb1b84f506e9fda63691eeff6732ffee289a9b2d19`

#### Before

````markdown
In Mode B, **single-phase agents (Bucket A per `docs/design/2026-05-18-ars-v3.9.2-agent-phase-classification.md`) in the downstream skills (deep-research, academic-paper, academic-paper-reviewer) stay strictly within their assigned phase for writes**. The 5 agents in academic-pipeline itself are all cross-phase / meta by design (Bucket C/D) — they have no fence by design:

- `pipeline_orchestrator_agent` (D — orchestrator, full pipeline visibility)
- `state_tracker_agent` (D — meta state, all phases)
- `integrity_verification_agent` (C — Stage 2.5 / 4.5 cross-skill gate)
- `collaboration_depth_agent` (C — FULL/SLIM checkpoints + pipeline completion, advisory-only)
- `claim_ref_alignment_audit_agent` (C — opt-in claim audit, phase-orthogonal)

Routing into Mode B requires explicit user signal — `/ars-<mode>` slash command or `[direct-mode]` prefix. Ambiguous cross-phase input defaults to clarification per `.claude/CLAUDE.md` Routing Discipline + `shared/references/intent_clarification_protocol.md`. **Critically:** if `pipeline_orchestrator_agent` is dispatched on ambiguous cross-phase materials, the orchestrator itself currently cannot reconcile (this is the v3.10 conductor #134 work) — v3.9.2 routes such cases to clarification BEFORE the orchestrator runs.

**Enforcement (v3.9.2):** Phase Boundary blocks on downstream Bucket A agents + advisory verifier (`scripts/check_pipeline_integrity.py`) + a deterministic PreToolUse write-scope guard in hook-enabled runtimes (#134 rescope, PR #294). Multi-phase envelope + orchestrator structured intake remain forward-scope (#134 Slices 3-5).
````

#### After

````markdown
<!--rs:IO-002-->
### ResearchSpec Current Owner

Replacement scope: `IO-002` for `academic-pipeline`.

In phase-by-phase mode, downstream single-phase agents remain confined to the
stage selected in `researchspec/subflows/<instance>/control.yaml`. They may read only the
contracts and handoff-referenced artifacts required by that stage and may emit only its
declared output artifacts. The academic-pipeline orchestrator, state-tracking,
integrity, collaboration-depth, and claim-audit roles retain their documented
cross-stage visibility, but that visibility does not grant direct write access
to stable ResearchSpec files.

Routing into phase-by-phase mode still requires an explicit user signal.
Ambiguous cross-phase requests stop for clarification before dispatch. The
configured workflow and the owning control—not an ARS phase-directory name—decide
which stage may execute.

Enforcement is contract-based: preflight checks
`researchspec/profiles/academic-pipeline.yaml`, `researchspec/subflows/<instance>/control.yaml`, and
required entries in `researchspec/subflows/<instance>/handoff.md` before
dispatch; the runtime rejects outputs outside the selected stage. Existing
prompt fences, local verifiers, or tool hooks may report diagnostics but do not
replace the ResearchSpec boundary.

Current ResearchSpec owners:

- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:IO-002-->
````

### STATE-002

- Anchor name: `pipeline.skill.resume-from-passport`
- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/SKILL.md`
- Severity: `required`
- Semantic role: `subflow_control_boundary`
- Replacement shape: `protocol_block`
- Replacement body SHA-256: `1f91bfa15688d6f03d3fc402614fff2a9d0b799f694b7539da7bcabf3f849a6d`
- ResearchSpec targets: `researchspec/subflows/<instance>/control.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/SKILL.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/SKILL.md`, `academic-pipeline/SKILL.md`, `deep-research/references/cross-skill/academic-pipeline/SKILL.md`
- Before SHA-256: `9d830fcc9b071b1d1fca2c5d985b809e37cfed37cc97290a34fc633ba125d01f`
- After SHA-256: `56c58bd3e78925761c78f39448c59ebba064d992d1510fa881c9068fc0e5e18e`

#### Before

````markdown
--> Loads the Material Passport (Schema 9), locates the `kind: boundary` entry matching `<hash>`, and confirms it has no later `kind: resume` entry consuming it. If `pending_decision` is set, the decision prompt fires first to capture the user's branch choice for the audit ledger; the prompt is never skipped, even when the user supplies `stage=`. After the prompt (or immediately if no `pending_decision`), the next stage is determined by: (a) `stage=<n>` CLI override if provided, else (b) the matched option's `next_stage`, else (c) the `next` field recorded in the boundary entry. CLI `stage=`/`mode=` overrides win over option routing.
- **Gate (emit)**: `ARS_PASSPORT_RESET=1` must be set in the emitting session. Without the flag, no `kind: boundary` entries are written and there is nothing to resume from.
- **Gate (resume)**: No flag required. Any session can invoke `resume_from_passport=<hash>` against a passport that carries a valid boundary entry matching the hash.
- **Intent**: Invoke in a *fresh* Claude Code session. Resuming within the same session that emitted the boundary provides no token savings and may drop still-live in-session context.
- **Stage**: Any. Resumes at whatever stage the routing rules above determine.
- **Reference**: [`references/passport_as_reset_boundary.md`](references/passport_as_reset_boundary.md) — see §"`resume_from_passport` mode contract".
````

#### After

````markdown
<!--rs:STATE-002-->
### ResearchSpec Current Owner

Replacement scope: `STATE-002` for `academic-pipeline`.

Do not use the upstream resume token or state carrier. To enter from existing
materials, request instructions for `academic-pipeline:mid-entry`, identify the
actual external prerequisite roles and paths, present the route summary, and
obtain a new instance-scoped confirmation. The CLI creates the new owning
control; the Agent records only the selected boundary inputs in its handoff.
No external record can supply current Gate, Decision, checkpoint, or transition
authority.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:STATE-002-->
````

### STATE-003

- Anchor name: `pipeline.skill.orchestrator-state-tracking`
- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/SKILL.md`
- Severity: `required`
- Semantic role: `subflow_control_boundary`
- Replacement shape: `protocol_block`
- Replacement body SHA-256: `7c1327acd9365e89cc5b7fbbd28db66a4c552e78b160db4520b4de74609c0872`
- ResearchSpec targets: `researchspec/profiles/academic-pipeline.yaml`, `researchspec/subflows/<instance>/control.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/SKILL.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/SKILL.md`, `academic-pipeline/SKILL.md`, `deep-research/references/cross-skill/academic-pipeline/SKILL.md`
- Before SHA-256: `885ee4c094ad0a77870257e2968363063330ba64f9f6732797b64dc947132826`
- After SHA-256: `423cb8d5cd20b8fe0b573f3c0be6fbf8022e7c274d362283f63ac0e77c8a1272`

#### Before

````markdown
**Mode A — orchestrator-driven (default):** `pipeline_orchestrator_agent` runs all stages end-to-end with state tracking via Material Passport. `state_tracker_agent`, `integrity_verification_agent`, `collaboration_depth_agent`, and `claim_ref_alignment_audit_agent` are dispatched by the orchestrator at the appropriate checkpoints.

**Mode B — phase-by-phase (cross-session resume):** User invokes one phase agent at a time across sessions, typically via `ARS_PASSPORT_RESET=1` + `resume_from_passport=<hash>` (see `references/passport_as_reset_boundary.md`).
````

#### After

````markdown
<!--rs:STATE-003-->
### ResearchSpec Current Owner

Replacement scope: `STATE-003` for `academic-pipeline`.

Resume from ResearchSpec state and handoff-referenced artifacts. If the user supplies an ARS external input, route it through the one-way `explicit handoff input` input on the confirmed mid-entry Start; otherwise use the current CLI frontier directly. Never infer current Gate or Decision authority from external records.
Resolve the current graph from `researchspec/profiles/academic-pipeline.yaml`.

Current ResearchSpec owners:

- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:STATE-003-->
````

### IO-003

- Anchor name: `deep.agent.phase-boundary`
- Owner skill: `deep-research`
- Source path: `deep-research/agents/bibliography_agent.md`
- Severity: `recommended`
- Semantic role: `boundary_deliverable_contract`
- Replacement shape: `io_contract_block`
- Replacement body SHA-256: `8cc2409933e209e77cdae3ad1574d5d3f5a9d6344998639d1c7e80b7b7de0188`
- ResearchSpec targets: `researchspec/specs/project.md`, `researchspec/specs/sources.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/cross-skill/deep-research/agents/bibliography_agent.md`, `academic-paper-reviewer/references/cross-skill/deep-research/agents/bibliography_agent.md`, `academic-pipeline/references/cross-skill/deep-research/agents/bibliography_agent.md`, `deep-research/agents/bibliography_agent.md`
- Before SHA-256: `0309480229b94876752945cbb3483dea6b34b403fa51b207640131ffc7c7087f`
- After SHA-256: `f8f030778cfd0b87b8b8bd3dd3da5119a9ff57f2eae118e2b2d26e4d2e45a693`

#### Before

````markdown
You are a single-phase agent assigned to **Phase 2 (Investigation)**. Your sole deliverable is the Annotated Bibliography (APA 7.0 format) + Search Strategy report.

You MUST NOT:
- WRITE files in `phase{M}_*/` directories where M ≠ 2 (no inflate into Phase 3 synthesis, Phase 4 drafting, Phase 5 review, Phase 6 revision — **this is the exact #133 failure pattern**)
- Produce content classified as a downstream-phase deliverable type (synthesis, draft, review, revision) even if you can see the end-goal or the user provides an abstract
- Invoke or simulate any other agent persona's output (e.g., do not produce synthesis findings, do not draft chapter content)
- "Helpfully" continue past your assigned deliverable

You MAY READ files in `phase1_*/` (Research Question Brief, Methodology Blueprint) and `phase2_*/` (own phase) for legitimate context. Downstream phases (`phase{3,4,5,6}_*/`) are not needed for your work.

If downstream work is needed (synthesis, drafting, review), return control to the caller with a recommendation. Do not execute. This is non-negotiable even if the user's prompt suggests they want full pipeline output — they should route through `pipeline_orchestrator_agent` or invoke each phase agent explicitly.

**Enforcement (v3.9.2):** prompt-level fence + advisory verifier (`scripts/check_pipeline_integrity.py`). Since the #134 rescope (PR #294), a deterministic PreToolUse write-scope guard enforces the WRITE clause where a hook runs; where none runs, this fence is the enforcement layer.
````

#### After

````markdown
<!--rs:IO-003-->
### ResearchSpec Current Owner

Replacement scope: `IO-003` for `deep-research`.

You are the Bibliography Agent for the Investigation stage. Your sole
deliverables are the annotated bibliography and reproducible search-strategy
artifacts.

**Contract inputs:** read research intent from `researchspec/specs/project.md`
and source identities, inclusion state, and trust metadata from
`researchspec/specs/sources.yaml`. Resolve the handoff-referenced RQ brief, methodology
blueprint, and any permitted existing bibliography artifacts through
`researchspec/subflows/<instance>/handoff.md`. For Adapter-backed work,
also read the confirmed source policy and each explicit
`ProviderRetrievalHandoff` as working evidence. A handoff references its
upstream result; it is not accepted bibliography evidence. Do not infer inputs
from `phase*_` directories or consume downstream synthesis, draft, review, or
revision artifacts.

**Contract outputs:** emit only the annotated bibliography and search-strategy
artifacts. Do not synthesize findings, draft manuscript content, simulate another
agent, or continue into a downstream stage. Return any recommended downstream
work to the caller.

**Writes allowed:** write new bibliography/search artifacts and return them to
the owning subflow handoff. Adapter queries and candidate-only acquisition
may produce working handoffs and candidate artifacts. Import is allowed only
for screened candidates covered by a current `ManagedLibraryAuthorization`;
library Curation requires a separate explicit request. Do not modify
`sources.yaml`, the owning control, handoff, Decisions, or Gates directly. Prompt
fences and local integrity scripts remain diagnostics; ResearchSpec contracts
and runtime validation own the boundary.

Current ResearchSpec owners:

- `researchspec/specs/project.md`
- `researchspec/specs/sources.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:IO-003-->
````

### SOURCE-003

- Anchor name: `deep.bibliography.corpus-passport`
- Owner skill: `deep-research`
- Source path: `deep-research/agents/bibliography_agent.md`
- Severity: `required`
- Semantic role: `stable_source_contract`
- Replacement shape: `artifact_projection_block`
- Replacement body SHA-256: `8bd1af0fb96b6ce38e7e54f680446c9223d6a0db475478e144564c55531f8115`
- ResearchSpec targets: `researchspec/specs/sources.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/cross-skill/deep-research/agents/bibliography_agent.md`, `academic-paper-reviewer/references/cross-skill/deep-research/agents/bibliography_agent.md`, `academic-pipeline/references/cross-skill/deep-research/agents/bibliography_agent.md`, `deep-research/agents/bibliography_agent.md`
- Before SHA-256: `2dcd0a3b130b7117e4f207ff6e7bca2ecec04e1207e44f62087a806a3af4f9c6`
- After SHA-256: `2b5e23d0fcb40bb72218fbfcca266fe0c0fc65860395b65d171ce5f8e3e6088d`

#### Before

````markdown
When the input Material Passport carries a non-empty `literature_corpus[]`, this agent enters the **corpus-first, search-fills-gap** flow. The flow has five steps and four Iron Rules; the PRE-SCREENED block makes corpus utilisation reproducible.
````

#### After

````markdown
<!--rs:SOURCE-003-->
### ResearchSpec Current Owner

Replacement scope: `SOURCE-003` for `deep-research`.

When `researchspec/specs/sources.yaml` contains included literature sources,
resolve their handoff-referenced source and screening artifacts through
`researchspec/subflows/<instance>/handoff.md` and present them to the
Bibliography Agent as a read-only `literature_corpus[]` working projection.
Apply the confirmed source policy without turning provider priority into
workflow authority:

- `adapter-native`: call `zotero-library-query` first and record the uncovered
  source class before using `zotero-literature-acquisition` or bounded external
  search.
- `protocol-multi-source`: let the systematic-review protocol determine
  databases, searches, screening, and coverage; use Zotero for seeds,
  duplicate checks, full text, and supplemental coverage.
- `external-first`: use current authoritative external sources first or in
  parallel, then use Zotero for academic context.
- `library-bound`: use only the requested current selection, private
  collection, or offline library; pause when just-in-time readiness fails.

Call `zotero-literature-analysis` only for a source-level evidence goal and
`zotero-research-synthesis` only for a bounded cross-source goal. Do not invoke
every task mechanically. Consume results through a explicit
`ProviderRetrievalHandoff`; an empty result is not proof of absence, and the
handoff remains working evidence until this producer screens, verifies, and
returns a durable bibliography artifact. Without a current, user-authorized,
collection-bound `ManagedLibraryAuthorization`, Acquisition is candidate-only.
That authorization never permits `zotero-library-curation`.

Keep the existing five-step flow, four Iron Rules, and PRE-SCREENED
reproducibility block intact. External search results and proposed additions
remain output artifacts until an accepted source-contract change is applied;
the agent must not mutate `sources.yaml`, the projected corpus, or any other
ResearchSpec authority file.

Current ResearchSpec owners:

- `researchspec/specs/sources.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:SOURCE-003-->
````

### CLAIM-002

- Anchor name: `deep.report-compiler.claim-intent-passport`
- Owner skill: `deep-research`
- Source path: `deep-research/agents/report_compiler_agent.md`
- Severity: `required`
- Semantic role: `stable_claim_contract`
- Replacement shape: `artifact_projection_block`
- Replacement body SHA-256: `7044228356b92f06afe671f9b91cc6e1ea187622767256a02eb87cfc6c4de903`
- ResearchSpec targets: `researchspec/specs/claims.yaml`, `researchspec/changes/<change-id>/change.md`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/cross-skill/deep-research/agents/report_compiler_agent.md`, `academic-paper-reviewer/references/cross-skill/deep-research/agents/report_compiler_agent.md`, `academic-pipeline/references/cross-skill/deep-research/agents/report_compiler_agent.md`, `deep-research/agents/report_compiler_agent.md`
- Before SHA-256: `85473afda2c0be70de68028c2b5eeb6dd2308a1c97baeeab12fa102999d574bb`
- After SHA-256: `db84590147e04bd790a6e61e8d2dbc3a7b674c546eb07346d041d9829d4e54e6`

#### Before

````markdown
Before compiling the first prose block of the report, append ONE `claim_intent_manifests[]` entry to the Material Passport listing the substantive claims the compiled report intends to make and any author-declared "must not" rules. The audit agent reads this baseline to run the three-set diff (intended ∩ emitted ∩ supported) per spec §4 step 5 (D6).
````

#### After

````markdown
<!--rs:CLAIM-002-->
### ResearchSpec Current Owner

Replacement scope: `CLAIM-002` for `deep-research`.

Before compiling the first prose block of the report, read the accepted claim
contract from `researchspec/specs/claims.yaml` and emit exactly ONE immutable
`claim_intent_manifest` artifact covering the substantive claims the compiled
report will make and every declared negative constraint. Preserve stable ids
and limits for accepted claims. If compilation introduces a new claim or changes
claim strength, emit a proposed
`researchspec/changes/<change-id>/change.md` alongside the manifest
rather than mutating the stable claim contract. Return the manifest to the
owning subflow handoff for
`researchspec/subflows/<instance>/handoff.md`; the audit agent reads this
handoff-referenced baseline for the intended ∩ emitted ∩ supported diff in spec §4 step
5 (D6).

Current ResearchSpec owners:

- `researchspec/specs/claims.yaml`
- `researchspec/changes/<change-id>/change.md`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:CLAIM-002-->
````

### CLAIM-003

- Anchor name: `deep.synthesis.claim-intent-passport`
- Owner skill: `deep-research`
- Source path: `deep-research/agents/synthesis_agent.md`
- Severity: `required`
- Semantic role: `stable_claim_contract`
- Replacement shape: `artifact_projection_block`
- Replacement body SHA-256: `cc3b90da56a327715ea9960f6d4dec2b0076dbbffac90029fd416c8f8f6fdbeb`
- ResearchSpec targets: `researchspec/specs/claims.yaml`, `researchspec/changes/<change-id>/change.md`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/cross-skill/deep-research/agents/synthesis_agent.md`, `academic-paper-reviewer/references/cross-skill/deep-research/agents/synthesis_agent.md`, `academic-pipeline/references/cross-skill/deep-research/agents/synthesis_agent.md`, `deep-research/agents/synthesis_agent.md`
- Before SHA-256: `36472500843439df65bfe69c96070b4ebd056b9905959db6eaeda0d2ceb37517`
- After SHA-256: `0276b5f719683a22e690996d179011855e5e5fb25119a552fcf518436c153b49`

#### Before

````markdown
Before drafting the first prose block of the synthesis output, append ONE `claim_intent_manifests[]` entry to the Material Passport listing the substantive claims the synthesis intends to make and any author-declared "must not" rules. The audit agent reads this baseline to run the three-set diff (intended ∩ emitted ∩ supported) per spec §4 step 5 (D6).
````

#### After

````markdown
<!--rs:CLAIM-003-->
### ResearchSpec Current Owner

Replacement scope: `CLAIM-003` for `deep-research`.

Before drafting the first prose block of the synthesis output, read the accepted
claim ids, support limits, evidence links, and wording constraints from
`researchspec/specs/claims.yaml`. Emit exactly ONE immutable
`claim_intent_manifest` artifact listing the substantive claims this synthesis
intends to make and every author-declared "must not" rule. Claims already
accepted by the contract must retain their stable claim ids; any new claim or
increase in claim strength must also be proposed through
`researchspec/changes/<change-id>/change.md`, never written directly
to `claims.yaml`. Record the manifest by role and path in
`researchspec/subflows/<instance>/handoff.md`. The audit agent reads that
handoff-referenced pre-commitment to run the three-set diff (intended ∩ emitted ∩
supported) per spec §4 step 5 (D6).

Current ResearchSpec owners:

- `researchspec/specs/claims.yaml`
- `researchspec/changes/<change-id>/change.md`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:CLAIM-003-->
````

### ARTIFACT-002

- Anchor name: `deep.timeline.sidecar-runtime`
- Owner skill: `deep-research`
- Source path: `deep-research/agents/timeline_extraction_agent.md`
- Severity: `recommended`
- Semantic role: `boundary_deliverable_provenance`
- Replacement shape: `artifact_projection_block`
- Replacement body SHA-256: `22b4aea61f4142e5887c6ac5d3da4a81b2ec1fc9bc441d301379e12d502978f2`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/specs/sources.yaml`, `researchspec/specs/claims.yaml`
- Generated output paths: `deep-research/agents/timeline_extraction_agent.md`
- Before SHA-256: `73967e6cef5a24b1365c643846e2a7eb9735756f593b283d78557576349dbef4`
- After SHA-256: `e3a29e9c7b1035c4ede29fe37e4ba6f8ab1a297f46916775f3bae5682612e26c`

#### Before

````markdown
- `phase2_investigation/timeline.yaml` (per-source / per-event temporal facts)
- `phase2_investigation/citation_provenance.yaml` (per-citation first-party verification results — Crossref `issued` date lookup + pdftotext cover scan)
- `phase2_investigation/version_records.yaml` (academic citation version-family evidence for preprint -> proceedings -> journal chains; Kong #258)
````

#### After

````markdown
<!--rs:ARTIFACT-002-->
### ResearchSpec Current Owner

Replacement scope: `ARTIFACT-002` for `deep-research`.

- Emit `timeline.yaml` as the temporal-facts artifact for this Investigation-stage invocation; link every source reference to its stable source id in `researchspec/specs/sources.yaml`.
- Emit `citation_provenance.yaml` as the first-party citation-verification artifact; include the source ids, checks performed, evidence locations, and result status without changing source records.
- Emit `version_records.yaml` as the citation version-family artifact for preprint → proceedings → journal chains; link any claim relevance to stable ids in `researchspec/specs/claims.yaml`.

Return all three paths, hashes, producer identity, and stage metadata to the
owning subflow handoff for
`researchspec/subflows/<instance>/handoff.md`. These are separate immutable
artifacts; do not store their contents in the owning subflow control, external input, or
stable specs.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/specs/sources.yaml`
- `researchspec/specs/claims.yaml`
<!--/rs:ARTIFACT-002-->
````

### IO-004

- Anchor name: `deep.skill.phase-boundary`
- Owner skill: `deep-research`
- Source path: `deep-research/SKILL.md`
- Severity: `recommended`
- Semantic role: `boundary_deliverable_contract`
- Replacement shape: `io_contract_block`
- Replacement body SHA-256: `5479c6bf4352d57c93e88bf826cd249f4c6518a08d36f83fb6e6ab2421bc02f4`
- ResearchSpec targets: `researchspec/profiles/academic-pipeline.yaml`, `researchspec/subflows/<instance>/control.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/cross-skill/deep-research/SKILL.md`, `academic-paper-reviewer/references/cross-skill/deep-research/SKILL.md`, `academic-pipeline/references/cross-skill/deep-research/SKILL.md`, `deep-research/SKILL.md`
- Before SHA-256: `34fa2a8037254957e47bf3e73b95468c5d28a0cbf180f92abeef97855d83a3ef`
- After SHA-256: `834a17f58fbdb6bf1dbc97574478fe160c4d6337e69f9170e26a15bcc5b5b2be`

#### Before

````markdown
In Mode B, **single-phase agents (Bucket A per `docs/design/2026-05-18-ars-v3.9.2-agent-phase-classification.md`) stay strictly within their assigned phase for writes**. Reads from upstream phases are allowed. Multi-phase agents (Bucket B: `devils_advocate_agent`, `report_compiler_agent`) do exactly the work specified by the caller's invocation for that phase — no extension to other phases in the same call.

Routing into Mode B requires explicit user signal — `/ars-<mode>` slash command or `[direct-mode]` prefix. Ambiguous cross-phase input defaults to clarification per `.claude/CLAUDE.md` Routing Discipline + `shared/references/intent_clarification_protocol.md`.

**Enforcement (v3.9.2):** Phase Boundary blocks on Bucket A agents + advisory verifier (`scripts/check_pipeline_integrity.py`) + a deterministic PreToolUse write-scope guard in hook-enabled runtimes (#134 rescope, PR #294). Multi-phase envelope remains forward-scope (#134 Slices 3-5).
````

#### After

````markdown
<!--rs:IO-004-->
### ResearchSpec Current Owner

Replacement scope: `IO-004` for `deep-research`.

In phase-by-phase mode, single-stage deep-research agents may read the contracts
and handoff-referenced upstream artifacts required by the selected route instructions, but may
write only its declared outputs. `devils_advocate_agent` and
`report_compiler_agent` retain multi-stage responsibilities only when the
current frontier instructions explicitly select that work; one invocation does
not authorize either role to extend itself into another stage.

Phase-by-phase routing requires an explicit user signal. Ambiguous cross-stage
material must be clarified before dispatch. The configured graph in
`researchspec/profiles/academic-pipeline.yaml`, the frontier in
`researchspec/subflows/<instance>/control.yaml`, and handoff-referenced inputs in
`researchspec/subflows/<instance>/handoff.md` define the permitted read and
write boundary.

Current ResearchSpec owners:

- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:IO-004-->
````

### STATE-008

- Anchor name: `deep.skill.material-passport-state`
- Owner skill: `deep-research`
- Source path: `deep-research/SKILL.md`
- Severity: `required`
- Semantic role: `subflow_control_boundary`
- Replacement shape: `protocol_block`
- Replacement body SHA-256: `50c50420939b61b2ecc076dfe901b2d345311823410aff16bf9904f7fc6ce39b`
- ResearchSpec targets: `researchspec/specs/project.md`, `researchspec/profiles/academic-pipeline.yaml`, `researchspec/subflows/<instance>/control.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/cross-skill/deep-research/SKILL.md`, `academic-paper-reviewer/references/cross-skill/deep-research/SKILL.md`, `academic-pipeline/references/cross-skill/deep-research/SKILL.md`, `deep-research/SKILL.md`
- Before SHA-256: `b2e0df17b51dcebaa974776543cb401f621b21e95d33735ea1ac0ce58b0436b3`
- After SHA-256: `a23be1499f2efdbf0ca71d3459360bbd39db0b1ff968c6f4b392011546a9a53f`

#### Before

````markdown
**Mode A — orchestrator-driven (default):** `pipeline_orchestrator_agent` (in `academic-pipeline` skill) runs all phases end-to-end with state tracking via Material Passport.

**Mode B — phase-by-phase (cross-session resume):** User invokes one agent per phase across sessions for long-running projects. Common pattern via `ARS_PASSPORT_RESET=1` + `resume_from_passport=<hash>` (see `academic-pipeline/references/passport_as_reset_boundary.md`).
````

#### After

````markdown
<!--rs:STATE-008-->
### ResearchSpec Current Owner

Replacement scope: `STATE-008` for `deep-research`.

Use `researchspec status` and directed subflow instructions to resume an existing
instance from its owning control and handoff. When existing materials require a
new pipeline entry, select `academic-pipeline:mid-entry`, declare the actual
handoff input roles, and obtain a separate start confirmation. External metadata
never changes the current profile, frontier, Gate, or Decision authority.

Current ResearchSpec owners:

- `researchspec/specs/project.md`
- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:STATE-008-->
````

### GATE-003

- Anchor name: `shared.compliance-agent.output-passport`
- Owner skill: `shared`
- Source path: `shared/agents/compliance_agent.md`
- Severity: `required`
- Semantic role: `gate_policy`
- Replacement shape: `gate_rule_block`
- Replacement body SHA-256: `572e33a9766c8352011df7f6371ffb1efc426b8586fd8b50c7eb39f9e90e2609`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/references/shared/agents/compliance_agent.md`, `academic-paper-reviewer/references/shared/agents/compliance_agent.md`, `academic-pipeline/references/shared/agents/compliance_agent.md`, `deep-research/references/shared/agents/compliance_agent.md`
- Before SHA-256: `19e4e6ce31b20a25097014f2feadb07fbf642696eb7cef7f61c90ae47149bf33`
- After SHA-256: `b174ada609c1e9679a4fb0b3e4b71effb8a2a1756ea8542bfa4ffa35341fa031`

#### Before

````markdown
`compliance_report` conforming to `shared/compliance_report.schema.json` (Schema 12). Appended to `material_passport.compliance_history[]` by the orchestrator.
````

#### After

````markdown
<!--rs:GATE-003-->
### ResearchSpec Current Owner

Replacement scope: `GATE-003` for `shared`.

Return a `compliance_report` conforming to
`shared/compliance_report.schema.json` as a standalone boundary file. The
orchestrator must first validate the report, then record its role, safe path,
purpose, producer, and intended consumer in the owning subflow handoff at
`researchspec/subflows/<instance>/handoff.md`. Pass the validated decision,
tiered findings, evidence, and material gaps to the compliance gate helper for
`researchspec/subflows/<instance>/control.yaml`. The compliance agent and
orchestrator MUST NOT append the report to an external input or edit either
ResearchSpec authority file directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:GATE-003-->
````

### DECISION-002

- Anchor name: `shared.compliance.runtime-boundary`
- Owner skill: `shared`
- Source path: `shared/compliance_checkpoint_protocol.md`
- Severity: `recommended`
- Semantic role: `control_decision_record`
- Replacement shape: `checklist`
- Replacement body SHA-256: `f12d1a13c8712340990e86a8313b8fd363b53b0cbf00dda5744fe965b4d7b7d3`
- ResearchSpec targets: `researchspec/subflows/<instance>/control.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/shared/compliance_checkpoint_protocol.md`, `academic-paper-reviewer/references/shared/compliance_checkpoint_protocol.md`, `academic-pipeline/references/shared/compliance_checkpoint_protocol.md`, `deep-research/references/shared/compliance_checkpoint_protocol.md`
- Before SHA-256: `52a20afa717bdd39a4d63c6e66457f91341803a8389a874409e82e68b933b863`
- After SHA-256: `bc8b469ec39e19f9f501873fa60f0d26d2ecab5f7e87498a637190c5a7ff0d99`

#### Before

````markdown
> **Enforcement boundary.** This ladder is enforced at **runtime by `compliance_agent`** using the `compliance_history[]` round counter, NOT by Schema 12. Schema 12 intentionally permits `user_override.rationale.minLength: 1` so that legacy passports and cross-session resume do not fail validation on historical entries. The round-counter increment and ≥100-char rationale check live in the agent's write-path, not in the JSON Schema. If you bypass the agent and hand-write a `user_override` entry into the passport, Schema 12 will accept any rationale length — but that entry will not have gone through the friction ladder and must be treated as unaudited.
````

#### After

````markdown
<!--rs:DECISION-002-->
### ResearchSpec Current Owner

Replacement scope: `DECISION-002` for `shared`.

> **Enforcement boundary.** Resolve prior accepted compliance overrides for the
> same subflow and Gate from
> `researchspec/subflows/<instance>/control.yaml`. Apply the configured
> first-, second-, and third-round friction rules, stop for human confirmation,
> and ask ResearchSpec CLI to record the selected override, rationale, scope,
> report handoff role and path, and round count only after confirmation. The
> compliance report remains an ordinary boundary file referenced through
> `researchspec/subflows/<instance>/handoff.md`; its contents cannot authorize
> an override or mutate the owning control.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:DECISION-002-->
````

### GATE-004

- Anchor name: `shared.ground-truth-isolation`
- Owner skill: `shared`
- Source path: `shared/ground_truth_isolation_pattern.md`
- Severity: `recommended`
- Semantic role: `boundary_deliverable_provenance`
- Replacement shape: `artifact_projection_block`
- Replacement body SHA-256: `63fe50d6a8812189a090c5d6b05da6a1c2b61538c73a12a08c924f65dae718bf`
- ResearchSpec targets: `researchspec/subflows/<instance>/handoff.md`, `researchspec/specs/sources.yaml`
- Generated output paths: `academic-paper/references/shared/ground_truth_isolation_pattern.md`, `academic-paper-reviewer/references/shared/ground_truth_isolation_pattern.md`, `academic-pipeline/references/shared/ground_truth_isolation_pattern.md`, `deep-research/references/shared/ground_truth_isolation_pattern.md`
- Before SHA-256: `8489fcd47b2e4871bd0a2f4044149638bcd5db48c9f201e499f783671c97c860`
- After SHA-256: `bd882544b5584ecf80a4456d4e986556b94efcbfe10b4034955e485b1a6f6b87`

#### Before

````markdown
chain must remain traceable through the Material Passport carried with each
artifact.
````

#### After

````markdown
<!--rs:GATE-004-->
### ResearchSpec Current Owner

Replacement scope: `GATE-004` for `shared`.

Maintain traceability through stable source IDs in `sources.yaml`, stable claim
support where applicable, and explicit boundary roles and paths in the owning
handoff. Preserve producer, purpose, source links, verification evidence,
limitations, and supersession notes in the semantic deliverable or handoff.
External metadata is contextual evidence and never the active traceability
authority.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/specs/sources.yaml`
<!--/rs:GATE-004-->
````

### GATE-005

- Anchor name: `shared.ground-truth-gate-verdict`
- Owner skill: `shared`
- Source path: `shared/ground_truth_isolation_pattern.md`
- Severity: `recommended`
- Semantic role: `gate_policy`
- Replacement shape: `gate_rule_block`
- Replacement body SHA-256: `a9d8c29befb0ac0b2f59db39fc0e5175354cc435dbe19acf99194663b06054f9`
- ResearchSpec targets: `researchspec/profiles/academic-pipeline.yaml`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/references/shared/ground_truth_isolation_pattern.md`, `academic-paper-reviewer/references/shared/ground_truth_isolation_pattern.md`, `academic-pipeline/references/shared/ground_truth_isolation_pattern.md`, `deep-research/references/shared/ground_truth_isolation_pattern.md`
- Before SHA-256: `ef679f383fea1e2cca7b486ef8b495a0bf41050c09d279285883e030a11dedf5`
- After SHA-256: `6cfbf0ff735260afa36277227ef2234f816a42b51f978ee1a4145147f2abc626`

#### Before

````markdown
Only a passed integrity gate with a verified Material Passport does that.
````

#### After

````markdown
<!--rs:GATE-005-->
### ResearchSpec Current Owner

Replacement scope: `GATE-005` for `shared`.

An external Gate report is evidence only. It cannot pass, preserve, override,
or unlock a ResearchSpec Gate. Use the current profile to identify the owning
Gate, present a fresh verification recommendation, and require explicit human
confirmation. Append the resulting attempt—and any separately approved failed-
Gate override—only to the owning subflow control.

Current ResearchSpec owners:

- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:GATE-005-->
````

### GATE-006

- Anchor name: `shared.handoff.invariants`
- Owner skill: `shared`
- Source path: `shared/handoff_schemas.md`
- Severity: `required`
- Semantic role: `gate_policy`
- Replacement shape: `gate_rule_block`
- Replacement body SHA-256: `d0197bbb90aacedc9dd5c73665f50587682277e79f56633bd829d1bbf626432e`
- ResearchSpec targets: `researchspec/subflows/<instance>/control.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/shared/handoff_schemas.md`, `academic-paper-reviewer/references/shared/handoff_schemas.md`, `academic-pipeline/references/shared/handoff_schemas.md`, `deep-research/references/shared/handoff_schemas.md`
- Before SHA-256: `e1bc4e6eec4c6a6b12d5645553e7b93dc589076b9bf8a8d6554b0b0c0f7de557`
- After SHA-256: `8381bca56099e227fe300406f9a73b7e38aa9c3ce1ac0058fc677529cb67dd5d`

#### Before

````markdown
4. **Version tracking**: Each handoff artifact MUST carry a Material Passport (Schema 9) with a version label. Version labels must be monotonically increasing within a pipeline run
5. **Failure on missing**: If a required field is missing, return `HANDOFF_INCOMPLETE` with a list of missing fields; do NOT proceed with partial data
6. **Producer validation**: Producing agent must validate output against its schema BEFORE handoff
7. **Consumer validation**: Consuming agent should validate input on receipt and request re-generation if schema violations are found
8. **Integrity gating**: Artifacts that have passed through integrity verification (Schema 5) must have their Material Passport updated with `verification_status: "VERIFIED"` and `integrity_pass_date`
9. **Staleness detection**: If an upstream artifact is modified after a downstream artifact was produced, the downstream artifact's Material Passport should be updated to `verification_status: "STALE"`
10. **Passport freshness**: A Material Passport's integrity results are considered STALE if `integrity_pass_date` is more than 24 hours old relative to the current timestamp. Stale passports require re-verification before proceeding
11. **Stage-skip eligibility via passport**: A passport allows skipping Stage 2.5 (pre-review integrity) ONLY when ALL of the following conditions are met: (a) `verification_status` = `"VERIFIED"`, (b) `integrity_pass_date` is within the current session or less than 24 hours old, (c) `version_label` matches the current artifact version (content has not been modified since verification), and (d) the user explicitly confirms the skip. If any condition fails, full Stage 2.5 re-verification is required
12. **Passport does not grant Stage 4.5 skip**: The final integrity check (Stage 4.5) can NEVER be skipped via Material Passport, regardless of passport status. Stage 4.5 always requires full Mode 2 verification
````

#### After

````markdown
<!--rs:GATE-006-->
### ResearchSpec Current Owner

Replacement scope: `GATE-006` for `shared`.

4. **Traceable handoff:** every boundary file is resolved by its unique role and
   safe project-relative path from
   `researchspec/subflows/<instance>/handoff.md`. When a producer supersedes a
   file, it updates the owning handoff entry instead of creating another
   lifecycle authority.
5. **Failure on missing:** missing required fields or boundary files produce
   `HANDOFF_INCOMPLETE` with the exact gaps; consumers do not proceed partially.
6. **Producer validation:** the producer validates the payload shape before
   returning the file to the producing subflow for handoff recording.
7. **Consumer validation:** the consumer checks the declared role, path, payload
   shape, and required upstream human-confirmed Gate attempts before use;
   violations request a corrected boundary file rather than an in-place edit.
8. **Integrity gating:** verification status comes from the Gate attempt in
   `researchspec/subflows/<instance>/control.yaml`, not from a mutable field in
   the boundary file.
9. **Staleness detection:** when an upstream boundary file changes, dependent
   findings and prior Gate attempts must be recomputed before they authorize a
   transition.
10. **Freshness:** apply the profile's configured freshness policy to Gate
    attempts and their referenced boundary inputs. Expired evidence requires
    re-verification.
11. **Stage-skip eligibility:** a profile-declared optional stage may be skipped
    only when the current inputs satisfy its Gate requirements and the user
    confirms the skip through the CLI.
12. **Final integrity is never skipped:** a required final-integrity Gate always
    performs its configured verification, regardless of external metadata or
    earlier Gate attempts.

The producing Agent writes validated boundary references to the owning handoff
and returns formal findings to ResearchSpec CLI. The CLI is the only writer for
Gate, Decision, frontier, and transition mutations in `control.yaml`.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:GATE-006-->
````

### HANDOFF-003

- Anchor name: `shared.handoff.schema-convention`
- Owner skill: `shared`
- Source path: `shared/handoff_schemas.md`
- Severity: `required`
- Semantic role: `handoff_projection`
- Replacement shape: `schema_projection_table`
- Replacement body SHA-256: `137a443071b29772cac9ed76618ab7305798b9ee10c34f039455bb314eba4f7a`
- ResearchSpec targets: `researchspec/specs/project.md`, `researchspec/specs/sources.yaml`, `researchspec/specs/claims.yaml`, `researchspec/specs/manuscript.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/shared/handoff_schemas.md`, `academic-paper-reviewer/references/shared/handoff_schemas.md`, `academic-pipeline/references/shared/handoff_schemas.md`, `deep-research/references/shared/handoff_schemas.md`
- Before SHA-256: `24f2f8a9080227d39b038d392b831f95ef5dc249a0ccb74644b80d965449b2a7`
- After SHA-256: `bb567dfe542919cd2b72e95a476b7e9b666d4326bbaac3a5b32f5bc9f6318d3c`

#### Before

````markdown
> **Convention**: All schemas use Markdown-based structured output. Agents MUST validate required fields before accepting a handoff. Missing required fields trigger a `HANDOFF_INCOMPLETE` failure path.
````

#### After

````markdown
<!--rs:HANDOFF-003-->
### ResearchSpec Current Owner

Replacement scope: `HANDOFF-003` for `shared`.

> **Convention**: ARSU Markdown contracts remain human-readable payload formats,
> while ResearchSpec specs, controls, and handoffs are the stable project
> interfaces. Producers must validate every required payload field, write the
> boundary file outside `researchspec/`, and record its role and path in
> `researchspec/subflows/<instance>/handoff.md`. Project research intent,
> sources, claims, and manuscript constraints into their corresponding
> `researchspec/specs/*` files only through accepted contract changes. Missing
> required fields trigger `HANDOFF_INCOMPLETE`; consumers must not proceed with
> a partial handoff.

Current ResearchSpec owners:

- `researchspec/specs/project.md`
- `researchspec/specs/sources.yaml`
- `researchspec/specs/claims.yaml`
- `researchspec/specs/manuscript.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:HANDOFF-003-->
````

### REVIEW-015

- Anchor name: `shared.handoff.schema11-commitments`
- Owner skill: `shared`
- Source path: `shared/handoff_schemas.md`
- Severity: `required`
- Semantic role: `review_handoff_tracking`
- Replacement shape: `schema_projection_table`
- Replacement body SHA-256: `7fe36cd42da1ecb9be1ae6a2a42b6dbe7fa0136078640078ddc98bd87d7c24a1`
- ResearchSpec targets: `researchspec/changes/<change-id>/change.md`, `assets/shared/contracts/patch/revision_patch.schema.json`, `researchspec/subflows/<instance>/handoff.md`, `researchspec/subflows/<instance>/control.yaml`
- Generated output paths: `academic-paper/references/shared/handoff_schemas.md`, `academic-paper-reviewer/references/shared/handoff_schemas.md`, `academic-pipeline/references/shared/handoff_schemas.md`, `deep-research/references/shared/handoff_schemas.md`
- Before SHA-256: `3773a18fe88945df922430c6423aa3a96c68d8c2ffafd991abba6442aa119d87`
- After SHA-256: `cd1a187e77824c8f61e0cfc6bad846eb49d7d0c63dc7c4d8371d4532fee7f14e`

#### Before

````markdown
**Consumer**: academic-paper (revision mode, if further revision needed), pipeline orchestrator. Schema 11 is carried forward via Material Passport (Schema 9) for cross-stage audit.
````

#### After

````markdown
<!--rs:REVIEW-015-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-015` for `shared`.

Write the review report and revision roadmap as explicit boundary deliverables
outside `researchspec/`, then record their roles and paths in the producing
handoff. A downstream revision reads those paths directly. Use a project change
when the accepted response alters stable scope, claims, or manuscript structure;
use the ARSU revision patch only for explicit manuscript operations. Formal
review and revision consequences remain in the owning control.

Current ResearchSpec owners:

- `researchspec/changes/<change-id>/change.md`
- `assets/shared/contracts/patch/revision_patch.schema.json`
- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-015-->
````

### STATE-009

- Anchor name: `shared.handoff.schema9-material-passport`
- Owner skill: `shared`
- Source path: `shared/handoff_schemas.md`
- Severity: `required`
- Semantic role: `subflow_control_boundary`
- Replacement shape: `artifact_projection_block`
- Replacement body SHA-256: `367c00a2453c02f482fc5d4c17b352713ccfc123ddd1cb402c787deaf18a828d`
- ResearchSpec targets: `researchspec/subflows/<instance>/control.yaml`, `researchspec/subflows/<instance>/handoff.md`
- Generated output paths: `academic-paper/references/shared/handoff_schemas.md`, `academic-paper-reviewer/references/shared/handoff_schemas.md`, `academic-pipeline/references/shared/handoff_schemas.md`, `deep-research/references/shared/handoff_schemas.md`
- Before SHA-256: `66d6edfd32f6fbfc4ea2198020b68fd8bc21c91265e5fadd22b3a69e8ecd59f5`
- After SHA-256: `fddaa1b8fb562c009c01db7ff60222de97a299120c32f0e369752045b606600e`

#### Before

````markdown
When `ARS_PASSPORT_RESET=1`, Schema 9 gains an append-only `reset_boundary[]` ledger with two entry kinds: `boundary` (recorded at FULL checkpoints) and `resume` (recorded when a boundary is consumed):
````

#### After

````markdown
<!--rs:STATE-009-->
### ResearchSpec Current Owner

Replacement scope: `STATE-009` for `shared`.

Treat any external state bundle as an ordinary immutable input file. Record only
its current role, type, path, purpose, and limits in the consuming subflow's
handoff. Do not copy its state fields into the current control or infer a Gate,
Decision, checkpoint, transition, or completion result from it.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:STATE-009-->
````

## Diagnostic-Only Anchors

### ARTIFACT-003

- Source path: `shared/artifact_reproducibility_pattern.md`
- Matched: `true`
- Severity: `diagnostic`
- Diagnostics: _none_

### ARTIFACT-004

- Source path: `shared/style_calibration_protocol.md`
- Matched: `true`
- Severity: `diagnostic`
- Diagnostics: _none_
