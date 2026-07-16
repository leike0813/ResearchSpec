## ADDED Requirements

### Requirement: Agent-Assisted Plugin Journey Acceptance
ResearchSpec SHALL maintain black-box acceptance for optional plugin discovery,
batch consent, Agent installation, immediate instruction access, advisory
dispatch, rejection, and graceful fallback.

#### Scenario: User accepts relevant augmentation
- **WHEN** a route or ready work item has a matching uninstalled Skill and the
  user confirms the previewed batch
- **THEN** independent CLI processes SHALL execute the matching plan hash and
  return hash-clean Skill instructions
- **AND** the canonical workflow selector and ARSU producer SHALL remain
  unchanged

#### Scenario: User rejects or installation fails
- **WHEN** consent is declined or installation cannot complete
- **THEN** the journey SHALL continue through the same public core runtime
  protocol
- **AND** no new top-level command, wrapper, workflow node, or authority record
  SHALL appear
