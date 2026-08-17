# Education Agent Skills Maintenance Audits

This directory holds the Education Agent Skills extension-mode maintenance
suite.

- `catalog.json` is the machine-readable maintenance SSOT generated from the
  reviewed vendor bundle and the source-neutral domain catalog: upstream pin,
  136 raw Skill mappings, validators, and required brief fields.
- `snapshot-32fce5c/` is the current anchor. It contains the immutable upstream
  skill audit (`skill-audit.json`, `report.md`), the evidence map and report,
  extension records 01–05, `artifacts/extension-review.json`, and the
  hash-bound `manifest.json`.
- `scripts/generate-education-agent-skills-extensions.mjs` regenerates all 136
  `plugin-education-agent-skills-*` packages, profiles, registry entries, and
  the catalog. `scripts/education-agent-skills-maintenance.mjs` provides
  `artifacts / records / baseline / check / diff`;
  `.agents/skills/education-agent-skills-maintenance` documents the process.

Never edit a generated extension package or profile without going through the
maintenance Skill and re-baselining the anchor.
