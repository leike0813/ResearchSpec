## ADDED Requirements

### Requirement: Bounded adaptive runtime guidance
ARSU run guidance SHALL use bounded status followed by selector-specific instructions and SHALL describe the compact action result without presenting strict graph selectors as the adaptive default.

#### Scenario: Adaptive resume
- **WHEN** an Agent resumes an adaptive run
- **THEN** it SHALL obtain bounded status and instructions for the current obligation, Gate, completion, or case-action selector before acting

#### Scenario: Strict compatibility resume
- **WHEN** an Agent resumes an unmigrated Schema `0.2` run
- **THEN** it MAY use strict work, Gate, transition, and subflow selectors under the documented compatibility protocol
