## MODIFIED Requirements

### Requirement: Relevant instructions expose review-workspace guidance

Instructions for paper-humanizer profiles, nodes, Gates, and Decisions SHALL include an optional bounded `review_workspace` object identifying the adapter, interaction boundary, and current selector. Relevant review-response instructions SHALL identify the independent revision-master workbench contract, the owning review stage, and the Agent's preparation and result-processing responsibilities. Navigate guidance generated from its canonical renderer SHALL describe the same optional handoffs and separate formal-confirmation boundary. A concrete resource path SHALL only be advertised when it resolves within the actual available capability package; profile, run, and control guidance SHALL otherwise refer to the owning node without inventing a package path. Generating instructions SHALL neither read a task database nor prepare HTML or mutate semantic or graph state. The existing generic adapters and delivered page assets SHALL remain available for earlier workspaces on their original contracts and paths. Other selectors SHALL retain their current response shape.

#### Scenario: Relevant node instructions are requested

- **WHEN** an eligible node belongs to the paper-humanizer profile
- **THEN** its instruction packet identifies the paper-humanizer review-workspace adapter and states that formal mutation remains CLI-only

#### Scenario: Review-response instructions are requested

- **WHEN** instructions target a review-response handoff node with an available workbench package
- **THEN** they identify the independent business contract, its actual package resources, and the review stage
- **AND** they leave snapshot preparation and semantic processing to the Agent

#### Scenario: Profile or control instructions are requested

- **WHEN** instructions target a review-response profile, run, Gate, or Decision without a concrete handoff package context
- **THEN** they provide bounded context and direct the Agent to the owning node
- **AND** formal confirmation remains in dialogue and no fabricated resource path is returned

#### Scenario: Procedure instructions resolve installed resources

- **WHEN** the Agent requests an available review-response procedure directly
- **THEN** its packet refers to workbench resources inside that procedure's actual package root without executing them

#### Scenario: Unrelated instructions are requested

- **WHEN** instructions target another profile or procedure
- **THEN** no review-workspace field is required and no new selector family or top-level command is introduced

#### Scenario: Navigate introduces a review-response handoff

- **WHEN** generated Navigate guidance describes review-response review
- **THEN** it identifies the optional independent workbench and owning handoff nodes consistently with their instruction packets
- **AND** it retains dialogue fallback and separate human confirmation for formal controls

#### Scenario: An earlier review artifact is reopened

- **WHEN** a user resumes an already delivered generic review workspace
- **THEN** its original adapter, page, draft, and result contract remain usable without conversion to the independent revision-master protocol
