## ADDED Requirements

### Requirement: Existing Commands Expose Optional Procedure Inspection

The CLI SHALL expose optional standalone material context with `instructions procedure:<id> --input <file>` and explicit material checks with `check procedure:<id> --input <file>`. Payload options SHALL be rejected for unrelated selectors or check targets. All read commands SHALL retain one JSON envelope and no project mutation.

#### Scenario: Delivered outputs are checked
- **WHEN** check receives a Procedure selector and output bindings
- **THEN** it returns structured file and role observations without running scripts or completing a task

#### Scenario: Input is supplied for a graph selector
- **WHEN** optional standalone materials are supplied to graph instructions
- **THEN** the CLI reports a usage diagnostic rather than silently ignoring them or changing graph bindings

