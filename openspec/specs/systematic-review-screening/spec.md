# Systematic Review Screening Specification

## Purpose

Covers protocol confirmation, independent ballots, pilot calibration, exclusion checks and traceable selection outputs for protocol-driven literature screening.

## Requirements

### Requirement: Protocol-driven screening
ResearchSpec SHALL carry the human-confirmed protocol, ordered exclusion codes and stage-specific criteria from pilot through reporting.

#### Scenario: Blind decisions and conflicts
- **WHEN** two reviewers assess a batch
- **THEN** each SHALL see the same source material and confirmed criteria independently, and the joined result SHALL retain both ballots, unresolved records and reasons for human overrides

#### Scenario: Pilot authorization
- **WHEN** the pilot misses a record the human team advanced
- **THEN** full screening SHALL require recalibration or an explicit reasoned user override

#### Scenario: Quick triage
- **WHEN** a user requests single-reviewer screening
- **THEN** results SHALL disclose single-reviewer triage

### Requirement: Traceable selection outputs
Screening SHALL preserve record and report identity, current decisions, review provenance and completeness through export.

#### Scenario: Incomplete screening
- **WHEN** a required decision or quality recheck is pending, or a downstream manifest is stale
- **THEN** counts SHALL be provisional and final methods text withheld

#### Scenario: Reconciled report
- **WHEN** the team verifies completed screening
- **THEN** PRISMA counts SHALL distinguish records, retrieved reports and included studies, with one located reason per full-text exclusion and a corpus without abstracts
