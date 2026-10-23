# Spec Delta

## MODIFIED Requirements

### Requirement: Direct local HTML delivery and complete source access

The Agent SHALL normally deliver a loopback review session with its frozen data embedded and acknowledged file exports. The prepared local HTML artifact SHALL also remain usable offline with an explicit download fallback and without manual snapshot import. The workbench SHALL primarily show the selected item's related manuscript excerpts and list all associated locations, while providing directory access to complete frozen original review documents and relevant manuscripts in the same artifact. Markdown, QMD, single-file LaTeX, and LaTeX projects SHALL follow existing source capture, safe rendering, and readable source fallback rules. Rendering tools SHALL remain subject to the host's execution authorization.

#### Scenario: The user opens the handoff

- **WHEN** the user directly opens the prepared HTML file
- **THEN** the intended stage and frozen candidate are available without importing another file
- **AND** the Agent retains the corresponding trusted snapshot independently

#### Scenario: A location is unknown or a rendering tool is unavailable

- **WHEN** an item cannot be located reliably or its source cannot be rendered through an available tool
- **THEN** the source remains readable, its limitation is visible, and no invented location is presented


### Requirement: Complete exports and isolated recoverable drafts

Connected exports SHALL be acknowledged at an agreed task-local file and retained independently in history; offline downloads SHALL remain explicit. Every export SHALL contain the original frozen workspace, its task and graph context, snapshot and draft identities, a unique result identity, local export revision and time, and all current feedback categories. Feedback entries SHALL have stable identities within the draft. Browser drafts SHALL be isolated by workspace and snapshot. Export revision and time SHALL NOT establish ordering across browsers. Unavailable or failed local storage SHALL be surfaced while allowing review and export of the current in-memory draft. Embedded data and user text SHALL remain inert content rather than executable markup.

#### Scenario: Two browsers export the same snapshot

- **WHEN** their local revisions or feedback disagree
- **THEN** neither revision number nor timestamp alone chooses an authoritative result

#### Scenario: Draft persistence fails

- **WHEN** the browser cannot save a draft locally
- **THEN** the user can export the current feedback and is informed that local recovery is unavailable


## ADDED Requirements

### Requirement: Selection tools follow the active annotation selection
The page SHALL clear a pending text anchor and hide selection annotation tools when selection is cancelled, collapsed, cleared, or dismissed with Escape. Activation of the annotation tool itself SHALL preserve the valid selection long enough to create the annotation.

#### Scenario: Reviewer cancels without annotating
- **WHEN** a reviewer selects text and clicks blank space to cancel the selection
- **THEN** selection tools disappear and no annotation is created

#### Scenario: Reviewer activates the selection tool
- **WHEN** a reviewer selects valid text and activates its annotation tool
- **THEN** the selected range remains available and the annotation is created normally
