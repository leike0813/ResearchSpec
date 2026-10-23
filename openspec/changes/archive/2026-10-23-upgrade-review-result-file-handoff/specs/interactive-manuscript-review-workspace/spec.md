# Spec Delta

## MODIFIED Requirements

### Requirement: Browser review is local and authority-neutral
The browser workspace SHALL load the retained v2 JSON from its local session, or import a user-selected file when opened offline, retain editable drafts in browser-local state scoped to the workspace and snapshot identity, and export a result only after an explicit user action. It SHALL run without a model service, database, remote asset, or external network dependency and SHALL NOT mutate the manuscript, `researchspec/`, handoff, or workflow state. Exporting SHALL leave the draft editable; each later export SHALL contain the entire current review state under a later revision.

#### Scenario: Reviewer changes a draft
- **WHEN** a reviewer edits or deletes a user comment or changes an Agent-item disposition
- **THEN** the local draft updates without altering any project file

#### Scenario: Reviewer records dispositions
- **WHEN** a reviewer changes Agent-item dispositions or notes
- **THEN** the source manuscript and all files below `researchspec/` remain unchanged

#### Scenario: Reviewer exports a handoff
- **WHEN** the reviewer explicitly exports the current review
- **THEN** the local receiver acknowledges a complete v2 result at the agreed fixed path and in immutable history; an independent explicit download remains available offline

#### Scenario: Reviewer exports twice
- **WHEN** a reviewer exports, edits the same workspace, and exports again
- **THEN** both files are independently valid complete results for the same frozen snapshot with distinct increasing export revisions

#### Scenario: Browser storage is unavailable
- **WHEN** local draft storage fails
- **THEN** the page reports that drafts will not persist and still offers explicit result export before closure


## ADDED Requirements

### Requirement: Selection tools follow the active annotation selection
The page SHALL clear a pending text anchor and hide selection annotation tools when selection is cancelled, collapsed, cleared, or dismissed with Escape. Activation of the annotation tool itself SHALL preserve the valid selection long enough to create the annotation.

#### Scenario: Reviewer cancels without annotating
- **WHEN** a reviewer selects text and clicks blank space to cancel the selection
- **THEN** selection tools disappear and no annotation is created

#### Scenario: Reviewer activates the selection tool
- **WHEN** a reviewer selects valid text and activates its annotation tool
- **THEN** the selected range remains available and the annotation is created normally
