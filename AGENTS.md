# AGENTS.md

## Project Mission

ResearchSpec is becoming the agent-neutral, spec-driven framework layer for
Academic Research Skills Universal (ARSU).

The project is no longer a generic ultra-light research contract initializer.
Its primary job is to absorb ARSU, maintain ARSU-derived skill artifacts inside
this repository, and provide the contract layer that lets those skills work
through stable files instead of platform-specific runtime assumptions.

Current external reference paths:

- ResearchSpec project: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec`
- ARSU project to be absorbed: `/home/joshua/Workspace/Code/Skill/academic-research-skills-universal`
- ARS upstream checkout inside ARSU: `/home/joshua/Workspace/Code/Skill/academic-research-skills-universal/vendor/ars`
- ToolUniverse vendor converter source: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec/vendor/tooluniverse`
- Scientific Agent Skills vendor converter source: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec/vendor/scientific-agent-skills`
- Materials-Science-Skills-For-LLM audit source: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec/vendor/materials-science-skills-for-llm`
- FinRobot audit source: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec/vendor/finrobot`
- HistAgent audit source: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec/vendor/histagent`

When paths or ownership change, update this file in the same change so future
agents do not follow stale locations.

## Product Direction

ResearchSpec should become:

- an OpenSpec-style framework for academic paper writing workflows;
- an agent-neutral host for ARSU-derived skills;
- a spec-driven contract system for research intent, sources, claims,
  manuscripts, workflow state, gates, decisions, artifacts, and patches;
- a converter/maintenance layer for ARSU outputs after ARSU is absorbed.

ResearchSpec should not become:

- an LLM API integration layer;
- a platform-specific Claude Code or Codex adapter;
- a web app, database-first research platform, or citation manager replacement;
- a hand-maintained copy of generated ARSU artifacts when converter rules should
  own the output.

Files remain the interface. Tool adapters may render and write files, but should
not call agent APIs or depend on a specific model.

## Canonical User Usage Model

`docs/arsu_user_usage_model.md` is the canonical source for how users enter,
confirm, run, resume, verify, and finish ARSU work. Product, architecture, CLI,
schema, Skill, converter, and workflow changes must preserve that model or update
it through an explicit OpenSpec change before implementation.

The locked direction is:

- `researchspec init` prepares the workspace and installs Skills; it does not
  start academic work.
- User-Agent dialogue starts work. Vague, cross-Skill, resume, explanation, and
  export requests route through `researchspec-navigate`; an explicit ARSU Skill
  or mode may route directly after the same prerequisite and route-summary check.
- Starting a subflow requires a user-confirmed summary of Skill, mode,
  prerequisites, artifacts, formal Gates, and cost.
- ResearchSpec CLI is the only workflow-state authority. ARSU Skills produce
  semantic artifacts, and `academic-pipeline` dispatches only from the CLI
  frontier.
- Workflow profiles own work graphs, parallel/join policy, Gates, transitions,
  and dynamic revision-round templates. Do not hard-code the ARSU pipeline graph
  in core.
- Candidate artifacts may be submitted automatically with hash binding. Every
  formal Gate requires human confirmation; a failed-Gate override requires an
  explicit Decision.
- Only scope, claim, structure, branch, and override choices belong in the
  Decision ledger. Ordinary exploration belongs in the relevant artifact.

The fixed user-visible agent surface is exactly four ARSU Skills
(`deep-research`, `academic-paper`, `academic-paper-reviewer`,
`academic-pipeline`) and four Companion Skills (`researchspec-navigate`,
`researchspec-propose`, `researchspec-decide`, `researchspec-verify`). Optional
ResearchSpec-maintained domain plugin Skills may extend that base surface from
`skills/plugins/registry.json`; they do not add Companion Skills or wrappers.

The target public CLI has sixteen top-level commands: `init`, `update`, `status`,
`instructions`, `start`, `submit`, `advance`, `check`, `list`, `show`, `handoff`,
`pack`, `propose`, `decide`, `archive`, and `plugin`. The runtime protocol is
`status -> instructions <selector> -> start/submit/advance -> status`.
Command wrappers are adapters, not separate product capabilities. Do not add a
new public command or Companion merely to expose a low-level transaction.

