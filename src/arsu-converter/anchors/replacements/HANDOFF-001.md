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
