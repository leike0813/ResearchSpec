# ResearchSpec

ResearchSpec is an agent-neutral, file-based control plane for Academic Research Skills Universal (ARSU). It installs research Skills into supported Agent tools while keeping workflow state, artifacts, formal Gates, human Decisions, transitions, and receipts in an explicit local workspace.

Version `0.1.0` is an MVP release candidate. The functional user model is implemented and covered by public-CLI acceptance journeys; publication remains blocked until the hosted CI and manual dogfooding checklist are signed.

## Requirements

- Node.js 22 or 24
- pnpm 10 for source development
- one supported Agent tool; Codex is used in the examples below

Node 20 is end-of-life and is not part of the supported release matrix.

## Installation

After the package is published:

```bash
npm install --global researchspec
researchspec --version
```

For local source evaluation:

```bash
pnpm install --frozen-lockfile
pnpm build
npm link
researchspec --version
```

Local linking is for development and dogfooding; it is not evidence that the npm package has been released.

## Quick Start

Initialize a new research project without starting academic work:

```bash
mkdir my-research
cd my-research
researchspec init . --tools codex
researchspec check all --strict
```

Then start Codex in the same project and describe the research goal in natural language:

> I want to study how generative AI affects writing instruction in higher education. Show candidate routes, prerequisites, artifacts, formal Gates, risks, and cost. Do not start a route until I confirm it.

ResearchSpec installs exactly eight base project Skills:

- ARSU: `deep-research`, `academic-paper`, `academic-paper-reviewer`, `academic-pipeline`
- Companion: `researchspec-navigate`, `researchspec-propose`, `researchspec-decide`, `researchspec-verify`

Optional ResearchSpec-maintained [domain Skill plugins](docs/domain_skill_plugins.md)
can add reviewed Open Agent Skills to the workspace. Users select stable
vendor-neutral domains; maintainer converters own upstream provenance and Skill
dependencies. Discipline domains follow [ANZSRC 2020 FoR Group](docs/domain_taxonomy.md),
while Field codes remain audit metadata; empty fixed domains stay internal until
reviewed Skills are available. Plugins add no command
wrappers and never own workflow state, Gates, Decisions, or receipts. During
normal research dialogue, Navigate can quietly inspect compact plugin metadata,
suggest a small relevant domain batch, obtain separate consent, preview and
execute the exact hash-bound installation, and use the projected Skill as an
advisory helper of the current ARSU producer. Core work continues unchanged when
the user declines or augmentation is unavailable. Inspect the bundled catalog
manually with `researchspec plugin list`; manual CLI selection remains optional.

The normal runtime protocol is:

```text
status → instructions <selector> → start / submit / advance → status
```

The CLI is the only workflow-state authority. Agents produce semantic candidate artifacts; they must not directly edit state, registries, ledgers, or receipts.

## Codex Installation Scope

Codex Skills are project-local under `.codex/skills/`. Codex command prompts are shared-global under `$CODEX_HOME/prompts/`, or `~/.codex/prompts/` when `CODEX_HOME` is unset. Non-interactive initialization requires Codex to be explicitly selected so this global write is visible.

For an isolated evaluation:

```bash
export CODEX_HOME="$PWD/.codex-home"
researchspec init . --tools codex
```

Run Codex from the same environment. Maintainers can use the repository-only [Codex dogfooding adapter](playbooks/dogfooding/adapters/codex.md) with the canonical playbook; neither is included in the npm package.

## Privacy And Safety

- The ResearchSpec CLI has no runtime LLM API integration and sends no telemetry.
- Agent tools may have their own network, model, and telemetry behavior; review those tools separately.
- `handoff` is a derived view and `pack` excludes registered artifacts by default. `--include-artifacts` is an explicit privacy-sensitive action.
- Research content stays in the project unless the user or Agent tool exports or transmits it.
- Formal Gates require human confirmation. `--yes` only authorizes an already previewed mechanical transaction.

See [SECURITY.md](SECURITY.md) for supported versions and vulnerability handling.

## Documentation

- [Canonical ARSU user model](docs/arsu_user_usage_model.md)
- [CLI interface](docs/cli_interface_design.md)
- [Domain Skill plugins](docs/domain_skill_plugins.md)
- [Domain taxonomy](docs/domain_taxonomy.md)
- [Education Agent Skills vendor adapter](docs/education_agent_skills_vendor_adapter.md)
- [FinRobot vendor adapter](docs/finrobot_vendor_adapter.md)
- [HistAgent vendor adapter](docs/histagent_vendor_adapter.md)
- [Materials-Science-Skills-For-LLM vendor adapter](docs/materials_science_skills_vendor_adapter.md)
- [Scientific Agent Skills vendor adapter](docs/scientific_agent_skills_vendor_adapter.md)
- [Scientific Agent Skills v2.53.0 manual security review](artifacts/scientific_agent_skills_v2_53_0_manual_security_review.md)
- [Scientific Agent Skills v2.53.0 ingest conclusion](artifacts/scientific_agent_skills_v2_53_0_ingest_report.md)
- [ToolUniverse vendor adapter](docs/tooluniverse_vendor_adapter.md)
- [Release process](docs/release_process.md)
- [Project-owner walkthrough](playbooks/owner-walkthrough/README.md) — recommended introduction to the real operating model
- [Playbooks index](playbooks/README.md) — owner walkthrough and Dogfooding QA guidance; repository-only, not included in the npm package

## Licensing

ResearchSpec uses a mixed-license model:

- ResearchSpec-authored framework and Companion material is MIT licensed.
- Bundled and generated ARSU-derived material is licensed under CC BY-NC 4.0 and retains Cheng-I Wu's upstream attribution.
- Education Agent Skills domain assets are adapted under CC BY-SA 4.0 and retain Gareth Manning attribution plus modification notices in every generated Skill.
- ToolUniverse, Scientific Agent Skills, Materials-Science-Skills-For-LLM, FinRobot, and HistAgent domain assets retain the Skill-level licenses and provenance recorded in each generated `LICENSE` and `NOTICE` or `NOTICE.md`.

The complete combined package must not be described as unrestricted for commercial use. See [LICENSE](LICENSE), [NOTICE](NOTICE), and [LICENSES](LICENSES/) for the material boundary. Commercial use requires separate rights review and may require upstream permission.

## Release Status

The repository contains no automated publish workflow. A tag or npm publication is authorized only after the technical gates, hosted Node/OS matrix, administrative controls, and manual dogfood journeys in [the release checklist](artifacts/mvp_release_checklist.md) are complete.
