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

## Marker lifecycle (one rule for all marker kinds)

`<!--block:-->` markers live in **working drafts only**, exactly like `<!--ref:-->` / `<!--anchor:-->`. Two authoritative rules govern them — this doc indexes them rather than re-owning the wording, so the rule cannot drift out of sync with the surfaces the #390 lint guards:

- **Word counts exclude markers** — strip every `<!--...-->` before `len(body.split())`. Authoritative: `shared/references/word_count_conventions.md` § HTML-comment markers.
- **Phase 7 strips markers from converted final outputs**, after the marker-dependent gates run on the working draft; working drafts and `phase6_*/` artifacts keep theirs (the anchor layer the next round's manifest needs). Authoritative: `formatter_agent.md` § ARS Marker Stripping.
