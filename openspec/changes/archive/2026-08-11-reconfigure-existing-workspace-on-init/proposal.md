## Why

`researchspec init` currently delegates an existing current workspace directly to the additive `update` path. An ordinary interactive re-run therefore skips the bootstrap selectors and cannot reconfigure the workspace in the same way as OpenSpec init.

## What Changes

- Reopen the Agent-tool and optional literature-Adapter selectors when interactive init targets an existing current workspace.
- Preselect current choices, leave detected-only tools visible but unselected, and treat the confirmed result as the complete desired selection.
- Give explicit re-init selection options the same replacement semantics while preserving current selections for omitted non-interactive options.
- Reconcile deselected project projections through the existing manifest ownership and drift-protection rules.
- Preserve delivery mode when omitted, preserve domain plugin selection, and leave `update` semantics unchanged.
- Clarify typed CLI help, generated reference pages, the canonical usage model, and the workspace lifecycle rehearsal.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-tool-delivery`: Interactive re-init presents current configuration and safely reconciles an exact replacement selection.
- `cli-interface`: Existing-workspace init has explicit interactive, option, and machine-mode configuration semantics.

## Impact

This changes bootstrap selection and reconciliation in the CLI, focused current-workspace tests, typed init help, generated CLI documentation, and current user guidance. It adds no command, option, dependency, config field, schema version, migration, plugin selector, or runtime service interaction.
