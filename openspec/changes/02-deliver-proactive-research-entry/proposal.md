# Proposal

## Why

Research tasks do not reliably select the single Navigate entry without user reminders. Skill discovery alone does not supply a project-level research working agreement, and existing whole-file ownership cannot safely update shared instruction files.

## What Changes

- Follow `01-reorient-research-task-usage`: deliver a short research entry agreement independently of Skill/command delivery mode.
- Describe the entry mechanism for every registered target, using documented native rule files or managed regions and an explicit discovery-only fallback.
- Preserve user bytes and concurrent edits through manifest-owned regions and the existing write transaction.
- Expose mechanisms in `list tools` and static missing, drift and shadowing diagnostics in `doctor`.
- Name natural research tasks in Navigate discovery metadata and share its execution guidance with command wrappers, so commands-only delivery retains the same behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-tool-delivery`: Project entry instructions and region ownership.
- `agent-surface-model`: Entry agreements do not create another Skill or product capability.
- `cli-interface`: Tool entry metadata and static diagnostics.

## Impact

Adapters, installation manifest source records, managed target validation, bootstrap reconciliation, CLI inspection, focused installation tests and host documentation. No new dependency, top-level command, model service or graph-state schema.
