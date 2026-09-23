# Interactive Manuscript Review Workspace

## Purpose

Define a portable, local-first browser workspace that lets a person inspect manuscript context, annotate proposed work, record item-level dispositions, and return a structured handoff to the owning ResearchSpec procedure.

## Requirements

### Requirement: Review workspace uses one versioned portable contract
The system SHALL define one strict, versioned review-workspace document and one strict result document. A workspace SHALL identify its source adapter, exact manuscript hash and format, review items, and workflow-authority guidance; a result SHALL preserve the workspace and manuscript identities plus item dispositions and reviewer notes.

#### Scenario: Workspace is reopened
- **WHEN** the same valid workspace document is imported again
- **THEN** the same manuscript identity, review-item identities, source evidence, and proposed actions are available

#### Scenario: Workspace input is invalid
- **WHEN** a workspace omits required identities, uses an unsupported adapter, or contains duplicate item IDs
- **THEN** validation fails before the input can be treated as review evidence

### Requirement: Browser review is local and authority-neutral
The browser workspace SHALL operate without a model service, database, network dependency, or ResearchSpec state mutation. It SHALL import user-selected local JSON, keep pending edits in browser-local state, and export a result file only after an explicit user action.

#### Scenario: Reviewer records dispositions
- **WHEN** a user changes item dispositions or notes
- **THEN** the source manuscript and all files below `researchspec/` remain unchanged

#### Scenario: Reviewer exports a handoff
- **WHEN** the user explicitly exports the current review
- **THEN** the browser downloads a result document that can be validated independently of browser state

### Requirement: Workspace renders manuscript formats safely
The workspace SHALL render Markdown and QMD without executing raw HTML, SHALL present plain text and LaTeX as inert source text, and SHALL NOT compile LaTeX or load remote content.

#### Scenario: Manuscript contains executable markup
- **WHEN** imported Markdown contains script or raw HTML markup
- **THEN** the markup is displayed as inert text and no script from the manuscript executes

#### Scenario: LaTeX manuscript is reviewed
- **WHEN** a workspace declares a single-file LaTeX manuscript or a LaTeX project entry file
- **THEN** the declared entry content is displayed as source without compiling the project

### Requirement: Review items preserve evidence and user intent separately
Each review item SHALL keep source evidence, target context, recommended action, optional proposed text, user disposition, and user note as separate fields. User changes SHALL NOT overwrite the original evidence or recommendation.

#### Scenario: User rejects a recommendation
- **WHEN** the user marks an item excluded and records a reason
- **THEN** the exported result retains both the original recommendation and the user's exclusion reason

### Requirement: Formal confirmation remains external
The workspace SHALL describe the current Gate or Decision selector when supplied, but its exported result SHALL be advisory input only. Navigate SHALL re-read current instructions, validate the result against current source hashes, obtain the required human confirmation, and invoke the existing CLI mutation.

#### Scenario: Workspace contains a Gate recommendation
- **WHEN** the user exports a Gate-oriented result
- **THEN** no Gate attempt exists until Navigate calls the existing `decide` command after current-instruction validation