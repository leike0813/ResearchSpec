## ADDED Requirements

### Requirement: Transitional Gate And Transition Guidance
The current Verify, Decide and Next Companions SHALL follow the CLI-owned Gate and transition protocol until surface consolidation replaces them.

#### Scenario: Verify preserves Gate confirmation
- **WHEN** Verify proposes a formal Gate verdict
- **THEN** it SHALL show validator, evidence, limitations and consequences before requesting confirmation
- **AND** a challenge SHALL trigger reverification rather than an override shortcut

#### Scenario: Decide binds override or branch choice
- **WHEN** Decide handles a failed Gate override or ambiguous transition
- **THEN** it SHALL review the exact trusted Gate event or decision point and record only the user-selected outcome

#### Scenario: Next advances only a unique transition
- **WHEN** status exposes one authorized transition
- **THEN** Next SHALL use its dynamic instructions and recommend the mechanical advance to the owning Agent loop
- **AND** multiple candidates SHALL route to Decide
