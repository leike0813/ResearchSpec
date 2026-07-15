---
name: materials-science-skills-phonopy-workflows
description: Plan finite-displacement phonon calculations and interpret Phonopy results with explicit force-calculator boundaries.
license: MIT
compatibility: Requires user-preinstalled Phonopy and a user-selected DFT or ALM force calculator with local inputs. ResearchSpec does not provision them.
metadata:
  vendor: materials-science-skills-for-llm
  vendor-release: snapshot-fafd3ab
  upstream-skill-id: phonopy-workflows
  researchspec-role: semantic-helper
---

Use this Skill to define supercells and displacements, coordinate force
calculations, assemble force constants, and interpret band structures, density of
states, thermal properties, and stability. Consult [configuration templates](references/config-templates.md),
[common files](references/common-files.md), and the [quick start](references/quick-start.md).

Confirm structure provenance, symmetry tolerance, supercell convergence, units,
calculator settings, and non-analytical corrections. DFT and ALM calculations
are external and may be expensive; present commands, compute targets, cost, and
affected paths and obtain explicit confirmation. Do not operate schedulers or
modify the calculator environment automatically.
