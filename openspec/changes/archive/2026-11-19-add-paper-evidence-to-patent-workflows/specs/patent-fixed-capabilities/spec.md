# Spec Delta

## ADDED Requirements

### Requirement: Paper-backed claims retain feature-level source support

When a paper is the principal disclosure, the case, disclosure and application files SHALL carry a record linking each substantive claim limitation to a retrievable source location. It SHALL distinguish observations, interpretations and unresolved questions. Formal claims SHALL include only supported limitations. Review SHALL report original support separately from application consistency.

#### Scenario: Experimental detail is generalized in drafting

- **WHEN** the paper reports one tested value and the proposed claim introduces a range
- **THEN** the review identifies the tested value and its location, flags the proposed range as unresolved and routes it for clarification before its inclusion in a formal claim.

#### Scenario: A revised claim uses supplementary evidence

- **WHEN** a revision adds a limitation supported by a supplied supplement
- **THEN** the revised record links the limitation to that supplement and its location and preserves the earlier delivery for review.

#### Scenario: Source is unavailable during review

- **WHEN** a reviewer can read the disclosure but cannot resolve a cited paper location
- **THEN** the review identifies the affected limitation and missing evidence, reports available consistency findings and leaves original support unverified.

#### Scenario: Existing disclosure is supplied independently

- **WHEN** an ordinary application task begins with an existing disclosure and no paper is identified as its principal source
- **THEN** the Procedure accepts the existing disclosure bundle without requiring a paper attachment.

#### Scenario: A disclosure cites a background paper

- **WHEN** the disclosure identifies its own technical solution and cites a paper only as background
- **THEN** drafting and review proceed without requesting a feature record for that paper or running a paper–patent comparison.
