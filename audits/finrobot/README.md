# FinRobot Maintenance Audits

This directory holds the FinRobot extension-mode maintenance suite.

- `catalog.json` is the machine-readable maintenance SSOT: upstream pin, raw
  Skill mapping, tool files, validators, and required brief fields.
- `snapshot-297a8d2/` is the current anchor. It contains the immutable upstream
  capability audit (`capability-audit.json`, `report.md`), extension records
  01–05, `artifacts/extension-review.json`, and the hash-bound `manifest.json`.
- `scripts/finrobot-maintenance.mjs` provides `artifacts / records / baseline /
  check / diff`; `.agents/skills/finrobot-maintenance` documents the process.

Never edit a generated extension package or profile without going through the
maintenance Skill and re-baselining the anchor.
