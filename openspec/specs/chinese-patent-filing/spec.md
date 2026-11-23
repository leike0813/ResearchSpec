# Chinese Patent Filing Specification

## Purpose

Prepare and verify Chinese patent filing materials from case documents and drawings, including China national phase entry for existing PCT applications.

## Requirements

### Requirement: Discoverable standalone filing Procedure

ResearchSpec SHALL make the Chinese patent filing Procedure discoverable through Navigate and require selection of the Intellectual property materials domain before serving its instructions.

#### Scenario: Applicant requests an XML ZIP
- **WHEN** a user requests an XML submission package for an approved Chinese patent draft
- **THEN** Navigate can find the standalone filing Procedure and preview the required domain installation
- **AND** the selected domain enables the Procedure through its existing instruction command

### Requirement: Local versioned filing materials

The Procedure SHALL prepare the applicable editable DOCX, CNIPA XML ZIP, form guidance, attachments and verification record. It SHALL preserve the source, approved scope and previously produced case files.

#### Scenario: Applicant brings a completed application bundle
- **WHEN** an applicant supplies an existing ResearchSpec application index
- **THEN** the Procedure reads the approved material and its provenance from that index and prepares a new case delivery from the verifiable content

#### Scenario: A necessary field or conversion is unavailable
- **WHEN** a field, figure, runtime dependency or supported conversion is unavailable
- **THEN** the Procedure retains the usable case materials and states the reason, affected deliverable and recovery condition

### Requirement: PCT text determines the required delivery

The Procedure SHALL verify the original international application, the applicable bibliographic record and the confirmed patent type before preparing entry materials. It SHALL distinguish Chinese originals from documents requiring a Chinese translation.

#### Scenario: Original international application is in Chinese
- **WHEN** the Chinese original qualifies for ordinary national phase entry
- **THEN** the Procedure verifies the source documents and prepares the applicable entry declaration and attachments without requiring translation or XML conversion

#### Scenario: Original international application is in another language
- **WHEN** national phase entry uses the approved Chinese translation of the foreign-language original
- **THEN** the Procedure checks the translation against that original and prepares the applicable editable translation and XML ZIP

### Requirement: Applicant controls CNIPA draft access

The Procedure SHALL keep filing work local before explicit case-specific browser authorization. Browser assistance SHALL wait for applicant authentication and stop at draft preview. Readiness SHALL depend on evidence for the current case and version.

#### Scenario: The applicant elects browser assistance
- **WHEN** the applicant authorizes the official site, exact case and materials and completes authentication
- **THEN** the Agent may prepare and inspect the draft within that scope
- **AND** the applicant controls formal submission and payment

#### Scenario: Only offline conversion has been verified
- **WHEN** the current case lacks the applicable draft readback or preview evidence
- **THEN** the Procedure records the checks completed and the remaining evidence needed for filing readiness
