---
name: deep-research
description: "Research questions, evidence discovery, literature synthesis, fact-checking, and research reports. Routes: deep-research:full, deep-research:quick, deep-research:review, deep-research:lit-review, deep-research:three-way-scan, deep-research:fact-check, deep-research:socratic, deep-research:systematic-review. Use for: investigate a research question; synthesize scholarly evidence; verify claims; design a systematic review. Near-miss routing: write a literature-review section for a manuscript -> academic-paper:lit-review; peer-review an academic manuscript -> academic-paper-reviewer:full; complete research-to-publication workflow -> academic-pipeline:end-to-end. Before each start, present stable-spec and handoff prerequisites, boundary outputs, formal Gates, risk, cost, and obtain an instance-scoped confirmation."
metadata:
  version: "2.11.0"
  last_updated: "2026-07-11"
  status: active
  data_access_level: raw
  task_type: open-ended
  related_skills:
    - academic-paper
    - academic-pipeline
---

<!-- researchspec-contract-preflight:v11 -->
<!-- researchspec-literature-adapter:zotero-library:v2 -->
## ResearchSpec Contract Preflight

Locate the project researchspec/ workspace and run "researchspec status --json".
For a new root run, request "researchspec instructions profile:<profile-id> --json"
and present the selected entry, prerequisites, boundary outputs, formal Gates,
Decisions, risk, cost, and confirmation scope. Start only after the user confirms
that exact entry summary. Nodes and bound child runs declared by the frozen graph
inherit that authorization; every formal Gate and Decision still requires its
own confirmation, and alternate-model review requires separate current consent.

Read only the route-relevant parts of specs/project.md, specs/sources.yaml,
specs/claims.yaml, and specs/manuscript.yaml. Pipeline work also reads the
managed profile projection. After start, treat the owning run.yaml, frozen
graph.yaml, node instance files, and run handoff.md as runtime authority. Do not
reconstruct the frontier from Skill prose; use selectors returned by status and
request directed instructions for the eligible node, Gate, Decision, or pending
child start.


Produce semantic files at explicit project-relative paths outside
researchspec/, then submit their unique roles, types, purposes, paths, producers
or intended consumers, and relevant limits through the owning CLI action. Do not
register, copy, hash-bind, or assign framework IDs to boundary files.
Only the ResearchSpec CLI may mutate run or node lifecycle state, handoffs,
formal Gates, Decisions, overrides, and transitions.

For a formal Gate, use researchspec-verify to prepare evidence-linked findings,
show the proposed verdict and consequences, and obtain explicit human
confirmation. Record the verdict with "researchspec decide gate:<run>/<gate>".
Complete executable work only with "researchspec advance node:<run>/<node>"
after the eligible Node Card's output and validator requirements are satisfied.
A failed-Gate override requires its own human approval and reason on the owning
Gate; confirmations never complete an execution node.

Optional domain Skills are bounded advisory helpers. Suggest at most three
domains, keep plugin consent separate from graph entry confirmation, preview the exact
domain IDs and resolved Skills, and install only after explicit consent. Invoke a
projected Skill natively when loaded; otherwise use plugin instructions only
after selection, availability, projection, and manifest-hash checks. Decline or
failure leaves the graph selector, active producer, and workflow frontier unchanged.

## Literature Provider Policy

Classify broad or cross-task Zotero requests to `zotero-library-agent`. Route an already bounded task directly: current-library reads to `zotero-library-query`, gap-aware discovery or permitted import to `zotero-literature-acquisition`, source-level evidence work to `zotero-literature-analysis`, cross-source context to `zotero-research-synthesis`, and separately approved maintenance to `zotero-library-curation`. Zotero use nested inside ARSU research remains a provider operation owned by the active ARSU producer.

| Source policy | Provider priority | If live readiness fails |
| --- | --- | --- |
| `adapter-native` | Query the current library first, then use Acquisition or bounded external search only for recorded gaps. | Continue with bounded external or user-supplied sources and disclose the coverage limit. |
| `protocol-multi-source` | Follow the review protocol; use Zotero for seeds, duplicate checks, full text, and supplemental coverage. | Continue only where the protocol permits and record the missing provider coverage. |
| `external-first` | Use current authoritative external sources first or in parallel; use Zotero for academic context. | Continue with the external evidence plan and disclose unavailable library context. |
| `library-bound` | Use only the requested current selection, private collection, or offline library scope. | Pause; public search cannot substitute for private or library-only state. |

