# Spec Delta

## ADDED Requirements

### Requirement: Installed Native Roles Preserve Model Consent Boundaries

Installed-surface acceptance SHALL verify that native Procedure profiles do not pin vendor model identifiers and do not configure model services. A same-model or documented inherited-model worker MAY execute without additional model consent; an unknown, non-inherited, or alternate effective model SHALL require the existing current run/node disclosure and consent before dispatch, otherwise Navigate SHALL execute inline.

#### Scenario: Host inherits the parent model
- **WHEN** an eligible packet is delegated through a profile whose effective model is documented as inherited
- **THEN** no new model-consent record or ResearchSpec configuration is created

#### Scenario: Effective model is alternate or unknown
- **WHEN** Navigate cannot establish same-model inheritance for the current worker
- **THEN** it obtains the existing exact run/node-bound model, content-category, and cost consent before dispatch
- **AND** without that consent it keeps the work inline

#### Scenario: Installed profile surface is inspected
- **WHEN** acceptance initializes each supported adapter
- **THEN** both non-entry role profiles are present at their declared project-local targets
- **AND** no unsupported adapter receives a profile

