## 1. Taxonomy And Contracts

- [x] 1.1 Add the attributed ANZSRC 2020 FoR snapshot and validate its 23 Divisions, 213 Groups, 1,967 Fields, hierarchy, release, and source hash
- [x] 1.2 Add the source-neutral 213-discipline plus five-tool domain catalog with typed DTOs, stable IDs, and explicit reviewed Skill membership
- [x] 1.3 Extend Registry Schema 1 with taxonomy metadata, discipline/tool domain variants, Skill-level licenses, valid empty domains, and one public-availability helper

## 2. Vendor Isolation And Assembly

- [x] 2.1 Refactor the ToolUniverse converter to emit only its isolated vendor bundle and generated Skill tree while retaining the existing maintainer commands
- [x] 2.2 Add the deterministic central assembler as the only production registry writer and migrate ToolUniverse into 28 ANZSRC Group domains and two non-empty tool domains
- [x] 2.3 Regenerate and check ToolUniverse vendor assets, bundle metadata, manifests, reports, and the production registry without changing Skill content or dependencies

## 3. Runtime Lifecycle

- [x] 3.1 Apply non-empty availability consistently to resolver, list, show, install, status, check, init, and update while hiding all unselected empty domains
- [x] 3.2 Preserve selected empty or missing domains as unavailable recovery state with manifest snapshots, update blocking, safe uninstall, and later repopulation
- [x] 3.3 Update Navigate guidance to recommend only installed, available, projected Skills without creating workflow authority

## 4. Audit Metadata

- [x] 4.1 Replace legacy ToolUniverse domain evidence with validated Field metadata for all 150 audit records and update its report and tests
- [x] 4.2 Add validated Field metadata or explicit unclassified reasons to all 147 Scientific Agent Skills records without production ingestion

## 5. Documentation And Release

- [x] 5.1 Add the canonical domain taxonomy document with the complete ANZSRC Division/Group catalog, tool boundaries, visibility rules, mappings, source, and attribution
- [x] 5.2 Synchronize plugin, adapter, user model, CLI, architecture, Skill design, PRD, README, AGENTS, traceability, package whitelist, and release verifier guidance

## 6. Verification

- [x] 6.1 Extend existing taxonomy, registry, converter, CLI, lifecycle, Navigate, audit, and release tests around stable observable behavior
- [x] 6.2 Run strict OpenSpec validation, type checks, converter checks and idempotence, and focused plugin, converter, CLI, and audit tests
- [x] 6.3 Run the full test suite, lint, build, and release verification
