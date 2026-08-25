## Purpose

Define the ARSU upstream maintenance audit path: anchor-scoped audit records, deterministic record
generation, manifest verification, HTML artifact placement, and the mandatory Agent semantic review
gate.

## Requirements

### Requirement: Current ARSU Anchor Binds Canonical Inputs

The current ARSU maintenance anchor SHALL bind the `authoring/ars` extraction index and generated reports under `artifacts/generated/`. Path-only relocation SHALL refresh the current anchor through the normal records, baseline, check, diff, and semantic-review workflow.

#### Scenario: Authoring paths move without semantic changes

- **WHEN** the canonical ARS extraction tree is relocated
- **THEN** the current anchor is regenerated and reviewed against the same source snapshot
- **AND** historical immutable audit directories remain unchanged

### Requirement: Anchor-Scoped Maintenance Audit Directory

ResearchSpec SHALL keep every ARSU maintenance anchor under
`audits/arsu/<version>-<short_commit>/` with records `01-analysis.md`, `02-ingestion.md`,
`03-conversion.md`, `04-review.md`, and `05-semantic-review.md`, three HTML review artifacts under
`artifacts/`, and a `manifest.json`.

#### Scenario: Anchor is baselined

- **WHEN** `scripts/arsu-maintenance.mjs baseline <anchor>` succeeds
- **THEN** the anchor directory contains the five records, the three HTML artifacts and
  `manifest.json`

#### Scenario: HTML generators run without an explicit output

- **WHEN** a review HTML generator runs without an output argument
- **THEN** it writes under `audits/arsu/<anchor>/artifacts/` for the anchor selected by
  `ARSU_ANCHOR`, defaulting to the current first anchor

### Requirement: Machine Records And Hash Manifest Are Reproducible

`scripts/arsu-maintenance.mjs records <anchor>` SHALL generate records 01–04 from the current
upstream inventory, extraction index, capability registry, graph profiles, parity report and HTML
assessments, and SHALL preserve an existing `05-semantic-review.md` unchanged. `baseline <anchor>`
SHALL write a manifest that freezes upstream identity and tree hash, extraction index hash and
counts, conversion registry and package-tree hashes, parity thresholds, the three HTML artifact
hashes, the maintenance Skill hash, and the hashes of all five audit records. `check <anchor>`
SHALL compare the current workspace against that manifest and exit non-zero on the first mismatch.

#### Scenario: Workspace matches the audited anchor

- **WHEN** `check <anchor>` runs against an unchanged baseline
- **THEN** it reports `OK <anchor>` and exits `0`

#### Scenario: A frozen value has drifted

- **WHEN** any manifest-owned file differs from its frozen SHA-256
- **THEN** `check` exits non-zero and identifies the path with expected and actual hashes

### Requirement: Agent Semantic Review Gate Is Mandatory

The Agent-authored `05-semantic-review.md` SHALL be required before a manifest can be written. It
SHALL contain an explicit `## 结论` with one of `declared-fit`,
`declared-fit-with-notes`, or `not-fit`, and SHALL NOT contain the `[NOT-COMPLETED]` placeholder.
`records` SHALL only create a placeholder when the file is absent and SHALL NOT overwrite an
existing review.

#### Scenario: Semantic review is incomplete

- **WHEN** `baseline <anchor>` runs and `05-semantic-review.md` is missing, contains
  `[NOT-COMPLETED]`, or lacks `## 结论`
- **THEN** `baseline` exits non-zero without writing the manifest

#### Scenario: Existing review survives record refresh

- **WHEN** `records <anchor>` runs with an existing completed `05-semantic-review.md`
- **THEN** the file is preserved byte-for-byte and the record set is otherwise refreshed

### Requirement: Maintenance Skill Exposes The Full Loop

The installed `.agents/skills/arsu-maintenance/SKILL.md` SHALL describe the five-stage
`分析 -> 吸纳 -> 转换 -> 审阅 -> 审计` path, the four maintenance modes, the artifact regeneration
entry point, and the Agent semantic review gate. Package scripts SHALL expose
`arsu-maintenance:artifacts`, `arsu-maintenance:records`, `arsu-maintenance:baseline`, and
`arsu-maintenance:check`.

#### Scenario: A maintainer reloads the process from committed files

- **WHEN** an Agent reads `.agents/skills/arsu-maintenance/SKILL.md`
- **THEN** it can run artifact generation, record refresh, semantic review, baseline and check
  without depending on chat history
