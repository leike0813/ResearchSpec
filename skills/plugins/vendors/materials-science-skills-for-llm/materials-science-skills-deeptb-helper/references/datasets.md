## Dataset & Metadata

### Common pieces
- `info.json` (required) minimal keys:
  ```json
  {"nframes": <int>, "pos_type": "ase|cart|frac", "pbc": [true,true,true]}
  ```
  - `bandinfo` for SKTB energy window:
    ```json
    "bandinfo": {"band_min":0,"band_max":6,"emin":null,"emax":null}
    ```
- Structures can be `.traj` (ASE) or text triplet `positions.dat`, `cell.dat`, `atomic_numbers.dat` (Angstrom; cart or frac).

### SKTB labels (eigenvalues)
Dataset example:
```
data/<prefix>/
  eigenvalues.npy   # [nframes, nkpoints, nbands], exclude core bands
  kpoints.npy       # [nkpoints, 3]
  xdat.traj         # structures
  info.json
```

### E3TB labels (Hamiltonian / DM / overlap)
```
data/<prefix>/
  positions.dat
  cell.dat
  atomic_numbers.dat
  hamiltonian.h5    # groups "0"... storing {"i_j_Rx_Ry_Rz": ndarray}
  overlaps.h5       # optional but recommended
  density_matrices.h5 # optional
  info.json
```

### Picking cutoffs
- Use `dptb bond <structure>` to inspect neighbor distances and pick `r_max` (data graph) and `rs` (SK hopping decay).
- Keep `r_max` consistent with the LCAO basis cutoff used in DFT labels.

### Basis reminders
- SKTB: basis lists per element, e.g. `"C": ["2s","2p","d*"]`.
- E3TB: compact string, e.g. `"C": "2s2p1d"`.
