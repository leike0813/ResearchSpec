## MODIFIED Requirements

### Requirement: Universal Workflow Profile

ResearchSpec SHALL initialize new workspaces with the adaptive universal ARSU
profile by default and SHALL allow an explicit strict profile selection.
Existing valid Schema `0.2` workspaces SHALL remain readable through the strict
compatibility projection without automatic rewrite.

#### Scenario: Initialization creates adaptive workspace

- **WHEN** a user initializes a new workspace without `--profile`
- **THEN** workflow and state SHALL use the current adaptive runtime schema with
  universal ARSU obligations and no active instances
- **AND** no empty candidate, copied template or started academic work SHALL be
  created

#### Scenario: Strict profile is selected

- **WHEN** a user initializes a new workspace with `--profile strict`
- **THEN** the workspace SHALL use the strict process profile and its declared
  graph, parallel, join, Gate and transition semantics

#### Scenario: Schema 0.2 workspace is opened

- **WHEN** ResearchSpec discovers an existing valid Schema `0.2` workspace
- **THEN** it SHALL evaluate that workspace through the strict compatibility
  projection
- **AND** ordinary init, update, status and check SHALL NOT rewrite its runtime
  authority

## ADDED Requirements

### Requirement: Explicit Runtime Migration

Legacy runtime migration SHALL occur only through
`researchspec update --migrate-runtime`. Migration SHALL first return a dry-run
plan and hash, and non-interactive execution SHALL require `--yes` together
with `--expected-plan-sha256`.

#### Scenario: Ordinary update inspects a legacy workspace

- **WHEN** `researchspec update` runs without `--migrate-runtime`
- **THEN** it SHALL preserve the strict legacy runtime
- **AND** it MAY report migration availability without changing user authority

#### Scenario: Migration fails before authority commit

- **WHEN** a migration write or postcondition fails
- **THEN** the prior strict runtime SHALL remain authoritative
- **AND** ResearchSpec SHALL NOT maintain adaptive and strict authority in
  parallel

### Requirement: Authority And Agent Projections Are Separate

Core SHALL expose a bounded Agent-facing status projection instead of reusing
the complete internal workspace snapshot. Authority writes SHALL retain common
read-precondition and receipt-last guarantees.

#### Scenario: Runtime history grows

- **WHEN** instances, attempts, receipts or artifacts grow over time
- **THEN** default Agent status SHALL remain bounded
- **AND** full internal collections SHALL require directed or paginated reads

