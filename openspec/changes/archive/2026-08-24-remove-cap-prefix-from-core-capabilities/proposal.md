## Why

Core capability packages under `skills/capabilities/` are already kebab-case and have one identity
across their package directory, `SKILL.md` frontmatter `name`, manifest `capability_id`, and registry
`source_path`. The remaining `cap-` prefix is now redundant: these packages are the only capability
packages rooted under `skills/capabilities/`, and their class is already encoded in the first
hyphenated segment (`analysis-*`, `check-*`, `design-*`, `discovery-*`, `generation-*`,
`judgment-*`, `transform-*`). Removing the prefix makes the projected Skill names match their
semantic role directly.

## What Changes

- Rename all 47 core capability IDs from `cap-<class>-<name>` to `<class>-<name>`.
- Rename every package directory under `skills/capabilities/` and regenerate `SKILL.md`,
  `manifest.yaml`, and `registry.json` through the authoring converters.
- Update authoring sources, graph profiles, packaged ARSU guidance, tests, taxonomy and spec
  documentation, parity report, and the three ARSU review HTML generators to the new IDs.
- Keep plugin extension IDs unchanged (`plugin-<vendor>-*`). Plugin packages are installed under
  `skills/plugins/` and continue to carry their source-specific prefix.
- Refresh the current ARSU and own-vendor maintenance anchors so their manifests, records, and
  review artifacts refer to the new core IDs.

## Impact

- This is a breaking identity rename for bundled core capability packages. Every internal reference
  is updated in the same change; old `cap-*` IDs resolve nowhere after regeneration.
- No CLI command surface, workspace schema, runtime protocol, capability count, input/output role,
  validator, graph node, Gate, or Decision semantics change.
- The parity and matching audits remain at 47 operational packages with the same coverage and gap
  verdicts.

## Capabilities

### Modified Capabilities

- `capability-manifest`: documents that core capability IDs omit the `cap-` prefix while plugin
  extension IDs retain their `plugin-*` prefix.
- `arsu-converter`: authoring source IDs and generated core package identities use the prefix-free
  names and remain deterministic.
