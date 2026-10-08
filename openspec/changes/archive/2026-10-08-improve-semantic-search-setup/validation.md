# Validation

Validated on Linux with Node 24 on 2026-10-08.

## Automated checks

- `pnpm check`, `pnpm build`, and `pnpm exec tsc -p tsconfig.test.json`: passed.
- Changed TypeScript source/test files checked with `pnpm exec eslint` without automatic edits: passed.
- Runtime/cache/progress/cache CLI tests: 33 passed, 0 failed.
  `node --test --test-timeout=15000 .test-dist/tests/semantic-runtime.test.js .test-dist/tests/semantic-cache.test.js .test-dist/tests/semantic-search-prompts.test.js .test-dist/tests/search-cache-cli.test.js`
- Bootstrap/discovery/eligibility/static CLI tests: 21 passed, 0 failed.
  `node --test .test-dist/tests/graph-cli-main.test.js .test-dist/tests/graph-cli-static.test.js .test-dist/tests/procedure-discovery-cli.test.js .test-dist/tests/procedure-eligibility.test.js`
- After restoring catalog loading to bootstrap's optional-preparation error boundary, recompiled and reran its four semantic setup/consent/recovery tests: passed.
  `node --test --test-name-pattern='semantic|affirmative' .test-dist/tests/procedure-discovery-cli.test.js`
- `node scripts/generate-docs.mjs --check`, `node scripts/check-authored-whitespace.mjs`, and `git diff --check`: passed.
- `openspec validate improve-semantic-search-setup --strict`: passed.

Tests cover streamed download bytes, preparation failure, resource reuse after catalog changes, query deadlines, unknown-path retention, managed resources across versions, unsafe symlinks, active owners, dead-owner recovery, and multiple processes competing for recovery. Bootstrap tests exercise retry success, repeated failure, offline continuation, re-init/update, and non-interactive single-attempt behavior.

## Packaged CLI and terminal checks

Packed with `npm pack --ignore-scripts --json --pack-destination <temporary-directory>`, extracted into a temporary directory, and linked the existing repository dependencies without installing anything. Ran the package's `dist/src/cli/bin.js` against an isolated cache.

Passed: workspace-independent inspection; absent-cache dry-run without directory creation; refusal of unconfirmed cleanup, including `--force`; preview preserving files; explicit cleanup of seven model/runtime/index/staging entries; retention of unknown data and hybrid configuration; ordinary doctor inspection; and structured incomplete-cleanup reporting for an unsafe symlink while retaining the external data.

Repacked the final implementation, confirmed the packaged bootstrap, progress, cache handler and runtime files matched the built files byte-for-byte, and passed cache inspect/preview/refusal/confirmed-cleanup smoke checks again.

At 45 terminal columns, verified the package's multiline setup disclosure and short confirmation, declined setup, and completed initialization. A separate temporary script used the packaged bootstrap handler with simulated preparation to verify real terminal byte/percentage and index progress, failure rendering, default offline selection, explicit retry, runtime reuse, and successful completion.

## Limits and workspace state

No real model download, runtime dependency installation, inference against the real model, or deletion of the user's cache was performed. macOS and Windows behavior was not exercised. Failed model downloads restart that stage; resumable downloads remain outside this change.

The pre-existing `.gitignore` changes were retained. No dependencies, Git commits, branches, or history were changed. The OpenSpec change remains active for explicit archival.
