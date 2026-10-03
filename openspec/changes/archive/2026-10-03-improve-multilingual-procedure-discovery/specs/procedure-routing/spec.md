## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Search Pagination Binds Its Retrieval Context

Procedure query pagination SHALL bind the query, catalog content identity, effective retrieval backend and ordered candidate identities. A change to this context SHALL invalidate an earlier cursor using the existing stale-cursor diagnostic.

#### Scenario: Query changes between pages
- **WHEN** a cursor from one query is supplied with a different query or retrieval backend
- **THEN** discovery reports a stale cursor rather than mixing candidate pages
