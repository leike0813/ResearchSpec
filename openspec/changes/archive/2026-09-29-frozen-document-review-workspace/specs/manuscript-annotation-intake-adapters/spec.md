# Spec Delta

## MODIFIED Requirements

### Requirement: Annotation candidates project into review workspaces
The annotation intake adapter SHALL project a validated Annotation Set candidate and its exact manuscript text into the shared v2 frozen review-workspace contract without changing the candidate, source evidence, target hashes, or manuscript bytes. The projection SHALL preserve each annotation as one stable Agent review item while allowing additional independent user comments in the browser result.

#### Scenario: Annotation candidate is reviewed interactively
- **WHEN** a valid candidate is projected into a v2 workspace
- **THEN** every annotation becomes one stable Agent review item with its raw evidence, typed target, interpretation, expected action, and semantic impact preserved

#### Scenario: Reviewer adds a separate observation
- **WHEN** a reviewer adds a user comment beside projected candidate items
- **THEN** the result keeps that comment separate from candidate identities and does not register or alter the Annotation Set candidate

#### Scenario: Manuscript bytes are stale
- **WHEN** the supplied manuscript text does not match the candidate manuscript hash
- **THEN** workspace projection fails without creating a replacement candidate

### Requirement: Browser round trips preserve annotation bytes
The review-workspace adapter SHALL preserve newline and Unicode content exactly in v2 imported and exported structured fields and SHALL leave review-copy slot removal and byte offsets under the existing annotation-intake contract.

#### Scenario: Untouched review copy is round-tripped
- **WHEN** a generated review copy passes through v2 workspace JSON serialization without edits
- **THEN** removing untouched slots still returns the exact original manuscript bytes
