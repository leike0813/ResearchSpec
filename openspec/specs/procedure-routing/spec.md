## Purpose

Provide deterministic, token-bounded discovery and on-demand activation of ResearchSpec procedures without making the host-visible Skill catalog an execution whitelist.

## Requirements

### Requirement: Runtime-Derived Procedure Catalog

ResearchSpec SHALL derive one procedure catalog at runtime from the ARSU workflow catalog, Companion catalog, core capability registry, and plugin extension registry. It SHALL NOT persist a second manually maintained procedure index or hard-code catalog counts.

#### Scenario: Catalog is loaded
- **WHEN** procedure discovery is requested
- **THEN** every current ARSU workflow, hidden Companion, core capability, and plugin extension capability appears exactly once under its existing stable identity

### Requirement: Three-Stage Progressive Disclosure

Procedure discovery SHALL expose compact candidate cards first, one selected procedure body second, and declared package resources only when the Agent needs them. Search SHALL be deterministic, lexical, offline, and bounded to ten candidates by default.

#### Scenario: Natural-language query is searched
- **WHEN** a caller lists procedures with query terms
- **THEN** results are ranked by exact identity or title match, all-token match, partial match, and stable identity tie-break
- **AND** the response contains candidate metadata rather than procedure bodies or resources

#### Scenario: One procedure is inspected
- **WHEN** a caller shows `procedure:<id>`
- **THEN** the response contains its metadata, supported activation modes, domain and profile associations without its full body

### Requirement: Shared Versioned Activation Packet

Standalone procedure instructions and graph-node instructions SHALL return schema-versioned packets built from the same validated package content. A packet SHALL identify activation mode, procedure identity and kind, title, full procedure content and SHA-256, workspace, resolved inputs and outputs, authority, package root, declared resource references and hashes, and mode-specific completion.

#### Scenario: Same package is activated in two modes
- **WHEN** a procedure is requested directly and through a graph node
- **THEN** both packets contain the same procedure identity, content, package root, resources, and content hash
- **AND** authority, resolved inputs, and completion instructions reflect their activation modes

### Requirement: Standalone Activation Is Stateless And Open-World

Standalone activation SHALL require a current schema `"2"` workspace, MAY read and write ordinary project files outside `researchspec/`, and SHALL NOT create or mutate runs, nodes, handoffs, Gates, Decisions, profiles, or workflow state. Procedures MAY compose by passing explicit ordinary file paths. If no procedure matches, Navigate SHALL permit host-native Agent work clearly identified as outside a governed ResearchSpec run.

#### Scenario: Bounded one-shot work is requested
- **WHEN** the request does not need persistence, resume, formal controls, parallel joins, or audit state
- **THEN** Navigate may return one standalone procedure packet whose completion returns ordinary output paths to the caller

#### Scenario: Standalone work reaches a formal Gate rule
- **WHEN** a directly activated procedure contains findings relevant to a formal Gate
- **THEN** it may produce working evidence but SHALL NOT claim that the Gate was completed or confirmed

#### Scenario: No procedure matches
- **WHEN** deterministic discovery returns no suitable procedure
- **THEN** Navigate may continue with native Agent capabilities
- **AND** it SHALL state that the work is not a governed ResearchSpec run

### Requirement: Graph Activation Retains Closed-World Authority

Requests needing persistence, resume, formal Gates or Decisions, parallel or joined work, or auditable workflow state SHALL use graph activation. Graph packets SHALL retain the existing frozen-graph eligibility, role resolution, handoff, validation, and exact advance-selector rules.

#### Scenario: Governed work is requested
- **WHEN** the user's intent requires any graph-owned lifecycle feature
- **THEN** Navigate routes through profile and node selectors
- **AND** no procedure packet expands the frozen graph's legal frontier

### Requirement: Domain Selection Gates Plugin Activation

Plugin procedures SHALL be globally discoverable. Direct or graph activation SHALL fail with a structured domain-selection-required diagnostic unless at least one owning domain is selected and currently available. Discovery SHALL NOT imply installation consent.

#### Scenario: Unselected plugin procedure is requested
- **WHEN** a caller activates a globally discovered plugin procedure whose owning domains are not selected
- **THEN** ResearchSpec returns its eligible domain IDs and a domain-selection-required diagnostic without changing configuration

### Requirement: Activation Packets Recommend At Most One Native Role

Schema `"1"` standalone and graph activation packets SHALL include an advisory `delegation` object with `recommended_agent` and `reason`. A Procedure with no manifest SHALL use `coordinator`; a non-`llm` Procedure SHALL use `non-llm`; a Procedure with no declared outputs SHALL use `reference-only`; an eligible producer SHALL recommend `researchspec-executor` with `llm-producer`; and an eligible checker or observer SHALL recommend `researchspec-reviewer` with `llm-independent-review`. Reasons that do not recommend a role SHALL set `recommended_agent` to null.

#### Scenario: Pure-LLM producer packet is built
- **WHEN** either activation mode builds a packet for an `llm` producer with declared outputs
- **THEN** it recommends `researchspec-executor` for `llm-producer`

#### Scenario: Pure-LLM review packet is built
- **WHEN** either activation mode builds a packet for an `llm` checker or observer with declared outputs
- **THEN** it recommends `researchspec-reviewer` for `llm-independent-review`

#### Scenario: Procedure is not safely delegable
- **WHEN** a Procedure is `mixed`, `script`, outputless, or has no capability manifest
- **THEN** the packet recommends no native role
- **AND** its reason identifies `non-llm`, `reference-only`, or `coordinator` respectively