The selected Adapter Skill checks profile, bridge, authentication, and required capability just in time. Static `connection_state: unchecked` is neither success nor failure, and live readiness is not persisted as ResearchSpec workflow authority.

Adapter task output reaches the producer only through a provider-neutral `ProviderRetrievalHandoff` that references the upstream result path and SHA-256. It remains working evidence: the ARSU producer owns screening, deduplication, verification, coverage, and durable submission. An empty result is not proof that relevant literature does not exist.

Without a current run-, route-, collection-, candidate-, effect-, and time-bound `ManagedLibraryAuthorization`, `zotero-literature-acquisition` is candidate-only. Route confirmation and plugin consent do not grant this authorization. It never authorizes `zotero-library-curation`, metadata maintenance, tagging, notes, merging, deletion, or library-wide mutation.

The packaged academic-pipeline/scripts/adapters/zotero.py path is separate: it
reads only a user-supplied Better BibTeX JSON export, requires a user-provided
Python 3.11+ environment with PyYAML, and is not a live Zotero fact source.

This generated block uses profile researchspec-preflight-v11 for
deep-research and the current file-based protocol:
status -> instructions <selector> -> start/decide/advance -> status.

# Deep Research — Universal Academic Research Agent Team

Universal deep research tool — a domain-agnostic 13-agent team for rigorous academic research on any topic.

**v2.4** adds writing quality improvements to the report compiler:
- **Style Profile consumption** (optional) — If a Style Profile is available from academic-paper intake, the report compiler applies it as a soft guide for the Executive Summary and Synthesis sections. Discipline conventions and report objectivity take priority.
- **Writing Quality Check** — The report compiler runs a writing quality checklist before finalizing: flags AI-typical overused terms, checks sentence/paragraph length variation, removes throat-clearing openers. See `references/cross-skill/academic-paper/references/writing_quality_check.md`.

> **Routing discipline (v3.9.2):** see `.claude/CLAUDE.md` "Routing Discipline (v3.9.2)" + `references/shared/references/intent_clarification_protocol.md` for cross-skill routing rules. This skill assumes routing has already settled — ambiguous cross-phase materials should have been clarified upstream.

## Quick Start

**Minimal command:**
```
Research the impact of AI on higher education quality assurance
```

**Socratic mode:**
```
Guide my research on the impact of declining birth rates on private universities
引導我的研究：少子化對私立大學的影響
幫我釐清我的研究方向，我對高教品保有興趣但還不太確定
```

**Execution:**
1. Scoping — Research question + methodology blueprint
2. Investigation — Systematic literature search + source verification
3. Analysis — Cross-source synthesis + bias check
4. Composition — Full APA 7.0 report
5. Review — Editorial + ethics + vulnerability scan
6. Revision — Final polished report

---

## Trigger Conditions

### Trigger Keywords

**English**: research, deep research, literature review, systematic review, meta-analysis, PRISMA, evidence synthesis, fact-check, methodology, APA report, academic analysis, policy analysis, WHY HOW WHAT papers, 3W literature scan, guide my research, help me think through, monitor this topic, set up alerts

**繁體中文**: 研究, 深度研究, 文獻回顧, 文獻探討, 系統性回顧, 後設分析, 證據綜整, 事實查核, 三段式文獻掃描, WHY HOW WHAT 論文比較, 研究方法, 學術分析, 政策分析, 引導我的研究, 幫我釐清, 監測這個主題, 設定追蹤

**한국어**: 심층 연구, 문헌 조사, 문헌 고찰, 체계적 문헌고찰, 메타분석, 근거 종합, 사실 확인, 팩트체크, 연구 방법 설계, 학술 분석, 연구 방향을 잡아줘, 연구 주제 정하는 것을 도와줘, 무엇을 연구할지 모르겠어, 이 주제 계속 모니터링해줘

### Socratic Mode Activation

Activate `socratic` mode when the user's **intent** matches any of the following patterns, **regardless of language**. Detect meaning, not exact keywords.

**Intent signals** (any one is sufficient):
1. User has no clear research question and wants guided thinking
2. User asks to be "led", "guided", or "mentored" through research
3. User expresses uncertainty about what to research or where to start
4. User wants to brainstorm, explore, or clarify a research direction
5. User describes a vague interest without a specific, answerable question

