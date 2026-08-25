## ADDED Requirements

### Requirement: Core Capability And Profile Projections Share Managed Ownership

The capability packages and graph profiles projected by framework bootstrap SHALL participate in the same desired-file plan, conflict preflight, hash ownership manifest and commit-last behavior as ARSU, Companion, Adapter and plugin delivery.

#### Scenario: Re-init encounters a modified capability Skill

- **WHEN** a previously projected core capability file differs from its recorded bytes
- **THEN** re-init and update preserve the file and report generated-file drift

#### Scenario: Core projection succeeds

- **WHEN** all desired framework and Agent files pass preflight
- **THEN** files are committed atomically and the ownership manifest is updated last

