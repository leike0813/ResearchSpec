# Software Copyright Materials

## Purpose

Prepare locally verified Chinese R11 software copyright materials and support filing through a path chosen by the applicant.

## ADDED Requirements

### Requirement: Optional R11 Procedure
ResearchSpec SHALL expose one optional R11 Procedure under the Intellectual property materials tool domain. Installation SHALL require explicit domain selection and SHALL preserve manuscript routes, profiles, and writing hooks.

#### Scenario: A manuscript mentions registered software
- **WHEN** a paper task mentions that the research software is registered
- **THEN** Navigate SHALL use the manuscript route and SHALL suggest the R11 Procedure only for a requested registration deliverable

### Requirement: Local R11 Materials
The Procedure SHALL produce the confirmed application data, source and manual DOCX and PDF, and a local material index with verification evidence. All task data SHALL remain in the ordinary case directory before authorized disclosure.

#### Scenario: Source and manual are assembled
- **WHEN** the applicant confirms the source order, fields, and manual draft
- **THEN** the Procedure SHALL use the real approved source, preserve its provenance, and check the produced documents against the confirmed data and actual pages

#### Scenario: Rendering or review remains incomplete
- **WHEN** a PDF, necessary proof, or the independent review is missing
- **THEN** the Procedure SHALL preserve available material and SHALL withhold filing readiness

### Requirement: Applicant Controls Filing
After acceptance, the Procedure SHALL let the applicant choose between finishing locally, obtaining manual guidance, and using authorized host browser assistance. The applicant SHALL control identity verification, statements, signatures, and formal submission.

#### Scenario: Browser handling is authorized
- **WHEN** the applicant approves the current case and exact scope
- **THEN** the Agent SHALL verify the official site and scope, read back the form and upload state, and pause at applicant-only actions

#### Scenario: A pause or uncertain platform state interrupts assistance
- **WHEN** the Agent cannot verify the platform state or continue within authorization
- **THEN** it SHALL retain observed facts, preserve the materials, and hand the next action back to the applicant
