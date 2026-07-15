---
name: materials-science-skills-deeptb-helper
description: Prepare and review DeePTB datasets, configurations, training plans, and evaluation workflows.
license: MIT
compatibility: Requires a user-managed DeePTB environment, local datasets, and approved compute capacity. ResearchSpec does not provision dependencies.
metadata:
  vendor: materials-science-skills-for-llm
  vendor-release: snapshot-fafd3ab
  upstream-skill-id: deeptb-helper
  researchspec-role: semantic-helper
---

Use this Skill to validate a DeePTB research plan from dataset preparation
through configuration, training, testing, and scientific interpretation. Consult
the [CLI guide](references/cli-cheatsheet.md) and [dataset guide](references/datasets.md).

Confirm dataset provenance, splits, units, species coverage, target properties,
configuration schema, and evaluation metrics. Render candidate configuration
files for review before any execution. Training may consume substantial compute;
show the exact command, environment, resource request, output directory, and
estimated cost, then obtain explicit confirmation. Never create environments,
install packages, retrieve datasets, or start training automatically.
