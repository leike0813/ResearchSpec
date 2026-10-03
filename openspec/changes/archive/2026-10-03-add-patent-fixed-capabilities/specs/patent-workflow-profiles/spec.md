# Patent Workflow Profiles

## Purpose

Make patent preparation and research composition auditable with independent profiles that reuse the established graph engine, explicit material bindings and human-owned formal controls.

## ADDED Requirements

### Requirement: Independent Patent Profiles Own Formal Control

Patent disclosure, application, docket, intelligence and office-action profiles SHALL declare their stages, material bindings, human Gates, Decisions and revision policy as graph data. Packages SHALL perform bounded semantic work and SHALL NOT start another node or independently persist formal workflow state.

#### Scenario: Disclosure feeds application
- **WHEN** a confirmed docket run completes its disclosure subgraph and human Gate
- **THEN** the application child receives the declared disclosure bundle without a second root-run authorization

### Requirement: Docket Revision Is Budgeted And Human Controlled

Docket SHALL use the existing revision template with versioned document outputs and a human continue/complete Decision. Its default displayed budget SHALL be three rounds; additional work requires explicit budget adjustment. Material gaps SHALL remain visible and SHALL NOT be filled with fabricated technical facts.

#### Scenario: Docket requests another round
- **WHEN** a review identifies unresolved issues
- **THEN** only a confirmed continue Decision exposes the next round and the Agent checks the confirmed round budget

### Requirement: Research And Patent Work Compose In Both Directions

ResearchSpec SHALL include research-to-patent and patent-informed-paper profiles. The first SHALL consume research evidence and actual technical materials through the patent workflow. The second SHALL integrate patent and academic evidence into the existing bibliography/synthesis interfaces before the writing child. Subgraph roles SHALL be explicitly mapped.

#### Scenario: Research report becomes a patent input
- **WHEN** research-to-patent starts its patent child
- **THEN** research outputs and supplied technical materials are bound under declared roles and patent-specific prior-art analysis remains required

#### Scenario: Patent intelligence supports writing
- **WHEN** patent-informed-paper reaches writing
- **THEN** the child receives the bridge's annotated bibliography and synthesis report using the existing writing contract
