# Spec Delta

## MODIFIED Requirements

### Requirement: Representative and switchable examples
The preview SHALL provide valid v2 examples for article revision through annotation intake, paper-humanizer plan review, and verified-candidate comparison. Each of these three scenarios SHALL have a fixed pre-rendered toolchain example and a no-toolchain source fallback example; an additional Markdown workspace SHALL have no Agent items. The examples SHALL include substantial manuscript context and representative special blocks. The generated page SHALL derive from the current shipped page, add only development bootstrap controls, and use its ordinary import/export interactions. Review response SHALL be absent from new preview selection.

#### Scenario: Maintainer switches workflows
- **WHEN** the maintainer selects another sample scenario or rendering outcome
- **THEN** the corresponding populated review page appears with its frozen document and review items

#### Scenario: Maintainer reviews real input
- **WHEN** the maintainer imports a valid v2 workspace JSON into a preview
- **THEN** the existing page handles that workspace and exports a normal v2 review result

#### Scenario: Maintainer tries a blank review
- **WHEN** the maintainer opens the zero-item sample and adds a comment
- **THEN** the preview exports a valid result containing that user comment and no Agent-item decisions

#### Scenario: Host rendering tools are absent
- **WHEN** the maintainer starts the preview without Quarto or Pandoc installed
- **THEN** both pre-rendered and source-fallback examples are still generated from fixed reviewed inputs without running host tools