Domain plugins are stable user installation units assembled from project-maintained vendor Skills,
not third-party runtimes. Vendor and domain are separate many-to-many layers: vendor converters own upstream version, provenance, adaptation, and hard Skill dependencies; domains own fixed reviewed Skill lists. They may assist semantic work but must not own or
directly modify workflow state, routes, work items, artifact registry, Gates,
Decisions, transitions, or receipts. ResearchSpec distributes static reviewed
content and never executes plugin scripts or installs their dependencies.

Discipline domains use ANZSRC 2020 Fields of Research Group as their only
classification standard; Field is audit metadata and never automatic membership.
ResearchSpec also owns exactly five coarse tool domains documented in
`docs/domain_taxonomy.md`. The internal catalog pre-creates all 213 discipline
domains and five tool domains, but empty domains remain hidden from ordinary user
discovery and installation. A selected domain that becomes empty is unavailable
recovery state until it is safely uninstalled or repopulated.

`vendor/tooluniverse` is the maintainer-only pinned input for the ToolUniverse
vendor converter. Production admission is controlled by the v1.3.1 audit and
converter policies: 130 reviewed research Skills are generated into an isolated
vendor bundle and assigned by the source-neutral catalog to 28 ANZSRC Group
domains and two non-empty tool domains, while 20 maintenance/setup surfaces remain excluded. Neither the source
checkout nor generated admission authorizes dependency installation, script
execution, credential setup, MCP configuration, or workflow writes.

`vendor/scientific-agent-skills` is the maintainer-only pinned input for the
Scientific Agent Skills v2.53.0 converter. Its immutable audit covers all 147
upstream Skills. The complete production policies admit 49 reviewed,
vendor-prefixed Skills and exclude 98 for authority, redistribution, ARSU or
ToolUniverse overlap, manual security, domain fit, or content-review reasons.
The generated bundle contributes to 19 ANZSRC Group domains and all five tool
domains. The 40-item manual security catalog is a production SSOT: 39 Skills
are clear only with their approved adaptations and `dhdna-profiler` remains a
confirmed failure. Do not execute bundled scripts, install dependencies,
handle Skill credentials, infer approval from upstream security labels, or
bypass the checked-in admission, manual-review, dependency, resource, and
source-neutral domain decisions. External model or service use must remain
provider-neutral, use the target Agent's user-approved configuration, and
never expose or persist secrets through ResearchSpec.

`vendor/materials-science-skills-for-llm` is the maintainer-only pinned input
for the `snapshot-fafd3ab` audit and converter of all 12 upstream Skills. The
complete production policies admit seven curated, vendor-prefixed Skills and
exclude five for maintenance scope, private tooling, overlap, or privileged
platform authority. The 24-item file catalog, seven-item relationship catalog,
external-resource decisions, and source-bound replacement assets are production
SSOTs. Generated Skills contribute to `materials-engineering`,
`macromolecular-and-materials-chemistry`, and
`computational-modeling-and-simulation`; GPU, remote-service, and HPC use alone
does not create infrastructure-domain membership. Do not execute upstream
commands, install dependencies, configure credentials, retrieve resources,
access external services, compile software, or run scheduler/HPC work. Do not
bypass the checked-in admission, relationship, file, resource, curation,
license, or source-neutral domain decisions.

`vendor/finrobot` is the maintainer-only pinned input for the
`snapshot-297a8d2` audit and converter. FinRobot has no upstream `SKILL.md`; its
immutable audit covers all 146 tracked Git entries, 66 source-bound knowledge
surfaces, five origins, six license claims, and six candidates. Production
policies admit six neutral `financial-research-*` Skills from twelve candidate
files. The 32 admitted surfaces map exactly once to complete ResearchSpec-authored
Agent procedures or deterministic Python 3.11 standard-library entrypoints; no
upstream FinRobot runtime file or provider helper is distributed.
FinNLP, AutoGen-attributed content, unclear filing/marker trees, and hard
FinRobot aggregate dependencies remain excluded. All generated Skills carry
Apache-2.0 licensing, immutable derivation metadata, empty hard Skill
dependencies, and advisory-only relationships. They contribute to
`banking-finance-and-investment`; statement analysis and company fundamentals
also contribute to `accounting-auditing-and-accountability`.

