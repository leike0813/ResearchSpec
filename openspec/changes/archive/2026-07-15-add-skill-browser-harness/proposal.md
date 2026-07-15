## Why

ResearchSpec's installable Skill surface is assembled from three different production sources: generated ARSU trees, dynamically rendered Companion Skills, and domain plugin registries. Developers need one read-only view that exposes the current production projection without copying Skill content into a second manually maintained catalog.

## What Changes

- Add a repository-only web harness that compiles current TypeScript sources before startup and binds to all IPv4 interfaces for container and remote-development access.
- Present ARSU, Companion, and domain plugin Skills through their production source-of-truth paths, using an ARSU/Companion/Plugin hierarchy, plugin domain branches, and per-Skill file-tree workspaces.
- Render Markdown safely while retaining source views and non-executable access to other bundled resources.
- Add catalog, file-boundary, Markdown-safety, and HTTP integration tests.
- Keep the harness outside the published runtime surface; it does not add a public `researchspec` command or execute converters.

## Capabilities

### New Capabilities

- `skill-browser-harness`: Defines the local developer server, production Skill projections, browse interactions, and read-only security boundary.

### Modified Capabilities

None.

## Impact

- Adds repository-only code under `harness/`, a development launcher, TypeScript configuration, and tests.
- Adds `markdown-it` and its type declarations as development dependencies.
- Reuses the ARSU routing catalog and generated Skill tree, Companion manifest/renderer, plugin assembler, registry validator, and dependency resolver without changing their public contracts.
- Does not change workspace files, workflow authority, delivery behavior, npm runtime dependencies, or the sixteen-command CLI surface.
