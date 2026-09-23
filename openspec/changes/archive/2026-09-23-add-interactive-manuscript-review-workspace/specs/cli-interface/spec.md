# Spec Delta

## ADDED Requirements

### Requirement: Relevant instructions expose review-workspace guidance
Instructions for paper-humanizer and review-response profiles, nodes, Gates, and Decisions SHALL include an optional bounded `review_workspace` object identifying the adapter, interaction boundary, and current selector. Other selectors SHALL retain their current response shape.

#### Scenario: Relevant node instructions are requested
- **WHEN** an eligible node belongs to the paper-humanizer or review-response profile
- **THEN** its instruction packet identifies the applicable review-workspace adapter and states that formal mutation remains CLI-only

#### Scenario: Unrelated instructions are requested
- **WHEN** instructions target another profile or procedure
- **THEN** no review-workspace field is required and no new selector family or top-level command is introduced

