# Revision Master Domain Skill Audit

## Purpose

TBD

## Requirements

### Requirement: Audit binds the official untagged snapshot

The audit SHALL identify `https://github.com/leike0813/agent-skills` as
upstream, bind revision `13e69610f216f816f106d1a2a1672eedfa01ac9a`, use
`snapshot-13e69610`, restrict its scope to the `skills/revision-master/`
subpath, and require a clean maintainer-only static snapshot at
`vendor/revision-master/upstream/skills/revision-master/`.

#### Scenario: Maintainer verifies source provenance

- **WHEN** the audit source is validated
- **THEN** origin, exact revision, snapshot label, subpath, byte-identical
  staged count (48 blobs, 567,926 bytes), and per-entry SHA-256 fields match
  the upstream `git ls-tree` and `git cat-file blob` records.

### Requirement: Audit inventory reproduces from staged bytes

The audit SHALL contain one stably ordered record for each of the 48 tracked
blob entries. Each record SHALL contain path, byte size, kind, disposition,
SHA-256 of working-tree bytes, and exactly one of `retain`, `adapt`,
`replace`, `exclude`, or `confirmed-failure`. The audit SHALL declare the
manifest format as `<lowercase-sha256><two ASCII spaces><POSIX path>\n` per
sorted entry and bind the manifest with
`tracked_entry_set_sha256 = 9d134f411e440250d3bcda12a082bfeb8df74467556dabb7eb7668793fa7005a`.

#### Scenario: Set hash reproduces offline

- **WHEN** the 48 staged blobs are sorted by POSIX path, each line
  `<sha256>  <path>\n` is concatenated, and SHA-256 is taken of the
  resulting bytes
- **THEN** the resulting hex string equals
  `9d134f411e440250d3bcda12a082bfeb8df74467556dabb7eb7668793fa7005a`.

### Requirement: Audit records eight adaptations

The audit SHALL declare the eight adaptations applied to produce
`skills/review-response/` from upstream `skills/revision-master/`. Each
adaptation SHALL declare its kind (`renamed` | `added` | `softened`),
summary, applied-to paths, evidence, and `approved = true`. No adaptation
SHALL add a new public CLI command, change ResearchSpec lifecycle authority,
import upstream Python, install upstream dependencies, or contact a service.
The adaptations SHALL include `paper-humanizer-reference-mode`, which makes
writing work load the self-contained `paper-humanizer/SKILL.md` Reference mode
entrypoint instead of the retired `prose-guidance.md` file.

#### Scenario: Adaptations are auditable

- **WHEN** the `adaptations` array is parsed
- **THEN** it contains exactly the eight planned adaptations with non-empty
  `summary`, `applied_to`, `evidence`, and `approved = true`.

### Requirement: Audit classifies zero external resources and zero credentials

The audit SHALL record zero external resources, zero credentials, zero
network imports, zero subprocess imports, zero browser imports, zero
telemetry, and zero sensitive payloads. All scripts under
`scripts/*.py` SHALL be reviewed and confirmed to use only Python standard
library imports plus the declared `pyyaml` and `jinja2` third-party
dependencies.

#### Scenario: Security findings validate

- **WHEN** the `security_findings` array is parsed
- **THEN** it contains six `clear` entries (`no-credentials`,
  `no-network`, `no-subprocess`, `no-browser`, `no-telemetry`,
  `no-pii-or-sensitive-payload`) and no `confirmed-failure` entries.

### Requirement: Audit freezes the future change id

The audit SHALL set `policies.future_change = "ingest-revision-master"`,
`policies.audit_is_admission = false`, and `policies.production_requires_audit_validation = true`.
This audit SHALL NOT create a converter workflow, a published Skill tree
change, a registry or domain entry, a package script that executes
upstream code, or a runtime integration.

#### Scenario: Audit is not production admission

- **WHEN** the audit `policies` object is validated
- **THEN** `audit_is_admission` is `false`, `future_change` is
  `"ingest-revision-master"`, and no production Skill or plugin registry
  entry is created by this audit.

