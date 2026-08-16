## Context

Phase 1 made plugin projection real but did not make that projection observable through the graph control-plane commands. `plugin list` is a catalog command, not a workspace-health command. The graph protocol starts with `status --json`; plugin projection state must be visible there and independently verifiable with `check plugins`.

## Goals / Non-Goals

**Goals:**

- Expose selected/available/unavailable/projected/resolved plugin state in graph status.
- Implement `check plugins` with deterministic static diagnostics.
- Reuse existing plugin registry resolution and installation manifest records; do not introduce a second ownership model.
- Preserve optional-plugin semantics: plugin status failure does not make the core status command fail.

**Non-Goals:**

- Plugin recommendations or runtime matching.
- Plugin graph profiles or capability packages.
- Executing plugin scripts or contacting external services.

## Decisions

### Status loads the packaged registry in lightweight mode

`status` loads `skills/plugins/registry.json` with `validateSkillContent: false` so projection paths and metadata come from packaged vendor manifests without recursively walking every vendored Skill tree. A registry load failure returns a `loadable: false` plugin view and a non-blocking `plugin_status_unavailable` diagnostic.

### Check plugins is static and strict about missing evidence

`check plugins` loads the same lightweight registry, resolves the selected-domain closure, and verifies:

- every selected domain is available;
- available domains have a current per-domain resolution snapshot;
- every resolved Skill file in every configured skill-capable tool is manifest-owned and present;
- present files match their recorded SHA-256.

Missing evidence is blocking. Drift is a warning by default and becomes blocking with `--strict`, matching existing generated-file drift conventions.

### Target plumbing remains catalog-backed

The CLI passes the validated `check [target]` value into the graph handler. Unknown targets remain usage errors with exit code 2. The static payload catalog and generated CLI handbook include the complete target set.

## Risks

- Lightweight registry loading still reads every packaged `SKILL.md`. Accepted for this stage; a future packaged-file index can reduce startup cost further.
- `check all` now performs plugin projection hashing in addition to workspace checks; it skips plugin loading when no domains are selected. Explicit `check plugins` always loads the registry so a broken bundled catalog is a blocking diagnostic even for an empty selection.
