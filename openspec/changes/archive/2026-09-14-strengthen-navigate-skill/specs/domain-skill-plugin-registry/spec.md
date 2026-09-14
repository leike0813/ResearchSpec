## MODIFIED Requirements

### Requirement: Reviewed Education Agent Skills Vendor SHALL Be The Sixth Vendor

Registry Schema 1 SHALL represent the approved `snapshot-32fce5c` Education Agent Skills bundle as an isolated sixth vendor with 136 globally unique vendor-prefixed Skills, immutable provenance, CC BY-SA 4.0 attribution, empty hard-dependency arrays, and advisory-only relationships.

#### Scenario: Six-vendor registry is assembled
- **WHEN** the approved Education bundle and source-neutral catalog are assembled
- **THEN** all 136 admitted Skills SHALL be reachable from reviewed education domains
- **AND** none of the 29 excluded Skills or 813 advisory relationships SHALL enter the hard dependency graph

#### Scenario: Education domain is installed
- **WHEN** a user selects one of the three reviewed education domains
- **THEN** the reviewed Education procedures become eligible through the domain registry without host Skill projection
- **AND** the one-Skill Navigate base surface, configured Navigate wrappers, and sixteen public commands remain unchanged
