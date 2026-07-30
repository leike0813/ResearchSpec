## ADDED Requirements

### Requirement: ARSU Guidance Shares The Annotation Intake Contract
Converter-owned Academic Paper and Pipeline guidance SHALL consume the same
free-form intake, Agent interpretation, Annotation Set submission, and
authority boundary as Navigate without defining a second parser or workflow
stage.

#### Scenario: User enters through an ARSU producer
- **WHEN** a direct Academic Paper or Pipeline request includes unregistered free-form manuscript feedback
- **THEN** generated guidance SHALL complete the shared intake preflight before revision work
- **AND** only a registered Annotation Set SHALL become route prerequisite evidence

#### Scenario: Generated surfaces are checked
- **WHEN** ARSU conversion and idempotence checks run
- **THEN** all generated Skills, manifests, and reports SHALL match the converter-owned intake guidance

