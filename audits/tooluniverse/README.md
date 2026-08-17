# ToolUniverse Maintenance Audits

This directory holds the ToolUniverse extension-mode maintenance suite.

- `catalog.json` is the machine-readable maintenance SSOT generated from the
  reviewed vendor bundle and the source-neutral domain catalog: upstream pin,
  130 raw Skill mappings, reviewed resource files, validators, and required
  brief fields.
- `v1.3.1/` is the current anchor. It contains the immutable upstream skill
  audit (`skill-audit.json`, `report.md`), extension records 01–05,
  `artifacts/extension-review.json`, and the hash-bound `manifest.json`.
- `scripts/generate-tooluniverse-extensions.mjs` regenerates all 130
  `plugin-tooluniverse-*` packages, profiles, registry entries, and the
  catalog. `scripts/tooluniverse-maintenance.mjs` provides
  `artifacts / records / baseline / check / diff`;
  `.agents/skills/tooluniverse-maintenance` documents the process.

Never edit a generated extension package or profile without going through the
maintenance Skill and re-baselining the anchor.
