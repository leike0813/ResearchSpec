## Context

See `proposal.md` for motivation. The current branch already has schema `"2"` graph profiles, frozen runs, node instances, capability manifests and a graph-oriented CLI, but several paths still preserve the removed subflow model or bypass the ownership and validation boundaries used elsewhere. The runtime is pre-release and explicitly has no compatibility reader or migration authority, so the repair can hard-cut the incomplete schema `"2"` representation instead of adding dual behavior.

## Goals / Non-Goals

**Goals:**

- Give every graph transition, control action and subgraph exactly one state owner.
- Make all graph validation and path handling fail closed before writes.
- Use generated registries as the only profile, capability, delivery and release surface facts.
- Preserve reviewed vendor bytes while keeping authored code and prose under a useful whitespace gate.
- Remove legacy runtime guidance from public Skills, wrappers, payload help, tests and current-state documentation.

**Non-Goals:**

- Schema `"1"` migration, compatibility reads, rollback conversion or semantic repair.
- New top-level CLI commands, model-provider integration or ResearchSpec-managed boundary deliverables.
- Executing vendor resources, validators during static commands, or external services during verification.

## Decisions

### 1. Model Gates and Decisions as action records, not lifecycle writes

The frozen graph keeps Gate and Decision declarations, while the owning node instance stores their immutable append/replace-by-CAS control records. Frontier evaluation treats a valid record as satisfaction of that control point. `decide` never writes `state: complete`; only the execution-node advance transaction can complete an execution node after output and validator checks.

This preserves one transition authority and allows status to explain whether a blocker is an unfinished execution node, an unconfirmed Gate or an unchosen Decision. Keeping the current implicit completion was rejected because it makes confirmation indistinguishable from validated work.

### 2. Represent subgraph execution as a separately frozen child run

`GraphSubgraph` gains required `entry_id` and `entry_node_id` fields so both end-to-end and multi-point mid-entry profiles resolve deterministically. Validation cross-checks both fields against the selected child profile. `GraphRun` gains `authorization_origin` and an optional `parent_binding` containing `parent_run_id`, `parent_node_id`, `subgraph_id` and optional `round`.

Starting an eligible subgraph selector searches the workspace run index for that exact binding. It returns the existing matching run or atomically creates one normal child run with a freshly frozen child graph. More than one match, a mismatched frozen profile, or an invalid entry is an integrity blocker. A child run has no independent root confirmation because its authority is bounded by the confirmed parent graph; its own Gates and Decisions still require confirmation.

The parent subgraph node has no submission path. Frontier/status project it as pending-start, active, blocked or complete from the child run. On child completion, declared child handoff roles are mapped to parent output roles. Embedding child state inside the parent instance was rejected because it would create a second run format and duplicate graph evaluation.

### 3. Centralize validation and safe paths before transaction planning

A branded safe project-relative path schema normalizes POSIX separators and rejects absolute paths, empty/current paths, `.` or `..` segments, backslashes and the reserved `researchspec` top-level directory. Contracts reuse it for run handoffs, node outputs, input bindings and validator file references.

The execution API requires a resolved capability registry and validator registry. Policy and schema validators dispatch through explicit registries; an unrecognized kind, ID, schema or policy is an error. Validation produces a complete result before the existing CAS/atomic write plan is built. Optional registries and permissive default branches are removed.

### 4. Project bounded cards and drift without changing frozen authority

Node-card construction resolves declared input roles to bounded project paths or parameter values and returns an error result with a stable blocker code when the node is not eligible. It does not expose an executable card with `eligible: false`.

Workspace status loads only the current profile matching each frozen run's profile ID, compares profile version and canonical hash, and reports a bounded drift diagnostic. The frozen graph remains authoritative and no status operation writes files.

### 5. Make converter output the profile SSOT and reuse delivery transactions

Preset profile authoring moves from core TypeScript modules into converter-owned generated profile files plus a registry under the capability package tree. Converter checks cross-validate profile IDs, versions, entries, capabilities and hashes. Core bootstrap loads this registry and does not construct graph objects.

Framework capability and profile targets are added to the existing desired-file planner. One preflight checks current bytes and manifest ownership for all targets; writes use sibling temporary files and atomic replacement, and the ownership manifest commits last. Project-change decisions reuse the same CAS write primitive. A parallel bootstrap-only writer was rejected because it would retain the overwrite bug and duplicate reconciliation rules.

### 6. Derive licensing and release assertions from reviewed catalogs

Scientific and Education extension generators read applicable license identity from their vendor/catalog policy rather than a shared literal. Their maintenance workflows regenerate packages and registry hashes, preserving resource bytes.

The package verifier derives fixed Skills, capabilities, profiles and optional Adapter expectations from packaged registries. A new authored-whitespace checker builds an exact exemption set only from entries explicitly marked byte-preserved and verifies every exempt file's reviewed hash before ignoring its whitespace. It then applies whitespace checks to the remaining changed text files. Broad directory exclusions and normalization of reviewed resources were rejected.

### 7. Remove the legacy protocol from its generation sources

ARSU converter contract injections and Companion workflow sources are updated first, then their generated Skills and command/help payloads are regenerated. Obsolete selector contracts and core graph modules are deleted only after repository-wide search confirms no production consumer. Current-state docs and stable acceptance/release specs are updated in the same change so no published instruction can route an Agent back to subflows.

## Risks / Trade-offs

- **[Risk] Existing uncommitted schema `"2"` workspaces can fail stricter parsing.** → Treat them as unsupported pre-release state and report a zero-write diagnostic; do not infer or repair missing child bindings.
- **[Risk] Child-run completion could recurse through cyclic profiles.** → Validate profile/subgraph references for cycles before start and bound status traversal by visited run IDs.
- **[Risk] Registry-derived release checks can become too permissive if the registry itself drifts.** → Verify registry schema, reviewed hashes and fixed release-set invariants before using it as an expectation source.
- **[Risk] A byte-preserved exemption could hide authored whitespace.** → Require an exact path plus matching reviewed hash; unknown, changed or unhashed files remain checked.
- **[Risk] Unifying bootstrap writes increases the size of one transaction.** → Retain full preflight and commit the manifest last so failures remain zero-write or diagnosable before ownership publication.

## Migration Plan

1. Land delta specs and failing behavior tests for graph authority, child bindings, fail-closed validation and safe paths.
2. Update contracts/runtime and regenerate current preset profiles; reject prior incomplete schema `"2"` run shapes rather than migrating them.
3. Move core projections into the common delivery transaction, then remove hard-coded profile and legacy selector modules.
4. Regenerate ARSU, Companion, Scientific and Education artifacts through their owning workflows.
5. Update release verification, authored-whitespace checking, documentation and packaged acceptance tests.
6. Run strict OpenSpec validation, focused tests, full tests, type/build checks, vendor maintenance checks and installed-tarball verification before archive.
