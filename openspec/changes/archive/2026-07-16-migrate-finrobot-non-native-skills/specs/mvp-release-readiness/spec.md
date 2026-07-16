## MODIFIED Requirements

### Requirement: Fourth-Vendor Runtime Assets SHALL Be Published Without Maintainer Inputs
The npm release SHALL contain the six approved FinRobot-derived complete Skill
trees. Company fundamentals, event evidence, relative valuation, and statement
analysis SHALL include their formal Python entrypoint and copied
`lib/financial_support.py`; every tree SHALL include `DERIVATION.json`,
Apache-2.0 `LICENSE`, and source-bound `NOTICE`. The current reviewed trees SHALL
not publish references because no supporting material meets the
progressive-disclosure threshold. The release
SHALL also contain the vendor bundle, manifest, conversion report, assembled
registry, and canonical adapter documentation. It SHALL exclude the vendor
checkout, immutable audit, decision catalogs, authored converter sources,
candidate previews and review evidence, tests, AgentSpec schemas, dependency
manifests, prompt factories, provider contracts/adapters, and obsolete curation
resources.

#### Scenario: Installed package verifies the fourth vendor
- **WHEN** the release verifier packs and installs the npm tarball
- **THEN** all generated FinRobot trees and adapter documentation are present and registry-valid
- **AND** representative formal scripts, the shared support library, SKILL, DERIVATION, LICENSE, and NOTICE files are present
- **AND** no unreviewed or unjustified auxiliary reference is present
- **AND** maintainer-only and obsolete runtime inputs are absent
- **AND** the public CLI and fixed base/Companion Skill surface remain unchanged
