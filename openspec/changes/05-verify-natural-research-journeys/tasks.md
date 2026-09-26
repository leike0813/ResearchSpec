# Tasks

Prerequisite: change 02 must be implemented before group 3, because group 3 consumes 02's entry
catalog metadata and generated host matrix and does not decide entry delivery. Changes 01–04 must be
implemented before the real-session work in group 7. Groups 1–2 are repository data
and documentation work and can start immediately. Every task starts unchecked; leave group 7
unchecked until real host evidence exists, and never mark a target verified from install-only or
fixture-based checks.

Focused test runner (verified working): `./node_modules/.bin/tsc -p tsconfig.test.json && node --test
.test-dist/tests/dogfooding-playbook.test.js`.

## 1. Correct the playbook semantics and inventory

- [ ] 1.1 In `playbooks/dogfooding/README.md`, correct the Skill-discovery capability row to the current base surface — one `researchspec-navigate` Skill plus optional Adapter Skills, with every other capability a hidden Procedure discovered at runtime — and remove the retired four-ARSU/five-Companion expectation; verify the row no longer references the retired inventory and `rg -n '4 个 ARSU|5 个 Companion|4 ARSU|5 Companion' playbooks` returns nothing.
- [ ] 1.2 In `playbooks/dogfooding/README.md`, redefine the Tier 1 list so `DF-T1-STANDALONE` is a run-free on-demand Procedure journey and the root-run/child/handoff journey is described under the pipeline scenario, matching `docs/user/usage-model.md`; verify the README standalone paragraph states that no run, node, Gate, Decision or handoff is created.
- [ ] 1.3 In `playbooks/dogfooding/adapters/codex.md`, replace the "4 ARSU / 5 Companion / 7 Zotero" inventory list with the current base surface plus runtime Procedure discovery, and note that the entry mechanism and matrix are owned by change 02; verify no retired counts remain in the adapter.

## 2. Natural research-task scenarios

Continuity handoff from change 03 — all remain **unverified** until natural host sessions are recorded:

- `New session continues a noted task`: compare the note with current materials and outputs, then continue the recorded next step without creating graph state.
- `Several candidate tasks`: when materials cannot identify the intended task, ask one focused question naming the candidates; never select by modification order.
- `Material changed without changing the work`: report a difference that leaves task identity, required inputs, and the next step intact, then continue.
- `Note cannot stand in for run state`: report formal state only from current CLI status and exact selector instructions; an unfinished related run takes precedence.

- [ ] 2.1 Add positive natural-language scenarios to `playbooks/dogfooding/scenarios.yaml` for literature synthesis, manuscript writing or revision, evidence checking, and peer review or review response, each using a natural prompt that names no ResearchSpec, Procedure, profile, frontier, selector or command, and each mapped to the `benchmark/` fixture variant that supplies its inputs; verify each scenario's `intent` and `hard_assertions` describe the expected behaviour for human semantic review.
- [ ] 2.2 Add a run-free standalone natural scenario whose assertions require no run/node/Gate/Decision/handoff creation, and add both continuity scenarios: an ordinary non-graph task resumed in a new session from the task material and the ordinary note, and an accepted graph run resumed in a new session; verify the standalone assertions forbid run state, the ordinary-task resume uses the task material and note and adds no selector, run or workflow authority, and only the graph-resume scenario requires exact CLI selectors and forbids duplicate runs.
- [ ] 2.3 Cover the ordinary-task resume boundaries in the continuity scenarios or adjacent ones, matching change 03 exactly: an unfinished confirmed governed run for the same work takes priority over ordinary treatment, a note-versus-material difference is reported and continues when the task identity, inputs and next step are unaffected, and one focused question is asked only when a difference or candidate set changes the task identity, inputs or next step and the materials do not settle it; verify each boundary appears in a `hard_assertions` entry.
- [ ] 2.4 Add the ambiguity and negative scenarios: missing required input, an unrelated non-research request, and a user instruction to proceed without the framework; verify each declares the expected behaviour in `hard_assertions` and the negative cases require no workspace mutation.
- [ ] 2.5 Include at least one Chinese and one English natural prompt across the new positive scenarios; verify both languages appear by human review of the catalog, not by a prompt-text assertion.
- [ ] 2.6 Add the capability-discovery scenarios handed off by change 04 as natural-session acceptance items: `First search misses` (one bounded retry with different terms), `Second search misses` (host-native fallback, stated as outside a governed run), `Two capabilities compose` (chaining through declared input/output paths only, with no run, handoff or hidden state), and `Existing relevant run takes precedence`; verify each names its expected behaviour in `intent` and `hard_assertions` and each stays `unverified` until a real session recording exists.

