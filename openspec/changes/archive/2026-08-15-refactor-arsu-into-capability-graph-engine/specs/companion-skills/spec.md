## MODIFIED Requirements

### Requirement: Companions Use Current File Contracts
Navigate, Propose, Decide and Verify SHALL use stable specs, graph profiles, run/node files, run
handoffs and project changes without reading or writing removed subflow authorities. Companions SHALL
NOT reconstruct or guess the workflow frontier from Skill prose.

#### Scenario: Navigate explains current work
- **WHEN** a user asks to resume or understand a project
- **THEN** Navigate uses status and directed selectors, identifies known facts and unknowns, and does
  not start a run without a confirmed profile entry

#### Scenario: Frontier is requested
- **WHEN** an Agent asks which action is legal next
- **THEN** the Companion returns the graph-derived `status --json` frontier and the corresponding
  selector instructions
- **AND** it does not present a prose-derived next-step plan

### Requirement: Companion Decisions Respect File Ownership
Verify SHALL propose Gate findings, Decide SHALL record only the relevant owning run/node decision,
and Propose SHALL create adaptable project change documents.

#### Scenario: Formal Gate is reviewed
- **WHEN** Verify has prepared a recommendation and the user confirms a verdict
- **THEN** Decide updates only the Gate in the owning node/run file

#### Scenario: Node completion is requested
- **WHEN** a producer has submitted outputs
- **THEN** the Companion SHALL direct `advance node:<run>/<node>` through the CLI and SHALL NOT edit
  node state directly

### Requirement: Navigate Separates Alternate-Model Consent

Navigate SHALL keep host-native alternate-model delegation separate from run-entry, plugin, Adapter,
Gate and branch confirmations. It SHALL present the proposed host model, disclosed content category,
and cost before dispatch and scope the consent to the current run/node instance.

#### Scenario: Alternate model is not confirmed or unavailable

- **WHEN** the user declines, the host cannot dispatch the model, or the result is structurally invalid
- **THEN** Navigate SHALL leave the run frontier unchanged
- **AND** the producer SHALL disclose single-model fallback rather than configure or call a model service

#### Scenario: Another instance starts

- **WHEN** a child, branch, node or run instance becomes current
- **THEN** Navigate SHALL obtain a fresh alternate-model confirmation if the producer proposes one
