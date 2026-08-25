## ADDED Requirements

### Requirement: Canonical User Model Matches The Graph Product

The canonical user model SHALL explain ResearchSpec as a file-based capability-graph control plane. It SHALL cover initialization, dialogue routing, route-bound entry summaries, root-run confirmation, inherited child-run authorization, separate Gate and Decision confirmations, capability execution, delivery snapshots, resume, static health, plugins, Adapters, and bounded export.

#### Scenario: A new user reads the mental model

- **WHEN** they need to understand how work begins and advances
- **THEN** the documentation presents one lifecycle from conversation to completion
- **AND** it identifies the file owner and CLI authority at each mutation boundary

#### Scenario: Documentation describes child work

- **WHEN** a profile node binds a child graph
- **THEN** the model states that the child inherits the confirmed frozen parent graph authorization
- **AND** it states that formal child Gates, Decisions, model review, plugin installation, and render execution retain their own consent boundaries
