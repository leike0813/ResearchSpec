## Why

ResearchSpec currently projects ARSU and Companion Skills but has no fixed, agent-neutral path for querying a user's Zotero library or delivering the supporting runtime without weakening workflow authority. A dedicated literature-system Adapter is needed so every initialized project receives one reviewed Zotero integration with deterministic offline delivery, while Zotero remains the library authority and ResearchSpec remains the sole workflow authority.

## What Changes

- Add a plural literature-adapter catalog with one fixed `zotero-library` definition, its two Agent-neutral Skills, supported runtime assets, provenance, licenses, checksums, and capabilities.
- Add an audit-governed converter and generated Zotero adapter bundle that excludes upstream installers and unconsumed provider-specific runtime contracts.
- Pin the immutable upstream release set `hbrs-48630ca514e3146c2c89a8d5` and treat bundle, CLI, and Skill component versions as independent; cross-component patch-version differences are never an admission, maintenance, status, check, or release blocker.
- **BREAKING**: converge `tool-installation-manifest.json` schema version `1` directly on a unified `ManagedInstallation` structure and add fixed literature-adapter resolution evidence; remove the ambiguous flat `adapter_version` field without compatibility or migration behavior.
- Make `init` and `update` install exactly one project-local current-platform Zotero runtime and profile template, then project both Adapter Skills to every selected Agent tool; defer only Skill projection when no tool is selected.
- Extend status and static checks with literature-adapter state and diagnostics without executing the runtime, probing Zotero, contacting the network, or writing secrets and user configuration.
- Extend the four generated ARSU Skills with one shared literature-adapter preflight protocol that permits bounded read-only Zotero discovery, preserves fallback behavior, and keeps all ResearchSpec authority writes with the active ARSU producer and CLI.
- Preserve the sixteen top-level CLI commands and eight command-wrapper types while changing the fixed delivered Skill surface from eight to ten Skills.

## Capabilities

### New Capabilities

- `literature-system-adapters`: Fixed literature-adapter catalog, project-local runtime delivery, Skill projection, lifecycle reconciliation, static status, and checks.
- `zotero-literature-adapter-conversion`: Audit-gated, deterministic conversion and release packaging of the approved Zotero Library Agent bundle.

### Modified Capabilities

- `agent-surface-model`: Define the fixed base surface as four ARSU Skills, four Companion Skills, and two Zotero Adapter Skills without adding wrappers.
- `agent-tool-delivery`: Unify managed-installation ownership evidence and project ten fixed Skills to every selected Agent tool while retaining eight wrappers.
- `arsu-converter`: Inject the shared literature-adapter protocol into every generated ARSU producer.
- `cli-interface`: Add literature-adapter status output and the `check literature-adapters` selector under the existing command surface.
- `mvp-release-readiness`: Package and verify all supported Zotero runtime assets, generated Adapter Skills, provenance, and static offline acceptance behavior.

## Impact

The change affects the installation-manifest DTO and workspace write planner, Agent tool delivery, init/update lifecycle, runtime status and validation, ARSU conversion, package/release verification, CI matrices, tests and fixtures, and the canonical user/CLI/contract documentation. It adds project-local `.zotero-bridge` generated files and packaged `literature-adapters/zotero` assets, but no dependency installation, service process, public command, configuration selector, global write, credential handling, Host Bridge probe, or runtime LLM integration.
