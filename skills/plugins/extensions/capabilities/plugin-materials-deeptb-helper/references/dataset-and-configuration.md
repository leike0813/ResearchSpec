# DeePTB dataset and configuration review

Read this file only when translating a concrete dataset into configuration or
auditing label/split compatibility. The main file owns execution authority,
compute confirmation, output rules, and failure handling.

## Dataset inventory

Record for each source: stable identifier, structure format, trajectory or
family grouping, species, configuration count, thermodynamic region, calculator
and settings, target labels, units, precision, license, preprocessing, and hash
or version. Distinguish total energy from per-atom energy and forces from their
sign/coordinate conventions.

## Split design

- Group correlated frames, structures, compositions, and derived variants before
  splitting; never let near-duplicates cross sets.
- Fit scalers and reference energies using training data only.
- Keep a final test population untouched until the configuration and stopping
  rule are fixed.
- Report species, composition, energy, force, distance, and configuration-family
  coverage per split.
- Create explicit out-of-domain challenges when deployment exceeds the training
  distribution.

## Configuration review

| Area | Required checks |
| --- | --- |
| Model | installed DeePTB model family, target compatibility, cutoff semantics, dtype |
| Dataset | path, format, labels, units, species mapping, batch/sampling policy |
| Optimization | objective terms, weights, optimizer, schedule, stopping and checkpoint policy |
| Evaluation | held-out population, metrics, reductions, plots, physical consistency tests |
| Runtime | device, precision, workers, memory, deterministic settings, output directory |
| Resume | exact checkpoint, configuration compatibility, optimizer/scheduler state |

Generate templates only with the installed CLI and then replace placeholders
deliberately. `dptb bond STRUCTURE` may inform neighbor/cutoff inspection but
does not select a scientifically valid cutoff by itself.

## Evaluation cases

For energies report both aggregate and per-atom conventions. For forces report
component and magnitude distributions, tails, and species/configuration slices.
For bands or Hamiltonians check alignment, path convention, degeneracies,
symmetry expectations, and qualitative failures in addition to an average
error. Retain the raw predictions used for every metric.

## Invalid cases

- Unknown label units or mixed calculators without an explicit harmonization.
- A validation set used repeatedly to choose architecture while called “test”.
- Resuming from an incompatible checkpoint because filenames happen to match.
- Reporting one aggregate metric when a species or structure family is failing.
