# Proposal

## Why

Change 01 defines ordinary task notes as the product-level continuity mechanism and removes continuation as a graph reason. The operative behavior is still missing: who maintains a note, how a later session decides which task it is continuing, and what the Agent may conclude when a note and the real files disagree.

## What Changes

- Define main-Agent ownership of ordinary task notes at `work/researchspec-notes/<task-id>.md`, including that delegated workers never write them.
- Define resume: check the recorded materials and outputs before continuing, never infer the task from modification order, and ask one focused question only when a difference affects the task identity, its inputs, or the next step and the materials cannot settle it.
- Define that a note never authorizes a claim about run, node, Gate, Decision, or handoff state, and that formal control appearing mid-task follows the existing graph rules.
- Add no task schema, task selector, capability index, or public CLI command.

## Capabilities

### New Capabilities

- `research-task-continuity`: note ownership, resume verification against real materials, scope resolution, and the boundary between a note and workflow state.

### Modified Capabilities

- `companion-skills`: the `Companions Use Current File Contracts` requirement, extended with resume verification. The delta is the full requirement as it reads after changes 01 and 02 are applied, and it preserves every scenario those changes introduce.

## Impact

- Navigate contract text in `src/adapters/companion/workflows/navigate.ts` and shared Companion guidance.
- Delivery, rendering, and the installed file tree are unchanged; no new asset, reference, or wrapper.
- Dependency order is 01 -> 02 -> 03 -> 04. The note contract and the continuity-without-graph rule belong to 01's `research-task-usage` capability and are referenced, never restated. Entry and wrapper text belong to 02. The unified result report belongs to 04.
- No public CLI, schema, dependency, or workflow-authority change.
