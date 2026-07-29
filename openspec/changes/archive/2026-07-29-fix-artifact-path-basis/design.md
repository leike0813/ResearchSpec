## Context

ResearchSpec has two registry path representations. Adaptive runtime records are
relative to the `researchspec/` workspace (`runs/current/...`), while unmigrated
strict Schema `0.2` records are relative to the project root
(`researchspec/runs/current/...`). Adaptive submission already produces the
first form, but generic consumers and several lifecycle writers still derive
paths from the project root. Patch lifecycle additionally tries the project root
and then the workspace, based on file existence.

Registered paths are authority: selecting a different existing file can validate
bytes that were never accepted. The resolution rule therefore must depend on
runtime authority rather than filesystem shape.

## Goals / Non-Goals

**Goals:**

- Make the runtime mode the single selector for registry path basis.
- Centralize lexical containment, absolute resolution, and POSIX
  serialization.
- Make all shared readers and lifecycle writers agree with submission.
- Preserve strict Schema `0.2` registry bytes and behavior.
- Keep strict-to-adaptive conversion explicit and deterministic.

**Non-Goals:**

- Add or change public CLI commands.
- Rewrite an existing registry during ordinary loading, checking, or updating.
- Change candidate paths, workflow output contracts, or other
  workspace-relative fields that are not registry Artifact paths.
- Introduce a dual-basis compatibility lookup.

## Decisions

### Decision: One runtime path module owns registry basis

Add `src/core/runtime/artifact-path.ts`. The module accepts the minimal runtime
path context (`workspace` and `runtimeMode`) shared by a
`WorkspaceSnapshot` and Doctor's raw observation:

- adaptive root: `snapshot.workspace`;
- strict root: `path.dirname(snapshot.workspace)`.

It returns the root, absolute path, and lexical containment result for a registry
path. It also converts an absolute path back to a POSIX registry path and rejects
paths outside the selected root. Consumers retain responsibility for their
domain-specific missing-file and hash diagnostics, but do not derive the basis
again.

Alternative considered: attach a resolved path to every Artifact while loading
the snapshot. This would couple low-level contract loading to filesystem
inspection and would not serve Doctor's raw recovery path when other authority
files are malformed.

### Decision: Runtime mode, never file existence, chooses the basis

No resolver probes both the project root and workspace root. The same declared
path can exist in both locations; existence fallback could select unregistered
bytes and make the result depend on unrelated filesystem state.

### Decision: Containment follows the selected basis

Adaptive paths must remain inside `researchspec/`. Strict paths retain the
legacy project-root boundary. Lexical containment is checked before filesystem
access; readers that follow a file path also verify its real path so symlink
targets cannot escape. Serialization uses `/` regardless of host path
separator.

### Decision: Writers serialize from their actual output path

Artifact Submit, patch lifecycle, and contract lifecycle pass their absolute
candidate, report, revised Artifact, and receipt paths through the shared
serializer. This keeps strict output as `researchspec/...` and adaptive output
as `runs/...` without per-writer branches.

### Decision: Migration is the only representation conversion

Strict runtime migration resolves source entries with the shared strict rule,
then serializes them against the adaptive target basis. Ordinary loads and
transactions do not mutate existing registry entries. Migration remains
plan-bound and explicit.

## Risks / Trade-offs

- **Existing malformed adaptive entries that relied on project-root fallback
  stop resolving** → Report them as missing or escaped; do not silently trust a
  second location.
- **Doctor must diagnose partially invalid workspaces** → Derive the runtime
  mode with the same raw `mode === "adaptive"` projection used by snapshot
  loading, without requiring all contracts to validate.
- **Strict and adaptive packs contain different nested Artifact entry paths** →
  Preserve each registry representation under the pack's `artifacts/` prefix;
  this is deterministic and exposes the authoritative path.
- **A writer accidentally targets the wrong root** → Shared serialization
  throws before registry content is built.

## Migration Plan

1. Introduce the shared module and migrate readers.
2. Migrate writers while retaining strict behavior in focused tests.
3. Use the shared strict resolver in runtime migration and keep adaptive output
   conversion explicit.
4. Run focused and full validation.
5. Archive the OpenSpec change with default delta-spec synchronization.

Rollback consists of reverting the implementation and spec sync. No workspace
data migration is performed by this change, so there is no data rollback.

## Open Questions

None. The runtime basis, compatibility boundary, and migration ownership are
fixed by the accepted plan.
