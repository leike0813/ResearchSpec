## Context

`audit-histagent` freezes HistAgent at revision `47bbe21dc81618489f5d5929358032883a3fe448`. The source has no upstream `SKILL.md` and mixes useful historical methods with benchmark runtimes, fixed clients, credential access, browser automation, telemetry, and unsafe or unresolved material. The checked-in non-native vendor Skill standard now defines the correct conversion boundary: complete authored trees, a complete main-file runtime path, concrete capability mechanisms, selective references, typed maintainer validation, and hash-bound human review.

The immutable audit and five-file AutoGen/Magentic-One source evidence remain authoritative. Capability preservation does not authorize copying unresolved implementation. The three Skill trees independently reimplement admitted behavior and remain preview-only until the new aggregate hash is approved.

## Goals / Non-Goals

**Goals:**

- Produce exactly three complete, self-contained executable Skills.
- Bind every advertised capability to a concrete command and reviewed implementation kind.
- Use conventional CLI options for simple input and purpose-specific domain files for complex records.
- Keep semantic research judgment with the Agent and deterministic parsing, hashing, state, gating, requests, and rendering with scripts.
- Keep credentials in user-selected environment variables and make every external upload explicit.
- Validate each complete tree through the common non-native Skill validator and copied-tree execution tests.
- Generate an exact preview, renewed hashes, and a Chinese review report while production remains blocked.

**Non-Goals:**

- Porting HistAgent's application runtime, benchmark suites, fixed clients, Cookie material, telemetry, tracked bytecode, unresolved `browser_use`, or unverified figures.
- Defining a generic ResearchSpec runner, `RUNTIME.json`, input/output schema family, fixed stdout envelope, dependency manifest, doctor, or result validator.
- Installing dependencies, configuring credentials, starting services, or exercising external adapters during conversion, checking, packaging, installation, discovery, update, or release verification.
- Giving Skill-local state authority over ResearchSpec workflow state.
- Admitting HistAgent to the production registry or domains before human approval.

## Architecture Decisions

### Use baseline plus explicit extensions

| Skill | Extensions | Reason |
| --- | --- | --- |
| `histagent-historical-source-analysis` | baseline + script-assisted + resource-backed | Deterministic extraction, media adapters, provenance, and collation need a formal script and shared portable primitives; no durable workflow state is needed. |
| `histagent-historical-source-identification` | baseline + script-assisted + resource-backed | Search, retrieval, candidate normalization, consent, and verification need a formal script and portable request primitives; candidate artifacts are independently resumable. |
| `histagent-historical-research` | baseline + script-assisted + resource-backed + stateful | Source registration, layer applicability, evidence, conflicts, review, synthesis, and recovery require a Gate and Skill-local JSON state. |

SQLite remains unnecessary because one Agent owns a run directory and no accepted requirement needs concurrent writers or transaction repair across processes.

### Author complete fixed trees

Every preview tree contains exactly:

```text
<skill-id>/
├── SKILL.md
├── scripts/<entrypoint>.py
├── lib/historical_support.py
├── references/<domain-detail-a>.md
├── references/<domain-detail-b>.md
├── LICENSE
├── NOTICE
└── DERIVATION.json
```

`SKILL.md` owns purpose, inputs, mode/state routing, every command example, dependencies, authority, side effects, LLM/script responsibilities, outputs, completion, failures, recovery, and examples. Each reference is directly linked with a precise read condition and contains only detailed domain cases that save main-context capacity.

`skill-definitions.ts` is the maintainer SSOT for extensions, capabilities, script contracts, resource consumption, reference routes, state anchors, and distribution metadata. It is not emitted as a runtime manifest.

### Share source, not a runtime protocol

`lib/historical_support.py` is copied byte-for-byte into each tree. It implements atomic writes, hashes, historical layer records, environment credential lookup, configured HTTP JSON requests, conventional CLI errors, and command-specific JSON emission. Each formal entrypoint imports this Skill-local resource. There is no sibling-Skill, converter, repository, or undistributed import.

Success shapes belong to commands: artifact-producing operations print a receipt, `status` prints the Gate view directly, mutations print state receipts, and `render` names its three artifacts. Expected failures exit nonzero and write `{ "error": { "code", "message", "details" } }` to stderr without a success object on stdout.

### Keep dependencies honest and user-managed

