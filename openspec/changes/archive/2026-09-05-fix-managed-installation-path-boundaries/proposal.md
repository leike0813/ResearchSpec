## Why

An untrusted installation manifest can claim a project-external file through `../` and cause plugin cleanup to schedule its removal when the recorded hash matches. Ordinary tool and literature Adapter reconciliation share this trust gap, and parent-directory symlinks can also redirect generated writes.

## What Changes

- Validate installation paths against scope, owner, source namespace and the existing tool/catalog target definitions before consuming ownership evidence.
- Reject malformed or unsafe manifests at mutation entrypoints instead of treating them as empty ownership records.
- Check trusted path boundaries and reject symlinks during planning, execution and rollback of managed operations.
- Preserve current drift protection, unavailable-plugin retirement and shared-global preservation behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-tool-delivery`: define managed target boundaries, manifest failure behavior and filesystem checks.
- `domain-skill-plugin-registry`: require safe plugin target validation for every lifecycle operation.

## Impact

Installation DTO validation, workspace indexing, delivery reconciliation, write plans and bootstrap/plugin handlers change internally. The manifest version and public CLI stay unchanged. No dependencies or research runtime protocol changes are required.
