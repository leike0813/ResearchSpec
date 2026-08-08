## Context

The profile contract currently gives both entry kinds a single checkpoint. The converter projects `academic-pipeline:mid-entry` at `entry`, while frontier evaluation finds children only at child or parallel-group checkpoints. Start therefore creates a valid-looking parent that has no executable frontier. See `proposal.md` for motivation and the delta specs for observable behavior.

The fix must preserve workspace/profile schema version `1`, the CLI's fixed command surface, independent child confirmation, and the current separation between profile-owned graph policy and per-subflow control authority.

## Goals / Non-Goals

**Goals:**

- Make the actual user-selected child the persisted and executable parent entry checkpoint.
- Express mid-entry choices in typed profile data and reuse one entry-state predicate across dependency, branch, and repeatable-round evaluation.
- Reject malformed profiles and invalid Starts before mutation.
- Keep later progression identical to ordinary profile execution.

**Non-Goals:**

- Migrating, repairing, or guessing an entry point for existing controls at checkpoint `entry`.
- Importing historical rounds, Gates, Decisions, or completion state from external material.
- Changing the global meaning of optional children or introducing a new CLI command/schema version.

## Decisions

### Use a discriminated profile entry contract

`end-to-end` retains a single `checkpoint`; `mid-entry` owns `entry_points`. Profile validation directly checks that mid-entry choices are unique existing children. This removes the converter's special allowance for `entry` and prevents a future projection from encoding another unreachable synthetic entry.

Alternative: retain `checkpoint: entry` and add synthetic transitions from it. That would leave selection outside the persisted Start contract and complicate branch and prerequisite semantics.

### Bind entry selection at parent Start

The Start command gains optional `entry_point`, with context-sensitive runtime validation: required for mid-entry parents and forbidden elsewhere. The parent stores the choice in the immutable Start confirmation and starts at the selected node. Child creation remains a separate operation and confirmation.

Alternative: choose the entry through a later Decision. That preserves the empty-frontier interval and makes the Start confirmation incomplete.

### Model first-entry eligibility as parent state

A shared predicate recognizes a confirmed mid-entry parent whose checkpoint matches its stored entry point and whose transition history is empty. Dependency checks, branch unlocks, and repeatable-round derivation consume this predicate. Pause/resume does not alter it because lifecycle events are not profile transitions. Once an advance records the first transition, ordinary evaluation resumes automatically.

Only profile-internal upstream dependencies and branch unlocks are bypassed. Route prerequisites, handoff roles, declared Gates, file and format checks, cost, and child confirmation continue through their existing validation paths.

Alternative: mark every possible entry node optional or weaken dependency checks globally. That would silently broaden end-to-end and unrelated profile behavior.

### Derive local round identity from the selected entry

When the first selected node is a repeatable revision or re-review node, the initial child uses round 1. Subsequent nodes use existing completed-round derivation. No external historical round is imported.

### Diagnose legacy controls without migration

Workspace checking validates a parent checkpoint against current profile child and group IDs and emits `subflow_checkpoint_invalid`. Status and checks remain read-only, and the invalid control is left for explicit lifecycle handling.

## Risks / Trade-offs

- [Schema version remains `1` while the Start/profile shape changes] → The project already treats generated profile identity and current workspace artifacts as a single current contract; keep projection hashes/checks synchronized and reject malformed payloads explicitly.
- [The entry exemption could leak beyond the first child] → Centralize the predicate and require an empty profile transition history plus checkpoint/confirmation equality.
- [Later entry points may lack required external inputs] → Retain existing route prerequisite, handoff, Gate, manuscript, and file validation unchanged.
- [Legacy `entry` parents remain unusable] → Emit one stable diagnostic and document that no inference or automatic repair is performed.

## Migration Plan

Regenerate the academic-pipeline projection and update runtime validation atomically. New Starts use the selected entry contract. Existing valid controls continue unchanged; existing `entry` controls are reported but not rewritten. Rollback consists of restoring the previous generated profile and runtime together; no data migration is applied in either direction.
