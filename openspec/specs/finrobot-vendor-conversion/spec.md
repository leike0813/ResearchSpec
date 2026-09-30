## Purpose

Define the production conversion, provenance, form-safety, capability-fidelity,
approval, and isolated maintenance contract for the reviewed FinRobot vendor.

## Requirements

### Requirement: Production Decisions SHALL Bind The Complete Immutable Audit
ResearchSpec SHALL bind every FinRobot production catalog to vendor `finrobot`,
release `snapshot-2717499`, revision
`2717499b8e30f242640af08c4ad9afd1113c2d45`, and the immutable audit JSON hash.
The catalogs SHALL cover all 1,049 source entries, 129 knowledge surfaces, eight
content origins, seven license claims, and six candidates exactly once.

#### Scenario: Complete policy is validated
- **WHEN** production policy is loaded
- **THEN** every audited record maps to exactly one source-bound decision
- **AND** every included or adapted asset records source hash, symbols, dependency closure, action, output path, and derivation

#### Scenario: Evidence drifts
- **WHEN** an audit hash, revision, record, Git object, source hash, origin, or dependency closure differs
- **THEN** validation fails before generated output is staged

### Requirement: Executable Sources SHALL Be Classified By Coupling And Action
Every admitted FinRobot capability surface SHALL record source coupling and one
primary implementation mechanism independently from source admission. A hard
dependency that cannot be isolated SHALL be excluded. Each admitted surface
SHALL map to `agent-procedure`, `bundled-script`, or `external-tool`, and every
mapped implementation SHALL be present and documented in the complete Skill
tree.

#### Scenario: Admitted surfaces are resolved
- **WHEN** the production capability map is validated
- **THEN** all 39 admitted surfaces map exactly once to a supported primary mechanism
- **AND** every bundled script, Agent procedure, and external-tool contract resolves to a concrete authored-tree path or section

#### Scenario: FinRobot aggregate import expands the closure
- **WHEN** an implementation would require unrelated FinnHub, Reddit, FinNLP, provider-wrapper, or other runtime aggregates
- **THEN** it is replaced by a complete Agent procedure, portable deterministic script, or user-configured external-tool contract
- **AND** aggregate imports and blocked origins remain absent

### Requirement: Complete Business Capability SHALL Be Preserved
Generated Skills SHALL preserve reviewed statement, fundamentals, risk,
competitive, valuation, and event-analysis capabilities, including calculations,
forecasts, probabilities, sentiment, impact assessment, assumptions, targets,
ratings, and conclusions. Agent instructions SHALL own evidence quality,
business judgment, semantic scores, assumptions, conflicts, and final
conclusions; bundled scripts SHALL own only deterministic validation,
normalization, calculation, ranking from supplied assessments, hashing, and
rendering.

#### Scenario: Capability fidelity is checked
- **WHEN** a complete authored tree is validated
- **THEN** every admitted capability maps to an executable Agent procedure, bundled script, or explicit external tool
- **AND** no business capability is removed merely because it can inform a consequential decision

#### Scenario: A deterministic assumption is used
- **WHEN** a calculation requires a conventional or user-selected assumption
- **THEN** the Agent records the selected value and rationale and passes the explicit value to the script
- **AND** the script validates and reports the assumption without selecting its business meaning

### Requirement: Provider And Credential Guidance SHALL Remain Usable Without Embedded Secrets
Generated resources SHALL remain operationally usable without embedding real
sensitive values. They MAY name providers, public endpoints, SDKs, environment
variables, authentication methods, installation commands, and credential
placeholders, and MAY invoke user-configured providers when the target Agent
runs the Skill. Published bytes SHALL NOT contain real credential values,
private endpoints, private datasets, local user paths, or other reviewed
sensitive literals.

#### Scenario: Provider adapter is generated
- **WHEN** a reviewed adapter needs credentials or a network client
- **THEN** credentials and sessions are injected through explicit parameters or target-environment configuration
- **AND** no import-time client, secret lookup, network call, or private value is embedded

