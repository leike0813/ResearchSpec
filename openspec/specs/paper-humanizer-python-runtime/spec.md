# Paper Humanizer Python Runtime

## Purpose

Define the pinned Python analysis tool, capability-package projection, and offline authoring rules for
Paper Humanizer.

## Requirements

### Requirement: Reference mode is a self-contained capability

The published `cap-generation-humanization-reference/SKILL.md` SHALL contain the complete Reference
mode instructions needed by other capabilities that draft or revise prose. Consumers SHALL load that
entrypoint and SHALL NOT require the retired `paper-humanizer/references/prose-guidance.md` path.

#### Scenario: Consumer loads Reference mode

- **WHEN** a consuming capability creates or edits manuscript prose
- **THEN** it loads the packaged `cap-generation-humanization-reference/SKILL.md` entrypoint without
  starting a humanizer run, running diagnostics, or requesting an additional confirmation

### Requirement: Python analysis tool is packaged per capability

The revision, review, and verification capability packages SHALL contain the pinned
`scripts/document_pipeline.py` bytes and SHALL NOT contain a Paper Humanizer `.mjs` runtime or
TypeScript runtime implementation.

#### Scenario: Capability package uses Python

- **WHEN** the paper-humanizer authoring converter projects the pinned source
- **THEN** `scripts/document_pipeline.py` is present byte-for-byte in every package that invokes it
- **AND** forbidden JS/TS runtime files cause checking to fail

### Requirement: Operational capability surface is complete

The authored paper-humanizer packages SHALL include the Reference-mode taxonomy, review and full
workflow procedures, diagnostic guidance, and document YAML contract, while excluding
`agents/openai.yaml`, upstream tests, OpenSpec artifacts, and research material.

#### Scenario: Node instructions are available

- **WHEN** an Agent executes a paper-humanizer capability node
- **THEN** the corresponding procedure and referenced deterministic contracts are available inside
  the capability package

### Requirement: Graph engine keeps lifecycle authority

Task-local Python artifacts and rendered views SHALL remain ordinary boundary or working files
outside `researchspec/`, while the graph engine remains the only lifecycle and Gate, Decision, and
transition authority.

#### Scenario: Revision node writes runtime material

- **WHEN** revision executes
- **THEN** it writes only task-local working artifacts and boundary manuscripts and does not mutate
  ResearchSpec controls, profiles, handoffs, or Gates

### Requirement: Authoring is static and reproducible

Paper Humanizer authoring, extraction verification, package checking, and release verification SHALL
not execute Python or upstream code, install dependencies, contact services, or read credentials.

#### Scenario: Extraction drift is detected offline

- **WHEN** an extraction artifact differs from the pinned `vendor/paper-humanizer` bytes
- **THEN** extraction verification fails with structured drift information without executing the
  runtime
