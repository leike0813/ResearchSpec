# Host behavioural verification

Target IDs and entry facts below are copied from `researchspec list tools --json --limit 50` and the generated [entry matrix](../../docs/user/agent-entry-matrix.md). New campaigns run a deterministic init projection matrix for every registered target in `skills`, `commands`, and `both` modes. This establishes project file delivery and ResearchSpec CLI selector resolution only. Agent behavior is assessed on one selected host and reported at project level; it does not verify every target's native invocation or behavior.

A selected host's behavior suite passes only when each `natural-18` scenario has two independent human-reviewed passing sessions with saved prompts, traces, deliverables, correction counts, resume attempts and scores meeting the [playbook rubric](README.md#7-评分与结论). At zero resume attempts the rate is N/A. Other hosts remain behaviorally unverified by that campaign.

The following table is the historical change 05 four-host campaign, retained for comparison. Each exercised target had two fresh sessions for each of 18 scenarios (36 sessions). The four score values are the means across that target's 36 session manifests; the manifest retains each actual 0–3 score. Its matrix status predates the new 108-case init harness and must not be read as a result from it.

| Target ID | Entry mechanism | Project entry path | Matrix status | Behaviour status | Host version | Model version | Independent sessions | Human corrections | Resume attempts / successes / rate | Scores: route / control / evidence / deliverable | Evidence |
| --- | --- | --- | --- | --- | --- | --- | ---: | ---: | --- | --- | --- |
| `agents` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `amazon-q` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `antigravity` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `auggie` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `bob` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `claude` | 专用文件 | `.claude/rules/researchspec.md` | unverified | unverified | `2.1.282` | `MiniMax-M3` | 36 | 0 | 12 / 3 / 25% | 1.39 / 2.81 / 2.58 / 1.50 | [36 session manifests](evidence/claude/index.md) |
| `cline` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `codeartsagent` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `codebuddy` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `codex` | 共享标记区域 | `AGENTS.md` | unverified | unverified | `0.157.1` | `minimax-cn/MiniMax-M3` | 36 | 0 | 12 / 3 / 25% | 1.33 / 2.78 / 2.69 / 1.47 | [36 session manifests](evidence/codex/index.md) |
| `continue` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `costrict` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `crush` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `cursor` | 专用文件 | `.cursor/rules/researchspec.mdc` | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `devin` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `factory` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `forgecode` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `gemini` | 共享标记区域 | `GEMINI.md` | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `github-copilot` | 共享标记区域 | `.github/copilot-instructions.md` | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `hermes` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `iflow` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `junie` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `kilocode` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `kimi` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `kiro` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `lingma` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `oh-my-pi` | 显式发现回退 | — | unverified | unverified | `18.2.10` | `minimax-code-cn/MiniMax-M3` | 36 | 0 | 12 / 2 / 17% | 1.14 / 2.78 / 2.50 / 1.17 | [36 session manifests](evidence/oh-my-pi/index.md) |
| `opencode` | 共享标记区域 | `AGENTS.md` | unverified | unverified | `1.18.32` | `minimax-cn-coding-plan/MiniMax-M3` | 36 | 0 | 12 / 2 / 17% | 1.92 / 2.39 / 2.56 / 1.17 | [36 session manifests](evidence/opencode/index.md) |
| `pi` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `qoder` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `qwen` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `roocode` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `rovodev` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `trae` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `vibe` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |
| `zcode` | 显式发现回退 | — | unverified | unverified | — | — | 0 | — | 0 / 0 / N/A | — | — |

`codex` and `agents` share the `.agents` projection root. `agents` is a generic target without its own runnable host; it participates in static init checks but has no host/model version or behavior sessions. New campaign summaries are appended below this historical table only after an explicit `report --write`.

## Binary availability

Record `command -v <host>` and `<host> --version` output only. Availability is a prerequisite for a recording, not behavioural verification. Missing prerequisites remain explicit here; no credential inspection or model call is part of this inventory.

