# Materials-Science-Skills-For-LLM Maintenance Audits

This directory holds the Materials-Science-Skills-For-LLM extension-mode
maintenance suite.

- `catalog.json` is the machine-readable maintenance SSOT: upstream pin, raw
  Skill mapping, reference files, validators, and required brief fields.
- `snapshot-fafd3ab/` is the current anchor. It contains the immutable upstream
  skill audit (`skill-audit.json`, `report.md`), extension records 01–05,
  `artifacts/extension-review.json`, and the hash-bound `manifest.json`.
- `scripts/materials-science-skills-for-llm-maintenance.mjs` provides
  `artifacts / records / baseline / check / diff`;
  `.agents/skills/materials-science-skills-for-llm-maintenance` documents the
  process.

Never edit a generated extension package or profile without going through the
maintenance Skill and re-baselining the anchor.
