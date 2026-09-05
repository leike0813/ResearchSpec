## Why

Review findings 4 and 5 identify separate plugin projection/config/manifest commits and incomplete installed-package journey coverage. A failed plugin commit can leave selection and ownership inconsistent, while minimal-only acceptance cannot verify child runs and repeated revisions through completion.

## What Changes

- Commit plugin install, update and uninstall through one existing write plan with config and manifest snapshot preconditions and shared rollback.
- Exercise a complete academic pipeline with child runs, human Gates, Decisions, two revision rounds and fresh-process resume against the installed tarball.
- Correct compiled-CLI test naming and document actual transaction and acceptance guarantees.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-tool-delivery`: plugin selection, projection and ownership participate in one failure-handling boundary with snapshot conflict detection.
- `arsu-user-model-acceptance`: installed-tarball acceptance completes a root/child graph with two revision rounds and verifies persisted completion after resume.
- `capability-graph-engine`: clarify initial revision entry after ordinary prerequisites, without a nonexistent preceding-round Decision.

## Impact

Plugin delivery and CLI handlers, existing behavioral tests, the package verifier, and maintainer/developer documentation. No public command, schema or dependency changes. Temporary tarball dependency installation is authorized; publication and Git commits are excluded.
