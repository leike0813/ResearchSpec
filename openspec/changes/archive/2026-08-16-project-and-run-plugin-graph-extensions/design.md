## Context

The extension foundation introduced a pilot `plugin-ecology-biodiversity` capability and one-node profile, but `plugin install ecology` still projected only the raw ToolUniverse Skill. The graph engine only knew about `skills/capabilities/registry.json`, so plugin profiles could not be validated or executed.

## Goals / Non-Goals

**Goals:**

- Project extension capability files and graph profiles through the existing plugin lifecycle commands.
- Record extension ownership in the same manifest and reconciliation model as raw plugin Skills.
- Provide one runtime capability registry composed from base and selected extension capabilities.
- Preserve the existing raw advisory Skill projection path.

**Non-Goals:**

- Converting raw vendor Skills to capability packages at scale.
- Dynamic installation from external sources.
- Subgraph projection or cross-profile plugin composition.

## Decisions

### Extension files reuse the managed installation contract

`plugin-capability` records are agent-tool-owned files under the selected tool Skill root. `plugin-profile` records are framework-owned project files under `researchspec/profiles/`. Existing reconciliation handles stale files, hash drift, strict uninstall preflight, and unavailable-selection snapshots for both kinds.

### Domain snapshots become three-closure snapshots

`plugin_resolutions` entries now carry `resolved_skill_ids`, optional `resolved_capability_ids`, and optional `resolved_profile_ids`. The snapshot remains schema 1 so existing workspaces parse unchanged.

### Runtime registry is selected-domain scoped

`loadWorkspaceCapabilityRegistry` starts with the base bundled registry and overlays capabilities resolved from the workspace's selected plugin domains. The combined registry has the same `LoadedCapabilityRegistry` shape, so `start`, `instructions`, and `advance` use it without engine changes.

### Runtime validation stays engine-owned

`start` validates the selected graph profile against the combined registry before freezing a run. `instructions node:` renders the manifest contract for capability nodes. `advance` passes the combined registry into the existing validator runner, so plugin capability validators execute under the same interpreter and timeout rules as core capabilities.

## Risks

- The pilot profile is one node with only the output-role policy validator; script validators for plugin packages will need the same runner contract review as core packages.
- Projecting extension profiles into the shared flat `profiles/` directory creates more preset-like files. Profile IDs remain globally unique through the extension registry.
