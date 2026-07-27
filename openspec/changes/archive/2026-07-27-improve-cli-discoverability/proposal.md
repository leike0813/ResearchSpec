## Why

ResearchSpec exposes seventeen public commands and descriptor-driven runtime
actions, but its static help, selector error hints, packaged documentation, and
Agent-facing guidance do not share one discoverable command model. This leaves
users and Agents with stale strict-only examples, incomplete adaptive selector
hints, repeated command lists, and no packaged reference that explains where
static CLI help ends and current runtime authorization begins.

## What Changes

- Introduce one typed static CLI command catalog for global options, all
  seventeen top-level commands, and the `plugin` subcommands.
- Render Commander help metadata and a deterministic packaged CLI handbook from
  that catalog while keeping handler bindings explicit.
- Derive invalid-selector guidance from the supported selector-family contract
  so adaptive, strict, and governance selectors remain discoverable together.
- Project the same handbook as an optional, manifest-owned
  `researchspec-navigate` reference without adding a Skill or wrapper.
- Teach Navigate to distinguish static command discovery from workspace-bound
  `status` and action-descriptor instructions.
- Correct canonical and CLI documentation drift, package only reachable
  documentation links, and extend release/acceptance checks around the
  discoverability contract.
- Preserve the fixed seventeen-command, fifteen-Skill, and eight-wrapper
  surfaces.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `cli-interface`: Define catalog-backed static command discovery, contextual
  help, complete selector-family hints, and the boundary between help and
  runtime authorization.
- `companion-skills`: Add optional progressive-disclosure CLI handbook use to
  Navigate while retaining a self-contained core workflow.
- `agent-tool-delivery`: Deliver the Navigate handbook reference as a
  manifest-owned generated file without changing Skill or wrapper membership.
- `arsu-user-routing`: Route natural-language CLI discovery requests through
  Navigate without starting academic work.
- `arsu-user-model-acceptance`: Exercise static help, handbook fallback, and
  descriptor-bound continuation as a user journey.
- `mvp-release-readiness`: Package and verify the generated handbook, reachable
  documentation, and unchanged fixed surface.

## Impact

The change affects CLI registration metadata and error guidance, Companion
rendering and delivery, the tool-installation manifest contents, generated
documentation, package allowlists and release verification, user-journey
traceability, and the canonical/CLI documentation. It adds no public command,
runtime selector, wire schema, dependency, Skill, wrapper, workflow state, or
workspace migration.
