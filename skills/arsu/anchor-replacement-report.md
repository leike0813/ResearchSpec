# ARSU Anchor Replacement Report

This report is for human audit of generated ARSU contract replacements. It is not a runtime ResearchSpec contract.

## Replaced Anchors

### anchor.paper.draft-writer.claim-intent-passport

- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/draft_writer_agent.md`
- Marker id: `864203db358e`
- Severity: `required`
- Semantic role: `claim_contract_projection`
- Replacement shape: `artifact_projection_block`
- Template id: `claim-intent-manifest-to-researchspec-claims`
- ResearchSpec targets: `researchspec/specs/claims.yaml`, `researchspec/changes/<change-id>/contract-patch.yaml`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/agents/draft_writer_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `academic-pipeline/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `deep-research/references/cross-skill/academic-paper/agents/draft_writer_agent.md`
- Before SHA-256: `cd600a01478b854779f28248cfde9c4be266358c4ba2232ca4e88b4f51f22134`
- After SHA-256: `c3dbfc8c84669703ed03f68789f678587f64973c1b62c77fbaaf757e8b78b43f`

#### Before

````markdown
Before drafting the first prose block of the paper draft, append ONE `claim_intent_manifests[]` entry to the Material Passport listing the substantive claims the draft intends to make and any author-declared "must not" rules. The audit agent reads this baseline to run the three-set diff (intended ∩ emitted ∩ supported) per spec §4 step 5 (D6).
````

#### After

````markdown
<!--rs:a:864203db358e-->
### ResearchSpec Claim Projection

Claim intent is projected into ResearchSpec claim contracts or proposed contract patches.

#### Claim Writes

- Use `researchspec/specs/claims.yaml` for accepted claim ids, wording constraints, support, and limits.
- Use `researchspec/changes/<change-id>/contract-patch.yaml` for high-impact changes to claim scope or strength.
- Emit claim-intent manifests as artifacts for runtime registration.

#### Mutation Boundary

- Treat `researchspec/specs/claims.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.

<!--/rs:a:864203db358e-->
````

### anchor.paper.draft-writer.generator-contract-runtime

- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/draft_writer_agent.md`
- Marker id: `3fb37f9582cb`
- Severity: `required`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `checklist`
- Template id: `writer-generator-contract-to-researchspec-runtime`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper/agents/draft_writer_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `academic-pipeline/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `deep-research/references/cross-skill/academic-paper/agents/draft_writer_agent.md`
- Before SHA-256: `e63341155ff9ca906c4cdcadf2c49149d211c5cda6745813b54f684c8de8ff08`
- After SHA-256: `26381a36f108900d8dfc9b4bf5b62d26fcb0dd12b984695b304b96ae9ce41636`

#### Before

````markdown
> Authoritative system-prompt sub-sections for the v3.6.6 writer half of the contract-gated phase split. Used by `academic-paper full` mode only. Pinned by the orchestrator block in `academic-paper/SKILL.md` § "v3.6.6 Generator-Evaluator Contract Protocol". Schema 13.1 contract template: `shared/contracts/writer/full.json`. Design spec: `docs/design/2026-04-27-ars-v3.6.6-generator-evaluator-contract-design.md` §5.
````

#### After

````markdown
<!--rs:a:3fb37f9582cb-->
### ResearchSpec Writer Phase Contract

Keep the paper-blind Phase 4a commitment and paper-visible Phase 4b drafting split; resolve their contract and outputs as registered artifacts.

#### Phase Records

- Resolve writer contract JSON and prior phase artifacts through `researchspec/runs/current/artifact-registry.json`.
- Return lint and failure-condition outcomes to the gate helper for `researchspec/runs/current/gate-ledger.jsonl`.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:3fb37f9582cb-->
````

### anchor.paper.draft-writer.patch-emission

- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/draft_writer_agent.md`
- Marker id: `441c2013e179`
- Severity: `required`
- Semantic role: `draft_patch_protocol`
- Replacement shape: `patch_protocol_block`
- Template id: `draft-writer-patch-emission-to-researchspec-draft-patch`
- ResearchSpec targets: `researchspec/draft-patches/<patch-id>.json`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/agents/draft_writer_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `academic-pipeline/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `deep-research/references/cross-skill/academic-paper/agents/draft_writer_agent.md`
- Before SHA-256: `c02ef296df2d957dda7091ab50380f18c6d67201622cb7b8cb54de05501f398c`
- After SHA-256: `f7c581ccd345c9625b8dccfdc5d2718da7cd6ce6a00c6601f7d996cc7d4b9323`

#### Before

````markdown
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
````

#### After

````markdown
<!--rs:a:441c2013e179-->
### ResearchSpec Patch Emission

When revising, the writer emits patch records and leaves application to deterministic helpers.

#### Patch Output

- Write `researchspec/draft-patches/<patch-id>.json` with stable patch id, target artifact id, block preconditions, operations, and traceability.
- Emit supporting reviewer-roadmap or response artifacts for runtime registration.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.

<!--/rs:a:441c2013e179-->
````

### anchor.paper.draft-writer.phase-boundary

- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/draft_writer_agent.md`
- Marker id: `a3acf40b9c5e`
- Severity: `recommended`
- Semantic role: `contract_io_boundary`
- Replacement shape: `io_contract_block`
- Template id: `paper-agent-phase-boundary-to-contract-io`
- ResearchSpec targets: `researchspec/specs/manuscript.yaml`, `researchspec/specs/claims.yaml`, `researchspec/runs/current/artifact-registry.json`, `researchspec/draft-patches/<patch-id>.json`
- Generated output paths: `academic-paper/agents/draft_writer_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `academic-pipeline/references/cross-skill/academic-paper/agents/draft_writer_agent.md`, `deep-research/references/cross-skill/academic-paper/agents/draft_writer_agent.md`
- Before SHA-256: `138a42d038f6cb1615222289a359cee488cc218c199c96f2353f0971e13a5a39`
- After SHA-256: `eed51ace894593519d9ff9a81e654f04febf12701add1e8086b8fcdc068229c6`

#### Before

````markdown
You MAY READ files in upstream phases (`phase0_*/` through `phase{N-1}_*/`) plus your own phase. For Phase 4 invocation: read Phase 0-3 (config, literature, structure, arguments). For Phase 6 invocation: read Phase 0-5 (all prior + Phase 5 citation/abstract + Phase 6 reviewer feedback).
````

#### After

````markdown
<!--rs:a:a3acf40b9c5e-->
### ResearchSpec Drafting Contract I/O

Drafting and revision agents operate on explicit ResearchSpec inputs and declared write surfaces.

#### Contract Inputs

- Read manuscript structure from `researchspec/specs/manuscript.yaml`.
- Read allowed claims and evidence limits from `researchspec/specs/claims.yaml`.
- Resolve outlines, blueprints, and drafts through `researchspec/runs/current/artifact-registry.json`.

#### Writes Allowed

- Initial drafting writes a registered draft artifact.
- Revision rounds write `researchspec/draft-patches/<patch-id>.json` unless explicitly escalated to full re-emission.

#### Mutation Boundary

- Treat `researchspec/specs/manuscript.yaml`, `researchspec/specs/claims.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.

<!--/rs:a:a3acf40b9c5e-->
````

### anchor.paper.intake.terminal-policy-passport

- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/intake_agent.md`
- Marker id: `36f017b67e7e`
- Severity: `required`
- Semantic role: `decision_ledger_entry`
- Replacement shape: `checklist`
- Template id: `terminal-policy-to-researchspec-decision`
- ResearchSpec targets: `researchspec/specs/workflow.yaml`, `researchspec/runs/current/decision-ledger.jsonl`
- Generated output paths: `academic-paper/agents/intake_agent.md`
- Before SHA-256: `8eaf97c63071b8bb1f3735e448a6e92163af7067b6d537c3ef2bf27540a6adfa`
- After SHA-256: `f3c197e5838d19f5d97106563d7c17123383068d119648436217678871a84390`

#### Before

````markdown
- Answer `strict` → record `strict` in the PCR `Citation Verification` row, and ensure the Material Passport carries `terminal_policies.citation_existence: strict` at the point the passport is materialized or next updated in this run (corpus creation, adapter import, or pre-finalizer setup). The finalizer remains the sole policy *evaluator* — this step only writes the scholar's declared policy, never evaluates it.
````

#### After

````markdown
<!--rs:a:36f017b67e7e-->
### ResearchSpec Citation Policy Decision

Citation terminal policy is a human-selected workflow decision, not a Material Passport mutation.

#### Decision Handling

- Read supported policy choices from `researchspec/specs/workflow.yaml`.
- After the scholar selects a policy, return the choice to the runtime for decision-ledger recording.

#### Mutation Boundary

- Treat `researchspec/specs/workflow.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.

<!--/rs:a:36f017b67e7e-->
````

### anchor.paper.literature-strategist.corpus-passport

- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/literature_strategist_agent.md`
- Marker id: `4d7408f706a8`
- Severity: `required`
- Semantic role: `source_contract_projection`
- Replacement shape: `artifact_projection_block`
- Template id: `literature-corpus-passport-to-researchspec-sources`
- ResearchSpec targets: `researchspec/specs/sources.yaml`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/agents/literature_strategist_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/agents/literature_strategist_agent.md`, `academic-pipeline/references/cross-skill/academic-paper/agents/literature_strategist_agent.md`, `deep-research/references/cross-skill/academic-paper/agents/literature_strategist_agent.md`
- Before SHA-256: `c91c0b02261c8f02fd616f201a5531d6822ad17ce31dd2a79cc2fd36dec838a8`
- After SHA-256: `87d5a70c8806f6f0bdbf14266a7ea6c5ad710966bbce8bbcc2cf1ffd9094bf2f`

#### Before

````markdown
When the input Material Passport carries a non-empty `literature_corpus[]`, this agent enters the **corpus-first, search-fills-gap** flow. The flow has five steps and four Iron Rules; the PRE-SCREENED block makes corpus utilisation reproducible. The merged `final_included` set feeds the Annotated Bibliography, Literature Matrix, Research Gap Identification, and Recommended Sources by Paper Section sections above without altering their formats.
````

#### After

````markdown
<!--rs:a:4d7408f706a8-->
### ResearchSpec Source Corpus

Literature corpus inputs are owned by ResearchSpec source contracts and registered artifacts.

#### Source Reads

- Read canonical source ids, citation keys, screening status, and trust metadata from `researchspec/specs/sources.yaml`.
- Resolve bibliography reports and literature matrices through `researchspec/runs/current/artifact-registry.json`.

#### Mutation Boundary

