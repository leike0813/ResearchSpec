## Purpose

Define editor-neutral working contracts for free-form manuscript review intake
before human-confirmed Annotation Set registration.

## Requirements

### Requirement: Free-Form Review Copy Intake
ResearchSpec SHALL generate a review copy from an exact registered Markdown
draft with `section`, `block`, or `none` annotation-slot density, and SHALL
treat every inserted slot as optional guidance rather than required annotation
syntax.

#### Scenario: Suggested slots are ignored
- **WHEN** a user deletes, leaves empty, or writes outside all generated slots
- **THEN** the complete review copy SHALL remain valid intake material
- **AND** no deterministic component SHALL reject it for lacking a recognized annotation format

#### Scenario: Review copy remains reversible
- **WHEN** the adapter removes its own untouched slot envelopes from a generated review copy
- **THEN** the remaining registered manuscript bytes and stable block markers SHALL match the base draft

### Requirement: Mutable Intake Sessions Preserve Working Context
Free-form intake SHALL preserve raw source material, stable annotation IDs, normalized
interpretations and patch mappings inside the owning revision subflow's `work/annotation-intake/`
directory without registry, receipt or frozen-set authority.

#### Scenario: Intake is resumed
- **WHEN** the Agent reopens an existing intake session
- **THEN** it reads the session's explicit private files and preserves raw observations separately
  from interpretation

### Requirement: Review Delta Is Mechanical Evidence
ResearchSpec SHALL derive a stable block-aware Review Delta from the exact base
and review copy without classifying differences as annotations, accepted edits,
or semantic changes.

#### Scenario: Arbitrary review style is compared
- **WHEN** a review copy contains prose comments, lists, tables, CriticMarkup, custom markers, direct rewrites, or any mixture of them
- **THEN** the delta SHALL preserve added, removed, and replaced source spans with block or section context
- **AND** semantic interpretation SHALL remain an Agent responsibility

#### Scenario: Structure cannot be aligned
- **WHEN** review-copy changes cannot be mapped to the registered block structure
- **THEN** the delta SHALL retain the unmatched change and emit a structured ambiguity diagnostic
- **AND** it SHALL NOT silently re-anchor the change

### Requirement: Agent Interpretation Is Validated Before Materialization
ResearchSpec SHALL accept a structured Agent interpretation draft over the
complete base, review copy, Review Delta, raw sources, and conversation
snapshots, and SHALL materialize an Annotation Set candidate only from ready,
traceable entries.

#### Scenario: Free-form feedback becomes a candidate
- **WHEN** the Agent cites real raw or delta evidence, selects a valid typed target, supplies interpretation, expected action, semantic impact, and any required clarification
- **THEN** the adapter SHALL produce a deterministic candidate for the fixed `annotation:<id>` candidate path

#### Scenario: Interpretation is incomplete or fabricated
- **WHEN** an active entry is ambiguous, awaits confirmation, cites absent bytes, references a dangling delta entry, or selects a stale target
- **THEN** candidate materialization SHALL fail closed with structured diagnostics

### Requirement: Public Headless Adapter API
The headless intake adapter SHALL accept explicit source and destination paths and SHALL return
structured diagnostics without loading workspace snapshot, registry or control state.

#### Scenario: Adapter input is invalid
- **WHEN** source material or annotation mapping fails validation
- **THEN** the adapter returns a structured error and does not write a completed annotation set
