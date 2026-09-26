## MODIFIED Requirements

### Requirement: Companion Guidance Exposes Only Graph Runtime Actions

Companion procedures SHALL distinguish standalone file work from graph runtime actions. Ordinary task notes are standalone file work and SHALL NOT be presented as run, node, handoff, Gate, Decision, or transition mutations. A standalone capability SHALL select procedures from a natural request and report each produced ordinary file path without claiming a graph action. Only graph activation may expose or request run, node, handoff, Gate, Decision, or transition mutations.

#### Scenario: Standalone Companion completes

- **WHEN** a hidden Companion runs in standalone mode
- **THEN** it returns ordinary output paths without claiming a graph action

#### Scenario: Governed Companion completes

- **WHEN** a Companion runs under a graph packet
- **THEN** it follows the packet's exact graph selector and authority

#### Scenario: Companion resumes active work

- **WHEN** a Companion resumes governed work
- **THEN** it reads status and exact node instructions before any state action

#### Scenario: Generated companion contains retired guidance

- **WHEN** Companion generation detects retired runtime or plugin-instruction guidance
- **THEN** generation validation fails

#### Scenario: Natural request names no procedure

- **WHEN** the user describes a research task in ordinary language without naming a procedure, capability, or command
- **THEN** Navigate discovers and chains capabilities from the request and reports each produced ordinary file path
- **AND** it does not require the user to name the procedure before work can start