- Treat `researchspec/specs/sources.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.

<!--/rs:a:4d7408f706a8-->
````

### anchor.paper.peer-reviewer.evaluator-contract-runtime

- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/peer_reviewer_agent.md`
- Marker id: `39128006ddb6`
- Severity: `required`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `checklist`
- Template id: `peer-evaluator-contract-to-researchspec-runtime`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper/agents/peer_reviewer_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/agents/peer_reviewer_agent.md`, `academic-pipeline/references/cross-skill/academic-paper/agents/peer_reviewer_agent.md`, `deep-research/references/cross-skill/academic-paper/agents/peer_reviewer_agent.md`
- Before SHA-256: `4ab16f5faffe69438ca13115b19eede4d3b4cea8bd173d4112910d9243820158`
- After SHA-256: `b1d76e908c6527b3b278b0da1aae0fdde702ad8afa575793b7ed7f6e540bbc8a`

#### Before

````markdown
> Authoritative system-prompt sub-sections for the v3.6.6 evaluator half of the contract-gated phase split. Used by `academic-paper full` mode only. Pinned by the orchestrator block in `academic-paper/SKILL.md` § "v3.6.6 Generator-Evaluator Contract Protocol". Schema 13.1 contract template: `shared/contracts/evaluator/full.json`. Design spec: `docs/design/2026-04-27-ars-v3.6.6-generator-evaluator-contract-design.md` §5.
>
> **`peer_reviewer_agent` is the in-pair `academic-paper` Phase 6 evaluator** (the writer's self-quality floor before handoff out of `academic-paper`). It is **not** the v3.6.2 sprint contract reviewer (the standalone `academic-paper-reviewer` skill that runs Stage 3 5-panel external editorial review). Both layers run in `academic-pipeline full` deployments; the v3.6.6 contract gate operates on this in-pair Phase 6 evaluator only.
````

#### After

````markdown
<!--rs:a:39128006ddb6-->
### ResearchSpec Evaluator Phase Contract

Keep the paper-blind Phase 6a commitment and paper-visible Phase 6b evaluation split; resolve their contract and outputs as registered artifacts.

#### Phase Records

- Resolve evaluator contract JSON and writer commitments through `researchspec/runs/current/artifact-registry.json`.
- Return evaluator decisions and blocking findings to the gate helper for `researchspec/runs/current/gate-ledger.jsonl`.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:39128006ddb6-->
````

### anchor.paper.revision-coach.commitment-ledger

- Owner skill: `academic-paper`
- Source path: `academic-paper/agents/revision_coach_agent.md`
- Marker id: `70b27456fa15`
- Severity: `required`
- Semantic role: `review_commitment_tracking`
- Replacement shape: `schema_projection_table`
- Template id: `revision-coach-commitments-to-researchspec-changes`
- ResearchSpec targets: `researchspec/changes/<change-id>/contract-patch.yaml`, `researchspec/draft-patches/<patch-id>.json`, `researchspec/runs/current/decision-ledger.jsonl`
- Generated output paths: `academic-paper/agents/revision_coach_agent.md`
- Before SHA-256: `58ab269816913477f725577ef4eec70c4c805150153c59ebf2058f7a0920680b`
- After SHA-256: `954b5ac247ab0ac68541cdc292dd9aa5b9abcb189f46fe5ed42d0885e63a5871`

#### Before

````markdown
5. Output: write the commitment list into `commitment_extracted` field of the Schema 11 row for that `concern_id`. At this stage each commitment object carries only the three extraction fields (`commitment_text` / `commitment_type` / `required_evidence_type`). The lifecycle fields `fulfillment_status` and `unfulfilled_rationale` are **nested inside the same object** but are **absent now** — they are appended per-object during revision execution and verified in re-review (Schema 11 nested-object shape, #268). Do not emit placeholder keys for them.
````

#### After

````markdown
<!--rs:a:70b27456fa15-->
### ResearchSpec Revision Commitment Planning

Revision commitments are separated into contract changes, draft patches, and human decisions.

#### Commitment Routing

- Research-scope or claim commitments go to `researchspec/changes/<change-id>/contract-patch.yaml`.
- Manuscript-text commitments go to `researchspec/draft-patches/<patch-id>.json`.
- Tradeoffs and rejected reviewer requests go to `researchspec/runs/current/decision-ledger.jsonl`.

#### Mutation Boundary

- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.

<!--/rs:a:70b27456fa15-->
````

### anchor.paper.revision-patch-reference

- Owner skill: `academic-paper`
- Source path: `academic-paper/references/revision_patch_protocol.md`
- Marker id: `323dc5aad0a2`
- Severity: `required`
- Semantic role: `draft_patch_protocol`
- Replacement shape: `patch_protocol_block`
- Template id: `revision-patch-protocol-to-researchspec`
- ResearchSpec targets: `researchspec/draft-patches/<patch-id>.json`, `researchspec/runs/current/gate-ledger.jsonl`, `researchspec/runs/current/decision-ledger.jsonl`
- Generated output paths: `academic-paper/references/revision_patch_protocol.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/references/revision_patch_protocol.md`, `academic-pipeline/references/cross-skill/academic-paper/references/revision_patch_protocol.md`, `deep-research/references/cross-skill/academic-paper/references/revision_patch_protocol.md`
- Before SHA-256: `1ee580a6373cf5c1e338cb186fc7e1dbdb6eadc515397edb92924d8483a553b6`
- After SHA-256: `8890ac10e77384ab659af36cab884c8bb054d251856bd8ebfb7838f7d7c7e762`

#### Before

````markdown
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
````

#### After

````markdown
<!--rs:a:323dc5aad0a2-->
### ResearchSpec Revision Patch Reference

The patch protocol is ResearchSpec-owned: generate patch JSON, verify preconditions, then apply after approval.

#### Patch Contract

- Store operations in `researchspec/draft-patches/<patch-id>.json`.
- Use `researchspec/runs/current/gate-ledger.jsonl` for hash/precondition failures.
- Use `researchspec/runs/current/decision-ledger.jsonl` for apply approval and unresolved tradeoffs.

#### Mutation Boundary

- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:323dc5aad0a2-->
````

### anchor.paper.skill.generator-evaluator-contract

- Owner skill: `academic-paper`
- Source path: `academic-paper/SKILL.md`
- Marker id: `1ee970b484f3`
- Severity: `required`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `checklist`
- Template id: `generator-evaluator-contract-to-researchspec-runtime`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper/SKILL.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/SKILL.md`, `academic-pipeline/references/cross-skill/academic-paper/SKILL.md`, `deep-research/references/cross-skill/academic-paper/SKILL.md`
- Before SHA-256: `f946f4b2af4d0f2988d516e7be7441defc3f3b1973f80e8a545acb57260bbf94`
- After SHA-256: `cf64c5dc0bb5d86462026692174ae0e7952cb5f085f3095a3580329d930b102b`

#### Before

````markdown
> Authoritative orchestration block for the v3.6.6 contract-gated phase splits inside `academic-paper full` mode. Schema 13.1 since v3.6.6 (`shared/sprint_contract.schema.json`). Templates: `shared/contracts/writer/full.json` + `shared/contracts/evaluator/full.json`. Design spec: `docs/design/2026-04-27-ars-v3.6.6-generator-evaluator-contract-design.md` §5.
````

#### After

````markdown
<!--rs:a:1ee970b484f3-->
### ResearchSpec Generator/Evaluator Contract

Generator/evaluator outputs remain phase artifacts; gate outcomes belong in ResearchSpec ledgers.

#### Generator Output

- Emit generated contract JSON or draft artifacts for runtime registration.
- Treat evaluator feedback as diagnostics tied to those artifacts.

#### Evaluator Gate

- Return pass, fail, and blocking findings to the evaluator gate helper.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:1ee970b484f3-->
````

### anchor.paper.skill.material-passport-state

- Owner skill: `academic-paper`
- Source path: `academic-paper/SKILL.md`
- Marker id: `e4b2f31f60bf`
- Severity: `required`
- Semantic role: `runtime_state_boundary`
- Replacement shape: `protocol_block`
- Template id: `academic-paper-state-to-researchspec-runtime`
- ResearchSpec targets: `researchspec/specs/workflow.yaml`, `researchspec/runs/current/state.yaml`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/SKILL.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/SKILL.md`, `academic-pipeline/references/cross-skill/academic-paper/SKILL.md`, `deep-research/references/cross-skill/academic-paper/SKILL.md`
- Before SHA-256: `a4996c0d2b682365c4675cb5bde7b106fdad529c301bff428e303b418615f63d`
- After SHA-256: `61e627adbeae78f1c41ae43277dce71c19f7e7b10f236a2cf6a3da300f12731c`

#### Before

````markdown
**Mode A — orchestrator-driven (default):** `pipeline_orchestrator_agent` (in `academic-pipeline` skill) runs all phases end-to-end with state tracking via Material Passport.

**Mode B — phase-by-phase (cross-session resume):** User invokes one agent per phase across sessions for long-running projects. Common pattern: write the draft in one session, return next week to citation-check / abstract / peer-review independently.
````

#### After

````markdown
<!--rs:a:e4b2f31f60bf-->
### ResearchSpec Paper Runtime

The academic-paper skill reads its active phase and inputs from ResearchSpec runtime state.

#### Runtime Reads

- Read `researchspec/specs/workflow.yaml` for phase ordering and mode constraints.
- Read `researchspec/runs/current/state.yaml` for the active phase and invocation mode.
- Resolve upstream research, outline, and draft artifacts through `researchspec/runs/current/artifact-registry.json`.

#### Mutation Boundary

- Treat `researchspec/specs/workflow.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Request changes to `researchspec/runs/current/state.yaml` through the ResearchSpec orchestrator or runtime helper; do not edit run state directly.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.

<!--/rs:a:e4b2f31f60bf-->
````

### anchor.paper.skill.rebuttal-audit-boundary

