# Tasks

Implementation is owned by a separate agent. Check a box only when its acceptance is observable. Real host behavior is verified in change 05 and stays unverified here.

## 0. Prerequisites

- [ ] 0.1 Confirm changes 01 and 02 are implemented and 03's notes are in place. Acceptance: the main `procedure-routing` spec carries 01's narrowed graph trigger, the main `companion-skills` spec already contains 01's task-note scenarios plus 03's `Ordinary task resume verifies materials` scenario, and 02's command wrapper consumes the canonical Navigate execution guidance. If any is missing, stop and report it.

## 1. Intent Discovery And Chaining

- [ ] 1.1 Extend the standalone section of `src/adapters/companion/workflows/navigate.ts` so Navigate forms short catalog search terms from a natural request, including a Chinese-language one, and searches with them instead of asking the user to name a procedure. Acceptance: the rendered Navigate body instructs term formation, including for a Chinese request, before `list procedures --query`.
- [ ] 1.2 Add the bounded retry: on no suitable candidate, retry once with different terms, then fall back to host-native work and state that it is outside a governed run. Acceptance: the rendered body states exactly one retry and the native-fallback outcome.
- [ ] 1.3 Add the chaining rule: connect standalone procedures only through declared inputs and outputs, pass explicit ordinary project-relative paths, and create no run, handoff, or hidden activation state. A missing declared link becomes one focused question. Acceptance: the rendered body contains the declared-contract rule and the no-state clause.
- [ ] 1.4 Add the precedence rule: when a relevant unfinished confirmed run already exists, read its current instructions instead of routing the same work through a fresh standalone chain, and do not reopen a completed run or let it take precedence over a new independent request. Acceptance: the rendered body routes an existing unfinished run before standalone selection while a completed run stays closed.
- [ ] 1.5 Enforce that no retrieval service, vector index, or second capability index is added for this behavior as an implementation constraint rather than user-facing Skill text. Acceptance: the rendered Navigate body does not carry this development constraint, and the implementation diff introduces no new dependency, service, embedding index, or second catalog file; the constraint is recorded in the design and checked during diff review.

## 2. Unified Result Report And Optional Assistance

- [ ] 2.1 Make the completed-standalone-capability report the single report format: produced paths, evidence and limits, unresolved items, next step, and internal selectors or mode names only when the user must act on them. Acceptance: the rendered body contains all five elements and the jargon gate, and this is the only result-report definition in 03 and 04.
- [ ] 2.2 Add the rule that a standalone finding must not be reported as a completed run, node, Gate, or Decision. Acceptance: the rendered body states that limit and matches the `Standalone Companion completes` scenario.
- [ ] 2.3 Tie optional plugin assistance to the selected capability: at most three domains in one batch, exact preview, consent separate from run confirmation, and no route change when declined or failed. Acceptance: the rendered body keeps the bounded count, the preview, and the separate-consent and no-change clauses.
- [ ] 2.4 Add one short chaining line to `src/adapters/companion/shared-guidance.ts` only if a shared statement is needed across Companions. Acceptance: either the shared guidance carries the line, or 03's ownership line remains the only shared addition.
- [ ] 2.5 Confirm the discovery, chaining, and report behavior reaches every delivery mode. Acceptance: for a Skill-capable host the Navigate `SKILL.md` carries the new guidance; for a command-capable host under `commands` the rendered wrapper carries the same behavior with only references that exist in that mode; under `both` both surfaces carry it. The wrapper is not edited by this change.

## 3. Verification

- [ ] 3.1 Run `pnpm check`, then `pnpm exec tsc -p tsconfig.test.json` followed by `node --test .test-dist/tests/adapters.test.js .test-dist/tests/skill-harness.test.js`. Add another real affected suite only if this change actually touches its behavior. Acceptance: the type check and the listed suites pass.
- [ ] 3.2 Confirm this change adds no visible entry. Acceptance: the workspace still projects exactly one base Skill (`researchspec-navigate`) and, where command delivery applies, one Navigate wrapper; 04 introduces no second Skill, capability, wrapper, or reference file. This states the surface constraint rather than an expectation that existing test expectations may never change.
- [ ] 3.3 Run `openspec validate 04-align-research-capability-collaboration --strict`. Acceptance: it reports valid with no issues.

## 4. Sync And Handoff

- [ ] 4.1 After that validation passes, sync this change's deltas (`research-capability-collaboration`, `companion-skills`) into the main specs with the project-local `openspec-sync-specs` skill. Acceptance: `openspec validate --specs --strict` passes, and the merged `companion-skills` requirement still contains 01's task-note clause and all four of its original scenarios plus this change's `Natural request names no procedure` scenario, with no delta headers in the main spec.
- [ ] 4.2 Hand the capability-discovery scenarios (`Natural request finds a capability`, `First search misses`, `Second search misses`, `Existing unfinished run takes precedence`, `Completed run does not hijack a new request`, `Two capabilities compose`) to change 05 as natural-session acceptance items. Acceptance: those scenarios are listed in change 05's plan and marked unverified.
