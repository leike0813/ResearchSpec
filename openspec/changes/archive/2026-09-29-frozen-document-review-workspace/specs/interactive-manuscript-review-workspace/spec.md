# Spec Delta

## MODIFIED Requirements

### Requirement: Review workspace uses one versioned portable contract
The system SHALL validate `review-workspace.v2` and `review-workspace-result.v2` as separate, strict documents. A v2 workspace SHALL identify its unique workspace and frozen rendered snapshot, source adapter, source format, ordered annotatable blocks, local assets, zero or more Agent review items, and workflow-authority guidance. A v2 result SHALL bind to that exact workspace and snapshot and preserve Agent-item decisions separately from user-authored comments. Each result SHALL be a complete snapshot with an export revision, not a sequence of patches. The system SHALL reject duplicate identities, invalid targets, and cross-version workspace/result pairs before using them as review evidence.

#### Scenario: Workspace is reopened
- **WHEN** the same valid v2 workspace document is imported again
- **THEN** the same frozen body, assets, Agent items, and annotation targets are available with their original identities

#### Scenario: No Agent review item exists
- **WHEN** an Agent prepares a valid v2 workspace with an empty Agent-item list
- **THEN** the reviewer can create user comments and export a valid v2 result with an empty decision list

#### Scenario: Workspace input is invalid
- **WHEN** a v2 workspace omits required identities, contains duplicate block or item IDs, or refers to a missing block or asset
- **THEN** validation fails before the input can be treated as review evidence

#### Scenario: Contract versions are mixed
- **WHEN** a v1 result is paired with a v2 workspace, or a v2 result with a different workspace or snapshot
- **THEN** the pair is rejected with guidance to use the matching version or prepare a fresh workspace

### Requirement: Browser review is local and authority-neutral
The browser workspace SHALL import a user-selected local v2 JSON file, retain editable drafts in browser-local state scoped to the workspace and snapshot identity, and export a result only after an explicit user action. It SHALL run without a model service, database, remote asset, or network dependency and SHALL NOT mutate the manuscript, `researchspec/`, handoff, or workflow state. Exporting SHALL leave the draft editable; each later export SHALL contain the entire current review state under a later revision.

#### Scenario: Reviewer changes a draft
- **WHEN** a reviewer edits or deletes a user comment or changes an Agent-item disposition
- **THEN** the local draft updates without altering any project file

#### Scenario: Reviewer records dispositions
- **WHEN** a reviewer changes Agent-item dispositions or notes
- **THEN** the source manuscript and all files below `researchspec/` remain unchanged

#### Scenario: Reviewer exports a handoff
- **WHEN** the reviewer explicitly exports the current review
- **THEN** the browser downloads a v2 result that can be validated independently of browser state

#### Scenario: Reviewer exports twice
- **WHEN** a reviewer exports, edits the same workspace, and exports again
- **THEN** both files are independently valid complete results for the same frozen snapshot with distinct increasing export revisions

#### Scenario: Browser storage is unavailable
- **WHEN** local draft storage fails
- **THEN** the page reports that drafts will not persist and still offers explicit result export before closure

### Requirement: Workspace renders manuscript formats safely
The Agent SHALL prepare the v2 static review content before browser import. The browser SHALL display selectable, annotatable text for Markdown, Quarto, and LaTeX as rendered document blocks, including formulas and local images; it SHALL display unsupported or unreliable conversion regions as inert source text rather than silently omit them. The bundled Markdown renderer SHALL support common extensions and LaTeX formulas. Quarto and LaTeX rendering SHALL use tools on the user's host. Neither the workspace nor the browser SHALL execute manuscript scripts, active HTML, remote content, or embedded links as code.

#### Scenario: Manuscript contains executable markup
- **WHEN** imported Markdown, Quarto, or LaTeX includes scripts, raw HTML, or active links
- **THEN** the browser displays only safe static content and no document code executes or remote resource loads

#### Scenario: LaTeX conversion is incomplete
- **WHEN** a custom environment, formula, or table cannot be reliably converted
- **THEN** that region remains visible as inert original LaTeX and can be annotated as its own block

#### Scenario: LaTeX manuscript is reviewed
- **WHEN** a workspace declares a single-file LaTeX manuscript or LaTeX project entry
- **THEN** the page displays its prepared selectable static document without compiling the project in the browser

#### Scenario: Quarto project can execute code
- **WHEN** a project render would run scripts, filters, or computation
- **THEN** the Agent obtains separate approval for that render and runs it in a temporary copy before preparing static review content

### Requirement: Review items preserve evidence and user intent separately
Each Agent review item SHALL retain source evidence, target context, recommended action, optional proposed text, user disposition, and user note as separate fields. A user-authored comment SHALL have its own identity, text, and immutable origin/selection context; it SHALL NOT impersonate or overwrite an Agent item. User changes SHALL NOT overwrite the original evidence or recommendation.

#### Scenario: User rejects a recommendation
- **WHEN** the reviewer excludes an Agent item and records a reason
- **THEN** the exported result retains both the original recommendation and the exclusion reason

#### Scenario: User adds an independent comment
- **WHEN** the reviewer annotates manuscript text without choosing an Agent item
- **THEN** the result includes a user comment linked to that frozen text and leaves all Agent items unchanged

