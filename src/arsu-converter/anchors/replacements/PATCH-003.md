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
