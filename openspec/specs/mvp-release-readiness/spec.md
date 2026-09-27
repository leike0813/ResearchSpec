## Purpose
Define package, runtime, licensing, vendor, and current-contract release gates.

## Requirements

### Requirement: Distribution And Acceptance Claims Match Their Evidence

The npm package SHALL exclude compiled vendor converter maintenance modules while retaining
the public runtime import closure and reviewed distributable resources. User guidance SHALL explain
that optional domain and Adapter selection controls workspace projection, while the CLI package
contains the complete offline bundle. Declared `operational` maturity and static parity results
SHALL NOT be presented as successful real-Agent academic acceptance.

#### Scenario: Release package is verified

- **WHEN** the release verifier inspects and installs the tarball
- **THEN** compiled vendor converter modules SHALL be absent
- **AND** the installed public CLI SHALL complete the existing minimal and academic pipeline technical journeys

#### Scenario: Academic acceptance has no signed evidence

- **WHEN** only static checks and fixture-based technical journeys have completed
- **THEN** manual academic acceptance SHALL remain unsigned
- **AND** its evidence template SHALL record human corrections, resume attempts and successes, evidence quality and deliverable usability

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

ResearchSpec SHALL provide a cross-platform release verifier that derives the fixed Agent surface from packaged Companion and Adapter registries, inspects and exercises a real npm tarball, and verifies the optional literature Adapter in isolated temporary directories.

#### Scenario: Release tarball is verified

- **WHEN** a maintainer runs release verification
- **THEN** it SHALL pack, validate, install and execute the installed CLI without running Adapter or packaged capability assets

#### Scenario: Default installed delivery is smoke tested

- **WHEN** the installed tarball initializes with explicit Codex selection and no Adapter
- **THEN** the project receives exactly one base Skill, `researchspec-navigate`, with its generated CLI-handbook and ARSU-route references
- **AND** the project receives no `.zotero-bridge` files
- **AND** no independent handbook Skill or hidden procedure is projected

#### Scenario: Opted-in Codex delivery is smoke tested

- **WHEN** the installed tarball initializes with Codex and `zotero-library`
- **THEN** the project receives Navigate plus seven Adapter Skills and the current-platform Adapter runtime/profile
- **AND** the installed CLI SHALL expose sixteen top-level commands and pass strict checking

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
- **AND** default initialization still emits only the one-Skill Navigate base surface and the configured Navigate wrappers

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
- **AND** default initialization still installs only the one-Skill Navigate base surface and configured wrappers

### Requirement: Fixed Zotero Release Assets

The npm release SHALL contain the approved generated seven-Skill Zotero Adapter
tree and supported runtime assets while treating their workspace installation as
optional and excluding maintainer-only and unconsumed upstream surfaces.

#### Scenario: Installed package verifies Zotero assets

- **WHEN** the release verifier packs and installs the npm tarball
- **THEN** all seven Zotero Adapter Skills, reviewed runtime metadata, profile template, supported runtimes, checksums, release identities, licenses, notices and derivations SHALL be present and valid
- **AND** global installers, unreviewed agents, vendor checkout, audits, converter sources and test fixtures SHALL be absent
- **AND** default delivery SHALL expose the registry-derived fixed base surface while explicit selection adds seven Adapter Skills

### Requirement: Release Surface And Guidance Are Converged

The release SHALL contain one host-visible Navigate Companion Skill with its generated references, hidden procedure packages derived from current registries, the optional seven-Skill Zotero surface, sixteen-command CLI, current graph profiles, and current graph-only guidance.

#### Scenario: Package is verified

- **WHEN** the packed tarball is installed and exercised
- **THEN** default init SHALL project only Navigate and omit Adapter files, while explicit Adapter opt-in SHALL additionally install seven Adapter Skills
- **AND** Navigate's handbook and ARSU-route references SHALL match their canonical renderers
- **AND** no public Skill, wrapper, payload catalog or handbook contains retired runtime selector or state-file guidance

