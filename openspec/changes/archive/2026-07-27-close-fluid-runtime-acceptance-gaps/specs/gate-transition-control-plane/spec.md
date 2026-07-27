## ADDED Requirements

### Requirement: Gate And Transition Execution Policies Are Distinct

Formal Gate submission SHALL remain plan-bound, while a uniquely eligible
non-semantic transition SHALL execute directly from current authority.

#### Scenario: Gate is submitted

- **WHEN** a caller submits a formal Gate verdict
- **THEN** the exact previewed plan, named human confirmation and current basis
  SHALL remain mandatory

#### Scenario: Unique transition is advanced

- **WHEN** exactly one eligible transition requires no branch, override or other
  semantic Decision
- **THEN** the CLI SHALL create and commit its receipt-backed plan in one
  invocation

#### Scenario: Transition becomes ambiguous

- **WHEN** current authority exposes more than one transition
- **THEN** direct Advance SHALL stop and require a workflow-branch Decision

