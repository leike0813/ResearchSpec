## ResearchSpec revision patch protocol

The adapted contract at
`assets/shared/contracts/patch/revision_patch.schema.json` is the only
manuscript patch schema. A revision patch is an ARSU revision input/output file,
not a ResearchSpec registry record or lifecycle object.

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
