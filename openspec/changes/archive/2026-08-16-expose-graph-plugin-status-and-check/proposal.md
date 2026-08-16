## Why

Graph workspaces now project selected domain plugin Skills through `plugin install`/`uninstall`/`update` and graph `init`/`update`. However, `status` still omits plugin state entirely and `check [target]` does not implement the previously documented `plugins` target. Agents and users therefore cannot verify whether a selected plugin is actually projected, drifted, or blocked without invoking the plugin lifecycle commands.

## What Changes

- Add a graph-workspace plugin status view and include it in `status --json` as `plugins`: selected domains, available domains, unavailable selections, projected domains, and resolved Skill IDs.
- Implement `check plugins` and include plugin diagnostics in `check` with the default `all` target.
- Validate selected-domain availability, per-domain resolution snapshots, manifest ownership, and projected file hashes statically without executing plugin resources.
- Treat missing or unmanifested projected files as blocking diagnostics; treat user drift as a non-blocking warning that becomes blocking under `--strict`.
- Keep plugin registry load failure non-blocking for `status` and blocking for `check plugins`.
- Update the CLI handbook target description and add regression coverage for status and check behavior.

## Impact

- No public command is added or removed; `check` receives the already declared `plugins` target.
- `status` gains one read-only `plugins` object and one human summary line.
- Plugin resources are never executed during status or check.

## Capabilities

### Modified Capabilities

- `domain-skill-plugin-registry`: graph workspace plugin status and static check semantics.

### New Capabilities

None.
