## 1. Source Snapshot and Contracts

- [x] 1.1 Add the official Education Agent Skills checkout at commit `32fce5c0d097ec675cf81c750a65a379e4d87e3c` and record its remote, tree hash, clean state, and `snapshot-32fce5c` identity.
- [x] 1.2 Define strict audit DTOs, enums, path/hash rules, cross-reference validation, and summary invariants for the exact JSON SSOT shape.
- [x] 1.3 Add source-hash-bound manual review decisions covering every Skill, named reference, license/provenance scope, relationship, overlap, sensitive risk, ANZSRC Group candidate, and ingest recommendation.

## 2. Deterministic Audit Implementation

- [x] 2.1 Implement local Git inventory and exact tracked-file classification with safe paths, hashes, stable sorting, and complete `skills/**/SKILL.md` discovery.
- [x] 2.2 Implement two-frontmatter parsing and extraction of upstream metadata, audience, capabilities, I/O, resources, external authority, contributors, evidence, and `chains_well_with` declarations.
- [x] 2.3 Build and schema-validate the complete audit JSON by combining deterministic source observations with explicit source-bound review conclusions.
- [x] 2.4 Implement a deterministic Markdown report renderer whose counts and conclusions derive only from the validated JSON.
- [x] 2.5 Add one internal CLI with writing `audit` and read-only `audit:check` modes, including source drift, artifact byte synchronization, and actionable failures.
- [x] 2.6 Add `education-agent-skills:audit` and `education-agent-skills:audit:check` package scripts without adding a public ResearchSpec CLI command.

## 3. Audit Evidence and Review

- [x] 3.1 Generate `skill-audit.json`, verify every tracked file and Skill is covered once, and complete all evidence, licensing, provenance, relationship, overlap, risk, domain, and recommendation conclusions.
- [x] 3.2 Generate `report.md` from the JSON and manually review actual Skill, prospective-domain, reference, relationship, license, recommendation, and risk summaries for consistency.
- [x] 3.3 Confirm the audit remains non-admission and that the frozen future ingest boundary matches the design without creating converter, registry, bundle, or domain output.

## 4. Tests and Project Boundaries

- [x] 4.1 Add focused tests for remote/commit/tree/source drift, exhaustive inventory and Skill coverage, safe unique paths and IDs, correct hashes, stable sorting, and byte-identical repeated generation.
- [x] 4.2 Add representative parser/schema tests for dual frontmatter, invalid evidence and license enums, missing license, duplicate or unresolved relationships, conflicting references, and sensitive audiences.
- [x] 4.3 Add completeness tests requiring an explicit conclusion for every reference, relationship, license/provenance, overlap, sensitive risk, prospective domain, and ingest recommendation.
- [x] 4.4 Verify the npm tarball excludes the Education Agent Skills checkout and audit evidence and that production registry, existing vendor bundles, and the sixteen-command public CLI remain unchanged.
- [x] 4.5 Update project `AGENTS.md` with the external source path, immutable snapshot identity, audit boundary, safety constraints, and separate future-ingest requirement.

## 5. Validation

- [x] 5.1 Run strict OpenSpec validation, audit check, focused and full tests, type checking, lint, build, package verification, and `git diff --check`; resolve every failure in scope.
- [x] 5.2 Verify every delta-spec scenario has implementation and test evidence, all tasks are complete, JSON/report/design decisions agree, and no CRITICAL issue remains before leaving the change ready to archive.
