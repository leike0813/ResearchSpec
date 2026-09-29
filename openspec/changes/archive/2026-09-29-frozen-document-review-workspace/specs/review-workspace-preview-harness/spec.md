# Spec Delta

## MODIFIED Requirements

### Requirement: Representative and switchable examples
The preview SHALL provide valid v2 sample workspaces for annotation intake, paper humanization, and review response, with multiple Agent items and a way to switch among them. It SHALL also exercise a workspace with no Agent items and representative Markdown, Quarto, and LaTeX rendered blocks, including a raw-source fallback. Every sample SHALL use the production v2 contract and ordinary page import/export interactions.

#### Scenario: Maintainer switches workflows
- **WHEN** the maintainer selects another sample workflow
- **THEN** the corresponding populated review page appears with its frozen document and review items

#### Scenario: Maintainer reviews real input
- **WHEN** the maintainer imports a valid v2 workspace JSON into a preview
- **THEN** the existing page handles that workspace and exports a normal v2 review result

#### Scenario: Maintainer tries a blank review
- **WHEN** the maintainer opens the zero-item sample and adds a comment
- **THEN** the preview exports a valid result containing that user comment and no Agent-item decisions
