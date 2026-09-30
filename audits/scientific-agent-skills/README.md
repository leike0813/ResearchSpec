# Scientific Agent Skills Maintenance Audits

This directory holds the Scientific Agent Skills extension-mode maintenance
suite.

- `catalog.json` is the machine-readable maintenance SSOT generated from the
  reviewed vendor bundle and the source-neutral domain catalog: upstream pin,
  the reviewed raw Skill mappings, reviewed resource files, validators, and
  required brief fields.
- `v2.70.0/` is the current anchor. It contains the immutable upstream skill
  audit (`skill-audit.json`, `report.md`), extension records 01–05,
  `artifacts/extension-review.json`, and the hash-bound `manifest.json`.
- `scripts/generate-scientific-agent-skills-extensions.mjs` regenerates the
  reviewed `plugin-scientific-agent-skills-*` packages, profiles, registry entries, and
  the catalog. `scripts/scientific-agent-skills-maintenance.mjs` provides
  `artifacts / records / baseline / check / diff`;
  `.agents/skills/scientific-agent-skills-maintenance` documents the process.

Knowledge-ref hashes are byte-level SHA-256 so reviewed binary example assets
project and verify correctly. Never edit a generated extension package or
profile without going through the maintenance Skill and re-baselining the
anchor. Before refreshing an anchor, check upstream tags for a release newer
than the catalog pin instead of assuming the local anchor is current.
