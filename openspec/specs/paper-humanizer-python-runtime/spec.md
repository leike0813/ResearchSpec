# Paper Humanizer Python Runtime

## Purpose

TBD

## Requirements

### Requirement: Reference mode is self-contained

The published `paper-humanizer` `SKILL.md` SHALL contain the complete
Reference mode instructions needed by other Skills that draft or revise prose.
Consumers SHALL load `paper-humanizer/SKILL.md` and SHALL NOT require the
retired `paper-humanizer/references/prose-guidance.md` path.

#### Scenario: consumer loads Reference mode

- **WHEN** a consuming Skill creates or edits manuscript prose
- **THEN** it loads the packaged `paper-humanizer/SKILL.md` entrypoint without
  starting a humanizer subflow, running diagnostics, or requesting an
  additional confirmation

### Requirement: Reference mode is self-contained for consumers

The published `paper-humanizer/SKILL.md` SHALL be the sole packaged entrypoint
that consumers load for Reference mode. Consumers SHALL NOT require
`paper-humanizer/references/prose-guidance.md`.

#### Scenario: drafting consumer uses Reference mode

- **WHEN** a consumer creates or edits manuscript prose
- **THEN** it loads `paper-humanizer/SKILL.md` without starting a humanizer
  subflow, running diagnostics, or requesting additional confirmation

### Requirement: publish the pinned native runtime

The published `paper-humanizer` Skill SHALL contain the pinned Python
`document_pipeline.py` and `full_workflow.py` scripts and SHALL NOT contain a
Paper Humanizer `.mjs` runtime or TypeScript runtime implementation.

#### Scenario: generated tree uses Python

- **WHEN** the Paper Humanizer converter projects the pinned source
- **THEN** both Python entrypoints are present byte-for-byte and forbidden JS/TS
  runtime files cause checking to fail

### Requirement: preserve the complete operational Skill surface

The published tree SHALL include the upstream `SKILL.md`, review/full
playbooks, diagnostic guidance, and document YAML contract, while excluding
`agents/openai.yaml`, upstream tests, OpenSpec artifacts, and research material.

#### Scenario: mode instructions are available

- **WHEN** an Agent selects review or full mode
- **THEN** the corresponding playbook and referenced deterministic contracts are
  available inside the Skill package

### Requirement: keep ResearchSpec lifecycle authority

Python runtime state and rendered views SHALL remain under the subflow's
`work/paper-humanizer/` directory, while ResearchSpec `control.yaml` remains
the only lifecycle and Gate, Decision, and transition authority.

#### Scenario: full mode writes runtime material

- **WHEN** full mode initializes or advances its local workflow
- **THEN** it writes only task-local runtime artifacts and does not mutate
  ResearchSpec controls, profiles, handoffs, or Gates

### Requirement: conversion is static and reproducible

Paper Humanizer conversion, checking, idempotence, packaging, and release
verification SHALL not execute Python or upstream code, install dependencies,
contact services, or read credentials.

#### Scenario: drift is detected offline

- **WHEN** a generated Python file, source snapshot, license, metadata, or
  exclusion list differs from the approved projection
- **THEN** `paper-humanizer:check` or `paper-humanizer:idempotence` fails with
  structured drift information without executing the runtime