- Owner skill: `academic-paper`
- Source path: `academic-paper/SKILL.md`
- Marker id: `9c17c320d570`
- Severity: `recommended`
- Semantic role: `artifact_provenance`
- Replacement shape: `artifact_projection_block`
- Template id: `rebuttal-audit-advisory-artifact`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/decision-ledger.jsonl`
- Generated output paths: `academic-paper/SKILL.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/SKILL.md`, `academic-pipeline/references/cross-skill/academic-paper/SKILL.md`, `deep-research/references/cross-skill/academic-paper/SKILL.md`
- Before SHA-256: `9c9e7b8667bdd300ce840cc9ef5290ceba98e67aa5428ee9d60ecc90a402ea70`
- After SHA-256: `18ada3fe7a3c20aa95c209a92e6ca4b0cba34731c47b7bf92f278c5dcf9fbff5`

#### Before

````markdown
**IRON RULE — integrity boundary (no false certification):** `rebuttal-audit` reuses `revision_coach_agent`'s comment-parsing capability, but a standalone invocation runs **outside** the pipeline and therefore never passes Stage 4.5 final integrity. It **MUST NOT** emit a Schema 11 `commitment_extracted` ledger, **MUST NOT** write to the Material Passport, and **MUST NOT** mark the package `ready_to_submit` or any verified status. Producing a Schema 11 artifact would falsely imply the response entered the pipeline's traceability system. The output is an advisory QA report only.
````

#### After

````markdown
<!--rs:a:9c17c320d570-->
### ResearchSpec Rebuttal Audit Artifact

Standalone rebuttal audits are advisory artifacts until a human accepts a change.

#### Artifact Rule

- Emit the audit report as an advisory artifact for runtime registration.
- Do not mutate claims, manuscript scope, or response strategy without a decision in `researchspec/runs/current/decision-ledger.jsonl`.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.

<!--/rs:a:9c17c320d570-->
````

### anchor.paper.skill.revision-patch-mode

- Owner skill: `academic-paper`
- Source path: `academic-paper/SKILL.md`
- Marker id: `5e4e6dba8826`
- Severity: `required`
- Semantic role: `draft_patch_protocol`
- Replacement shape: `patch_protocol_block`
- Template id: `academic-paper-revision-patch-to-researchspec-draft-patches`
- ResearchSpec targets: `researchspec/draft-patches/<patch-id>.json`, `researchspec/runs/current/decision-ledger.jsonl`
- Generated output paths: `academic-paper/SKILL.md`, `academic-paper-reviewer/references/cross-skill/academic-paper/SKILL.md`, `academic-pipeline/references/cross-skill/academic-paper/SKILL.md`, `deep-research/references/cross-skill/academic-paper/SKILL.md`
- Before SHA-256: `b21fad1685c4f1207182fd9a6ddb3d3e3103523084f005256eae31e3082cbd03`
- After SHA-256: `b68bca8238f8e86bc2a3a3aa4842246850dd9dc6cb820d9f885a5c65e3f570c4`

#### Before

````markdown
1. **Anchorize** the draft (`scripts/ars_anchorize_draft.py` — idempotent, content-neutral): every block gets a stable `<!--block:BNNNN-->` marker; a block manifest (`base_draft_hash` + per-block `old_hash`) is regenerated. Nothing may rewrite the draft between this step and apply.
2. **The writer emits a patch document** (`shared/contracts/patch/revision_patch.schema.json`) as a sidecar file in its `phase6_*/` fence — block ops with hash preconditions copied from the manifest, each op tracing to `roadmap_item_ids`. See `agents/draft_writer_agent.md` § Patch-Document Revision Emission.
````

#### After

````markdown
<!--rs:a:5e4e6dba8826-->
### ResearchSpec Revision Patch Mode

Revision mode emits structured draft patches instead of rewriting the manuscript in place.

#### Patch Format

- Write manuscript edits to `researchspec/draft-patches/<patch-id>.json`.
- Include block ids, old hashes, operation type, replacement text, and reviewer-roadmap traceability.

#### Apply Boundary

- Apply only after the required human decision exists in `researchspec/runs/current/decision-ledger.jsonl`.

#### Mutation Boundary

- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.

<!--/rs:a:5e4e6dba8826-->
````

### anchor.reviewer.agent.devils_advocate_reviewer.sprint-contract-phase-model

- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md`
- Marker id: `46383d1899f3`
- Severity: `recommended`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `io_contract_block`
- Template id: `reviewer-agent-sprint-phases-to-contract-io`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md`, `deep-research/references/cross-skill/academic-paper-reviewer/agents/devils_advocate_reviewer_agent.md`
- Before SHA-256: `8f4f7fb28a599cbccf8ec5b8030db24d4d60bd3b3c18cb9541dcb9edf1d25d00`
- After SHA-256: `6c4a70c52dfca5803f2f627de1cc43666d3c1a11e42e09d30c18e1e25dc0ec3c`

#### Before

````markdown
You operate in two phases when invoked under a sprint contract. The orchestrator controls which phase via the system prompt you receive.
````

#### After

````markdown
<!--rs:a:46383d1899f3-->
### ResearchSpec Reviewer Contract I/O

Preserve the paper-blind pre-commitment and paper-visible evaluation split while resolving its contracts and phase artifacts through ResearchSpec.

#### Contract Inputs

- Resolve manuscript, venue, and prior review context through `researchspec/runs/current/artifact-registry.json`.

#### Contract Outputs

- Register review reports, matrices, and diagnostics as artifacts.
- Return blocking review findings to the review gate helper.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:46383d1899f3-->
````

### anchor.reviewer.agent.sprint-contract-phase-model

- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/agents/domain_reviewer_agent.md`
- Marker id: `d50caa734220`
- Severity: `recommended`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `io_contract_block`
- Template id: `reviewer-agent-sprint-phases-to-contract-io`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper-reviewer/agents/domain_reviewer_agent.md`
- Before SHA-256: `8f4f7fb28a599cbccf8ec5b8030db24d4d60bd3b3c18cb9541dcb9edf1d25d00`
- After SHA-256: `75e4516902ba70af3eadd8366448e613ae35d662dd46181b4692c90cfc23b7b7`

#### Before

````markdown
You operate in two phases when invoked under a sprint contract. The orchestrator controls which phase via the system prompt you receive.
````

#### After

````markdown
<!--rs:a:d50caa734220-->
### ResearchSpec Reviewer Contract I/O

Preserve the paper-blind pre-commitment and paper-visible evaluation split while resolving its contracts and phase artifacts through ResearchSpec.

#### Contract Inputs

- Resolve manuscript, venue, and prior review context through `researchspec/runs/current/artifact-registry.json`.

#### Contract Outputs

- Register review reports, matrices, and diagnostics as artifacts.
- Return blocking review findings to the review gate helper.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:d50caa734220-->
````

### anchor.reviewer.agent.eic.sprint-contract-phase-model

- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/agents/eic_agent.md`
- Marker id: `0315a2e071e7`
- Severity: `recommended`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `io_contract_block`
- Template id: `reviewer-agent-sprint-phases-to-contract-io`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper-reviewer/agents/eic_agent.md`
- Before SHA-256: `8f4f7fb28a599cbccf8ec5b8030db24d4d60bd3b3c18cb9541dcb9edf1d25d00`
- After SHA-256: `a9f121513be11e2df4b83ef7dbec0031d6ba75396747c15eb638606ffde23783`

#### Before

````markdown
You operate in two phases when invoked under a sprint contract. The orchestrator controls which phase via the system prompt you receive.
````

#### After

````markdown
<!--rs:a:0315a2e071e7-->
### ResearchSpec Reviewer Contract I/O

Preserve the paper-blind pre-commitment and paper-visible evaluation split while resolving its contracts and phase artifacts through ResearchSpec.

#### Contract Inputs

- Resolve manuscript, venue, and prior review context through `researchspec/runs/current/artifact-registry.json`.

#### Contract Outputs

- Register review reports, matrices, and diagnostics as artifacts.
- Return blocking review findings to the review gate helper.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:0315a2e071e7-->
````

### anchor.reviewer.agent.methodology_reviewer.sprint-contract-phase-model

- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/agents/methodology_reviewer_agent.md`
- Marker id: `391f53b80d6f`
- Severity: `recommended`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `io_contract_block`
- Template id: `reviewer-agent-sprint-phases-to-contract-io`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper-reviewer/agents/methodology_reviewer_agent.md`
- Before SHA-256: `8f4f7fb28a599cbccf8ec5b8030db24d4d60bd3b3c18cb9541dcb9edf1d25d00`
- After SHA-256: `318e1b3add939f7167ea5cd99ce72cd1eca0f085b5ded658a071a9f87c409ade`

#### Before

````markdown
You operate in two phases when invoked under a sprint contract. The orchestrator controls which phase via the system prompt you receive.
````

#### After

````markdown
<!--rs:a:391f53b80d6f-->
### ResearchSpec Reviewer Contract I/O

Preserve the paper-blind pre-commitment and paper-visible evaluation split while resolving its contracts and phase artifacts through ResearchSpec.

#### Contract Inputs

- Resolve manuscript, venue, and prior review context through `researchspec/runs/current/artifact-registry.json`.

#### Contract Outputs

- Register review reports, matrices, and diagnostics as artifacts.
- Return blocking review findings to the review gate helper.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:391f53b80d6f-->
````

### anchor.reviewer.agent.perspective_reviewer.sprint-contract-phase-model

- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/agents/perspective_reviewer_agent.md`
- Marker id: `6f2d6d03c63c`
- Severity: `recommended`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `io_contract_block`
- Template id: `reviewer-agent-sprint-phases-to-contract-io`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper-reviewer/agents/perspective_reviewer_agent.md`
- Before SHA-256: `8f4f7fb28a599cbccf8ec5b8030db24d4d60bd3b3c18cb9541dcb9edf1d25d00`
- After SHA-256: `04f76dadf641746553d6810520d5a1457f8ab3563aaba4bbd7f5491d5ba7c539`

#### Before

````markdown
You operate in two phases when invoked under a sprint contract. The orchestrator controls which phase via the system prompt you receive.
````

#### After

````markdown
<!--rs:a:6f2d6d03c63c-->
### ResearchSpec Reviewer Contract I/O

Preserve the paper-blind pre-commitment and paper-visible evaluation split while resolving its contracts and phase artifacts through ResearchSpec.

#### Contract Inputs

- Resolve manuscript, venue, and prior review context through `researchspec/runs/current/artifact-registry.json`.

#### Contract Outputs

- Register review reports, matrices, and diagnostics as artifacts.
- Return blocking review findings to the review gate helper.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:6f2d6d03c63c-->
````

### anchor.reviewer.reference.rereview-commitment-verification

- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/references/re_review_mode_protocol.md`
- Marker id: `6fd4c82e53e6`
- Severity: `required`
- Semantic role: `review_commitment_tracking`
- Replacement shape: `gate_rule_block`
- Template id: `rereview-commitment-verification-to-researchspec`
- ResearchSpec targets: `researchspec/draft-patches/<patch-id>.json`, `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper/references/cross-skill/academic-paper-reviewer/references/re_review_mode_protocol.md`, `academic-paper-reviewer/references/re_review_mode_protocol.md`
- Before SHA-256: `494dd99d4d1b6d1c2c7502125e3f275a8e95fd270016bac00b1bef1b1aa5957c`
- After SHA-256: `9855b6275c0c2312e57b2f8de7fca6cbbd18d80e01dc85f1d91baa8c35a16a6c`

#### Before

````markdown
### Commitment Ledger Verification (Kong A1 / v3.11)

This step runs **for every Schema 11 row** (any priority) that carries a non-empty `commitment_extracted` list from `revision_coach_agent` Step 3.5. It is independent of the Priority 1/2/3 Traceability Rule above — every parsed reviewer comment may produce commitments, and every commitment must be verified, regardless of the parent concern's priority.

For each commitment, verify per-commitment `fulfillment_status`:

- `fulfilled` — the `required_evidence_type` is present and substantively addresses the `commitment_text`. Verification site depends on `required_evidence_type`:
  - For `new_section` / `new_figure` / `new_table` / `new_citation` / `methods_paragraph` / `discussion_paragraph` / `prose_edit` — verify against the **revised manuscript** at `revision_location`. `prose_edit` items (typo fixes, terminology clarifications, equation formatting, citation-style corrections) are sentence- or paragraph-level changes; verify the specific text at `revision_location` rather than expecting a new structural block.
  - For `acknowledgment_only` — verify against the **Response to Reviewers (Schema 8)** instead of the manuscript diff. `acknowledgment_only` items by definition do not require manuscript changes; expecting a manuscript diff would produce false `not-fulfilled` classifications. The response letter must explicitly acknowledge or address the commitment in writing.
````

#### After

````markdown
<!--rs:a:6fd4c82e53e6-->
### ResearchSpec Commitment Verification

Commitment verification is a gate over revised draft, response, and patch artifacts.

#### Gate Inputs

- Read revision patches from `researchspec/draft-patches/<patch-id>.json`.
- Resolve response letters and revised drafts via `researchspec/runs/current/artifact-registry.json`.

#### Ledger Writes

- Return fulfilled, partially fulfilled, and unresolved findings to the commitment gate helper.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:6fd4c82e53e6-->
````

