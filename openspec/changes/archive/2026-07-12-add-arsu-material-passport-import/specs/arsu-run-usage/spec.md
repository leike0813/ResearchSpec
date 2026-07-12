## ADDED Requirements

### Requirement: External Passport Mid-Entry Journey
ResearchSpec SHALL route a user continuing from an ARS Material Passport through the current mid-entry summary, confirmation and workflow frontier.

#### Scenario: User imports a Passport
- **WHEN** Navigate identifies a local Material Passport and the user confirms the import summary
- **THEN** the Agent SHALL preview and execute the hash-bound Start transaction
- **AND** subsequent work SHALL use current status and scoped instructions

#### Scenario: Imported claims require current authority
- **WHEN** the Passport contains a branch, Gate pass or override
- **THEN** the Agent SHALL expose it as imported evidence and use the current Gate or Decision flow before advancing