**Default rule**: When intent is ambiguous between `socratic` and `full`, **prefer `socratic`** — it is safer to guide first than to produce an unwanted report. The user can always switch to `full` later.

**Example triggers** (illustrative, not exhaustive):
"guide my research", "help me think through", 「引導我的研究」「幫我釐清」, or equivalent in any language

### Does NOT Trigger

| Scenario | Use Instead |
|----------|-------------|
| Writing a paper (not researching) | `academic-paper` |
| Reviewing a paper (structured review) | `academic-paper-reviewer` |
| Full research-to-paper pipeline | `academic-pipeline` |

### Quick Mode Selection Guide

| Your Situation 你的狀況 | Recommended Mode | Spectrum |
|----------------|-----------------|----------|
| Vague idea, need guidance / 有模糊想法，需要引導 | `socratic` | originality |
| Clear RQ, need comprehensive research / 有明確 RQ，需要完整研究 | `full` | balanced |
| Need a quick brief (30 min) / 需要快速摘要 | `quick` | fidelity |
| Have a paper to evaluate before citing / 有論文需要評估 | `review` | balanced |
| Need literature review for a topic / 需要文獻回顧 | `lit-review` | fidelity |
| Need a fast paper-comparison scan / 需要快速比較多篇論文 | `three-way-scan` | fidelity |
| Need to verify specific claims / 需要查核特定事實 | `fact-check` | fidelity |
| Need systematic review / meta-analysis / 系統性回顧或後設分析 | `systematic-review` | fidelity |

**Spectrum** (v3.2): *fidelity* = template-heavy, predictable output; *balanced* = default; *originality* = exploratory, template-light. See `references/shared/mode_spectrum.md` for the full cross-skill spectrum table.

Not sure? Start with `socratic` — it will help you figure out what you need.
不確定？先用 `socratic` 模式——它會幫你釐清你需要什麼。

---

## Agent Team (13 Agents)

| # | Agent | Role | Phase |
|---|-------|------|-------|
| 1 | `research_question_agent` | Transforms vague topics into precise, FINER-scored research questions with scope boundaries | Phase 1, Socratic Layer 1 |
| 2 | `research_architect_agent` | Designs methodology blueprint: paradigm, method, data strategy, analytical framework, validity criteria | Phase 1 |
| 3 | `bibliography_agent` | Systematic literature search, source screening, annotated bibliography in APA 7.0 | Phase 2 |
| 4 | `source_verification_agent` | Fact-checking, source grading (evidence hierarchy), predatory journal detection, conflict-of-interest flagging | Phase 2 |
| 5 | `synthesis_agent` | Cross-source integration, contradiction resolution, thematic synthesis, gap analysis | Phase 3 |
| 6 | `report_compiler_agent` | Drafts complete APA 7.0 report (Title -> Abstract -> Intro -> Method -> Findings -> Discussion -> References) | Phase 4, 6 |
| 7 | `editor_in_chief_agent` | Q1 journal editorial review: originality, rigor, evidence sufficiency, verdict (Accept/Revise/Reject) | Phase 5 |
| 8 | `devils_advocate_agent` | Challenges assumptions, tests for logical fallacies, finds alternative explanations, confirmation bias checks | Phase 1, 3, 5, Socratic Layer 2, 4 |
| 9 | `ethics_review_agent` | AI-assisted research ethics, attribution integrity, dual-use screening, fair representation | Phase 5 |
| 10 | `socratic_mentor_agent` | Q1 journal editor persona; guides research thinking through Socratic questioning across 5 layers | Socratic Mode (Layer 1-5) |
| 11 | `risk_of_bias_agent` | Assesses risk of bias using RoB 2 (RCTs) and ROBINS-I (non-randomized); traffic-light visualization | Systematic Review (Phase 2) |
| 12 | `meta_analysis_agent` | Designs and executes meta-analysis or narrative synthesis; effect sizes, heterogeneity, GRADE | Systematic Review (Phase 3) |
| 13 | `monitoring_agent` | Post-research literature monitoring: digests, retraction alerts, contradictory findings detection | Optional (post-pipeline) |

---

## Mode Selection Guide

See `references/mode_selection_guide.md` for the detailed guide.

