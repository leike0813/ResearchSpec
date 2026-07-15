## Purpose

Define the production conversion, provenance, form-safety, capability-fidelity,
approval, and isolated maintenance contract for the reviewed FinRobot vendor.

## Requirements

### Requirement: Production Decisions SHALL Bind The Complete Immutable Audit
ResearchSpec SHALL bind every FinRobot production catalog to vendor `finrobot`,
release `snapshot-297a8d2`, revision
`297a8d28d099be328c8a8eb658b4f782b93f3651`, and the immutable audit JSON hash.
The catalogs SHALL cover all 146 source entries, 66 knowledge surfaces, five
content origins, six license claims, and six candidates exactly once.

#### Scenario: Complete policy is validated
- **WHEN** production policy is loaded
- **THEN** every audited record maps to exactly one source-bound decision
- **AND** every included or adapted asset records source hash, symbols, dependency closure, action, output path, and derivation

#### Scenario: Evidence drifts
- **WHEN** an audit hash, revision, record, Git object, source hash, origin, or dependency closure differs
- **THEN** validation fails before generated output is staged

### Requirement: Executable Sources SHALL Be Classified By Coupling And Action
Every executable candidate source SHALL record FinRobot coupling independently
from production action. A hard dependency that cannot be isolated SHALL be
excluded, a light dependency SHALL be adapted through explicit contracts, and a
source without FinRobot runtime dependency SHALL be included as a reviewed
resource when origin and license gates pass.

#### Scenario: Twelve candidate files are resolved
- **WHEN** the candidate dependency closure is validated
- **THEN** zero files are hard-coupled exclusions, eight are adapted resources, and four are direct resources
- **AND** file type, provider use, forecasting, scoring, valuation, or recommendation semantics do not independently cause exclusion

#### Scenario: FinRobot aggregate import expands the closure
- **WHEN** a source would import unrelated FinnHub, Reddit, FinNLP, or other runtime components
- **THEN** the generated resource uses a reviewed Protocol, DTO, schema, or isolated adapter instead
- **AND** the aggregate and blocked origins remain absent

### Requirement: Complete Business Capability SHALL Be Preserved
Generated Skills SHALL preserve reviewed statement, fundamentals, risk,
competitive, valuation, and event-analysis capabilities, including calculations,
forecasts, probabilities, sentiment, impact assessment, assumptions, targets,
ratings, and conclusions supported by their selected source logic.

#### Scenario: Capability fidelity is checked
- **WHEN** an adapted or direct resource is validated
- **THEN** required source symbols, prompt roles, response schemas, configurable assumptions, and outputs map to generated assets
- **AND** no business capability is removed merely because it can inform a consequential decision

#### Scenario: An assumption is present
- **WHEN** a source method uses a fixed or conventional assumption
- **THEN** the generated resource exposes it visibly and allows an explicit override where technically feasible
- **AND** form-safety validation does not delete it

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
ResearchSpec SHALL NOT execute or import generated scripts, install their
dependencies, configure accounts, read credentials, or contact services during
conversion, checking, idempotence, packaging, installation, discovery, or
update. Generated scripts MAY run later only through explicit target-Agent use.

#### Scenario: A Skill contains Python and dependency guidance
- **WHEN** maintainers convert, verify, package, install, list, show, or update it
- **THEN** those operations remain file-only and offline
- **AND** dependencies remain documented user-managed external requirements

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
source, snapshot, revision, source paths, symbol adaptations, and
non-endorsement. FinNLP, AutoGen-attributed code, and unclear filing/marker
sources SHALL remain excluded.

#### Scenario: Generated attribution is inspected
- **WHEN** a Skill tree is rendered
- **THEN** every Python, prompt, schema, and Markdown asset is traceable to a reviewed source or ResearchSpec-authored contract
- **AND** unknown-origin content, logos, and external content are not copied or relicensed

### Requirement: Complete Tree Approval SHALL Gate Production
The preview renderer SHALL compose six complete trees containing `SKILL.md`,
Python resources, prompt or AgentSpec schemas, dependency metadata, and
source-to-output derivations. Review SHALL remain `pending-human-review` until
all trees are presented together and explicitly approved. Approval SHALL bind
the exact tree-set hash.

#### Scenario: Complete trees are ready
- **WHEN** catalogs, adapted resources, direct resources, and Skill content pass preview validation
- **THEN** six deterministic tree previews and one derivation manifest are rendered
- **AND** no production vendor output or registry change occurs

#### Scenario: Approval is absent or stale
- **WHEN** conversion is requested without approval of the current tree-set hash
- **THEN** it fails before staging any production file

### Requirement: FinRobot Maintenance SHALL Be Isolated
ResearchSpec SHALL wait until `audit-finrobot` is verified and archived and
complete-tree approval is recorded, then provide maintainer-only
`finrobot:convert`, `finrobot:check`, and `finrobot:idempotence` commands through
complete multi-vendor staging.

#### Scenario: FinRobot is regenerated
- **WHEN** a maintainer converts unchanged approved inputs
- **THEN** FinRobot outputs and the combined registry are deterministic
- **AND** the other three vendor projections remain byte-identical

#### Scenario: Another vendor is regenerated
- **WHEN** an existing converter runs with FinRobot published
- **THEN** FinRobot generated files remain byte-identical
- **AND** the combined registry retains all four reviewed vendors

### Requirement: Audit Archival SHALL Precede Production And Final Archival
ResearchSpec SHALL allow draft catalogs and complete-tree previews while
`audit-finrobot` remains active, but final admission locking, production
generation, and archival of `ingest-finrobot` SHALL require the verified archived
audit capability and immutable audit evidence.

#### Scenario: Audit is still active
- **WHEN** production apply or final ingest archival is attempted
- **THEN** the operation stops with the audit prerequisite identified
- **AND** preview trees remain available for review
