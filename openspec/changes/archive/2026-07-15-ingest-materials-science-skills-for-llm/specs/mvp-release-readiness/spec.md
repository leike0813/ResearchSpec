## ADDED Requirements

### Requirement: Third-Vendor Release Assets
The npm release SHALL contain the admitted Materials-Science-Skills-For-LLM generated tree, vendor bundle, manifest, conversion report, assembled registry, representative Skill content, applicable license and notice files, and canonical adapter documentation while excluding maintainer-only checkout, audit evidence, production decision catalogs, curation inputs, test fixtures, and source-audit materials.

#### Scenario: Installed package verifies third vendor
- **WHEN** the release verifier packs and installs the npm tarball
- **THEN** Materials convert-derived assets and adapter documentation are present and registry-valid
- **AND** the tarball contains representative generated `SKILL.md`, `LICENSE`, and `NOTICE.md` files
- **AND** maintainer-only vendor, audit, decision, curation, and fixture inputs are absent
- **AND** the public CLI and default base Skill surface remain unchanged
