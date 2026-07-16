# Phonopy configuration and force-file handoff

Read this file only while composing concrete tags or validating force handoff.
The main file owns design, confirmation, calculator authority, convergence,
failure, and interpretation.

## Core artifacts

| Artifact | Role and review point |
| --- | --- |
| relaxed structure | immutable basis; record format, units, symmetry and atom order |
| `phonopy_disp.yaml` | displacement metadata and supercell identity |
| displaced structures | one-to-one ledger entry with calculator job and result |
| force outputs | calculator convergence, units and atom ordering before ingestion |
| `FORCE_SETS` | assembled displacement/force pairs; verify count and provenance |
| force constants | method, shape, units, sum-rule treatment and source force set |
| `phonopy.yaml` | serialized settings/provenance; inspect before reusing |
| `BORN` | dielectric/Born-charge source, units, atom order and NAC applicability |
| band/DOS/thermal YAML | path/mesh, normalization, temperature grid and source constants |

## Configuration groups

- Structure/symmetry: calculator interface, cell file, primitive axes, symmetry
  tolerance and magnetic or other symmetry-breaking context.
- Displacement/supercell: `DIM`, displacement amplitude, plus/minus policy,
  random or systematic displacement, and intended convergence comparison.
- Force constants: force-set source, read/write behavior, fitting method,
  symmetrization and acoustic sum-rule choice.
- Reciprocal sampling: band path and labels, points, mesh, gamma/shift, DOS/PDOS
  settings and eigenvector requirements.
- Thermal properties: mesh convergence, temperature minimum/maximum/step,
  normalization and imaginary-mode policy.
- NAC: Born/dielectric provenance, unit conversion, direction treatment and
  consistency with structure/calculator.

Use only tags supported by the installed version. Preserve the actual config or
command with outputs; do not rely on chat reconstruction.

## Force handoff checklist

1. Match every force output to one displacement identifier.
2. Verify the calculator completed under identical functional/potential,
   precision, basis, k-point, spin and convergence settings.
3. Confirm atom count/order, cell and coordinate mapping against the generated
   displaced structure.
4. Convert forces only through the selected Phonopy interface and record units.
5. Reject missing, duplicate, unconverged, reordered, or differently configured
   jobs before assembly.

## Interpretation cautions

An imaginary mode can reflect inadequate supercell/mesh, loose force
convergence, symmetry/tolerance choices, an unrelaxed structure, missing NAC, or
a real instability. Thermal quantities inherit harmonic/quasi-harmonic and
sampling assumptions. Record these distinctions rather than applying an
automatic sign or magnitude threshold.
