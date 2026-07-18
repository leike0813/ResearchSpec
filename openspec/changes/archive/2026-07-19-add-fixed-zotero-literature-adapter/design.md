## Context

ResearchSpec currently delivers four ARSU Skills and four Companion Skills to selected Agent tools, while command-capable tools additionally receive eight wrappers. Delivery state is recorded in `tool-installation-manifest.json`, but its current flat installation records mix source, ownership, and target concerns and are parsed in multiple modules. Workspace writes track bytes but not executable mode. `update` also stops early when no Agent tool is selected, so it cannot maintain a project-owned shared runtime.

The approved upstream Zotero bundle is the immutable tag `host-bridge/hbrs-48630ca514e3146c2c89a8d5`, bundle commit `8eef49d72574084244514fb612b96e7f5e7967a8`, tree `d4cb943c0370e5104ec8c7074606c69980dec090`, and source commit `4436cf4a91f12ea555a54ddbba9278480ceaf56d`. It publishes two Agent-neutral Skills and seven platform runtimes. The current surface and CLI versions are both `0.3.0`, but upstream intentionally versions bundle, CLI, and Skills independently. The new release also demonstrates why version equality cannot drive maintenance: its semantic Skill digests and command catalog are unchanged while the release-set, build fingerprint, and every runtime binary changed.

The adapter must remain a static, project-local delivery concern. Zotero owns library and Host Bridge state. ResearchSpec owns its workflow contracts, state, artifacts, Gates, Decisions, transitions, and receipts. Init, update, status, check, conversion, packaging, and installation must never execute the adapter, contact Zotero, install dependencies, or write credentials.

## Goals / Non-Goals

**Goals:**

- Introduce a fixed literature-adapter domain with one `zotero-library` catalog entry and no user selection setting.
- Deliver one current-platform runtime and profile template per project, plus two Adapter Skills per selected Agent tool.
- Converge manifest schema version `1` directly on one strict managed-installation DTO and explicit adapter resolutions.
- Make release-set identity and checked bytes, rather than cross-component SemVer equality, the maintenance authority.
- Provide static status and validation for catalog, resolution, files, modes, platforms, and Skill projections.
- Add one converter-owned Zotero protocol to all four ARSU producers while preserving fallback and workflow authority.
- Package all approved platforms and provenance so installed releases operate offline.

**Non-Goals:**

- Adding a top-level CLI command, Companion Skill, wrapper type, domain plugin, or adapter selection option.
- Installing or starting Zotero, an XPI, Host Bridge backend, upstream installer, Python environment, or background service.
- Writing tokens, real profiles, PATH entries, user-directory state, or global Skill installations.
- Probing Host Bridge or asserting live connection health from status or check.
- Migrating or accepting the previous internal manifest record shape.
- Treating ARSU's Better BibTeX `zotero.py` helper as a live Zotero source.

## Decisions

### Fixed adapter catalog is the installation authority

Add a plural catalog of `LiteratureAdapterDefinition` values. The first definition has ID `zotero-library`, `install_policy: "fixed"`, primary Skill `zotero-library-agent`, and helper Skill `zotero-bridge-cli`. The definition owns provenance, component identities, protocol, CLI schema, license, capabilities, profile template, supported runtimes, build fingerprint, command checksum, and binary checksums.

No `config.yaml` selector is added. Init and update enumerate fixed catalog entries. This avoids two competing installation facts and makes a ResearchSpec release a reviewed, self-contained adapter release.

Alternative considered: model Zotero as a domain plugin or optional tool adapter. Rejected because it is a fixed literature-system dependency shared by all producers and has one project runtime rather than per-tool command ownership.

### Component versions are independent; release identity is exact

Bundle, CLI, and Skill versions are validated only against their own upstream manifest positions. No equality or patch-equality comparison is permitted between components. A valid release set may therefore contain different patch versions without diagnostics in admission, conversion, delivery, status, check, or release verification.

Compatibility and update identity use the exact release-set ID, supported protocol and CLI schema, build fingerprint, command catalog checksum, binary aggregate checksum, and per-platform checksum. A changed release-set or runtime identity requires reconciliation even when every component version and semantic content digest is unchanged.

Alternative considered: update by maximum SemVer or shared patch version. Rejected because upstream explicitly versions components independently and the current release changes runtime bytes without changing those versions.

### One strict managed-installation source of truth

Move installation DTOs, parsing, serialization, keys, deduplication, and owner-aware reconciliation into a shared adapter module. `ManagedInstallation` contains:

- `owner`: `agent-tool` or `literature-adapter`;
- `tool_id`: selected tool for tool projections, otherwise `null`;
- structured `source`: ARSU Skill, Companion Skill, domain Skill, command, or literature-adapter artifact;
- `target`: project scope, path, and executable contract;
- `sha256`: installed bytes.

Literature-adapter sources include adapter ID, release-set ID, component kind (`skill`, `runtime`, `profile-template`, or `windows-shim`), and the relevant Skill or platform identity.

The manifest keeps `schema_version: "1"` and adds `literature_adapter_resolutions`. A resolution records the successfully installed release-set, component versions, target platform, optional runtime asset, protocol/schema/build/checksum identity, the two Skill IDs, and projected tools. The flat `adapter_version` and old installation shape are removed without a compatibility reader, migration, dual write, or deprecated fields.

Alternative considered: add adapter-specific records alongside the old installation DTO. Rejected because that would preserve ambiguous ownership and duplicate parsing indefinitely.

### Delivery has project-owned and tool-owned layers

Refactor delivery into one workspace planner that combines:

1. shared project delivery for `.zotero-bridge/bin/` and `.zotero-bridge/profile.template.json`;
2. existing per-tool ARSU, Companion, plugin, and wrapper delivery;
3. per-tool projection of the two Adapter Skills.

