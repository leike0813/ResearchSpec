## ADDED Requirements

### Requirement: Release Surface And Guidance Are Converged

Release verification SHALL require exactly seventeen public top-level commands,
fifteen fixed Skills for all thirty-one registered tools, and exactly eight
command wrappers for the twenty-eight command-capable tools. It SHALL verify
that packaged and projected guidance uses the current adaptive-default,
strict-compatible action-descriptor protocol.

#### Scenario: Installed release is smoke tested

- **WHEN** the release verifier initializes an isolated installed package
- **THEN** it SHALL observe four ARSU, four Companion, and seven Zotero Adapter
  Skills, seventeen CLI commands, and eight wrappers for a command-capable tool
- **AND** it SHALL reject stale release expectations for sixteen commands or two
  adapter Skills

#### Scenario: Guidance convergence gate fails

- **WHEN** generated guidance, canonical usage documentation, runtime
  documentation, or rendered diagrams contradict the current runtime protocol
- **THEN** release verification SHALL fail before declaring the adaptive default
  converged

