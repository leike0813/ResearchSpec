# Revision Master Domain Skill Audit

## Purpose

Define the immutable audit contract and the capability-graph authoring provenance for the Revision
Master domain skill snapshot.

## Requirements

### Requirement: Audit SHALL bind the official untagged snapshot

The audit SHALL identify `https://github.com/leike0813/agent-skills` as upstream, bind revision
`13e69610f216f816f106d1a2a1672eedfa01ac9a`, use `snapshot-13e69610`, restrict its scope to the
`skills/revision-master/` subpath, and require a clean maintainer-only static snapshot at
`vendor/revision-master/upstream/skills/revision-master/`.

#### Scenario: Maintainer verifies source provenance

- **WHEN** the audit source is validated
- **THEN** origin, exact revision, snapshot label, subpath, byte-identical staged count (48 blobs,
  567,926 bytes), and per-entry SHA-256 fields match the upstream `git ls-tree` and
  `git cat-file blob` records

### Requirement: Audit inventory SHALL reproduce from staged bytes

The audit SHALL contain one stably ordered record for each of the 48 tracked blob entries. Each
record SHALL contain path, byte size, kind, disposition, SHA-256 of working-tree bytes, and exactly
one of `retain`, `adapt`, `replace`, `exclude`, or `confirmed-failure`. The audit SHALL declare the
manifest format as `<lowercase-sha256><two ASCII spaces><POSIX path>\n` per sorted entry and bind the
manifest with
`tracked_entry_set_sha256 = 9d134f411e440250d3bcda12a082bfeb8df74467556dabb7eb7668793fa7005a`.

#### Scenario: Set hash reproduces offline

- **WHEN** the 48 staged blobs are sorted by POSIX path, each line `<sha256>  <path>\n` is
  concatenated, and SHA-256 is taken of the resulting bytes
- **THEN** the resulting hex string equals
  `9d134f411e440250d3bcda12a082bfeb8df74467556dabb7eb7668793fa7005a`

### Requirement: Audit SHALL record eight historical adaptations

The audit SHALL declare the eight adaptations that produced the former `skills/review-response/`
projection from upstream `skills/revision-master/`. Each adaptation SHALL declare its kind
(`renamed` | `added` | `softened`), summary, applied-to paths, evidence, and `approved = true`.
The adaptations SHALL include `paper-humanizer-reference-mode`, which records the self-contained
`cap-generation-humanization-reference/SKILL.md` Reference-mode entrypoint.

#### Scenario: Adaptations are auditable

- **WHEN** the `adaptations` array is parsed
- **THEN** it contains exactly the eight planned adaptations with non-empty `summary`,
  `applied_to`, `evidence`, and `approved = true`

### Requirement: Audit SHALL classify zero external resources and zero credentials

The audit SHALL record zero external resources, zero credentials, zero network imports, zero
subprocess imports, zero browser imports, zero telemetry, and zero sensitive payloads. All scripts
under `scripts/*.py` SHALL be reviewed and confirmed to use only Python standard library imports
plus the declared `pyyaml` and `jinja2` third-party dependencies.

#### Scenario: Security findings validate

- **WHEN** the `security_findings` array is parsed
- **THEN** it contains six `clear` entries (`no-credentials`, `no-network`, `no-subprocess`,
  `no-browser`, `no-telemetry`, `no-pii-or-sensitive-payload`) and no `confirmed-failure` entries

### Requirement: Audit SHALL freeze the future change id

The audit SHALL set `policies.future_change = "ingest-revision-master"`,
`policies.audit_is_admission = false`, and `policies.production_requires_audit_validation = true`.
The audit SHALL NOT by itself create a converter workflow, a published Skill tree change, a registry
or domain entry, a package script that executes upstream code, or a runtime integration.

#### Scenario: Audit is not production admission

- **WHEN** the audit `policies` object is validated
- **THEN** `audit_is_admission` is `false`, `future_change` is `"ingest-revision-master"`, and no
  production Skill or plugin registry entry is created by the audit

### Requirement: Authoring SHALL consume the verified extraction index

The revision-master authoring source set SHALL read
`docs/revision-master_extraction/extraction-index.json`, author manifest provenance as
`vendor-derived`, and copy declared knowledge, script, schema, localization, and template assets
from verified extraction artifacts. The package scripts SHALL expose `revision-master:author` and
SHALL NOT expose the retired `revision-master:{convert,check,idempotence}` scripts.

#### Scenario: Capability packages are authored

- **WHEN** `revision-master:author` runs
- **THEN** all five review-response capability packages and registry entries are written without
  executing upstream Python or installing PyYAML/Jinja2

#### Scenario: Package assets are runnable

- **WHEN** a packaged `.py` asset is parsed as Python
- **THEN** the extraction header is absent and the upstream script body is preserved

### Requirement: Audit and tests SHALL remain inert

Audit generation, extraction verification, capability authoring, and focused audit tests SHALL be
inert: they SHALL NOT import or execute any upstream revision-master Python, SHALL NOT install any
upstream dependency, SHALL NOT connect to a network service, SHALL NOT read credentials, and SHALL
NOT execute any byte-coded cache file. Tests SHALL remove any `scripts/__pycache__/` generated by
other test suites before running static checks.

#### Scenario: Maintainer runs repository verification

- **WHEN** focused and full test suites execute
- **THEN** only static files, JSON, Git metadata, schemas, and existing ResearchSpec catalogs are
  inspected; no upstream Python is executed; no credential is read; no service is contacted

### Requirement: Same-author license interpretation SHALL be recorded

The audit, extraction provenance, and root `NOTICE` SHALL record that the upstream
`leike0813/agent-skills` repository root has no `LICENSE` file and the `skills/revision-master/`
subtree has no per-skill `LICENSE` or copyright notice; the only attribution is the git commit
author `Joshua Reed (leike0813)`, the same principal as ResearchSpec contributors. Authored
capability packages therefore carry MIT with ResearchSpec contributor copyright and upstream
provenance in extraction artifacts and `NOTICE`.

#### Scenario: License provenance is verifiable

- **WHEN** the audit `license_claims`, extraction provenance, and root `NOTICE` revision-master
  entry are read together
- **THEN** they consistently state the same-author identity and implicit-only license status; no
  upstream third-party license grant is claimed
