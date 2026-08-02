### ResearchSpec Current Owner

Replacement scope: `ARTIFACT-001` for `academic-pipeline`.

Boundary deliverables remain ordinary project files outside `researchspec/`.
The producing subflow records each actual output in its handoff with a unique
role, type, safe project-relative path, purpose, producer or intended consumer,
and relevant limits. ResearchSpec does not assign another file identity, copy
the file, or manage its version history. The owning control records only
the subflow's lifecycle and formal decisions.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
