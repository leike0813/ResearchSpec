## MODIFIED Requirements

### Requirement: Candidate domain mapping SHALL remain prospective
The immutable audit SHALL record `historical-studies` for all three candidates and `heritage-archive-and-museum-studies` for source identification and source analysis as prospective evidence only. Audit evidence, ANZSRC Field metadata, provider use, external tools, and media processing SHALL NOT create membership. A separately approved ingestion change MAY promote only those reviewed memberships through the source-neutral domain catalog.

#### Scenario: Approved production membership is inspected
- **WHEN** the separately approved HistAgent bundle and source-neutral catalog are assembled
- **THEN** all three Skills are direct members of `historical-studies`
- **AND** source identification and source analysis are direct members of `heritage-archive-and-museum-studies`
- **AND** no HistAgent Skill belongs to a tool domain

### Requirement: Future ingestion SHALL have separate hash-bound Gates
Production publication SHALL require strict audit validation, archival of the completed audit change, executable copied-tree tests, and human approval bound to the aggregate hash of all three complete trees. Audit completion alone SHALL NOT authorize production.

#### Scenario: Production bundle is verified
- **WHEN** the generated HistAgent bundle is checked
- **THEN** the archived audit main specification exists
- **AND** the approved aggregate hash equals the recomputed complete-tree hash
- **AND** every published file is byte-identical to the approved tree set