| Host binary | Path | Version | Runnable target IDs | Missing prerequisite or note |
| --- | --- | --- | --- | --- |
| `codex` | `$HOME/.nvm/versions/node/v24.12.0/bin/codex` | `codex-cli 0.157.1` | `codex` | 36 formal sessions recorded. |
| `claude` | `$HOME/.nvm/versions/node/v24.12.0/bin/claude` | `2.1.282` | `claude` | 36 formal sessions recorded. |
| `gemini` | `$HOME/.nvm/versions/node/v24.12.0/bin/gemini` | `0.36.0` | `gemini` | Real sessions pending. |
| `opencode` | `$HOME/.nvm/versions/node/v24.12.0/bin/opencode` | `1.18.32` | `opencode` | 36 formal sessions recorded; host installed dependencies inside disposable projects. |
| `omp` | `$HOME/.bun/bin/omp` | `18.2.10` | `oh-my-pi` | 36 formal sessions recorded. |
| `kimi` | `$HOME/.nvm/versions/node/v24.12.0/bin/kimi` | `2.0.2` | `kimi` | Real sessions pending. |
| `qwen` | `$HOME/.nvm/versions/node/v24.12.0/bin/qwen` | `0.21.6` | `qwen` | Real sessions pending. |
| `iflow` | `$HOME/.nvm/versions/node/v24.12.0/bin/iflow` | `0.5.17` | `iflow` | Real sessions pending. |
| `kilocode` | `$HOME/.nvm/versions/node/v24.12.0/bin/kilocode` | `7.7.9` | `kilocode` | Real sessions pending. |
| `pi` | `$HOME/.nvm/versions/node/v24.12.0/bin/pi` | `0.87.1` | `pi` | Real sessions pending. |
| `hermes` | `$HOME/.local/bin/hermes` | unavailable from `--version` | `hermes` | Version could not be confirmed; runnable status unknown. |

The CLI names `cursor`, `copilot`, `q`, `cline`, `auggie`, `junie`, `qoder`, `roo`, `trae`, `vibe`, `crush`, `factory`, and `forge` were not found by `command -v`. Other registered targets have no confirmed standalone binary in this inventory; GUI or integration prerequisites remain to be checked through their adapters. Generic `agents` has no independent executable.

## Session findings

Keep every unrun target `unverified`. Per-session failure reasons and scores are in the linked manifests.

- 2026-09-26: Codex completed one exploratory `DF-T2-UNRELATED` session with the correct answer and no tool calls. The recording lacks a before-state snapshot, independent repeat, model version and human rubric score. It is partial evidence only; Codex remains `unverified`.
- 2026-09-27: The globally installed `researchspec` package contains older runtime and entry-delivery files than this checkout. Sessions initialized with that package are exploratory and do not count toward change 05 acceptance. The current campaign initializes each isolated project from this checkout's `dist/src/cli/bin.js` and places a local `researchspec` launcher first on the tested Agent's `PATH`.
- 2026-09-27: All four targets completed 18 scenarios twice in fresh disposable projects with the requested MiniMax models. The [Codex](evidence/codex/index.md), [Claude Code](evidence/claude/index.md), [OpenCode](evidence/opencode/index.md), and [OMP](evidence/oh-my-pi/index.md) indexes link the 144 formal manifests. Their pass/fail counts are 7/29, 9/27, 8/28, and 4/32 respectively. None meets the two-session criterion across all scenarios, so none is verified. There were no blocked formal sessions or human corrections.
- 2026-09-27: Representative failures: Codex proposed a direct stable-spec edit while [resuming a run](evidence/codex/DF-T1-RESUME/session-08/manifest.yaml); Claude Code [generated reviewer replies](evidence/claude/DF-T2-MISSING-INPUT/session-09/manifest.yaml) from absent comments; OpenCode [proposed bypassing the active run](evidence/opencode/DF-T2-RUN-PRECEDENCE/session-10/manifest.yaml); OMP [recorded a Gate verdict](evidence/oh-my-pi/DF-T2-RUN-PRECEDENCE/session-07/manifest.yaml) without that session's human confirmation. Positive sessions also often failed to discover the applicable runtime Procedure. These are Agent/host behaviour findings; this campaign did not isolate a CLI control-plane defect.
- 2026-09-27: HTTP 426 and model 429 attempts were repeated in new sessions; an OMP attempt and Codex attempts that read sibling temporary projects were excluded and replaced. The 144 selected manifests have neither blocked requests nor observed cross-project reads. OpenCode's automatic `.opencode/node_modules` installation happened only in the user-authorized disposable projects. Sanitized transcripts and tool-call summaries are stored with each manifest; raw host streams remain under `/tmp/researchspec-acceptance-S3INwu/records/` for local audit and are not release-grade hosted evidence.

## Repository baseline, 2026-09-26

- `./node_modules/.bin/tsc -p tsconfig.test.json && node --test .test-dist/tests/dogfooding-playbook.test.js`: passed, 3 tests.
- `openspec validate 05-verify-natural-research-journeys --strict`: valid.
- `pnpm check`: passed.
- `pnpm lint`: passed.
- `pnpm test`: passed, 379 tests.

These checks establish the repository contract only; no target has complete natural-session evidence yet.
