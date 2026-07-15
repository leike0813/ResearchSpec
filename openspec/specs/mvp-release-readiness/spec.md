## Purpose

Define the technical and human authorization gates for a clean, attributable, install-tested ResearchSpec MVP package without conflating release readiness with permission to publish.

## Requirements

### Requirement: Clean Production Package

ResearchSpec SHALL build its npm distribution from a clean production-only TypeScript output and SHALL reject development or retired output in the tarball.

#### Scenario: Package is built after deleted source output exists

- **GIVEN** a prior build output contains files no longer produced by current source
- **WHEN** the production package is built
- **THEN** only current production JavaScript SHALL remain under `dist`
- **AND** the tarball SHALL NOT contain compiled tests, TypeScript declarations, source maps, or non-current workflow modules

#### Scenario: Cleanup target is not a known build output

- **WHEN** the cleanup helper receives a path outside its fixed output allowlist
- **THEN** it SHALL fail without deleting that path

### Requirement: Installed Tarball Verification

ResearchSpec SHALL provide a cross-platform release verifier that inspects and exercises a real npm tarball in isolated temporary directories.

#### Scenario: Release tarball is verified

- **WHEN** a maintainer runs the release verification script
- **THEN** it SHALL create the tarball through the package lifecycle, validate its allowed files and required release documents, and install it into a temporary project
- **AND** it SHALL execute the installed `researchspec` bin rather than repository source or core planners

#### Scenario: Installed Codex delivery is smoke tested

- **WHEN** the installed tarball is initialized with explicit Codex selection and an isolated `CODEX_HOME`
- **THEN** the temporary project SHALL receive four ARSU and four Companion Skills
- **AND** the isolated prompt directory SHALL receive eight command prompts
- **AND** the installed CLI SHALL expose fifteen top-level commands and pass strict workspace checking

### Requirement: Supported Release Runtime Matrix

ResearchSpec v0.1 SHALL require Node.js 22 or newer and SHALL define Node 22 and Node 24 on Linux and Windows as the release certification matrix.

#### Scenario: Read-only CI validates a supported matrix cell

- **WHEN** CI runs for a supported operating-system and Node-version cell
- **THEN** it SHALL install the locked dependencies and run tests, lint, converter checks, idempotence, package verification, and strict main-spec validation
- **AND** it SHALL require only read access and SHALL NOT publish, tag, or mutate an external release

### Requirement: Mixed-License Distribution Disclosure

The package SHALL state the applicable MIT and CC BY-NC 4.0 boundaries and SHALL retain upstream ARS attribution in every distributed context that contains ARSU-derived runtime content.

#### Scenario: User inspects the npm tarball

- **WHEN** the package contents are listed
- **THEN** root license, notice, changelog, security, and README documents SHALL be present
- **AND** the README and notice SHALL disclose that bundled ARSU-derived content is noncommercial under CC BY-NC 4.0

#### Scenario: User inspects an installed Skill copy

- **WHEN** ResearchSpec delivers an ARSU or Companion Skill into an Agent tool directory
- **THEN** that independent Skill directory SHALL contain its applicable license and attribution information

### Requirement: Explicit Release Authorization

Automated technical readiness SHALL NOT by itself authorize the v0.1 tag or npm publication.

#### Scenario: Technical implementation is complete but external evidence is absent

- **WHEN** local release gates pass but the hosted matrix or required dogfood journeys lack signed evidence
- **THEN** the technical change MAY be verified and archived
- **AND** the release checklist SHALL remain blocked and SHALL prohibit tag and publish actions

#### Scenario: Maintainer prepares an actual release

- **WHEN** a maintainer considers tagging or publishing v0.1.0
- **THEN** the package name SHALL be rechecked, hosted CI SHALL be green, repository and npm account controls SHALL be configured, and all required dogfood journeys SHALL be signed

### Requirement: Second-Vendor Release Assets
The npm release SHALL contain the admitted Scientific Agent Skills generated tree, bundle, manifest, conversion report, assembled registry, applicable license and notice files, and canonical adapter documentation while excluding maintainer-only vendor checkout, audit inputs, and test fixtures.

#### Scenario: Installed package verifies second vendor
- **WHEN** the release verifier packs and installs the npm tarball
- **THEN** Scientific Agent Skills convert-derived assets are present and registry-valid
- **AND** the vendor checkout and audit policy inputs are absent
- **AND** default initialization still emits only the eight base Skills and eight wrappers

### Requirement: Third-Vendor Release Assets
The npm release SHALL contain the admitted Materials-Science-Skills-For-LLM generated tree, vendor bundle, manifest, conversion report, assembled registry, representative Skill content, applicable license and notice files, and canonical adapter documentation while excluding maintainer-only checkout, audit evidence, production decision catalogs, curation inputs, test fixtures, and source-audit materials.

#### Scenario: Installed package verifies third vendor
- **WHEN** the release verifier packs and installs the npm tarball
- **THEN** Materials convert-derived assets and adapter documentation are present and registry-valid
- **AND** the tarball contains representative generated `SKILL.md`, `LICENSE`, and `NOTICE.md` files
- **AND** maintainer-only vendor, audit, decision, curation, and fixture inputs are absent
- **AND** the public CLI and default base Skill surface remain unchanged

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
