# GPUMD, NEP, and output playbook

Read this file only after selecting a mode. The main file owns runtime
authority, GPU confirmation, scientific suitability, restart decisions, and
completion.

## MD mode

`model.xyz` and `run.in` belong in the reviewed work directory. Confirm extended
XYZ lattice and property metadata, atom-type order, coordinates, velocities when
present, periodicity, and compatibility with the selected potential. In
`run.in`, review command order, potential path, ensemble, timestep, run length,
temperature/pressure control, equilibration, sampling, observables, dump cadence,
and restart policy.

Start with a deliberately short stability run before production. Inspect the
first relevant error and early thermodynamic behavior. A restart is compatible
only when structure, atom ordering, potential, units, and intended continuation
match the prior state.

## NEP mode

`nep.in` and `train.xyz` are required; `test.xyz` is strongly preferred for an
independent evaluation. Review descriptor/cutoff settings, species order,
network and loss terms, energy/force/virial conventions, population weighting,
batching, generation count, checkpoint/restart behavior, and randomization.

Group correlated configurations before splitting. Record calculator, precision,
units, thermodynamic/configuration coverage, composition/species balance, and
deduplication. Monitor component losses and held-out slices rather than only the
aggregate `loss.out`. Bind a resulting `nep.txt` to training data, configuration,
software version, checkpoint, and validation evidence.

## Output interpretation

| File family | Review |
| --- | --- |
| Thermodynamic output | equilibration, conservation, drift, state variables, units, sampling |
| Trajectory/dump | atom count/order, cell, stride, continuity, intended population |
| Correlation/transport | sampling window, convergence, finite-size/time effects, uncertainty |
| `loss.out` | each objective component, train/test behavior, divergence, plateaus |
| `nep.txt` | provenance, species order, compatibility, validation and applicability |
| Restart/checkpoint | source run, compatible files/settings, last complete state |

## Diagnostic branches

- Input parse error: check file names, atom types, units, and command ordering.
- GPU/runtime error: record visibility, memory and compatibility; ask the user to
  choose any environment change.
- Unstable dynamics: inspect structure, overlaps, timestep, controls, units, and
  potential applicability before proposing a new run.
- NEP divergence: inspect labels, outliers, loss weights, precision, coverage,
  and restart compatibility; do not discard failed evidence.
- Missing output: determine whether the command, early termination, or output
  configuration caused it before interpreting partial files.

## Anti-examples

- Copying an unvalidated `nep.txt` into MD and treating a stable short run as a
  complete applicability test.
- Averaging a transport property before the correlation integral stabilizes.
- Changing timestep and thermostat while calling the result a continuation of
  the same run without recording the intervention.
