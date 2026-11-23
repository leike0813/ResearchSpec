# Procedure Routing

## ADDED Requirements

### Requirement: Optional Package Fault Isolation
Runtime discovery and core graph operations SHALL remain usable when an individual optional extension package is invalid. Invalid packages and their dependent profiles SHALL be unavailable for activation. Explicit plugin and release validation SHALL continue to report package failures.

#### Scenario: An optional package is damaged
- **WHEN** an optional extension has a missing or invalid package file
- **THEN** core and unaffected Procedure discovery and core graph instructions and advance SHALL continue to work
- **AND** plugin checks SHALL report the invalid package and activation SHALL withhold its content
