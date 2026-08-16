## Why

The ARSU maintenance loop was spread across chat history, three HTML generators writing to the root
`artifacts/` directory, and sparse hand-maintained audit notes. There was no committed, hash-verifiable
anchor audit that a future maintainer could reproduce, and the maintenance Skill read like a fixed
script sequence with no mandatory semantic review gate. A maintainer therefore could not prove that
the current workspace still matched the audited upstream anchor, or distinguish machine-measured
coverage from an Agent's semantic preservation judgment.

## What Changes

- Add `.agents/skills/arsu-maintenance/SKILL.md` with the five-stage
  `分析 -> 吸纳 -> 转换 -> 审阅 -> 审计` path and four maintenance modes:
  `anchor-baseline`, `incremental-update`, `audit-check`, and `artifact-regen`.
- Add `scripts/arsu-maintenance.mjs` with `records`, `baseline`, `check`, `artifacts`, and `diff`
  commands. `records` generates the machine-audited records 01–04 from live repository data;
  `baseline` freezes upstream, extraction, conversion, parity, HTML artifact, Skill and record
  SHA-256 values into `manifest.json`; `check` re-verifies every frozen value against the current
  workspace.
- Add the first anchor audit at `audits/arsu/v3.19.0-828ef3b/` containing the five records,
  three review HTML artifacts and a passing `manifest.json`.
- Add the mandatory Agent-authored semantic review record `05-semantic-review.md`. `baseline`
  refuses to write a manifest when the file is missing, contains `[NOT-COMPLETED]`, or has no
  `## 结论`; `records` only creates a placeholder when the file is absent and never overwrites an
  existing review.
- Move the three generated review HTML defaults from root `artifacts/` to
  `audits/arsu/<anchor>/artifacts/`, with `ARSU_ANCHOR` selecting the anchor. Explicit output
  arguments remain supported. Delete the old root-level `artifacts/arsu-mode-*.html` files.
- Add package scripts `arsu-maintenance:artifacts`, `arsu-maintenance:records`,
  `arsu-maintenance:baseline`, and `arsu-maintenance:check`, plus regression tests in
  `tests/arsu-maintenance.test.ts`.

## Impact

- Generated capability packages, graph profiles, runtime contracts and CLI behavior do not change.
- Consumers of the three review HTML files now read them from the anchor audit directory; the old
  root `artifacts/arsu-mode-*.html` paths are removed.
- The maintenance loop becomes independently verifiable from committed files and no longer depends
  on chat history. The first anchor remains at 119 extraction artifacts, 38/38 operational
  capabilities, 27/27 modes covered, 113 preserved + 3 engine-owned flow anchors and 0 gaps.
- `05-semantic-review.md` is an Agent judgment record, not script output; numeric parity remains a
  lower-bound audit, not semantic equivalence.

## Capabilities

### New Capabilities

- `arsu-maintenance`: anchor-scoped ARSU maintenance audits, deterministic record generation,
  manifest verification, HTML artifact placement, and the mandatory Agent semantic review gate.

### Modified Capabilities

None.
