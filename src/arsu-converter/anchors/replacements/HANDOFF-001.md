### ResearchSpec Current Owner

Replacement scope: `HANDOFF-001` for `academic-pipeline`.

Record every boundary input and output in the owning run's
`researchspec/runs/<run-id>/handoff.md`. Each entry identifies its role,
type, safe project-relative path, purpose, producer or intended consumer, and
relevant limits. The referenced file remains an ordinary project file outside
`researchspec/`; external metadata may stay in that file but does not become
ResearchSpec authority.

For manuscript roles, also record the declared `format`. A QMD source uses a
`.qmd` path and remains the final source manuscript. A rendered output records
the selected target format and `renderer: quarto`; both source and render remain
external boundary deliverables and are never copied by `pack`.

Place stable research intent, source identity, accepted claims, and manuscript
structure in their four owning specs. Place formal Gate attempts, Decisions,
and the active frontier in the owning node state. Manuscript revision
operations may use the ARSU revision patch contract, but the patch remains a
stateless boundary file and creates no separate ResearchSpec lifecycle.

Current ResearchSpec owners:

- `researchspec/specs/project.md`
- `researchspec/specs/sources.yaml`
- `researchspec/specs/claims.yaml`
- `researchspec/specs/manuscript.yaml`
- `researchspec/runs/<run-id>/handoff.md`
- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
- `assets/shared/contracts/patch/revision_patch.schema.json`
