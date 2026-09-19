# Spec Delta

## ADDED Requirements

### Requirement: Native Procedure Roles Do Not Expand The Entry Surface

ResearchSpec SHALL define exactly two project-local, non-entry custom-agent roles for supported hosts: `researchspec-executor` and `researchspec-reviewer`. Their descriptions SHALL limit activation to an explicit Procedure packet recommendation, and their availability SHALL NOT add a user-visible Skill, command, Companion, Procedure, or product capability.

#### Scenario: Supported host receives native roles
- **WHEN** a supported custom-agent host is selected
- **THEN** it receives the Executor and Reviewer profiles in addition to its existing fixed entry surface
- **AND** the user-visible base Skill and wrapper counts remain unchanged

#### Scenario: Agent role is invoked without a recommendation
- **WHEN** a packet does not recommend the requested custom-agent role
- **THEN** that role's contract rejects the work as outside its activation boundary

