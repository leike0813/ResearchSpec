## ADDED Requirements

### Requirement: Audit-Governed Production Ingestion
Any production ToolUniverse vendor bundle SHALL consume the pinned audit inventory as its include, exclude, classification, finding, and upstream revision input without changing the audit's evidence role.

#### Scenario: Audit and production bundle remain traceable
- **WHEN** ToolUniverse production Skills are regenerated
- **THEN** every generated or excluded Skill SHALL trace to exactly one audit record
- **AND** changes to the pinned source or inventory SHALL block regeneration until a new reviewed audit is supplied
