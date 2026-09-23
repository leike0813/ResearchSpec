# Spec Delta

## ADDED Requirements

### Requirement: Review-response workboards support interactive review projection
The review-response procedure SHALL be able to project task-local atomic comments and workboard fields into the shared review-workspace contract while retaining the SQLite database as semantic truth and the graph as workflow authority.

#### Scenario: Atomic comments are reviewed
- **WHEN** the Agent projects current atomic comments and workboard state
- **THEN** each comment remains traceable to its original ID, source text, target location, priority, evidence gap, confirmation need, and next action

#### Scenario: Workspace result returns to the procedure
- **WHEN** the user exports changed dispositions or notes
- **THEN** the Agent validates and applies them through the existing package-local runtime before regenerating derived views

### Requirement: Review-response workspace never writes SQLite or manuscript files
The browser workspace SHALL NOT open or modify `revision-master.db`, rendered task-local views, source snapshots, or the working manuscript. Stage-specific package tools SHALL remain responsible for semantic writes and final manuscript revision logging.

#### Scenario: User proposes manuscript text
- **WHEN** the user records proposed text in the browser
- **THEN** it remains in the exported result until the Agent validates and commits it through the current review-response procedure

