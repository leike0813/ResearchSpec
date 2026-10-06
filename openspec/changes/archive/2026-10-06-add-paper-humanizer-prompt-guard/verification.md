# Implementation verification

Verified on 2026-10-06. The change is implemented; no commit, publication or live host invocation was performed.

## Delivered behavior

- The 18 reviewed host mappings receive the complete shared guard independently of `skills`, `commands` or `both` delivery. Current schema 2 workspaces default to on; an explicit `--paper-humanizer-guard on|off` persists, and omission preserves the preference.
- Command hooks use the native context protocol. In-process plugins read the same guard and preserve existing system content. Copilot transformation preserves the supplied transformed prompt before appending the guard.
- JSON reconciliation owns only the ResearchSpec entries, protects writes with the complete file snapshot and preserves user settings. Modified hooks retain their dependencies during off/deselection and produce diagnostics. Malformed configurations, unowned collisions and unsafe paths are preserved or rejected.
- Static status, check and doctor inspect installation and drift without executing hooks. Host loading remains `unverified`; the catalog carries each host's activation prerequisites.
- PH-KP-04 preserves the upstream guard body byte-for-byte. The adapted delivery guard, publisher and MIT notice are frozen in the paper-humanizer maintenance anchor; shared revision-master and ARSU identities were refreshed.

## Validation

| Check | Result |
| --- | --- |
| `pnpm test` | 571 passed, 0 failed; 292.6 seconds |
| Fresh test compilation and `node --test .test-dist/tests/prompt-guard-native-config.test.js` | 10 passed after removing a redundant static text assertion; dynamic plugin execution remains covered by the full suite |
| `pnpm check` | Passed |
| `pnpm lint` | Passed |
| `pnpm docs:check` | Passed; generated handbook and website CLI pages are consistent |
| `pnpm release:verify` | Passed; installed tarball contains 6,653 files, 128,210,032 unpacked bytes |
| `node scripts/own-vendor-maintenance.mjs check` | Paper Humanizer and Revision Master passed |
| `node scripts/arsu-maintenance.mjs check v3.22.2-7de1c9d` | Passed, including after preserving the existing human analysis and extraction decisions |
| `node scripts/check-authored-whitespace.mjs` | Passed |
| `git diff --check` | Passed |
| `openspec validate add-paper-humanizer-prompt-guard --strict` | Passed |

Publisher tests exercise successive identical guard injections, native response envelopes, original prompt preservation, Unicode/BOM input, missing guard and bounded malformed, oversized or stalled input. Delivery tests exercise all 18 mappings, dynamic plugin execution on successive turns, shell-sensitive project paths, user-setting preservation, concurrent-write rejection, drift, retirement, unsafe paths, subset updates and CLI preferences. Native configuration tests verify host event/configuration shapes and executable script delivery. Maintenance tests detect delivery-byte drift independently of capability hashes and reject unsafe asset paths.

The release verifier installs the tarball in a temporary project, verifies the copied guard and publisher, executes two publisher turns and exercises existing installed CLI journeys and all registered tool delivery. This is package/runtime verification, not a live-host certification.

## Review findings resolved

- Kilo uses the singular `.kilo/plugin/` directory and its native `{ id, server }` plugin descriptor; OpenCode retains its factory export.
- Factory uses root events in `.factory/hooks.json`, while an existing alternate settings file uses its `hooks` object. When both files exist, the primary path wins.
- The first package checks exposed missing package allowlisting and an outdated workspace-directory expectation; both were updated before the successful release run.
- An initial full-test run encountered an outdated compiled delivery-asset expectation and a maintenance baseline changed by the final Skill edit. Baselines were refreshed, then the complete suite passed.
- Aggregate record generation replaced existing human-written sections in ARSU analysis and ingestion. Those sections were restored unchanged, the record identity was refreshed, and maintenance check passed again.
- The scout raised a possible `check tools` path-filter gap. Hook inspection diagnostics are appended after that filter, so all reviewed hook paths reach the result without extending the unrelated index filter.

## Unchanged scope and evidence limits

`git diff --numstat -- skills/capabilities skills/arsu/profiles vendor authoring/ars` is empty. Existing core capability packages, graph profiles, pinned upstream trees and ARS extraction bytes are unchanged. No extra user entry Skill, Procedure, public command, model service or workflow-state authority was added.

No live Claude, Codex, Cursor or other host was launched. Trust settings, hook enablement, startup snapshots/reloads, EAP availability and experimental/private host APIs remain host prerequisites. The guard's effect on actual writing quality has not been measured; successful native response generation cannot prove model adherence.
