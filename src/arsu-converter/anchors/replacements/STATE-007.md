### ResearchSpec Current Owner

Replacement scope: `STATE-007` for `academic-pipeline`.

ResearchSpec reset and resume state lives only in current run and node instances, artifact records, human-confirmed Gate attempts and Decisions. external input handling is one-way: the importer reads immutable external bytes, registers their normalized evidence and records consumption in current state. Re-running work creates new explicit artifacts; it never appends boundary or resume entries to the source external input.
Current resume state lives in `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`.

Current ResearchSpec owners:

- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
- `researchspec/runs/<run-id>/handoff.md`
