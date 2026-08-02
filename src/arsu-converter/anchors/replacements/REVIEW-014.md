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
