---
name: academic-paper
description: "Academic manuscript planning, drafting, revision, citation work, disclosure, and format conversion. Routes: academic-paper:full, academic-paper:outline-only, academic-paper:revision, academic-paper:abstract-only, academic-paper:lit-review, academic-paper:format-convert, academic-paper:citation-check, academic-paper:plan, academic-paper:revision-coach, academic-paper:disclosure, academic-paper:rebuttal-audit. Use for: plan or draft an academic paper; revise a manuscript; prepare citation or submission outputs; respond to reviewer feedback. Near-miss routing: start from a topic and continue through review and finalization -> academic-pipeline:end-to-end; coordinate a real post-submission revision response -> review-response:full; conduct a PRISMA systematic review -> deep-research:systematic-review; independently peer-review a manuscript -> academic-paper-reviewer:full. Before each start, present stable-spec and handoff prerequisites, boundary outputs, formal Gates, risk, cost, and obtain an instance-scoped confirmation."
metadata:
  version: "3.2.0"
  last_updated: "2026-07-11"
  status: active
  data_access_level: redacted
  task_type: open-ended
  related_skills:
    - deep-research
    - academic-paper-reviewer
    - academic-pipeline
---

<!-- researchspec-contract-preflight:v10 -->
<!-- researchspec-literature-adapter:zotero-library:v2 -->
## ResearchSpec Contract Preflight

Locate the project researchspec/ workspace and run "researchspec status --json".
For a new route, request "researchspec instructions route:<skill>:<mode> --json" and
present its Skill, mode, stable-spec and handoff-role prerequisites, boundary
outputs, formal Gates, risk, cost, and confirmation scope. Start only after the
user confirms that one instance. A pipeline parent confirmation never authorizes
a child, branch, specialist subflow, or later revision round.

Read only the route-relevant parts of specs/project.md, specs/sources.yaml,
specs/claims.yaml, and specs/manuscript.yaml. Pipeline work also reads the
managed profiles/academic-pipeline.yaml. After start, treat the selected
subflow's control.yaml as its sole runtime authority and its handoff.md as
the boundary input/output reference. Do not reconstruct the frontier from Skill
prose; use directed instructions selectors and the current status view.

Treat `specs/manuscript.yaml.delivery` as the source-format contract.
The first manuscript-writing intake resolves `working_format`; a later change
to a confirmed selection requires a project change. QMD is Markdown-compatible
source: require a `.qmd` boundary path and preserve YAML frontmatter, fenced
code, executable-cell options, citations, cross-references, and other Quarto
metadata as opaque manuscript content during review, annotation, and revision.
Record source and target format IDs on handoff entries; a rendered target also
records `renderer: quarto`.

For QMD writing or resume, run the bounded read-only `quarto --version`
probe at the timing returned by route instructions and preserve its available,
unavailable, or unknown result in the start confirmation. QMD writing may start
when Quarto is unavailable, but `academic-paper:format-convert` requires an
available probe and must use `node scripts/render-quarto.mjs` for the single
confirmed target. The helper defaults to no-execute; code execution requires a
separate current-subflow consent. Never install Quarto, contact the network,
fall back to Pandoc, overwrite an existing target, or report a successful
handoff after a partial or failed render.

<!-- researchspec-paper-humanizer-reference:v1 -->
When this route creates or edits manuscript prose (including outline, abstract,
literature-review, revision, or full drafting), silently load the packaged
paper-humanizer/references/prose-guidance.md reference first. This reference
mode is advisory only: it does not start a humanizer route, run statistics,
produce an audit, or request an additional confirmation. Do not load it for
read-only review, citation audit, rebuttal audit, or format conversion.
Produce semantic files at explicit project-relative paths outside
researchspec/, then update the owning handoff with unique roles, types,
purposes, paths, producers or intended consumers, and relevant limits. Do not
register, copy, hash-bind, or assign framework IDs to boundary files.
Only the ResearchSpec CLI may mutate lifecycle state, checkpoints, formal Gates,
Decisions, overrides, and transitions in control.yaml.

For a formal Gate, use researchspec-verify to prepare evidence-linked findings,
show the proposed verdict and consequences, and obtain explicit human
confirmation. Record the verdict with "researchspec decide gate:<instance>/<gate>";
use a separate "researchspec advance subflow:<instance>" only after the owning
control, profile, directly required child controls, and handoff prerequisites
permit the transition. A failed-Gate override requires its own human-approved
Decision and reason in the owning Gate.

Optional domain Skills are bounded advisory helpers. Suggest at most three
domains, keep plugin consent separate from route confirmation, preview the exact
domain IDs and resolved Skills, and install only after explicit consent. Invoke a
projected Skill natively when loaded; otherwise use plugin instructions only
after selection, availability, projection, and manifest-hash checks. Decline or
failure leaves the core route and workflow frontier unchanged.

For literature work, the active ARSU producer may use an installed
Zotero task Skill as a bounded provider after a just-in-time readiness check.
Adapter results remain working evidence and cannot directly modify stable specs,
subflow controls, Gates, Decisions, transitions, or handoffs. Private or
library-bound work pauses when readiness fails. Acquisition is candidate-only
without a current bounded authorization, and Curation requires a separate request.

The packaged academic-pipeline/scripts/adapters/zotero.py path is separate: it
reads only a user-supplied Better BibTeX JSON export, requires a user-provided
Python 3.11+ environment with PyYAML, and is not a live Zotero fact source.

This generated block uses profile researchspec-preflight-v10 for
academic-paper and the current file-based protocol:
status -> instructions <selector> -> start/decide/advance -> status.

# Academic Paper — Academic Paper Writing Agent Team

A general-purpose academic paper writing tool — 12-agent pipeline covering all disciplines, with higher education domain as the default reference.

