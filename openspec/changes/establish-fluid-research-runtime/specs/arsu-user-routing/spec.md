## ADDED Requirements

### Requirement: Routing Distinguishes ARSU And Zotero Entry

Dialogue routing SHALL distinguish academic research owned by an ARSU producer
from bounded Zotero library tasks. Adapter use inside an ARSU route SHALL remain
a nested provider operation rather than a ResearchSpec workflow node.

#### Scenario: User asks a broad Zotero question

- **WHEN** the primary request spans multiple library operations
- **THEN** routing SHALL recommend `zotero-library-agent`
- **AND** the Adapter router SHALL choose task Skills within the confirmed
  library scope

#### Scenario: User explicitly requests a library query

- **WHEN** the request is already bounded to current Zotero items, notes,
  attachments, collections or selection
- **THEN** routing MAY enter `zotero-library-query` directly
- **AND** it SHALL NOT require an ARSU subflow confirmation

#### Scenario: Academic research needs sources

- **WHEN** a confirmed ARSU producer route includes literature work
- **THEN** the producer SHALL remain the route owner
- **AND** it MAY call the relevant Zotero task Skills through the
  provider-handoff boundary

### Requirement: Source Policy And Library Consent Are Separate

Route confirmation SHALL summarize the source policy and Adapter readiness
expectation. Managed-library authorization SHALL be a separate confirmation
bound to the current run and collection.

#### Scenario: Ordinary research skips Adapter setup

- **WHEN** the user elects to skip an unchecked Adapter for the current route
- **THEN** the route MAY continue with disclosed external or user-supplied
  sources
- **AND** the skip SHALL NOT become a formal research Decision

#### Scenario: Private collection is required

- **WHEN** the user confirms a library-bound route
- **THEN** failure to establish live readiness SHALL pause the route
- **AND** routing SHALL NOT silently change the source policy

