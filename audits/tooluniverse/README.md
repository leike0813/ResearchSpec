# ToolUniverse Maintenance Audits

This directory holds the ToolUniverse extension-mode maintenance suite.

- `catalog.json` is the machine-readable maintenance SSOT generated from the
  reviewed vendor bundle and the source-neutral domain catalog: upstream pin,
  130 raw Skill mappings, reviewed resource files, validators, and required
  brief fields.
- `v1.5.4-8ec5d4b/` is the current anchor. It contains the complete 185-Skill
  upstream inventory (130 admitted, 55 excluded), incremental evidence,
  tool-contract adaptations and the immutable upstream skill
  audit (`skill-audit.json`, `report.md`), extension records 01–05,
  `artifacts/extension-review.json`, and the hash-bound `manifest.json`.
- `v1.3.1/` retains the preceding immutable anchor for comparison.
- `scripts/generate-tooluniverse-extensions.mjs` regenerates all 130
  `plugin-tooluniverse-*` packages, profiles, registry entries, and the
  catalog. `scripts/tooluniverse-maintenance.mjs` provides
  `artifacts / records / baseline / check / diff`;
  `.agents/skills/tooluniverse-maintenance` documents the process.

Never edit a generated extension package or profile without going through the
maintenance Skill and re-baselining the anchor.