**v2.5** adds two writing quality features:
- **Style Calibration** (intake Step 10, optional) — Provide 3+ past papers and the pipeline learns your writing voice (sentence rhythm, vocabulary preferences, citation integration style). Applied as a soft guide during drafting; discipline conventions always take priority. See `references/shared/style_calibration_protocol.md`.
- **Writing Quality Check** (`references/writing_quality_check.md`) — A writing quality checklist applied during the draft self-review step. Catches overused AI-typical terms, em dash overuse, throat-clearing openers, uniform paragraph lengths, and monotonous sentence rhythm. These are good writing rules, not detection evasion.

> **Routing discipline (v3.9.2):** see `.claude/CLAUDE.md` "Routing Discipline (v3.9.2)" + `references/shared/references/intent_clarification_protocol.md` for cross-skill routing rules. This skill assumes routing has already settled — ambiguous cross-phase materials should have been clarified upstream.

## Quick Start

**Minimal command:**
```
Write a paper on the impact of AI on higher education quality assurance
```

```
Write a paper on the impact of declining birth rates on private university management strategies
```

**Execution flow:**
1. Configuration interview — paper type, discipline, citation format, output format
2. Literature search — systematic search strategy, source screening
3. Architecture design — paper structure, outline, word count allocation
4. Argumentation construction — claim-evidence chains, logical flow
5. Full-text drafting — section-by-section draft, register adjustment
6. Citation compliance + bilingual abstract (parallel)
7. Peer review — five-dimension scoring, revision suggestions
8. Output formatting — LaTeX/DOCX (via Pandoc)/PDF/Markdown

---

## Trigger Conditions

### Trigger Keywords

**English**: write paper, academic paper, paper outline, write abstract, revise paper, literature review paper, check citations, convert to LaTeX, convert format, format paper, conference paper, journal article, thesis chapter, research paper, guide my paper, help me plan my paper, step by step paper, draft manuscript, write methodology, write discussion, parse reviews, revision roadmap, help me with my revision, I got reviewer comments, convert citations

**繁體中文**: 寫論文, 學術論文, 論文大綱, 寫摘要, 修改論文, 文獻回顧論文, 檢查引用, 轉 LaTeX, 轉換格式, 研討會論文, 期刊文章, 學位論文, 研究論文, 引導我寫論文, 幫我規劃論文, 逐步寫論文, 寫方法論, 寫討論, 審查意見, 修訂路線圖, 幫我修改, 我收到審查意見, 轉換引用格式

**한국어**: 논문 작성, 논문 초안, 논문 개요, 초록 작성, 논문 수정, 인용 확인, 인용 형식 검사, LaTeX 변환, 서식 변환, 학위논문 작성, 학술지 논문 작성, 학회 논문 작성, 논문 계획을 도와줘, 단계별로 논문 쓰기, 심사 의견을 받았어, 심사 의견 반영, 답변서 점검, AI 사용 고지

### Plan Mode Activation

Activate `plan` mode when the user wants guidance, step-by-step planning, or expresses uncertainty about paper structure. **Default rule**: when ambiguous between `plan` and `full`, prefer `plan`.

> See `references/plan_mode_protocol.md` for full intent signals and activation rules.

### Does NOT Trigger

| Scenario | Use Instead |
|----------|-------------|
| Deep research / fact-checking (not paper writing) | `deep-research` |
| Reviewing a paper (structured review) | `academic-paper-reviewer` |
| Full research-to-paper pipeline | `academic-pipeline` |

### Distinction from `deep-research`

| Feature | `academic-paper` | `deep-research` |
|---------|-------------------|-----------------|
| Primary output | Publishable paper draft | Research report |
| Structure | Journal-ready (IMRaD, etc.) | APA 7.0 report |
| Citation | Multi-format (APA/Chicago/MLA/IEEE/Vancouver) | APA 7.0 only |
| Abstract | Bilingual (zh-TW + EN) | Single language |
| Peer review | Simulated 5-dimension review | Editorial review |
| Output format | LaTeX/DOCX (via Pandoc)/PDF/Markdown | Markdown only |
| Revision loop | Max 2 rounds with targeted feedback | Max 2 rounds |

---

## Agent Team (12 Agents)

| # | Agent | Role | Phase |
|---|-------|------|-------|
| 1 | `intake_agent` | Configuration interview: paper type, discipline, journal, citation format, output format, language, word count; Handoff detection; Plan mode simplified interview | Phase 0 |
| 2 | `literature_strategist_agent` | Search strategy design, source screening, annotated bibliography, literature matrix | Phase 1 |
| 3 | `structure_architect_agent` | Paper structure selection, detailed outline, word count allocation, evidence mapping | Phase 2 |
| 4 | `argument_builder_agent` | Argument construction, claim-evidence chains, logical flow, counter-argument handling; Plan mode argument stress test | Phase 3 / Plan Step 3 |
| 5 | `draft_writer_agent` | Section-by-section full draft writing, discipline register adjustment, word count tracking | Phase 4 |
| 6 | `citation_compliance_agent` | Citation format verification, reference list completeness, DOI checking | Phase 5a |
| 7 | `abstract_bilingual_agent` | Bilingual abstract (zh-TW + EN), 5-7 keywords each | Phase 5b |
| 8 | `peer_reviewer_agent` | Simulated double-blind review, five-dimension scoring, revision suggestions (max 2 rounds) | Phase 6 |
| 9 | `formatter_agent` | Convert to LaTeX/DOCX (via Pandoc)/PDF/Markdown, journal formatting, cover letter, citation format conversion (APA 7 / Chicago / MLA / IEEE / Vancouver) | Phase 7 |
| 10 | `socratic_mentor_agent` | Plan mode Socratic mentor: chapter-by-chapter guidance, convergence criteria (4 signals), question taxonomy (4 types), INSIGHT extraction | Plan Step 0-3 |
| 11 | `visualization_agent` | Parse paper data and generate publication-quality figure code (Python matplotlib / R ggplot2) with APA 7.0 formatting, colorblind-safe palettes, and LaTeX integration | Phase 4 / Phase 7 |
| 12 | `revision_coach_agent` | Parse unstructured reviewer comments into structured Revision Roadmap; classify, map, and prioritize comments; works standalone without prior pipeline execution | Revision-Coach mode |

