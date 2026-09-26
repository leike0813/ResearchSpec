# Design

## Context

See `proposal.md` - Why. Procedure discovery, ranking, and the standalone-versus-graph boundary already exist in `procedure-routing` and `arsu-run-usage`, and 01 narrows the graph trigger in `arsu-user-routing` and `procedure-routing`. The standalone contract already allows procedures to compose through explicit ordinary paths. Change 02 also makes command wrappers consume the canonical Navigate execution guidance. What is missing is Navigate behavior: term translation, chaining, the result report, and graph-run precedence during selection.

Because 01 also edits `companion-skills`, this change's delta is the full `Companion Guidance Exposes Only Graph Runtime Actions` requirement as it reads after 01 and 02 are applied, including 01's task-note clause and all four of its original scenarios. Change 03 extends the other touched requirement, `Companions Use Current File Contracts`, and does not touch this one.

## Goals / Non-Goals

**Goals:**

- Make an ordinary-language request reach a capable procedure without the user naming it.
- Let multi-capability requests complete through declared contracts.
- Own one unified result report for standalone capability work.

**Non-Goals:**

- A new search engine, embedding index, planner, capability graph, or orchestration runtime.
- Automatic chaining that bypasses declared inputs and outputs.
- Redefining search ranking, the mode boundary, or note maintenance owned by other capabilities.

## Decisions

### Reuse the existing lexical catalog and add only a translation step

Navigate already has `list procedures --query`. The new work instructs the Agent to form short domain terms from the request, including from Chinese, retry once on an empty or irrelevant result, and then fall back to native work. A local embedding index was rejected (new dependency and drift), as was a pre-baked intent-to-procedure table (a second catalog that duplicates `procedure-routing`), and a semantic reranker (a service call inside the discovery path). The "no retrieval service, vector index, or second catalog" rule is an implementation constraint enforced by this design and diff review; it is not written into the rendered Navigate contract that users read.

### Chain through declared contracts, not a plan object

The standalone packet already declares inputs, outputs, and resources. Chaining passes a produced path into the next activation's declared input. No chain registry, plan hash, or intermediate state is introduced; an undeclared link becomes one focused question rather than an inferred hop.

### One owner for the standalone result report

Change 03 owns note maintenance and resume; this change owns what the user is told when standalone capability work finishes. Splitting the report across both would create two formats for one user-visible outcome, so the report requirement lives only here and 03's text refers to it.

### Graph precedence is a selection rule

When a relevant unfinished confirmed run already exists, its pending controls outrank a fresh standalone chain for the same work. This keeps resume semantics consistent with 03 and avoids a second route to the same deliverable. A completed run is not reopened and does not take precedence over a new independent request.

### Plugin assistance stays where it already is

The bounded suggestion count, exact preview, and separate consent already exist. This change only ties the suggestion to the selected capability and restates that declining changes nothing.

### Implementation reuses the Navigate contract

All four behaviors are instruction text in `src/adapters/companion/workflows/navigate.ts`. No renderer, delivery, or manifest change is required; if a generator or consumer must change to keep the rendered contract consistent, change it as the facts require.

### Commands delivery inherits the contract from 02

Because 02 makes the command wrapper consume the canonical Navigate guidance, discovery, chaining, and reporting reach `skills`, `commands`, and `both` from this one edit. This change does not edit the wrapper; its acceptance confirms each delivery mode carries the behavior and that commands mode references only files it installs.

## Risks / Trade-offs

- Keyword translation may still miss an unusual request -> one bounded retry plus a native fallback keeps the cost low and forbids silent capability invention.
- Chaining could drift into implicit orchestration -> only declared inputs and outputs may connect steps, and undeclared links are reported.
- Entry-prompt wording is shared with 02 -> 02 owns entry and wrapper text; this change adjusts only Navigate's selection and reporting contract.
- A later sync could drop 01's scenarios -> the delta carries the full post-01 requirement and the sync step verifies the merged main spec.
- Commands-only delivery could lag the Skill -> 02's wrapper-consumption rule plus the per-mode acceptance check keep all three modes aligned.
