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
destination. It does not read the pipeline profile, mutate the owning node instance or
`handoff.md`, or decide whether the revision is academically complete. Manual
revision remains valid.

An omitted `authorization_context` uses review-roadmap semantics. An explicit
`integrity_correction` patch carries only supplied correction IDs through
`roadmap_item_ids`, carries no claim-strength changes, and emits no response
items because no review round occurred. Review claim-strength changes must
reference an accepted ResearchSpec `change_id` and state the stable strength
move with rationale; the Agent checks acceptance and evidence, while the
stateless helper checks structure only. ResearchSpec retains Gate and Decision
authority and does not adopt upstream lifecycle or hash-chain sidecars.

Each revision child has its own start confirmation and formal Gates. After the
producer finishes, the current manuscript and relevant boundary evidence return
through the handoff. A human records the revision Gate verdict in the owning
child run state; the parent advances only under the profile's declared
join and transition rules. Structural re-emission, scope changes, and other
research choices follow the same explicit confirmation discipline.

Current ResearchSpec owners:

- `assets/shared/contracts/patch/revision_patch.schema.json`
- `scripts/apply-revision-patch.mjs`
- `researchspec/runs/<run-id>/handoff.md`
- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
