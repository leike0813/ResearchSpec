## MODIFIED Requirements

### Requirement: Atomic Receipt-Backed Start
ResearchSpec SHALL compose an optional `material_passport_import` only for external academic-pipeline mid-entry, write imported evidence and receipt before state, and bind the complete import identity into the Start plan.

#### Scenario: Dry-run and commit
- **WHEN** a valid import Start is previewed and then confirmed with its plan hash
- **THEN** dry-run SHALL write nothing and execution SHALL commit immutable evidence before current instance state

#### Scenario: Import is route constrained
- **WHEN** any other selector receives `material_passport_import`
- **THEN** Start SHALL reject the input without writes
