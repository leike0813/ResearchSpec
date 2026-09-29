# Proposal

## Why

The interactive manuscript review page only shows its full interface after a valid workspace JSON is imported. Maintainers currently have to enter a real research workflow to see and debug that interface.

## What Changes

- Add a repository-only command that opens the existing review page with representative, valid sample workspaces.
- Cover annotation intake, paper humanization, and review response with switchable examples that exercise review controls and manuscript formats.
- Generate preview files in ignored development output and document how to inspect or import a real workspace.

## Capabilities

### New Capabilities

- `review-workspace-preview-harness`: One-command local preview and debugging of the interactive review page using sample workspaces.

### Modified Capabilities

None.

## Impact

The change touches the development harness runner, sample generation, focused tests, and maintainer documentation. It does not change the published page, workspace/result contracts, public CLI, dependencies, or workflow authority.
