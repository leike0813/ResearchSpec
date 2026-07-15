# GPUMD troubleshooting

Diagnose failures from the first relevant error and preserve the original logs.

- Input errors: verify file names, atom types, units, and command ordering.
- GPU errors: record device visibility, memory use, and runtime compatibility;
  ask the user to choose any environment change.
- Unstable dynamics: inspect structure quality, time step, temperature control,
  potential applicability, and units before proposing a new run.
- NEP training issues: check dataset coverage, splits, loss terms, and checkpoint
  provenance.

Do not compile, change drivers, delete outputs, or resubmit work automatically.
