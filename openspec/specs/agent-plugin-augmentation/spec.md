## Purpose

Define the agent-assisted optional domain plugin discovery, batch-consent installation,
advisory dispatch, and graceful fallback protocol for ResearchSpec ARSU workflows.

## Requirements

### Requirement: Agent-Discovered Optional Augmentation
ResearchSpec Agents SHALL evaluate reviewed domain plugin assistance from
packaged compact metadata at new or materially changed route, ready-work, or
explicit specialist-request boundaries without making plugins prerequisites for
core ARSU work.

#### Scenario: Missing plugin could materially help
- **WHEN** the Agent identifies one or more specific reviewed Skills that fit the
  current research need but their domains are not installed
- **THEN** it SHALL present at most three domain suggestions with the matching
  Skills, purpose, and direct/resolved installation counts
- **AND** the canonical ARSU route SHALL remain independently executable

#### Scenario: User declines augmentation
- **WHEN** the user declines the proposed installation batch
- **THEN** the Agent SHALL continue the core ARSU route
- **AND** it SHALL suppress the same suggestion for the current conversation
  without writing a Decision or workflow-state record

### Requirement: Batch-Confirmed Agent Installation
An Agent SHALL install a proposed domain batch only after showing the exact
domain IDs and dry-run impact and receiving explicit human confirmation.

#### Scenario: User confirms a batch
- **WHEN** the user confirms the displayed domain batch and installation impact
- **THEN** the Agent SHALL execute the same exact domain selection non-interactively with `--yes`
- **AND** it SHALL reload plugin status before using the Skills

#### Scenario: Installation fails
- **WHEN** the requested domain selection changes, projection is blocked, or execution fails
- **THEN** no stale confirmation SHALL authorize a different installation batch
- **AND** the Agent SHALL continue core work without the augmentation

### Requirement: Nested Advisory Skill Dispatch
An installed plugin Skill SHALL be invoked only as a bounded semantic helper of
the current ARSU producer.

#### Scenario: Plugin assists ready work
- **WHEN** an installed Skill materially assists a ready ARSU work item
- **THEN** the ARSU producer SHALL provide a helper brief containing the task,
  necessary inputs, expected response, and forbidden authority writes
- **AND** the plugin result SHALL return to the ARSU producer for review and
  integration rather than becoming a workflow candidate by itself

#### Scenario: Plugin proposes a high-impact change
- **WHEN** plugin advice would change research scope, claim strength,
  manuscript structure, workflow branch, or Gate outcome
- **THEN** the existing Propose, Decide, or Verify owner SHALL handle that change
- **AND** plugin invocation SHALL grant no additional authority

### Requirement: Graceful Core Fallback
Plugin discovery, installation, activation, and invocation failures SHALL be
non-blocking for the fixed ResearchSpec runtime.

#### Scenario: No plugin capability is usable
- **WHEN** no relevant Skill is installed, projection is unavailable, or helper
  execution cannot proceed safely
- **THEN** the current ARSU producer SHALL continue using its base capability
- **AND** status, frontier, producer identity, and workflow authority SHALL
  remain unchanged