### anchor.reviewer.reference.sprint-contract-protocol

- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/references/sprint_contract_protocol.md`
- Marker id: `0d32f836c18b`
- Severity: `required`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `artifact_projection_block`
- Template id: `sprint-contract-protocol-to-researchspec-artifacts`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper/references/cross-skill/academic-paper-reviewer/references/sprint_contract_protocol.md`, `academic-paper-reviewer/references/sprint_contract_protocol.md`, `academic-pipeline/references/cross-skill/academic-paper-reviewer/references/sprint_contract_protocol.md`, `deep-research/references/cross-skill/academic-paper-reviewer/references/sprint_contract_protocol.md`
- Before SHA-256: `93d4b1e27a69236343f2ca09e690bba5259cf9777d1089b54116f0e66f0f0bfb`
- After SHA-256: `a06d5b482b1c3735d570a91c5791881561f1001aa708f5f48f8e8d7453ae7430`

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
````

#### After

````markdown
<!--rs:a:0d32f836c18b-->
### ResearchSpec Sprint Protocol Artifacts

Sprint baselines and phase outputs are ResearchSpec artifacts; their checks are ResearchSpec gates.

#### Artifact Projection

- Emit baseline, panel, and consolidated outputs for runtime registration.
- Represent failed checks or missing evidence in `researchspec/runs/current/gate-ledger.jsonl`.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:0d32f836c18b-->
````

### anchor.reviewer.skill.rereview-schema11

- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/SKILL.md`
- Marker id: `b9d2e46fc97a`
- Severity: `required`
- Semantic role: `review_commitment_tracking`
- Replacement shape: `checklist`
- Template id: `reviewer-rereview-schema11-to-researchspec`
- ResearchSpec targets: `researchspec/draft-patches/<patch-id>.json`, `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper/references/cross-skill/academic-paper-reviewer/SKILL.md`, `academic-paper-reviewer/SKILL.md`, `academic-pipeline/references/cross-skill/academic-paper-reviewer/SKILL.md`, `deep-research/references/cross-skill/academic-paper-reviewer/SKILL.md`
- Before SHA-256: `e6706f63acec2e33eebf7c102b6e0f1b37b2a1ca7b1dd337f52aa4a2a62cdf9d`
- After SHA-256: `2a043078121ddf818e4086c50e0da34a0870fe30577e96154925b7e7a469582a`

#### Before

````markdown
Dedicated mode for Pipeline Stage 3' — verifies whether revisions address first-round review comments. Uses R&R Traceability Matrix (Schema 11) with Author's Claim + Verified? columns.
````

#### After

````markdown
<!--rs:a:b9d2e46fc97a-->
### ResearchSpec Re-review Traceability

Re-review checks compare commitments against ResearchSpec patch and artifact records.

#### Verification Inputs

- Read applied or pending patches from `researchspec/draft-patches/<patch-id>.json`.
- Resolve revised draft and response artifacts through `researchspec/runs/current/artifact-registry.json`.

#### Gate Result

- Return missing, partially satisfied, or contradicted commitments to the re-review gate helper.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:b9d2e46fc97a-->
````

### anchor.reviewer.skill.sprint-contract

- Owner skill: `academic-paper-reviewer`
- Source path: `academic-paper-reviewer/SKILL.md`
- Marker id: `9f0c7ac717e2`
- Severity: `required`
- Semantic role: `generator_evaluator_contract`
- Replacement shape: `checklist`
- Template id: `reviewer-sprint-contract-to-researchspec-artifact`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper/references/cross-skill/academic-paper-reviewer/SKILL.md`, `academic-paper-reviewer/SKILL.md`, `academic-pipeline/references/cross-skill/academic-paper-reviewer/SKILL.md`, `deep-research/references/cross-skill/academic-paper-reviewer/SKILL.md`
- Before SHA-256: `298ff2410ac39704bbef06179f6b97818d0716e074aedbf4c28719aee43ede2e`
- After SHA-256: `5b8cb6a388cccca78983457b3edceb15039700577a151af4be6d2cc6de35543f`

#### Before

````markdown
- **Schema 13 sprint contract.** Template-driven acceptance criteria with `panel_size`, `acceptance_dimensions`, `failure_conditions` (with `severity` precedence + `cross_reviewer_quantifier` panel-relative thresholds), `measurement_procedure`, optional `override_ladder`, bounded `agent_amendments`. Validator: `scripts/check_sprint_contract.py`. Schema: `shared/sprint_contract.schema.json`.
````

#### After

````markdown
<!--rs:a:9f0c7ac717e2-->
### ResearchSpec Reviewer Sprint Artifact

Sprint contracts and panel outputs are registered artifacts with gate outcomes.

#### Artifact Records

- Emit sprint contract JSON, reviewer panel outputs, and lint diagnostics for runtime registration.
- Return accept, revise, reject, and blocking outcomes to the review gate helper.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:9f0c7ac717e2-->
````

### anchor.pipeline.claim-audit.output-contract

- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/claim_ref_alignment_audit_agent.md`
- Marker id: `33154df5bb7d`
- Severity: `required`
- Semantic role: `gate_policy`
- Replacement shape: `gate_rule_block`
- Template id: `claim-audit-to-researchspec-gate`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/agents/claim_ref_alignment_audit_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/agents/claim_ref_alignment_audit_agent.md`, `academic-pipeline/agents/claim_ref_alignment_audit_agent.md`, `deep-research/references/cross-skill/academic-pipeline/agents/claim_ref_alignment_audit_agent.md`
- Before SHA-256: `c879665cdb2c55aa75c9c8493988fa201ee146b78e0e9c3ecdcdcee7ea206008`
- After SHA-256: `8a4f6f7bfdb4f7d2aceb87cb52136814e2224543afd112c9726b344ee9fee717`

#### Before

````markdown
Per audit run, populate the six aggregates:
````

#### After

````markdown
<!--rs:a:33154df5bb7d-->
### ResearchSpec Claim Audit Output

Claim-audit aggregates form one registered audit artifact whose blocking findings are gate-helper inputs.

#### Audit Output

- Emit all audit aggregates together as one traceable artifact.
- Return HIGH-WARN and other blocking findings to the claim-integrity gate helper.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:33154df5bb7d-->
````

### anchor.pipeline.orchestrator.reset-boundary-ledger

- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Marker id: `a988873008fb`
- Severity: `required`
- Semantic role: `runtime_state_boundary`
- Replacement shape: `protocol_block`
- Template id: `reset-boundary-ledger-to-researchspec-state`
- ResearchSpec targets: `researchspec/runs/current/state.yaml`, `researchspec/runs/current/decision-ledger.jsonl`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-pipeline/agents/pipeline_orchestrator_agent.md`, `deep-research/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Before SHA-256: `72382a607b0750669bffe9274ede6c7f76e64853b606432c80f13122c85fb760`
- After SHA-256: `08072a858c9f1ee5a645691ea77f3cb3425be828a667ef471432f6c2e6ca2a07`

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
<!--rs:a:a988873008fb-->
### ResearchSpec Reset Boundary

Checkpoint resets and resumes are ResearchSpec runtime events, not Material Passport ledger mutations.

#### Boundary Record

- Store reset boundary state in `researchspec/runs/current/state.yaml`.
- After human confirmation, return branch choices, overrides, and pending decisions to the runtime for decision-ledger recording.

#### Gate Record

- Use `researchspec/runs/current/gate-ledger.jsonl` to record whether the recovered state is verified, stale, or blocked.
- If an ARS reset tag exists, register it as compatibility evidence rather than consuming it as the runtime source of truth.

#### Mutation Boundary

- Request changes to `researchspec/runs/current/state.yaml` through the ResearchSpec orchestrator or runtime helper; do not edit run state directly.
- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:a988873008fb-->
````

### anchor.pipeline.orchestrator.resume-runtime

- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Marker id: `b4116c66ae00`
- Severity: `required`
- Semantic role: `runtime_state_boundary`
- Replacement shape: `protocol_block`
- Template id: `material-passport-resume-to-researchspec-runtime`
- ResearchSpec targets: `researchspec/runs/current/state.yaml`, `researchspec/runs/current/decision-ledger.jsonl`, `researchspec/runs/current/gate-ledger.jsonl`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-pipeline/agents/pipeline_orchestrator_agent.md`, `deep-research/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Before SHA-256: `c8adfde9beb5b3fac35351b03b749cbd4102b469601dae18a026480f5b53a758`
- After SHA-256: `156d0a8c1ab505dc47e7157655ec2160ced516ca79e267d047c85b2f94f5a199`

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
<!--rs:a:b4116c66ae00-->
### ResearchSpec Runtime Ownership

Resume handling is controlled by ResearchSpec runtime files. The ARS Material Passport can be imported as evidence, but it is not the active resume ledger.

#### Before Resuming

- Read `researchspec/runs/current/state.yaml` for current stage, mode, and resume status.
- Resolve prior artifacts through `researchspec/runs/current/artifact-registry.json`.
- Check `researchspec/runs/current/gate-ledger.jsonl` for unresolved blocking gates.

#### Decision Handling

- If a branch or override is required, stop and request a human decision.
- After human confirmation, return the chosen branch to the runtime for decision-ledger recording before advancing.

#### Mutation Boundary

- Request changes to `researchspec/runs/current/state.yaml` through the ResearchSpec orchestrator or runtime helper; do not edit run state directly.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:b4116c66ae00-->
````

### anchor.pipeline.orchestrator.revision-patch-toolchain

- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Marker id: `4df35b1d7e20`
- Severity: `required`
- Semantic role: `draft_patch_protocol`
- Replacement shape: `patch_protocol_block`
- Template id: `revision-patch-toolchain-to-researchspec-draft-patches`
- ResearchSpec targets: `researchspec/draft-patches/<patch-id>.json`, `researchspec/runs/current/decision-ledger.jsonl`, `researchspec/runs/current/gate-ledger.jsonl`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-pipeline/agents/pipeline_orchestrator_agent.md`, `deep-research/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Before SHA-256: `419c676a1c1ec90b9d06eafeebf3c29424ab1ab704d2825f97b8d108e7799e5f`
- After SHA-256: `9cf3445a58e5ae3da712d92a8e18ebe038337fba96d7b4a2bdf98df7ec7be174`

#### Before

````markdown
When a revision stage dispatches `academic-paper` revision mode (Stage 3 → 4 / 3' → 4'; "Resolved next stage: 4 (mode: revision)" — and equally the integrity-FAIL correction rounds, Stage 2.5 FAIL → 2 and Stage 4.5 FAIL → 5 (revision), where the integrity correction list serves as the round's revision requirements; #89 Item 8, destination differences in the integrity-correction variant below — note the FAIL arrow lands on Stage 5's **revision** sub-step, not the PASS-path Stage 4.5 → 5 finalization handoff, and re-verification by the issuing gate is mandatory before finalization), the writer's deliverable is a **patch document**, not a re-emitted draft, and the orchestrator owns the deterministic steps around it. Spec: `docs/design/2026-06-10-390-diff-patch-revision-mode-spec.md` §3.3–§3.6. Protocol + exact commands: `academic-paper/references/revision_patch_protocol.md`. The toolchain is Slice A (#423): `scripts/ars_anchorize_draft.py` + `scripts/ars_apply_revision_patch.py`.
````

