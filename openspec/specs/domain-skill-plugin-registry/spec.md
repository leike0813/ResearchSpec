## Purpose

Define the bundled domain Skill plugin registry, workspace plugin lifecycle, and
authority boundary for optional package-owned Skill extensions.

## Requirements

### Requirement: Vendor And Domain Registry Schema 1
ResearchSpec SHALL distribute one Schema 1 registry containing taxonomy metadata, `vendors`, and `domains`; vendors SHALL own Skill definitions and immutable provenance while typed discipline or tool domains SHALL own stable versioned direct Skill ID lists, including valid empty internal domains.

#### Scenario: Multi-vendor domain is valid
- **WHEN** a non-empty domain references globally unique Skills owned by more than one registered vendor
- **THEN** registry validation SHALL accept the domain
- **AND** each Skill root SHALL remain derived from its vendor ID and Skill ID

#### Scenario: Typed domain metadata is valid
- **WHEN** a discipline or tool domain is validated
- **THEN** a discipline domain SHALL declare one canonical ANZSRC Group code
- **AND** a tool domain SHALL NOT declare an ANZSRC Group code

### Requirement: Dependency Graph Integrity
Every vendor Skill SHALL declare a dependency list whose targets are globally registered Skill IDs; self-dependencies and unknown targets SHALL be rejected and cycles SHALL resolve finitely with a diagnostic.

#### Scenario: Cross-domain dependency closure is resolved
- **WHEN** a selected domain member requires a Skill owned by another vendor or listed in another domain
- **THEN** the resolver SHALL include the required Skill and its transitive dependencies exactly once

### Requirement: Stable Overlapping Domain Catalog
ResearchSpec SHALL provide one source-neutral catalog containing all 213 ANZSRC Group domains and five ResearchSpec tool domains whose reviewed membership lists may be empty or overlap without duplicating Skill assets.

#### Scenario: ToolUniverse domain membership is assembled
- **WHEN** the audited ToolUniverse bundle and domain catalog are assembled
- **THEN** all 130 admitted Skills SHALL remain reachable from at least one non-empty domain
- **AND** the public catalog SHALL initially contain 28 discipline and two tool domains

### Requirement: Open Agent Skills Content Validation
Each registered Skill SHALL conform to the supported Open Agent Skills `SKILL.md` frontmatter and SHALL keep its declared name, registry Skill ID, and directory name equal.

#### Scenario: Complete Skill resources are accepted
- **WHEN** a valid Skill contains `scripts`, `references`, `assets`, or other resource files
- **THEN** validation SHALL accept the resource tree without restricting script language or dependencies
- **AND** delivery SHALL copy every resource byte-for-byte

#### Scenario: Invalid Skill metadata is rejected
- **WHEN** `SKILL.md` is missing, frontmatter is invalid, required fields are missing, or its name differs from the Skill ID
- **THEN** registry validation SHALL fail before projection

### Requirement: Derived Skill Licensing
A registered Skill derived from a third-party source SHALL retain the applicable license and a `NOTICE.md` alongside its Skill content.

#### Scenario: Derived Skill attribution is complete
- **WHEN** a registered Skill has upstream provenance
- **THEN** its derived Skill root SHALL contain `LICENSE` and `NOTICE.md`
- **AND** those files SHALL use the normal manifest ownership and drift rules

### Requirement: Workspace Plugin Lifecycle
Plugin installation and update SHALL use exact domain IDs, explicit consent and generated-file drift
protection without binding ordinary execution to a generic runtime `plan_sha256`.

#### Scenario: Non-interactive plugin installation is approved
- **WHEN** exact domain IDs and `--yes` are supplied after preview
- **THEN** ResearchSpec reconciles only plugin-owned static projections

### Requirement: Plugin Core Authority Boundary
Domain Skills SHALL remain advisory and SHALL NOT own or directly modify stable specs, routes,
subflow controls, Gates, Decisions, transitions or handoffs.

#### Scenario: Plugin helps an ARSU producer
- **WHEN** a selected domain Skill returns semantic assistance
- **THEN** the result returns to the original producer without changing the workflow frontier

### Requirement: Offline Maintainer-Owned Distribution
ResearchSpec SHALL consume no upstream repository or remote plugin registry during user runtime.

#### Scenario: Plugin catalog is inspected or projected
- **WHEN** a user lists, shows, installs, or updates a plugin
- **THEN** all catalog metadata and Skill bytes SHALL come from the installed ResearchSpec package
- **AND** `curated` or `converted` SHALL remain provenance only

### Requirement: Reviewed Scientific Agent Skills Vendor
Registry Schema 1 SHALL represent the admitted Scientific Agent Skills v2.53.0 bundle as an isolated second vendor with vendor-prefixed global Skill IDs, verified Skill-level licenses, immutable provenance, and reviewed dependency arrays.

#### Scenario: Combined registry is assembled
- **WHEN** the central assembler loads the ToolUniverse and Scientific Agent Skills bundles
- **THEN** every global Skill ID is unique
- **AND** every domain member and dependency resolves to an available generated Skill
- **AND** no excluded or unreviewed Scientific Agent Skill appears in the registry

### Requirement: Domain-Only Multi-Vendor Installation
Scientific Agent Skills SHALL be installable only through existing domain selections, and the resolved installation SHALL deduplicate all transitive required Skills across vendors without adding command wrappers.

