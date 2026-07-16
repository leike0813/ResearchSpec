# APEX property parameter review

Read this file only after the property mode is known and a concrete parameter
block needs review. The main file remains authoritative for confirmation,
credentials, remote state, provenance, convergence, and completion.

## Common contract

For every property block record the structure source, calculator and potential,
relaxation dependency, configuration type, units, perturbation range, number of
points, post-processing method, output path, and acceptance test. Use names and
fields supported by the installed APEX version; inspect local examples or help
when a field differs.

## Property-specific checks

| Property | Inputs that require explicit review | Completion evidence |
| --- | --- | --- |
| Elastic | strain amplitudes, deformation modes, symmetry, relaxation policy | stress/energy consistency, fitted constants, residuals, units |
| EOS | volume scale range, sampling density, relaxation constraints, fit model | energy-volume points, fit residuals, equilibrium volume, bulk modulus |
| Vacancy | defect species/site, supercell, charge/spin if relevant, chemical reference | relaxed pristine/defect energies, atom mapping, finite-size limits |
| Interstitial | species, candidate sites, supercell, relaxation policy | stable final site, reference state, formation energy, competing sites |
| Surface | Miller index, termination, slab/vacuum thickness, dipole handling | converged slab energy, surface area and factor-of-two convention |
| Stacking fault | plane, direction, displacement grid, constraint/relaxation choices | complete energy-displacement curve and area normalization |
| Phonon | supercell, displacement, force settings, symmetry and NAC choices | complete forces, atom ordering, imaginary-mode review |

## Cross-property rules

- Reuse a relaxation only when its structure, calculator, potential, precision,
  magnetic state, and boundary conditions match the property calculation.
- Treat default perturbation ranges as candidates, not universal constants.
- Express reference chemical potentials and normalization factors explicitly.
- Keep raw task results and the post-processed property artifact together.
- A numerically finished property remains incomplete when required points failed,
  fits are unstable, atom identities changed unexpectedly, or units are unclear.

## Anti-examples

- Reporting an elastic constant from a single deformation point.
- Comparing surface energies that use different slab or area conventions.
- Accepting a vacancy relaxation that migrated to a different unidentified site.
- Calling an EOS converged without checking whether the minimum lies inside the
  sampled volume range.
