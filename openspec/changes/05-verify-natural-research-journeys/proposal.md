# Proposal

## Why

The product promise is that a researcher states a goal and the Agent finds and runs the
right capability without being told about ResearchSpec. Nothing in acceptance proves that
promise. The only true end-to-end automated journey drives the control plane with
placeholder text, and the human dogfooding playbook ships empty evidence templates and no
per-host record of what was actually observed.

Two defects make the playbook unusable as written:

- `DF-T1-STANDALONE` is named "standalone" but drives a root graph run with entry
  confirmation, run/node authority and handoff, while the canonical user model defines
  standalone as an on-demand Procedure that creates no run.
- The playbook still asserts the retired four-ARSU / five-Companion Skill surface, which
  contradicts the current single `researchspec-navigate` base surface.

Change 05 makes acceptance verify the real promise: natural research tasks, proactive
capability invocation, continuity across sessions, and honest per-host verification
status. It states the material and the recording rules. Executing the real host sessions is
a separate evidence-producing step and stays unverified until recordings exist.

## What Changes

- Correct the standalone/graph distinction in the dogfooding playbook so nothing labelled
  standalone drives a graph run, and add a run-free standalone Procedure journey.
- Correct the retired inventory: the base surface is one `researchspec-navigate` Skill plus
  optional Adapter Skills; everything else is a hidden Procedure discovered at runtime, not
  a projected Skill.
- Add natural-language scenarios in Chinese and English with no ResearchSpec or internal
  terminology: literature synthesis, manuscript writing or revision, evidence checking, and
  peer review or review response, plus two continuity cases (ordinary non-graph task resume
  and graph-run resume), ordinary-task boundaries (an existing related run takes priority; a
  note that disagrees with the materials, or multiple candidate tasks), ambiguity, missing
  input, and negative cases (unrelated task, user declines the framework).
- Add one human verification record with a row per registered target, consuming the entry
  catalog and generated matrix owned by change 02 rather than re-deciding delivery. Targets
  come from the runtime registry (`researchspec list tools --json` / `TOOL_IDS`); the record
  holds behavioural evidence keyed by those ids and is not a second host registry.
- Keep the behavioural evidence fields separate from registry and discovery fields.
  `codex` and `agents` remain two of the 36 mapped targets sharing one projection root;
  because generic `agents` is not an independently runnable host, it is recorded as shared or
  delegated evidence, never with its own version, two sessions or a merged `codex` verdict.
- Give every manual release item a stable slug that resolves to a declared scenario, and add
  the items the natural journeys require. This does not change the existing release gate: an
  item may be updated only when its recorded evidence satisfies the gate's own rules.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `arsu-user-model-acceptance`: add natural-task proactive-invocation acceptance, the
  standalone-versus-graph distinction with both continuity cases, and per-host verification
  status tracking derived from the runtime registry.
- `mvp-release-readiness`: require manual acceptance evidence to come from real natural host
  sessions, tracked per registered target, with slug-resolvable checklist items.

## Impact

- `playbooks/dogfooding/**` (README, `scenarios.yaml`, adapters, evidence template, one
  verification record), `artifacts/release/mvp-release-checklist.md` and
  `tests/dogfooding-playbook.test.ts` data-contract assertions.
- No CLI command, schema, workspace contract, Skill projection or runtime state changes. No
  new entry-delivery or file-ownership primitive: change 02 owns those.
- Depends on changes 01, 02, 03 and 04: this change verifies the entry, continuity and
  collaboration behaviour they introduce, and consumes 02's entry catalog and generated
  matrix, so its real host execution cannot start before they are implemented.
