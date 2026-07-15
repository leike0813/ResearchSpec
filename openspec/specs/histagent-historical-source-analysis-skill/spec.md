# histagent-historical-source-analysis-skill Specification

## Purpose

Define complete portable historical-source analysis, its conventional commands, five-layer provenance, offline core, optional tools, and explicit external data flow.

## Requirements

### Requirement: Source Analysis SHALL Be A Complete Script-Assisted Skill
`histagent-historical-source-analysis` SHALL satisfy the non-native baseline plus script-assisted and resource-backed extensions. Its complete tree SHALL contain a full `SKILL.md`, `scripts/analyze_source.py`, copied `lib/historical_support.py`, exactly two directly routed detailed references, and distribution metadata. The entrypoint SHALL provide exactly `inspect`, `convert`, `ocr`, `translate`, `transcribe`, `frames`, `vision`, `collate`, and `validate`.

#### Scenario: Agent starts analysis
- **WHEN** it loads only `SKILL.md`
- **THEN** it can select a mode, prepare ordinary CLI or domain-file input, run every command, interpret its receipt, and recover from failure
- **AND** no execution-critical rule exists only in a reference

### Requirement: Analysis Inputs And Outputs SHALL Be Purpose-Specific
Simple commands SHALL use semantic CLI options such as `--source`, `--output`, and `--adapter`. Translation, validation, and collation SHALL use named layer, variants, and emendations files. Artifact-producing commands SHALL print command-specific receipts; expected failures SHALL exit nonzero and write an error object to stderr. The Skill SHALL NOT require a generic payload, runner, input/output schema, fixed cross-Skill envelope, doctor, or result validator.

#### Scenario: Existing artifact is targeted
- **WHEN** `--overwrite` is absent and the output already exists
- **THEN** the command exits nonzero without changing the existing file

### Requirement: Core Analysis SHALL Work Offline
The copied tree SHALL inspect TXT and HTML, safely inspect ZIP and basic OOXML containers, hash inputs, collate variants, and validate layers using Python 3.11 standard library behavior. PDF SHALL declare optional `pypdf`; OCR, transcription, and frames SHALL declare user-managed `tesseract`, `whisper`, and `ffmpeg`. No command SHALL install dependencies.

#### Scenario: Optional dependency is absent
- **WHEN** its command is explicitly invoked
- **THEN** the command returns `capability_unavailable` on stderr with no installation attempt

### Requirement: Analysis SHALL Preserve Five Source Layers
Layer-producing commands SHALL preserve raw observation/OCR, normalized transcription, emendation, translation, and interpretation with parent, locator, operation, tool/provider, reason, uncertainty, review state, and content hash. Collation SHALL record variants and only explicit Agent-provided emendations.

#### Scenario: Witnesses disagree
- **WHEN** collation compares variants
- **THEN** it records each witness and comparison
- **AND** it does not silently prefer or complete a reading

### Requirement: External Analysis SHALL Be Explicit
Remote OCR, translation, and vision SHALL use an explicitly selected endpoint. Credentials SHALL be read only from a user-named environment variable. Uploading local material SHALL require `--allow-external-upload`. Imports and local validation SHALL perform no request or subprocess.

#### Scenario: Consent is absent
- **WHEN** a remote adapter would upload task material
- **THEN** it returns `consent_required` before any request
