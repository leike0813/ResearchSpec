---
name: plugin-materials-phonopy-workflows
description: Prepare, run, and validate Phonopy finite-displacement workflows with configuration and force-file provenance for one graph node.
metadata:
  capability_id: plugin-materials-phonopy-workflows
  node_kind: producer
  execution_type: llm
  gate_policy: advisory
  license: MIT
---


# Phonopy Finite-Displacement Workflows

## Purpose and scope

Design a finite-displacement calculation, generate and track displaced
structures, coordinate user-authorized force calculations, assemble forces, and
interpret phonon outputs. The Skill does not install software, configure a
calculator or scheduler, submit work without confirmation, or treat every
imaginary mode as a physical instability.

## Inputs and prerequisites

Require a relaxed structure and provenance, crystal/coordinate and unit
conventions, installed Phonopy version, force calculator/settings, target
observables, symmetry tolerance, supercell and convergence plan, displacement
settings, NAC decision, q-path/mesh conventions, work paths, compute budget, and
acceptance criteria. Ask when these choices affect cost or interpretation.

## Workflow

1. Define the relaxed structure, force calculator, target observables, units, symmetry tolerance, supercell convergence plan, and non-analytical-correction need before generating displacements.
2. Inspect structure, symmetry, atom order, units, calculator compatibility, and
   existing Phonopy artifacts before deciding what may be reused.
3. Agent procedure: choose and justify displacement, supercell, symmetry, path, mesh, and convergence settings.
4. Read this reference when composing Phonopy configuration tags or checking displaced-force file handoff: [references/configuration-and-force-files.md](references/configuration-and-force-files.md).
5. Present exact local generation/processing commands and written files:

```bash
phonopy -d --dim="2 2 2" -c POSCAR
phonopy -f disp-*/vasprun.xml
phonopy --dim="2 2 2" -c POSCAR --mesh 20 20 20 --dos
```

6. Use the user-preinstalled phonopy CLI only for reviewed displacement generation, force assembly, force constants, bands, DOS, or thermal-property processing.
7. Inventory every displaced structure and obtain explicit confirmation before
   DFT/ALM, remote, scheduler, expensive, or overwriting work. Use the selected user-configured DFT or ALM force calculator only for the reviewed displaced-structure job set.
8. Verify force-job completeness, convergence, calculator consistency, atom
   ordering, units, and structure mapping before assembly.
9. Agent procedure: assess imaginary modes, acoustic sum rules, convergence, path conventions, NAC, and physical limitations.

## Hard constraints

- The user owns the Phonopy installation and local files; generated or replaced files require disclosed paths and overwrite confirmation.
- The user owns the calculator, licenses, credentials, remote or scheduler environment, compute budget, and submitted jobs.
- Do not install, modify calculator environments, operate schedulers, infer
  credentials, resubmit failures, or mix forces from different settings.
- Keep displaced-structure identity and atom ordering traceable through every
  force file.
- Check supercell, displacement, mesh/path, tolerance, and NAC convergence before
  physical conclusions.

## Responsibilities

The Agent owns calculation design, convergence, calculator consistency,
evidence review, imaginary-mode diagnosis, and scientific interpretation.
Phonopy and the chosen force calculator perform only confirmed operations.

Return the calculation design, force-job inventory, validation plan, and expected Phonopy artifacts.
Stop when the structure, calculator consistency, units, convergence plan, or observable definition is insufficient.
Return provenance-linked phonon, DOS, thermal, and stability conclusions with uncertainty.
Do not interpret imaginary modes or thermal results before checking numerical, structural, and convergence causes.

## Outputs and completion

Return calculation scope, settings and rationale, exact commands and authority,
displacement/force ledger, generated artifacts, convergence and consistency
checks, phonon/thermal results, uncertainty, limitations, and conclusion.
Completion requires a complete consistent force set and validated outputs for
the requested observables.

## Failure handling

If phonopy or an interface command is unavailable, inspect local version help and preserve existing artifacts without installing or guessing flags. If any force job fails or atom ordering differs, stop assembly and repair the incomplete force set without automatic resubmission. If imaginary modes appear, preserve the result and test numerical, convergence, structure, and physical causes.

## Examples

Happy path: justify a supercell sequence, generate displacements, confirm each
force job, assemble a complete force set, compare convergence, and interpret the
band/DOS with any NAC and imaginary-mode limitations.

Near miss: combine force files from different calculator precision settings
because all jobs finished. Reject the mixed set and rerun only after a reviewed
consistent plan.

## ResearchSpec node contract

Execute exactly one ResearchSpec capability node.

- Input: `task_request` (plugin-task.v1).
- Output: `research_brief` (plugin-result.v1), a JSON object at the declared output path.

## Packaged knowledge

- Load knowledge ID `configuration-force-reference` from `references/configuration-and-force-files.md`.

## Brief output

Before submitting, write the `research_brief` JSON with these required sections:
`scope` `configuration_review` `force_ledger` `run_ledger` `validation_results` `conclusions`.

Every section must be non-empty and evidence-backed. The declared
`validate_materials_brief.py --required scope, configuration_review, force_ledger, run_ledger, validation_results, conclusions` validator rejects missing
or empty sections. The validator never invokes the external tool; ResearchSpec
never executes the user-managed scientific runtime.

## Completion

When the brief is written, submit the declared outputs through
`researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal
action. Do not choose, start, or advance another node, phase, mode, or run.