Offline analysis, local-index identification, HTTP adapters, and research state use Python 3.11 standard library behavior. PDF extraction optionally imports `pypdf`; OCR, transcription, and frame extraction optionally invoke user-provided `tesseract`, `whisper`, and `ffmpeg`. Configured service adapters use user-selected endpoints. Credentials are read only from the environment variable named by the user. The Skill never installs, initializes, or persists them.

The production capability map records the primary implementation kind and optional dependency per admitted surface. It does not bind a generic output schema.

## Skill Designs

### Historical source analysis

`scripts/analyze_source.py` provides exactly `inspect`, `convert`, `ocr`, `translate`, `transcribe`, `frames`, `vision`, `collate`, and `validate`. Simple commands use `--source`, `--output`, and `--adapter`. Translation reads a layer file; collation reads variants and optional emendations files. Existing outputs are refused by default. Remote source processing requires `--allow-external-upload`; credentials come from `--credential-env`.

The script preserves raw observation/OCR, normalized transcription, emendation, translation, and interpretation as separate records with parent, locator, operation, tool/provider, reason, uncertainty, review state, and content hash. It does not choose readings or generate historical conclusions.

### Historical source identification

`scripts/identify_sources.py` provides exactly `search`, `exact-text`, `literature`, `archive`, `fetch`, `reverse-image`, `verify`, and `validate`. Local-index, SerpAPI, Google Books, Springer, Internet Archive CDX, HTTP fetch, URL-based reverse image, and consented local image upload remain independent adapter paths.

Candidate records distinguish `discovered`, `retrieved`, `verified`, `inaccessible`, and `rejected`. A local image never leaves the host without explicit consent. Provider keys are never command values or artifact fields.

### Historical research

`scripts/research_runtime.py` provides exactly `init`, `status`, `submit-source`, `submit-layer`, `submit-evidence`, `check`, and `render`. `init` reads `--scope-file`; mutations read source, layer, or evidence record files. `state.json` is the Skill-local SSOT.

Every source declares each of the five layers `required` or `not-applicable` with a reason. The Gate requests only required layers. `status` directly returns run ID, phase, unique next action, status token, blockers, counts, and a next-record example. Each mutation requires a current token and a subsequent status call.

Deterministic final outputs are `research-report.md`, `evidence-matrix.json`, and `provenance.json`. Read-only outputs and local state have no ResearchSpec workflow authority.

## Converter, Safety, And Review

`complete-tree.ts` merges the authored tree, shared support library, license, notice, and derivation record; calls the common non-native Skill validator; checks command documentation; then applies source, dependency, secret, path, import-time I/O, and repository-coupling safety checks. Preview and eventual production must render the same bytes.

The preview writer replaces its temporary output root before writing so removed protocol files cannot survive as stale artifacts. It computes per-file hashes, per-tree hashes, and one aggregate tree-set hash. `review-decision.json` remains `pending-human-review` with empty approval fields while recording the new aggregate hash.

Production remains blocked until the exact complete trees are approved. This review does not archive `audit-histagent`, add a converter CLI, package commands, fifth-vendor registry entry, domain membership, or production Skill output.

## Risks / Trade-offs

- **Command-specific shapes can drift.** Tests assert the stable fields relevant to each command and the complete `SKILL.md` documents them; no unrelated command is forced into a universal envelope.
- **Optional tools can surprise users.** Main instructions name every optional dependency and failure returns `capability_unavailable` without installation.
- **Shared code can hide coupling.** The library is copied into every tree, declared as a resource, and copied-tree tests clear repository import paths.
- **Layer Gates can demand meaningless work.** Each source has an explicit applicability plan, and only required layers block progress.
- **Provider neutrality can become empty abstraction.** Each admitted external capability has a concrete configured HTTP or local-tool path and a localhost-mocked representative test.
- **Hash review can approve stale bytes.** Preview cleanup, deterministic hashing, pending approval fields, and production hash checks prevent reuse of the prior review.

## Migration Plan

1. Update the audit candidate contract and evidence report without changing the 120-entry inventory, set hash, origin, licensing, or safety conclusions.
2. Replace private runner assets with complete authored trees and shared portable support code.
3. Update production policy capability mappings and executable copied-tree tests.
4. Render the complete preview, compute renewed hashes, and generate the Chinese review report.
5. Stop with `pending-human-review` until the user explicitly approves the current aggregate hash.
6. Only a later approved continuation may archive the audit and implement production conversion, domains, registry, package scripts, and release artifacts.

## Open Questions

None. The Skill split, extensions, command sets, lightweight JSON state, applicability plan, fixed final artifact names, dependencies, source evidence, domain mappings, and safety boundaries are fixed for this review.
