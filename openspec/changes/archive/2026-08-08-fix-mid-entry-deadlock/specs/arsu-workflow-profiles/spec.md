## ADDED Requirements

### Requirement: Mid-entry points are executable profile children
Every mid-entry profile entry SHALL declare a non-empty unique list of entry points, and every declared entry point SHALL reference a child node in the same profile. A mid-entry profile SHALL NOT use a synthetic checkpoint that cannot expose a child.

#### Scenario: Mid-entry profile is projected
- **WHEN** converter validation examines the academic-pipeline mid-entry entry
- **THEN** its declared entry points are exactly `research`, `write`, `review`, `revision`, `re-review`, `format`, and `final-integrity`
- **AND** its entry declaration contains no synthetic `entry` checkpoint

#### Scenario: Invalid entry point is declared
- **WHEN** a mid-entry declaration is empty, contains duplicates, or references a missing child
- **THEN** profile validation fails

### Requirement: Selected mid-entry exemption is one-time and bounded
A confirmed mid-entry parent SHALL expose only its selected entry child before its first successful profile transition. That child SHALL be exempt only from upstream child dependencies and branch-unlock conditions declared by the same profile; all route prerequisites, input roles, file checks, Gates, cost, manuscript snapshots, and child confirmation requirements SHALL remain in force. After the first profile transition, all ordinary dependency, Gate, branch, and dynamic-round rules SHALL apply.

#### Scenario: Selected first child is exposed
- **WHEN** a mid-entry parent is confirmed at a declared entry point and has not executed a profile transition
- **THEN** the frontier exposes that child even if its profile-internal upstream dependency or branch choice is absent
- **AND** no other child is exposed by the entry exemption

#### Scenario: Parent is paused and resumed before entry child starts
- **WHEN** a confirmed mid-entry parent is paused and resumed without a profile transition
- **THEN** the same selected entry child remains eligible for the bounded exemption

#### Scenario: Entry child has completed
- **WHEN** the parent executes its first profile transition after the selected child completes
- **THEN** subsequent frontier and advance calculations apply the complete profile rules

#### Scenario: Revision cycle is the entry point
- **WHEN** `revision` or `re-review` is the selected first child
- **THEN** the first local child uses round 1
- **AND** later revision rounds are derived by the ordinary repeatable-round rules
