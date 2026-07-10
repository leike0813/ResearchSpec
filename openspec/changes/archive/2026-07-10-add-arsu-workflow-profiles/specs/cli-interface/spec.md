## ADDED Requirements

### Requirement: New workspaces use the universal profile
`researchspec init` SHALL select `arsu-v0-1` when no profile is supplied, SHALL retain explicit legacy profile selection, and SHALL not start an academic route.

#### Scenario: Init uses no profile option
- **WHEN** a new workspace is initialized without `--profile`
- **THEN** it stores `arsu-v0-1` and leaves all external subflows unstarted

### Requirement: Existing commands expose child-aware workflow state
`status`, `instructions`, and `start` SHALL render and accept parent-scoped child subflow candidates without adding a public top-level command.

#### Scenario: Pipeline child becomes ready
- **WHEN** a parent stage makes one child node ready
- **THEN** status and instructions expose its scoped selector and start can dry-run and execute it with normal plan-hash safeguards

### Requirement: Public command surface remains fixed
The CLI SHALL continue to expose exactly the canonical fifteen top-level commands after workflow profile support is added.

#### Scenario: Help is rendered
- **WHEN** top-level help is requested
- **THEN** it lists init, update, status, instructions, start, submit, advance, check, list, show, handoff, pack, propose, decide, and archive exactly once
