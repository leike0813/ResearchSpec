## MODIFIED Requirements

### Requirement: Complete Scientific Agent Skills Admission Decisions
ResearchSpec SHALL resolve every top-level Scientific Agent Skills v2.53.0 Skill into exactly one evidenced production admission decision, SHALL require a completed finding-level maintainer decision for every candidate previously carrying `static-security-review-failed`, and SHALL generate only candidates whose license, manual security, content, overlap, dependency, resource, and domain decisions are complete and passing.

#### Scenario: Candidate admission is evidence governed
- **WHEN** the converter evaluates the pinned 147-Skill audit and manual security policy
- **THEN** every audit record has exactly one admitted or excluded production decision
- **AND** all 40 static-security targets have one completed finding-level maintainer decision
- **AND** aggregate readiness labels or upstream scanner severities alone do not grant or deny admission
- **AND** the final generated count equals the reviewed admitted set

#### Scenario: Unresolved decision blocks conversion
- **WHEN** an admission or required manual security decision is missing, pending, stale, contradictory, lacks safe evidence, or retains an unresolved blocker
- **THEN** conversion fails before changing production output

#### Scenario: Cleared security does not erase another blocker
- **WHEN** a manual security decision is `clear` or `clear-with-adaptation` but another admission gate fails
- **THEN** the static security failure is reconciled according to the manual evidence
- **AND** the Skill remains excluded for the independent reason

## ADDED Requirements

### Requirement: Approved Manual Curation Boundary
The Scientific Agent Skills converter SHALL apply only maintainer-approved generated entry normalization, compatibility guidance, fixed non-secret configuration, or non-essential resource exclusions when resolving a `clear-with-adaptation` decision, and SHALL NOT maintain rewritten upstream executable business logic.

#### Scenario: Approved resource is removable
- **WHEN** a reviewed risky resource is not required for the coherent Skill capability
- **THEN** the converter may exclude it through the resource policy
- **AND** the manifest and notice record the omission

#### Scenario: Risk requires executable logic changes
- **WHEN** resolving a confirmed risk requires changing Python, shell, or other executable business behavior
- **THEN** the Skill remains failed or deferred for the pinned revision
- **AND** the converter does not embed a local script patch

### Requirement: Atomic Post-Review Reconciliation
Scientific Agent Skills production policy and generated output SHALL remain unchanged while manual decisions are incomplete and SHALL be reconciled as one complete multi-vendor projection after all 40 decisions are final.

#### Scenario: All manual decisions are complete
- **WHEN** the 40 target records have validated non-pending decisions
- **THEN** admission, resources, existing domain membership, vendor output, reports, and central registry are regenerated from the completed policy set
- **AND** unchanged ToolUniverse assets remain byte-identical

#### Scenario: Public boundaries remain stable
- **WHEN** newly eligible Scientific Agent Skills are projected
- **THEN** users continue to install existing domains rather than vendors
- **AND** no public command, registry schema version, domain ID, base Skill, Companion Skill, or wrapper is added