### Requirement: Skill metadata binds the published Skill to the snapshot

The published `skills/review-response/metadata.json` SHALL declare
`schema_version`, `skill_id`, `source_skill_id`, `source_commit`,
`source_snapshot`, `source_repository`, `source_subpath`, `license`,
`license_note`, `runtime`, `runtime_policy`, `capabilities`, and `excluded`.
`source_commit` SHALL equal `13e69610f216f816f106d1a2a1672eedfa01ac9a` and
`source_snapshot` SHALL equal `snapshot-13e69610`.

#### Scenario: Skill metadata round-trip

- **WHEN** `skills/review-response/metadata.json` is parsed
- **THEN** the parsed `source_commit`, `source_snapshot`,
  `source_repository`, `source_subpath`, and `license` match the audit
  JSON `source` and `license_claims` records.

### Requirement: Maintainer converter detects source-to-Skill drift

`src/vendor-converters/revision-master/cli.ts` SHALL expose
`convert [--force] [--dry-run]` / `check` / `idempotence` commands that
compare the staged upstream bytes against the published `skills/review-response/`
tree and SHALL emit a structured JSON result containing `ok`, `command`,
`source_commit`, `source_repository`, `source_subpath`, `source_snapshot`,
`generated_files`, `source_tree_sha256`, `generated_tree_sha256`,
`errors`, `drift_paths`, `missing_source_paths`,
`missing_published_paths`, and `unexpected_published_paths`.

The converter SHALL byte-compare the 25 byte-identical files, verify
existence of the 22 adapted files and the one renamed schema, verify the
`LICENSE` and `metadata.json` exist, forbid `scripts/__pycache__/` and any
`agents/` directory under `skills/review-response/`, and refuse to run if
any unexpected file appears.

#### Scenario: Converter exits 0 against the current Skill tree

- **WHEN** `revision-master:check` is run against a clean tree
- **THEN** the process exits 0, `ok` is `true`, `errors` is `[]`,
  `drift_paths` is `[]`, `missing_source_paths` is `[]`,
  `missing_published_paths` is `[]`, and `unexpected_published_paths` is
  `[]`.

#### Scenario: Converter reports drift when an upstream byte changes

- **WHEN** any of the 25 byte-identical files in
  `vendor/revision-master/upstream/skills/revision-master/` is changed
- **THEN** the next `revision-master:check` exits non-zero, `ok` is `false`,
  and the changed file appears in `drift_paths`.

### Requirement: Audit and tests remain inert

Audit generation, maintainer converter execution, and the focused audit
test SHALL NOT import or execute any upstream revision-master Python, SHALL
NOT install any upstream dependency, SHALL NOT connect to a network
service, SHALL NOT read credentials, and SHALL NOT execute any byte-coded
cache file. The audit test SHALL remove any `scripts/__pycache__/`
generated by other test suites before running `revision-master:check`.

#### Scenario: Maintainer runs repository verification

- **WHEN** focused and full test suites execute
- **THEN** only static files, JSON, Git metadata, schemas, and existing
  ResearchSpec catalogs are inspected; no upstream Python is executed; no
  credential is read; no service is contacted.

### Requirement: Same-author license interpretation is recorded

The audit, `skills/review-response/metadata.json`, and root `NOTICE` SHALL
record that the upstream `leike0813/agent-skills` repository root has no
`LICENSE` file and the `skills/revision-master/` subtree has no per-skill
`LICENSE` or copyright notice; the only attribution is the git commit
author `Joshua Reed (leike0813)`, the same principal as ResearchSpec
contributors. The published Skill `LICENSE` therefore declares
`Copyright (c) 2026 ResearchSpec contributors` to keep redistribution
authority explicit.

#### Scenario: License provenance is verifiable

- **WHEN** the audit `license_claims`, the `metadata.json.license_note`,
  and the root `NOTICE` revision-master entry are read together
- **THEN** they consistently state the same-author identity and the
  implicit-only license status; no upstream third-party license grant is
  claimed.
