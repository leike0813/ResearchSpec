## ADDED Requirements

### Requirement: Substantive Revision Proactively Offers Review Choice

The coordinating Agent SHALL proactively offer browser annotation and dialogue when substantive manuscript revision needs user judgment. It SHALL prepare a browser workspace only after the user selects it, reuse an applicable task preference, and simplify minor wording edits. Browser availability SHALL remain optional; review feedback SHALL retain the existing source validation and authorization boundaries.

#### Scenario: Review preference is unspecified
- **WHEN** substantive manuscript revision needs user review and the task has no applicable review preference
- **THEN** the coordinator offers browser review and dialogue before preparing a workspace
- **AND** it waits for the user's choice without treating silence as consent

#### Scenario: Browser review is selected
- **WHEN** the user selects browser review
- **THEN** the coordinator prepares the appropriate frozen workspace and provides its session URL and result path
- **AND** it uses the existing result validation and owning task processing path

#### Scenario: Dialogue is selected
- **WHEN** the user selects dialogue or the browser cannot be used
- **THEN** the coordinator conducts the same review in conversation without making browser preparation a prerequisite

### Requirement: Ordinary Manuscript Packets Expose Existing Review Hints

Ordinary manuscript drafting and revision activation packets SHALL expose the existing annotation-intake v2 review protocol and an available packaged HTML path. Review hints SHALL advertise a review option rather than authorize preparation or manuscript mutation. Existing humanizer and review-response protocol selection SHALL remain unchanged.

#### Scenario: Ordinary manuscript procedure is activated
- **WHEN** academic-paper, manuscript drafting, revision-roadmap parsing or revision patching instructions are activated
- **THEN** the packet includes annotation-intake v2 review hints pointing to the published shared page
- **AND** no new adapter, result schema or workflow control is created

#### Scenario: No annotation candidate exists
- **WHEN** browser review is selected before Agent annotation items exist
- **THEN** the coordinator can assemble a frozen document with zero Agent items for user comments
- **AND** it does not fabricate a roadmap-to-annotation conversion
