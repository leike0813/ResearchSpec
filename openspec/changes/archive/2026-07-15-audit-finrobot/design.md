## Context

ResearchSpec currently audits and ingests vendors whose upstream units are explicit Skills. FinRobot is structurally different: the pinned checkout has no `SKILL.md`, contains 146 tracked entries including an uninitialized FinNLP gitlink, and distributes domain guidance across Python prompts, agent profiles, configuration, deterministic financial calculations, notebooks, reports, deployment surfaces, and data-service adapters.

The current root `LICENSE` and `NOTICE` identify Apache-2.0, while `setup.py` still declares MIT. Some files identify borrowed or historically imported content without enough source-local licensing evidence. The README and the prior study also describe capabilities absent from the pinned source, including additional technology stacks and valuation methods. High-stakes financial prompts request ratings, targets, forecasts, or web-derived conclusions without stable evidence or freshness contracts.

The audit is maintainer-only evidence. It must not turn source code, runtimes, provider integrations, or simplified financial defaults into production Skills.

## Goals / Non-Goals

**Goals:**

- Bind the official source to immutable revision `297a8d28d099be328c8a8eb658b4f782b93f3651` and honest release label `snapshot-297a8d2`.
- Inventory all 146 tracked entries and distinguish ordinary files, executables, and the FinNLP gitlink.
- Audit all relevant knowledge surfaces and aggregate evidence into six candidate static capabilities.
- Preserve one source of truth for content origin, license claims, ANZSRC metadata, findings, safety boundaries, and future adaptation constraints.
- Keep existing vendor audit contracts and documents unchanged while making repository-level provenance reusable.

**Non-Goals:**

- Creating admission, file, resource, dependency, or domain production decisions.
- Creating a converter, package command, generated Skill, Plugin vendor, domain membership, runtime dependency, or public CLI surface.
- Executing source code, initializing FinNLP, installing dependencies, accessing services, configuring credentials, generating financial reports, or running financial calculations.
- Treating simplified source defaults as authoritative valuation or statistical methodology.

## Decisions

### Pin the current untagged source as a maintainer-only snapshot

The repository SHALL be linked at `vendor/finrobot` with official URL `https://github.com/AI4Finance-Foundation/FinRobot.git` and exact revision `297a8d28d099be328c8a8eb658b4f782b93f3651`. The audit uses `snapshot-297a8d2`, because both `v1.0.0` and `desktop-v0.1.0` precede the selected revision. Using a historical tag was rejected because it would omit the source studied for possible absorption.

The nested FinNLP gitlink remains uninitialized. Its object ID and relationship are evidence, not authorization to retrieve or redistribute its contents.

### Model the repository and candidate capabilities separately

`capability-audit.json` SHALL contain three layers:

1. `source_entries` covers every tracked Git entry with stable path, entry kind, mode, Git object ID, content hash and bytes where applicable, content-origin reference, and audit disposition.
2. `knowledge_surfaces` identifies source-bound prompts, roles, analysis templates, deterministic methods, runtime orchestration, and financial assumptions by stable IDs, concrete paths, symbols, kinds, evidence, origins, risks, findings, and recommendation.
3. `candidate_capabilities` aggregates surfaces into six possible static capabilities: financial-statement analysis, company-fundamentals analysis, corporate-risk analysis, competitive-position analysis, relative-valuation analysis, and financial-news-impact analysis.

Creating synthetic upstream `skills[]` was rejected because FinRobot has no upstream Skills. Keeping the full file inventory in the same SSOT was preferred over a second catalog so completeness, origins, surfaces, and candidate references validate atomically.

### Extract a repository source schema without weakening existing audits

The shared `VendorAuditRepositorySourceSchema` owns source ID, name, repository URL, release, revision, root-license claim, and license path. Existing `VendorAuditSourceSchema` extends it with `skill_root`, preserving all existing JSON documents and inferred types. FinRobot uses the repository schema directly.

FinRobot-specific licensing, origin, finance, and provider fields remain vendor-local. Generalizing those hazards into every vendor contract was rejected because the concepts and completeness rules differ.

### Treat licensing statements as claims until effective scope is evidenced

The root Apache-2.0 license, NOTICE/trademark requirements, stale MIT package metadata, FinNLP gitlink, AutoGen-attributed code, and unclear imported filing/marker trees SHALL be recorded as distinct claims or content origins. Every source entry references exactly one origin conclusion, but a root license SHALL NOT silently resolve conflicting or unknown provenance. Unknown or conflicting reusable content remains blocked for future ingestion.

### Record evidence-first financial risk findings without deciding admission

The audit records source assumptions, provenance gaps, provider binding, freshness,
execution, credential, trading, portfolio, and personalized-use risks. These are
evidence for later production decisions, not automatic capability removals.

The audit itself grants no authority to install or run FinRobot, access providers,
handle credentials, trade, manage portfolios, or publish any candidate output.
`ingest-finrobot` owns the separate decision about which reviewed scripts,
providers, assumptions, targets, ratings, and conclusions may appear in static
Skill packages and under what execution contract.

### Keep audit classification distinct from domain membership

Only the existing `accounting-auditing-and-accountability` and `banking-finance-and-investment` domains may be recorded as prospective placements. ANZSRC Field metadata is attached once to candidate capabilities and never creates membership. A future ingestion change must make explicit source-neutral domain decisions.

### Keep production ingestion separate

`ingest-finrobot` is the only prospective production change. It must resolve all
audit recommendations with explicit admission, coupling, per-file,
content-license, provider/resource, overlap, curation, and domain decisions. The
audit does not decide whether a reviewed script or adapter is distributable; it
only requires the later converter, checker, packager, and installer to remain
inert and the production change to exclude unresolved origins and embedded
sensitive payloads.

## Risks / Trade-offs

- **[Source documentation and implementation diverge]** → Bind every conclusion to the pinned revision and verify named false capability claims against the actual tree.
- **[Complete inventory makes the audit larger]** → Keep records compact and stably ordered; test counts and hashes rather than snapshotting prose.
- **[Root Apache-2.0 is over-applied]** → Model license claims and content origins separately, blocking conflicting or unknown scopes.
- **[Audit findings are mistaken for production prohibitions]** → Keep findings source-bound and require the separate ingestion change to decide capability, execution, provenance, and form-safety policy.
- **[Existing audit contracts regress during extraction]** → Preserve `VendorAuditSourceSchema` shape and run all current vendor audit tests.
- **[External FinNLP content enters the audit implicitly]** → Validate only its gitlink metadata and keep the nested checkout uninitialized.

## Migration Plan

1. Add and pin the maintainer-only submodule without initializing FinNLP.
2. Extract the repository-level source schema and add the FinRobot-specific audit contract.
3. Create the complete machine SSOT and concise report.
4. Add focused provenance, completeness, licensing, knowledge, safety, taxonomy, registry, and publication tests.
5. Update maintainer guidance and run strict OpenSpec and repository verification.

Rollback removes the unarchived change, FinRobot audit-only files, schema module, focused tests, and gitlink. No production Plugin, package command, public API, or user workspace requires migration.

## Open Questions

None. Production admissions, generated content, and domain memberships intentionally remain unresolved for `ingest-finrobot`.

