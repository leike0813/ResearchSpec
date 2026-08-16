## Why

The execution model moved to capability graph workspaces, but the domain plugin system still had schema-1-era behavior: `plugin install` and `plugin uninstall` only edited `config.yaml`, `plugin update` was a no-op for generated files, `plugin instructions` returned a stub error, and graph `init`/`update` did not synchronize existing plugin selections when tools or delivery changed. Installed domain Skills therefore never became real projections in the new workspace model.

## What Changes

- Add a graph-workspace plugin projection service that reconciles selected-domain Skill closures into every configured skill-capable Agent tool.
- Make `plugin install`, `plugin uninstall`, and `plugin update` write manifest-owned plugin files and update `tool-installation-manifest.json` last.
- Apply existing drift/force rules to plugin files. Explicit uninstall SHALL fail closed when any scheduled plugin file has user modifications.
- Implement `plugin instructions <skill-id>` as a read-only bridge that returns the exact packaged `SKILL.md` only after selected-closure, availability, projection, and hash checks.
- Make graph `init` reconfiguration and `update` synchronize selected plugin projections after tool/delivery changes, and block projection refresh when a selected domain has become unavailable.
- Extend list/show output with resolved-Skill counts and add an end-to-end graph-workspace plugin regression test.

## Impact

- No public CLI command is added, removed, or renamed.
- Plugin projection writes are generated-file operations under existing `tool-installation-manifest.json` ownership and drift rules.
- Domain plugins remain advisory helpers and do not become graph nodes, profiles, Gates, Decisions, or transition owners.

## Capabilities

### Modified Capabilities

- `domain-skill-plugin-registry`: workspace lifecycle and instruction bridge are explicitly bound to schema 2 graph workspaces.

### New Capabilities

None.
