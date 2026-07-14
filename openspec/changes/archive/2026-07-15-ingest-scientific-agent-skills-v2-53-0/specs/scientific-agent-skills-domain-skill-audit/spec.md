## ADDED Requirements

### Requirement: Audit Findings Resolve Through Separate Admission Policy
The immutable Scientific Agent Skills audit SHALL remain the source evidence for the pinned inventory and findings, while a separate complete production policy SHALL resolve every record without rewriting audit observations or treating upstream labels as approval.

#### Scenario: Audit blocker is resolved
- **WHEN** a later production decision admits or excludes an audited Skill
- **THEN** the decision cites the applicable audit and source evidence
- **AND** the original finding remains reproducible

#### Scenario: Hard exclusions remain excluded
- **WHEN** a Skill prohibits redistribution or owns Agent, workflow, state, or platform authority
- **THEN** its production decision is excluded and no generated vendor asset exists

### Requirement: Overlap Decisions Are Explicit
Every business candidate SHALL record an explicit ARSU and ToolUniverse overlap conclusion before production admission.

#### Scenario: Existing capability takes precedence
- **WHEN** a candidate overlaps the fixed ARSU or Companion surface, or any ToolUniverse semantic capability
- **THEN** the Scientific Agent Skills candidate is excluded with the corresponding capability evidence
