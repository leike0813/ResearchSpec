## ADDED Requirements

### Requirement: Authoring Engine Accepts Vendor Extraction Indexes

The capability authoring engine SHALL accept a caller-supplied extraction index path and provenance
origin. A vendor-derived source SHALL use its own extraction index, author manifest provenance as
`vendor-derived`, and copy declared package assets from verified extraction artifacts.

#### Scenario: Vendor capability is authored

- **WHEN** an authoring source is authored with a vendor extraction index and origin
  `vendor-derived`
- **THEN** the generated manifest records `origin: vendor-derived`
- **AND** every knowledge source and package asset resolves through the supplied index

#### Scenario: ARS authoring defaults are unchanged

- **WHEN** an authoring source is authored without options
- **THEN** the engine reads `docs/ars_extraction/extraction-index.json` and records `origin:
  ars-derived`