## 3. Behavioural evidence record

- [ ] 3.1 Add exactly one human verification record `playbooks/dogfooding/host-verification.md` with one row per registered target, taking target ids from `researchspec list tools --json` (the `TOOL_IDS` catalog) and entry/discovery mechanism facts from change 02's catalog metadata and generated matrix; verify the id set equals the runtime registry id set and that no second target list, directory or `scenarios.yaml` target block is created.
- [ ] 3.2 Keep registry/discovery columns and behavioural-evidence columns distinct in that record: mechanism/target path/matrix status on one side; status, host and model version, independent-session count, human corrections, resume attempts/successes and the four 0–3 quality scores on the other; verify an installed mechanism cannot be read as observed behaviour and the default status is `unverified`.
- [ ] 3.3 Keep `codex` and `agents` as two of the 36 mapped targets sharing one projection root; verify `agents` defaults to `unverified` with no independent host or model version, no separate two-session claim and no inherited `codex` verdict, and is recorded as shared or delegated evidence only when genuinely transferable evidence exists, referencing it without copying its conclusion.
- [ ] 3.4 Extend `playbooks/dogfooding/evidence-template/manifest.yaml` and `notes.md` so one recording captures the target, host and model versions, the two independent session identifiers, human corrections, resume attempts and successes, and the four 0–3 quality scores; verify the template leaves `result`, scores and status `blocked`/empty by default and the resume rate is not applicable at zero attempts.

## 4. Release checklist and data-contract test

- [ ] 4.1 In `artifacts/release/mvp-release-checklist.md`, give every manual dogfooding item a stable slug (for example `[quick-standalone]`) that resolves to a scenario declared in `scenarios.yaml`, and add items for the natural proactive-invocation journeys; verify each manual item carries exactly one slug and that the existing release gate is left intact — no fixed authorization wording is locked, and an item plus the authorization state may be updated later when its recorded evidence satisfies the gate's rules.
- [ ] 4.2 Update `tests/dogfooding-playbook.test.ts` to assert the new scenarios and decision classes, the standalone/graph separation, the verification record's target id set equal to the runtime `TOOL_IDS`, and that every manual checklist slug resolves to a declared scenario; do not add prompt-text snapshots or forbidden-word assertions; verify the focused runner passes.

## 5. Validation

- [ ] 5.1 Run `./node_modules/.bin/tsc -p tsconfig.test.json && node --test .test-dist/tests/dogfooding-playbook.test.js` and record the result; verify it passes. A pass only establishes the current repository baseline — it does not constitute the new natural-session acceptance, which stays in group 7.
- [ ] 5.2 Run `openspec validate 05-verify-natural-research-journeys --strict` (positional change name; this CLI has no `--change` option) and record the result; verify it exits successfully.
- [ ] 5.3 Run the repository type check and lint and record the result; verify no unrelated suite regresses.

## 6. Spec sync (under this change's apply authorization)

- [ ] 6.1 After group 5 passes, sync this change's two deltas (`arsu-user-model-acceptance`, `mvp-release-readiness`) into the main specs with the project-local `openspec-sync-specs` skill, which the change's apply authorization already grants without a separate approval; verify `openspec validate --specs --strict` passes and the merged main specs contain no delta headers. Do not sync before the implementation tasks that the deltas describe are complete.

## 7. Real host verification (execute only after 01–04; leave unchecked until recordings exist)

- [ ] 7.1 Record which host binaries are available in the environment for evaluation by inspecting `command -v <host>` and `<host> --version` only, without reading credentials or starting a model call; verify a list of runnable hosts and missing prerequisites is recorded in the verification record.
- [ ] 7.2 Execute the natural positive, discovery, ambiguity and negative scenarios on each available host in two independent sessions, capturing prompts, tool traces, corrections and deliverables; verify each run fills a `manifest.yaml` under the evidence directory for that target.
- [ ] 7.3 Mark a target verified only where both sessions pass the rubric and the record is complete; verify no target is marked verified from install-only or fixture-based checks, no target inherits another target's verdict, and the release gate is updated only according to its own evidence rules.
