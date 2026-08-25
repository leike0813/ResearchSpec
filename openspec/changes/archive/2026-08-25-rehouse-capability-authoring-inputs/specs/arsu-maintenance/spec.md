## MODIFIED Requirements

### Requirement: Current ARSU Anchor Binds Canonical Inputs

The current ARSU maintenance anchor SHALL bind the `authoring/ars` extraction index and generated reports under `artifacts/generated/`. Path-only relocation SHALL refresh the current anchor through the normal records, baseline, check, diff, and semantic-review workflow.

#### Scenario: Authoring paths move without semantic changes

- **WHEN** the canonical ARS extraction tree is relocated
- **THEN** the current anchor is regenerated and reviewed against the same source snapshot
- **AND** historical immutable audit directories remain unchanged
