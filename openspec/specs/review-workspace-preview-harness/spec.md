# Review Workspace Preview Harness

## Purpose

Let maintainers open and debug the interactive manuscript review page with
representative workspaces without first running an academic research workflow.

## Requirements

### Requirement: One-command local review preview
The project SHALL provide a development command that builds local previews from the current review page and opens a populated sample in the default browser. Generated preview files SHALL remain outside published runtime output, and the command SHALL print their location when browser opening is unavailable or disabled.

#### Scenario: Maintainer starts the preview
- **WHEN** a maintainer runs the review preview command
- **THEN** a populated interactive review page opens without a workflow run or network service

#### Scenario: Browser opening is disabled
- **WHEN** a maintainer runs the command in no-open mode
- **THEN** the previews are generated and their local location is printed without launching a browser

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

### Requirement: Preview remains development-only
The preview SHALL neither mutate ResearchSpec workflow state nor add a public command, dependency, or production review behavior.

#### Scenario: Production package is built
- **WHEN** the normal production build runs
- **THEN** sample workspaces and preview controls are absent from the published review page and runtime output