# Design

## Context

See proposal.md for motivation. Current state that shapes the approach:

- `playbooks/dogfooding/` holds `README.md` (canonical playbook), `scenarios.yaml` (machine-readable
  catalog), one adapter (`adapters/codex.md`), the synthetic offline `benchmark/` fixtures, and an
  empty `evidence-template/`. `tests/dogfooding-playbook.test.ts` validates catalog shape only — YAML
  structure, fixture containment, route coverage against `skills/arsu/routing-catalog.json`,
  release-mapping integrity and package exclusion of `playbooks/` — and never executes a prompt.
- `artifacts/release/mvp-release-checklist.md` lists its manual items as prose, with no slug a
  scenario or test can resolve.
- The current fixed surface is one Skill, `researchspec-navigate`; other capabilities are hidden
  Procedures discovered at runtime. The runtime catalog has 36 tool ids, 28 command-capable ids and
  24 ids with `agentProfile`; `codex` and `agents` share the `.agents` root (`src/adapters/tools.ts`).
- Two conflicting definitions of "standalone" exist today: `playbooks/dogfooding/README.md` requires
  root entry confirmation, run/node authority and handoff for `DF-T1-STANDALONE`, while
  `docs/user/usage-model.md` defines standalone as an on-demand Procedure with no run state.

The work is verification material only. It changes no CLI command, schema or runtime behaviour.

## Goals / Non-Goals

**Goals:**

- Correct the semantic defects and the retired-inventory references in the playbook.
- Define natural, framework-free scenarios, including both continuity shapes, ambiguity and
  negative cases, with the standalone and graph paths separated.
- Keep exactly one human verification record, honest by default, for every registered target.
- Make manual release items slug-resolvable while leaving the existing release gate intact.

**Non-Goals:**

- An LLM-in-the-loop framework or scoring harness; real host runs stay manual and their
  recordings are the evidence.
- Any entry-delivery decision. Change 02 owns entry metadata, managed regions, the rendered entry
  body and the generated host matrix; 05 consumes them.
- A second target registry, a host directory, or a duplicate host-fact source.
- Changing CLI behaviour, schemas, workspace state or Skill projection.
- Marking any host verified from this repository alone.

## Decisions

### Separate the registry source from the evidence record

Target identity and entry/discovery facts have one source: the runtime registry
(`researchspec list tools --json`, the `TOOL_IDS` catalog) and, for delivery mechanism, change 02's
catalog metadata and generated matrix. Behavioural evidence has one source: a single human record,
`playbooks/dogfooding/host-verification.md`, with one row per registered target.

Alternatives rejected: adding a `host_verification_targets` block to `scenarios.yaml` alongside the
matrix (three host-fact sources to keep in sync), and a second host directory. The single record
keeps registry/discovery fields and behavioural evidence fields in distinct columns so a reader can
tell an installed mechanism from an observed behaviour, and the record never claims ownership of
target identity.

### Preserve the existing catalog shape; keep the data contract in the test and README

`scenarios.yaml` keeps `schema_version: "1"` and its current keys; new scenarios reuse the existing
shape. The catalog's data shape stays a binding contract enforced by
`tests/dogfooding-playbook.test.ts` and the playbook README, exactly as today. A second,
separately versioned schema file for the same catalog would be a duplicate source of truth.

### Separate standalone from graph by scenario intent

The fix is behavioural: `DF-T1-STANDALONE` is redefined as a run-free on-demand Procedure matching
`docs/user/usage-model.md`, and the graph journey it used to describe moves under the pipeline
scenario. A run-free natural scenario and both continuity scenarios (ordinary-task resume, graph
resume) are added. Only the graph resume uses exact CLI selectors; the ordinary-task resume works
from the task material and the ordinary note and adds no selector, run or workflow authority. The
ordinary-task note boundaries are covered: an existing related run takes priority,
note-versus-material divergence is reported, and multiple candidates force one targeted question.
Change 04's natural discovery scenarios (`First search misses`, `Second search misses`,
`Two capabilities compose`, `Existing relevant run takes precedence`) are consumed as acceptance
items rather than redefined. The README Tier 1 list and `release_mappings` are corrected to match.

### Consume change 02's delivery facts; state only the evidence rules here

Entry hints and shared-file/region ownership are decided and delivered by change 02. This change
records what each target receives and whether a real session proved the behaviour. Where 02 marks a
target discovery-only or unverified, the record mirrors that and does not upgrade it. No new
managed-target or shared-file primitive is introduced, and no delivery decision is reopened.

### Generic shared targets are never counted as separate runnable hosts

All 36 registry ids are mapped in the record. `codex` and `agents` share one projection root;
`agents` has no independently runnable host, so its row stays `unverified` and never receives its
own host or model version, its own two sessions, or an inherited `codex` verdict. Shared evidence is
referenced only where genuinely transferable evidence exists, and a conclusion is never copied from
one target to another.

### Acceptance is enforced by data contracts and human semantic review

The test asserts structure and cross-references: scenario ids, decision classes, the record's id set
equals `TOOL_IDS`, and manual checklist slugs resolve to declared scenarios. What makes a prompt
"natural" and whether a session truly passed is judged by the human reviewer against the scenario
`intent`, `hard_assertions` and the 0–3 rubric. No prompt-text snapshot and no forbidden-word
static assertion is added, because those lock prose instead of protecting behaviour.

### Real host execution is planned, not asserted

Scenarios reference real host binaries only as prerequisites. The implementer may record which
binaries exist; no task may mark a target verified without a saved recording that satisfies the
gate's evidence rules.

## Risks / Trade-offs

- [The 36-row record becomes stale as hosts change] → Target ids come from the registry and a test
  asserts the record's id set equals `TOOL_IDS`, so drift fails loudly.
- [Natural prompts are open-ended and scores are subjective] → Keep the four 0–3 rubric, require two
  independent sessions per verified target, and record human-correction counts so drift is visible.
- [Re-defining `DF-T1-STANDALONE` breaks existing checklist wording] → Add checklist slugs and update
  the mapping in the same change; the test asserts each slug resolves.
- [Many of the 36 ids have no adapter or runnable host] → The record marks them `unverified` or
  shared; absence is recorded, not hidden or faked.
- [The record could be mistaken for a delivery decision] → Registry/discovery columns are labelled as
  consumed from the registry and 02's matrix; only the evidence columns are this change's output.

## Migration Plan

Docs- and data-only. Update the playbook README, `scenarios.yaml`, adapters, evidence template and
the release checklist, and add the single verification record, in one change; adjust the
data-contract test in the same commit. Rollback restores the prior playbook text and catalog. No
workspace, schema or command migration is required.
