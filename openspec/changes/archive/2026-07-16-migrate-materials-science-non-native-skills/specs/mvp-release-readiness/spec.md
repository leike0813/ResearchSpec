## MODIFIED Requirements

### Requirement: Third-Vendor Release Assets
The npm release SHALL contain the seven approved complete
Materials-Science-Skills-For-LLM trees. Every tree SHALL include `SKILL.md`, MIT
`LICENSE`, source-bound `NOTICE.md`, and `DERIVATION.json`; APEX, DeePTB,
DP-GEN, GPUMD, Phonopy, and Uni-Mol SHALL each include exactly one approved
substantial reference, while Atomsk SHALL contain no reference. The release
SHALL also contain the vendor bundle, manifest, conversion report, assembled
registry, and canonical adapter documentation. It SHALL exclude the vendor
checkout, immutable audit, decision catalogs, authored converter sources,
candidate or review evidence, tests, obsolete curation and replacement assets,
generic runners or schemas, installers, provider clients, and unused resources.

#### Scenario: Installed package verifies third vendor
- **WHEN** the release verifier packs and installs the npm tarball
- **THEN** all generated Materials trees and adapter documentation are present and registry-valid
- **AND** representative Tier 1 and Tier 2 `SKILL.md`, reference, `DERIVATION.json`, `LICENSE`, and `NOTICE.md` files are present
- **AND** no unreviewed, short ordinary-path, orphaned, or unused auxiliary reference is present
- **AND** maintainer-only and obsolete runtime inputs are absent
- **AND** the public CLI and fixed base/Companion Skill surface remain unchanged
