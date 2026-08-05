## MODIFIED Requirements

### Requirement: ARSU conversion is converter-owned and preserves upstream semantics
The ARSU converter SHALL update source rules and anchor replacements so `academic-paper`, `academic-pipeline`, reviewer, revision, and annotation instructions treat QMD as Markdown-compatible manuscript source, preserve YAML frontmatter, fenced code, and Quarto metadata boundaries, and project the result only through generated Skill trees. Generated output SHALL remain reproducible and idempotent.

#### Scenario: QMD instructions are projected
- **WHEN** the converter runs against the pinned ARS source
- **THEN** generated writing and pipeline Skills contain the QMD source-format and Quarto delivery rules without hand-edited generated files

#### Scenario: Conversion remains idempotent
- **WHEN** conversion and check are run twice against unchanged sources
- **THEN** generated tree hashes and manifests remain identical
