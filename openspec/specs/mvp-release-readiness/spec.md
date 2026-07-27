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

ResearchSpec SHALL provide a cross-platform release verifier that inspects and
exercises a real npm tarball, including the fixed literature adapter and the
generated CLI handbook, in isolated temporary directories.

#### Scenario: Release tarball is verified

- **WHEN** a maintainer runs the release verification script
- **THEN** it SHALL create the tarball through the package lifecycle, validate
  its allowed files and required release documents, and install it into a
  temporary project
- **AND** the tarball SHALL include `docs/cli_handbook.md` with the same digest
  as the source-controlled catalog-rendered handbook
- **AND** every repository-relative documentation target linked from the
  packaged README SHALL resolve to a file contained in the same tarball
- **AND** it SHALL execute the installed `researchspec` bin rather than repository source or core planners
- **AND** it SHALL NOT execute a bundled Zotero runtime or contact Zotero

#### Scenario: Installed Codex delivery is smoke tested

- **WHEN** the installed tarball is initialized with explicit Codex selection and an isolated `CODEX_HOME`
- **THEN** the temporary project SHALL receive four ARSU, four Companion, and seven Zotero Adapter Skills
- **AND** the isolated prompt directory SHALL receive eight command prompts
- **AND** the project SHALL receive one current-platform `.zotero-bridge` runtime and profile template
- **AND** the installed CLI SHALL expose seventeen top-level commands and pass strict workspace checking

### Requirement: Supported Release Runtime Matrix

ResearchSpec v0.1 SHALL require Node.js 22 or newer and SHALL certify Node 22 and Node 24 on Linux and Windows plus Node 22 on macOS, while statically verifying every supported Zotero runtime mapping.

#### Scenario: Read-only CI validates a supported matrix cell

- **WHEN** CI runs for a supported operating-system and Node-version cell
- **THEN** it SHALL install locked dependencies and run tests, lint, converter checks, idempotence, package verification, and strict main-spec validation
- **AND** it SHALL require only read access and SHALL NOT publish, tag, mutate an external release, or run the Zotero adapter

#### Scenario: Platform assets are verified
- **WHEN** release verification inspects the package
- **THEN** it SHALL require the approved Windows x64, macOS x64 and arm64, and Linux x86, x64, arm, and arm64 assets and checksums
- **AND** unsupported platform resolution SHALL remain deterministic and offline

### Requirement: Mixed-License Distribution Disclosure

The package SHALL state the applicable MIT, CC BY-NC 4.0, and AGPL-3.0 boundaries and SHALL retain upstream attribution in every distributed context that contains ARSU-derived or Zotero Adapter runtime content.

#### Scenario: User inspects the npm tarball

- **WHEN** the package contents are listed
- **THEN** root license, notice, changelog, security, README, and Zotero AGPL license and derivation documents SHALL be present
- **AND** the README and notice SHALL disclose ARSU's CC BY-NC 4.0 boundary and the Zotero Adapter's AGPL-3.0 boundary

#### Scenario: User inspects an installed Skill copy

- **WHEN** ResearchSpec delivers an ARSU, Companion, or Zotero Adapter Skill into an Agent tool directory
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

### Requirement: Fixed Zotero Release Assets

The npm release SHALL contain the approved generated seven-Skill Zotero Adapter
tree and supported runtime assets while excluding maintainer-only and
unconsumed upstream surfaces.

#### Scenario: Installed package verifies Zotero assets

- **WHEN** the release verifier packs and installs the npm tarball
- **THEN** all seven Zotero Adapter Skills, their reviewed runner and output
  schema assets, profile template, supported runtimes, checksums, release
  identities, licenses, notices and derivations SHALL be present and valid
- **AND** global installers, unreviewed agents, vendor checkout, audits,
  converter sources and test fixtures SHALL be absent
- **AND** default delivery SHALL expose fifteen fixed Skills and exactly eight
  wrapper types

### Requirement: Fluid Runtime Release Gate

Release verification SHALL cover the seventeen-command registry, adaptive
default, strict legacy compatibility, bounded Agent protocol, explicit
completion, Doctor, proposed/current case actions and Adapter-native user
journeys before the adaptive default is published.

#### Scenario: One convergence gate fails

- **WHEN** any runtime, migration, converter, idempotence, package, OpenSpec or
  acceptance gate fails
- **THEN** the release SHALL retain the prior default behavior
- **AND** maintainers SHALL NOT declare the fluid runtime converged

### Requirement: Release Surface And Guidance Are Converged

Release verification SHALL require exactly seventeen public top-level commands,
fifteen fixed Skills for all thirty-one registered tools, and exactly eight
command wrappers for the twenty-eight command-capable tools. It SHALL verify
that packaged and projected guidance uses the current adaptive-default,
strict-compatible action-descriptor protocol and one catalog-rendered static
CLI handbook.

#### Scenario: Installed release is smoke tested

- **WHEN** the release verifier initializes an isolated installed package
- **THEN** it SHALL observe four ARSU, four Companion, and seven Zotero Adapter
  Skills, seventeen CLI commands, and eight wrappers for a command-capable tool
- **AND** it SHALL reject stale release expectations for sixteen commands or two
  adapter Skills

#### Scenario: Handbook source and renderer remain converged

- **WHEN** release verification renders the CLI handbook from the typed static
  command catalog
- **THEN** the rendered bytes SHALL match the source-controlled
  `docs/cli_handbook.md`
- **AND** the packaged handbook SHALL have the same digest
- **AND** verification SHALL derive expected command identities and structural
  sections from the catalog rather than lock the complete handbook prose

#### Scenario: Every Navigate projection receives the same handbook

- **WHEN** release verification projects all thirty-one registered tools
- **THEN** each `researchspec-navigate` Skill SHALL receive one manifest-owned
  CLI handbook reference whose digest matches packaged `docs/cli_handbook.md`
- **AND** all tools SHALL still receive exactly fifteen fixed Skills
- **AND** only the twenty-eight command-capable tools SHALL receive the same
  eight wrapper types

#### Scenario: Guidance convergence gate fails

- **WHEN** static help, the source-controlled or packaged CLI handbook,
  projected Navigate references, generated guidance, canonical usage
  documentation, runtime documentation, or rendered diagrams contradict the
  current runtime protocol
- **THEN** release verification SHALL fail before declaring the adaptive default
  converged

## ADDED Requirements

### Requirement: Stable-contract release verification
Release verification SHALL validate package structure, schemas, hashes, links, licenses, safety boundaries, approved bytes, fixed public interfaces, and generated equality without treating documentation prose or diagram text as executable contracts.

#### Scenario: Stable product contract drifts
- **WHEN** a fixed command, Skill, wrapper, tool count, vendor admission, reviewed hash, approved tree, schema, license, safety exclusion, or generated artifact drifts
- **THEN** release verification SHALL fail

#### Scenario: Non-contract prose changes
- **WHEN** documentation headings, wording, Markdown IDs, diagram labels, or unordered field presentation change without altering a structured contract
- **THEN** release verification SHALL NOT fail solely because of that prose or ordering change
