## Why

`plugin-financial-statement-analysis` proved that a reviewed FinRobot raw Skill can become a mixed-execution extension capability with a deterministic script validator. The remaining five reviewed FinRobot Skills still exist only as advisory vendor-bundle Skills, so FinRobot has no complete new-mode surface and no per-vendor maintenance suite comparable to ARSU.

## What Changes

- Add five extension capability packages derived one-to-one from the remaining reviewed FinRobot Skills:
  - `plugin-financial-company-fundamentals` (mixed, `tools/fundamentals.py`)
  - `plugin-financial-competitive-position` (llm Agent procedure)
  - `plugin-financial-corporate-risk` (llm Agent procedure)
  - `plugin-financial-event-evidence` (mixed, `tools/event_evidence.py`)
  - `plugin-financial-relative-valuation` (mixed, `tools/valuation.py`)
- Add one one-node graph profile per new capability.
- Extend the four mixed capabilities, including the existing statement-analysis pilot, with evidence-bound `research_brief` script validators.
- Assign the six FinRobot extension capabilities and profiles to the same finance domains as the reviewed raw Skills.
- Add end-to-end coverage that starts and advances every FinRobot extension profile, including invalid-then-valid script-validator paths for every mixed capability.
- Add the FinRobot maintenance suite: `scripts/finrobot-maintenance.mjs`, `.agents/skills/finrobot-maintenance`, package commands, maintenance tests, and the `snapshot-297a8d2` anchor records (01–05), artifacts, and hash-bound `manifest.json`.

## Impact

- No public CLI command changes and no engine changes.
- Installing `banking-finance-and-investment` now projects all six FinRobot extension capabilities and profiles; installing `accounting-auditing-and-accountability` projects company-fundamentals and statement-analysis extensions alongside the existing raw Skills.
- Extension packages remain static during install, update, status, and check; only the declared `python3` validators execute during `advance`.

## Capabilities

### New Capabilities

- `plugin-financial-company-fundamentals`
- `plugin-financial-competitive-position`
- `plugin-financial-corporate-risk`
- `plugin-financial-event-evidence`
- `plugin-financial-relative-valuation`

### Modified Capabilities

- `plugin-financial-statement-analysis`: validator refactored to the shared evidence-bound brief validator contract while preserving its required fields.
