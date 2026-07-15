## Context

HistAgent is an Apache-2.0 application and benchmark repository for multimodal historical question answering. The pinned tree has no `SKILL.md`, contains 120 ordinary tracked files, and mixes historical research methods with benchmark runners, provider-specific Python, a modified `browser_use` tree, tracked bytecode, telemetry, an embedded Cookie payload, and images whose source-local provenance is not established.

ResearchSpec currently has four production vendor converters. HistAgent remains a fifth maintainer-only audit source and must not enter that production count in this change. The audit must preserve valuable historical capabilities while preventing repository runtimes, credentials, unsafe payloads, and unclear-origin implementations from becoming production artifacts by implication.

## Goals / Non-Goals

**Goals:**

- Bind official source `https://github.com/CharlesQ9/HistAgent` to immutable revision `47bbe21dc81618489f5d5929358032883a3fe448` and snapshot name `snapshot-47bbe21`.
- Inventory every tracked entry and give every entry, content origin, license claim, runtime authority, external resource, security finding, knowledge surface, and candidate Skill exactly one explicit disposition.
- Freeze three prospective Skills, their domain placements, advisory-only relationships, empty hard dependencies, provider-neutral implementation strategy, and historical-source output discipline.
- Preserve retrieval, OCR, collation, translation, document, image, audio, and video capabilities by adapting or reimplementing behavior rather than copying unsafe or unresolved implementations.
- Leave a complete evidence package for a separate `ingest-histagent` change.

**Non-Goals:**

- Creating a converter, generated Skill, admission catalog, registry vendor, domain membership, package command, public CLI surface, or runtime dependency.
- Importing or executing upstream Python, installing dependencies, starting a browser, accessing a provider, reading configured credentials, or running HistBench, GAIA, or HLE.
- Copying Cookies, telemetry defaults, tracked bytecode, unresolved `browser_use` code, unverified images, or fixed provider credentials.
- Adding a HistAgent-specific cultural-material policy; the target Agent's general safety, access-control, and citation policies remain authoritative.

## Decisions

### Pin an untagged repository snapshot as audit evidence

`vendor/histagent` SHALL use the official origin and exact commit. The revision has no tag, so the honest source label is `snapshot-47bbe21`. The checkout is maintainer input only and is not an npm publication surface.

### Use a repository inventory and vendor-local typed contract

The shared `VendorAuditRepositorySourceSchema` owns repository identity. HistAgent-specific Zod records own dispositions, origins, license claims, runtime authority, resources, findings, knowledge surfaces, and prospective Skills because their completeness and safety invariants do not apply uniformly to other vendors.

Every source path is sorted by Git byte order. `tracked_entry_set_sha256` is reproducible by forming one UTF-8 line per sorted entry as `<lowercase-sha256><two ASCII spaces><POSIX path>\n`, concatenating all 120 lines, and hashing that manifest with SHA-256. This produces `04a05d13194092009a10cb606d7a51a1bb851f5138e3680faa6a105839f34d02` without placing file contents in the audit.

### Treat the Cookie payload as a confirmed failure without reproducing it

The `scripts/cookies.py` entry contains only `path`, `kind`, Git mode, Git object ID, byte count, SHA-256, origin reference, and `confirmed-failure`. Audit JSON, report, schema, and tests SHALL contain no Cookie keys, names, domains, values, headers, or payload fragments. Tests recompute the set hash from audited per-entry hashes and never read this source file.

### Separate origins, licenses, and operational authority

The root Apache-2.0 claim applies to HistAgent-authored material subject to per-origin exceptions. `scripts/agent_web_browser.py`, `scripts/image_web_browser.py`, `scripts/mdconvert.py`, `scripts/reformulator.py`, and `scripts/text_web_browser.py` all declare Microsoft AutoGen or Magentic-One provenance and therefore require per-file exact MIT-source verification and notice preservation; unresolved implementation SHALL be replaced by behaviorally equivalent provider-neutral code. The unlicensed `browser_use` tree, tracked `.pyc`, and unverified figures remain excluded.

Explicit Skill invocation authorizes only use of configured providers and task materials. Browser, filesystem, external request, model, upload, and command access remain governed by the target Agent and host. ResearchSpec conversion, checking, packaging, installation, discovery, and update never exercise those authorities.

### Freeze three capability-preserving prospective Skills

A future `ingest-histagent` may generate exactly:

- `histagent-historical-research`
- `histagent-historical-source-identification`
- `histagent-historical-source-analysis`

All three must be complete, self-contained executable Skills rather than host-supplied provider wrappers. Every candidate starts from the non-native baseline. Source identification and source analysis add script-assisted and resource-backed extensions; historical research also adds stateful Gate discipline with a run-directory JSON SSOT. Formal entrypoints use conventional command options and purpose-specific domain files. Successful commands return only their command-level receipt or direct status view; failures use a nonzero exit code and a stderr error object. No candidate requires a cross-Skill envelope, generic runner/schema convention, dependency installer, hard Skill dependency, or hidden host implementation. `historical-studies` receives all three; `heritage-archive-and-museum-studies` receives source identification and source analysis. No tool domain receives a HistAgent Skill.

`histagent-historical-research` complements ARSU `deep-research`; focused retrieval and source analysis remain distinct rather than duplicating a generic research workflow.

### Make historical-source transformations explicit

Every prospective Skill output SHALL distinguish raw observation or OCR, normalized transcription, emendation, translation, and interpretation. A layer may be empty when not applicable, but no inferred or reconstructed text may be presented as raw evidence and no unmarked completion is allowed.

### Keep evaluation content audit-only and production review hash-bound

HistBench, GAIA, and HLE runners, datasets, scoring, combination, and judgment logic are evidence only. Parallel preparation of `ingest-histagent` is allowed, but production publication requires this audit to validate and a human to review the full generated tree bound to its hash. Partial sample review is insufficient.

## Risks / Trade-offs

- **[Repository license is over-applied]** → Bind every entry to an origin, record derived or unclear scopes separately, and require replacement where exact source licensing is not evidenced.
- **[Sensitive Cookie content leaks through testing]** → Restrict the record shape, use fixed cryptographic metadata, and never read or snapshot the file in tests or prose.
- **[Capability preservation is mistaken for code reuse]** → Record separate `adapt`, `replace`, and `exclude` conclusions and require provider-neutral reimplementation for unsafe or unresolved code.
- **[Provider neutrality removes useful operations]** → Preserve the business capability and let explicit invocation plus target-host policy govern configured provider and material access.
- **[Historical transformations blur source evidence]** → Make the five output layers a candidate contract and prohibit unmarked completion.
- **[Parallel ingestion bypasses review]** → Make audit validation and complete-tree hash-bound human review production Gates.

## Migration Plan

1. Pin the official repository as `vendor/histagent` at the audited revision.
2. Add the vendor-local contract and complete source-bound machine audit.
3. Add the evidence report, focused tests, and maintainer guidance.
4. Validate OpenSpec and run repository checks without importing or executing upstream content.
5. Leave all production generation to the separate `ingest-histagent` change and its review Gates.

Rollback removes the unarchived change, audit-only source link, vendor-local schema, evidence files, focused tests, and maintainer guidance. No production registry, user workspace, or runtime requires migration.

## Open Questions

None. Exact AutoGen source verification, generated resource design, per-file production decisions, and complete-tree review belong to `ingest-histagent` and cannot be used to weaken this audit.
