## MODIFIED Requirements

### Requirement: CLI-Owned Workflow Frontier

ResearchSpec CLI SHALL be the authoritative evaluator of hard obligations,
accepted evidence, formal Gates and Decisions, case actions and completion.
ARSU Skills SHALL perform semantic work from bounded CLI action summaries and
descriptors while selecting their own soft plan within those commitments.

#### Scenario: Adaptive work follows current commitments

- **WHEN** an ARSU producer operates an adaptive run
- **THEN** it SHALL obtain allowed and recommended actions from ResearchSpec
- **AND** it MAY reorder, parallelize, retry, replace or rework semantic tasks
  that have no declared hard dependency

#### Scenario: Strict pipeline is active

- **WHEN** `academic-pipeline` coordinates a strict profile
- **THEN** it SHALL request status and instructions from ResearchSpec
- **AND** it SHALL NOT maintain an independent graph, Gate or readiness truth

### Requirement: Uniform Runtime Protocol

ResearchSpec SHALL expose subflows, obligations, case actions, Gates and
completion through bounded status plus selector-based instructions. A caller
SHALL execute only an allowed descriptor and SHALL use directed reads for
detail rather than requiring a full status round trip after every mechanical
step.

#### Scenario: Agent executes one durable action

- **WHEN** an Agent reaches a durable commitment boundary
- **THEN** it SHALL obtain the selected action descriptor and execute the
  corresponding `start`, `submit`, `advance`, `decide` or `propose` transaction
- **AND** it SHALL use returned next selectors to continue

#### Scenario: Working material remains provisional

- **WHEN** an ARSU Skill has produced intermediate or provider-derived material
- **THEN** it SHALL retain that material as scoped working evidence
- **AND** it SHALL use a durable submit only when a declared artifact,
  evidence, patch or case-action boundary is reached

