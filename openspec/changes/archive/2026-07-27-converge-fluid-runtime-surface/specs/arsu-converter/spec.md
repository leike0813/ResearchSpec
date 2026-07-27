## ADDED Requirements

### Requirement: Generated Preflight Is Dual-Runtime And Descriptor-Driven

The converter SHALL generate one contract-preflight guidance source for all four
ARSU Skills. The generated guidance SHALL obtain runtime mode, allowed actions,
canonical selectors, semantic input templates, execution policy, and next
selectors from CLI status and instructions; it SHALL not reconstruct strict
graph order or caller-authored mechanical payload fields.

#### Scenario: Generated Skill operates in adaptive mode

- **WHEN** an adaptive workspace exposes an `obligation:`, `completion:`,
  `case-action:`, `patch:`, or `change:` descriptor
- **THEN** generated guidance SHALL route durable work through that descriptor
- **AND** it SHALL not require a `work:` or `transition:` selector that the
  adaptive frontier does not expose

#### Scenario: Generated Skill operates in strict mode

- **WHEN** a strict workspace exposes scoped `work:`, `gate:`, or `transition:`
  instructions
- **THEN** generated guidance SHALL retain the strict graph, Gate, branch, and
  delegated-child authority boundaries

### Requirement: Generated Guidance Mirrors Execution Policy

Generated ARSU guidance SHALL describe direct actions as one-invocation semantic
transactions, human-confirmed actions as requiring their named confirmation, and
plan-bound actions as requiring their current approved plan hash. It SHALL
preserve formal Gate, Decision, and high-impact patch/change protections.

#### Scenario: Converter regenerates runtime guidance

- **WHEN** converter output is regenerated and checked
- **THEN** all four generated trees, manifests, and reports SHALL derive from
  the same preflight source and pass deterministic validation and idempotence
- **AND** generated Skill files SHALL not require hand edits

