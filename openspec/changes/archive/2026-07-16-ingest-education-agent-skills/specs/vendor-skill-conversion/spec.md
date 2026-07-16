## MODIFIED Requirements

### Requirement: Complete Multi-Vendor Staging
Each vendor converter SHALL stage its target output together with every unchanged published vendor, validate the complete source-neutral domain catalog through the central assembler, and commit only its own generated vendor outputs plus the assembled registry. The rule SHALL apply to the approved Education Agent Skills sixth vendor.

#### Scenario: Education Agent Skills is regenerated
- **WHEN** its approved converter commits a staged projection
- **THEN** all five non-target vendor projections remain byte-identical
- **AND** the assembled registry contains all six reviewed vendors