```
User Input
    |
    +-- Already have a clear research question?
    |   +-- Yes --> Need PRISMA-compliant systematic review / meta-analysis?
    |   |           +-- Yes --> systematic-review mode
    |   |           +-- No --> Need a full report?
    |   |                      +-- Yes --> full mode
    |   |                      +-- No --> Only need literature?
    |   |                                 +-- Yes --> Need rapid paper comparison?
    |   |                                            +-- Yes --> three-way-scan mode
    |   |                                            +-- No --> lit-review mode
    |   |                                 +-- No --> quick mode
    |   +-- No --> Want to be guided through thinking?
    |              +-- Yes --> socratic mode
    |              +-- No --> full mode (Phase 1 will be interactive)
    |
    +-- Already have text to review? --> review mode
    +-- Only need fact-checking? --> fact-check mode
```

---

## Orchestration Workflow (6 Phases)

```
User: "Research [topic]"
     |
=== Phase 1: SCOPING (Interactive) ===
     |
     |-> [research_question_agent] -> RQ Brief
     |   - FINER criteria scoring (Feasible, Interesting, Novel, Ethical, Relevant)
     |   - Scope boundaries (in-scope / out-of-scope)
     |   - 2-3 sub-questions
     |
     |-> [research_architect_agent] -> Methodology Blueprint
     |   - Research paradigm (positivist / interpretivist / pragmatist)
     |   - Method selection (qualitative / quantitative / mixed)
     |   - Data strategy (primary / secondary / both)
     |   - Analytical framework
     |   - Validity & reliability criteria
     |
     +-> [devils_advocate_agent] -- CHECKPOINT 1
         - RQ clarity and answerable?
         - Method appropriate for question?
         - Scope too broad or too narrow?
         - Verdict: PASS / REVISE (with specific feedback)
     |
     ** User confirmation before Phase 2 **
     |
=== Phase 2: INVESTIGATION ===
     |
     |-> [bibliography_agent] -> Source Corpus + Annotated Bibliography
     |   - Systematic search strategy (databases, keywords, Boolean)
     |   - Inclusion/exclusion criteria
     |   - PRISMA-style flow (if applicable)
     |   - Annotated bibliography (APA 7.0)
     |
     +-> [source_verification_agent] -> Verified & Graded Sources
         - Evidence hierarchy grading (Level I-VII)
         - Predatory journal screening
         - Conflict-of-interest flagging
         - Currency assessment (publication date relevance)
         - Source quality matrix
     |
=== Phase 3: ANALYSIS ===
     |
     |-> [synthesis_agent] -> Synthesis Narrative + Gap Analysis
     |   - Thematic synthesis across sources
     |   - Contradiction identification & resolution
     |   - Evidence convergence/divergence mapping
     |   - Knowledge gap analysis
     |   - Theoretical framework integration
     |
     +-> [devils_advocate_agent] -- CHECKPOINT 2
         - Cherry-picking check
         - Confirmation bias detection
         - Logic chain validation
         - Alternative explanations explored?
         - Verdict: PASS / REVISE
     |
=== Phase 4: COMPOSITION ===
     |
     +-> [report_compiler_agent] -> Full APA 7.0 Draft
         - Title Page
         - Abstract (150-250 words)
         - Introduction (context, problem, purpose, RQ)
         - Literature Review / Theoretical Framework
         - Methodology
         - Findings / Results
         - Discussion (interpretation, implications, limitations)
         - Conclusion & Recommendations
         - References (APA 7.0)
         - Appendices (if applicable)
     |
=== Phase 5: REVIEW (Parallel) ===
     |
     |-> [editor_in_chief_agent] -> Editorial Verdict + Line Feedback
     |   - Originality assessment
     |   - Methodological rigor
     |   - Evidence sufficiency
     |   - Argument coherence
     |   - Writing quality (clarity, conciseness, flow)
     |   - Verdict: ACCEPT / MINOR REVISION / MAJOR REVISION / REJECT
     |
     |-> [ethics_review_agent] -> Ethics Clearance
     |   - AI disclosure compliance
     |   - Attribution integrity
     |   - Dual-use screening
     |   - Fair representation check
     |   - Verdict: CLEARED / CONDITIONAL / BLOCKED
     |
     +-> [devils_advocate_agent] -- CHECKPOINT 3
         - Final vulnerability scan
         - Strongest counter-argument test
         - "So what?" significance check
         - Verdict: PASS / REVISE
     |
=== Phase 6: REVISION ===
     |
     +-> [report_compiler_agent] -> Final Report
         - Address editorial feedback
         - Resolve ethics conditions
         - Incorporate devil's advocate insights
         - Max 2 revision loops
         - Remaining issues -> "Acknowledged Limitations" section
```

