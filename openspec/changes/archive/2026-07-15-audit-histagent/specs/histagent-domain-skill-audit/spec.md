## ADDED Requirements

### Requirement: Audit SHALL bind the official untagged snapshot
The audit SHALL identify `https://github.com/CharlesQ9/HistAgent` as upstream, bind revision `47bbe21dc81618489f5d5929358032883a3fe448`, use `snapshot-47bbe21`, and require a clean maintainer-only checkout at `vendor/histagent` with no tag at HEAD.

#### Scenario: Maintainer verifies source provenance
- **WHEN** the audit source is validated
- **THEN** origin, exact revision, clean state, absent tag, snapshot label, and Apache-2.0 root license evidence match the machine audit

### Requirement: Audit SHALL inventory every tracked entry
The machine audit SHALL contain one stably ordered record for each of the 120 tracked files. Each record SHALL contain path, kind, Git mode, object ID, byte count, SHA-256, content-origin reference, and exactly one of `retain`, `adapt`, `replace`, `exclude`, or `confirmed-failure`.

#### Scenario: Source inventory is reproduced
- **WHEN** the Git tree is compared with the audit
- **THEN** all 120 paths, modes, object IDs, counts, byte sizes, and non-sensitive file hashes match one-to-one
- **AND** the canonical 120-line hash manifest produces `04a05d13194092009a10cb606d7a51a1bb851f5138e3680faa6a105839f34d02`

### Requirement: Audit SHALL not expose the Cookie payload
The `scripts/cookies.py` record SHALL contain only safe inventory metadata, an origin reference, and disposition `confirmed-failure`. The audit, report, schema, and tests SHALL NOT contain or inspect Cookie names, domains, values, headers, or payload fragments.

#### Scenario: Cookie failure is reviewed
- **WHEN** the source entry and security finding are validated
- **THEN** only path, Git metadata, byte count, SHA-256, origin, and `confirmed-failure` are available
- **AND** no test reads or executes the source file

### Requirement: Audit SHALL cover all evidence categories with one conclusion
Every source entry, knowledge surface, content origin, license claim, runtime authority, external resource, security finding, and candidate Skill SHALL have exactly one explicit disposition. All identifiers and source paths SHALL be unique, all references SHALL resolve, and all summary counts SHALL match the audited collections.

#### Scenario: Typed evidence is parsed
- **WHEN** `capability-audit.json` is parsed through the HistAgent Zod schema
- **THEN** completeness, uniqueness, reference integrity, safe paths, summary counts, and disposition coverage validate atomically

### Requirement: Audit SHALL preserve licensing and origin boundaries
The audit SHALL distinguish HistAgent-authored Apache-2.0 content, all five Microsoft AutoGen or Magentic-One-attributed files requiring per-file MIT source verification and notice retention, unresolved `browser_use` code, tracked bytecode, and unverified figures. Root licensing SHALL NOT silently authorize reuse of a different or unknown origin.

#### Scenario: Future reuse is evaluated
- **WHEN** a source entry is considered for ingestion
- **THEN** its origin and license conclusion determine whether behavior may be retained, adapted, replaced, excluded, or treated as a confirmed failure

### Requirement: Audit SHALL record runtime and external-resource authority
The audit SHALL cover provider inference, credentials, requests, browser control, filesystem access, subprocesses, dependency installation, telemetry, benchmark execution, datasets, models, search services, websites, local services, and material uploads. Explicit Skill invocation SHALL authorize use of configured providers and task materials only under target-Agent and host policy.

#### Scenario: Audit evidence is consumed
- **WHEN** a future implementation reads runtime and resource conclusions
- **THEN** it receives no authority to install dependencies, execute upstream code, read credentials, launch a browser, contact services, or bypass host access control

### Requirement: Audit SHALL freeze exactly three prospective Skills
The audit SHALL define `histagent-historical-research`, `histagent-historical-source-identification`, and `histagent-historical-source-analysis` as non-production candidates using self-contained executable capability reimplementation. Each candidate SHALL declare its baseline extensions, formal entrypoint, commands, state authority, copied support resource, conventional CLI and domain-file contract, command-specific success contract, nonzero stderr failure contract, and documented dependency policy; reference audited surfaces; have an empty hard-dependency list; use advisory relationships only; and carry valid ANZSRC metadata. It SHALL NOT require a generic runner, cross-Skill envelope, input/output schema, doctor, or result validator.

#### Scenario: Candidate design is reviewed
- **WHEN** the candidate collection is validated
- **THEN** it contains exactly the three planned Skill IDs with resolvable surfaces, reviewed extensions, no hard Skill dependency, and advisory-only sibling relationships

### Requirement: Candidate outputs SHALL preserve source layers
Every candidate Skill SHALL distinguish raw observation or OCR, normalized transcription, emendation, translation, and interpretation. It SHALL prohibit unmarked completion or presentation of reconstructed content as raw evidence.

#### Scenario: Historical material is transformed
- **WHEN** OCR, collation, normalization, translation, or interpretation contributes to an output
- **THEN** the relevant layer and provenance are explicit and human-reviewable

### Requirement: Candidate domain mapping SHALL remain prospective
`historical-studies` SHALL prospectively include all three candidates. `heritage-archive-and-museum-studies` SHALL prospectively include source identification and source analysis only. HistAgent SHALL NOT receive tool-domain membership, and ANZSRC Field metadata SHALL NOT create production membership.

#### Scenario: Audit change is complete
- **WHEN** registry and domain catalogs are inspected
- **THEN** HistAgent is absent from production vendors and all `histagent-*` Skills are absent from published domain memberships

### Requirement: Benchmark and unsafe implementation content SHALL remain audit-only
HistBench, GAIA, and HLE runner, dataset, scoring, combination, and judgment surfaces SHALL be excluded from future Skill content. Cookie payloads, telemetry defaults, tracked bytecode, unresolved `browser_use`, unverified figures, and fixed provider credentials SHALL NOT be copied.

#### Scenario: Production inputs are proposed
- **WHEN** `ingest-histagent` selects source or replacement resources
- **THEN** excluded and confirmed-failure material is absent and preserved capability is implemented through reviewed adaptation or replacement

### Requirement: Future ingestion SHALL have separate hash-bound Gates
Parallel preparation of `ingest-histagent` MAY proceed, but production publication SHALL wait for strict audit validation and human review of the complete generated tree bound to its hash. This audit SHALL NOT create production Skills, a converter, registry entries, domain memberships, package scripts, or runtime integrations.

#### Scenario: Parallel preparation reaches publication
- **WHEN** a future generated tree is ready for production review
- **THEN** audit validation has succeeded and the exact complete tree is bound to a human-reviewed hash before publication

### Requirement: Audit and tests SHALL remain inert
Audit generation and verification SHALL NOT import or execute HistAgent Python, install dependencies, connect to a network service, read configured credentials, start a browser, or run benchmark code.

#### Scenario: Maintainer runs repository verification
- **WHEN** focused and full test suites execute
- **THEN** only static files, JSON, Git metadata, schemas, and existing ResearchSpec catalogs are inspected
