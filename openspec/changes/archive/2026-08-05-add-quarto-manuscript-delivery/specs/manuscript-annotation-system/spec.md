## MODIFIED Requirements

### Requirement: Annotation and revision operations preserve manuscript blocks
The annotation intake and revision patch contracts SHALL operate on Markdown-compatible QMD content without stripping YAML frontmatter, Quarto metadata, or fenced code. Review copies SHALL retain stable block markers and hash constraints, and patch failures SHALL leave the base manuscript unchanged.

#### Scenario: QMD review copy preserves frontmatter and fences
- **WHEN** a QMD manuscript with YAML frontmatter and fenced code is converted to a review copy
- **THEN** both regions and their block/hash markers remain intact

#### Scenario: QMD revision applies a valid patch
- **WHEN** a revision patch hash matches a QMD review copy
- **THEN** the patch is applied to the intended blocks and the resulting QMD remains valid text
