# Verification

## Scope and evidence

The initial inspection reproduced missing review_workspace fields in standalone packets for academic-paper, generation-manuscript-drafting, transform-revision-roadmap-parsing and transform-revision-patching. Existing baseline type checking and 34 related tests passed despite that omission; they did not measure preparation or review-offer behavior.

Navigate and the ARSU manuscript preflight now load one preparation fragment from src/manuscript-guidance.ts. It distinguishes source from delivery, requires unresolved preferences and direction to be discussed, scopes research to evidence gaps, and leaves interviews with the coordinating Agent. Both Skill and command surfaces render successfully and retain one Navigate entry.

Review hints reuse the existing annotation-intake protocol, published shared HTML and source/result validators. They advertise availability, with browser selection required before preparation. Existing humanizer and revision-master precedence and versioned protocols remain intact.

## Checks

- Initial pnpm check and pnpm lint: passed.
- OpenSpec change strict validation: passed.
- ARSU convert/check/idempotence: passed with no validation warnings or drift.
- Extraction index and agent-neutral runtime-policy checks: passed (120 extraction artifacts; 41 classified runtime sources).
- Initial targeted adapter, packet, review-workspace and v2 source/handoff tests: 29 passed.
- Dogfood harness regression tests: 7 passed.
- CLI context, standalone material inspection and packet regressions: 24 passed, including the four ordinary manuscript hints through actual CLI instructions and graph-mode capability packets.

## Final integration results

| Check | Result |
| --- | --- |
| `UV_CACHE_DIR=/tmp/researchspec-uv-cache pnpm test` | 601 passed; zero failed, skipped or cancelled. Log: `/tmp/researchspec-manuscript-tests.log`. |
| `pnpm check`, `pnpm lint` | Passed on the final source tree. |
| `openspec validate improve-manuscript-collaboration-defaults --strict` | Passed. All eight implementation tasks complete; the change remains active and unarchived. |
| `node scripts/check-authored-whitespace.mjs`, `git diff --check` | Passed. |
| Core, paper-humanizer and revision-master authoring repeated | All 861 capability files identical on the second pass. |
| `node scripts/own-vendor-maintenance.mjs check` | Both current owned-vendor anchors passed after source-linked semantic review and regeneration. |
| `node scripts/arsu-maintenance.mjs check v3.22.2-7de1c9d` | Passed; regenerated all three review artifacts and retained the existing calibration/resume gap judgments. |
| `node dist/src/arsu-converter/cli.js check --json` and `idempotence --json` | Passed, no warnings or drift. |
| `node scripts/generate-docs.mjs --check` | Passed. |
| Collaboration catalog and fixture inspection | Five new cases; natural-18 and the 34 existing scenarios preserved; 39 scenarios total, all fixture paths present and one initial prompt per new case. |

The capability parity audit reports 65/65 operational with no low-coverage, missing-output, knowledge or flow-retained findings. The nine changed capability bodies were reviewed against their unchanged source extraction; manifests, input/output roles, knowledge resources, tools and graph profiles were preserved. Vendor sources, extraction artifacts and the deep-research Skill have no diff.

Packaged smoke verification used `npm pack --ignore-scripts`, temporary extraction, and a symlink to the repository's existing node_modules. It ran the packed CLI in an isolated project, initialized both Codex and Claude entry forms, checked the four ordinary manuscript packet assets resolve inside the extracted package, then ran update and check all --strict. Passed; evidence directory: `/tmp/researchspec-manuscript-package-Y5aN1m`. The first smoke assertion assumed a flat Claude command filename; correcting the check to the catalog-owned `.claude/commands/researchspec/navigate.md` resolved it without a product change.

The dependency-installing full release verifier was not run. No dependency installation, global installation, commit, branch change or developer server was performed.

## Behavior acceptance boundary

The delivered manuscript-collaboration suite and manual guide define observable first-turn and true multi-turn acceptance. No live host/model campaign or human browser-feedback session is claimed by these code tests. Future browser selection, user answers or Gate verdicts must not be concatenated into the initial test prompt.
