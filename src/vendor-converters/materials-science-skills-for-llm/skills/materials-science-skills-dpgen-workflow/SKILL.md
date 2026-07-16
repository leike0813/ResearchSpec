---
name: materials-science-skills-dpgen-workflow
description: Design, operate, and review DP-GEN concurrent-learning iterations across initialization, model training, exploration, selection, labeling, and convergence. Use with user-managed DP-GEN, model, force-calculator, and optional scheduler environments.
license: MIT
compatibility: Requires user-managed DP-GEN, training, labeling, and optional scheduler runtimes plus local data.
metadata:
  vendor: materials-science-skills-for-llm
  vendor-release: snapshot-fafd3ab
---

# DP-GEN Concurrent Learning Workflows

## Purpose and scope

Design and review the scientific concurrent-learning loop and operate only the
confirmed DP-GEN stage. The Skill covers initial data, model ensembles,
exploration, uncertainty selection, trusted labeling, dataset growth, and
stopping decisions. It does not install runtimes, administer schedulers, embed
credentials, or equate a completed iteration with adequate coverage.

## Inputs and prerequisites

Require the material system, thermodynamic/configuration region, initial data
and provenance, model ensemble, exploration method, uncertainty definition and
thresholds, labeling calculator and precision, parameter/machine files, runtime
versions, compute targets and budget, output root, and stopping criteria. Ask
when thresholds, labels, backend authority, cost, or retry policy are unresolved.

## Workflow

1. Define the material system, thermodynamic region, initial data, model ensemble, labeling method, uncertainty policy, and stopping criteria before preparing a DP-GEN iteration.
2. Inventory data, models, force calculator, exploration engines, scheduler or
   local targets, paths, versions, and existing iteration state.
3. Agent procedure: design the concurrent-learning loop and decide the evidence required to advance each stage.
4. Read this reference when authoring or reviewing DP-GEN parameter and machine files for a concrete stage: [references/parameter-and-machine-files.md](references/parameter-and-machine-files.md).
5. Validate file references and render the exact next stage. Representative
   commands include:

```bash
dpgen -h
dpgen init_bulk param.json machine.json
dpgen run param.json machine.json
dpgen autotest make param.json machine.json
dpgen collect JOB_DIR OUTPUT_DIR
```

6. Show stage, command, environment, resources, cost, paths, remote/scheduler
   effects, expected artifacts, and pass/fail evidence. Obtain separate
   confirmation for training, exploration, labeling, and submission.
7. Use the user-configured dpgen CLI only for an explicitly reviewed init, run, autotest, simplify, or collect operation.
8. Agent procedure: review model deviation, selected configurations, label quality, coverage, and convergence before proposing another iteration.

## Hard constraints

- The user owns DP-GEN, training and labeling runtimes, scheduler configuration, credentials, compute budget, and every submitted job.
- Do not install packages, build software, retrieve examples, configure a
  scheduler, submit, cancel, resubmit, delete, or overwrite automatically.
- Preserve train/validation separation, iteration provenance, model identities,
  selected/rejected configurations, label settings, and failures.
- Uncertainty thresholds are explicit scientific assumptions; do not infer them
  from defaults or tune them only to reduce selected counts.
- Do not advance when exploration leaves the defined physical region or labels
  use inconsistent calculators, precision, atom ordering, or units.

## Responsibilities

The Agent owns scope, thresholds, coverage, label quality, convergence,
conflicts, and the advance/stop conclusion. DP-GEN and configured backends
perform only approved stage operations and never supply the scientific verdict.

Return iteration scope, parameter and machine plans, uncertainty thresholds, labeling criteria, and stopping rules.
Stop when data provenance, exploration domain, labeling fidelity, or convergence criteria are undefined.
Return a stage ledger, accepted/rejected structures, evidence gaps, and advance/stop recommendation.
Do not advance when uncertainty, labeling errors, data leakage, or unexplored regions invalidate the iteration.

## Outputs and completion

Return the iteration plan, exact commands and confirmations, data/model/label
ledger, stage artifacts, failure evidence, uncertainty and coverage analysis,
and an advance/repair/stop recommendation. Completion means the requested stage
is reviewed; the whole loop completes only when the stated coverage and stopping
criteria are satisfied.

## Failure handling

If a stage or backend fails, preserve its artifacts and logs and ask whether to repair or rerun; never resubmit automatically. If machine configuration is
unavailable, retain the semantic plan without inventing site settings. If model
deviation or labels are invalid, quarantine affected configurations and do not
advance the dataset.

## Examples

Happy path: define temperature/pressure coverage and deviation thresholds,
review one `dpgen run`, inspect selected structures and label consistency, then
advance only after the iteration meets its evidence gate.

Near miss: a failed labeling stage is automatically retried with looser
calculator settings. Reject the retry because it changes label fidelity and
requires a new reviewed decision.
