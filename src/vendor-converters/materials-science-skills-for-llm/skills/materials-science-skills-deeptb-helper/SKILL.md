---
name: materials-science-skills-deeptb-helper
description: Prepare, execute, and evaluate user-managed DeePTB dataset, configuration, training, inference, and band-analysis workflows. Use when a local DeePTB task needs an evidence-backed plan and explicit compute authority.
license: MIT
compatibility: Requires a user-managed DeePTB environment, local datasets, checkpoints when applicable, and approved compute capacity.
metadata:
  vendor: materials-science-skills-for-llm
  vendor-release: snapshot-fafd3ab
---

# DeePTB Dataset And Model Workflows

## Purpose and scope

Review data and model suitability, prepare version-matched DeePTB configuration,
run an explicitly approved local operation, and evaluate its scientific result.
The Skill does not install DeePTB, create environments, retrieve datasets or
checkpoints, or infer that a low training loss proves physical validity.

## Inputs and prerequisites

Require the target property, model family, local DeePTB version, dataset and
label provenance, split policy, units, species/configuration coverage, local
paths, model/checkpoint source, metrics, device and compute budget, output
directory, and acceptance criteria. Ask when a choice changes labels, model
architecture, leakage risk, compute cost, or overwrite behavior.

## Workflow

1. Define the target property, model family, dataset provenance, split policy, species coverage, units, compute boundary, and acceptance metrics before preparing DeePTB configuration.
2. Inspect the local version with `dptb --help`; do not infer a configuration
   schema from a different release.
3. Review structures, labels, units, identifiers, species, sampling,
   train/validation/test separation, duplicates, and out-of-domain cases.
4. Read this reference when mapping a dataset into a DeePTB configuration or checking labels, splits, units, and species coverage: [references/dataset-and-configuration.md](references/dataset-and-configuration.md).
5. Agent procedure: review dataset suitability and construct a version-matched DeePTB configuration and evaluation plan.
6. Render candidate configuration and commands for review. Representative forms:

```bash
dptb config -tr -e3 input.json
dptb bond structure.vasp
dptb train input.json -o OUTPUT_DIR
dptb run run.json -i CHECKPOINT -o OUTPUT_DIR
```

7. Show command, environment, device, estimated cost, read/write paths,
   checkpoint behavior, and metrics. Obtain confirmation before training,
   resuming, replacing outputs, or using substantial compute.
8. Use the user-configured dptb CLI only for reviewed config, bond, train, and run operations.
9. Agent procedure: evaluate training behavior, held-out metrics, physical plausibility, applicability, and uncertainty.

## Hard constraints

- The user owns the DeePTB environment, datasets, checkpoints, devices, compute budget, and output directories.
- Do not install packages, create an environment, retrieve data/models, or start
  training automatically.
- Never mix structures or labels across splits through duplicate geometries,
  shared trajectories, or normalization fitted on held-out data.
- Preserve raw predictions, configuration, checkpoint identity, units, and
  metric definitions.
- Do not compare losses or metrics computed with different units, targets,
  reductions, or evaluation populations without a bridge.

## Responsibilities

The Agent owns dataset suitability, split design, model choice, configuration
meaning, metric selection, physical checks, uncertainty, and conclusions. The
external `dptb` tool generates templates, inspects bonds, trains, and runs only
within the confirmed environment and paths.

Return a dataset/configuration review, command plan, metric definitions, and acceptance criteria.
Stop when labels, units, splits, species coverage, model target, or provenance cannot be established.
Return a model assessment that separates observed metrics from scientific interpretation.
Do not accept a model from training loss alone or when evaluation leakage, unit mismatch, or applicability gaps remain.

## Outputs and completion

Return dataset and split ledger, reviewed configuration, commands and authority,
checkpoint/output provenance, training behavior, held-out metrics, physical
checks, applicability limits, uncertainty, and conclusion. Completion requires
a reproducible configuration and an evaluation on untouched data appropriate to
the stated use.

## Failure handling

If dptb, a dataset, or a compatible checkpoint is unavailable, report the missing prerequisite and do not install, download, or start training. On schema
errors, inspect local help and repair the configuration. On divergence or invalid
predictions, preserve logs/checkpoints and ask before changing data,
hyperparameters, or restart policy.

## Examples

Happy path: verify trajectory-grouped splits and energy/force units, generate an
E3 configuration for the installed version, confirm one training run, and
evaluate held-out structures plus physical band behavior.

Near miss: a random frame split places adjacent trajectory frames in training
and testing. Reject the metric as leaked and redesign the split before training.
