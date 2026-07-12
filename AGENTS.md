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

The target user-visible agent surface is exactly four ARSU Skills
(`deep-research`, `academic-paper`, `academic-paper-reviewer`,
`academic-pipeline`) and four Companion Skills (`researchspec-navigate`,
`researchspec-propose`, `researchspec-decide`, `researchspec-verify`).

The target public CLI has fifteen top-level commands: `init`, `update`, `status`,
`instructions`, `start`, `submit`, `advance`, `check`, `list`, `show`, `handoff`,
`pack`, `propose`, `decide`, and `archive`. The runtime protocol is
`status -> instructions <selector> -> start/submit/advance -> status`.
Command wrappers are adapters, not separate product capabilities. Do not add a
new public command or Companion merely to expose a low-level transaction.

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
