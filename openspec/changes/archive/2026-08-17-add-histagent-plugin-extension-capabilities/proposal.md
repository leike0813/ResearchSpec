## Why

FinRobot now has a complete new-mode surface and maintenance suite. HistAgent is the next vendor in the agreed order. Its three reviewed production Skills are independently reimplemented script-assisted trees, but they exist only as advisory vendor-bundle Skills and have no graph-native extension packages or per-vendor maintenance suite.

## What Changes

- Add three extension capability packages derived one-to-one from the reviewed HistAgent Skills:
  - `plugin-historical-research` (mixed, `tools/research_runtime.py`, local state Gate)
  - `plugin-historical-source-analysis` (mixed, `tools/analyze_source.py`, user-managed adapters)
  - `plugin-historical-source-identification` (mixed, `tools/identify_sources.py`, user-configured providers)
- Package the reviewed scripts, `lib/historical_support.py`, and the six progressive-disclosure references as hash-bound knowledge refs.
- Add one one-node graph profile per capability.
- Add evidence-bound `validate_historical_brief.py` script validators for all three packages.
- Assign the extensions to the same domains as the raw Skills: all three to `historical-studies`; source analysis and source identification also to `heritage-archive-and-museum-studies`.
- Add end-to-end graph coverage for all three profiles and invalid-then-valid validator paths.
- Add the HistAgent maintenance suite: `scripts/histagent-maintenance.mjs`, `.agents/skills/histagent-maintenance`, package commands, maintenance tests, and the `snapshot-47bbe21` anchor records (01–05), artifacts, and hash-bound `manifest.json`.

## Impact

- No public CLI command changes and no engine changes.
- Installing `historical-studies` now projects all three HistAgent extension capabilities and profiles; installing `heritage-archive-and-museum-studies` projects the two source-oriented extensions alongside the existing raw Skills.
- Extension packages remain static during install, update, status, and check; only the declared `python3` validators execute during `advance`.

## Capabilities

### New Capabilities

- `plugin-historical-research`
- `plugin-historical-source-analysis`
- `plugin-historical-source-identification`

### Modified Capabilities

None.