### Checkpoint Rules

1. ⚠️ **IRON RULE**: **Devil's Advocate** has 3 mandatory checkpoints; **Critical-severity** issues block progression
2. Revision loops capped at **2 iterations**; remaining issues become "acknowledged limitations"
3. ⚠️ **IRON RULE**: **Ethics Review** stops the user once to confirm a Critical **integrity** concern (fabrication / plagiarism / missing AI disclosure / source misrepresentation / concrete harm-enabling specifics). Overridable with recorded reasoning — it confirms, it does not veto. Subject matter alone never blocks; dual-use is advisory (Responsible Use Statement), not a block.
4. User confirmation required after Phase 1 before proceeding

---

## Phase-by-phase Invocation Contract (v3.9.2)

ARS pipeline runs in 6 phases. Two invocation modes:

<!--rs:STATE-008-->
### ResearchSpec Current Owner

Replacement scope: `STATE-008` for `deep-research`.

Use `researchspec status` and directed graph instructions to resume an existing
instance from its owning control and handoff. When existing materials require a
new pipeline entry, select `academic-pipeline:mid-entry`, declare the actual
handoff input roles, and obtain a separate start confirmation. External metadata
never changes the current profile, frontier, Gate, or Decision authority.

Current ResearchSpec owners:

- `researchspec/specs/project.md`
- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
- `researchspec/runs/<run-id>/handoff.md`
<!--/rs:STATE-008-->

<!--rs:IO-004-->
### ResearchSpec Current Owner

Replacement scope: `IO-004` for `deep-research`.

In phase-by-phase mode, single-stage deep-research agents may read the contracts
and handoff-referenced upstream artifacts required by the selected route instructions, but may
write only its declared outputs. `devils_advocate_agent` and
`report_compiler_agent` retain multi-stage responsibilities only when the
current frontier instructions explicitly select that work; one invocation does
not authorize either role to extend itself into another stage.

Phase-by-phase routing requires an explicit user signal. Ambiguous cross-stage
material must be clarified before dispatch. The configured graph in
`researchspec/profiles/academic-pipeline.yaml`, the frontier in
`researchspec/runs/<run-id>/nodes/<node-instance>.yaml`, and handoff-referenced inputs in
`researchspec/runs/<run-id>/handoff.md` define the permitted read and
write boundary.

Current ResearchSpec owners:

- `researchspec/profiles/academic-pipeline.yaml`
- `researchspec/runs/<run-id>/nodes/<node-instance>.yaml`
- `researchspec/runs/<run-id>/handoff.md`
<!--/rs:IO-004-->

---

## Socratic Mode: Guided Research Dialogue

5-layer dialogue guiding users from vague ideas to concrete research questions. Core principle: ⚠️ **IRON RULE**: Never give direct answers.

**Layers**: Clarification -> Assumption Probing -> Evidence/Reasoning -> Viewpoint/Perspective -> Implication/Consequence

> See `references/socratic_mode_protocol.md` for the full 5-layer dialogue flow, management rules, and auto-end conditions.

### Opt-in Reading Probe (v3.5.1)

Setting `ARS_SOCRATIC_READING_PROBE=1` enables a one-time honesty probe during **goal-oriented** Socratic sessions. When the user cites a specific paper, the Mentor asks them to paraphrase one passage. Decline is logged without penalty. Default OFF. See `agents/socratic_mentor_agent.md` §"Optional Reading Probe Layer".

---

## Systematic Review Mode

PRISMA 2020-compliant systematic review with optional meta-analysis. Follows 5-phase protocol: Protocol Registration -> Systematic Search -> Screening & Selection -> Data Extraction & RoB -> Synthesis & Reporting.

> **v3.4.0 compliance:** `systematic-review` mode triggers `compliance_agent` at Stage 2.5 (Methods items) and Stage 4.5 (remaining items + RAISE 8-role matrix). PRISMA-trAIce Mandatory failures block the pipeline. See `references/shared/compliance_checkpoint_protocol.md`.

> See `references/systematic_review_protocol.md` for full PRISMA pipeline, checkpoint rules, and meta-analysis procedures.

---

## Operational Modes

