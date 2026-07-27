## ADDED Requirements

### Requirement: Gate And Transition Risk Tiers Remain Explicit

Formal Gate submission, human Decisions, and accepted high-impact patch or
contract-change application SHALL remain `plan_bound`. A unique strict
non-semantic transition whose descriptor declares `direct` MAY execute without
an external plan replay; it SHALL still be planned and revalidated by the CLI
under current read preconditions.

#### Scenario: Formal Gate is submitted

- **WHEN** a Gate descriptor is selected
- **THEN** the CLI SHALL require validator input, named human confirmation, and
  the current approved plan hash
- **AND** no Start confirmation, direct policy, or `--yes` alone SHALL pass the
  Gate

#### Scenario: Unique mechanical transition is available

- **WHEN** exactly one strict transition is allowed and its descriptor declares
  `direct`
- **THEN** the CLI SHALL perform the transition in one invocation with current
  authority checks
- **AND** it SHALL return its receipt, effects, and next selectors

