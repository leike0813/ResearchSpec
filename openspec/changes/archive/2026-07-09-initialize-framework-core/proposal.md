# Initialize ResearchSpec Framework Core

## Why

ResearchSpec has completed its first design pass for becoming the ARSU-facing,
agent-neutral contract framework. The repository now needs a real implementation
foundation so the documented workspace layout and user-facing CLI can be tested
instead of remaining design-only.

The first implementation slice should stay small: establish a pnpm + TypeScript
project scaffold, expose a minimal `researchspec` CLI, create the documented
contract workspace skeleton, and provide basic `status` / `check` feedback. This
creates the framework core without prematurely absorbing ARSU, building adapter
delivery, or implementing the full command surface.

## What Changes

- Add the initial TypeScript project scaffold using pnpm as the intended package
  manager.
- Add a CLI entrypoint named `researchspec`.
- Implement the first command slice:
  - `researchspec init [path]`
  - `researchspec status`
  - `researchspec check [target]`
  - help and version output
- Generate a minimal `researchspec/` workspace skeleton that matches the current
  design docs.
- Add basic validators for required files, parseable machine contracts, and
  initialized vs missing workspace state.
- Add focused tests for dry-run init, initialized workspace status, and check
  behavior.

## Impact

- Affected specs: `framework-core`
- Affected code: new TypeScript CLI/framework implementation
- New public CLI surface: minimal `researchspec` executable with `init`,
  `status`, `check`, help, and version
- New generated workspace surface:

```text
researchspec/
  specs/
    project.md
    sources.yaml
    claims.yaml
    manuscript.yaml
    workflow.yaml
  runs/
    current/
      state.yaml
      artifact-registry.json
      decision-ledger.jsonl
      gate-ledger.jsonl
  changes/
  draft-patches/
```

## Non-Goals

- Do not absorb ARSU in this change.
- Do not implement ARSU converter maintenance.
- Do not implement adapter skill/slash-command delivery.
- Do not implement `decide`, `archive`, `pack`, `handoff`, `list`, or `show`.
- Do not freeze complete JSON stdout schemas, exit code tables, or adapter path
  rules.
- Do not install dependencies or generate lockfiles as part of the change
  artifacts.
