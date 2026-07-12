## ADDED Requirements

### Requirement: Current Contract Integration Metadata
The converter SHALL describe ResearchSpec contract integration and one-way ARS Material Passport evidence import without legacy or compatibility runtime paths.

#### Scenario: Generated output is inspected
- **WHEN** conversion completes
- **THEN** metadata and generated guidance SHALL use current integration/import terminology and SHALL not offer Passport export as runtime state authority

#### Scenario: Upstream history is retained
- **WHEN** vendored source or audit Before text contains historical terminology
- **THEN** conversion SHALL preserve it and SHALL exclude the audit source text from current-guidance risk checks
