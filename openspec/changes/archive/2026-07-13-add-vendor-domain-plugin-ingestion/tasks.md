## 1. Registry And Resolution Contracts

- [x] 1.1 Replace unpublished Registry Schema 1 with strict vendor, vendor-Skill, dependency, and domain DTOs and validation
- [x] 1.2 Add deterministic dependency closure, cycle diagnostics, overlapping-domain assembly, and catalog status projections
- [x] 1.3 Replace plugin fixtures with vendor/domain fixtures covering invalid references, paths, provenance, overlap, and cycles

## 2. Domain Lifecycle And Delivery

- [x] 2.1 Refactor delivery to project resolved vendor Skills once per Agent tool without adding wrappers or executing resources
- [x] 2.2 Extend the installation manifest with vendor ownership and per-domain resolution snapshots
- [x] 2.3 Refactor plugin list, show, install, update, uninstall, status, and checks around explicit domain selections and dynamic closures
- [x] 2.4 Cover idempotence, shared dependencies, tool backfill, drift-safe removal, force refresh, and retired-domain uninstall

## 3. ToolUniverse Vendor Converter

- [x] 3.1 Define ToolUniverse converter inputs, audit admission catalog, domain catalog, dependency decisions, and maintainer CLI scripts
- [x] 3.2 Implement pinned-source validation, frontmatter/resource adaptation, license/notice generation, and non-executing file emission
- [x] 3.3 Generate the ToolUniverse vendor bundle, three-domain registry, conversion manifest, report, and all 130 admitted Skill trees
- [x] 3.4 Add converter validation and idempotence tests for inventory, dependencies, resource disposition, and domain membership

## 4. Documentation And Release

- [x] 4.1 Update canonical plugin, architecture, CLI, usage, README, and AGENTS guidance for vendor/domain ownership and authority boundaries
- [x] 4.2 Update package scripts, npm whitelist, release verifier, and release documentation for generated vendor assets

## 5. Verification

- [x] 5.1 Run strict OpenSpec validation and focused converter, registry, CLI, delivery, adapter, and user-journey tests
- [x] 5.2 Run `pnpm check`, full `pnpm test`, `pnpm lint`, `pnpm build`, and `pnpm release:verify`
