## ADDED Requirements

### Requirement: Transitional Subflow-Aware Next Workflow
Until Navigate replaces it, `researchspec-next` SHALL explain the generalized control-plane frontier without executing lifecycle writes.

#### Scenario: Unstarted workflow recommends route confirmation
- **WHEN** status exposes startable subflow templates and no active work
- **THEN** Next SHALL obtain subflow instructions and present the route summary for confirmation
- **AND** it SHALL not execute Start

#### Scenario: Active workflow uses scoped frontier
- **WHEN** status exposes instance-scoped dispatchable work
- **THEN** Next SHALL use those selectors and parallel-group metadata rather than reconstructing stage order

### Requirement: Transitional Submit Workflow Boundary
`researchspec-submit` SHALL remain available for manual and legacy work while automatic instance work is handled by generated ARSU preflight.

#### Scenario: Automatic candidate avoids duplicate confirmation workflow
- **WHEN** a candidate belongs to trusted automatic instance work
- **THEN** Next and Submit guidance SHALL not require a second human artifact confirmation
- **AND** they SHALL preserve the existing Companion count until surface consolidation
