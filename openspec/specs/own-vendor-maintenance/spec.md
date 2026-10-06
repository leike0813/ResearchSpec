# Own Vendor Maintenance

## Purpose

Define the catalog-driven maintenance path for user-owned upstream projects absorbed as ResearchSpec
capability packages.

## Requirements

### Requirement: Owned Vendors Resolve Canonical Authoring Roots

The owned-vendor maintenance catalog SHALL resolve extraction indexes from `authoring/paper-humanizer` and `authoring/revision-master`. Current anchors SHALL be refreshed when these canonical paths change, without treating path relocation as upstream semantic drift.

#### Scenario: An owned-vendor index is relocated

- **WHEN** its reviewed extraction index moves under `authoring/`
- **THEN** authoring, maintenance, and idempotence checks resolve the new path
- **AND** the refreshed current anchor records the new canonical location

### Requirement: Catalog-driven vendor registry

ResearchSpec SHALL maintain `audits/own-vendors/catalog.json` as the single source of truth for
user-owned vendor maintenance. Each entry SHALL declare `vendor_id`, `release_label`, `anchor_id`,
`source_meta`, `upstream_root`, `extraction_index`, `author_script`, and `capability_ids`.

#### Scenario: Current catalog resolves both vendors

- **WHEN** the catalog is loaded
- **THEN** `paper-humanizer` and `revision-master` resolve to their declared anchor, extraction
  index, authoring script, and capability IDs

#### Scenario: New vendor is additive

- **WHEN** a new owned vendor is added
- **THEN** one catalog entry plus extraction and authoring artifacts make it maintainable by the
  same script and Skill

### Requirement: Anchor manifests freeze vendor-local state

`scripts/own-vendor-maintenance.mjs baseline <vendor> <anchor>` SHALL write a manifest that freezes
upstream commit and tree hash, extraction index hash and counts, registry subset and package-tree
hashes for the vendor capability IDs, per-vendor parity summary, parity slice hash, maintenance
Skill hash, catalog hash, and the hashes of records 01–05. `check` SHALL compare the current
workspace against that manifest and exit non-zero on the first mismatch.

#### Scenario: Workspace matches the anchor

- **WHEN** `check <vendor> <anchor>` runs against an unchanged baseline
- **THEN** it reports `OK <vendor>@<anchor>` and exits zero

#### Scenario: Catalog drift is detected

- **WHEN** `catalog.json` changes after baselining
- **THEN** every affected anchor reports a maintenance catalog hash mismatch

### Requirement: Semantic review gate is mandatory

The Agent-authored `05-semantic-review.md` SHALL be required before a manifest can be written. It
SHALL contain `## 结论` with `declared-fit`, `declared-fit-with-notes`, or `not-fit`, and SHALL NOT
contain `[NOT-COMPLETED]`. `records` SHALL only create a placeholder when the file is absent and
SHALL NOT overwrite an existing review.

#### Scenario: Incomplete review blocks baseline

- **WHEN** `baseline` runs and `05-semantic-review.md` is missing, contains `[NOT-COMPLETED]`, or
  lacks `## 结论`
- **THEN** the command exits non-zero without writing the manifest

### Requirement: Maintenance skill exposes the complete loop

The installed `.agents/skills/own-vendor-maintenance/SKILL.md` SHALL describe the five-stage path,
maintenance modes, semantic review gate, and an `add-vendor` procedure. Package scripts SHALL expose
`own-vendor-maintenance:artifacts`, `own-vendor-maintenance:records`,
`own-vendor-maintenance:baseline`, and `own-vendor-maintenance:check`.

#### Scenario: Maintainer reloads the process

- **WHEN** an Agent reads the Skill
- **THEN** it can regenerate artifacts, refresh records, complete semantic review, baseline, and
  check any catalog vendor without chat-history dependency

### Requirement: Owned-vendor delivery assets are frozen and reviewed

An owned vendor MAY declare project delivery assets in its maintenance catalog. When declared, baseline SHALL freeze their path and byte identities, check SHALL reject drift, and semantic review SHALL document their derivation and runtime authority independently of capability package parity.

#### Scenario: Publisher asset changes
- **WHEN** a declared delivery asset differs from the baseline
- **THEN** the vendor check fails even if all capability package hashes remain unchanged
