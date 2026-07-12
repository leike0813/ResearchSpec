## ADDED Requirements

### Requirement: Semantic replacements preserve stable behavior boundaries
The converter SHALL preserve stable prohibitions, applicability boundaries, and mode exceptions contained in every replaced blocking anchor span.

#### Scenario: Revision patch replacement preserves the full-mode exception
- **WHEN** the converter replaces the academic-paper revision patch protocol
- **THEN** the generated revision-mode guidance SHALL use ResearchSpec draft-patch contracts
- **AND** it SHALL state that the academic-paper full-mode Phase 6→4 loop does not use the patch protocol and still requires a complete Draft Body

#### Scenario: Phase boundaries use current ResearchSpec authority
- **WHEN** the converter replaces public phase-boundary guidance
- **THEN** the generated entrypoint SHALL preserve single-stage and cross-stage role boundaries and clarification-before-dispatch behavior
- **AND** it SHALL use the configured workflow, current run state, frontier instructions, and declared outputs as authority instead of ARS phase directories, design notes, hooks, or advisory scripts

### Requirement: Public entrypoints contain no unresolved operational repository paths
Generated public ARSU entrypoints SHALL NOT contain unresolved operational code-span references to excluded upstream documentation or root scripts.

#### Scenario: Missing docs or scripts code-span path blocks validation
- **GIVEN** a top-level generated `<skill-group>/SKILL.md` contains a code span beginning with `docs/` or `scripts/`
- **AND** the referenced path does not resolve inside that generated skill group
- **WHEN** generated-output validation runs
- **THEN** validation SHALL fail and identify the entrypoint and unresolved path

#### Scenario: Nested upstream history remains non-blocking
- **GIVEN** an ARSU-derived nested reference or agent file contains upstream historical path text
- **WHEN** generated-output validation runs
- **THEN** that text SHALL NOT fail validation solely because it is historical or is outside the public entrypoint

### Requirement: Cross-skill entry copies share semantic replacements
The converter SHALL apply source-path anchor replacements to public entrypoints and every copied cross-skill instance of the same upstream entry file.

#### Scenario: Cross-skill copy receives anchor replacement without public projection
- **WHEN** an upstream `SKILL.md` is copied as a cross-skill dependency
- **THEN** every applicable anchor replacement SHALL appear in that copy and its output path SHALL be recorded in the conversion manifest
- **AND** the copy SHALL retain its upstream description and SHALL NOT receive a duplicate Contract Preflight
