## Purpose
Define annotation evidence and its bounded use by the ARSU revision patch workflow.

## Requirements

### Requirement: ARSU Revision Patch Is The Sole Patch Contract
The converter-owned ResearchSpec adaptation of the ARSU `revision_patch` schema SHALL be the only
manuscript patch contract, SHALL be projected consistently into the ARSU Skills, and SHALL NOT be
registered in a ResearchSpec patch lifecycle.

#### Scenario: Revision patch is applied mechanically
- **WHEN** a Skill-local helper receives explicit base, patch and output paths
- **THEN** it validates every block and mapping before atomically creating the output
- **AND** failure creates no partial manuscript

### Requirement: Annotation Material Is Ordinary Working Material By Default
Annotation intake SHALL preserve stable IDs, raw feedback, normalized interpretation and patch
mapping in an explicit project-relative working directory outside `researchspec/`.

#### Scenario: Annotation material crosses a boundary
- **WHEN** another run must consume an annotation set
- **THEN** the Agent writes an explicit external file and references it through a handoff

### Requirement: Annotation and revision operations preserve manuscript blocks
The annotation intake and revision patch contracts SHALL operate on Markdown-compatible QMD content without stripping YAML frontmatter, Quarto metadata, or fenced code. Review copies SHALL retain stable block markers and hash constraints, and patch failures SHALL leave the base manuscript unchanged.

#### Scenario: QMD review copy preserves frontmatter and fences
- **WHEN** a QMD manuscript with YAML frontmatter and fenced code is converted to a review copy
- **THEN** both regions and their block/hash markers remain intact

#### Scenario: QMD revision applies a valid patch
- **WHEN** a revision patch hash matches a QMD review copy
- **THEN** the patch is applied to the intended blocks and the resulting QMD remains valid text
