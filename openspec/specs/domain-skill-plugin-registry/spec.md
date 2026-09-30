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

#### Scenario: Vendor update does not move domain membership
- **WHEN** the pinned ToolUniverse release changes and the admitted Skill set stays the same
- **THEN** domain membership SHALL remain the reviewed projection of that set
- **AND** no new public domain, command, wrapper or registry schema version SHALL be introduced by the update

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

Plugin installation, update, and uninstall SHALL operate on the current schema 2 graph workspace.
Selection intent SHALL remain in `config.yaml.plugins.selected`; generated plugin Skill files and
per-domain resolution snapshots SHALL be reconciled through `tool-installation-manifest.json`.
Install and update SHALL use exact domain IDs and generated-file drift protection; explicit
uninstall SHALL fail closed when any scheduled plugin file has user modifications.

#### Scenario: Graph workspace install projects the selected closure

- **WHEN** exact domain IDs are installed in a schema 2 workspace with configured skill-capable tools
- **THEN** every configured tool SHALL receive the sorted union of direct and transitive selected-domain Skills
- **AND** each projected file SHALL be recorded as manifest-owned `domain-skill` evidence
- **AND** the manifest SHALL be committed after the generated files

#### Scenario: Graph init or update synchronizes prior selections

- **WHEN** `init` reconfiguration or `update` changes tool or delivery selection in a workspace with available selected domains
- **THEN** every newly configured skill-capable tool SHALL receive the current selected-domain Skill closure
- **AND** obsolete project-local plugin files SHALL be removed only when hash-clean

#### Scenario: Unavailable selection blocks projection refresh

- **WHEN** `plugin update` or graph init/update encounters a selected domain that is missing or empty
- **THEN** projection refresh SHALL fail with `plugin_unavailable`
- **AND** prior plugin files and the last resolution snapshot SHALL be preserved

#### Scenario: Explicit uninstall contains drift

- **WHEN** `plugin uninstall` would remove a manifest-owned plugin file whose bytes differ from the recorded hash
- **THEN** the uninstall SHALL fail without changing generated files or the workspace selection
- **AND** the modified file SHALL be preserved

### Requirement: Plugin Core Authority Boundary

Domain Skills SHALL remain advisory and SHALL NOT own or directly modify stable specs, graph profiles,
runs, node instances, Gates, Decisions, transitions, or handoffs.

#### Scenario: Plugin helps a capability node

- **WHEN** a selected domain Skill returns semantic assistance while a graph node is being executed
- **THEN** the result SHALL return to the current capability procedure for integration and validation
- **AND** the graph frontier, node state, Gates, and Decisions SHALL remain unchanged

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
`snapshot-2717499` bundle as an isolated fourth vendor with six globally unique
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
- **THEN** the reviewed Education procedures become eligible through the domain registry without host Skill projection
- **AND** the one-Skill Navigate base surface, configured Navigate wrappers, and sixteen public commands remain unchanged

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

`plugin instructions <skill-id>` SHALL return an exact read-only instruction packet only for a
Skill in the current graph workspace selected-domain closure when the registry entry is available,
every configured skill-capable tool has the complete manifest-owned hash-clean projection, and the
packaged `SKILL.md` matches its validated entry hash.

#### Scenario: Installed graph-workspace Skill is immediately usable

- **WHEN** the selected-domain closure resolves the Skill and every configured skill-capable tool holds the complete projection
- **THEN** the command SHALL return the exact packaged `SKILL.md`, entry SHA-256, resources, providing domain IDs, projected tools, and the advisory authority boundary
- **AND** it SHALL execute no plugin resource or dependency

#### Scenario: Graph-workspace projection is unsafe

- **WHEN** the Skill is unselected, unavailable, missing, unprojected, or drifted
- **THEN** the instruction request SHALL fail with a stable diagnostic
- **AND** no unavailable snapshot SHALL authorize invocation

#### Scenario: Intent is saved without tool projection

- **WHEN** a domain is installed while no skill-capable tool is configured
- **THEN** config and resolution snapshots SHALL be written without Skill files
- **AND** `plugin instructions` SHALL report `plugin_not_projected` until a skill-capable tool receives the projection

### Requirement: Graph Workspace Plugin Status And Check

Graph `status --json` SHALL expose selected, available, unavailable, projected, and resolved-Skill
plugin state derived from the current config, installation manifest, and bundled registry. `check
plugins` SHALL statically validate the selected-domain registry entries, resolution snapshots,
manifest ownership, and projected file hashes without executing plugin resources.

#### Scenario: Status distinguishes intent from projection

- **WHEN** graph status reads a workspace with selected domains and configured skill-capable tools
- **THEN** its `plugins` object SHALL distinguish selected domains, available domains, unavailable selections, resolved Skill IDs, and projected domains
- **AND** plugin status failure SHALL be reported as a non-blocking diagnostic

