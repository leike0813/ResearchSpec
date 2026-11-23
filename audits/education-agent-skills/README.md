# Education Agent Skills Maintenance Audits

This directory holds the Education Agent Skills extension-mode maintenance
suite.

- `catalog.json` is the machine-readable maintenance SSOT generated from the
  reviewed vendor bundle and the source-neutral domain catalog: upstream pin,
  136 raw Skill mappings, validators, and required brief fields.
- `v3.1.0/` is the current approved production anchor. `snapshot-6bbbce4/`
  and `snapshot-32fce5c/` preserve the prior reviewed releases.
  `catalog.json` records the current production identity. A completed
  anchor holds the immutable upstream skill audit
  (`skill-audit.json`, `report.md`), the evidence map and report, extension
  records 01–05, `artifacts/extension-review.json`, and the hash-bound
  `manifest.json`. Incremental anchors also retain the candidate diff and
  production verification under `artifacts/`.
- `scripts/generate-education-agent-skills-extensions.mjs` regenerates all 136
  `plugin-education-agent-skills-*` packages, profiles, registry entries, and
  the catalog. `scripts/education-agent-skills-maintenance.mjs` provides
  `artifacts / records / baseline / check / diff`;
  `.agents/skills/education-agent-skills-maintenance` documents the process.

Incremental absorption rebuilds only the changed raw Skills and their extension
packages; the unchanged packages and their reviewed source identity stay
byte-identical.

Never edit a generated extension package or profile without going through the
maintenance Skill and re-baselining the anchor.
