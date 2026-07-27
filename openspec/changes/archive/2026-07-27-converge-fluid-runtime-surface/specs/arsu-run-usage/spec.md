## ADDED Requirements

### Requirement: Dual-Runtime Producer Protocol

ARSU producers SHALL obtain the current runtime mode, allowed actions, and
action descriptors from ResearchSpec before a durable action. In adaptive mode,
they SHALL work within hard obligations and may reorder, parallelize, retry, or
replace semantic work that has no declared hard dependency. In strict mode, they
SHALL obey the declared graph, joins, Gates, and transitions.

#### Scenario: Adaptive producer receives several allowed obligations

- **WHEN** an adaptive status result exposes independent `obligation:` actions
- **THEN** the producer MAY choose any allowed action or work on independent
  actions concurrently
- **AND** it SHALL submit durable evidence only through the selected descriptor

#### Scenario: Strict pipeline is active

- **WHEN** a strict pipeline status result exposes scoped work, Gate, or
  transition actions
- **THEN** the producer SHALL follow the declared strict frontier
- **AND** it SHALL NOT create a parallel graph or infer an unreturned action

### Requirement: Selector-Directed Durable Boundaries

The runtime protocol SHALL support the selector families exposed by the current
mode, including `subflow:`, `obligation:`, `gate:`, `completion:`,
`case-action:`, `patch:`, `change:`, `work:`, and `transition:`. A producer
SHALL execute only a current allowed descriptor and SHALL continue from returned
next selectors or a directed read.

#### Scenario: A mechanical action completes

- **WHEN** a direct durable action returns next selectors
- **THEN** the producer SHALL use those selectors for the next required detail
- **AND** it SHALL NOT require an unconditional full status refresh or external
  plan replay