| Mode | Agents Active | Output | Word Count |
|------|---------------|--------|------------|
| `full` (default) | All 9 core (excluding socratic_mentor, RoB, meta-analysis) | Full APA 7.0 report | 3,000-8,000 |
| `quick` | RQ + Biblio + Verification + Report | Research brief | 500-1,500 |
| `review` | Editor + Devil's Advocate + Ethics | Reviewer report on provided text | N/A |
| `lit-review` | Biblio + Verification + Synthesis | Annotated bibliography + synthesis | 1,500-4,000 |
| `three-way-scan` | Biblio + Verification (retrieval + WHY/HOW/WHAT extract) | Paper shortlist compared by WHY/HOW/WHAT + cross-paper synthesis | 800-2,000 |
| `fact-check` | Source Verification only | Verification report | 300-800 |
| `socratic` | Socratic Mentor + RQ + Devil's Advocate | Research Plan Summary (INSIGHT collection) | N/A (iterative) |
| `systematic-review` | RQ + Architect + Biblio + Verification + RoB + Meta-Analysis + Synthesis + Report + Editor + Ethics + DA | Full PRISMA 2020 report + forest plot data + GRADE table | 5,000-15,000 |

---

## Three-Way Scan Mode (WHY / HOW / WHAT)

Use `three-way-scan` when the user needs a disciplined shortlist of papers compared in a stable frame, but does **not** yet need a full literature review report.

- **WHY**: what problem or bottleneck the paper addresses and why it matters
- **HOW**: what strategy, method, or technical route the paper uses
- **WHAT**: what the paper found, built, or still leaves unresolved

This mode is intentionally lighter than `lit-review`. It prioritizes:

1. candidate retrieval
2. deduplication
3. compact per-paper extraction
4. cross-paper synthesis of shared WHY, divergent HOW, and remaining gaps

Recommended per-paper output:

```markdown
## <paper title>
Source: <provider> | Year: <year> | Link: <url>

- WHY: ...
- HOW: ...
- WHAT: ...
```

Then add:

- common `WHY`
- divergent `HOW`
- strongest `WHAT`
- unresolved global gap

If the user later wants a broader evidence matrix, thematic synthesis, or PRISMA-like coverage, escalate from `three-way-scan` to `lit-review` or `systematic-review`.

---

## Failure Paths

See `references/failure_paths.md` for all failure scenarios, trigger conditions, and recovery strategies across all modes.

Key failure path summary:

| Failure Scenario | Trigger Condition | Recovery Strategy |
|---------|---------|---------|
| RQ cannot converge | Phase 1 / Layer 1 exceeds multiple rounds while still vague | Provide 3 candidate RQs or suggest lit-review |
| Insufficient literature | bibliography_agent finds < 5 sources | Expand search strategy, alternative keywords |
| Methodology mismatch | RQ type misaligned with method capability | Return to Phase 1, suggest 3 alternative methods |
| Devil's Advocate CRITICAL | Fatal logical flaw discovered | STOP, explain the issue, require correction |
| Ethics BLOCKED | Critical integrity issue (not subject matter) | Stop the user once to confirm; list issues + remediation path; overridable with recorded reasoning |
| Socratic non-convergence | > 10 rounds without convergence | Suggest switching to full mode |
| User abandons mid-process | Explicitly states they don't want to continue | Save progress, provide re-entry path |
| Only Chinese-language literature | English search returns empty | Switch to Chinese academic databases |

---

## Literature Monitoring (Optional Post-Pipeline)

Optional post-research monitoring for new publications in the research area.

> See `references/literature_monitoring_strategies.md` for setup instructions across academic databases.

---

## Handoff Protocol: deep-research → academic-paper

After research is complete, the following materials can be handed off to `academic-paper`:

1. **Research Question Brief** (from research_question_agent)
2. **Methodology Blueprint** (from research_architect_agent)
3. **Annotated Bibliography** (from bibliography_agent)
4. **Synthesis Report** (from synthesis_agent)
5. **[If socratic mode] INSIGHT Collection and Research Plan Summary**

**Trigger**: User says "now help me write a paper" or "write a paper based on this"

`academic-paper`'s `intake_agent` will automatically detect available materials and skip redundant steps:
- Has RQ Brief -> skip topic scoping
- Has Bibliography -> skip literature search
- Has Synthesis -> accelerate findings / discussion writing

See `examples/handoff_to_paper.md` for a detailed handoff example.

---

## Full Academic Pipeline

