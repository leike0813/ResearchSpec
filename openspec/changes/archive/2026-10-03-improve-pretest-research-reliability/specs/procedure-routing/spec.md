## MODIFIED Requirements

### Requirement: Three-Stage Progressive Disclosure

Procedure discovery SHALL expose compact candidate cards first, one selected procedure body second, and declared package resources only when needed. Search SHALL accept original Unicode natural-language requests, support bilingual offline retrieval and optional local semantic rank fusion, and return at most ten candidates by default. Candidates SHALL include declared input/output roles, query-match evidence and explicit static workspace/domain eligibility facts without implying execution permission or complete activation validity.

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
- **THEN** the response contains its metadata, declared roles, supported activation modes, domain and profile associations and static eligibility without its full body

## ADDED Requirements

### Requirement: Cards Expose Static Workspace Eligibility

Procedure cards SHALL distinguish a required workspace, satisfied static selection conditions, a required domain selection, an unavailable selected domain, and unknown conditions. Discovery, inspection and activation SHALL reuse domain selection rules. Eligibility SHALL NOT grant consent or guarantee full activation validity, and SHALL NOT hide or rerank global candidates.

#### Scenario: Unselected plugin appears in discovery
- **WHEN** a plugin Procedure is discovered in a workspace without a selected owning domain
- **THEN** its card identifies the selection requirement and preserves its relevance rank

#### Scenario: Discovery occurs outside a workspace
- **WHEN** procedures are listed without a workspace
- **THEN** global discovery remains available and cards identify that activation requires a workspace

### Requirement: Pagination Includes Selection Context

Procedure pagination SHALL include its static workspace selection context in the existing cursor fingerprint in addition to retrieval context.

#### Scenario: Domain selection changes between pages
- **WHEN** workspace domain selection changes after a Procedure page was read
- **THEN** the old cursor is rejected rather than combining conflicting eligibility facts

### Requirement: Packets Carry Optional Standalone Material Context

Standalone activation packets SHALL carry supplied material bindings and their input/planned-output inspection as optional packet fields. Existing graph input resolution and completion authority SHALL remain governed by the frozen graph.

#### Scenario: Independent worker receives explicit context
- **WHEN** Navigate delegates a standalone packet with supplied materials
- **THEN** the worker receives the concrete role bindings and distinguishes inspected facts from semantic adequacy
