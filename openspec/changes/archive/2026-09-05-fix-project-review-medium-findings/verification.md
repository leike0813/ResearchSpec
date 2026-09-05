# Verification evidence

Baseline: `7cdb199`. Findings refer to items 6–10 of `artifacts/archive/2026-09-05-project-review.md`.
The archived review remains unchanged. This record documents the current remediation rather than
retroactively changing its observations.

## Empty-selection status

An isolated schema 2 workspace was initialized with no tools, no literature Adapter and no plugin
selection. Three fresh compiled CLI processes used the same workspace before and after rebuilding:

| Version | Wall time (ms) |
| --- | --- |
| Before | 2262, 2287, 2283 |
| After | 955, 936, 841 |

The median fell from 2283 to 936 ms (about 59%). This is a local comparison, not a portable latency
guarantee. A temporary Node preload observed `node:fs/promises` readFile/readdir/stat/lstat/access
calls for the extension tree: the fixed `status --json` exited 0 with zero such calls. No profiling
hook, cache or time threshold was added to production or tests.

## Checks completed

- `pnpm exec tsc -p tsconfig.build.json` and `pnpm exec tsc -p tsconfig.test.json`: passed.
- `node --test .test-dist/tests/graph-cli.test.js .test-dist/tests/dogfooding-playbook.test.js`: 5 passed.
- `pnpm check`, `pnpm lint`, `node scripts/generate-docs.mjs --check`: passed on the initial implementation; final integration is recorded below when complete.
- `openspec validate fix-project-review-medium-findings --strict --no-interactive`: passed.
- `openspec validate --specs --strict --no-interactive`: 49 passed; existing long-requirement informational notices remain.

## Acceptance boundary

`pnpm release:verify` passed against the actual tarball: 5,349 files and 107,577,860 bytes unpacked.
`npm pack --dry-run --ignore-scripts --json` reported 33,549,441 compressed bytes and zero compiled
vendor-converter entries. The verifier exercised installed minimal and academic pipeline journeys,
two revision/re-review rounds, Gate/Decision recovery, terminal root/child state, strict checking and
tool delivery. The size change is small because reviewed offline resources remain bundled.

The user authorized the existing `release:verify` isolated npm installation with lifecycle scripts
disabled. Project dependencies and lockfiles are unchanged. Real-Agent academic dogfooding, hosted
OS/Node certification and publication are not authorized by technical success and remain unsigned.

## Maintenance identities

Independent recomputation over the pinned Git file inventories reproduced the old UTF-8 text hashes
exactly. Raw-byte hashing changes 56 of 7,365 ToolUniverse files, 7 of 145 ordinary FinRobot files,
and 54 of 120 HistAgent files. FinRobot's 145 ordinary files do not replace its immutable audit's
146 tracked Git entries. Each affected `05-semantic-review.md` records old/new tree identities,
examples, scope and the preserved capability semantics.

After semantic review, the existing baseline commands refreshed the current ToolUniverse, FinRobot
and HistAgent anchors. All six `node scripts/<vendor>-maintenance.mjs check` commands pass.
Scientific, Education and Materials current baselines remain byte-identical. The changed audit
paths are only those three anchors' `01-analysis.md`, `05-semantic-review.md` and `manifest.json`.
`git diff --name-only skills vendor authoring` is empty: raw Skills, extension packages, profiles,
registries, authoring inputs and upstream sources are unchanged. Immutable audit JSON/reports and
project dependencies/lockfile remain unchanged.

The shared maintenance commands also honor an explicit `artifacts <anchor>` argument. Regression
checks cover its output location, distinct invalid UTF-8 byte hashes and unchanged UTF-8 text hashes.
An unreviewed baseline is rejected without a manifest. The six vendor manifest tests share
`tests/helpers/vendor-maintenance.ts`; vendor-specific catalog admission assertions remain local.
The consolidated maintenance test run passed all 14 tests. Re-running records for the three affected
anchors preserved all five records and manifest bytes exactly.

## First integrated test pass

The first full run completed 345 tests: 341 passed, with four expected remediation failures. One
Education package test still required a now-redundant child exclusion path; its parent-directory
assertion was corrected and the targeted test passed. The other three were the old text-hash
baselines described above. The new shared-maintenance tests and current dogfooding tests passed.

## Final integration

- `pnpm exec tsc -p tsconfig.test.json && node scripts/run-tests.mjs`: 347 passed, zero failures,
  cancellations or skips (244 seconds). Output was captured in `/tmp/researchspec-medium-final-tests.log`.
- Consolidated vendor tests plus the shared maintenance regressions: 14 passed after the helper refactor.
- Final `pnpm lint`, `pnpm check`, `node scripts/generate-docs.mjs --check`,
  `node scripts/check-authored-whitespace.mjs` and `git diff --check`: passed.
- `pnpm release:verify` was repeated after final README/anchor guidance edits and passed:
  5,349 files, 107,578,136 bytes unpacked, with no compiled vendor converters. The installed
  minimal/pipeline journeys and complete tool-projection verification passed again.
