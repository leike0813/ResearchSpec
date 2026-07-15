## ADDED Requirements

### Requirement: Fourth-Vendor Runtime Assets SHALL Be Published Without Maintainer Inputs
The npm release SHALL contain the six approved FinRobot-derived Skill trees,
including reviewed Python resources, AgentSpec schemas, dependency metadata,
vendor bundle, manifest, conversion report, assembled registry, Apache-2.0
licenses, source-bound notices, and canonical adapter documentation. It SHALL
exclude the vendor checkout, immutable audit, decision catalogs, curation
sources, previews, tests, and other source-review evidence.

#### Scenario: Installed package verifies the fourth vendor
- **WHEN** the release verifier packs and installs the npm tarball
- **THEN** generated FinRobot assets and adapter documentation are present and registry-valid
- **AND** representative SKILL, Python, AgentSpec, dependency, LICENSE, and NOTICE files are present
- **AND** maintainer-only checkout, audit, policy, curation, preview, and test inputs are absent
- **AND** the public CLI and fixed base/Companion Skill surface remain unchanged
