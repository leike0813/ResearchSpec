## Why

ResearchSpec already projects agent-neutral Skills and commands, but its ARSU workflow guidance cannot yet ask the CLI which research work item is ready, what dependencies it must read, or which output contract it must satisfy. A typed, read-only workflow control plane is needed before the project can safely design artifact submission and state-transition writes.

## What Changes

- Add a typed work-item graph to the workflow contract, including producer Skill, dependencies, output, validation, completion, and allowed-write metadata.
- Add an explicit `arsu-research-slice` profile for the RQ Brief → Bibliography → Synthesis research sequence while leaving the default `arsu-paper` profile unchanged.
- Extend `status --json` with a deterministic `workflow_control` frontier and add `instructions work:<id>` for ready-item instruction packets.
- Reuse one artifact path/hash inspection primitive across workspace checks and workflow completion evaluation.
- Update `researchspec-next` to consume CLI-derived work-item state and instructions instead of inferring stage routing from static text.
- Preserve legacy workspaces without `work_items` as valid but dynamically unconfigured.
- Keep artifact submission, runtime state transition, and registry/ledger writes out of this change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `framework-core`: Add typed workflow definitions, profile-aware initialization, deterministic work-item evaluation, and legacy-workspace behavior.
- `cli-interface`: Add the public `instructions` read command and the workflow-control status contract.
- `companion-skills`: Make `researchspec-next` route from dynamic work-item status and instructions.

## Impact

- Affects workspace workflow/state templates, snapshot validation, runtime status evaluation, artifact checking, CLI handlers, handoff/pack status consumers, and the Next companion workflow.
- Adds one experimental initialization profile and one public read-only CLI command.
- Extends JSON envelope data without changing envelope schema version `1` or existing status fields.
- Adds no dependency, migration command, semantic write path, or runtime LLM integration.