### Requirement: Formal confirmation remains external
The workspace SHALL display the current Gate or Decision selector when supplied, but its result SHALL remain advisory working material. The owning Agent SHALL validate the result and retained frozen source set, compare that source set with current source before applying feedback, and return to current workflow instructions. If current source differs, the Agent SHALL show the differences and affected feedback and ask the user how to proceed before mutation. If source is unchanged but a comment has ambiguous source locations, the Agent SHALL ask before applying it. Any formal Gate or Decision SHALL require its own human confirmation and existing CLI mutation.

#### Scenario: Source has not changed
- **WHEN** the current source set matches the frozen source set and a comment has an unambiguous source location
- **THEN** the Agent processes the feedback in its owning workflow and prepares a new workspace without the processed comment

#### Scenario: Source changed after review preparation
- **WHEN** any relevant current source differs from the retained frozen source set
- **THEN** the Agent identifies the differences and affected comments and asks the user before applying feedback or preparing a replacement workspace

#### Scenario: Workspace contains a Gate recommendation
- **WHEN** the user exports a Gate-oriented result
- **THEN** no Gate attempt exists until the owning Agent re-reads current instructions and invokes the existing `decide` command after separate confirmation

## ADDED Requirements

### Requirement: Review snapshot remains frozen throughout a browser review
The Agent SHALL retain an exact frozen copy of the relevant source files when preparing a workspace. The browser SHALL bind every annotation to the rendered snapshot supplied in that workspace and SHALL NOT rerender current source, automatically relocate annotations, or offer manual reattachment within the same workspace. A new review round SHALL use a new workspace identity and separate draft state.

#### Scenario: Source changes while a workspace is open
- **WHEN** the project manuscript is edited after the workspace was prepared
- **THEN** the open page continues to show and annotate its original frozen document

#### Scenario: Next round begins
- **WHEN** the Agent processes feedback and prepares a revised review copy
- **THEN** the new workspace has a distinct identity and does not carry processed comments into its draft

### Requirement: Reviewer annotates visible document blocks
The page SHALL present a document-centered layout with a contents pane, selectable document canvas, and right-hand comment pane. A reviewer SHALL be able to select text within one annotatable block and explicitly start a comment from that selection, or annotate an entire paragraph or object. Text in a table cell, footnote, bibliography entry, code block, or raw-LaTeX fallback SHALL be selectable within that block. Formulas, image objects, and citation markers SHALL support whole-object comments; an image without caption or alt text SHALL retain its asset identity and adjacent context in the export. Cross-block or mixed-object selection SHALL be declined with guidance to comment separately.

#### Scenario: Reviewer selects a sentence
- **WHEN** a reviewer selects a text range inside one paragraph and activates “Add comment”
- **THEN** a draft comment opens for that exact visible range with its block identity, quote, and nearby context

#### Scenario: Reviewer comments on an image
- **WHEN** a reviewer comments on a captionless image as a whole object
- **THEN** the result retains the image identity, placeholder label, and adjacent text for Agent verification

#### Scenario: Selection crosses a boundary
- **WHEN** a selection spans two paragraphs, cells, or a paragraph and a citation marker
- **THEN** the page does not create a combined annotation and prompts separate comments

### Requirement: Comments remain discoverable and editable
The right pane SHALL display Agent items and user comments in document order with visible origin labels, explicit expand/collapse controls, and editing controls for user drafts. The contents pane SHALL support at least three heading levels, folding, and section filtering; document and comment navigation SHALL work in both directions. Overlapping highlights SHALL let the reviewer choose the intended comment. Filtering or folding SHALL keep comments reachable, including items without a resolved document location. Keyboard users SHALL be able to create a whole-block comment and return focus predictably after editing.

#### Scenario: Multiple comments overlap
- **WHEN** a reviewer activates text covered by more than one comment
- **THEN** the page presents the applicable comments for explicit selection

#### Scenario: Comment has no document target
- **WHEN** an Agent item only has a broad or unresolved location
- **THEN** it remains visible in the right pane and can be opened without pretending to have a precise text highlight

#### Scenario: Reviewer navigates by keyboard
- **WHEN** focus is on an annotatable block and the reviewer invokes whole-block comment creation
- **THEN** the editor receives focus and closing it returns focus to a meaningful place in the document

### Requirement: Annotation anchors are review evidence, not source offsets
Each exported user comment SHALL retain the frozen snapshot identity, block or object identity, original visible selection, and nearby context needed for the Agent to locate it in source. The result SHALL NOT claim an exact LaTeX source offset or rewrite source from rendered-document coordinates. If a comment is removed from the draft, the next complete export SHALL omit it while earlier exports remain unchanged.

#### Scenario: Rendered text maps ambiguously to source
- **WHEN** a visible quote appears at multiple source locations despite its saved context
- **THEN** the Agent asks the user which source location to change before editing

#### Scenario: Reviewer deletes a draft comment
- **WHEN** the reviewer deletes a user comment and exports again
- **THEN** the new complete result omits that comment and retains its own later revision identity

### Requirement: Legacy review artifacts stay on their original contract
The system SHALL continue to validate and process v1 workspace/result pairs under the v1 contract. The v2 page SHALL reject v1 input and explain how to reopen a v1 draft in the retained v1 page or hand a previously exported v1 result to the Agent. It SHALL NOT convert v1 drafts or results into v2.

#### Scenario: Reviewer needs an unfinished v1 draft
- **WHEN** the reviewer has a v1 workspace and browser-local draft
- **THEN** the retained v1 page can reopen the matching v1 workspace and recover that draft according to its existing identity rules

#### Scenario: Previously exported v1 result arrives
- **WHEN** the Agent receives a valid v1 result
- **THEN** the Agent handles it under the v1 contract without pairing it with a v2 workspace
