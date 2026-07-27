## Context

The public CLI is registered directly in `src/cli/main.ts`. Commander therefore
owns the effective command names, descriptions and options, while tests,
README tables, CLI design prose and Companion examples repeat overlapping
subsets. Runtime writes have a stronger dynamic source of truth:
`status --json` returns bounded action summaries and
`instructions <selector> --json` returns Action Descriptor v2. Static help
cannot safely replace that descriptor.

The current discoverability gap has four parts:

- root and command help are human-readable but not backed by reusable typed
  metadata;
- invalid selector guidance omits adaptive families even though the selector
  schemas accept them;
- packaged documentation repeats stale strict-only flow and links to
  repository-only runtime documents;
- Navigate contains the correct core CLI discipline but has no compact,
  generated reference for command inventory and syntax.

Companion Skills must remain usable from their `SKILL.md`, generated files must
remain manifest-owned and drift-safe, and the fixed seventeen-command,
fifteen-Skill and eight-wrapper surfaces cannot expand.

## Goals / Non-Goals

**Goals:**

- Establish one typed source for static public command metadata.
- Generate human and Agent command references from that source.
- Improve root, command, plugin and usage-error discovery without requiring a
  workspace.
- Keep static command discovery separate from current runtime authorization.
- Make all supported action selector families visible in error recovery.
- Preserve deterministic generated-file ownership and package verification.

**Non-Goals:**

- Add a `researchspec-cli` Skill, Companion, wrapper or public command.
- Add `instructions cli:<command>` or another static selector family.
- Copy dynamic semantic input schemas, current availability, action basis or
  execution policy into the handbook.
- Make the handbook a hard dependency for Navigate.
- Change runtime transactions, workspace schemas, state, Gate, Decision,
  receipt or migration behavior.
- Package the complete repository-only runtime documentation set.

## Decisions

### Use a typed static command catalog without making handler dispatch generic

A new catalog defines global options, the seventeen top-level commands and all
public `plugin` subcommands. Each entry contains a stable ID and command path,
syntax, group, description, workspace requirement, static effect class, local
options and related commands. A registration helper applies this metadata to
Commander; `main.ts` continues to bind each typed handler explicitly.

This keeps command help and the handbook DRY without hiding command-specific
argument types or callbacks inside a generic dispatch table. Introspecting an
already-built Commander tree was rejected because it would make the renderer a
secondary parser of human help structures rather than a typed product model.

### Keep static discovery and runtime authorization as separate protocols

The installed discovery ladder is:

1. `researchspec --help` discovers commands;
2. `researchspec <command> --help` discovers syntax and options;
3. `status --json` and `instructions <selector> --json` discover what the
   current workspace permits and how to execute it.

Usage errors resolve the longest recognized command path and point to its help
surface. The static catalog may describe whether a command is read-only,
writing or conditionally writing, but it never snapshots descriptor-owned
semantic payloads or execution policies.

Extending `instructions` with `cli:` was rejected because it would mix a
workspace-independent command encyclopedia with current action packets and
would weaken the stable meaning of action selectors.

### Co-locate selector-family display metadata with selector schemas

`action-selector.ts` exports a typed list of accepted selector families with
safe examples and display patterns. `ActionTargetSelectorSchema` and
invalid-selector recovery consume the same family definitions, and tests prove
that every displayed example parses. This removes the hand-written strict-only
hint from the CLI handler.

### Generate one handbook for package docs and Navigate projection

One deterministic renderer consumes the command catalog and selector-family
metadata. Its checked-in output is `docs/cli_handbook.md`; the exact same bytes
are projected to
`researchspec-navigate/references/cli-handbook.md` for every selected tool.
The package publishes the top-level document, while the normal tool
installation manifest owns each projected reference and applies existing
drift-preservation and `--force` behavior.

The handbook contains static command cards: purpose, synopsis, arguments and
options, workspace/effect properties, related commands and the discovery
boundary. It does not contain complete multi-command recipes or runtime action
payloads.

### Preserve Companion self-containment with an optional reference

Navigate keeps the three-step discovery ladder and all authority rules in its
generated `SKILL.md`. It reads the handbook only for a request about command
inventory, syntax, stable effects or related commands. If the reference is
missing or drifted, Navigate uses CLI help and continues; Route, Resume,
Explain and Export never depend on the reference.

This permits progressive disclosure without moving execution-critical
discipline out of `SKILL.md`. The other Companions receive no handbook
reference.

### Verify generated relationships instead of freezing prose

Unit and package checks compare catalog membership, rendered-file identity,
reference digests, link reachability and key static/dynamic boundaries. Tests
do not snapshot complete help or Markdown prose. Exact byte comparison is used
only to prove that converter-owned handbook outputs match their renderer.

## Risks / Trade-offs

- [Catalog registration refactor changes Commander parsing] → Preserve command
  order, syntax, required flags and explicit handlers; compare every registered
  root and plugin command with the catalog in black-box tests.
- [Static effect labels are mistaken for authorization] → Repeat the
  static/dynamic boundary in help, handbook and Navigate; current writes still
  require status and the action descriptor.
- [Optional reference becomes an undeclared hard dependency] → Keep the full
  fallback ladder in `SKILL.md` and test missing-reference behavior by
  construction.
- [Generated handbook drifts] → Provide deterministic generate/check
  entrypoints and fail release verification when checked-in, packaged or
  projected bytes diverge.
- [More generated files increase reconciliation work] → Reuse the existing
  `companion-skill` installation source and manifest lifecycle rather than add
  another ownership schema.

## Migration Plan

1. Synchronize the delta requirements into main specs.
2. Add the catalog, selector-family metadata, registration helper and handbook
   renderer.
3. Generate the checked-in handbook and update Navigate delivery.
4. Correct canonical/package documentation and traceability.
5. Run focused help, selector, delivery and handbook tests, then the complete
   test and release gates.

Existing workspaces require no data migration. A normal `researchspec update`
will add the managed Navigate reference; local drift is preserved under the
existing policy. Rollback removes the catalog/renderer and restores the
previous static registration while manifest reconciliation removes only
hash-clean generated references.

## Open Questions

None.