### Requirement: Authored Whitespace Is Checked Without Rewriting Reviewed Bytes

Release verification SHALL reject whitespace errors in authored files while exempting only exact files enumerated as byte-preserved and whose current SHA-256 matches their reviewed registry or catalog evidence. An unverified exemption SHALL fail the gate.

#### Scenario: Authored file has trailing whitespace

- **WHEN** a changed authored text file fails the whitespace check
- **THEN** release verification fails with the file and location

#### Scenario: Byte-preserved resource has upstream whitespace

- **WHEN** a changed resource is explicitly registered as byte-preserved and its current hash is verified
- **THEN** the authored-whitespace gate does not require normalization of that resource

### Requirement: Stable-contract release verification
Release verification SHALL validate package structure, schemas, hashes, links, licenses, safety boundaries, approved bytes, fixed public interfaces, and generated equality without treating documentation prose or diagram text as executable contracts.

#### Scenario: Stable product contract drifts
- **WHEN** a fixed command, Skill, wrapper, tool count, vendor admission, reviewed hash, approved tree, schema, license, safety exclusion, or generated artifact drifts
- **THEN** release verification SHALL fail

#### Scenario: Non-contract prose changes
- **WHEN** documentation headings, wording, Markdown IDs, diagram labels, or unordered field presentation change without altering a structured contract
- **THEN** release verification SHALL NOT fail solely because of that prose or ordering change

### Requirement: Current Contract Release Gate
A release SHALL be blocked until fresh packaged CLI journeys, generated Skills, Companion guidance,
canonical documentation and package verification all use the same current workspace contract.

#### Scenario: Legacy control-plane behavior remains published
- **WHEN** release verification finds a public `submit`, strict/adaptive runtime, migration, registry,
  ledger, receipt, Passport or generic Draft Patch authority
- **THEN** the release fails


### Requirement: Manual Acceptance Evidence Requires Natural Host Sessions

Manual release acceptance SHALL be produced by real Agent sessions on registered targets using
natural task prompts and SHALL satisfy the release gate's own evidence rules before it is
recorded. The dogfooding gate SHALL additionally require the init projection matrix to pass for
every registered target in `skills`, `commands` and `both` modes, including shared `agents`.
The natural behavior suite SHALL run on one selected runnable host, with two independent
human-reviewed passes per scenario. Technical readiness and fixture-based journeys SHALL NOT
satisfy a natural behavior item. A single-host result SHALL NOT certify untested hosts.

#### Scenario: Manual items stay unsigned without host evidence
- **WHEN** only automated technical journeys have completed
- **THEN** every manual dogfooding item SHALL remain unchecked
- **AND** the existing release gate SHALL continue to block authorization

#### Scenario: Static matrix and selected-host behavior satisfy the dogfooding gate
- **WHEN** every registered target passes all three init modes and the selected host passes the complete human-reviewed natural suite
- **THEN** this dogfooding release gate SHALL be satisfied
- **AND** no behavior verdict SHALL be inferred for other hosts

#### Scenario: Items may be recorded once the gate's evidence rules are met
- **WHEN** a manual item has host evidence that satisfies the release gate's rules
- **THEN** the item and the authorization state SHALL be updated according to those rules
- **AND** no fixed wording SHALL be required to remain unchanged merely to satisfy this requirement

#### Scenario: Manual evidence identifies its host, model and sessions
- **WHEN** a manual item is recorded
- **THEN** its evidence SHALL identify the target, host and model versions, the independent sessions, human corrections, resume attempts and successes, and the quality scores
- **AND** the checklist SHALL link the item to its declared scenario slug

#### Scenario: Checklist references resolve to declared scenarios
- **WHEN** the manual release checklist is validated
- **THEN** every manual item slug SHALL resolve to a scenario declared in `playbooks/dogfooding/scenarios.yaml`
- **AND** an unresolved slug SHALL fail validation
