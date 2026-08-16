## Why

The plugin graph-extension registry now validates plugin capability packages and graph profiles, but those extensions are not projected into workspaces and cannot be started or advanced. A graph-native plugin therefore exists only as catalog metadata. The next required step is to make selected domain extensions real workspace projections and runtime capabilities while preserving the existing advisory raw-Skill path.

## What Changes

- Extend the managed installation manifest with `plugin-capability` and `plugin-profile` source kinds and optional resolved capability/profile IDs in domain snapshots.
- Extend plugin projection reconciliation to install selected extension capabilities into every skill-capable Agent tool and selected extension profiles into `researchspec/profiles/`.
- Apply the same manifest ownership, drift, force, unavailable-selection preservation, and strict-uninstall rules to extension files.
- Add a base-plus-selected-extension runtime capability registry.
- Make `start` reject graph profiles with unavailable capabilities; make `instructions node:` return the capability manifest contract; make `advance` run capability validators for selected plugin capabilities.
- Expose resolved and projected capability/profile IDs through `status --json`.
- Extend `check plugins` to verify extension projection ownership and hashes.

## Impact

- No public CLI command changes.
- Installing the pilot `ecology` domain now projects `plugin-ecology-biodiversity` as a capability package and graph profile alongside the existing raw Skill.
- The pilot graph profile is startable and its node can be advanced through the normal graph CLI protocol.

## Capabilities

### Modified Capabilities

- `domain-skill-plugin-registry`: graph-extension projection and manifest ownership.
- `capability-graph-engine`: selected plugin capability registry overlay and runtime validation.

### New Capabilities

None.