FinRobot safety is form safety, not business-capability removal. ResearchSpec
conversion, checking, packaging, installation, discovery, and update never
import or execute generated resources, install dependencies, initialize clients,
read credentials, or contact services. When explicitly invoked by the target
Agent, the Skills may use user-authorized browser, filing, market-data, local
corpus, and execution tools
and may produce calculations, forecasts, probabilities, sentiment, valuation,
targets, ratings, recommendations, and conclusions. Never embed actual secrets,
private endpoints, private datasets, local user paths, or unknown-origin content
in published files, and do not bypass the checked-in admission, source, surface,
origin, license, resource, relationship, derivation, and review decisions.

FinRobot converter version 2 binds the approved aggregate tree hash
`eecf6fc9e7669f46ef9c58d4fd5938cabedb6d8d7aceac59e15688e178f3765e`.
Company fundamentals, event evidence, relative valuation, and statement analysis
are Tier 3 script-assisted Skills with a copied `lib/financial_support.py`;
competitive position and corporate risk are Tier 1 Agent procedures. The
current trees contain no references because no supporting material meets the
progressive-disclosure threshold. Do not reintroduce AgentSpec, dependency
manifests, provider contracts/adapters, generic runners, product metadata, or
unconsumed auxiliary resources.

`vendor/histagent` is the maintainer-only pinned input for the
`snapshot-47bbe21` audit and converter of all 120 tracked files. The approved
production bundle contains three self-contained executable Skills:
`histagent-historical-research`,
`histagent-historical-source-identification`, and
`histagent-historical-source-analysis`. All have empty hard Skill dependencies
and advisory-only relationships. Historical studies receives all three;
heritage, archive and museum studies receives source identification and source
analysis; no tool domain receives a HistAgent Skill. The converter binds the
archived audit, complete 21-surface capability map, five attributed-source
records, and approved aggregate tree hash
`c44f136b6945868ddde7871b5f5ecd7bfb8ac09f84f080f46fbd37f9e173dbd3`.

HistAgent must not publish thin provider wrappers. Every generated Skill is a
complete eight-file authored tree whose `SKILL.md` contains the ordinary runtime
path and all hard constraints. Each claimed capability maps to a concrete
bundled script, bundled resource, or user-configured external tool. Source
identification and source analysis are script-assisted; historical research
uses Skill-local JSON state and gates without becoming ResearchSpec workflow
authority. Production bytes must remain identical to the approved trees.

HistAgent capability preservation does not authorize implementation copying.
Do not copy or expose `scripts/cookies.py`, telemetry defaults, tracked bytecode,
unresolved `browser_use` content, unverified figures, or fixed provider
credentials. The AutoGen/Magentic-One attribution scope includes
`scripts/agent_web_browser.py`, `scripts/image_web_browser.py`,
`scripts/mdconvert.py`, `scripts/reformulator.py`, and
`scripts/text_web_browser.py`. Implementation reuse requires exact per-file
MIT-source verification and notice preservation; unresolved content requires
implementation-equivalent replacement. HistBench, GAIA,
and HLE datasets, runners, scoring, combination, and judgment remain audit-only.
Historical-source outputs must distinguish raw observation or OCR,
normalized transcription, emendation, translation, and interpretation, with no
unmarked completion. Explicit Skill invocation permits configured providers and
task materials only under target-Agent and host policy. Conversion, checking,
idempotence, packaging, installation, discovery, update, and registry assembly
never import or execute HistAgent code, install dependencies, read credentials,
start browsers, contact services, or upload material.

Five-vendor maintenance must keep converters isolated: each converter stages
against all published vendors but emits and commits only its own bundle, while a
source-neutral domain catalog and central assembler own the published registry.
Vendor root licensing does not replace an evidenced Skill-level content license.

