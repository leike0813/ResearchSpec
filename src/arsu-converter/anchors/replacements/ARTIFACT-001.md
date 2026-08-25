### ResearchSpec Current Owner

Replacement scope: `ARTIFACT-001` for `academic-pipeline`.

Boundary deliverables remain ordinary project files outside `researchspec/`.
The producing node records each actual output in its handoff with a unique
role, type, safe project-relative path, purpose, producer or intended consumer,
and relevant limits. ResearchSpec does not assign another file identity, copy
the file, or manage its version history. The owning control records only
the run's lifecycle and formal decisions.

Current ResearchSpec owners:

- `researchspec/runs/<run-id>/handoff.md`
- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
