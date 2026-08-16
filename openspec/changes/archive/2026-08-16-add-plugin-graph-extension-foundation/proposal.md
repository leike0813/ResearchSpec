## Why

Domain plugins currently project only advisory Open Agent Skills. The next graph-native step requires a validated extension surface for plugin capability packages, plugin graph profiles, and domain assignments before those extensions can be projected and executed. Without this foundation, graph mode has no reviewed path for a domain plugin to contribute a capability ID or profile ID.

## What Changes

- Add `skills/plugins/extensions/registry.json` schema 1 with hashed capability packages, hashed graph profiles, and domain assignments.
- Add `src/plugins/extensions.ts` validation and loading for extension manifests, `SKILL.md`, knowledge refs, profile text, profile identity, graph capability references, and domain assignment references.
- Add a pilot `ecology` assignment carrying `plugin-ecology-biodiversity`: one operational vendor-derived capability package and one one-node graph profile derived from the reviewed ToolUniverse ecology Skill.
- Extend `check plugins` to validate the extension registry, selected-domain extension resolution, collisions with the base capability registry and raw plugin Skill IDs, and profile capability references.
- Expose extension capability/profile counts in `plugin list` and `plugin show`.

## Impact

- No public CLI command changes.
- Extension files are static package assets; check validates bytes and never executes them.
- Raw advisory plugin projection remains unchanged in this stage.

## Capabilities

### Modified Capabilities

- `domain-skill-plugin-registry`: adds the graph extension registry foundation and its check semantics.

### New Capabilities

None.