#### After

````markdown
<!--rs:a:4df35b1d7e20-->
### ResearchSpec Draft Patch Protocol

Revision work emits ResearchSpec draft patches. Applying them is a separate deterministic step guarded by decisions and gates.

#### Patch Inputs

- Read the current draft artifact from `researchspec/runs/current/artifact-registry.json`.
- Read accepted revision intent from `researchspec/runs/current/decision-ledger.jsonl`.

#### Patch Output

- Emit `researchspec/draft-patches/<patch-id>.json` with block ids, old hashes, operations, and roadmap traceability.
- Do not silently apply patch operations while generating the patch.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:4df35b1d7e20-->
````

### anchor.pipeline.orchestrator.schema-handoff-table

- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Marker id: `6b5cf894d129`
- Severity: `required`
- Semantic role: `handoff_projection`
- Replacement shape: `schema_projection_table`
- Template id: `ars-schema-handoff-to-researchspec-contracts`
- ResearchSpec targets: `researchspec/specs/project.md`, `researchspec/specs/sources.yaml`, `researchspec/specs/claims.yaml`, `researchspec/specs/manuscript.yaml`, `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/decision-ledger.jsonl`, `researchspec/runs/current/gate-ledger.jsonl`, `researchspec/draft-patches/<patch-id>.json`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-pipeline/agents/pipeline_orchestrator_agent.md`, `deep-research/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Before SHA-256: `c4da59716b0f456089bd4e96ca36de57011f33eeca6c40296efa82564f89f465`
- After SHA-256: `5f7d4f18fcafd082546ce71ed49a6b367cb6dd2897c71154d01d01f48bf6367f`

#### Before

````markdown
**All artifacts must carry a Material Passport (Schema 9)** with `origin_skill`, `origin_mode`, `origin_date`, `verification_status`, and `version_label`. From v3.7.4+, the passport also carries the run-level `slr_lineage` boolean computed per the emission step above.
````

#### After

````markdown
<!--rs:a:6b5cf894d129-->
### ResearchSpec Handoff Projection

ARS handoff schemas remain payload guidance. ResearchSpec files own the stable runtime contract.

#### Projection Rules

- Project research intent into `researchspec/specs/project.md`.
- Project bibliography and corpus metadata into `researchspec/specs/sources.yaml`.
- Project claim intent and limits into `researchspec/specs/claims.yaml`.
- Project manuscript structure into `researchspec/specs/manuscript.yaml`.

#### Runtime Records

- Emit every handoff payload as an artifact for runtime registration.
- Record decisions and gates in their ledgers; manuscript edits use `researchspec/draft-patches/<patch-id>.json`.

#### Mutation Boundary

- Treat `researchspec/specs/project.md`, `researchspec/specs/sources.yaml`, `researchspec/specs/claims.yaml`, `researchspec/specs/manuscript.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:6b5cf894d129-->
````

### anchor.pipeline.orchestrator.submission-package-gate

- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Marker id: `96de257a1678`
- Severity: `recommended`
- Semantic role: `gate_policy`
- Replacement shape: `gate_rule_block`
- Template id: `submission-package-gate-to-researchspec-gate-ledger`
- ResearchSpec targets: `researchspec/runs/current/gate-ledger.jsonl`, `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/decision-ledger.jsonl`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`, `academic-pipeline/agents/pipeline_orchestrator_agent.md`, `deep-research/references/cross-skill/academic-pipeline/agents/pipeline_orchestrator_agent.md`
- Before SHA-256: `b3f68351cc0fff4d60f467462ed9efbd85a34244188bc0d76f87d9e7a791739e`
- After SHA-256: `bb496da0437e9a51dde99612144644990c4eb7c2fef266615095efc06183004f`

#### Before

````markdown
1. **Resolve the policy.** Read `terminal_policies.submission_package` from the Material Passport. Key absence — or absence of the whole `terminal_policies` object — resolves to `advisory` (the same per-key runtime convention as the existing keys). ALWAYS pass the resolved value explicitly: the CLI is never run policy-less in the pipeline (an unflagged run stamps `policy_slug: null` = a standalone unevaluated report, which can never satisfy the freshness guard below).
````

#### After

````markdown
<!--rs:a:96de257a1678-->
### ResearchSpec Submission Gate

Submission package checks produce gate-ledger records tied to registered artifacts.

#### Gate Inputs

- Resolve formatted manuscript, figures, tables, and supplementary files from `researchspec/runs/current/artifact-registry.json`.
- Read package policy choices from `researchspec/runs/current/decision-ledger.jsonl` when human selection is required.

#### Ledger Writes

- Return pass, fail, and blocking findings to the submission-package gate helper.
- Do not advance to delivery while a blocking gate entry remains unresolved.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:96de257a1678-->
````

### anchor.pipeline.state-tracker.runtime-owner

- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/state_tracker_agent.md`
- Marker id: `3417bbcc5620`
- Severity: `required`
- Semantic role: `runtime_state_boundary`
- Replacement shape: `protocol_block`
- Template id: `pipeline-state-tracking-researchspec-runtime`
- ResearchSpec targets: `researchspec/specs/workflow.yaml`, `researchspec/runs/current/state.yaml`, `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-pipeline/agents/state_tracker_agent.md`
- Before SHA-256: `7b72ceb990ec69e1d10fc75b24512ea1e58dab1c829019ed78e84bb1d57694c1`
- After SHA-256: `fba3ed6eb314f3c79b6bd6fb1a90fe1913c3f98f830059f9e0c682bfe9e70a1e`

#### Before

````markdown
The State Tracker is the **single source of truth** for pipeline state. No other agent may directly modify pipeline state variables.
````

#### After

````markdown
<!--rs:a:3417bbcc5620-->
### ResearchSpec Pipeline State

Keep the ARS stage graph semantics, but use ResearchSpec runtime files as the state carrier.

#### State Reads

- Use `researchspec/specs/workflow.yaml` for the configured stage graph.
- Use `researchspec/runs/current/state.yaml` for current stage, mode, checkpoint, and resume metadata.

#### State Writes

- Emit stage outputs as artifacts for runtime registration.
- Represent integrity and transition outcomes in `researchspec/runs/current/gate-ledger.jsonl`.

#### Mutation Boundary

- Treat `researchspec/specs/workflow.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Request changes to `researchspec/runs/current/state.yaml` through the ResearchSpec orchestrator or runtime helper; do not edit run state directly.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:3417bbcc5620-->
````

### anchor.pipeline.state-tracker.version-passport

- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/agents/state_tracker_agent.md`
- Marker id: `2efe51e44a1b`
- Severity: `recommended`
- Semantic role: `artifact_provenance`
- Replacement shape: `artifact_projection_block`
- Template id: `artifact-version-passport-to-registry`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-pipeline/agents/state_tracker_agent.md`
- Before SHA-256: `e6bb7a341da170467b258fb6355e64c1db05317e84dead71aec82d4a68dbf8ca`
- After SHA-256: `fe0dcead74bb35749778c4d2be471b1a8da1b95213e56179650154cda9a7eed5`

#### Before

````markdown
Every material artifact produced by the pipeline carries a version label. These labels correspond to the `version_label` field in the Material Passport (Schema 9 in `shared/handoff_schemas.md`).
````

#### After

````markdown
<!--rs:a:2efe51e44a1b-->
### ResearchSpec Artifact Provenance

Version labels and verification state belong to the artifact registry and gate ledger.

#### Registry Projection

- Return artifact path, hash, producer, stage, mode, and version label to the runtime registration helper.
- Preserve ARS passport fields as artifact metadata when useful.

#### Verification Projection

- Return freshness or verification status to the responsible gate helper.
- Do not treat a generated report title or version string as the registry source of truth.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:2efe51e44a1b-->
````

### anchor.pipeline.reference.literature-consumer-runtime

- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/references/literature_corpus_consumers.md`
- Marker id: `6aa4ef1ee975`
- Severity: `required`
- Semantic role: `source_contract_projection`
- Replacement shape: `artifact_projection_block`
- Template id: `literature-consumer-to-researchspec-sources`
- ResearchSpec targets: `researchspec/specs/sources.yaml`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/references/literature_corpus_consumers.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/references/literature_corpus_consumers.md`, `academic-pipeline/references/literature_corpus_consumers.md`, `deep-research/references/cross-skill/academic-pipeline/references/literature_corpus_consumers.md`
- Before SHA-256: `590a6addf7c5280e4096aacd741ce56750e4ac47885a7a0db3ff9ac307477123`
- After SHA-256: `0329e15132e988fcbf410ec7c404c1545d42bf26810cc328e7b2171324ed809b`

#### Before

````markdown
This is the contract every literature-reading consumer agent must follow. The v3.6.4 input port (`shared/contracts/passport/literature_corpus_entry.schema.json`) defines what enters a Material Passport; this document defines how Phase 1 agents read it.
````

#### After

````markdown
<!--rs:a:6aa4ef1ee975-->
### ResearchSpec Literature Consumer Contract

Literature consumers read the canonical corpus through ResearchSpec while preserving the upstream no-mutation and fallback rules.

#### Corpus Inputs

- Read source ids, citation keys, inclusion state, and trust metadata from `researchspec/specs/sources.yaml`.
- Resolve bibliography and screening artifacts through `researchspec/runs/current/artifact-registry.json`.

#### Mutation Boundary

- Treat `researchspec/specs/sources.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.

<!--/rs:a:6aa4ef1ee975-->
````

### anchor.pipeline.reference.passport-reset-protocol

- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/references/passport_as_reset_boundary.md`
- Marker id: `2001afa86b8b`
- Severity: `required`
- Semantic role: `runtime_state_boundary`
- Replacement shape: `protocol_block`
- Template id: `passport-reset-protocol-to-researchspec-ledgers`
- ResearchSpec targets: `researchspec/runs/current/state.yaml`, `researchspec/runs/current/decision-ledger.jsonl`, `researchspec/runs/current/gate-ledger.jsonl`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/references/passport_as_reset_boundary.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/references/passport_as_reset_boundary.md`, `academic-pipeline/references/passport_as_reset_boundary.md`, `deep-research/references/cross-skill/academic-pipeline/references/passport_as_reset_boundary.md`
- Before SHA-256: `f5373d307584b4ace1e95535a60b5b54f489d30a47bb67a2d00ee9454b8114aa`
- After SHA-256: `287e843eccfdcbfbc82664ba666da5b5ef5048ffa99e55cd97078078a1f61ea5`

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
<!--rs:a:2001afa86b8b-->
### ResearchSpec Resume Protocol

Reset and resume semantics are preserved, but their runtime state is split across ResearchSpec state, decisions, gates, and artifacts.

#### Compatibility Import

- Emit any imported ARS Material Passport reset payload as compatibility evidence for runtime registration.
- Project its active stage and pending branch information into `researchspec/runs/current/state.yaml`.

#### Runtime Ownership

- Use `researchspec/runs/current/decision-ledger.jsonl` for branch selection.
- Use `researchspec/runs/current/gate-ledger.jsonl` for stale, unverified, or blocked recovery state.

#### Mutation Boundary

- Request changes to `researchspec/runs/current/state.yaml` through the ResearchSpec orchestrator or runtime helper; do not edit run state directly.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:2001afa86b8b-->
````

### anchor.pipeline.team-handoff.passport-checklist

- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/references/team_collaboration_protocol.md`
- Marker id: `722552e4d486`
- Severity: `recommended`
- Semantic role: `handoff_projection`
- Replacement shape: `schema_projection_table`
- Template id: `team-handoff-to-researchspec-registry`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/decision-ledger.jsonl`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-pipeline/references/team_collaboration_protocol.md`
- Before SHA-256: `b7b3d15b245fd412b906ce9f391fd247a21b2e54fe3eed96fe6bbb1036c4a1aa`
- After SHA-256: `5610fb2a62384ebb1b1c21f555f0bb243c82e2c0aea9b942a3cec266e92ddf6a`