### Requirement: Conversion And Installation SHALL Remain Inert
ResearchSpec SHALL NOT execute or import generated scripts, install dependencies,
configure accounts, read credentials, contact services, or infer financial
semantics during conversion, checking, idempotence, packaging, installation,
discovery, or update. Bundled scripts SHALL use Python 3.11 standard-library
facilities, SHALL avoid import-time I/O, network and credential access, SHALL
reject overwriting by default, and MAY replace an output only through an
explicit `--overwrite` option during target-Agent invocation.

#### Scenario: A complete Skill tree is maintained
- **WHEN** maintainers convert, verify, package, install, list, show, or update it
- **THEN** those operations remain file-only and offline
- **AND** no generated Python module is imported or executed

#### Scenario: A target Agent runs a bundled command
- **WHEN** the Agent provides a documented JSON input and output path
- **THEN** the command validates input and writes deterministic output atomically without network, credential, package-installation, or repository-path access
- **AND** an existing output is preserved unless `--overwrite` is explicit

### Requirement: Six Independent Financial Research Skills SHALL Be Admitted
ResearchSpec SHALL admit exactly the six fixed neutral `financial-research-*`
Skill IDs and SHALL emit each with an empty Registry Schema 1 dependency array.

#### Scenario: Relationships are assembled
- **WHEN** reviewed cross-Skill relationships are published
- **THEN** they remain advisory guidance only
- **AND** Python packages, provider SDKs, and services do not become Skill dependencies

### Requirement: Source Origin License And Derivation SHALL Be Explicit
Only reviewed root-Apache sources SHALL support copied or adapted content. Each
Skill SHALL carry the complete Apache-2.0 license and a notice binding official
source, snapshot, revision, source paths, capability mechanisms, and
non-endorsement. `DERIVATION.json` SHALL trace every authored procedure, bundled
script, shared support copy, optional reference, and generated metadata file to
reviewed source evidence or ResearchSpec authorship. FinNLP, AutoGen-attributed
code, third-party Skill copies, unredistributable datasets and fixtures, unclear
filing/marker sources, provider wrappers, prompt factories, and unconsumed
schemas SHALL remain excluded.

#### Scenario: Generated attribution is inspected
- **WHEN** a Skill tree is rendered
- **THEN** every runtime and review asset is traceable to a reviewed source or ResearchSpec-authored implementation
- **AND** unknown-origin content, logos, external content, and obsolete resource generators are absent

### Requirement: Complete Tree Approval SHALL Gate Production
The preview renderer SHALL compose six complete authored trees containing a
runtime-complete `SKILL.md`, any documented entrypoint and copied support
library, `DERIVATION.json`, `LICENSE`, and `NOTICE`. A reference SHALL be present
only when detailed, conditionally read material meaningfully saves main-context
capacity; every reference SHALL be routed directly from `SKILL.md`, while the
governing rule remains in the main file. Review state
SHALL bind the currently published tree-set hash separately from an optional
candidate tree-set hash. A candidate SHALL remain `pending-human-review` until
all candidate trees and their review report are presented together and
explicitly approved.

#### Scenario: A replacement candidate is pending
- **WHEN** the candidate renderer produces a tree-set hash different from the approved published hash
- **THEN** preview and candidate validation SHALL expose the new hash as `pending-human-review`
- **AND** production conversion and release checks SHALL continue validating the exact published tree

#### Scenario: A candidate is promoted
- **WHEN** a human approves the exact current candidate tree-set hash
- **THEN** the candidate becomes the published hash, the candidate slot is cleared, and the new renderer, generated tree, bundle, manifest, report, and registry switch atomically
- **AND** approval of any different or stale hash SHALL fail before staging production files

### Requirement: FinRobot Maintenance SHALL Be Isolated
ResearchSpec SHALL provide maintainer-only `finrobot:convert`, `finrobot:check`,
and `finrobot:idempotence` commands through complete five-vendor staging. FinRobot
converter version 2 SHALL render only the approved complete authored trees and
SHALL preserve the fixed six IDs, reviewed memberships, empty hard Skill
dependencies, and advisory-only relationships.

#### Scenario: FinRobot is regenerated
- **WHEN** a maintainer converts unchanged approved inputs
- **THEN** FinRobot outputs and the combined registry are deterministic
- **AND** the other four vendor projections remain byte-identical

