## Context

ResearchSpec already maintains reproducible ToolUniverse and Scientific Agent Skills audits with machine-readable evidence, reports, Zod validation, and focused regression tests. Materials-Science-Skills-For-LLM has twelve top-level Skills and no release tag at the selected revision. Its root MIT license is relevant evidence, but it cannot by itself establish the license or provenance of every copied or referenced Skill resource. Several Skills also expose portability and authority concerns: development-maintenance surfaces, broken references, absolute private paths, external services, credential-bearing flows, downloads, schedulers, and HPC execution.

The audit is a maintainer input only. Production ingestion must remain a separate, reviewable change so that evidence collection cannot silently create admission, dependency, resource, domain, or registry decisions.

## Goals / Non-Goals

**Goals:**

- Pin the official upstream repository at the full selected revision and identify it honestly as `snapshot-fafd3ab`.
- Audit every top-level Skill exactly once with stable ordering and evidence-path validation.
- Reuse common audit primitives while expressing vendor-specific readiness, scope, classification, resource, relationship, licensing, overlap, risk, and finding data.
- Produce a concise human report derived from the same reviewed evidence.
- Freeze safe constraints for a later non-executing converter and verify that audit-only content is excluded from npm publication.

**Non-Goals:**

- Creating a converter, production decision catalogs, generated Skills, Plugins, domain memberships, package scripts, or registry entries.
- Executing upstream scripts or commands, installing dependencies, downloading models or data, configuring credentials, accessing services, or running scientific/HPC workloads.
- Predetermining how many Skills a future ingestion change will admit.

## Decisions

### Pin a commit snapshot as a maintainer-only submodule

The repository SHALL be linked at `vendor/materials-science-skills-for-llm` with official URL `https://github.com/IntelligentMat/Materials-Science-Skills-For-LLM.git` and revision `fafd3ab011e4c363658a39c4bb62fc739839d58c`. Because upstream has no applicable release tag, audit artifacts use `snapshot-fafd3ab`; inventing a semantic release would obscure provenance. A copied tree was rejected because a gitlink makes origin and revision independently verifiable.

### Separate a Skill-root path from ordinary evidence paths

The shared `AuditEvidencePathSchema` continues to reject `.` and unsafe paths. A new `AuditSkillRootSchema` accepts either `.` or the same safe relative-path grammar, because a top-level Skill may legitimately use repository root while evidence references must identify concrete files. Broadening the evidence-path schema was rejected because it would weaken existing audits.

### Promote content-license review into the shared audit contract

The existing Scientific Agent Skills content-license structure becomes a shared schema and exported type without changing its allowed states or interpretation. The Scientific Agent Skills module imports the shared definition. Duplicating an equivalent vendor schema was rejected because content provenance and review status are cross-vendor concepts and should have one contract.

### Keep the materials-science audit vendor-specific

The new schema records snapshot identity, audit scope, one entry per Skill, readiness (`candidate`, `needs-curation`, `blocked-review`, or `exclude`), ANZSRC Field audit metadata, prospective allowed domains, resources, relationships, content-license review, operational risks, overlap, structured findings, and a recommendation. Vendor-specific facts are not forced into the narrower existing vendor schemas.

Research workflow and reusable scientific-computing guidance can be candidates. Development maintenance, platform management, or private local tooling defaults to exclusion. Potentially useful content with unresolved licensing, broken references, external-service/credential requirements, or portability defects remains `blocked-review` or `needs-curation`; no risk flag implies automatic approval.

### Constrain future ingestion without implementing it

A later change named `ingest-materials-science-skills-for-llm` may add a vendor-specific, non-executing converter. Generated IDs SHALL use `materials-science-skills-<upstream-id>`. Only the existing domains `materials-engineering`, `macromolecular-and-materials-chemistry`, `computational-modeling-and-simulation`, and `research-computing-infrastructure` may be considered. ANZSRC Field data is audit metadata and never creates membership automatically.

That converter must normalize frontmatter, LICENSE/NOTICE, compatibility, permission boundaries, broken links, and absolute paths through explicit reviewed decisions. ResearchSpec must not execute commands, install dependencies, configure credentials, download resources, access external services, or dispatch HPC work.

### Test stable contracts, not report prose

Tests SHALL verify origin, revision, clean checkout, exact twelve-Skill coverage, ordering, resource counts, evidence paths, references, frontmatter, license/risk state, named regression boundaries, and zero production registry/catalog change. The report is checked for core identifiers and decision boundaries rather than snapshotted verbatim.

### Exclude maintainer inputs from publication

Release verification SHALL explicitly reject `vendor/materials-science-skills-for-llm/` and `audits/` entries in the npm tarball even though the package allowlist already excludes them. Explicit checks prevent a future allowlist change from publishing maintainer evidence accidentally.

## Risks / Trade-offs

- **[Root MIT license may not cover incorporated Skill content]** → Record root-license evidence separately and require per-Skill content-license review and source references.
- **[Audit judgments can become stale]** → Bind every record to the immutable revision and require a new snapshot audit for upstream changes.
- **[Submodule availability can affect tests]** → Validate the pinned checkout deliberately and fail with actionable provenance errors; never fetch or execute it during normal runtime.
- **[Detailed risk flags can be mistaken for executable support]** → Keep readiness and authority boundaries explicit in schema, report, spec, and future-ingestion constraints.
- **[Shared-schema extraction could change an existing audit]** → Preserve the exact Scientific Agent Skills states and cover the extraction with its existing tests.

## Migration Plan

1. Add and pin the maintainer-only submodule.
2. Extract the shared content-license schema and add the Skill-root schema.
3. Add the vendor-specific audit schema, machine SSOT, report, and tests.
4. Update maintainer guidance and release verification.
5. Run strict OpenSpec validation and the repository validation suite.

Rollback consists of removing this unarchived change, its audit-only source/data/tests, and the new submodule entry. No production artifacts or user workspaces require migration.

## Open Questions

None. Production admission counts and detailed converter decisions intentionally remain open for `ingest-materials-science-skills-for-llm`.
