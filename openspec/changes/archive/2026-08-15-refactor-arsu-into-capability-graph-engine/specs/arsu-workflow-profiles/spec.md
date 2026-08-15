## REMOVED Requirements

### Requirement: Universal ARSU profile covers every supported route
**Reason**: Route-grained workflow templates are replaced by capability-graph profiles and preset
graphs in `capability-graph-engine`.
**Migration**: Author preset graphs as graph profile schema `"2"` over registered capabilities.

### Requirement: Workflow data has a single converter-owned source
**Reason**: The new authored sources are capability packages and preset graph profiles; workspace
projections remain manifest-owned.
**Migration**: Generate capability packages and graph profile projections from the authoring converter.

### Requirement: Profile transitions remain data-driven and gate progress
**Reason**: Data-driven progression, format unlock ordering and final-integrity consumption are now
graph edges, Gate prerequisites and role bindings in `capability-graph-engine`.
**Migration**: Express the equivalent edges and Gate prerequisites in the preset paper/pipeline graphs.

### Requirement: Mid-entry points are executable profile children
**Reason**: Mid-entry semantics move to graph entries whose entry points are node IDs.
**Migration**: Declare mid-entry entry points as node IDs in graph profile schema `"2"`.

### Requirement: Selected mid-entry exemption is one-time and bounded
**Reason**: Entry exemption is now a graph engine rule applied to the frozen run until its first
eligible transition.
**Migration**: Implement one-time bounded entry exemption in the graph engine and test it with node
frontier scenarios.
