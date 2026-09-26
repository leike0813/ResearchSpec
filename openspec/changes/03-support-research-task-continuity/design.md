# Design

## Context

See `proposal.md` - Why. Change 01 already puts the note contract, the continuity-without-graph rule, and the confirmed-commitment boundary into `research-task-usage`, `arsu-user-routing`, `procedure-routing`, and `arsu-run-usage`, and extends two `companion-skills` requirements. Change 02 owns entry delivery, wrapper text, and the rule that command wrappers consume the canonical Navigate execution guidance instead of keeping a separate abbreviated mode policy. This change adds only the operative note ownership and resume behavior.

Because 01 also edits `companion-skills`, this change's `companion-skills` delta is written as the requirement reads after 01 and 02 are applied, so sequential sync merges rather than reverts. Of the two requirements 01 touches, 03 extends `Companions Use Current File Contracts` and 04 extends `Companion Guidance Exposes Only Graph Runtime Actions`; neither rewrites the other's.

## Goals / Non-Goals

**Goals:**

- Make a later session able to continue the right task without restating context.
- Make resume fail loudly on a difference that actually changes the work, and stay quiet otherwise.
- Keep the note firmly outside workflow authority.

**Non-Goals:**

- Restating 01's note fields or continuity rule.
- Restating 04's unified result report; 03 maintains the note, 04 reports results.
- Any task registry, index, schema, selector, or status change.
- Automatic notes for one-shot exchanges, or notes maintained by workers.

## Decisions

### One complete requirement block per touched requirement

OpenSpec merges MODIFIED requirements by replacing the whole block, so a partial block silently drops scenarios added by an earlier change. Each `companion-skills` delta in this change carries the full requirement text plus every scenario 01 introduces. Adding a new requirement instead was rejected because this is the same requirement gaining a resume clause, and a parallel requirement would split one behavior across two owners.

### Note updates stay in the main Agent

Workers already return a fixed brief and must not touch shared state, and parallel workers would otherwise interleave writes into one file. Ownership sits with the main Agent, after it validates worker outputs.

### Resume verifies materials and asks only when it matters

Modification order is not identity, so the note plus materials decide the task. A question is limited to a difference that changes the task identity, the required inputs, or the next step and that the materials cannot settle. Everything else is reported and the work continues, so ordinary drift does not become a consent request.

### Mode boundary and reporting are referenced, not redefined

The continuity-without-graph rule belongs to 01's `research-task-usage`, `arsu-user-routing`, and `procedure-routing`. The user-facing result report belongs to 04. This change owns note maintenance and resume only.

### Implementation stays in the Navigate contract

The behavior is instruction text in `src/adapters/companion/workflows/navigate.ts`, plus one ownership line in `src/adapters/companion/shared-guidance.ts` if a shared statement is needed. No new module, command, or state is required. If a generator or consumer must change to keep the rendered contract consistent, change it as the facts require.

Change 01 delivers only documents and specs, so its note contract and narrowed graph trigger exist nowhere in source until this change implements them. This change therefore owns the Navigate edits for 01's note fields and update timing, and for the three in-file places (`Non-goals`, the standalone rule, the graph rule) that still name persistence or resume as graph reasons. The requirement text itself stays in 01's `research-task-usage` capability and is referenced rather than redefined.

### One canonical guidance reaches every delivery mode

Skill, command, and both deliveries must expose the same note and resume behavior. Change 02 makes the command wrapper consume the canonical Navigate execution guidance, so this change edits the Navigate contract once and covers `skills`, `commands`, and `both` without authoring a second policy or editing the wrapper itself. Acceptance therefore checks each delivery mode, and commands mode must resolve references that actually exist rather than pointing at uninstalled Skill files.

## Risks / Trade-offs

- A later sync could drop 01's scenarios again -> each delta carries the full post-01 requirement, and the sync step verifies the merged main spec against both changes.
- Note drift versus real files -> resume rechecks materials and reports differences, asking only when the work itself is affected.
- Users could mistake a note for workflow authority -> notes stay out of the manifest and are never reported as run, Gate, or Decision state.
- Instruction-only behavior is hard to regression-test -> unit coverage stays with existing delivery and render checks, and the real-session scenarios are handed to change 05.
- Commands-only delivery could silently keep the old short policy -> 02's wrapper-consumption rule and this change's per-mode acceptance check that all three delivery modes carry the note and resume guidance.
