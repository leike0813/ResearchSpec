## MODIFIED Requirements

### Requirement: Typed ARSU Routing Catalog
ResearchSpec SHALL define a strict converter-owned catalog for the five ARSU Skills and their supported routes.

#### Scenario: Catalog covers the locked route set
- **WHEN** the canonical catalog is validated
- **THEN** it SHALL contain deep-research, academic-paper, academic-paper-reviewer, academic-pipeline and sr-screener exactly once
- **AND** its 33 operational modes SHALL include protocol, quick, pilot, ta-screen, ft-screen, adjudicate, audit and report for sr-screener

#### Scenario: Pipeline entries remain distinct from modes
- **WHEN** either existing pipeline entry is read
- **THEN** its route kind SHALL be entry with a null mode ID
- **AND** every operational mode route SHALL have route kind `mode` and a matching non-null mode ID
