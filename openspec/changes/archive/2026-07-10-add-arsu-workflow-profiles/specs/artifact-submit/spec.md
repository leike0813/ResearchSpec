## ADDED Requirements

### Requirement: Artifact submission supports controlled text and binary files
Artifact submission SHALL support `text-artifact` and `binary-file-artifact` validation profiles while preserving `research-artifact` as a text-compatible legacy profile.

#### Scenario: Valid binary candidate is submitted
- **WHEN** a contained non-empty regular file has an allowed extension and media kind and matches the planned hash
- **THEN** the binary candidate can be registered and receipted without UTF-8 decoding

#### Scenario: Text candidate is invalid UTF-8
- **WHEN** a `text-artifact` candidate cannot be decoded as UTF-8
- **THEN** submission fails without mutating the registry or workflow state

### Requirement: ARSU artifact references are controlled
Instructions SHALL resolve `arsu-artifact:<artifact-type>` only through the validated artifact-contract registry and SHALL continue to support existing controlled ARS handoff references.

#### Scenario: Unknown artifact type is referenced
- **WHEN** a work item uses an unregistered `arsu-artifact:` reference
- **THEN** profile validation and instruction rendering reject it

### Requirement: Binary submissions retain transaction guarantees
Binary candidate transactions SHALL retain containment, plan-hash, registry precondition, receipt-first recovery, idempotence, and conflict behavior equivalent to text submissions.

#### Scenario: Binary file changes after dry-run
- **WHEN** the binary candidate hash differs from the expected plan at execution
- **THEN** submission returns a conflict and does not register the changed file
