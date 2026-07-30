## ADDED Requirements

### Requirement: Free-Form Annotation Intake Acceptance
Packaged acceptance SHALL exercise review-copy generation, arbitrary feedback
capture, Agent interpretation simulation, Annotation Set v2 registration, and
the existing revision continuation without granting the test harness authority.

#### Scenario: Arbitrary Markdown review reaches registration
- **WHEN** a journey uses optional slots, writes elsewhere in the copy, directly rewrites text, or supplies conversational feedback
- **THEN** the harness SHALL preserve exact raw evidence, simulate semantic interpretation only at the Agent producer boundary, and create the candidate only at the instructions-returned path
- **AND** every authoritative mutation SHALL use a fresh packaged CLI process

#### Scenario: Fixed product surface is retained
- **WHEN** adapter acceptance enumerates the public product
- **THEN** it SHALL retain seventeen commands, four ARSU Skills, four Companion Skills, seven fixed Zotero Adapter Skills, and the registered tool counts

