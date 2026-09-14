## Why

MiniMax Code is the only supported Agent tool that requires a global Skill root, which makes project initialization own machine-wide state for one exceptional adapter. The restored interactive initializer also needs visible controls and a safe cancellation path so users can understand and abort selection before any workspace write.

## What Changes

- **BREAKING** Remove MiniMax Code from the supported Agent-tool catalog and reject `minimax-code` as a tool selector.
- Remove global Skill-root delivery and detection from the current Agent-tool model while retaining narrowly scoped legacy Codex prompt cleanup.
- Show navigation, selection, confirmation, and cancellation guidance below interactive choices.
- Treat `Ctrl+C` as an intentional initialization cancellation and leave workspace files unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-tool-delivery`: Reduce the supported tool catalog to project-scoped tools and define visible, cancellable interactive selection.

## Impact

The Agent-tool registry, delivery and reconciliation planning, interactive CLI prompt, init error handling, package verification, tests, and project usage documentation are affected. Existing configurations that select `minimax-code` are no longer accepted by the current schema contract.
