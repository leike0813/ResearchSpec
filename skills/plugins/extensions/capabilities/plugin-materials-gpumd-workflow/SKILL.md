---
name: plugin-materials-gpumd-workflow
description: Plan, execute, and review GPUMD and NEP molecular-dynamics and training workflows with explicit output and validation evidence for one graph node.
metadata:
  capability_id: plugin-materials-gpumd-workflow
  node_kind: producer
  execution_type: llm
  gate_policy: advisory
  license: MIT
---


# GPUMD And NEP Workflows

## Purpose and scope

Prepare and validate GPUMD molecular-dynamics or NEP training inputs, execute an
approved local binary, and interpret its results. The Skill does not compile
software, change drivers, retrieve potentials or data, select a scientifically
valid potential by filename, or retry expensive work automatically.

## Inputs and prerequisites

Require one mode—MD, NEP training, or result analysis—plus the scientific goal,
structures and provenance, units, atom types, potential or labeled dataset,
installed executable/version, GPU boundary, input/output directory, overwrite
policy, compute budget, and acceptance criteria. Ask when ensemble, timestep,
sampling, potential applicability, split policy, cost, or restart choice matters.

## Workflow

1. Choose MD simulation, NEP training, or result analysis and define the scientific objective, structures, units, potential or dataset, GPU boundary, and acceptance criteria before preparing files.
2. Inventory binaries, CUDA/GPU environment, structures, potential/dataset,
   input files, checkpoints/restarts, outputs, versions, and provenance.
3. Agent procedure: validate structures, run settings, potential applicability, datasets, sampling, and validation criteria.
4. Read this reference after selecting MD, NEP training, or output analysis and needing mode-specific file and command detail: [references/md-nep-and-output-playbook.md](references/md-nep-and-output-playbook.md).
5. Draft files in a new work directory and show command, GPU request, duration,
   outputs, and overwrite behavior. Representative local invocations are:

```bash
cd MD_WORKDIR && /user/path/gpumd
cd NEP_WORKDIR && /user/path/nep
```

6. Obtain explicit confirmation for GPU execution, training, restart, or
   replacing any output.
7. For MD, use the user-compiled gpumd executable only for a reviewed directory containing model.xyz and run.in. For training, use the user-compiled nep executable only for a reviewed directory containing nep.in and train.xyz with an optional test.xyz.
8. Agent procedure: assess conservation, equilibration, sampling, stability, loss behavior, test performance, and output completeness.

## Hard constraints

- The user owns the executable, CUDA environment, GPU allocation, input data, compute cost, and output directory.
- The user owns the executable, datasets, GPU allocation, checkpoints, compute budget, and every training run.
- Never compile, install, change drivers, retrieve data/potentials, expose
  credentials, or automatically restart/overwrite a run.
- Validate atom types, units, potential scope, file ordering, timestep,
  ensemble, temperature/pressure controls, sampling, and restart compatibility.
- Preserve raw inputs, logs, outputs, checkpoints, model identity, and the exact
  command used for interpretation.

## Responsibilities

The Agent owns physical design, potential/data suitability, convergence,
stability, uncertainty, and interpretation. `gpumd` and `nep` perform only the
confirmed numerical operation and do not decide scientific validity.

Return a reviewed input plan, command, output inventory, and scientific checks.
Stop when units, atom types, potential scope, dataset splits, ensemble, or stability criteria are unresolved.
Return evidence-linked results, uncertainty, applicability limits, and follow-up checks.
Do not report converged dynamics or a valid potential from incomplete, unstable, or unvalidated output.

## Outputs and completion

Return mode and goal, input/provenance ledger, exact command and confirmation,
GPU/output effects, logs and artifact inventory, convergence/stability or model
evaluation, limitations, and conclusion. Completion requires all expected files
and scientific acceptance checks for the selected mode.

## Failure handling

If gpumd is unavailable or unstable, retain logs and inputs and diagnose the first error without compiling, changing drivers, or automatically retrying. If nep training fails or diverges, preserve loss and checkpoint evidence and ask before changing data, hyperparameters, or restarting. Treat missing output,
NaNs, energy drift, unexplained atom loss, or incompatible restart state as a
failed run rather than a result.

## Examples

Happy path: review `model.xyz`, `run.in`, units, NEP provenance, timestep and
sampling; confirm one GPU run; then check equilibration, conservation, output
completeness, and uncertainty before reporting conductivity.

Near miss: training loss decreases but `test.xyz` is drawn from duplicated
training structures. Reject the validation claim and repair the split before
calling the potential usable.

## ResearchSpec node contract

Execute exactly one ResearchSpec capability node.

- Input: `task_request` (plugin-task.v1).
- Output: `research_brief` (plugin-result.v1), a JSON object at the declared output path.

## Packaged knowledge

- Load knowledge ID `md-nep-output-reference` from `references/md-nep-and-output-playbook.md`.

## Brief output

Before submitting, write the `research_brief` JSON with these required sections:
`scope` `run_ledger` `command_ledger` `output_inventory` `validation_results` `conclusions`.

Every section must be non-empty and evidence-backed. The declared
`validate_materials_brief.py --required scope, run_ledger, command_ledger, output_inventory, validation_results, conclusions` validator rejects missing
or empty sections. The validator never invokes the external tool; ResearchSpec
never executes the user-managed scientific runtime.

## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