Non-native upstream projects such as HistAgent, FinRobot, and
Materials-Science-Skills-For-LLM follow
`docs/non_native_vendor_skill_standard.md`. Its templates are authoring
scaffolds, not converter prose fragments or a runtime protocol. `references/`
is optional and contains only substantial context-saving detail; the only copy
of an execution-critical workflow, constraint, authority boundary, output rule,
or failure rule belongs in `SKILL.md`. ResearchSpec does not currently consume a
generic `runner.json`, `RUNTIME.json`, input/output schema, or fixed stdout
envelope. Do not add those files merely to normalize a Skill. Scripts and domain
schemas are allowed only when the Skill actually uses and documents them.

## ARSU Relationship

ARSU is a skill package and converter project. ResearchSpec is the framework
layer that should eventually own it.

When working on this repository, treat ARSU as the main capability payload:

- `deep-research`
- `academic-paper`
- `academic-paper-reviewer`
- `academic-pipeline`
- optional future ARSU skill groups, if deliberately adopted

The important integration point is the contract design. ResearchSpec contracts
use their own current contracts rather than raw ARS/ARSU contracts, and ARSU
skills must be adapted to consume the ResearchSpec contracts once this project
absorbs them.

Do not bolt ARSU onto the old generic contract model as an afterthought. The
contract model is the core coupling between ResearchSpec and ARSU.

## Current-State Policy

Do not enforce current-state-only cleanup on ARSU-derived content by default.

The upstream ARS project intentionally contains a large amount of version,
history, changelog, migration, and issue-related text. ARSU deliberately accepts
that upstream design because automatically converting thousands of such markers
into a perfectly current-only runtime is brittle and high cost.

Rules:

- Respect upstream ARS/ARSU runtime content unless a task explicitly asks for a
  specific rewrite.
- Do not fail conversion or validation merely because ARSU-derived files contain
  version markers, changelog sections, historical notes, issue references, or
  upstream schema-version language.
- It is acceptable to record those markers as diagnostics or risk findings.
- Do not spend effort on broad semantic cleanup of upstream history text unless
  the user explicitly scopes that work.
- ResearchSpec-authored framework contracts and instructions should still avoid
  stale history and describe the current intended behavior.

## Contract Architecture Direction

The contract layer should be designed carefully before broad ARSU rewrites.
Prefer a typed file-contract model: human-readable Markdown where useful,
machine-checkable YAML/JSON/JSONL where downstream skills or gates depend on
stable fields.

Recommended conceptual layout:

```text
researchspec/
  config.yaml

  specs/
    project.md
    sources.yaml
    claims.yaml
    manuscript.yaml
    workflow.yaml

  runs/
    current/
      state.yaml
      artifact-registry.json
      decision-ledger.jsonl
      gate-ledger.jsonl
      handoff.md

  changes/
    <change-id>/
      proposal.md
      contract-patch.yaml
      tasks.md

  draft-patches/
    <patch-id>.json
```

This layout is directional, not yet a frozen implementation contract. If code or
specs establish a newer layout, follow the code/specs and update this file.

## Contract Design Principles

### 1. Separate Contracts From Artifacts

Contracts describe research intent, constraints, state, and accepted decisions.
Artifacts are drafts, reports, reviews, integrity checks, synthesis outputs,
figures, tables, and generated files.

Do not make a draft or review report the source of truth for research intent.
Register artifacts by path, hash, type, producer, stage, and verification state.

### 2. Make Claims First-Class

Claims must have stable IDs, support, strength, limits, and wording constraints.
Writing and review skills should refer to claim IDs instead of inferring allowed
claims from prose.

High-impact changes to claim scope, strength, contribution, or causal language
require a proposed contract change and human decision.

### 3. Make Human Decisions First-Class

Human decisions are part of the runtime record, not chat residue.

Changing research questions, target output, contribution scope, manuscript
structure, review-response strategy, or accepted limitations must be represented
in a decision ledger or proposed change.

### 4. Keep Workflow State Separate From Research Specs

The ARSU pipeline stage graph belongs to the ARSU skill pack. ResearchSpec core
should provide generic run-state and gate-ledger contracts, not hard-code one
paper pipeline into every project.

