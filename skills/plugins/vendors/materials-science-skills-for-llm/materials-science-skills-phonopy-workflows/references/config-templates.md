# Config templates (setting.conf snippets)
Copy/paste and tweak. Pass with `phonopy --config setting.conf`.

## Mesh + DOS
```
DIM = 2 2 2
MP = 16 16 16       # Monkhorst-Pack mesh
SIGMA = 0.1          # Gaussian smearing for DOS
DOS = .TRUE.
PDOS = .TRUE.
EIGENVECTORS = .TRUE.
GAMMA_CENTER = .TRUE.
BAND_CONNECTION = .TRUE.  # smoother bands when combined with band path
```

## Band structure
```
DIM = 2 2 2
BAND = 0 0 0  0.5 0 0  0.5 0.5 0  0 0 0  0 0 0.5
BAND_POINTS = 51
BAND_CONNECTION = .TRUE.
EIGENVECTORS = .TRUE.
NAC = .TRUE.        # if BORN present
BAND_FORMAT = band.dat   # optional text output
```

## Thermal properties
```
READFC = .TRUE.
TPROP = .TRUE.
TMIN = 0
TMAX = 1200
TSTEP = 50
MESH = 16 16 16
GAMMA_CENTER = .TRUE.
```

## NAC
```
NAC = .TRUE.
BORN = BORN
DIELECTRIC_CONSTANT = auto  # leave if BORN generated from VASP/QE helper
PRIMITIVE_AXES = 1 0 0  0 1 0  0 0 1
```

## Grüneisen (requires volume-displaced FCs)
```
GRUNEISEN = .TRUE.
DIM = 2 2 2
MESH = 8 8 8
READFC = .TRUE.       # set FC filename with GRUNEISEN_CMD if needed
```

## QHA outline
- Compute Helmholtz free energies vs volume using `phonopy-qha` on thermal_properties from multiple volumes.
- Typical run: `phonopy-qha e-v.dat free-energy-*.dat --tmin 0 --tmax 1200 --tstep 50`.
