# Document Roundtrip

## ADDED Requirements

### Requirement: Round-trip preserves source shape
Parsing and serializing an unchanged Markdown, Quarto, or LaTeX document SHALL preserve its bytes except for the documented final newline normalization.
#### Scenario: Unchanged source
- **WHEN** a document is parsed and serialized without an edit
- **THEN** its bytes are preserved except for a normalized final newline
