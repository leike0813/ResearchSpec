# Proposal

## Why

Once entry is proactive, the next failure is inside the capability layer. A natural request, including a Chinese-language one, may not match the compact catalog card vocabulary, and a multi-step request can stall because the Agent does not connect one procedure's declared output to the next procedure's declared input. Users then supply procedure names or exact commands, which is the friction this effort exists to remove.

## What Changes

- Define how Navigate turns a natural request into short catalog search terms, retries once with different terms, and only then falls back to host-native work.
- Define capability chaining through declared outputs and explicit ordinary project-relative paths.
- Define the single unified result report for completed standalone capability work: outcome, evidence and limits, unresolved items, next step, and produced paths, with internal terms shown only when the user must act on them. This is the only owner of that report; change 03 owns only the task note.
- Keep optional plugin assistance bounded to the existing suggestion count, exact preview, and separate consent, and keep declining it from changing the route.
- Route an existing relevant unfinished confirmed run before a standalone chain instead of bypassing its pending controls, without reopening a completed run.

## Capabilities

### New Capabilities

- `research-capability-collaboration`: intent-to-keyword discovery over the existing catalog, declared-input/output chaining, the unified standalone result report, bounded optional plugin assistance, and graph-run precedence during selection.

### Modified Capabilities

- `companion-skills`: the `Companion Guidance Exposes Only Graph Runtime Actions` requirement, extended so a natural request can select and chain capabilities and the completed result is reported with its ordinary paths. The delta is the full requirement as it reads after changes 01 and 02 are applied, and it preserves every scenario those changes introduce.

## Impact

- Navigate contract text in `src/adapters/companion/workflows/navigate.ts` and shared Companion guidance.
- Reuses the existing offline lexical procedure catalog; no new search engine, index, or embedding.
- Dependency order is 01 -> 02 -> 03 -> 04. The search and routing boundary belongs to 01's `procedure-routing` and `arsu-user-routing`; entry and wrapper text belong to 02; note maintenance and resume belong to 03.
- No public CLI, schema, dependency, or workflow-authority change.