The runtime is copied once per project. POSIX runtimes are `0755`. Windows receives the manifest-declared `.exe` and a deterministic ResearchSpec-authored `.cmd` shim. No-tool workspaces still receive the supported runtime and template, with Skill projection marked deferred. Unsupported platforms receive static Skill projections for selected tools but no runtime and retain an unsupported state.

The write plan tracks expected content and mode. It checks both before commit, sets the temporary file mode before atomic rename, and rejects symbolic links and non-regular targets. SHA-256 continues to bind bytes; `target.executable` binds the mode contract separately.

On update, clean manifest-owned files advance automatically. Drifted owned files require `--force`; unowned conflicting paths are never overwritten. Adapter resolution is committed only after every required adapter write succeeds. If the adapter sub-plan conflicts, the prior resolution remains while unrelated core workspace writes may still complete with a blocking diagnostic.

### Status and checks are one static inspection model

Add a pure inspection layer shared by runtime status and validation. It reads catalog data, manifest records, paths, hashes, file type, and POSIX modes only. It never spawns a process, opens a network connection, reads a real profile, or queries Zotero.

Adapter state precedence is `conflict`, `unsupported`, `missing`, `degraded`, then `installed`. A supported runtime with no selected tools is installed with deferred projection. Every result includes `connection_state: "unchecked"`.

Add `check literature-adapters` and include it in `check all`. Catalog or ownership conflicts are blocking. Unsupported, missing, checksum/mode drift, and incomplete projection are structured diagnostics and fail strict checking. Tool-only checks filter by `owner: "agent-tool"` so adapter diagnostics are not duplicated.

### Conversion is audit-gated and deterministic

The converter consumes the pinned local bundle and produces `literature-adapters/zotero/`. It includes the two adapted Skills, consumed references, evidence helper/schema, profile template, seven runtimes, release identity, licenses, notices, and derivation evidence. It excludes upstream installers, `agents/openai.yaml`, `runner.json`, `output.schema.json`, and unused runtime contracts. Adapted instructions must remove references to excluded files and global installers.

Admission binds immutable tag, bundle commit/tree, source commit, release-set identity, source cleanliness, component-local versions, protocol/schema, build fingerprint, command checksum, content digests, binary aggregate, every runtime checksum, and complete licensing evidence. `releaseSet.status: "planned"` and the absence of a GitHub Release object are not admission gates.

The source commit root AGPL-3.0 license is sufficient evidence for the pinned bundle. ResearchSpec ships `LICENSES/AGPL-3.0.txt` and hash-bound NOTICE/DERIVATION data.

### ARSU owns the semantic result and ResearchSpec owns workflow writes

Add one stable Zotero literature-adapter protocol marker to the shared ARSU contract preflight, then regenerate all four producers. The protocol directs bounded read-only Zotero discovery before optional external supplementation, warns that an empty result is not evidence of absence, and treats adapter results as working material for the active producer.

Ordinary literature requests fall back to current ARSU paths when the adapter is unavailable. Requests explicitly dependent on current selection or private-library content pause for configuration or alternative input. Zotero mutation, workflow submit/apply, upload, deletion, and maintenance require separate user authorization and remain subject to Host Bridge approval.

The converter also formally packages ARSU's existing `zotero.py`, `_common.py`, and required package markers. This path reads only user-supplied Better BibTeX JSON. It requires user-provided Python 3.11+ and PyYAML and is not a live Zotero fact source.

### Release packaging carries all platforms but installs one

The npm release includes all seven approved runtimes, generated Adapter Skills, profile template, provenance, and AGPL license. Init copies only the current platform. Runtime update occurs only with a ResearchSpec release; no independent online updater is added.

Release verification checks the complete platform matrix, exact identities and checksums, 10 fixed Skills, 8 wrapper types, excluded upstream surfaces, and offline `check all --strict`. CI exercises platform selection for Windows, Linux, and macOS without running adapter binaries.

## Risks / Trade-offs

- [Bundling seven native binaries materially increases package size] → Keep only reviewed manifest assets, verify every checksum, and copy only the current platform at init.
- [Manifest schema version remains `1` while its development shape changes] → Treat the repository as prerelease, update all templates and fixtures at once, and reject the previous shape explicitly.
- [A release-set update can change only binaries and identity metadata] → Reconcile by release-set/build/runtime identity and compare individual generated files to avoid unnecessary Skill prose churn.
- [Executable mode can drift independently of bytes] → Track the executable contract in the manifest and inspect POSIX mode separately from SHA-256.
- [Partial filesystem writes cannot be rolled back reliably] → Stage and preflight all adapter targets first, write resolution last, preserve the prior resolution on any adapter conflict, and report incomplete managed state.
- [A static installed result may be mistaken for live connectivity] → Always expose `connection_state: "unchecked"` and document that Host Bridge is probed only by explicitly authorized runtime use.
- [Source licensing is evidenced outside the bundle repository] → Bind the exact source commit, license bytes, copied set, excluded set, and derivation in the production audit.

## Migration Plan

This is a prerelease current-state convergence, not an end-user migration. Replace every checked-in manifest template and test fixture with the final schema version `1` shape. Do not add a migration command or legacy reader.

Implementation proceeds from domain contracts to delivery, inspection, converter generation, ARSU regeneration, and release verification. Existing dirty user files remain protected by managed ownership and force rules. If the implementation cannot complete, removing the fixed catalog entry and generated package assets restores the prior release surface; no external or user-global state needs rollback because runtime behavior is project-local and offline.

## Open Questions

None. The adapter identity, version policy, ownership model, failure behavior, licensing basis, and workflow authority boundaries are fixed by this change.
