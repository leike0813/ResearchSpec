# finrobot-domain-skill-audit Specification

## Purpose

Define the immutable, evidence-backed audit of the pinned FinRobot snapshot and
keep audit findings separate from later production admission, adaptation, and
execution decisions.

## Requirements
### Requirement: Audit SHALL bind the official upstream snapshot
The audit SHALL identify `https://github.com/AI4Finance-Foundation/FinRobot.git` as its upstream, bind full revision `297a8d28d099be328c8a8eb658b4f782b93f3651`, use release identifier `snapshot-297a8d2`, and require a clean maintainer-only checkout at `vendor/finrobot`. The nested FinNLP gitlink SHALL remain uninitialized.

#### Scenario: Maintainer verifies provenance
- **WHEN** the audit is validated
- **THEN** checkout origin, exact revision, clean state, snapshot identifier, and uninitialized nested gitlink match the audited source

### Requirement: Audit SHALL inventory every tracked source entry
The machine audit SHALL contain one stably ordered `source_entries` record for each of the 146 tracked Git entries and no duplicate or unrecognized entry. Ordinary files and executables SHALL record reproducible content metadata; the FinNLP gitlink SHALL record its immutable object and external relationship without treating it as in-tree content.

#### Scenario: Source inventory is reproduced
- **WHEN** the pinned Git tree is compared with the audit
- **THEN** paths, kinds, modes, object IDs, file counts, hashes, and byte totals match one-to-one

### Requirement: Audit SHALL represent knowledge surfaces without inventing upstream Skills
The audit SHALL confirm that the pinned source contains zero `SKILL.md` files and SHALL use `knowledge_surfaces` rather than synthetic upstream `skills`. It SHALL cover prompt-bearing roles, orchestration prompts, financial-analysis templates, equity agents, text generators, deterministic financial methods, assumptions, and relevant configuration through safe paths and source symbols.

#### Scenario: Knowledge inventory is validated
- **WHEN** known FinRobot knowledge roots and selectors are enumerated
- **THEN** every resulting surface appears exactly once with kind, evidence, origin, risks, findings, scope disposition, and recommendation

### Requirement: Audit SHALL distinguish candidate capabilities from source surfaces
The audit SHALL aggregate evidence into exactly six non-production candidate capabilities: `financial-statement-analysis`, `company-fundamentals-analysis`, `corporate-risk-analysis`, `competitive-position-analysis`, `relative-valuation-analysis`, and `financial-news-impact-analysis`. Every candidate SHALL reference existing surfaces, carry a content-license review and ANZSRC metadata, and state future adaptation constraints.

#### Scenario: Candidate map is reviewed
- **WHEN** a reviewer examines a candidate capability
- **THEN** its source surfaces, evidence, readiness, overlap, prospective domains, license status, safety constraints, and recommendation are traceable without implying production admission

### Requirement: Audit SHALL preserve licensing and content-origin uncertainty
The audit SHALL record the root Apache-2.0 license and NOTICE separately from the conflicting MIT package metadata, the FinNLP external gitlink, AutoGen-attributed material, and imported content whose provenance is not established locally. Every source entry SHALL reference exactly one content-origin conclusion, and conflicting or unknown reusable content SHALL remain blocked for future ingestion.

#### Scenario: Root and package metadata conflict
- **WHEN** `LICENSE`, `NOTICE`, and `setup.py` are audited
- **THEN** the audit records an Apache-2.0 root claim and a conflicting MIT metadata claim rather than asserting a confirmed dual-license partition

#### Scenario: External or borrowed content is encountered
- **WHEN** FinNLP, AutoGen-attributed code, or unclear filing and marker source trees are reviewed
- **THEN** the audit records their external or unresolved origin and does not authorize copying or redistribution

### Requirement: Audit SHALL record implementation and documentation drift
Audit findings SHALL be derived from the pinned source rather than README or study claims. The audit SHALL record that the current valuation engine implements only EV/EBITDA, peer comparison, and simplified DCF calculation paths, and SHALL not claim absent React, Tauri, Rust, thirty-operator, DDM, LBO, WACC, or Monte Carlo implementations.

#### Scenario: Named capability claims are checked
- **WHEN** the source tree and valuation symbols are inspected
- **THEN** `IMPLEMENTATION-DOC-DRIFT` findings identify unsupported claims and the report describes only evidenced behavior

### Requirement: Audit SHALL record financial and operational risk evidence
The audit SHALL identify fixed assumptions, provider and credential bindings,
remote services, data freshness, code or command execution, deployment, trading,
portfolio action, personalized-use, and unsupported numeric-output risks. These
findings SHALL remain evidence for later production decisions and SHALL NOT by
themselves remove a candidate business capability.

#### Scenario: Simplified financial defaults are reviewed
- **WHEN** valuation, sensitivity, forecast, target, rating, or recommendation logic is audited
- **THEN** hard-coded assumptions and unsupported confidence or recommendation claims are findings rather than authoritative methods

#### Scenario: Future production is considered
- **WHEN** candidate capability constraints are reviewed
- **THEN** the audit grants no production or execution authority
- **AND** the separate ingestion change decides coupling, adaptation, provider use, executable-resource distribution, and form-safety controls

### Requirement: Audit classification SHALL NOT create production membership
Candidate capabilities MAY reference only `accounting-auditing-and-accountability` and `banking-finance-and-investment` as prospective domains. ANZSRC Field metadata SHALL be valid audit metadata and SHALL NOT create domain membership, a production vendor, package command, public CLI capability, or generated Skill.

#### Scenario: Audit change is completed
- **WHEN** all audit tasks are implemented
- **THEN** FinRobot remains absent from the Plugin registry, production vendor list, generated Skill tree, domain memberships, and package commands

### Requirement: Future ingestion SHALL remain separate and non-executing
Any production absorption SHALL occur through `ingest-finrobot` with explicit
admission, coupling, file, content-license, provider/resource, overlap, curation,
and source-neutral domain decisions. The audit SHALL NOT decide whether reviewed
scripts or adapters are distributable. A future converter, checker, packager,
and installer SHALL remain file-only and SHALL NOT execute generated resources,
install dependencies, read credentials, or contact services.

#### Scenario: Audit recommendations are available
- **WHEN** the audit is complete
- **THEN** candidate recommendations and constraints are available for a later ingestion change without fixing a production admission count

### Requirement: Maintainer inputs SHALL stay outside npm publication
Release verification SHALL reject npm package entries under `vendor/finrobot/` and `audits/`.

#### Scenario: Package contents are verified
- **WHEN** the npm tarball is inspected
- **THEN** neither the FinRobot source checkout nor maintainer-only audit evidence is published

