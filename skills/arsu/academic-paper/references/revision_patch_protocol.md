# Revision Patch Protocol (#390)

**Spec:** `docs/design/2026-06-10-390-diff-patch-revision-mode-spec.md` (mechanism §3, coverage claim §4, escalation §3.6).
<!--rs:PATCH-003-->
**Toolchain ownership:** ResearchSpec deterministic helpers prepare block
manifests, validate and apply `researchspec/draft-patches/<patch-id>.json`, and
emit apply reports. Both orchestrated and phase-by-phase runs resolve inputs and
return outputs through `researchspec/runs/current/artifact-registry.json`; users
do not need ARS-specific script paths embedded in agent instructions.

**What this buys:** a block not named by an operation is never passed through a
generation step and therefore remains byte-identical. This is a deterministic
apply guarantee, not a claim that edited blocks are correct. Structural rewrites
remain outside ordinary patch protection and require escalation.

## Artifacts and naming

| Artifact | Owner | Contract |
| --- | --- | --- |
| Base manuscript | runtime registry | immutable artifact id and content hash |
| Block manifest | preparation helper | base hash plus stable block ids, old hashes, and excerpts |
| Patch document | writer | `researchspec/draft-patches/<patch-id>.json` with target and traceability |
| Revised manuscript | apply helper | new artifact; base is never overwritten |
| Apply report | apply helper | operations, fresh ids, structural flags, and `preserved_ratio` |

The revised manuscript and apply report share one lifecycle and are required
inputs to re-review and the Stage 4.5 integrity gate.

## One revision round

1. Resolve the current manuscript artifact and run the preparation helper to
   refresh its block manifest. Do not rewrite the manuscript afterward.
2. Give the writer the exact manuscript, manifest, and accepted Revision Roadmap
   or integrity correction list. The writer emits the dedicated draft-patch file.
3. Run the apply helper. It validates the whole patch before writing and creates
   a new manuscript plus apply report on success.
4. Run finalizer/citation checks on the new manuscript, return both outputs for
   registration, and re-review using the apply report as required evidence.

On stale hash, unknown target, schema failure, or precondition failure, preserve
the base bytes and allow one full patch retry against the current manifest. A
second failure stops for a human decision: prepare a fresh manifest and retry,
approve full re-emission, or abort.

On structural flags—heading rewrites/deletes, net section-count change, or
`touched_ratio > 0.6`—stop for explicit human confirmation. Narrowing the patch
does not require full re-emission; applying acknowledged structural operations
keeps the flags in the report. Changing the threshold or approving full
re-emission must be returned to the decision runtime for
`researchspec/runs/current/decision-ledger.jsonl`.

After confirmed full re-emission, prepare a new block manifest, retire every
patch tied to the old manuscript hash, and record
`mode: full_reemission_escalated`. Apply failures and structural refusals are
submitted to the relevant gate helper for
`researchspec/runs/current/gate-ledger.jsonl`; no agent writes the ledger
directly.
<!--/rs:PATCH-003-->

## Marker lifecycle (one rule for all marker kinds)

`<!--block:-->` markers live in **working drafts only**, exactly like `<!--ref:-->` / `<!--anchor:-->`. Two authoritative rules govern them — this doc indexes them rather than re-owning the wording, so the rule cannot drift out of sync with the surfaces the #390 lint guards:

- **Word counts exclude markers** — strip every `<!--...-->` before `len(body.split())`. Authoritative: `shared/references/word_count_conventions.md` § HTML-comment markers.
- **Phase 7 strips markers from converted final outputs**, after the marker-dependent gates run on the working draft; working drafts and `phase6_*/` artifacts keep theirs (the anchor layer the next round's manifest needs). Authoritative: `formatter_agent.md` § ARS Marker Stripping.
