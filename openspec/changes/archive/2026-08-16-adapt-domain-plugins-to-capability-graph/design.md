## Context

The capability graph engine made `config.yaml` schema 2 and `tool-installation-manifest.json` the generated-file ownership record. The plugin CLI was left with config-only handlers, while the old schema-1 delivery planner still owned plugin projection elsewhere. This split meant a selected domain could be recorded as installed without any Skill bytes being delivered, and no command repaired that state.

## Goals / Non-Goals

**Goals:**

- Make domain plugin lifecycle real inside schema 2 graph workspaces without changing the plugin registry schema.
- Reuse `planFile`/`executeWritePlan` and the structured installation manifest for plugin-owned files.
- Keep plugin failure boundaries identical to the old model: advisory only, no workflow authority.
- Preserve existing drift, force, unavailable-selection, and manifest-last semantics.

**Non-Goals:**

- Converting domain Skills into capability packages or plugin graph profiles.
- Introducing a plugin registry schema version 2.
- Changing the sixteen-command public CLI surface.
- Migrating schema 1 workspaces.

## Decisions

### One graph-native plugin projection service

`src/plugins/graph-delivery.ts` is the only planner for plugin Skill projection in graph workspaces. It resolves the selected-domain closure once, writes each Skill at most once per configured tool, and derives desired paths from registry IDs and tool Skill roots.

### Manifest owns plugin projections

Every projected plugin file is recorded as an `agent-tool` installation with source kind `domain-skill`. `plugin_resolutions` snapshots are updated for available selected domains and retained for unavailable selected domains. Manifest writes occur after generated files; plugin install/uninstall write config before the final manifest commit.

### Drift and uninstall are strict

Desired-file drift is preserved and reported. Stale file drift is preserved during ordinary reconciliation. For explicit `plugin uninstall`, any scheduled file with modified bytes blocks the entire transaction so the user's edit is never deleted and the selection is not silently changed.

### Graph init/update synchronize selected plugins

After `init` reconfiguration or `update` writes the new tool/delivery config, the handlers reload the graph workspace index and run the same plugin projection reconciliation. A selected domain that is missing or empty blocks this refresh with `plugin_unavailable`, preserving prior snapshots and files.

### Instructions bridge stays read-only

`plugin instructions` reads from the validated package root and returns the exact `SKILL.md`, entry hash, resources, providing domains, and projected tools. It requires every configured skill-capable tool to hold the complete hash-clean manifest-owned tree and never executes plugin resources.

## Risks

- `loadPluginRegistry()` walks the complete bundled plugin tree on each projection command. Accepted for phase 1; a future packaged-file index can avoid filesystem discovery.
- Graph `update` now performs plugin reconciliation after base capability projection, making the write transaction longer. Conflict preflight happens before plugin writes, so a plugin conflict leaves prior files unchanged.