### 5. Gate Progress, Do Not Invent Semantics

Gate logic should check state, blockers, required artifacts, schema validity,
hashes, and pending decisions. It should not replace LLM or human academic
judgment.

LLMs produce semantic payloads and writing. Scripts validate, register, hash,
render, and gate deterministic state.

### 6. Prefer Proposed Changes For High-Impact Updates

Follow the OpenSpec pattern: current specs are the truth; proposed changes live
separately until accepted.

Do not silently edit core specs for high-impact changes. Create a reviewable
proposal or contract patch.

## ARSU Mapping Guidance

Use this as the default mapping when designing the integration:

- ARSU RQ Brief -> `specs/project.md` and artifact registry
- ARSU Bibliography / literature corpus -> `specs/sources.yaml`
- ARSU Synthesis Report -> artifact registry; proposed claim/spec changes when
  it changes research meaning
- ARSU Paper Draft -> artifact registry plus `specs/manuscript.yaml`
- ARSU Integrity Report -> gate ledger and artifact registry
- ARSU Review Report / Revision Roadmap -> artifact registry plus proposed
  changes or draft patches
- ARSU Response to Reviewers -> artifact registry plus decision/gate ledger
- ARSU Material Passport -> split into artifact registry, state, decision
  ledger, and gate ledger rather than copying one monolithic object by default
- ARSU Revision Patch -> `draft-patches/<patch-id>.json`, preserving the
  useful block/hash discipline

## Skill And Converter Rules

When absorbing or maintaining ARSU:

1. Prefer converter-owned outputs over hand-edited generated files.
2. Keep independent skill-group boundaries clear.
3. Do not reintroduce Claude Code, Codex, or other platform runtime assumptions
   into universal ResearchSpec contracts.
4. Preserve upstream ARS content unless a deliberate ResearchSpec normalization
   rule is being implemented.
5. If a deterministic script can validate or render a contract, do not ask the
   LLM to hand-build the authoritative machine artifact.
6. If a semantic decision is required, do not hide it in a script or converter
   rule.

## Engineering Rules

Keep the implementation pragmatic and repo-local.

Prefer:

- TypeScript for the ResearchSpec CLI/framework;
- converter-generated skill artifacts;
- Markdown for human-facing guidance;
- YAML/JSON/JSONL for machine-facing contracts and ledgers;
- explicit schemas and small validators where downstream skills depend on
  stable structure;
- minimal dependencies.

Avoid unless clearly justified:

- runtime LLM dependencies;
- hidden global state;
- platform-specific skill behavior in core contracts;
- broad semantic cleanup of ARSU upstream content;
- large infrastructure before the contract model is stable.

## File Writing Rules

Do not overwrite user content by default.

For generated skill files:

- safe to create if missing;
- skip or report drift if modified unless `--force` or an explicit regeneration
  workflow is used;
- include generated markers where appropriate.

For research contract files:

- create during init or migration;
- do not overwrite during update;
- only overwrite with explicit `--force` or accepted contract patches.

## Agent Behavior When Editing This Repository

When implementing features:

1. First determine whether the change affects ResearchSpec core contracts,
   ARSU conversion, ARSU-derived skill content, or tool adapters.
2. If the change affects contracts, design DTO/schema/interface boundaries
   before implementation.
3. Preserve ARSU upstream content unless the task explicitly asks for
   ResearchSpec normalization.
4. Keep human review in the loop for high-impact research changes.
5. Keep adapters simple and file-based.
6. Add tests around generated file trees, schema validation, drift detection,
   contract patch behavior, and ARSU mapping rules when those surfaces change.
7. Do not introduce runtime LLM dependencies.

## Definition of Done

A change is acceptable when:

- it supports the new ARSU-serving ResearchSpec direction;
- it keeps contract and artifact boundaries clear;
- it preserves agent-neutral behavior;
- it avoids unrequested current-only cleanup of ARSU-derived content;
- it works through files and explicit schemas rather than hidden state;
- it keeps human decisions explicit for high-impact research changes;
- it improves the ability to absorb, maintain, or run ARSU-derived skills through
  ResearchSpec contracts.
