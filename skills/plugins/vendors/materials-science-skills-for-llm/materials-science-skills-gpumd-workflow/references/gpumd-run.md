# Running `gpumd`

## Minimal inputs
- `model.xyz` — atomic configuration in extended XYZ (first line atom count; second line must include `lattice="ax ... cz"` and `properties=species:S:1:pos:R:3[:vel:R:3][:mass:R:1] ...`; optional `pbc="T/F T/F T/F"`). Units: Å for length/pos, Å/fs for velocities, amu for masses.
- `run.in` — ordered commands; blank lines and `#` comments ignored. Typical flow:
  ```text
  potential potentials/Si_NEP.txt        # choose potential (NEP or classic)
  time_step 1.0                          # fs
  velocity 300 gaussian                  # initialize velocities at 300 K
  ensemble nvt nose 300 1000             # thermostat (T=300 K, tau=1000 fs)
  dump_thermo 100 thermo.out             # every 100 steps
  dump_exyz 100 dump.xyz                 # trajectory (positions+forces)
  run 20000                              # integrate 20k steps
  ```
- Optional supporting files (only for specific tasks): `basis.in`, `kpoints.in`, `eigenvector.in`.

## Common keywords to remember
- **Setup**: `potential`, `velocity`, `time_step`, `ensemble`, `fix`, `change_box`, `deform`.
- **Actions**: `run`, `minimize`, `compute_*` (elastic, phonon, HAC/HNEMD/GKMA, MSD/SDC, SHC).
- **Outputs**: `dump_thermo`, `dump_exyz`, `dump_observer`, `dump_force`, `dump_velocity`, `dump_restart`, `dump_netcdf`.
- **Active learning**: `active` (saves high-uncertainty structures to `active.xyz`).

## Box & partitioning
- Ensure box lengths exceed twice the cutoff for non-NEP potentials; NEP handles images internally.
- Multi-GPU runs partition along the thickest box axis by default; override by adding `x|y|z` after `potential` line.

## Quick validation before long runs
- Run a short `run 1000` with `dump_thermo` to confirm energy drift, temperature, and pressure are stable.
- Check `dump.xyz` or `movie.xyz` in `Ovito`/`VMD` to ensure geometry and units look right.
