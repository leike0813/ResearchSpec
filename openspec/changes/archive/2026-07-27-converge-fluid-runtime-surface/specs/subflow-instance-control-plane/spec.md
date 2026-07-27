## ADDED Requirements

### Requirement: Start Follows Declared Execution Policy

Subflow Start SHALL derive route, instance, parent, prerequisite, authorization,
and receipt identities from current authority. An external route Start SHALL be
`human_confirmed`; an exact delegated strict child Start SHALL be `direct` when
its parent authority and current frontier permit it.

#### Scenario: User starts an external route

- **WHEN** an available external `subflow:` action is selected
- **THEN** the CLI SHALL require the named user confirmation declared by its
  descriptor and create the start receipt and instance under current read
  preconditions

#### Scenario: Parent starts an exact child

- **WHEN** a strict parent frontier exposes one delegated child selector with
  valid parent authorization
- **THEN** the CLI SHALL permit a direct child Start without a second human
  confirmation or external plan replay
- **AND** it SHALL reject changed parent, graph, prerequisite, or decision facts

