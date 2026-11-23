## ADDED Requirements

### Requirement: Patent Overseas Retrieval Uses Explicit Scope

The patent search and reader procedures SHALL support overseas bibliographic and full-text retrieval from a user-authorized source. The existing deliverables SHALL identify provenance and actual completeness.

#### Scenario: The overseas service returns a rate limit

- **WHEN** an explicitly requested overseas query is blocked or rate limited
- **THEN** the tool reports incomplete retrieval with the provider status
- **AND** the procedure ends that retrieval attempt

### Requirement: Invention Divisionals Use Original Disclosure Evidence

The patent application and review procedures SHALL distinguish pre-filing planning from drafting based on a filed parent. For a filed parent, supported technical features and their combination SHALL be traced to the initial filing.

#### Scenario: The parent filing is unavailable

- **WHEN** material from the initial parent filing is required and missing
- **THEN** the procedure delivers a scope check and missing-materials list
- **AND** the formal application stays pending
