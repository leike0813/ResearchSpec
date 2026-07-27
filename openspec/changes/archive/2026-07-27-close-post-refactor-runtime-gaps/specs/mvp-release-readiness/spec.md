## ADDED Requirements

### Requirement: Stable-contract release verification
Release verification SHALL validate package structure, schemas, hashes, links, licenses, safety boundaries, approved bytes, fixed public interfaces, and generated equality without treating documentation prose or diagram text as executable contracts.

#### Scenario: Stable product contract drifts
- **WHEN** a fixed command, Skill, wrapper, tool count, vendor admission, reviewed hash, approved tree, schema, license, safety exclusion, or generated artifact drifts
- **THEN** release verification SHALL fail

#### Scenario: Non-contract prose changes
- **WHEN** documentation headings, wording, Markdown IDs, diagram labels, or unordered field presentation change without altering a structured contract
- **THEN** release verification SHALL NOT fail solely because of that prose or ordering change