#### Scenario: Domain spans vendors
- **WHEN** a user installs a domain containing reviewed Skills from both vendors
- **THEN** every configured Agent tool receives the same dependency-resolved Skill trees
- **AND** the workspace records only the selected domain
- **AND** wrapper count remains fixed at eight on command-capable tools

### Requirement: Reviewed Materials-Science-Skills Vendor
Registry Schema 1 SHALL represent the admitted Materials-Science-Skills-For-LLM `snapshot-fafd3ab` bundle as an isolated third vendor with globally unique vendor-prefixed Skill IDs, immutable provenance, reviewed empty dependency arrays, and explicit source-neutral domain memberships.

#### Scenario: Three-vendor registry is assembled
- **WHEN** the central assembler loads the Materials, Scientific Agent Skills, and ToolUniverse bundles
- **THEN** vendors appear in that stable order and every Skill ID is globally unique
- **AND** exactly seven Materials Skills are reachable from reviewed domains
- **AND** no excluded Materials Skill or hard dependency appears in the registry

#### Scenario: Materials membership is reviewed
- **WHEN** a Materials Skill uses GPU, scheduler, remote-service, or HPC mechanics
- **THEN** membership is based only on its scientific meaning
- **AND** infrastructure use alone does not add `research-computing-infrastructure`

### Requirement: Reviewed FinRobot Vendor SHALL Be The Fourth Vendor
Registry Schema 1 SHALL represent the approved FinRobot
`snapshot-297a8d2` bundle as an isolated fourth vendor with six globally unique
neutral Skill IDs, immutable provenance, empty hard-dependency arrays,
advisory-only relations, and explicit source-neutral domain memberships.

#### Scenario: Four-vendor registry is assembled
- **WHEN** the central assembler loads all published bundles
- **THEN** vendors appear in stable dictionary order as FinRobot, Materials,
  Scientific Agent Skills, and ToolUniverse
- **AND** exactly six FinRobot Skills are reachable from reviewed domains
- **AND** no excluded source surface or hard dependency appears

#### Scenario: Domain collection is projected
- **WHEN** a user installs a reviewed finance domain
- **THEN** membership projects the approved independent Skills
- **AND** advisory Skill relationships do not change installation closure

### Requirement: Reviewed HistAgent Vendor SHALL Be The Fifth Vendor
Registry Schema 1 SHALL represent the approved HistAgent `snapshot-47bbe21` bundle as an isolated fifth vendor with three globally unique Skill IDs, immutable provenance, empty hard-dependency arrays, advisory-only relationships, complete mixed-license attribution, and explicit source-neutral domain memberships.

#### Scenario: Five-vendor registry is assembled
- **WHEN** the central assembler loads all published bundles
- **THEN** vendors appear in stable dictionary order as FinRobot, HistAgent, Materials-Science-Skills-For-LLM, Scientific Agent Skills, and ToolUniverse
- **AND** exactly three HistAgent Skills are reachable from reviewed domains
- **AND** no excluded HistAgent surface or hard dependency appears

#### Scenario: Historical domain collection is projected
- **WHEN** a user installs a reviewed historical discipline domain
- **THEN** membership projects the approved independent HistAgent Skills
- **AND** advisory Skill relationships do not change installation closure

### Requirement: Reviewed Education Agent Skills Vendor SHALL Be The Sixth Vendor
Registry Schema 1 SHALL represent the approved `snapshot-32fce5c` Education
Agent Skills bundle as an isolated sixth vendor with 136 globally unique
vendor-prefixed Skills, immutable provenance, CC BY-SA 4.0 attribution, empty
hard-dependency arrays, and advisory-only relationships.

#### Scenario: Six-vendor registry is assembled
- **WHEN** the approved Education bundle and source-neutral catalog are assembled
- **THEN** all 136 admitted Skills SHALL be reachable from reviewed education domains
- **AND** none of the 29 excluded Skills or 813 advisory relationships SHALL enter the hard dependency graph

#### Scenario: Education domain is installed
- **WHEN** a user selects one of the three reviewed education domains
- **THEN** configured Agent tools receive the direct approved Skill trees
- **AND** the fixed eight base Skills, eight wrappers, and sixteen public commands remain unchanged

### Requirement: Packaged Skill Discovery Metadata
ResearchSpec SHALL derive each registered Skill's semantic description and entry
SHA-256 directly from its validated packaged `SKILL.md` without changing
Registry Schema 1.

#### Scenario: Compact Skill metadata is requested
- **WHEN** runtime discovery inspects an available domain
- **THEN** each direct and resolved Skill SHALL expose its ID, description,
  dependencies, and entry SHA-256 from the packaged Skill tree
- **AND** the Skill Browser Harness SHALL use the same metadata parser

### Requirement: Read-Only Installed Skill Instructions
ResearchSpec SHALL return an exact read-only instruction packet only for a Skill
in the selected, available, fully projected, hash-clean domain closure.

#### Scenario: Installed Skill is immediately usable
- **WHEN** every configured tool has the complete manifest-owned Skill tree with
  matching hashes
- **THEN** `plugin instructions <skill-id>` SHALL return the exact `SKILL.md`,
  entry hash, resources, domain IDs, projected tools, and advisory boundary
- **AND** it SHALL execute no resource or dependency

#### Scenario: Skill projection is unsafe
- **WHEN** the Skill is unselected, unavailable, missing, unprojected, or drifted
- **THEN** the instruction request SHALL fail with a stable diagnostic
- **AND** saved unavailable snapshots SHALL not authorize invocation
