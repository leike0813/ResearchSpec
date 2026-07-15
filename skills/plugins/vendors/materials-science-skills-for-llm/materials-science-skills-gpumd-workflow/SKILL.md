---
name: materials-science-skills-gpumd-workflow
description: Prepare and interpret GPUMD molecular-dynamics and NEP workflows using reviewed local inputs and user-approved GPU execution.
license: MIT
compatibility: Requires a user-compiled GPUMD executable, compatible CUDA/GPU capacity, and local datasets or potentials. ResearchSpec does not build or provision them.
metadata:
  vendor: materials-science-skills-for-llm
  vendor-release: snapshot-fafd3ab
  upstream-skill-id: gpumd-workflow
  researchspec-role: semantic-helper
---

Use this Skill to plan GPUMD simulations, NEP training, and output analysis.
Review [run inputs](references/gpumd-run.md), [NEP training](references/nep-training.md),
and [outputs](references/outputs.md), then follow the [quickstart](references/quickstart.md).

Validate structures, units, ensembles, temperatures, time steps, sampling,
potential provenance, and convergence criteria. GPU execution and NEP training
can be expensive: show the exact command, device request, expected duration,
output directory, and overwrite behavior, then obtain explicit confirmation.
Use [troubleshooting](references/troubleshooting.md) for diagnosis, not automatic
rebuilds or retries.
