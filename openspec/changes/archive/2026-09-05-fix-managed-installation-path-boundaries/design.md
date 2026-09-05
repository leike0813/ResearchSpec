## Context

See proposal.md for the reproduced defect. Three retirement planners currently resolve untrusted manifest strings directly. The shared write executor checks final-file identity but not directory links. Workspace indexing also substitutes an empty manifest after parse failure.

## Goals / Non-Goals

Goals: one owner/source target resolver, shared filesystem checks, fail-closed mutation admission and behavioral regression coverage.

Non-goals: fixing the separate plugin config/projection transaction issue, changing public commands or manifest versions, dependency additions, or research runtime changes.

## Decisions

- Add a managed-target resolver using type-only installation imports and existing tool/catalog destinations. Lexical project-path validation is reusable but must allow legitimate `researchspec/profiles` paths. Source IDs used as path components must themselves be safe components. Version fields do not define paths. Retired packages are validated by source namespace, not current registry membership.
- Add internal `manifestStatus: missing | valid | invalid`. Reject invalid manifests precisely; do not block on every workspace diagnostic because update repairs missing/drifted projections. Missing manifests retain their existing treatment.
- Add optional `boundaryRoot` to write operations and planning inputs. Managed/generated mutations require it. Project operations use the trusted project root, MiniMax uses the trusted home directory and legacy Codex cleanup uses its configured home. The target or its dirname never establishes its own authority.
- One filesystem helper checks lexical containment then each existing descendant with `lstat`. Reject all descendant symlinks, even internal links, as confirmed by the user. Root itself may be a symlink. Missing descendants are permitted for creation.
- Validate before hash reads and planning, then in executor preflight, staging, commit and rollback/cleanup. Reuse existing conflicts and transaction handling. Direct config and manifest writers also check their project boundary.
- Keep path validation independent of file content hashes. Hashes remain the existing drift/ownership evidence within an authorized namespace, not authorization to leave it.

## Risks / Trade-offs

- Symlink-based installations now block, including links pointing inside a root. This is the selected explicit policy.
- Portable Node path checks cannot guarantee atomic protection against an adversarial OS process swapping directories between a check and syscall. Rechecks cover observed changes and the planning/execution gap; no stronger race-free claim is made.
- If rollback encounters a newly unsafe parent, it leaves recovery files rather than following the link. The operation reports failure.

## Migration Plan

No migration or format bump. Existing valid manifests continue to work; invalid existing manifests are reported and left unchanged. Keep the OpenSpec change active for review after implementation and validation.
