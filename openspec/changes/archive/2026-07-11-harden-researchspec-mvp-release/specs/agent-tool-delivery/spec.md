## ADDED Requirements

### Requirement: Installed Skill License Retention
ResearchSpec SHALL deliver applicable license and attribution files with every independently copied ARSU and Companion Skill without weakening generated-file ownership or drift protection.

#### Scenario: ARSU Skill is installed
- **WHEN** a selected tool receives an ARSU Skill tree
- **THEN** the tree SHALL include the converter-owned CC BY-NC 4.0 license and upstream attribution notice
- **AND** those files SHALL be recorded and reconciled through the normal installation manifest

#### Scenario: Companion Skill is installed
- **WHEN** a selected tool receives a generated Companion Skill
- **THEN** the Companion directory SHALL include canonical MIT license text attributed to `ResearchSpec contributors`
- **AND** the license file SHALL follow the same manifest hash, drift-preservation, and safe-retirement rules as its `SKILL.md`
