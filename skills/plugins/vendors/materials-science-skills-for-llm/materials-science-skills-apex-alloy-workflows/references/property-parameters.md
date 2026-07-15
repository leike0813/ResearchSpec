# Property Blocks & Potentials

## Supported Potentials
```
['deepmd', 'eam_alloy', 'meam', 'eam_fs', 'meam_spline', 'snap', 'gap', 'rann', 'mace']
```
Set `interaction.type`, point `model` to potential file(s), and align `type_map` with species order.

### Deep Potential (DP/DeepMD)
```json
"interaction": {
  "type": "deepmd",
  "model": "frozen_model.pb",
  "type_map": {"Mo": 0}
}
```

### EAM
```json
"interaction": {
  "type": "eam_alloy",
  "model": "Al.eam.alloy",
  "type_map": {"Al": 0}
}
```

### MEAM
```json
"interaction": {
  "type": "meam",
  "model": ["library.meam", "Al.meam"],
  "type_map": {"Al": 0}
}
```

## Property Blocks (common fields)
- `"skip": true|false` — quick toggle per property.
- Keep only the blocks you need; unused blocks can be deleted.

| type | Purpose | Key fields |
|------|---------|-----------|
| `eos` | Equation of State | `vol_start`, `vol_end`, `vol_step` |
| `cohesive` | Cohesive energy vs lattice | `latt_start`, `latt_end`, `latt_step` |
| `decohesive` | Separation energy | `min_slab_size`, `miller_index`, `max_vacuum_size`, `vacuum_size_step` |
| `elastic` | Elastic constants | `norm_deform`, `shear_deform` (often optional) |
| `surface` | Surface energy | `min_slab_size`, `max_miller` |
| `vacancy` | Vacancy formation | `supercell` |
| `interstitial` | Interstitial formation | `insert_ele`, `supercell` |
| `gamma` | Stacking fault | `plane_miller`, `slip_direction` |
| `phonon` | Phonon spectra | `supercell_size`, `MESH` |
| `finitetlatt` | Finite-T lattice params | `supercell_size`, `temperature`, `equi_step`, `N_every`, `N_repeat`, `N_freq`, `ave_step`, `timestep`, `tdamp`, `pdamp` |

## Relaxation Block (common)
```json
"relaxation": {
  "cal_setting": {
    "etol": 0,
    "ftol": 1e-10,
    "maxiter": 5000,
    "maximal": 500000
  }
}
```
Tighten `ftol`/`etol` for precision; raise `maxiter`/`maximal` if relaxations stall.

## Interaction + Properties Template (joint)
```json
{
  "structures": ["confs/std-*"],
  "interaction": { /* see examples above */ },
  "relaxation": { "cal_setting": { "etol": 0, "ftol": 1e-10 } },
  "properties": [
    { "type": "eos", "vol_start": 0.6, "vol_end": 1.4, "vol_step": 0.1 },
    { "type": "elastic" },
    { "type": "gamma", "skip": true, "plane_miller": [1,1,1], "slip_direction": [1,1,-2] }
  ]
}
```
