## MODIFIED Requirements

### Requirement: Fluid Runtime Release Gate

Release verification SHALL cover the seventeen-command registry, adaptive
default, strict workspace compatibility, semantic-only action v2, risk-tiered
execution, bounded status, explicit completion, Doctor recovery,
proposed/current case actions, Adapter-native journeys and capability
traceability before the runtime is declared converged.

#### Scenario: One convergence gate fails

- **WHEN** any type, lint, test, build, converter, idempotence, package, strict
  OpenSpec or acceptance gate fails
- **THEN** maintainers SHALL not declare the fluid runtime converged
- **AND** the coordinating change SHALL remain open

#### Scenario: Full convergence passes

- **WHEN** all declared validation commands pass against the same source state
- **THEN** the tasks may be marked complete
- **AND** the change becomes eligible for verification and archive

