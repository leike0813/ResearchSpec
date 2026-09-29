# Spec Delta

## MODIFIED Requirements

### Requirement: Relevant instructions expose review-workspace guidance
Instructions for paper-humanizer profiles, nodes, Gates, and Decisions SHALL include an optional bounded `review_workspace` object identifying the adapter, interaction boundary, and current selector. New review-response instructions SHALL NOT offer the shared browser page; its existing data adapter and delivered page assets remain available for earlier workspaces. Other selectors SHALL retain their current response shape.

#### Scenario: Relevant node instructions are requested
- **WHEN** an eligible node belongs to the paper-humanizer profile
- **THEN** its instruction packet identifies the paper-humanizer review-workspace adapter and states that formal mutation remains CLI-only

#### Scenario: Review-response instructions are requested
- **WHEN** instructions target new review-response work
- **THEN** they do not advertise the shared browser page

#### Scenario: Unrelated instructions are requested
- **WHEN** instructions target another profile or procedure
- **THEN** no review-workspace field is required and no new selector family or top-level command is introduced

