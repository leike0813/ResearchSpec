## ADDED Requirements

### Requirement: Complete Multi-Vendor Staging
Each vendor converter SHALL stage its target output together with every unchanged published vendor, validate the complete source-neutral domain catalog through the central assembler, and commit only its own generated vendor outputs plus the assembled registry.

#### Scenario: Second vendor conversion preserves first vendor
- **WHEN** Scientific Agent Skills is converted or refreshed
- **THEN** ToolUniverse generated files and bundle remain byte-identical
- **AND** the assembled registry contains both reviewed vendors

#### Scenario: First vendor conversion preserves second vendor
- **WHEN** ToolUniverse is converted or refreshed after Scientific Agent Skills admission
- **THEN** Scientific Agent Skills generated files and bundle remain byte-identical
- **AND** central assembly validates all cross-vendor membership and dependencies

### Requirement: Reviewed Cross-Vendor Dependency Targets
Vendor converters SHALL write only reviewed `required` relationships to the registry graph and SHALL resolve every target to an admitted global Skill ID.

#### Scenario: Required target is unavailable
- **WHEN** a required target is excluded and has no reviewed self-contained adaptation or admitted equivalent
- **THEN** the source Skill is excluded or conversion fails
- **AND** the relationship is not silently downgraded