#### Before

````markdown
| **Handoff checklist** | All Material Passports (Schema 9) attached; Bibliography minimum source count met; Synthesis has 3+ themes |
````

#### After

````markdown
<!--rs:a:722552e4d486-->
### ResearchSpec Team Handoff

Team handoffs resolve versioned artifacts and approvals through ResearchSpec records rather than attached Material Passports.

#### Handoff Record

- Resolve transferred artifacts through `researchspec/runs/current/artifact-registry.json`.
- Return human approvals and gate receipts to their responsible runtime helpers.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:722552e4d486-->
````

### anchor.pipeline.skill.orchestrator-state-tracking

- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/SKILL.md`
- Marker id: `1ba3243e78aa`
- Severity: `required`
- Semantic role: `runtime_state_boundary`
- Replacement shape: `protocol_block`
- Template id: `pipeline-state-tracking-researchspec-runtime`
- ResearchSpec targets: `researchspec/specs/workflow.yaml`, `researchspec/runs/current/state.yaml`, `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/SKILL.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/SKILL.md`, `academic-pipeline/SKILL.md`, `deep-research/references/cross-skill/academic-pipeline/SKILL.md`
- Before SHA-256: `885ee4c094ad0a77870257e2968363063330ba64f9f6732797b64dc947132826`
- After SHA-256: `66e4d5431b4f485cd0b934de6492d43f18ee64c928100087741a993bd892a8cf`

#### Before

````markdown
**Mode A — orchestrator-driven (default):** `pipeline_orchestrator_agent` runs all stages end-to-end with state tracking via Material Passport. `state_tracker_agent`, `integrity_verification_agent`, `collaboration_depth_agent`, and `claim_ref_alignment_audit_agent` are dispatched by the orchestrator at the appropriate checkpoints.

**Mode B — phase-by-phase (cross-session resume):** User invokes one phase agent at a time across sessions, typically via `ARS_PASSPORT_RESET=1` + `resume_from_passport=<hash>` (see `references/passport_as_reset_boundary.md`).
````

#### After

````markdown
<!--rs:a:1ba3243e78aa-->
### ResearchSpec Pipeline State

Keep the ARS stage graph semantics, but use ResearchSpec runtime files as the state carrier.

#### State Reads

- Use `researchspec/specs/workflow.yaml` for the configured stage graph.
- Use `researchspec/runs/current/state.yaml` for current stage, mode, checkpoint, and resume metadata.

#### State Writes

- Emit stage outputs as artifacts for runtime registration.
- Represent integrity and transition outcomes in `researchspec/runs/current/gate-ledger.jsonl`.

#### Mutation Boundary

- Treat `researchspec/specs/workflow.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Request changes to `researchspec/runs/current/state.yaml` through the ResearchSpec orchestrator or runtime helper; do not edit run state directly.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:1ba3243e78aa-->
````

### anchor.pipeline.skill.phase-boundary-enforcement

- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/SKILL.md`
- Marker id: `4ca56b3923e8`
- Severity: `recommended`
- Semantic role: `contract_io_boundary`
- Replacement shape: `io_contract_block`
- Template id: `phase-boundary-to-contract-preflight`
- ResearchSpec targets: `researchspec/specs/workflow.yaml`, `researchspec/runs/current/state.yaml`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/SKILL.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/SKILL.md`, `academic-pipeline/SKILL.md`, `deep-research/references/cross-skill/academic-pipeline/SKILL.md`
- Before SHA-256: `507cd47d8249577c10f3ecdf590afc0477bfd1ef0e8299f7fb29e593e60f988f`
- After SHA-256: `3d35ebeafd834c41bf79ae7acec72d5c8a92ff467bb78406b78e7db16d2e481a`

#### Before

