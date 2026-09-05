# Revision Patch Protocol (#390)

<!--rs:PATCH-003-->
### ResearchSpec Current Owner

Replacement scope: `PATCH-003` for `academic-paper`.

## ResearchSpec revision patch protocol

The adapted contract at
`assets/shared/contracts/patch/revision_patch.schema.json` is the only
manuscript patch schema. A revision patch is an ARSU revision input/output file,
not a ResearchSpec framework lifecycle record or lifecycle object.

One bounded mechanical application is:

1. Select an anchored Markdown or QMD manuscript and create a patch whose
   `base_draft_hash` matches those exact bytes.
2. Review the operation IDs, block targets, `old_hash` values, roadmap links,
   rationale, and any complete annotation mapping.
3. Run `node scripts/apply-revision-patch.mjs --base <base.md-or.qmd> --patch <patch.json>
   --output <revised.md-or.qmd>` and add `--report <summary.json>` only when a derived
   diagnostic summary is useful.
4. On any preflight failure, correct the inputs or revise manually. The helper
   creates no partial output and never changes a run and node state or handoff.

An omitted `authorization_context` means review-roadmap semantics. An
`integrity_correction` patch cites the supplied correction IDs through
`roadmap_item_ids` and cannot declare `claim_strength_changes`. A review claim
strength declaration names an accepted ResearchSpec `change_id`, old and new
stable strengths, direction, and rationale; the helper checks only that shape,
so the Agent must inspect the accepted change and evidence. Local annotation
mapping remains the author-disposition record; upstream author-adjudication and
passport/hash-chain sidecars are outside this contract.

Untouched anchored blocks remain byte-identical under helper application. That
mechanical guarantee says nothing about whether edited text answers the review.
For QMD, YAML frontmatter, fenced code, cell options, and Quarto metadata are
ordinary protected manuscript bytes unless an operation explicitly targets the
containing anchored block; the output keeps the `.qmd` extension.
The current manuscript, response to reviewers, optional patch/summary, and
external review material may inform a formal revision Gate, but a human records
the verdict in the owning run the owning node instance.

Annotation intake material is private under `work/annotation-intake/` by
default. Cross-node patch, manuscript, annotation, response, or report files
must use safe project-relative paths outside `researchspec/` and be listed by
role in the owning `handoff.md`.

Current ResearchSpec owners:

- `assets/shared/contracts/patch/revision_patch.schema.json`
- `scripts/apply-revision-patch.mjs`
- `work/annotation-intake/`
- `researchspec/runs/<run-id>/handoff.md`
- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
<!--/rs:PATCH-003-->

**Structural scope escalation:** current #670 rounds remain patch-based. If the
authorized scopes cannot express the intended change, stop and collect a new
explicit author sidecar with exact expanded targets, or narrow the edit.
Historical full re-emission remains a visibly separate legacy workflow; it
cannot emit a current 1.3 authorization PASS witness or appear as a current
Revision-Evidence Bundle round.

## Current authorization rules (#670)

- The current CLI rejects patch 1.0. Archived 1.0 schema/runtime live only
  under `shared/contracts/patch/legacy/v1_0/` and `scripts/legacy/`.
- Every review op cites only `will_address` items and stays inside their exact
  authorized block/operation subsets.
- Declined items authorize neither work nor claim movement. An overlapping
  target requires an exact, single-use collateral authorization for every
  declined item on that target.
- Every registered claim surface remains exact or uses one exact single-use
  author-approved replacement (manifest, claim, surface, block, hashes, text,
  rungs, direction). `will_address` alone is not claim authority.
- The report always discloses
  `unregistered_claim_drift_review_required: true`; unregistered semantic
  movement remains an E6 review surface.
- An all-declined round is a `review_noop`: no patch/report and byte-identical
  pre/post drafts.
- An integrity correction list and an integrity-gate result are proposal
  evidence only. The exact writer-emitted patch must be separately approved
  through explicit author input binding its `revision_patch_sha256` and exact
  targets/operations.
- Integrity apply requires both `--integrity-issue-list` and
  `--integrity-authorization`. `stop_without_write` grants no operation, and a
  substituted patch invalidates the hash-bound sidecar before any write.

Validate the accumulated bundle before re-review/final integrity:

```bash
python scripts/revision_roadmap.py validate-bundle \
    revision-evidence-bundle.json --root revision-authority/
```

## Marker lifecycle (one rule for all marker kinds)

`<!--block:-->` markers live in **working drafts only**, exactly like `<!--ref:-->` / `<!--anchor:-->`. Two authoritative rules govern them — this doc indexes them rather than re-owning the wording, so the rule cannot drift out of sync with the surfaces the #390 lint guards:

- **Word counts exclude markers** — strip every `<!--...-->` before `len(body.split())`. Authoritative: `../../../shared/references/word_count_conventions.md` § HTML-comment markers.
- **Phase 7 strips markers from converted final outputs**, after the marker-dependent gates run on the working draft; working drafts and `phase6_*/` artifacts keep theirs (the anchor layer the next round's manifest needs). Authoritative: `formatter_agent.md` § ARS Marker Stripping.
