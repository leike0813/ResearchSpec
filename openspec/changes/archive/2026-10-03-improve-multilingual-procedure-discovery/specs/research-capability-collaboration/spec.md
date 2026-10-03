## MODIFIED Requirements

### Requirement: Intent Discovery Over The Existing Catalog

Navigate SHALL first pass the user's original research request, including Chinese requests, to Procedure discovery. It SHALL inspect candidate metadata and declared roles before selecting and loading instructions. It SHALL retry once with a reformulated query when no candidate is suitable; translation is optional. Only after the retry finds nothing SHALL it use host-native capabilities. A relevant unfinished confirmed run SHALL retain priority.

#### Scenario: Natural request finds a capability
- **WHEN** the user describes a research task without naming a procedure
- **THEN** Navigate first searches with the original request and inspects a few candidate cards and declared roles

#### Scenario: First search misses
- **WHEN** the original-request search yields no suitable candidate
- **THEN** Navigate retries once with a reformulated query before deciding that no procedure fits

#### Scenario: Second search misses
- **WHEN** both searches return no suitable procedure
- **THEN** Navigate continues with host-native capabilities and states that the work is outside a governed ResearchSpec run

#### Scenario: Existing unfinished run takes precedence
- **WHEN** a relevant unfinished confirmed run already exists in the workspace
- **THEN** Navigate reads its current instructions instead of using a standalone chain to bypass its pending controls

#### Scenario: Completed run does not hijack a new request
- **WHEN** a relevant run is already complete and the user starts a new independent task
- **THEN** Navigate handles the new request on its own terms and does not resume or reopen the completed run
