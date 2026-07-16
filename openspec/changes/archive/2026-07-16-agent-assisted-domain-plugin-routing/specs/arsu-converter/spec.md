## ADDED Requirements

### Requirement: Generated ARSU Plugin Augmentation Guidance
The ARSU converter SHALL inject one shared current-state plugin augmentation
protocol into all four generated ARSU Skills.

#### Scenario: Expert route bypasses Navigate
- **WHEN** a user directly invokes a supported ARSU Skill or resumes its ready
  work
- **THEN** the generated Skill SHALL still evaluate compact plugin assistance at
  the defined semantic boundaries
- **AND** it SHALL use the same batch consent, installation, helper, and fallback
  rules as Navigate

#### Scenario: Generated guidance preserves producer authority
- **WHEN** an ARSU Skill invokes a plugin helper
- **THEN** the generated guidance SHALL retain the CLI-returned ARSU
  `producer_skill` as candidate owner
- **AND** it SHALL prohibit plugin writes to ResearchSpec state, registries,
  ledgers, Gates, Decisions, transitions, and receipts
