## ADDED Requirements

### Requirement: ARSU Revision Patch Is The Sole Patch Contract
The converter-owned ResearchSpec adaptation of the ARSU `revision_patch` schema SHALL be the only
manuscript patch contract, SHALL be projected consistently into the ARSU Skills, and SHALL NOT be
registered in a ResearchSpec patch lifecycle.

#### Scenario: Revision patch is applied mechanically
- **WHEN** a Skill-local helper receives explicit base, patch and output paths
- **THEN** it validates every block and mapping before atomically creating the output
- **AND** failure creates no partial manuscript

### Requirement: Annotation Material Is Subflow-Private By Default
Annotation intake SHALL preserve stable IDs, raw feedback, normalized interpretation and patch
mapping under the owning revision subflow's private work directory.

#### Scenario: Annotation material crosses a boundary
- **WHEN** another subflow must consume an annotation set
- **THEN** the Agent writes an explicit external file and references it through a handoff

## REMOVED Requirements

### Requirement: Immutable Annotation Registration
**Reason**: Annotation sets are not globally registered runtime authority.
**Migration**: Keep working intake under the owning subflow or expose it through a handoff.

### Requirement: Derived Annotation Resolution Report
**Reason**: A mandatory registry-backed resolution report duplicates the patch result.
**Migration**: Produce an optional helper report when the user or workflow needs it.
