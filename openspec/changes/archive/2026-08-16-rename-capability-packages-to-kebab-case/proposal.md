## Why

The first capability graph authoring pass used dotted capability IDs such as
`cap.design.research-question-formulation` and stored packages in directories with the same dotted
name. That shape does not conform to the Open Agent Skills naming rule already enforced elsewhere in
ResearchSpec: Skill IDs must be lowercase kebab-case, and a Skill package directory, `SKILL.md`
frontmatter `name`, and registry ID must all match. Capability packages are projected as Agent
Skills, so they must satisfy the same identity contract.

## What Changes

- Rename all 38 capability IDs from `cap.<class>.<name>` to `cap-<class>-<name>`.
- Make the package identity contract explicit and enforced:
  - `capability_id` SHALL match `^[a-z0-9]+(?:-[a-z0-9]+)*$` (1-128 characters).
  - Bundled registry `source_path` SHALL equal `capability_id`, and therefore the package directory.
  - Generated `SKILL.md` frontmatter `name` SHALL equal `capability_id` via the existing authoring
    renderer.
- Update graph profile nodes, authoring sources, capability tests, taxonomy documentation and the
  human-review artifact generators to the new IDs.
- Delete the old dotted package directories and regenerate `skills/capabilities/**`,
  `registry.json`, the parity report and all three review HTML artifacts.

## Impact

- This is a breaking identity rename for bundled capability packages. Capability IDs referenced by
  graph profiles are updated in the same change; old dotted IDs resolve nowhere after regeneration.
- No CLI command surface, workspace schema, runtime protocol, capability count, input/output role or
  validator semantics change.
- The parity and matching audits remain at 38 operational packages, 113/116 anchors preserved, 3
  flow anchors engine-owned and 0 semantic gaps.

## Capabilities

### Modified Capabilities

- `capability-manifest`: capability IDs gain a dedicated kebab-case schema and the registry
  source-path identity invariant.
- `arsu-converter`: generated package identities are kebab-case by construction and remain
  deterministic.
