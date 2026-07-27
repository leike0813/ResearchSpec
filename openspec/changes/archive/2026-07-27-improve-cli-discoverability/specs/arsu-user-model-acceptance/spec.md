## MODIFIED Requirements

### Requirement: Converged Runtime Guidance Has Black-Box Acceptance

Acceptance SHALL verify that public CLI behavior, the generated CLI handbook,
generated ARSU guidance, Companion guidance, canonical usage documentation, and
runtime documentation describe the same adaptive-default and strict-compatible
protocol without requiring literal prose snapshots. It SHALL distinguish
catalog-backed static command discovery from workspace-bound authorization
through current status and action descriptors.

#### Scenario: Adaptive and strict guidance is exercised

- **WHEN** acceptance initializes adaptive and strict workspaces and obtains
  current descriptors
- **THEN** the journeys SHALL exercise the selector and execution-policy families
  valid for each mode
- **AND** they SHALL not use a strict-only selector to progress an adaptive run

#### Scenario: Static help is discoverable without a workspace

- **WHEN** acceptance invokes top-level help and representative command and
  `plugin` subcommand help without an initialized workspace
- **THEN** the help surfaces SHALL expose catalog-derived command identities,
  usage, options, and contextual discovery guidance
- **AND** assertions SHALL verify stable structure and command semantics rather
  than complete help prose, whitespace, or field order

#### Scenario: Navigate falls back when its handbook reference is unavailable

- **WHEN** the projected Navigate CLI handbook reference is absent, unreadable,
  or rejected by generated-file integrity checks
- **THEN** Navigate SHALL use the installed CLI top-level and relevant
  command-level help as the read-only static discovery fallback
- **AND** handbook failure SHALL NOT create workflow authority, authorize an
  action, invent a command, or block an otherwise valid ARSU route

#### Scenario: Static guidance does not authorize a runtime action

- **WHEN** a user asks what to execute in a current workspace after consulting
  static help or the CLI handbook
- **THEN** Navigate SHALL obtain bounded status and the current selector's
  instructions before dispatch or execution
- **AND** current availability, semantic input, execution policy, confirmation,
  action basis, and next selectors SHALL come from the action descriptor rather
  than static guidance

#### Scenario: Documentation facts are checked structurally

- **WHEN** acceptance validates current runtime documentation and the generated
  CLI handbook
- **THEN** it SHALL verify command count, fixed Skill count, runtime mode,
  selector families, recovery, migration, Material Passport compatibility, and
  the static-help versus dynamic-authorization boundary through stable
  structured assertions
- **AND** it SHALL not assert complete natural-language paragraphs or field order
