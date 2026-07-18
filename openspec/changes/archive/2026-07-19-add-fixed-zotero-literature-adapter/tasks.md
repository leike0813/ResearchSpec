## 1. Contracts And Catalog

- [x] 1.1 Introduce the strict shared `ManagedInstallation` and manifest schema version `1` DTO, parser, renderer, keys, deduplication, and reconciliation, then update all existing consumers and fixtures without a legacy reader.
- [x] 1.2 Add the literature-adapter types, fixed `zotero-library` catalog entry, exact upstream identity, independent component-version validation, capabilities, and seven-platform runtime mapping.

## 2. Upstream Admission And Conversion

- [x] 2.1 Add the pinned Zotero bundle maintenance input and immutable audit covering the tag tree, source license, included/excluded files, component identities, content digests, build fingerprint, command checksum, and all runtime checksums.
- [x] 2.2 Implement the offline deterministic Zotero bundle converter and checker, generate the approved two-Skill adapter tree, profile, provenance, AGPL license/notice/derivation, and seven runtime assets, and prove byte-identical idempotence.

## 3. Workspace Delivery

- [x] 3.1 Extend workspace planned writes and snapshots with file-type and executable-mode contracts, atomic POSIX mode application, drift detection, and race protection.
- [x] 3.2 Implement shared project-local adapter runtime/profile delivery, Windows shim generation, per-tool two-Skill projection, no-tool deferral, unsupported-platform behavior, and resolution-last reconciliation.
- [x] 3.3 Integrate fixed adapter delivery into init/update and plugin lifecycle while retaining eight wrappers, preventing unowned overwrites, and removing update's no-tool early return.

## 4. Static Runtime Interface

- [x] 4.1 Implement the shared static literature-adapter inspector and structured installed/degraded/unsupported/missing/conflict status with `connection_state: unchecked`.
- [x] 4.2 Add `check literature-adapters`, include it in `check all`, emit stable structured diagnostics, and ensure tool checks do not duplicate adapter findings.

## 5. ARSU Integration

- [x] 5.1 Add the shared Zotero literature protocol marker and bounded read-only/fallback/authority rules to the ARSU contract preflight and validation metadata.
- [x] 5.2 Formally package the Better BibTeX-only `zotero.py` closure, regenerate all ARSU trees/reports, and verify converter output and idempotence.

## 6. Surface, Harness, And Release

- [x] 6.1 Update base Skill registries, browser harness, adapter tests, CLI fixtures, and user journeys for 31×10 Skills and 28×8 wrappers.
- [x] 6.2 Update package contents, release verifier, CI platform coverage, mixed-license disclosures, canonical usage/CLI/contract documentation, README, NOTICE, release process, and project `AGENTS.md`.

## 7. Verification

- [x] 7.1 Run targeted type checks and tests for manifest, delivery, mode, lifecycle, status/check, converter, ARSU behavior, release-set-only updates, and patch-version independence; fix all failures.
- [x] 7.2 Run full tests, lint, build, every converter check/idempotence command, package verification, and strict OpenSpec validation; record any environmental limitation.

Verification note: strict validation of this change passes. Repository-wide main-spec validation reports the two pre-existing Education Agent Skills specs (`education-agent-skills-domain-skill-audit` and `education-agent-skills-vendor-conversion`) as invalid; this change does not modify those specs.
