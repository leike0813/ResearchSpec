## ADDED Requirements

### Requirement: Parent frontier exposes scoped child selectors
The subflow frontier SHALL expose a ready child as `subflow:<parent-instance>/<node-id>` and SHALL resolve its template, dependencies, and next round from the workflow profile.

#### Scenario: Same node exists under two parents
- **WHEN** two active parents make the same node ID ready
- **THEN** each scoped selector resolves only the child candidate of its named parent

### Requirement: Parent confirmation delegates exact child starts
A child start SHALL reuse a confirmed parent plan only when the parent receipt, graph, node, frontier, input artifacts, Decisions, and computed round match the confirmed basis.

#### Scenario: Parent graph or inputs drift
- **WHEN** a child executes against a different graph hash, prerequisite hash, Decision, or round than its dry-run plan
- **THEN** execution returns a conflict and creates no child instance

### Requirement: Child start receipts bind orchestration identity
A successful parent-scoped start receipt SHALL bind parent instance ID, parent node ID, child template ID, round number, delegated confirmation receipt, prerequisite artifact IDs, trigger Decision IDs, and plan hash.

#### Scenario: Exact child start is retried
- **WHEN** a start request repeats with the same complete receipt basis
- **THEN** it returns the existing child instance without creating a duplicate
