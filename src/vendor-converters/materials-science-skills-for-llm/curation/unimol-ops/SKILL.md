---
name: materials-science-skills-unimol-ops
description: Plan and review local Uni-Mol inference and representation workflows using user-provided models, molecular data, and GPU resources.
license: MIT
compatibility: Requires a user-managed local Uni-Mol runtime, model files, molecular data, and optional GPU capacity. ResearchSpec does not retrieve images, models, or data.
metadata:
  vendor: materials-science-skills-for-llm
  vendor-release: snapshot-fafd3ab
  upstream-skill-id: unimol-ops
  researchspec-role: semantic-helper
---

Use this Skill for local molecular representation extraction, property inference,
and reviewed downstream analysis. Start with [resource requirements](references/resources.md)
and choose a workflow from [workflows](references/workflows.md).

Accept only model and data paths explicitly supplied by the user. Record model
provenance, task compatibility, input schema, units, preprocessing, device, and
output destination. GPU work may be expensive; show the exact local command,
resource request, expected cost, and affected paths and obtain confirmation.
Never retrieve models or data, pull images, configure credentials, or contact a
remote inference endpoint.
