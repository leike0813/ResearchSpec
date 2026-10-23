## ADDED Requirements

### Requirement: Manuscript Production Follows Collaborative Preparation

Before new manuscript writing or substantive revision, the coordinating Agent SHALL inspect current materials, discuss unresolved goals and arguments, investigate evidence gaps within the authorized source policy, and align the intended writing direction with the user. Discovery and provisional working outlines SHALL remain available during preparation.

#### Scenario: Topic alone is supplied
- **WHEN** a user requests a manuscript with an unresolved research question or argument
- **THEN** the Agent inspects available materials and discusses the direction before producing manuscript prose
- **AND** it does not replace discussion with an assumed thesis

#### Scenario: Evidence remains insufficient
- **WHEN** a proposed central claim lacks adequate evidence or faces conflicting findings
- **THEN** the Agent investigates the relevant gap and explains support, counterevidence and limitations
- **AND** unresolved evidence blocks only dependent assertions, with a limited alternative agreed with the user

#### Scenario: Direction was already confirmed
- **WHEN** current materials establish an unchanged, user-confirmed direction and adequate evidence
- **THEN** the Agent reuses that agreement and avoids repeating an interview or unnecessary external research

### Requirement: Manuscript Delivery Preferences Are Resolved Before Production

The Agent SHALL resolve working source format, final deliverables, venue or general requirements, and citation style from current confirmed context before substantive manuscript production. Unresolved choices SHALL be asked of the user; defaults SHALL be recommendations or explicitly delegated choices. Minor wording edits SHALL preserve established requirements with a simplified preparation path.

#### Scenario: Delivery preferences are unknown
- **WHEN** source format or a material delivery choice cannot be established from confirmed context
- **THEN** the Agent asks a focused question before dependent manuscript production
- **AND** it does not silently choose Markdown or APA

#### Scenario: Confirmed format is reused
- **WHEN** the task has confirmed QMD or LaTeX source and a citation style
- **THEN** production preserves those requirements and protected source structures
- **AND** final delivery is distinguished from working source format

#### Scenario: Small wording correction
- **WHEN** the user requests a bounded wording correction that leaves claims, structure and delivery unchanged
- **THEN** the Agent proceeds using the established requirements without a full interview

### Requirement: Coordinators Retain Preparation Across Delegation

The coordinating Agent SHALL own user discussion and preparation before worker dispatch, pass required confirmed context through existing material bindings or resolved inputs, and keep work inline when the packet cannot carry necessary context. Sustained task notes SHALL retain confirmed preferences, evidence limits and unresolved choices without becoming workflow authority.

#### Scenario: Worker lacks delivery context
- **WHEN** a worker packet cannot express necessary confirmed manuscript requirements
- **THEN** the coordinator executes the work inline or supplies the missing context through the existing packet contract
- **AND** a worker does not choose missing user preferences or conduct the interview

#### Scenario: Ordinary work resumes
- **WHEN** the user continues manuscript work recorded in a task note
- **THEN** the coordinator checks that recorded preferences and materials remain applicable and reuses them
- **AND** changed commitments follow the existing project change lifecycle
