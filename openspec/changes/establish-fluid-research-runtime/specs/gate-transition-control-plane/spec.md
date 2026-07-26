## ADDED Requirements

### Requirement: Completion Effects Are Declared And Scoped

Gate and transition policies SHALL declare whether an accepted action emits no
completion effect, `complete_subflow`, or `complete_run`. Only strict profiles
SHALL use graph advancement as runtime authority.

#### Scenario: Ordinary standalone transition completes

- **WHEN** a standalone subflow satisfies its declared final transition
- **THEN** the transition SHALL emit `complete_subflow`
- **AND** it SHALL NOT infer run completion from the absence of active
  instances

#### Scenario: Strict pipeline final transition completes

- **WHEN** all strict pipeline completion requirements and formal Gates are
  satisfied
- **THEN** its declared final transition MAY emit `complete_run`
- **AND** the effect SHALL be recorded by the same receipt-backed transaction

### Requirement: Formal Human Boundaries Survive Adaptive Planning

Adaptive action ordering SHALL NOT bypass a formal Gate, Decision, override or
branch policy.

#### Scenario: Agent recommends bypassing a failed Gate

- **WHEN** a failed Gate blocks an otherwise useful action
- **THEN** the action SHALL remain blocked until the declared override Decision
  is recorded
- **AND** changing the soft playbook SHALL NOT remove the block

