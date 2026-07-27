## ADDED Requirements

### Requirement: Navigate Distinguishes Research And Zotero Tasks

Navigate SHALL classify a request as ResearchSpec/ARSU research or a
Zotero-bound library task before route confirmation. A broad Zotero request
SHALL route to `zotero-library-agent`; an already explicit Zotero task MAY route
directly to the matching task Skill.

#### Scenario: Broad research request needs literature

- **WHEN** the user asks for research whose literature work is one part of an
  ARSU producer route
- **THEN** Navigate SHALL retain the ARSU route
- **AND** it SHALL describe Zotero as a nested provider rather than a separate
  ResearchSpec subflow

#### Scenario: User asks to inspect a Zotero collection

- **WHEN** the user's primary intent is a bounded current-library query
- **THEN** Navigate SHALL route to the Zotero query task through the Adapter
  surface
- **AND** it SHALL NOT start a ResearchSpec workflow merely to access the
  library

### Requirement: Navigate Presents Contextual Source Policy

Each literature-bearing route SHALL present a compact source-policy card before
route confirmation. Full Adapter setup or consent SHALL be requested only when
first needed, readiness changed, private scope is requested, or library-bound
or managed-library behavior applies.

#### Scenario: User previously skipped Adapter setup

- **WHEN** ordinary literature research starts and live readiness is unchecked
- **THEN** Navigate SHALL offer contextual setup, a one-run skip and the
  workspace prompt preference
- **AND** skipping SHALL not block ordinary external research

#### Scenario: Managed-library mode is proposed

- **WHEN** the route would import accepted literature into a collection
- **THEN** Navigate SHALL request separate run- and collection-bound consent
- **AND** plugin or route confirmation SHALL NOT imply that consent

### Requirement: Companions Consume Runtime Descriptors

Navigate, Propose, Decide and Verify SHALL consume CLI status summaries, action
descriptors and case actions without reimplementing availability, state
transitions or payload schemas.

#### Scenario: Companion executes a decision

- **WHEN** Decide handles a pending Gate, patch or contract-change action
- **THEN** it SHALL obtain the current descriptor and submit only the required
  human semantic choice
- **AND** the CLI SHALL derive and validate mechanical fields

