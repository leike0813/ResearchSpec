**ARS import contract:** the selected Material Passport boundary is external evidence, not runtime state.

1. Require an explicit Passport path, expected SHA-256 and, when resuming a boundary, its 12-character boundary hash.
2. Parse only strict JSON or YAML and reject path escape, symlink escape, hash drift, ambiguous boundary selection and duplicate consumption.
3. Normalize the source into a deterministic projection without modifying the source bytes.
4. Preview `start subflow:tpl-academic-pipeline-mid-entry` with `material_passport_import` and bind the import identity into the Start plan hash.
5. After human confirmation, register the source, projection and accompanied artifact; append imported Gate/Decision evidence with `authority: imported_evidence`; record the consumed boundary; then commit the new instance state last.
6. Begin at the current template entry stage. Imported records cannot satisfy a current Gate, branch Decision or transition.
The import transaction commits consumption through `researchspec/runs/current/state.yaml`.