---

## Output Formats

### Text Formats
LaTeX (.tex + .bib), DOCX (via Pandoc), PDF (via LaTeX or Pandoc), Markdown.

### Figures
When the paper contains quantitative results, the `visualization_agent` can generate publication-ready figures in Python (matplotlib/seaborn) or R (ggplot2) with APA 7.0 formatting and colorblind-safe palettes. Figures are delivered as runnable code + LaTeX `\includegraphics` integration code. See `references/statistical_visualization_standards.md` for chart type decision trees and code templates.

### Citation Formats
APA 7.0 (default), Chicago (Author-Date or Notes-Bibliography), MLA 9, IEEE, Vancouver. The `formatter_agent` supports late-stage citation format conversion between any two supported formats via "Convert citations to [format]".

---

## Orchestration Workflow (8 Phases)

```
Phase 0: CONFIG        -> [intake_agent]              -> Paper Configuration Record
Phase 1: RESEARCH      -> [literature_strategist]      -> Search Strategy + Source Corpus
Phase 2: ARCHITECTURE  -> [structure_architect]        -> Paper Outline + Evidence Map
Phase 3: ARGUMENTATION -> [argument_builder]           -> Argument Blueprint
Phase 4: DRAFTING      -> [draft_writer]               -> Complete Draft
Phase 5a: CITATIONS    -> [citation_compliance] ──┐    -> Citation Audit Report
Phase 5b: ABSTRACT     -> [abstract_bilingual]   ─┘    -> Bilingual Abstract + Keywords  (parallel)
Phase 6: PEER REVIEW   -> [peer_reviewer]              -> Review Report (max 2 revision loops)
Phase 7: FORMAT        -> [formatter]                  -> Final Output Package
```

> See `references/workflow_phase_details.md` for detailed per-phase agent behavior and output descriptions.

### Checkpoint Rules

1. ⚠️ **IRON RULE**: User must confirm Paper Configuration Record before proceeding to Phase 1
2. **Phase 2 -> 3**: User must approve outline (can request restructuring)
3. ⚠️ **IRON RULE**: Max 2 revision loops; unresolved items -> "Acknowledged Limitations"
4. **Peer Review** Critical-severity issues block progression to Phase 7
5. User can skip Phase 1 (literature) if providing own sources

---

> **v3.4.0 compliance (applies to `full` mode):** Before finalization, `compliance_agent` runs RAISE principles-only check (warn-only; primary research is outside PRISMA-trAIce scope). Warnings are listed in the disclosure statement but never block the pipeline. See `references/shared/raise_framework.md §Scope disclaimer`.

## Phase-by-phase Invocation Contract (v3.9.2)

academic-paper pipeline runs in 8 phases (Phase 0 intake → 7 formatting). Two invocation modes:

<!--rs:STATE-001-->
### ResearchSpec Current Owner

Replacement scope: `STATE-001` for `academic-paper`.

Resume only from the selected subflow's control and handoff. Read the project
profile when pipeline graph rules apply, use status and directed instructions to
derive the current frontier, and let the CLI perform every lifecycle, Gate,
Decision, override, or transition change. External files may provide explicit
inputs but never replace current control authority.

Current ResearchSpec owners:

- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:STATE-001-->

<!--rs:IO-005-->
### ResearchSpec Current Owner

Replacement scope: `IO-005` for `academic-paper`.

In phase-by-phase mode, the literature strategist, structure architect, draft
writer, citation compliance, bilingual abstract, peer review, and formatting
roles may write only the outputs declared by the selected route instructions. They may
read handoff-referenced upstream artifacts required by that work. The argument-building
and visualization roles may span their documented stages only when the current
frontier instructions explicitly select that work; one invocation does not
authorize work in another stage. The generator-evaluator contract continues to
constrain the draft-writer and peer-review call pairs within their selected
work.

Phase-by-phase routing requires an explicit user signal. Ambiguous cross-stage
material must be clarified before dispatch. The configured graph in
`researchspec/profiles/academic-pipeline.yaml`, the frontier in
`researchspec/subflows/<instance>/control.yaml`, and handoff-referenced inputs in
`researchspec/subflows/<instance>/handoff.md` define the permitted read and
write boundary.

Current ResearchSpec owners:

- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/subflows/<instance>/control.yaml`
- `researchspec/subflows/<instance>/handoff.md`
<!--/rs:IO-005-->

## v3.6.6 Generator-Evaluator Contract Protocol

<!--rs:REVIEW-010-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-010` for `academic-paper`.

> This block defines the `academic-paper full` generator/evaluator split. Resolve
> the frozen `writer_full` and `evaluator_full` contract JSON plus every Phase
> 4a/4b and 6a/6b artifact through
> `researchspec/subflows/<instance>/handoff.md`. Preserve the four-call
> paper-blind/paper-visible separation, mode exclusions, baseline fields, system
> prompt text, lint rules, and writer/evaluator role distinction described
> below. Record each accepted phase output before it is consumed downstream;
> return lint, disagreement, or failure-condition results to the responsible gate
> helper for `researchspec/subflows/<instance>/control.yaml`. The orchestrator may
> instantiate allowed invocation fields but must not mutate the frozen contract
> or write the owning handoff or control directly.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-010-->
>
> **Applies to `academic-paper full` mode only.** Nine non-full modes (`plan`, `outline-only`, `revision`, `revision-coach`, `abstract-only`, `lit-review`, `format-convert`, `citation-check`, `disclosure`) are byte-equivalent across v3.6.5 → v3.6.6 and do not invoke this protocol. (The later-added `rebuttal-audit` mode is likewise non-full and does not invoke this protocol.) Pipeline boundary unchanged: `academic-pipeline` Stage 2 dispatches `academic-paper` in plan or full mode (full only invokes this protocol); Stage 3 dispatches the separate `academic-paper-reviewer` skill (5-panel external editorial review). The in-pair Phase 6 evaluator under this protocol and the Stage 3 reviewer are different review layers — see design doc §5.1 audit conclusion 2.

