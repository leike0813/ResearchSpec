## MODIFIED Requirements

### Requirement: Typed Input And Output Roles

Every producer and checker capability SHALL declare unique input and output roles. Each role SHALL
name a versioned schema reference that resolves inside the package or the shared schema registry and
a required flag. An omitted required flag SHALL mean required. Input source policy SHALL be one of
`stable_spec`, `handoff`, `node_output` or `parameter`, or a non-empty unique list of those values.
Each graph binding SHALL select exactly one allowed source. Producer capabilities SHALL declare at
least one output role; observer capabilities MAY declare none.

#### Scenario: Output schema is unresolved

- **WHEN** an output role references a schema ID that is not resolvable
- **THEN** package validation fails and identifies the role and schema ID

#### Scenario: Producer has no output

- **WHEN** a manifest declares `node_kind: producer` with an empty output list
- **THEN** package validation fails

#### Scenario: Source alternatives are explicit

- **WHEN** an input permits both handoff and node_output
- **THEN** a graph may bind either declared source, but not a different source
- **AND** an empty or duplicate source list is rejected

#### Scenario: Optional input and parameter presence

- **WHEN** an optional input has no binding
- **THEN** it does not block the node
- **AND** a bound parameter with null, false or zero is present, while an omitted value is unresolved
