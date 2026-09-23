# Spec Delta

## ADDED Requirements

### Requirement: Annotation candidates project into review workspaces
The annotation intake adapter SHALL project a validated Annotation Set candidate and its exact manuscript text into the shared review-workspace contract without changing the candidate, source evidence, target hashes, or manuscript bytes.

#### Scenario: Annotation candidate is reviewed interactively
- **WHEN** a valid candidate is projected
- **THEN** every annotation becomes one stable review item with its raw evidence, typed target, interpretation, expected action, and semantic impact preserved

#### Scenario: Manuscript bytes are stale
- **WHEN** the supplied manuscript text does not match the candidate manuscript hash
- **THEN** workspace projection fails without creating a replacement candidate

### Requirement: Browser round trips preserve annotation bytes
The review-workspace adapter SHALL preserve newline and Unicode content exactly in imported and exported structured fields and SHALL leave review-copy slot removal and byte offsets under the existing annotation-intake contract.

#### Scenario: Untouched review copy is round-tripped
- **WHEN** a generated review copy passes through the workspace JSON serialization without edits
- **THEN** removing untouched slots still returns the exact original manuscript bytes