#### Scenario: Another vendor is regenerated
- **WHEN** any other published converter runs with FinRobot present
- **THEN** FinRobot generated files remain byte-identical
- **AND** the combined registry retains all five reviewed vendors

### Requirement: Audit Archival SHALL Precede Production And Final Archival
ResearchSpec SHALL allow draft catalogs and complete-tree previews while
`audit-finrobot` remains active, but final admission locking, production
generation, and archival of `ingest-finrobot` SHALL require the verified archived
audit capability and immutable audit evidence.

#### Scenario: Audit is still active
- **WHEN** production apply or final ingest archival is attempted
- **THEN** the operation stops with the audit prerequisite identified
- **AND** preview trees remain available for review

### Requirement: Complete Skills SHALL Follow The Non-Native Vendor Standard
Each of the six fixed FinRobot Skill trees SHALL contain a complete current-state
runtime controller and SHALL use the lowest sufficient thickness. Company
fundamentals, event evidence, relative valuation, and statement analysis SHALL
be Tier 3 script-assisted Skills. Competitive position and corporate risk SHALL
be Tier 1 Agent procedures without placeholder computation scripts. The current
trees SHALL not contain references because all reviewed supporting rules are
short and needed on ordinary invocations. No tree SHALL contain a generic
runner, state machine, fixed cross-Skill output envelope, AgentSpec, provider
wrapper, dependency manifest, or product UI metadata.

#### Scenario: A complete tree is validated
- **WHEN** `validateNonNativeVendorSkill` checks any FinRobot tree
- **THEN** its main file contains the ordinary path, hard constraints, responsibilities, output and failure behavior, and examples
- **AND** no auxiliary reference exists unless it meets the progressive-disclosure rule and has an explicit direct read condition
- **AND** each formal script has its path, invocation time, minimal command, input, output, dependencies, overwrite policy, and failure behavior

#### Scenario: A tree is copied outside the repository
- **WHEN** its documented entrypoint is executed from a repository-external directory
- **THEN** it operates using only tree-local files and Python 3.11 standard-library modules
- **AND** import performs no I/O and repeated identical input produces identical output

### Requirement: Shared Deterministic Support SHALL Have One Source
The converter SHALL own one `lib/financial_support.py` source and SHALL copy it
unchanged into each script-assisted Skill. The module SHALL provide JSON and
finite-number validation, date and unit normalization, canonical hashing,
atomic non-overwriting writes, and command-error handling. Domain formulas SHALL
remain in the corresponding entrypoint.

#### Scenario: Script-assisted trees are rendered
- **WHEN** the four Tier 3 trees are composed
- **THEN** each contains a byte-identical tree-local support module
- **AND** the two Agent-procedure trees contain no unused script or support directory

### Requirement: Incremental previews SHALL remain isolated from production
Maintainer preview SHALL produce six complete candidate trees, a tree-set hash and a review report marked pending-human-review. Candidate source, policies and authored bytes SHALL be validated independently. Default production checks SHALL continue validating the exact published source and tree until human approval of the displayed current candidate hash. Preview SHALL not update production pin, catalogs, packages, registries or workflow state.

#### Scenario: A pending candidate differs from published trees
- **WHEN** preview assembles a changed candidate
- **THEN** all candidate bytes and hashes are available for review
- **AND** the existing production output remains independently verifiable

### Requirement: Financial increments SHALL preserve evidential limits
Candidate procedures SHALL distinguish actual, computed and assumed values; preserve provenance, conflicts and limitations; and keep diagnostics advisory. EV bridges SHALL avoid duplicate debt deduction, identify unverified claims and reject invalid DCF publication. Weighted estimates SHALL require comparable currency, date and share basis, explicit applicability and weights. Period checks SHALL expose gaps and overlaps without certifying TTM from labels alone. Currency conversion SHALL require explicit sourced dated rates; source labels alone SHALL not prove independent validation.

#### Scenario: A composite lacks comparability
- **WHEN** method bases differ or necessary assumptions are unverified
- **THEN** individual method results remain visible and the composite point estimate is withheld

#### Scenario: A statement check has incomplete dates or dependent evidence
- **WHEN** interval boundaries or independent input provenance are absent
- **THEN** the result reports the evidential limitation rather than certifying completeness or independence
