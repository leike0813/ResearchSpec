## MODIFIED Requirements

### Requirement: Plugin Command Group

The `plugin` command group SHALL provide domain discovery, installation, status, and uninstall operations but SHALL NOT expose a plugin-specific instruction API.

#### Scenario: Retired plugin instructions are requested
- **WHEN** a caller invokes `plugin instructions`
- **THEN** the CLI returns catalog-backed guidance to use `instructions procedure:<id>` and performs no write

#### Scenario: Domain catalog is listed outside a workspace
- **WHEN** a caller lists plugin domains outside a workspace
- **THEN** static domain discovery remains available

#### Scenario: Empty domain is not installable
- **WHEN** a caller selects an empty domain
- **THEN** installation is rejected without writes

#### Scenario: Installed unavailable domain remains recoverable
- **WHEN** an installed domain becomes unavailable
- **THEN** status and uninstall retain its resolution evidence

#### Scenario: Domain details expose provenance
- **WHEN** a domain is shown
- **THEN** its reviewed vendors and procedure identities are reported from catalog metadata

#### Scenario: Machine output distinguishes intent and projection
- **WHEN** plugin status is requested as JSON
- **THEN** configured domains, availability, and activation eligibility remain distinct fields

#### Scenario: Compact catalog views are requested
- **WHEN** plugin domains or vendors are listed
- **THEN** results remain bounded and omit procedure bodies

#### Scenario: Exact installed instructions are requested
- **WHEN** a caller needs an installed plugin procedure body
- **THEN** it uses `instructions procedure:<id>` rather than the plugin command group

### Requirement: Catalog-Backed Static CLI Discovery

The CLI SHALL expose bounded static procedure discovery through `list procedures [--query <text>]`, stable pagination, and `show procedure:<id>` without requiring a workspace. Discovery SHALL read packaged catalogs and files only and SHALL NOT execute procedure content.

#### Scenario: Procedures are listed globally
- **WHEN** a caller runs `list procedures` outside a workspace
- **THEN** the result returns compact cards with total, truncation, and opaque next cursor fields

#### Scenario: Procedure metadata is shown globally
- **WHEN** a caller runs `show procedure:<id>` outside a workspace
- **THEN** the result returns bounded metadata and supported modes without the full procedure body

#### Scenario: Root, command, and plugin help require no workspace
- **WHEN** help is requested for any public command path
- **THEN** catalog-backed usage remains available without workspace discovery

#### Scenario: Packaged handbook is derived static discovery
- **WHEN** the CLI handbook procedure is rendered
- **THEN** it uses the same command and payload catalogs as static help

### Requirement: Static Discovery Does Not Authorize Runtime Actions

Global procedure discovery SHALL remain read-only. `instructions procedure:<id>` SHALL require a current schema `"2"` workspace and SHALL validate plugin-domain selection before returning an executable packet.

#### Scenario: Activation is requested outside a workspace
- **WHEN** a caller requests procedure instructions without a current workspace
- **THEN** the CLI returns a workspace-required diagnostic without writing files

#### Scenario: Handbook precedes a runtime write
- **WHEN** handbook guidance leads to a requested graph mutation
- **THEN** the caller must still obtain current status and graph instructions

### Requirement: Runtime Inspection And Packing Match The Typed Catalog

`instructions` SHALL accept graph selectors, change selectors, and `procedure:<id>`. `show` SHALL accept profile, run, node, change, and procedure selectors. `pack` scopes SHALL remain unchanged and exclude ordinary external deliverables.

#### Scenario: Procedure instructions are requested
- **WHEN** a caller requests `instructions procedure:<id>` in a current workspace
- **THEN** the CLI returns one standalone activation packet

#### Scenario: Procedure metadata is requested
- **WHEN** a caller requests `show procedure:<id>`
- **THEN** the CLI returns bounded catalog metadata without activating it

#### Scenario: Change instructions are requested
- **WHEN** a caller requests `instructions change:<id>`
- **THEN** the CLI returns one bounded read-only change action packet

#### Scenario: Unsupported show selector is supplied
- **WHEN** a caller supplies an unsupported selector to `show`
- **THEN** the CLI returns catalog-backed usage guidance and performs no write

#### Scenario: One owner is packed
- **WHEN** a caller packs `run:<id>` or `change:<id>`
- **THEN** the archive contains only ResearchSpec-owned files for that owner

### Requirement: Public Runtime Selectors Are Graph-Only

Workflow-state discovery and mutation SHALL remain graph-only. Procedure selectors SHALL authorize semantic work over ordinary files but SHALL NOT become runtime selectors or workflow mutation owners.

#### Scenario: Standalone procedure selector is used
- **WHEN** a caller obtains `instructions procedure:<id>`
- **THEN** no run, node, Gate, Decision, or handoff selector is created or mutated

#### Scenario: Run is started
- **WHEN** a user starts a confirmed profile entry
- **THEN** the CLI creates one graph run and returns its run selector

#### Scenario: Node selector is requested outside a run
- **WHEN** node instructions target a non-current run
- **THEN** the CLI returns a current-run diagnostic without writes

#### Scenario: Retired selector is supplied
- **WHEN** a retired runtime selector family is supplied
- **THEN** the CLI returns current graph and procedure selector guidance

### Requirement: Node Instructions Expose A Bounded Card

`instructions node:<run>/<node>` SHALL return the existing versioned node card plus a graph-mode activation packet for the node's capability procedure. The packet SHALL contain only the eligible node's executable contract and exact completion selector.

#### Scenario: Eligible node card is requested
- **WHEN** a caller requests instructions for a currently eligible capability node
- **THEN** the response includes the node card and the shared procedure packet in graph mode
- **AND** it does not embed a successor plan

#### Scenario: Node card is generated from the typed catalog
- **WHEN** help or the handbook renders node instructions
- **THEN** it documents the same card and activation-packet fields used at runtime
