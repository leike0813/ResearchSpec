## Purpose

Define the agent-assisted optional domain plugin discovery, batch-consent installation,
advisory dispatch, and graceful fallback protocol for ResearchSpec ARSU workflows.

## Requirements

### Requirement: Agent-Discovered Optional Augmentation

ResearchSpec Agents SHALL discover reviewed plugin procedures from compact global metadata without making plugins prerequisites for core work or projecting them into the host catalog.

#### Scenario: Missing plugin could materially help
- **WHEN** the Agent identifies relevant procedures whose domains are not selected
- **THEN** it presents at most three domain suggestions with matching procedures, purpose, and direct/resolved installation counts
- **AND** the canonical work remains independently executable

#### Scenario: User declines augmentation
- **WHEN** the user declines the proposed domain batch
- **THEN** the Agent continues without installing or activating the plugin procedure

### Requirement: Nested Advisory Skill Dispatch

An eligible plugin procedure SHALL be invoked from its extension capability package as a bounded semantic helper in standalone or graph mode. The same package SHALL be the content source in both modes and SHALL receive no workflow authority.

#### Scenario: Plugin assists ready work
- **WHEN** a selected plugin procedure materially assists current work
- **THEN** its activation packet identifies necessary inputs, expected outputs, and forbidden authority writes
- **AND** its result returns to the requesting Agent or graph producer for review

#### Scenario: Plugin proposes a high-impact change
- **WHEN** plugin advice would change scope, claim strength, structure, branch, or Gate outcome
- **THEN** the existing Propose, Decide, Verify, or graph owner handles that change

### Requirement: Graceful Core Fallback

Plugin discovery, selection, activation, and invocation failures SHALL be non-blocking for native standalone work and the graph runtime.

#### Scenario: No plugin capability is usable
- **WHEN** no relevant procedure is selected or available
- **THEN** the Agent continues with a core procedure or host-native capability
- **AND** graph authority and state remain unchanged