````markdown
**Enforcement (v3.9.2):** Phase Boundary blocks on downstream Bucket A agents + advisory verifier (`scripts/check_pipeline_integrity.py`) + a deterministic PreToolUse write-scope guard in hook-enabled runtimes (#134 rescope, PR #294). Multi-phase envelope + orchestrator structured intake remain forward-scope (#134 Slices 3-5).
````

#### After

````markdown
<!--rs:a:4ca56b3923e8-->
### ResearchSpec Contract I/O

Treat phase boundaries as contract-scoped reads and writes instead of ARS directory fences.

#### Contract Inputs

- Load only the workflow, run state, and registered artifacts required by the current stage or mode.
- Do not infer permission from a `phase*_` directory name when ResearchSpec state disagrees.

#### Writes Allowed

- Write new deliverables as artifact files, then return them to the runtime for registration.
- Treat script or hook checks as diagnostics; ResearchSpec contracts define the runtime boundary.

#### Mutation Boundary

- Treat `researchspec/specs/workflow.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Request changes to `researchspec/runs/current/state.yaml` through the ResearchSpec orchestrator or runtime helper; do not edit run state directly.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.

<!--/rs:a:4ca56b3923e8-->
````

### anchor.pipeline.skill.resume-from-passport

- Owner skill: `academic-pipeline`
- Source path: `academic-pipeline/SKILL.md`
- Marker id: `839696c20996`
- Severity: `required`
- Semantic role: `runtime_state_boundary`
- Replacement shape: `protocol_block`
- Template id: `material-passport-resume-to-researchspec-runtime`
- ResearchSpec targets: `researchspec/runs/current/state.yaml`, `researchspec/runs/current/decision-ledger.jsonl`, `researchspec/runs/current/gate-ledger.jsonl`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/references/cross-skill/academic-pipeline/SKILL.md`, `academic-paper-reviewer/references/cross-skill/academic-pipeline/SKILL.md`, `academic-pipeline/SKILL.md`, `deep-research/references/cross-skill/academic-pipeline/SKILL.md`
- Before SHA-256: `9d830fcc9b071b1d1fca2c5d985b809e37cfed37cc97290a34fc633ba125d01f`
- After SHA-256: `169954e2261954b7ad239303b69390f389b236a567886abb95cb3e688eefc979`

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
<!--rs:a:839696c20996-->
### ResearchSpec Runtime Ownership

Resume handling is controlled by ResearchSpec runtime files. The ARS Material Passport can be imported as evidence, but it is not the active resume ledger.

#### Before Resuming

- Read `researchspec/runs/current/state.yaml` for current stage, mode, and resume status.
- Resolve prior artifacts through `researchspec/runs/current/artifact-registry.json`.
- Check `researchspec/runs/current/gate-ledger.jsonl` for unresolved blocking gates.

#### Decision Handling

- If a branch or override is required, stop and request a human decision.
- After human confirmation, return the chosen branch to the runtime for decision-ledger recording before advancing.

#### Mutation Boundary

- Request changes to `researchspec/runs/current/state.yaml` through the ResearchSpec orchestrator or runtime helper; do not edit run state directly.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:839696c20996-->
````

### anchor.deep.agent.phase-boundary

- Owner skill: `deep-research`
- Source path: `deep-research/agents/bibliography_agent.md`
- Marker id: `22a0c2b104bf`
- Severity: `recommended`
- Semantic role: `contract_io_boundary`
- Replacement shape: `io_contract_block`
- Template id: `deep-research-phase-boundary-to-contract-io`
- ResearchSpec targets: `researchspec/specs/project.md`, `researchspec/specs/sources.yaml`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/references/cross-skill/deep-research/agents/bibliography_agent.md`, `academic-paper-reviewer/references/cross-skill/deep-research/agents/bibliography_agent.md`, `academic-pipeline/references/cross-skill/deep-research/agents/bibliography_agent.md`, `deep-research/agents/bibliography_agent.md`
- Before SHA-256: `c86966138ac074e4c739177ab0ac4c6f884ae259cc8e5fce5e51e5dd67726423`
- After SHA-256: `a4912bb34e1cf1c1508998adc8b48c05aad8eda877db309d0ea14738bdb1314b`

#### Before

````markdown
You MAY READ files in `phase1_*/` (Research Question Brief, Methodology Blueprint) and `phase2_*/` (own phase) for legitimate context. Downstream phases (`phase{3,4,5,6}_*/`) are not needed for your work.
````

#### After

````markdown
<!--rs:a:22a0c2b104bf-->
### ResearchSpec Deep Research Contract I/O

Deep-research phase boundaries become explicit contract input/output rules.

#### Contract Inputs

- Read project intent from `researchspec/specs/project.md`.
- Read existing source corpus from `researchspec/specs/sources.yaml` when present.

#### Contract Outputs

- Write phase outputs as artifacts and return them to the runtime for registration.

#### Mutation Boundary

- Treat `researchspec/specs/project.md`, `researchspec/specs/sources.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.

<!--/rs:a:22a0c2b104bf-->
````

### anchor.deep.bibliography.corpus-passport

- Owner skill: `deep-research`
- Source path: `deep-research/agents/bibliography_agent.md`
- Marker id: `1d37bd1ae094`
- Severity: `required`
- Semantic role: `source_contract_projection`
- Replacement shape: `artifact_projection_block`
- Template id: `deep-bibliography-corpus-to-researchspec-sources`
- ResearchSpec targets: `researchspec/specs/sources.yaml`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/references/cross-skill/deep-research/agents/bibliography_agent.md`, `academic-paper-reviewer/references/cross-skill/deep-research/agents/bibliography_agent.md`, `academic-pipeline/references/cross-skill/deep-research/agents/bibliography_agent.md`, `deep-research/agents/bibliography_agent.md`
- Before SHA-256: `2dcd0a3b130b7117e4f207ff6e7bca2ecec04e1207e44f62087a806a3af4f9c6`
- After SHA-256: `fa757d84ee2a65d27757859af3f49724bf453b7b363f79c618cd12cdac69f4de`

#### Before

````markdown
When the input Material Passport carries a non-empty `literature_corpus[]`, this agent enters the **corpus-first, search-fills-gap** flow. The flow has five steps and four Iron Rules; the PRE-SCREENED block makes corpus utilisation reproducible.
````

#### After

````markdown
<!--rs:a:1d37bd1ae094-->
### ResearchSpec Bibliography Source Contract

Bibliography and corpus records are ResearchSpec source-contract material.

#### Source Projection

- Use `researchspec/specs/sources.yaml` for source ids, citation keys, inclusion status, and trust-chain metadata.
- Emit annotated bibliographies, PRISMA outputs, and literature matrices for runtime registration.

#### Mutation Boundary

- Treat `researchspec/specs/sources.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.

<!--/rs:a:1d37bd1ae094-->
````

### anchor.deep.report-compiler.claim-intent-passport

- Owner skill: `deep-research`
- Source path: `deep-research/agents/report_compiler_agent.md`
- Marker id: `bf4dd0376572`
- Severity: `required`
- Semantic role: `claim_contract_projection`
- Replacement shape: `artifact_projection_block`
- Template id: `deep-report-claims-to-researchspec-claims`
- ResearchSpec targets: `researchspec/specs/claims.yaml`, `researchspec/changes/<change-id>/contract-patch.yaml`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/references/cross-skill/deep-research/agents/report_compiler_agent.md`, `academic-paper-reviewer/references/cross-skill/deep-research/agents/report_compiler_agent.md`, `academic-pipeline/references/cross-skill/deep-research/agents/report_compiler_agent.md`, `deep-research/agents/report_compiler_agent.md`
- Before SHA-256: `85473afda2c0be70de68028c2b5eeb6dd2308a1c97baeeab12fa102999d574bb`
- After SHA-256: `959ecc2d6f1f6f770087785ad283b6e5713f898c4bab8c1fcb2dc5a955636c0a`

#### Before

````markdown
Before compiling the first prose block of the report, append ONE `claim_intent_manifests[]` entry to the Material Passport listing the substantive claims the compiled report intends to make and any author-declared "must not" rules. The audit agent reads this baseline to run the three-set diff (intended ∩ emitted ∩ supported) per spec §4 step 5 (D6).
````

#### After

````markdown
<!--rs:a:bf4dd0376572-->
### ResearchSpec Report Claim Intent

The report compiler emits a one-shot claim-intent artifact before prose; accepted claims remain contract-owned.

#### Claim Intent

- Read accepted claim constraints from `researchspec/specs/claims.yaml`.
- Emit the claim-intent manifest as an artifact before the first report prose block.
- Propose new or strengthened claims through `researchspec/changes/<change-id>/contract-patch.yaml`.

#### Mutation Boundary

- Treat `researchspec/specs/claims.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.

<!--/rs:a:bf4dd0376572-->
````

### anchor.deep.synthesis.claim-intent-passport

- Owner skill: `deep-research`
- Source path: `deep-research/agents/synthesis_agent.md`
- Marker id: `616f193bd90e`
- Severity: `required`
- Semantic role: `claim_contract_projection`
- Replacement shape: `artifact_projection_block`
- Template id: `deep-synthesis-claims-to-researchspec-claims`
- ResearchSpec targets: `researchspec/specs/claims.yaml`, `researchspec/changes/<change-id>/contract-patch.yaml`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/references/cross-skill/deep-research/agents/synthesis_agent.md`, `academic-paper-reviewer/references/cross-skill/deep-research/agents/synthesis_agent.md`, `academic-pipeline/references/cross-skill/deep-research/agents/synthesis_agent.md`, `deep-research/agents/synthesis_agent.md`
- Before SHA-256: `36472500843439df65bfe69c96070b4ebd056b9905959db6eaeda0d2ceb37517`
- After SHA-256: `b06f2ea391bbda1d2c10a4a4f20337eff3bef87e735db66d174b346ed66c758d`

#### Before

````markdown
Before drafting the first prose block of the synthesis output, append ONE `claim_intent_manifests[]` entry to the Material Passport listing the substantive claims the synthesis intends to make and any author-declared "must not" rules. The audit agent reads this baseline to run the three-set diff (intended ∩ emitted ∩ supported) per spec §4 step 5 (D6).
````

#### After

````markdown
<!--rs:a:616f193bd90e-->
### ResearchSpec Synthesis Claim Contract

Synthesis claim intent is promoted into claim contracts or proposed contract patches.

#### Claim Projection

- Read accepted claim ids, support strength, evidence links, and limits from `researchspec/specs/claims.yaml`.
- Emit `researchspec/changes/<change-id>/contract-patch.yaml` when synthesis proposes a change in research meaning.
- Emit the synthesis report as an artifact for runtime registration.

#### Mutation Boundary

- Treat `researchspec/specs/claims.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.

<!--/rs:a:616f193bd90e-->
````

### anchor.deep.timeline.sidecar-runtime

- Owner skill: `deep-research`
- Source path: `deep-research/agents/timeline_extraction_agent.md`
- Marker id: `138d2db2cee0`
- Severity: `recommended`
- Semantic role: `artifact_provenance`
- Replacement shape: `artifact_projection_block`
- Template id: `deep-timeline-sidecars-to-artifact-registry`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/specs/sources.yaml`, `researchspec/specs/claims.yaml`
- Generated output paths: `deep-research/agents/timeline_extraction_agent.md`
- Before SHA-256: `f216a3027b047ba113445ee41517da8a03a198c0249365c6042cf196f13c1c4d`
- After SHA-256: `16887de5b56069a6026a8d83ac45a25b9848d90a6337a617471c2a59a91c41b9`

#### Before

````markdown
- `phase2_investigation/timeline.yaml` (per-source / per-event temporal facts)
````

#### After

````markdown
<!--rs:a:138d2db2cee0-->
### ResearchSpec Timeline Artifact Projection

Timeline, citation provenance, and version sidecars are artifacts connected to sources and claims.

#### Artifact Projection

- Emit timeline and provenance sidecars for runtime registration.
- Link source evidence through `researchspec/specs/sources.yaml` and claim relevance through `researchspec/specs/claims.yaml`.

#### Mutation Boundary

- Treat `researchspec/specs/sources.yaml`, `researchspec/specs/claims.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.

<!--/rs:a:138d2db2cee0-->
````

### anchor.deep.skill.material-passport-state

- Owner skill: `deep-research`
- Source path: `deep-research/SKILL.md`
- Marker id: `073722889e7a`
- Severity: `required`
- Semantic role: `runtime_state_boundary`
- Replacement shape: `protocol_block`
- Template id: `deep-research-state-to-researchspec-runtime`
- ResearchSpec targets: `researchspec/specs/project.md`, `researchspec/specs/workflow.yaml`, `researchspec/runs/current/state.yaml`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/references/cross-skill/deep-research/SKILL.md`, `academic-paper-reviewer/references/cross-skill/deep-research/SKILL.md`, `academic-pipeline/references/cross-skill/deep-research/SKILL.md`, `deep-research/SKILL.md`
- Before SHA-256: `b2e0df17b51dcebaa974776543cb401f621b21e95d33735ea1ac0ce58b0436b3`
- After SHA-256: `8f8ff1dd1c02084c0dbb24eb6adf24a264d00a80c8c69a6a748a6e7276563331`

#### Before

````markdown
**Mode A — orchestrator-driven (default):** `pipeline_orchestrator_agent` (in `academic-pipeline` skill) runs all phases end-to-end with state tracking via Material Passport.

**Mode B — phase-by-phase (cross-session resume):** User invokes one agent per phase across sessions for long-running projects. Common pattern via `ARS_PASSPORT_RESET=1` + `resume_from_passport=<hash>` (see `academic-pipeline/references/passport_as_reset_boundary.md`).
````

#### After

````markdown
<!--rs:a:073722889e7a-->
### ResearchSpec Deep Research Runtime

Deep-research consumes project/workflow/state contracts and registers research outputs as artifacts.

#### Runtime Reads

- Read research intent from `researchspec/specs/project.md`.
- Read stage and mode from `researchspec/specs/workflow.yaml` and `researchspec/runs/current/state.yaml`.

#### Runtime Writes

- Emit RQ briefs, methodology blueprints, bibliographies, and synthesis outputs for runtime registration.

#### Mutation Boundary

- Treat `researchspec/specs/project.md`, `researchspec/specs/workflow.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Request changes to `researchspec/runs/current/state.yaml` through the ResearchSpec orchestrator or runtime helper; do not edit run state directly.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.

<!--/rs:a:073722889e7a-->
````

### anchor.shared.compliance-agent.output-passport

- Owner skill: `shared`
- Source path: `shared/agents/compliance_agent.md`
- Marker id: `759107d9ca29`
- Severity: `required`
- Semantic role: `gate_policy`
- Replacement shape: `gate_rule_block`
- Template id: `compliance-report-to-researchspec-gate`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper/references/shared/agents/compliance_agent.md`, `academic-paper-reviewer/references/shared/agents/compliance_agent.md`, `academic-pipeline/references/shared/agents/compliance_agent.md`, `deep-research/references/shared/agents/compliance_agent.md`
- Before SHA-256: `19e4e6ce31b20a25097014f2feadb07fbf642696eb7cef7f61c90ae47149bf33`
- After SHA-256: `2736bdc6fff6ac9c2b90aa97e0f6859970d0439b6731a74c70248e5f624e5023`

#### Before

````markdown
`compliance_report` conforming to `shared/compliance_report.schema.json` (Schema 12). Appended to `material_passport.compliance_history[]` by the orchestrator.
````

#### After

````markdown
<!--rs:a:759107d9ca29-->
### ResearchSpec Compliance Gate

Schema 12 remains a compliance payload; ResearchSpec owns artifact registration and the gate verdict.

#### Compliance Output

- Emit the compliance report as an artifact for runtime registration.
- Return its pass, warning, or blocking findings to the compliance gate helper.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:759107d9ca29-->
````

### anchor.shared.compliance.runtime-boundary

- Owner skill: `shared`
- Source path: `shared/compliance_checkpoint_protocol.md`
- Marker id: `7c9478d2fb6c`
- Severity: `recommended`
- Semantic role: `decision_ledger_entry`
- Replacement shape: `checklist`
- Template id: `compliance-override-to-decision-ledger`
- ResearchSpec targets: `researchspec/runs/current/decision-ledger.jsonl`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/references/shared/compliance_checkpoint_protocol.md`, `academic-paper-reviewer/references/shared/compliance_checkpoint_protocol.md`, `academic-pipeline/references/shared/compliance_checkpoint_protocol.md`, `deep-research/references/shared/compliance_checkpoint_protocol.md`
- Before SHA-256: `52a20afa717bdd39a4d63c6e66457f91341803a8389a874409e82e68b933b863`
- After SHA-256: `c9d7b1a6b083394b71e407b31bcf3e62bfabca2daec7ef6e639d31a8a28f4b53`

#### Before

````markdown
> **Enforcement boundary.** This ladder is enforced at **runtime by `compliance_agent`** using the `compliance_history[]` round counter, NOT by Schema 12. Schema 12 intentionally permits `user_override.rationale.minLength: 1` so that legacy passports and cross-session resume do not fail validation on historical entries. The round-counter increment and ≥100-char rationale check live in the agent's write-path, not in the JSON Schema. If you bypass the agent and hand-write a `user_override` entry into the passport, Schema 12 will accept any rationale length — but that entry will not have gone through the friction ladder and must be treated as unaudited.
````

#### After

````markdown
<!--rs:a:7c9478d2fb6c-->
### ResearchSpec Compliance Decision

Human compliance overrides are explicit decision-ledger entries supported by registered reports.

#### Decision Record

- After human confirmation, return override choice and rationale to the runtime for decision-ledger recording.
- Emit Schema 12 or compliance reports for runtime registration.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.

<!--/rs:a:7c9478d2fb6c-->
````

### anchor.shared.ground-truth-gate-verdict

- Owner skill: `shared`
- Source path: `shared/ground_truth_isolation_pattern.md`
- Marker id: `25942682a000`
- Severity: `recommended`
- Semantic role: `gate_policy`
- Replacement shape: `gate_rule_block`
- Template id: `ground-truth-isolation-to-researchspec-gates`
- ResearchSpec targets: `researchspec/specs/workflow.yaml`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper/references/shared/ground_truth_isolation_pattern.md`, `academic-paper-reviewer/references/shared/ground_truth_isolation_pattern.md`, `academic-pipeline/references/shared/ground_truth_isolation_pattern.md`, `deep-research/references/shared/ground_truth_isolation_pattern.md`
- Before SHA-256: `ef679f383fea1e2cca7b486ef8b495a0bf41050c09d279285883e030a11dedf5`
- After SHA-256: `1385c34ebf040af8f9256ae1b27180a4d9fb9670fcf6eaa43d8506b276dac5bc`

#### Before

````markdown
Only a passed integrity gate with a verified Material Passport does that.
````

#### After

````markdown
<!--rs:a:25942682a000-->
### ResearchSpec Ground Truth Gate

Data access level and verified-only constraints are workflow and gate policy.

#### Gate Inputs

- Read allowed data-access level and verified-only constraints from `researchspec/specs/workflow.yaml`.

#### Blocking Conditions

- Return unavailable, unverified, or policy-conflicting ground truth to the integrity gate helper.

#### Mutation Boundary

- Treat `researchspec/specs/workflow.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:25942682a000-->
````

### anchor.shared.ground-truth-isolation

- Owner skill: `shared`
- Source path: `shared/ground_truth_isolation_pattern.md`
- Marker id: `52352275e976`
- Severity: `recommended`
- Semantic role: `artifact_provenance`
- Replacement shape: `artifact_projection_block`
- Template id: `ground-truth-traceability-to-researchspec-provenance`
- ResearchSpec targets: `researchspec/runs/current/artifact-registry.json`, `researchspec/specs/sources.yaml`
- Generated output paths: `academic-paper/references/shared/ground_truth_isolation_pattern.md`, `academic-paper-reviewer/references/shared/ground_truth_isolation_pattern.md`, `academic-pipeline/references/shared/ground_truth_isolation_pattern.md`, `deep-research/references/shared/ground_truth_isolation_pattern.md`
- Before SHA-256: `8489fcd47b2e4871bd0a2f4044149638bcd5db48c9f201e499f783671c97c860`
- After SHA-256: `f742ab637a0bafc9d0ae8a6334cc81836de2e6221bdc42bdb67ad3a03cc522af`

#### Before

````markdown
chain must remain traceable through the Material Passport carried with each
artifact.
````

#### After

````markdown
<!--rs:a:52352275e976-->
### ResearchSpec Ground Truth Provenance

Ground-truth provenance is traceable through registered artifacts and canonical source records.

#### Provenance Chain

- Resolve evidence artifacts through `researchspec/runs/current/artifact-registry.json`.
- Link source identity and verification metadata through `researchspec/specs/sources.yaml`.

#### Mutation Boundary

- Treat `researchspec/specs/sources.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.

<!--/rs:a:52352275e976-->
````

### anchor.shared.handoff.invariants

- Owner skill: `shared`
- Source path: `shared/handoff_schemas.md`
- Marker id: `92dac59a66ca`
- Severity: `required`
- Semantic role: `gate_policy`
- Replacement shape: `gate_rule_block`
- Template id: `cross-schema-rules-to-researchspec-validator-gates`
- ResearchSpec targets: `researchspec/runs/current/gate-ledger.jsonl`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/references/shared/handoff_schemas.md`, `academic-paper-reviewer/references/shared/handoff_schemas.md`, `academic-pipeline/references/shared/handoff_schemas.md`, `deep-research/references/shared/handoff_schemas.md`
- Before SHA-256: `e1bc4e6eec4c6a6b12d5645553e7b93dc589076b9bf8a8d6554b0b0c0f7de557`
- After SHA-256: `1bd92f84340f3f3c897d2d0cfc09a15541e0a62a9f16d98db82381204e9032e0`

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
<!--rs:a:92dac59a66ca-->
### ResearchSpec Cross-Contract Gate

Cross-schema freshness and compatibility checks become ResearchSpec validator diagnostics and gate entries.

#### Gate Inputs

- Read artifact identities and hashes from `researchspec/runs/current/artifact-registry.json`.
- Compare declared contract dependencies against the current ResearchSpec specs and state.

#### Blocking Conditions

- Return stale, missing, or incompatible dependency findings to the cross-schema gate helper.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:92dac59a66ca-->
````

### anchor.shared.handoff.schema-convention

- Owner skill: `shared`
- Source path: `shared/handoff_schemas.md`
- Marker id: `ece45e8714b6`
- Severity: `required`
- Semantic role: `handoff_projection`
- Replacement shape: `schema_projection_table`
- Template id: `handoff-schema-convention-to-researchspec-contracts`
- ResearchSpec targets: `researchspec/specs/project.md`, `researchspec/specs/sources.yaml`, `researchspec/specs/claims.yaml`, `researchspec/specs/manuscript.yaml`, `researchspec/runs/current/artifact-registry.json`
- Generated output paths: `academic-paper/references/shared/handoff_schemas.md`, `academic-paper-reviewer/references/shared/handoff_schemas.md`, `academic-pipeline/references/shared/handoff_schemas.md`, `deep-research/references/shared/handoff_schemas.md`
- Before SHA-256: `24f2f8a9080227d39b038d392b831f95ef5dc249a0ccb74644b80d965449b2a7`
- After SHA-256: `35d066f4cbca9092a9fb98d86265a1b261cc9eae325759100c230d0c5f057486`

#### Before

````markdown
> **Convention**: All schemas use Markdown-based structured output. Agents MUST validate required fields before accepting a handoff. Missing required fields trigger a `HANDOFF_INCOMPLETE` failure path.
````

#### After

````markdown
<!--rs:a:ece45e8714b6-->
### ResearchSpec Schema Projection

ARS Markdown schemas describe payloads; ResearchSpec contracts provide stable machine-readable runtime state.

#### Projection Targets

- Research questions and target venue project to `researchspec/specs/project.md`.
- Sources and corpus records project to `researchspec/specs/sources.yaml`.
- Claims and support limits project to `researchspec/specs/claims.yaml`.
- Draft structure and manuscript constraints project to `researchspec/specs/manuscript.yaml`.

#### Artifact Rule

- Keep the original ARS schema payload as a registered artifact in `researchspec/runs/current/artifact-registry.json`.

#### Mutation Boundary

- Treat `researchspec/specs/project.md`, `researchspec/specs/sources.yaml`, `researchspec/specs/claims.yaml`, `researchspec/specs/manuscript.yaml` as read-only; propose semantic changes through `researchspec/changes/<change-id>/contract-patch.yaml` for human acceptance.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.

<!--/rs:a:ece45e8714b6-->
````

### anchor.shared.handoff.schema11-commitments

- Owner skill: `shared`
- Source path: `shared/handoff_schemas.md`
- Marker id: `deae197cae7d`
- Severity: `required`
- Semantic role: `review_commitment_tracking`
- Replacement shape: `schema_projection_table`
- Template id: `schema11-commitments-to-researchspec-change-patches`
- ResearchSpec targets: `researchspec/changes/<change-id>/contract-patch.yaml`, `researchspec/draft-patches/<patch-id>.json`, `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/decision-ledger.jsonl`
- Generated output paths: `academic-paper/references/shared/handoff_schemas.md`, `academic-paper-reviewer/references/shared/handoff_schemas.md`, `academic-pipeline/references/shared/handoff_schemas.md`, `deep-research/references/shared/handoff_schemas.md`
- Before SHA-256: `3773a18fe88945df922430c6423aa3a96c68d8c2ffafd991abba6442aa119d87`
- After SHA-256: `e2b7e0f2e5830bdff6d249aaeea05f93104323485cfb3af150fc9c90911c5765`

#### Before

````markdown
**Consumer**: academic-paper (revision mode, if further revision needed), pipeline orchestrator. Schema 11 is carried forward via Material Passport (Schema 9) for cross-stage audit.
````

#### After

````markdown
<!--rs:a:deae197cae7d-->
### ResearchSpec Reviewer Commitment Projection

Reviewer commitments become explicit changes, draft patches, artifacts, and decisions.

#### Projection Rules

- Scope or claim changes become `researchspec/changes/<change-id>/contract-patch.yaml`.
- Manuscript edits become `researchspec/draft-patches/<patch-id>.json`.
- Review reports and response matrices are registered in `researchspec/runs/current/artifact-registry.json`.
- Strategic choices are recorded in `researchspec/runs/current/decision-ledger.jsonl`.

#### Mutation Boundary

- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.

<!--/rs:a:deae197cae7d-->
````

### anchor.shared.handoff.schema9-material-passport

- Owner skill: `shared`
- Source path: `shared/handoff_schemas.md`
- Marker id: `db0cf94f84b6`
- Severity: `required`
- Semantic role: `runtime_state_boundary`
- Replacement shape: `artifact_projection_block`
- Template id: `material-passport-schema9-to-researchspec-runtime`
- ResearchSpec targets: `researchspec/runs/current/state.yaml`, `researchspec/runs/current/artifact-registry.json`, `researchspec/runs/current/decision-ledger.jsonl`, `researchspec/runs/current/gate-ledger.jsonl`
- Generated output paths: `academic-paper/references/shared/handoff_schemas.md`, `academic-paper-reviewer/references/shared/handoff_schemas.md`, `academic-pipeline/references/shared/handoff_schemas.md`, `deep-research/references/shared/handoff_schemas.md`
- Before SHA-256: `66d6edfd32f6fbfc4ea2198020b68fd8bc21c91265e5fadd22b3a69e8ecd59f5`
- After SHA-256: `ffb8de902c2ee432ff5d31313edb993ad144ea85ab9b7138d8070ea3b13e98e6`

#### Before

````markdown
When `ARS_PASSPORT_RESET=1`, Schema 9 gains an append-only `reset_boundary[]` ledger with two entry kinds: `boundary` (recorded at FULL checkpoints) and `resume` (recorded when a boundary is consumed):
````

#### After

````markdown
<!--rs:a:db0cf94f84b6-->
### ResearchSpec Material Passport Projection

Material Passport fields are projected into ResearchSpec runtime records instead of being updated as a monolithic ledger.

#### Projection Targets

- Stage, mode, and resume state go to `researchspec/runs/current/state.yaml`.
- Produced files and hashes go to `researchspec/runs/current/artifact-registry.json`.
- Human branch choices go to `researchspec/runs/current/decision-ledger.jsonl`.
- Verification outcomes go to `researchspec/runs/current/gate-ledger.jsonl`.

#### Mutation Boundary

- Request changes to `researchspec/runs/current/state.yaml` through the ResearchSpec orchestrator or runtime helper; do not edit run state directly.
- Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.
- After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.
- Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.

<!--/rs:a:db0cf94f84b6-->
````

## Diagnostic-Only Anchors

### anchor.shared.artifact-reproducibility-passport

- Source path: `shared/artifact_reproducibility_pattern.md`
- Matched: `true`
- Severity: `diagnostic`
- Diagnostics: _none_

### anchor.shared.style-profile-carry

- Source path: `shared/style_calibration_protocol.md`
- Matched: `true`
- Severity: `diagnostic`
- Diagnostics: _none_

