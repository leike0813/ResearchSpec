## REMOVED Requirements

### Requirement: Catalog-Bound Subflow Instructions
**Reason**: Subflow templates are replaced by graph profile entries and node cards.
**Migration**: Request `instructions node:<run>/<node>` after a confirmed `start profile:<profile-id>`.

### Requirement: Workflow-Declared Parallel Frontier
**Reason**: Parallel dispatch and join policy move to graph `parallel_groups` in
`capability-graph-engine`.
**Migration**: Declare parallel groups with `all`/`any` join policy in graph profiles.

### Requirement: Per-Subflow Authority File
**Reason**: Runtime authority moves from per-subflow controls to per-run and per-node files.
**Migration**: Start a run and let the engine create `run.yaml` plus per-node instance files.

### Requirement: Child Relationship Has One Owner
**Reason**: Subflow parent/child relationships are replaced by graph nodes, subgraph bindings and
derived run/node relationships.
**Migration**: Derive relationships from graph declarations and owning run/node files.

### Requirement: Subflow starts require a human-confirmed route snapshot
**Reason**: Start confirmation moves to graph profile entry summaries; manuscript and Quarto snapshots
remain bound to the run when declared by the graph.
**Migration**: Bind manuscript delivery and Quarto probe requirements to the run start contract or the
relevant writing/rendering nodes.

### Requirement: Mid-entry Start binds the confirmed entry point
**Reason**: Mid-entry selection moves to graph profile entries and entry-node selection.
**Migration**: Start a mid-entry profile with the declared entry node in the run confirmation.
