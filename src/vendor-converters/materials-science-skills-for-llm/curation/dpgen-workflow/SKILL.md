---
name: materials-science-skills-dpgen-workflow
description: Plan and review DP-GEN concurrent-learning research loops with explicit data, model, DFT, and scheduler boundaries.
license: MIT
compatibility: Requires user-managed DP-GEN, model-training, DFT, and optional scheduler environments. ResearchSpec does not provision or operate them.
metadata:
  vendor: materials-science-skills-for-llm
  vendor-release: snapshot-fafd3ab
  upstream-skill-id: dpgen-workflow
  researchspec-role: semantic-helper
---

Use this Skill for the scientific loop: initialize data, train an ensemble,
explore configurations, select uncertain structures, label them with a trusted
method, and iterate until the stated convergence criteria are met. Follow the
[quick start](references/quick-start.md).

Keep data provenance, train/validation separation, uncertainty thresholds,
labeling settings, and model versions explicit. Before any training, DFT, remote,
or scheduler operation, show the exact command, target, resource request,
expected cost, and affected paths and obtain confirmation. Do not create
environments, build packages, run tests, retrieve resources, or submit jobs
without that confirmation.
