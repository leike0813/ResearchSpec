## Purpose

Provide deterministic, token-bounded discovery and on-demand activation of ResearchSpec procedures without making the host-visible Skill catalog an execution whitelist.

## Requirements

### Requirement: Runtime-Derived Procedure Catalog

ResearchSpec SHALL derive one procedure catalog at runtime from the ARSU workflow catalog, Companion catalog, core capability registry, and plugin extension registry. It SHALL NOT persist a second manually maintained procedure index or hard-code catalog counts.

#### Scenario: Catalog is loaded
- **WHEN** procedure discovery is requested
- **THEN** every current ARSU workflow, hidden Companion, core capability, and plugin extension capability appears exactly once under its existing stable identity

### Requirement: Three-Stage Progressive Disclosure

Procedure discovery SHALL expose compact candidate cards first, one selected procedure body second, and declared package resources only when needed. Search SHALL accept original Unicode natural-language requests, support bilingual offline retrieval and optional local semantic rank fusion, and return at most ten candidates by default. Candidates SHALL include declared input/output roles and query-match evidence without implying activation eligibility.

#### Scenario: Natural-language query is searched
- **WHEN** a caller lists procedures with a Chinese, English or mixed natural-language request
- **THEN** discovery ranks candidates from the runtime-derived catalog without requiring Agent translation
- **AND** it returns metadata, matched fields and terms, effective retrieval mode and any fallback reason rather than procedure bodies

#### Scenario: Exact procedure identity is requested
- **WHEN** a query is an exact procedure ID or selector
- **THEN** that procedure ranks first independently of semantic similarity

#### Scenario: Browsing and invalid queries are distinguished
- **WHEN** no query is supplied
- **THEN** discovery browses the catalog in stable ID order
- **WHEN** an explicitly supplied query has no meaningful content
- **THEN** discovery returns a structured query diagnostic rather than browsing

#### Scenario: Offline retrieval has no match
- **WHEN** a meaningful offline query matches no catalog metadata
- **THEN** discovery returns no candidates rather than unrelated catalog entries

#### Scenario: One procedure is inspected
- **WHEN** a caller shows `procedure:<id>`
- **THEN** the response contains its metadata, declared roles, supported activation modes, domain and profile associations without its full body

### Requirement: Search Pagination Binds Its Retrieval Context

Procedure query pagination SHALL bind the query, catalog content identity, effective retrieval backend and ordered candidate identities. A change to this context SHALL invalidate an earlier cursor using the existing stale-cursor diagnostic.

#### Scenario: Query changes between pages
- **WHEN** a cursor from one query is supplied with a different query or retrieval backend
- **THEN** discovery reports a stale cursor rather than mixing candidate pages

### Requirement: Shared Versioned Activation Packet

Standalone procedure instructions and graph-node instructions SHALL return schema-versioned packets built from the same validated package content. A packet SHALL identify activation mode, procedure identity and kind, title, full procedure content and SHA-256, workspace, resolved inputs and outputs, authority, package root, declared resource references and hashes, and mode-specific completion.

#### Scenario: Same package is activated in two modes
- **WHEN** a procedure is requested directly and through a graph node
- **THEN** both packets contain the same procedure identity, content, package root, resources, and content hash
- **AND** authority, resolved inputs, and completion instructions reflect their activation modes

### Requirement: Standalone Activation Is Stateless And Open-World

Standalone activation SHALL require a current schema `"2"` workspace, MAY read and write ordinary project files outside `researchspec/`, including plain task notes under `work/researchspec-notes/`, and SHALL NOT create or mutate runs, nodes, handoffs, Gates, Decisions, profiles, or workflow state. Procedures MAY compose by passing explicit ordinary file paths. If no procedure matches, Navigate SHALL permit host-native Agent work clearly identified as outside a governed ResearchSpec run.

#### Scenario: Bounded one-shot work is requested
- **WHEN** the request does not need formal controls, parallel joins, or audit state
- **THEN** Navigate may return one standalone procedure packet whose completion returns ordinary output paths to the caller

#### Scenario: Sustained ordinary work is recorded outside the workspace
- **WHEN** standalone work spans sessions
- **THEN** continuity is carried by an ordinary task note outside `researchspec/`
- **AND** no run, node, or handoff state is created for that continuity

#### Scenario: Standalone work reaches a formal Gate rule
- **WHEN** a directly activated procedure contains findings relevant to a formal Gate
- **THEN** it may produce working evidence but SHALL NOT claim that the Gate was completed or confirmed

#### Scenario: No procedure matches
- **WHEN** deterministic discovery returns no suitable procedure
- **THEN** Navigate may continue with native Agent capabilities
- **AND** it SHALL state that the work is not a governed ResearchSpec run

### Requirement: Graph Activation Retains Closed-World Authority

Requests needing formal Gates or Decisions, parallel or joined work, revision rounds, or auditable workflow state SHALL use graph activation. Persistence and continuation alone SHALL NOT require graph activation. An unfinished related run SHALL take precedence over standalone task-note continuation; a completed historical run SHALL NOT. Graph packets SHALL retain the existing frozen-graph eligibility, role resolution, handoff, validation, and exact advance-selector rules.

#### Scenario: Governed work is requested
- **WHEN** the user's intent requires any graph-owned lifecycle feature
- **THEN** Navigate routes through profile and node selectors
- **AND** no procedure packet expands the frozen graph's legal frontier

#### Scenario: Continuity alone does not enter a graph
- **WHEN** the only reason to persist is that the user expects to continue the work later
- **THEN** Navigate keeps the work standalone with an ordinary task note
- **AND** it does not create a run

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
