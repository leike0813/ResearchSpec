# Spec Delta

## Purpose

Provide a task-local transport for explicit browser review exports so a host Agent can read complete validated results without browser download support, while preserving frozen review and workflow authority boundaries.

## ADDED Requirements

### Requirement: Review sessions deliver results to fixed task-local files
The system SHALL serve a retained frozen review through a loopback-only session and publish explicit exports to `result.json` beside the retained workspace, with complete immutable history at `results/<submission-id>.json`. Results SHALL remain inside the project, outside `researchspec/`, and inside the owning review-response task when applicable.

#### Scenario: Browser cannot download
- **WHEN** the reviewer exports either current review protocol in a connected session
- **THEN** the complete result is saved without invoking browser download and the page shows the saved path only after acknowledgement

#### Scenario: Sources or workflow files exist nearby
- **WHEN** an export is saved
- **THEN** the receiver writes only its review result resources and never modifies source captures, manuscript, SQLite, handoff or graph files

### Requirement: Result reception validates and preserves every submission
The receiver SHALL validate each result against its separately retained snapshot before writing. It SHALL serialize publication, retain complete history before atomically publishing the current result, acknowledge only completed publication, and make identical retries idempotent. Conflicting reuse of a submission identity SHALL fail.

#### Scenario: Repeated or concurrent exports
- **WHEN** reviewers submit distinct exports concurrently or retry a completed submission
- **THEN** distinct results remain in history, a retry creates no duplicate, and an older retry does not replace a newer current result

#### Scenario: Publication fails or acknowledgement is lost
- **WHEN** a file cannot be published or the browser misses the acknowledgement
- **THEN** existing results remain readable, the page retains its draft, and the same submission can be retried without duplicate history

#### Scenario: Submitted snapshot is different
- **WHEN** a submitted result embeds altered or unrelated frozen workspace data
- **THEN** reception fails before result files are written

### Requirement: Local sessions are bounded and recoverable
Sessions SHALL reject unexpected hosts, origins, tokens, paths and oversized submissions. They SHALL expose only the prepared review and its result endpoint. Restarting a session SHALL reuse its retained origin to preserve browser-local drafts and report port conflicts instead of silently changing the origin.

#### Scenario: Unrelated page attempts a write
- **WHEN** a request lacks the session's exact origin and token or attempts to choose another output path
- **THEN** it is rejected and no project file changes

#### Scenario: Session restarts
- **WHEN** the Agent restarts the same retained snapshot
- **THEN** its original origin is reused, or a port conflict is reported without discarding drafts

### Requirement: Agents may explicitly wait for saved results
The system SHALL provide an optional timeout- and cancellation-aware wait for successful submissions in the current service lifetime. It SHALL return exact result and history paths only after publication. Waiting SHALL NOT apply feedback or invoke model, semantic or workflow operations.

#### Scenario: Export arrives before or during a wait
- **WHEN** a valid result has been committed in this session and the Agent waits after its last observed receipt
- **THEN** it receives the next committed receipt without missing an export that arrived before the wait call

#### Scenario: Wait expires or session closes
- **WHEN** the wait times out, is cancelled or its service closes
- **THEN** it terminates without changing any result, draft or workflow state