### Overview

v3.6.6 splits Phase 4 (writer drafting) and Phase 6 (in-pair evaluator review) into paper-blind / paper-visible call pairs gated by the `writer_full` and `evaluator_full` contracts. The split mirrors `references/cross-skill/academic-paper-reviewer/references/sprint_contract_protocol.md` (the v3.6.2 reviewer pattern) but adapts it for single-agent generator modes that have no panel and (for the writer) no scoring_plan.

The load-bearing mechanism is the **physical separation of calls**: writer Phase 4a never sees the runtime drafting artefacts; evaluator Phase 6a never sees the writer Phase 4b draft. This destroys the "read the paper, then rationalise the standard" drift path on the in-pair self-quality gate.

### Four-call structure

For each `academic-paper full` invocation, Phase 4 + Phase 6 expand from two single calls into four separate model calls. Each call has its own system prompt and user content per the system-vs-user content discipline below.

1. **Phase 4a — writer paper-blind pre-commitment.**
   - System prompt: `### Phase 4a — Writer paper-blind pre-commitment` sub-section in `agents/draft_writer_agent.md` § "v3.6.6 Generator-Evaluator Contract Protocol".
   - User content: `writer_full` contract JSON + paper metadata only (`title`, `field`, `word_count`).
   - Output: `## Acceptance Criteria Paraphrase` section + terminal `[PRE-COMMITMENT-ACKNOWLEDGED]` tag.
   - Lint: 3 structural checks (see § "Phase 4a / 6a output lint" below).
