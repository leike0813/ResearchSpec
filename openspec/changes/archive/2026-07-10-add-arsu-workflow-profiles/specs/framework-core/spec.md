## ADDED Requirements

### Requirement: Schema 0.2 supports child subflow graphs
Schema 0.2 SHALL parse declarative child subflow nodes and child join groups with default-empty values and SHALL preserve old Schema 0.2 files without migration.

#### Scenario: Legacy template omits child fields
- **WHEN** an existing Schema 0.2 workflow has no child node or child group properties
- **THEN** it parses with empty child collections and retains its prior behavior

### Requirement: Child completion is derived from trusted state
The workflow evaluator SHALL count a child node complete only when a matching child instance has a trusted parent-scoped start receipt and terminal state satisfying the node completion rule.

#### Scenario: Unrelated child has the same template
- **WHEN** a completed child uses the expected template but belongs to another parent or node
- **THEN** it does not satisfy the current parent node or join

### Requirement: Work producers identify an exact route
New profile work items SHALL identify their producer route, and validation SHALL reject a producer Skill that disagrees with the routing catalog owner.

#### Scenario: Producer mode belongs to another Skill
- **WHEN** a work item declares a producer route whose catalog owner differs from its producer Skill
- **THEN** workflow validation fails

### Requirement: New outputs are instance scoped
The runtime SHALL resolve instance-scoped output paths below the owning subflow instance artifact root while retaining legacy workspace-scoped output paths.

#### Scenario: Two revision rounds emit the same artifact type
- **WHEN** sibling round instances resolve the same relative output name
- **THEN** they resolve to different concrete paths and artifact registry records
