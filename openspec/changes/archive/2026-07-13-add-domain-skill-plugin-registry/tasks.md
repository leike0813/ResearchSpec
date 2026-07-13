## 1. Registry Contracts

- [x] 1.1 Add the empty production registry and typed Schema 1 parser with safe ID, provenance, global Skill uniqueness, base-surface collision, and derived-path validation.
- [x] 1.2 Add Open Agent Skills frontmatter, directory/name, resource, license, and notice validation plus reusable registry fixtures.

## 2. Workspace And Delivery

- [x] 2.1 Extend workspace config and installation manifest DTOs for workspace plugin selection and plugin ownership metadata without changing the workspace schema version.
- [x] 2.2 Refactor delivery into fixed base Skills plus registry-driven optional plugin Skill resources while preserving exactly eight wrappers.
- [x] 2.3 Implement plugin install/update/uninstall planning, manifest-last writes, no-tool selection, drift protection, retired-plugin uninstall, and new-tool backfill.

## 3. CLI And Guidance

- [x] 3.1 Add the sixteenth `plugin` command with package-only list/show and workspace install/update/uninstall JSON and human output.
- [x] 3.2 Extend status and `check all|plugins` with selected, available, unavailable, projected, missing, and hash-drift plugin facts.
- [x] 3.3 Update Navigate guidance to recommend only semantically matching installed plugin Skills without changing workflow authority.

## 4. Verification Coverage

- [x] 4.1 Add registry and Open Agent Skills validation tests for valid and invalid catalogs, provenance, paths, IDs, metadata, licenses, and resources.
- [x] 4.2 Add CLI/delivery lifecycle tests for tool/no-tool projection, idempotence, update, force, drift-safe uninstall, retired plugins, JSON output, all 31 Skill adapters, and fixed 28 wrapper counts.
- [x] 4.3 Add acceptance and release tests proving default init remains eight base Skills, plugin scripts are copied but never executed, and package contents exclude fixtures.

## 5. Documentation And Release

- [x] 5.1 Add the canonical domain plugin document and synchronize the user model, CLI, architecture, Skill command, PRD, README, and project AGENTS constraints.
- [x] 5.2 Add registry and canonical plugin documentation to npm distribution and release verification.

## 6. Final Validation

- [x] 6.1 Run strict OpenSpec validation, type checking, focused tests, the full suite, lint, build, and release verification; resolve all in-scope failures.