#### Scenario: No plugin domain is selected

- **WHEN** graph status reads a workspace with no selected plugin domains
- **THEN** resolved and projected extension capability/profile ID arrays SHALL be empty
- **AND** the status request SHALL not load extension package resources or profiles

#### Scenario: Check plugins verifies complete projection

- **WHEN** `check plugins` runs on a workspace whose selected-domain closure is fully manifest-owned and hash-clean
- **THEN** the command SHALL pass without plugin diagnostics

#### Scenario: Check plugins reports missing or drifted files

- **WHEN** a projected plugin file is missing from a configured tool or is not manifest-owned
- **THEN** `check plugins` SHALL return a blocking diagnostic
- **AND** when a manifest-owned projected file has user modifications
- **THEN** `check plugins` SHALL return a non-blocking drift diagnostic that becomes blocking with `--strict`

### Requirement: Plugin Graph Extension Registry Foundation

ResearchSpec SHALL distribute a schema 1 graph-extension registry under
`skills/plugins/extensions/registry.json` containing a registry version, capability package entries,
graph profile entries, and stable domain assignments. Each capability entry SHALL bind a safe
relative source path and manifest SHA-256; each profile entry SHALL bind a safe relative source path
and profile SHA-256.

#### Scenario: Extension registry is loaded

- **WHEN** the bundled plugin extension registry is loaded
- **THEN** every capability package SHALL parse as capability manifest schema 1 with matching
  capability ID, non-empty `SKILL.md`, and hash-clean knowledge refs
- **AND** every profile SHALL parse as capability graph profile schema 2 with matching profile ID and
  hash
- **AND** every domain assignment SHALL reference only registered capabilities and profiles

#### Scenario: Extension graph references are validated

- **WHEN** a plugin profile references a capability ID
- **THEN** the reference SHALL resolve in the plugin extension registry or the base capability
  registry
- **AND** unknown references SHALL fail registry validation

#### Scenario: Extension IDs avoid collisions

- **WHEN** `check plugins` resolves selected-domain extensions
- **THEN** a plugin extension capability ID SHALL NOT collide with a bundled base capability ID or a
  raw plugin Skill ID
- **AND** collision SHALL be a blocking diagnostic

#### Scenario: Domain discovery exposes extension counts

- **WHEN** `plugin list` or `plugin show` inspects a domain with graph-extension assignments
- **THEN** summary output SHALL expose the assigned capability count and profile count
- **AND** raw advisory Skill counts SHALL remain separate from graph-extension counts

### Requirement: Graph Extension Projection Ownership

Selected domain graph extensions SHALL be projected through the same plugin lifecycle reconciliation as raw plugin Skills. Extension capability files SHALL be manifest-owned agent-tool installations with kind `plugin-capability`; extension graph profiles SHALL be manifest-owned framework installations with kind `plugin-profile` under `researchspec/profiles/`.

#### Scenario: Domain install projects graph extensions

- **WHEN** a domain with graph-extension assignments is installed and skill-capable tools are configured
- **THEN** every configured tool SHALL receive the complete extension capability package files
- **AND** the workspace SHALL receive the assigned graph profile file
- **AND** the manifest SHALL record both projection kinds with content hashes

#### Scenario: Extension projection obeys drift and uninstall rules

- **WHEN** an extension file or profile has user modifications during refresh or uninstall
- **THEN** refresh SHALL preserve and report the modified file
- **AND** explicit uninstall SHALL fail closed without changing the selection or removing the modified file

#### Scenario: Domain snapshots include extension closures

- **WHEN** an available domain with graph extensions is selected
- **THEN** its `plugin_resolutions` snapshot SHALL include `resolved_skill_ids`, `resolved_capability_ids`, and `resolved_profile_ids`
- **AND** unavailable selected domains SHALL retain their last complete snapshot

### Requirement: Plugin lifecycle validates managed target boundaries

Plugin install, update and uninstall SHALL enforce the shared managed-installation path and filesystem boundary rules for raw Skills, extension capabilities and extension profiles. Validation SHALL occur before target hash reads and removal planning, including for records whose source is no longer admitted by the current registry. A valid content hash SHALL NOT substitute for target authorization.

#### Scenario: Unavailable plugin can be retired within its namespace
- **WHEN** an unavailable plugin has valid saved ownership records for regular files inside its tool and source namespace
- **THEN** uninstall can retire hash-clean project projections under the existing selection and drift rules

#### Scenario: Plugin profile record claims an ordinary file
- **WHEN** a plugin-profile record points outside its corresponding profile destination
- **THEN** lifecycle planning returns a blocking diagnostic and produces no removal for that record
- **AND** the lifecycle mutation preserves config, manifest and projected files
