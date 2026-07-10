## 1. Typed Catalog Contract And Data

- [x] 1.1 Add strict routing catalog Zod contracts, inferred types, stable issue codes, reference validation, and shared ARSU Skill IDs.
- [x] 1.2 Encode the canonical four Skills, 25 modes, two pipeline entries, artifacts, prerequisite groups, near-misses, risk/Gate policies, and cost bands.
- [x] 1.3 Add deterministic full Skill and concise command description projections.

## 2. Converter And Adapter Integration

- [x] 2.1 Project catalog descriptions into generated `SKILL.md` frontmatter while preserving other YAML metadata and body semantics.
- [x] 2.2 Generate `routing-catalog.json`, register its hash/metadata in the conversion manifest, report route counts, and bump converter version.
- [x] 2.3 Validate generated catalog equality, reference integrity, manifest linkage, and Skill description projections.
- [x] 2.4 Derive converter group selection, delivery Skill IDs, and ARSU command contents from the catalog without changing wrapper behavior.

## 3. Tests, Generated Output, And Documentation

- [x] 3.1 Add focused catalog, projection, converter, validation, and adapter behavior tests.
- [x] 3.2 Regenerate converter-owned `skills/arsu` and verify generated-output idempotence.
- [x] 3.3 Update the canonical user model and routing/Schema/Skill/workflow documentation to mark the catalog implemented.
- [x] 3.4 Mark umbrella Task 2.1 complete while keeping both changes active.

## 4. Verification

- [x] 4.1 Run TypeScript, lint, tests, converter check/idempotence, both OpenSpec strict validations, and whitespace/scope checks.
