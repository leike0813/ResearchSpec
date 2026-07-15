# Common phonopy files (what they mean / when to reuse)

- `POSCAR`, `SPOSCAR`: primitive vs supercell. Keep `PRIMITIVE_AXES` consistent between creation and analysis.
- `phonopy_disp.yaml`: displacements + supercell info; reuse to regenerate FORCE_SETS from new forces without re-creating displacements.
- `FORCE_SETS`: raw forces from displaced cells; feed into `phonopy --readfc` to build FC.
- `FORCE_CONSTANTS` / `force_constants.hdf5`: harmonic FC matrix. Only regenerate when structure or forces change.
- `BORN` / `NAC_PARAMS`: dielectric + Born effective charges. Required with `NAC = .TRUE.` or `--nac`.
- `phonopy.yaml`: serialized run state; inspect with `phonopy-load --yaml phonopy.yaml` or reload via `phonopy-load --yaml phonopy.yaml --mesh 12 12 12 --dos`.
- `band.conf`, `mesh.conf`, `qpoints.conf`: lightweight configs to drive new calculations from existing FC.
- Outputs to plot: `band.yaml` → `phonopy-bandplot`; `mesh.yaml` → projected DOS; `thermal_properties.yaml` → `phonopy-propplot`; `gruneisen.yaml` → `phonopy-gruneisenplot`.