See `references/cross-skill/academic-pipeline/SKILL.md` for the complete workflow.

---

## Agent File References

| Agent | Definition File |
|-------|----------------|
| research_question_agent | `agents/research_question_agent.md` |
| research_architect_agent | `agents/research_architect_agent.md` |
| bibliography_agent | `agents/bibliography_agent.md` |
| source_verification_agent | `agents/source_verification_agent.md` |
| synthesis_agent | `agents/synthesis_agent.md` |
| report_compiler_agent | `agents/report_compiler_agent.md` |
| editor_in_chief_agent | `agents/editor_in_chief_agent.md` |
| devils_advocate_agent | `agents/devils_advocate_agent.md` |
| ethics_review_agent | `agents/ethics_review_agent.md` |
| socratic_mentor_agent | `agents/socratic_mentor_agent.md` |
| risk_of_bias_agent | `agents/risk_of_bias_agent.md` |
| meta_analysis_agent | `agents/meta_analysis_agent.md` |
| monitoring_agent | `agents/monitoring_agent.md` |

---

## Reference Files

| Reference | Purpose | Used By |
|-----------|---------|---------|
| `references/apa7_style_guide.md` | APA 7th edition quick reference | report_compiler, editor_in_chief |
| `references/source_quality_hierarchy.md` | Evidence pyramid + grading rubric | source_verification, bibliography |
| `references/methodology_patterns.md` | Research design templates | research_architect |
| `references/logical_fallacies.md` | 30+ fallacies catalog | devils_advocate |
| `references/ethics_checklist.md` | AI disclosure, attribution, dual-use | ethics_review |
| `references/interdisciplinary_bridges.md` | Cross-discipline connection patterns | synthesis, research_architect |
| `references/socratic_questioning_framework.md` | 6 types of Socratic questions + 30+ prompt patterns | socratic_mentor |
| `references/failure_paths.md` | 12 failure scenarios with triggers and recovery paths | all agents |
| `references/mode_selection_guide.md` | Mode selection flowchart and comparison table | orchestrator |
| `references/irb_decision_tree.md` | IRB decision tree + Taiwan process + HE quick reference | ethics_review, research_architect |
| `references/equator_reporting_guidelines.md` | EQUATOR reporting guideline mapping | research_architect, report_compiler |
| `references/preregistration_guide.md` | Preregistration decision tree + platforms + checklist | research_architect |
| `references/systematic_review_toolkit.md` | Cochrane v6.4, PRISMA 2020, RoB 2, ROBINS-I, I² guide, GRADE, protocol registration | risk_of_bias, meta_analysis, bibliography, report_compiler |
| `references/literature_monitoring_strategies.md` | Google Scholar alerts, PubMed alerts, RSS feeds, Retraction Watch, citation tracking, monitoring cadence | monitoring_agent |
| `references/argumentation_reasoning_framework.md` | Cognitive framework for evaluating argument strength: Toulmin model, causal reasoning (Bradford Hill), inference to best explanation, epistemic status classification | synthesis, devils_advocate, source_verification, socratic_mentor, research_architect |
| `references/socratic_mode_protocol.md` | Full 5-layer Socratic dialogue flow, management rules, auto-end conditions | socratic_mentor, research_question |
| `references/systematic_review_protocol.md` | Full PRISMA pipeline, checkpoint rules, meta-analysis procedures | risk_of_bias, meta_analysis, bibliography, report_compiler |
| `references/cross_agent_quality_definitions.md` | Peer-reviewed source tiers, currency standards, severity definitions | all agents |
| `references/changelog.md` | Full version history | — |

---

## Templates

| Template | Purpose |
|----------|---------|
| `templates/research_brief_template.md` | Quick mode output format |
| `templates/literature_matrix_template.md` | Source x Theme analysis matrix |
| `templates/evidence_assessment_template.md` | Per-source quality assessment card |
| `templates/preregistration_template.md` | OSF standard 21-item preregistration template |
| `templates/prisma_protocol_template.md` | PRISMA-P 2015 systematic review protocol template |
| `templates/prisma_report_template.md` | PRISMA 2020 systematic review report template (27 items) |

---

## Examples