2. **Phase 4b — writer paper-visible drafting + self-scoring.**
   - System prompt: `### Phase 4b — Writer paper-visible drafting + self-scoring` sub-section in the same agent file.
   - User content: `writer_full` contract JSON (re-injected) + Phase 4a output wrapped in `<phase4a_output>...</phase4a_output>` data delimiter + upstream drafting artefacts (Paper Configuration Record, Paper Outline, Argument Blueprint, Annotated Bibliography incl. its Search Strategy / Schema 2 `search_strategy` (#548 — the bound the writer fills into search-bounded novelty claims), optional Style Profile, optional Knowledge Isolation Directive).
   - Output: `## Draft Body` → `## Dimension Scores` → `## Failure Condition Checks` → `## Writer Decision`.
   - Lint: 4 structural checks (see § "Phase 4b / 6b output lint" below).
3. **Phase 6a — evaluator paper-blind pre-commitment.**
   - System prompt: `### Phase 6a — Evaluator paper-blind pre-commitment` sub-section in `agents/peer_reviewer_agent.md` § "v3.6.6 Generator-Evaluator Contract Protocol".
   - User content: `evaluator_full` contract JSON + paper metadata + the writer's most recent `<phase4a_output>` (the writer artefact the evaluator must verify per `disagreement_handling.pre_commitment_check_protocol.check_writer_artifact`).
   - Output: `## Contract Paraphrase` + `## Scoring Plan` (per-dimension `dimension_id` / `what_to_look_for` / `what_triggers_block` / `what_triggers_warn`) + terminal `[PRE-COMMITMENT-ACKNOWLEDGED]` tag.
   - Lint: 5 structural checks.
4. **Phase 6b — evaluator paper-visible scoring + decision.**
   - System prompt: `### Phase 6b — Evaluator paper-visible scoring + decision` sub-section in the same agent file.
   - User content: `evaluator_full` contract JSON (re-injected) + Phase 6a output wrapped in `<phase6a_output>...</phase6a_output>` + the writer's `<phase4a_output>` (unconditional per `pre_commitment_check_protocol.check_writer_artifact`) + the writer Phase 4b draft (the artefact under review).
   - Output: `## Dimension Scores` → `## Failure Condition Checks` → `## Review Body` → `## Evaluator Decision`.
   - Lint: 5 structural checks.

### System prompt vs user content discipline

Mirrors `sprint_contract_protocol.md` §2 reviewer pattern verbatim:

- **System prompt carries invariant policy text only**: the phase sub-section instructions from the agent file's `## v3.6.6 Generator-Evaluator Contract Protocol` block, the lint description, and the phase-boundary tag conventions.
- **User content carries the contract JSON (re-injected per call) plus the runtime inputs allowed at that phase**: paper metadata, `<phase4a_output>` / `<phase6a_output>` delimiter blocks, upstream drafting artefacts, the paper draft.

All dynamic LLM output (Phase Na runtime emissions, paper content) lives in user content via data delimiters, never in the system prompt. This prevents accidental elevation of dynamic per-paper content into the invariant policy surface.

### Schema field name vs runtime emission distinction

`pre_commitment_artifacts` (snake_case, backticks) is the schema field name in `assets/shared/sprint_contract.schema.json` — a configuration declaration in the frozen contract baseline. The "writer Phase 4a pre-commitment output" is the runtime emission — the actual Markdown text the writer agent emits in Phase 4a. The runtime emission lives inside `<phase4a_output>` and gets handed off to Phase 4b / Phase 6a / Phase 6b. Same pattern for `disagreement_handling` (schema field) vs "evaluator Phase 6a pre-commitment output" (runtime emission). Mixing the two leads to confusion between contract baseline configuration and LLM-generated content.

### Phase 4a / 6a output lint

Mode-specific structural check counts, per `sprint_contract_protocol.md` §4 enumeration convention:

- **Writer Phase 4a (3 checks)**: required sections in order (`## Acceptance Criteria Paraphrase`, terminal `[PRE-COMMITMENT-ACKNOWLEDGED]`); paraphrase paragraph count ≥ `pre_commitment_artifacts.acceptance_criteria_paraphrase.minimum_dimensions`; Phase 4a content references contract JSON + paper metadata only. **No `## Scoring Plan` section** — `writer_full` carries no scoring_plan.
- **Evaluator Phase 6a (5 checks)**: required sections in order (`## Contract Paraphrase`, `## Scoring Plan`, terminal `[PRE-COMMITMENT-ACKNOWLEDGED]`); paraphrase paragraph count ≥ `disagreement_handling.paraphrase_minimum_dimensions`; one `### <Dn>: <name>` subsection per acceptance dimension; each scoring_plan subsection contains `disagreement_handling.scoring_plan.per_dimension_criteria` four-field shape (`dimension_id`, `what_to_look_for`, `what_triggers_block`, `what_triggers_warn`); Phase 6a content references contract JSON + paper metadata + the writer's `<phase4a_output>` only (no full draft / paper content).

Retry semantics: lint failure on the first attempt → retry once with the specific lint gap hinted in the system prompt; second failure → mark this role unusable per § "Single-agent generator unusable handling" below.

### Phase 4b / 6b output lint

- **Writer Phase 4b (4 checks)**: required sections in order — `## Draft Body`, `## Dimension Scores`, `## Failure Condition Checks`, `## Writer Decision`; Dimension Scores one-to-one across the seven writer dimensions D1–D7 (per `assets/shared/contracts/writer/full.json`); Failure Condition Checks one-to-one across F1 / F4 / F2 / F3 / F0; Writer Decision derivable from F-condition severity precedence. **No multi-dissent retry** (writer has no scoring_plan to dissent against). **No consistency check** (writer Phase 4a emits no scoring_plan trigger tokens).
- **Evaluator Phase 6b (5 checks)**: required sections in order — `## Dimension Scores`, `## Failure Condition Checks`, `## Review Body`, `## Evaluator Decision`; Dimension Scores one-to-one across the five evaluator dimensions D1–D5 (per `assets/shared/contracts/evaluator/full.json`); Failure Condition Checks one-to-one across F1 / F2 / F3 / F6 / F4 / F5 / F0; consistency check (Phase 6b score substring-matches Phase 6a `disagreement_handling.scoring_plan.per_dimension_criteria` trigger tokens); Evaluator Decision derivable from F-condition severity precedence. **No multi-dissent retry** (evaluator's intra-phase disagreement is encoded as F-condition action via `disagreement_handling.disagreement_resolution`, not as a retry trigger).

Multi-dissent retry remains reviewer-only (`academic-paper-reviewer` skill); generator modes have no panel and no scoring_plan dissent anchor.

Lint count summary across the three modes:

| Phase | Reviewer (zero-touch) | Writer | Evaluator |
|---|---|---|---|
| Phase 1 / 4a / 6a | 5 | 3 | 5 |
| Phase 2 / 4b / 6b | 6 | 4 | 5 |

### Single-agent generator unusable handling

When a writer or evaluator phase becomes unusable (Phase Na lint twice fail OR Phase Nb lint fail), `academic-paper` emits a phase-level abort tag and routes to user intervention:

- **Writer Phase 4 unusable** → `[GENERATOR-PHASE-ABORTED: role=writer, contract=<id>, reason=<lint_failure_kind>]` → abort `academic-paper` Phase 4 → user intervention decides retry / fallback / regression to Phase 3 (Argument Blueprint).
- **Evaluator Phase 6 unusable** → `[GENERATOR-PHASE-ABORTED: role=evaluator, contract=<id>, reason=<lint_failure_kind>]` → abort `academic-paper` Phase 6 → user intervention decides retry / fallback / regression to Phase 5 (Drafting completion).

`[GENERATOR-PHASE-ABORTED]` does **not** constitute a valid Phase 6b emission and cannot enter Stage 3 reviewer dispatch. Two valid Stage 3 entry paths exist (per design doc §5.1):

- **Standard path**: evaluator Phase 6b emits F0 `evaluator_decision=accept` or F4 `evaluator_decision=accept_with_dissent_note`.
- **Exceptional path**: evaluator Phase 6b emits F5 `evaluator_decision=flag_for_reviewer_stage` after the in-pair revision loop exhausts at round 2 with mandatory-dimension block recurring.

`academic-paper` carries no panel cardinality invariant for writer / evaluator (no `panel_size` field — Schema 13.1 §3.3.5 reviewer-conditional). There is no `[PANEL-SHRUNK]` analogue at the generator side; `[GENERATOR-PHASE-ABORTED]` is phase-level abort.

**Operational monitor**: track `[GENERATOR-PHASE-ABORTED]` rate over the first three months of v3.6.6 deployment. The denominator is **per `academic-paper full` run** — one user-perceived top-level invocation. The 5% threshold is `(runs_with_any_abort) / (total_runs)`. If the rate exceeds 5%, v3.6.7 introduces graceful-degradation fallback (see § "Known limitations" below).

### Cross-session resume scope

The v3.6.6 generator-evaluator round (Phase 4a + Phase 4b + Phase 6a + Phase 6b + in-pair revision loop) is an **in-session atomic unit**. Manual session split mid-round → writer Phase 4a output is lost; new session must restart `academic-paper full` mode from Phase 0.

The v3.6.3 `ARS_PASSPORT_RESET=1` `reset_boundary[]` mechanism (per `references/cross-skill/academic-pipeline/references/passport_as_reset_boundary.md`) operates at `academic-pipeline` Stage boundaries, not at `academic-paper` internal phase boundaries. `academic-paper` internal phases (4a / 4b / 6a / 6b) are **not** boundary points; no `kind: boundary` ledger entry is emitted between them. v3.6.7+ may introduce `pre_commitment_history[]` to persist writer Phase 4a artefacts across sessions if operational data warrants — see § "Known limitations" below.

## Known limitations

- **No graceful-degradation fallback in v3.6.6**: when the writer or evaluator phase aborts via `[GENERATOR-PHASE-ABORTED]`, `academic-paper full` aborts and routes to user intervention. v3.6.7 may introduce a fallback that degrades the affected phase to v3.6.5 single-call behaviour and logs the degradation. v3.6.6 ships with abort-only behaviour. See § "Single-agent generator unusable handling" above for the operational 5% / three-month monitor.
- **No cross-session resume mid-round**: the four-phase generator-evaluator round is an in-session atomic unit. Manual session split mid-round loses the writer Phase 4a artefact and forces restart from Phase 0. v3.6.7+ may introduce a `pre_commitment_history[]` ledger entry in Schema 9 to persist the writer Phase 4a artefact across session boundaries; v3.6.6 does not implement.
- **In-pair Phase 6 evaluator vs `academic-paper-reviewer` external review**: the in-pair `peer_reviewer_agent` (Phase 6 evaluator with the v3.6.6 contract gate) and the standalone `academic-paper-reviewer` skill (Stage 3 5-panel external editorial review) serve different review layers and remain documented as known technical debt per design doc §1 known limitations. Routing / merge decisions are deferred to v3.7.x.

## Operational Modes (11 Modes)

See `references/mode_selection_guide.md` for details.

| Mode | Trigger | Agents | Output |
|------|---------|--------|--------|
| `full` | "Write a paper" | All 9 (+ 11 if quantitative) | Complete paper draft (with figures if applicable) |
| `outline-only` | "Paper outline" | 1->2->3 | Detailed outline + evidence map |
| `revision` | "Revise paper" | 8->5->6 | Patch document + deterministically applied revised draft + apply report (#390; revision log via `templates/revision_tracking_template.md`) |
| `abstract-only` | "Write abstract" | 1->7 | Bilingual abstract + keywords |
| `lit-review` | "Literature review" | 1->2 | Annotated bibliography + synthesis |
| `format-convert` | "Convert to LaTeX" / "Convert citations to [format]" | 9 only | Formatted document; includes citation format conversion (APA 7 / Chicago / MLA / IEEE / Vancouver) |
| `citation-check` | "Check citations" | 6 only | Citation error report |
| `plan` | "guide my paper" / "help me plan my paper" | 1->10->3->4 | Chapter Plan + INSIGHT Collection |
| `revision-coach` | "parse reviews" / "revision roadmap" / "I got reviewer comments" / "should we push back" / "conference rebuttal" / "grant panel response" | 12 only | Revision Roadmap + optional Tracking Template + Response Letter Skeleton (covers pushback/disagreement posture + journal / conference / grant-panel / transfer-after-review scopes) |
| **`disclosure`** (v3.2) | **"AI disclosure for Nature" / "generate AI usage statement"** | **9 only** | **Venue-specific AI-usage disclosure paragraph(s) + placement instructions** |
| **`rebuttal-audit`** | **"audit my response" / "check my rebuttal" / "did I miss any reviewer comment"** (requires BOTH reviewer comments AND an existing rebuttal draft) | **12 only (parse-only)** | **Rebuttal QA report: per-comment coverage + gaps + risk flags. No new response generated; advisory only. Does NOT emit Schema 11 / Material Passport / verified status.** |

### Quick Mode Selection Guide

| Your Situation | Recommended Mode | Spectrum |
|----------------|-----------------|----------|
| Starting from scratch with a clear RQ | `full` | balanced |
| Need help planning before writing | `plan` | originality |
| Just need an outline | `outline-only` | balanced |
| Have a draft, received review feedback | `revision` | fidelity |
| Have unstructured reviewer comments | `revision-coach` | balanced |
| Just need an abstract | `abstract-only` | fidelity |
| Need to check/fix citations | `citation-check` | fidelity |
| Need to convert format (LaTeX, DOCX) or citation style | `format-convert` | fidelity |
| Want a systematic literature review paper | `lit-review` | fidelity |
| Need a venue-specific AI-usage disclosure statement for submission | `disclosure` | fidelity |
| Have a written rebuttal draft to QA against reviewer comments | `rebuttal-audit` | fidelity |

**Spectrum** (v3.2): *fidelity* = template-heavy, predictable output; *balanced* = default; *originality* = exploratory, template-light. See `references/shared/mode_spectrum.md` for the full cross-skill spectrum table.

Not sure? Start with `plan` — it will guide you step by step. `disclosure` is a finishing step — run it after the paper is drafted, targeting the venue you plan to submit to.

### Mode Selection Logic

> See `references/mode_selection_guide.md` for trigger-to-mode mappings and the full selection flowchart.

---

## Rebuttal-Audit Mode

`rebuttal-audit` evaluates an author's **existing** rebuttal / response-to-reviewers draft for coverage, tone, and evidence. It is advisory QA — it does **not** write or rewrite the response.

**Input gate (routing):** activate `rebuttal-audit` only when the user supplies BOTH (a) the reviewer comments / decision letter AND (b) an existing rebuttal/response draft to evaluate. If only (a) is present (no draft yet), route to `revision-coach` (which *generates* a response skeleton). If intent is ambiguous, clarify rather than guess.

**What it produces:**
- Per-comment coverage table — every reviewer concern marked `addressed` / `partially` / `missing` in the draft.
- Gap list — concerns the draft fails to answer.
- Risk flags — tone too combative, claims made without evidence, or a response that misreads the reviewer's actual point.
- Improvement suggestions (advisory).

<!--rs:REVIEW-011-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-011` for `academic-paper`.

**IRON RULE — advisory integrity boundary:** standalone `rebuttal-audit` may
reuse comment parsing, but it remains outside Stage 4.5 integrity and produces
only an advisory response-letter QA artifact. Return the coverage table, gap
list, tone/evidence risks, and suggestions for the producing subflow to record
in
`researchspec/subflows/<instance>/handoff.md`. It MUST NOT emit verified
commitment status, apply a draft patch, mark a delivery package ready, or
write ResearchSpec authority files. If its findings imply a change in
accepted response strategy or claim scope, propose that change and wait for a
human decision recorded through
`researchspec/subflows/<instance>/control.yaml`; the audit itself never
certifies acceptance.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-011-->

**Boundary vs `re-review`:** `academic-paper-reviewer`'s `re-review` mode verifies the **revised manuscript** (did the author's claimed changes actually appear in the paper) and runs inside the pipeline. `rebuttal-audit` verifies the **response letter itself** (does the rebuttal cover every comment, is its tone/evidence sound) and runs standalone, advisory. Different artifacts, different layers.

---

## Revision Mode Patch Protocol (#390)

<!--rs:PATCH-001-->
### ResearchSpec Current Owner

Replacement scope: `PATCH-001` for `academic-paper`.

In `academic-paper` revision mode, the writer may emit a bounded revision patch
instead of rewriting the complete manuscript. The adapted ARSU contract at
`assets/shared/contracts/patch/revision_patch.schema.json` is the sole manuscript
patch schema. It preserves stable operation IDs, block IDs and `old_hash`
preconditions, replace/insert/delete operations, annotation dispositions,
revision rationale, and roadmap traceability.

The selected manuscript may be Markdown or QMD. Treat QMD as
Markdown-compatible text and preserve its YAML frontmatter, fenced code,
cell-option comments, citations, cross-references, and Quarto metadata outside
the explicitly targeted anchored blocks. Never convert a `.qmd` path to `.md`
during revision.

The patch and manuscript are explicit files selected by the caller. They are not
handoff-referenced ResearchSpec runtime entities. When safe mechanical application is
useful, run `node scripts/apply-revision-patch.mjs` with explicit `--base`, `--patch`,
and `--output` paths and, optionally, `--report`. The helper validates the whole
patch before creating output. Schema errors, stale hashes, unknown blocks,
duplicate targets, injected block markers, or incomplete annotation mappings
leave the selected manuscript and destination unchanged.

Annotation intake normally stays under the owning revision subflow's
`work/annotation-intake/` directory. If an annotation set, patch, revised
manuscript, response, or report must cross a subflow boundary, write it to an
ordinary project path outside `researchspec/` and record its role and path in
that subflow's `handoff.md`.

Mechanical success does not settle academic adequacy. The revision Gate remains
human-confirmed in the owning subflow `control.yaml`. Manual editing and
human-confirmed full re-emission remain valid revision paths; the helper is an
optional safety tool and never mutates control state.

This patch protocol does not apply to the `academic-paper full` in-pair Phase
6→4 loop when that loop's contract requires a complete `## Draft Body`.

Current ResearchSpec owners:

- `assets/shared/contracts/patch/revision_patch.schema.json`
- `scripts/apply-revision-patch.mjs`
- `researchspec/subflows/<instance>/work/annotation-intake/`
- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:PATCH-001-->

---

## Plan Mode: Chapter-by-Chapter Guided Planning

Socratic mode that guides users through paper planning one chapter at a time. Builds a complete Paper Blueprint through structured dialogue.

> See `references/plan_mode_protocol.md` for the full chapter-by-chapter dialogue flow and Paper Blueprint structure.

---

## Handoff Protocol: deep-research -> academic-paper

`intake_agent` automatically detects deep-research materials (RQ Brief / Bibliography / Synthesis / INSIGHT Collection) and skips redundant steps. See `references/cross-skill/deep-research/SKILL.md` Handoff Protocol for the complete handoff material format.

---

## Failure Paths

See `references/failure_paths.md` for details. Quick reference:

| Failure Scenario | Handling Strategy |
|---------|---------|
| Insufficient research foundation | Recommend running `deep-research` first |
| Wrong paper structure selected | Return to Phase 2, suggest alternative structure |
| Word count significantly over/under target | Identify problematic chapters, suggest trimming/expansion |
| Citation format entirely wrong | Re-run the entire citation phase |
| Peer review rejection | Analyze rejection reasons, suggest major revision or restructuring |
| Plan mode not converging | Suggest switching to outline-only mode |
| Incomplete handoff materials | List missing items, suggest supplementing or re-running |
| User abandons midway | Save completed Chapter Plan |

---

## Full Academic Pipeline

See `references/cross-skill/academic-pipeline/SKILL.md` for the complete workflow.

---

## Phase 0: Configuration Interview

See `agents/intake_agent.md` for the complete field definitions of the Phase 0 configuration interview. The interview covers 9 core items: paper type, discipline, target journal, citation format, output format, language, abstract, word count, and existing materials — plus co-authors, funding, optional style calibration, the domain evidence profile (Step 12), and the citation-verification level (Step 13, #392: mark only by default / strict opt-in, seeding `terminal_policies.citation_existence`). Outputs a Paper Configuration Record, awaiting user confirmation.

---

## File Structure

**Agent definitions**: `agents/{agent_name}.md` — one file per agent (12 total, matching Agent Team table above).

**References** (28 files in `references/`):
- Citation: `apa7_extended_guide`, `apa7_chinese_citation_guide`, `citation_format_switcher`
- Writing: `academic_writing_style`, `writing_quality_check`, `writing_judgment_framework`
- Structure: `paper_structure_patterns` (6 types), `abstract_writing_guide`, `intro_title_rhetoric_guide` (CARS moves + title checklist)
- Domain: `hei_domain_glossary` (bilingual), `journal_submission_guide`, `latex_template_reference`, `domain_evidence_profiles` (advisory screening profiles)
- Process: `failure_paths` (12 scenarios), `mode_selection_guide` (11 modes), `plan_mode_protocol`, `workflow_phase_details`, `revision_patch_protocol` (#390 Mode B commands + marker lifecycle)
- Ethics: `credit_authorship_guide` (CRediT 14 roles), `funding_statement_guide`, `statistical_visualization_standards`
- Disclosure (v3.2): `disclosure_mode_protocol` (venue-specific AI-usage statement generation), `venue_disclosure_policies` (v1 database: ICLR, NeurIPS, Nature, Science, ACL, EMNLP)
- Integrity (v3.3): `anti_leakage_protocol` (knowledge isolation), `vlm_figure_verification` (optional VLM figure check)
- Policy anchors (#108): `policy_anchor_table`, `policy_anchor_disclosure_protocol`
- Meta: `changelog` (version history)
- Also: `references/cross-skill/deep-research/references/apa7_style_guide.md` (base reference, extended here)

**Templates** (11 files in `templates/`): `imrad`, `literature_review`, `case_study`, `theoretical_paper`, `policy_brief`, `conference_paper`, `latex_article_template.tex`, `bilingual_abstract`, `credit_statement`, `funding_statement`, `revision_tracking` (4 status types).

**Examples** (9 files in `examples/`): `imrad_hei_example`, `literature_review_example`, `plan_mode_guided_writing`, `chinese_paper_example`, `revision_mode_example`, `revision_recovery_example`, `clinical_citation_verification_checklist`, `clinical_epistemic_status_example`, `version_family_reconciliation_example`.

---

## Anti-Patterns

Explicit prohibitions to prevent common failure modes:

| # | Anti-Pattern | Why It Fails | Correct Behavior |
|---|-------------|-------------|-----------------|
| 1 | **AI-typical overused terms** | "delve into", "crucial", "it is important to note" = instant AI detection | Use discipline-specific vocabulary; see `references/writing_quality_check.md` |
| 2 | **Em dash abuse** | More than 2 em dashes per page signals AI writing | Use parentheses, commas, or restructure the sentence |
| 3 | **Throat-clearing openers** | "In this section, we will discuss..." adds no information | Start with the claim or finding directly |
| 4 | **Uniform paragraph lengths** | Every paragraph is 4-5 sentences = monotonous AI rhythm | Vary paragraph length naturally (2-8 sentences) |
| 5 | **⚠️ IRON RULE: Fabricated citations** | Inventing plausible-sounding references that don't exist | Every citation must be verified via DOI or WebSearch; see `references/cross-skill/academic-pipeline/agents/integrity_verification_agent.md` |
| 6 | **Sycophantic revision** | Accepting all reviewer feedback without critical evaluation | Use REVIEWER_DISAGREE status when reviewer is wrong; justify with evidence |
| 7 | **Scope creep during revision** | Adding unrequested sections/analyses to "improve" the paper | Revision addresses reviewer concerns only; new content requires explicit user approval |
| 8 | **Ignoring failure paths** | Continuing despite desk-reject signals or fatal methodology flaws | Check `references/failure_paths.md`; invoke F11 Desk-Reject Recovery when triggered |

---

## Quality Standards

### Writing Quality
1. **Every claim must have a citation** or be supported by the paper's own data — or, for #548 absence/novelty claims, carry documented-search provenance plus the named nearest prior work where one exists (the explicit absence-of-adjacent-work statement suffices otherwise; no source can cite an absence)
2. **Zero citation orphans** — in-text citations <-> reference list must perfectly match
3. **Consistent register** — academic tone appropriate for the discipline
4. **Logical flow** — clear transitions between paragraphs and sections
5. **Word count compliance** — within +/-10% of target

### Bilingual Abstract Quality
6. **Independent writing** — zh-TW and EN abstracts are independently composed, NOT mechanical translations
7. **Structural alignment** — both abstracts cover the same key points in the same order
8. **Keywords** — 5-7 per language, reflecting the paper's core concepts
9. **Word count** — EN: 150-300 words; zh-TW: 300-500 characters

### Citation Quality
10. **Format compliance** — 100% adherence to selected citation style
11. ⚠️ IRON RULE: **DOI inclusion** — every source with a DOI must include it; every citation must be verified via DOI or WebSearch
12. **Currency** — flag sources older than 10 years (unless seminal works)
13. **Self-citation ratio** — flag if >15%

### Peer Review
14. **Five dimensions** — Originality (20%), Methodological Rigor (25%), Evidence Sufficiency (25%), Argument Coherence (15%), Writing Quality (15%)
15. **Actionable feedback** — every criticism must include a specific suggestion
16. **Max 2 revision rounds** — unresolved items become Acknowledged Limitations

### Mandatory Inclusions
⚠️ **IRON RULE**: Every paper MUST include: Data Availability Statement, Ethics Declaration, Author Contributions (CRediT), Conflict of Interest Statement, Funding Acknowledgment.
17. **AI disclosure statement** — every paper must include a statement on AI tool usage
18. **Limitations section** — explicitly discuss study limitations
19. **Ethics statement** — when applicable (human subjects, sensitive data)

---

## Output Language

Follows the user's language. Academic terminology is kept in English. Bilingual abstracts are always provided regardless of the main text language.

---

## Integration with Other Skills

```
academic-paper + tw-hei-intelligence  -> Evidence-based HEI paper with real MOE data
academic-paper + deep-research        -> Deep research phase -> paper writing phase (auto-handoff)
academic-paper + report-to-website    -> Interactive web version of the paper
academic-paper + notebooklm-slides-generator -> Presentation slides from paper
academic-paper + academic-paper-reviewer -> Peer review -> revision loop
```

---

### Host-native alternate-model review

Use the current session model by default. If an independent model could improve
this subflow, the main Agent may propose one model that the host already exposes
through its native subagent mechanism. Before dispatch, obtain a separate user
confirmation covering the proposed model, the category of content that will be
shared, and the expected cost. This consent applies only to the current subflow;
every child, branch, and revision round asks again. Do not store the consent in a
stable spec, control, handoff, or model configuration file.

Freeze the main Agent's judgment before dispatch. Send only the minimum
de-anchored material needed for the check, without the main judgment, scores, or
reasoning. Treat disagreement as a reason for targeted review. Do not vote,
average results, or let the subagent silently rewrite the frozen judgment. If
the host cannot dispatch the confirmed model or the result is structurally
invalid, disclose the limitation and continue with a single-model result.

---

## Version Info

| Item | Content |
|------|---------|
| Skill Version | 3.2.0 |
| Last Updated | 2026-07-11 |
| Maintainer | Cheng-I Wu |
| Dependent Skills | deep-research v1.0+ (upstream), academic-paper-reviewer v1.0+ (downstream) |

---

## Version History

> See `references/changelog.md` for full version history.
