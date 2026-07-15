# Outputs At A Glance

## `gpumd`
- `thermo.out` — T, P, E, etc. every `dump_thermo` interval (append).
- `dump.xyz` / `movie.xyz` — trajectories; use for visualization or restart.
- `restart.xyz` — single-frame restart (overwrite).
- `observer.xyz` / `observer.out` — quantities evaluated by observing NEP potentials or their average (append).
- `force.out`, `velocity.out` — per-atom diagnostics.
- Task-specific: `kappa.out` (HNEMD thermal conductivity), `hac.out` (EMD), `shc.out`, `msd.out`, `sdc.out`, `cohesive.out`, `D.out`/`omega2.out` (phonons), `active.xyz`/`active.out` (active learning).

## `nep`
- `loss.out` — total loss + per-term components vs. training steps.
- `nep.txt` — trained potential file for `gpumd`.
- `nep.restart` — checkpoint to resume.
- `{energy,force,virial,stress,dipole,polarizability}_{train,test}.out` — predicted vs target values.
- `descriptor.out` — descriptors (prediction mode).

## Quick sanity checks
- For MD: confirm conserved quantity (energy drift ~0 for NVE) and realistic temperature/pressure in `thermo.out`.
- For training: plot `loss.out`; ensure test RMSE tracks train RMSE (no severe overfit).
