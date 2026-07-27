## ADDED Requirements

### Requirement: Companion plan and Gate guidance
Companion Skills SHALL instruct Agents to consume policy-derived execution requirements, present the bound plan, obtain required confirmation, and preserve formal Gate authority.

#### Scenario: Plan-bound Companion action
- **WHEN** a Companion receives a plan-bound descriptor
- **THEN** it SHALL satisfy the descriptor's preview, basis, plan-hash, and confirmation requirements before execution

#### Scenario: Decision-assisted Gate evidence
- **WHEN** a waiver, not-applicable choice, or Gate override contributes to readiness
- **THEN** the Companion SHALL retain typed Decision and receipt evidence and still route the formal Gate through user-confirmed Verify
