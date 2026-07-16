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

### Requirement: Fifth-Vendor Skills SHALL Publish Only Approved Complete Trees
The npm release SHALL contain the three approved HistAgent Skill trees with `SKILL.md`, one formal entrypoint, copied `lib/historical_support.py`, two reviewed references, `DERIVATION.json`, `LICENSE`, and `NOTICE`, plus the vendor bundle, manifest, report, registry, and adapter documentation. It SHALL exclude the vendor checkout, audit, production decisions, authored converter sources, previews, tests, source evidence, review inputs, private runner files, generic schemas, doctors, result validators, dependency manifests, and unused requirements.

#### Scenario: Installed fifth vendor is verified
- **WHEN** the approved fifth vendor is packed and installed
- **THEN** every published tree matches the approved closure and passes static validation
- **AND** maintainer-only and unsupported protocol files are absent
- **AND** the public CLI and fixed base/Companion Skill surface remain unchanged

### Requirement: Sixth-Vendor Assets SHALL Publish Without Maintainer Inputs
The npm release SHALL contain the 136 approved Education Agent Skills complete
trees with `SKILL.md`, CC BY-SA 4.0 `LICENSE`, and `NOTICE.md`, plus the vendor
bundle, manifest, conversion report, assembled registry, and canonical adapter
documentation. It SHALL exclude the upstream checkout, immutable audit,
evidence map and report, production policy, review decision, preview tree,
converter source, upstream MCP, installer, tests, scripts, project docs, and
generated caches.

#### Scenario: Installed sixth vendor is verified
- **WHEN** the approved package is packed and installed
- **THEN** representative teacher-facing and student-facing Education Skills are present and registry-valid
- **AND** unresolved markers and attribution files are retained
- **AND** default initialization still installs only the fixed eight base Skills and wrappers