| Example | Demonstrates |
|---------|-------------|
| `examples/exploratory_research.md` | Full 6-phase pipeline walkthrough |
| `examples/systematic_review.md` | PRISMA-style literature review |
| `examples/policy_analysis.md` | Applied comparative policy research |
| `examples/socratic_guided_research.md` | Complete Socratic mode multi-turn dialogue (12 rounds) |
| `examples/handoff_to_paper.md` | deep-research full mode handoff to academic-paper |
| `examples/review_mode.md` | Review mode: 3-agent review pipeline for policy recommendation text |
| `examples/fact_check_mode.md` | Fact-check mode: source verification of HEI claims with per-claim verdicts |
| `examples/idea_diversity_coverage_gap_advisory.md` | #257 Socratic wording-pattern + lit-review distributional-skew advisories |

---

## Output Language

Follows the user's language. Academic terminology kept in English. Socratic mode uses natural conversational style.

---

## Anti-Patterns

Explicit prohibitions to prevent common failure modes:

| # | Anti-Pattern | Why It Fails | Correct Behavior |
|---|-------------|-------------|-----------------|
| 1 | **Confirmation bias in source selection** | Only finding sources that support the hypothesis | Devil's Advocate checkpoint must include counter-evidence search |
| 2 | **Cherry-picking evidence** | Citing one supportive study while ignoring three contradicting ones | Report the full evidence landscape including conflicting findings |
| 3 | **Vibe citing** | Mixing elements from 2-3 real papers into a fabricated reference | Every reference must be verified independently; mashup fabrication is the hardest to detect |
| 4 | **⚠️ IRON RULE: Treating "difficult to verify" as acceptable** | Marking a reference as "uncertain" instead of FAIL | Gray zone = FAIL. If you cannot confirm it exists, it does not go in the report |
| 5 | **Skipping phases** | Jumping to synthesis before completing source verification | Complete each phase fully; Phase N output is Phase N+1 input |
| 6 | **Shallow Socratic mode** | Giving answers disguised as questions ("Wouldn't you say X is true?") | Ask genuine questions that expose assumptions; never lead to predetermined conclusions |
| 7 | **Source tier inflation** | Treating a blog post as equivalent to a peer-reviewed journal | Apply evidence hierarchy strictly: Tier 1 (peer-reviewed) > Tier 2 (preprint) > Tier 3 (gray lit) |

## Quality Standards

1. ⚠️ **IRON RULE**: **Every claim must have a citation** — no unsupported assertions
2. **Evidence hierarchy** — meta-analyses > RCTs > cohort studies > case reports > expert opinion (field-neutral baseline; grading is **discipline-relative** — a source meeting its own field's gold standard can reach Grade A even at a low design level. See `references/source_quality_hierarchy.md` §Grading Rubric + §Field-Specific Adjustments)
3. **Contradiction disclosure** — if sources disagree, report both sides with evidence quality comparison
4. **Limitation transparency** — every report must have an explicit limitations section
5. **AI disclosure** — all reports include a statement that AI-assisted research tools were used
6. **Reproducibility** — search strategies, inclusion criteria, and analytical methods must be documented for replication
7. **Socratic integrity** — in socratic mode, never give direct answers; always guide through questions

## Cross-Agent Quality Alignment

Unified definitions across all agents. ⚠️ IRON RULE: **CRITICAL severity** = issue that would invalidate a core conclusion or constitute academic misconduct. Requires immediate resolution.

> See `references/cross_agent_quality_definitions.md` for full peer-reviewed source tiers, currency standards, and severity definitions.

---

## Integration with Other Skills

This skill is domain-agnostic but can be combined with domain-specific skills:

```
deep-research + tw-hei-intelligence     -> Evidence-based HEI policy research
deep-research + report-to-website       -> Interactive research report
deep-research + podcast-script-generator -> Research podcast
deep-research + academic-paper          -> Full research-to-publication pipeline
deep-research (socratic) + academic-paper (plan) -> Guided research + paper planning
deep-research (systematic-review) + academic-paper -> PRISMA systematic review paper
```

---

### Host-native alternate-model review

Use the current session model by default. If an independent model could improve
this run and node, the main Agent may propose one model that the host already exposes
through its native subagent mechanism. Before dispatch, obtain a separate user
confirmation covering the proposed model, the category of content that will be
shared, and the expected cost. This consent applies only to the current run and node;
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
| Skill Version | 2.11.0 |
| Last Updated | 2026-07-11 |
| Maintainer | Cheng-I Wu |
| Dependent Skills | academic-paper v1.0+ (downstream) |

---

## Version History

> See `references/changelog.md` for full version history.
