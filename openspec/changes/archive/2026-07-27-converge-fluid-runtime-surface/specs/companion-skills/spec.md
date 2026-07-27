## ADDED Requirements

### Requirement: Companions Dispatch Through Current Descriptors

Navigate, Propose, Decide, and Verify SHALL consume the current runtime mode,
selector, semantic input template, execution policy, availability basis, and
next selectors from CLI descriptors. They SHALL not reimplement availability,
strict-only selector assumptions, or caller-authored mechanical DTO fields.

#### Scenario: Navigate resumes an adaptive run

- **WHEN** status exposes an adaptive allowed action
- **THEN** Navigate SHALL dispatch the relevant ARSU producer, Verify, or Decide
  from that action's descriptor and ownership boundary
- **AND** it SHALL not invent a strict work stage or transition

#### Scenario: Companion executes a direct action

- **WHEN** a current descriptor declares `direct`
- **THEN** the responsible Companion SHALL submit the semantic input once and
  continue from returned next selectors
- **AND** it SHALL not require external preview replay unless the user requests
  an optional dry run

### Requirement: Companions Preserve Formal Boundaries By Policy

Companions SHALL obtain named human confirmation for `human_confirmed` actions
and an approved plan hash for `plan_bound` actions. They SHALL continue to route
formal Gate verification to Verify and semantic Decisions to Decide.

#### Scenario: Verify prepares a formal Gate

- **WHEN** Verify receives a current Gate descriptor
- **THEN** it SHALL construct only the descriptor-declared semantic verdict
  input, display evidence and consequences, and obtain the required human
  confirmation and plan binding before submission

