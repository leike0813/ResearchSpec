---
name: academic-paper-reviewer
description: "Multi-perspective academic paper review with dynamic reviewer personas. Simulates 5 independent reviewers (EIC + 3 peer reviewers + Devil's Advocate) with field-specific expertise. Supports full review, re-review (verification), quick assessment, methodology focus, Socratic guided, and calibration modes. Triggers on: review paper, peer review, manuscript review, referee report, review my paper, critique paper, simulate review, editorial review, calibrate reviewer, reviewer calibration, measure reviewer accuracy, 審查論文, 論文審查, 模擬審查, 同儕審查, 幫我審這篇, 以審查人角度評估, 審查者校準, 논문 심사, 동료 심사, 모의 심사, 심사자 관점에서 평가, 심사자 보정."
metadata:
  version: "1.10.0"
  last_updated: "2026-07-11"
  status: active
  data_access_level: verified_only
  task_type: open-ended
  related_skills:
    - academic-paper
    - academic-pipeline
---

# Academic Paper Reviewer v1.10.0 — Multi-Perspective Academic Paper Review Agent Team

Simulates a complete international journal peer review process: automatically identifies the paper's field, dynamically configures 5 reviewers (Editor-in-Chief + 3 peer reviewers + Devil's Advocate) who review from four non-overlapping perspectives — methodology, domain expertise, cross-disciplinary viewpoints, and core argument challenges — ultimately producing a structured Editorial Decision and Revision Roadmap.

**v1.1 Improvements**:
1. Added Devil's Advocate Reviewer — specifically challenges core arguments, detects logical fallacies, and identifies the strongest counter-arguments
2. Added `re-review` mode — verification review, focused on checking whether revisions address the review comments
3. Expanded review team from 4 to 5 members

> **Routing discipline (v3.9.2):** see `.claude/CLAUDE.md` "Routing Discipline (v3.9.2)" + `../../shared/references/intent_clarification_protocol.md` for cross-skill routing rules. This skill assumes routing has already settled — ambiguous cross-phase materials should have been clarified upstream.

---

## Quick Start

**Simplest command:**
```
Review this paper: [paste paper or provide file]
```

**Output:**
1. Automatically identifies the paper's field and methodology type
2. Dynamically configures the specific identities and expertise of 5 reviewers
3. 5 independent review reports (each from a different perspective)
4. 1 Editorial Decision Letter + Revision Roadmap

---

## Trigger Conditions

### Trigger Keywords

**English**: review paper, peer review, manuscript review, referee report, review my paper, critique paper, simulate review, editorial review, calibrate reviewer, reviewer calibration, measure reviewer accuracy

**한국어**: 논문 심사, 동료 심사, 모의 심사, 원고 심사, 심사 보고서, 심사자 관점에서 평가, 심사자 보정, 심사 정확도 측정

**繁體中文**: 審查論文, 論文審查, 模擬審查, 同儕審查, 幫我審這篇, 以審查人角度評估, 審查者校準

### Non-Trigger Scenarios

| Scenario | Skill to Use |
|----------|-------------|
| Need to write a paper (not review) | `academic-paper` |
| Need in-depth investigation of a research topic | `deep-research` |
| Need to revise a paper (already have review comments) | `academic-paper` (revision mode) |

### Quick Mode Selection Guide

| Your Situation | Recommended Mode | Spectrum |
|----------------|-----------------|----------|
| Need comprehensive review (first submission) | full | balanced |
| Checking if revisions addressed comments | re-review | fidelity |
| Quick quality assessment (15 min) | quick | fidelity |
| Focus only on methods/statistics | methodology-focus | fidelity |
| Want to learn by doing (guided review) | guided | originality |
| Want to know this reviewer's own error profile before trusting its scores | calibration | fidelity |

**Spectrum** (v3.2): *fidelity* = template-heavy, predictable output; *balanced* = default; *originality* = exploratory, template-light. See `../../shared/mode_spectrum.md` for the full cross-skill spectrum table.

Not sure? Use `full` for pre-submission review, `re-review` for post-revision verification. `calibration` is opt-in — run it once per domain when you want to know the reviewer's FNR/FPR before relying on its rubric scores.

---

## Agent Team (7 Agents)

| # | Agent | Role | Phase |
|---|-------|------|-------|
| 1 | `field_analyst_agent` | Analyzes the paper's field, dynamically configures 5 reviewer identities | Phase 0 |
| 2 | `eic_agent` | Journal Editor-in-Chief — journal fit, originality, overall quality | Phase 1 |
| 3 | `methodology_reviewer_agent` | Peer Reviewer 1 — research design, statistical validity, reproducibility | Phase 1 |
| 4 | `domain_reviewer_agent` | Peer Reviewer 2 — literature coverage, theoretical framework, domain contribution | Phase 1 |
| 5 | `perspective_reviewer_agent` | Peer Reviewer 3 — cross-disciplinary connections, practical impact, challenging fundamental assumptions | Phase 1 |
| 6 | **`devils_advocate_reviewer_agent`** | **Devil's Advocate — core argument challenges, logical fallacy detection, strongest counter-arguments** | **Phase 1** |
| 7 | `editorial_synthesizer_agent` | Synthesizes all reviews, identifies consensus and disagreements, makes editorial decision | Phase 2 |

---

## Orchestration Workflow (3 Phases)

```
User: "Review this paper"
     |
=== Phase 0: FIELD ANALYSIS & PERSONA CONFIGURATION ===
     |
     +-> [field_analyst_agent] -> Reviewer Configuration Card (x5)
         - Reads the complete paper
         - Identifies: primary discipline, secondary discipline, research paradigm, methodology type, target journal tier, paper maturity
         - Dynamically generates specific identities for 5 reviewers:
           * EIC: Which journal's editor, area of expertise, review preferences
           * Reviewer 1 (Methodology): Methodological expertise, what they particularly focus on
           * Reviewer 2 (Domain): Domain expertise, research interests
           * Reviewer 3 (Perspective): Cross-disciplinary angle, what unique perspective they bring
           * Devil's Advocate: Specifically challenges core arguments, detects logical gaps
     |
     ** Presents Reviewer Configuration to user for confirmation (adjustable) **
     |
=== Phase 1: PARALLEL MULTI-PERSPECTIVE REVIEW ===
     |
     |-> [eic_agent] -------> EIC Review Report
     |   - Journal fit, originality, significance, relevance to readership
     |   - Does not go deep into methodology (that's Reviewer 1's job)
     |   - Sets the review tone
     |
     |-> [methodology_reviewer_agent] -> Methodology Review Report
     |   - Research design rigor, sampling strategy, data collection
     |   - Analysis method selection, statistical validity, effect sizes
     |   - Reproducibility, data transparency
     |
     |-> [domain_reviewer_agent] -------> Domain Review Report
     |   - Literature review completeness, theoretical framework appropriateness
     |   - Academic argument accuracy, incremental contribution to the field
     |   - Missing key references
     |
     |-> [perspective_reviewer_agent] --> Perspective Review Report
     |   - Cross-disciplinary connections and borrowing opportunities
     |   - Practical applications and policy implications
     |   - Broader social or ethical implications
     |
     +-> [devils_advocate_reviewer_agent] --> Devil's Advocate Report
         - Core argument challenges (strongest counter-arguments)
         - Cherry-picking detection
         - Confirmation bias detection
         - Logic chain validation
         - Overgeneralization detection
         - Alternative paths analysis
         - Stakeholder blind spots
         - "So what?" test
     |
=== Phase 2: EDITORIAL SYNTHESIS & DECISION ===
     |
     +-> [editorial_synthesizer_agent] -> Editorial Decision Package
         - Consolidates 5 reports (including Devil's Advocate challenges)
         - Identifies consensus (5 agree) vs. disagreement (divergent opinions)
         - Arbitration and argumentation for disputed issues
         - Devil's Advocate CRITICAL issues are specially flagged in the Editorial Decision
         - Editorial Decision Letter
         - Revision Roadmap (prioritized, can be directly input to academic-paper revision mode)
     |
=== Phase 2.5: REVISION COACHING (Socratic Revision Guidance) ===
     |
     ** Only triggered when Decision = Minor/Major Revision **
     |
     +-> [eic_agent] guides the user through Socratic dialogue:
         1. Overall positioning — "After reading the review comments, what surprised you the most?"
         2. Core issue focus — Guides user to understand consensus issues
         3. Contribution framing probe — ask the Layer-5 later-stage anchored forms
            L5-W1 / L5-W2 / L5-W3 (single-sourced under Layer 5 in
            ../../../agents/socratic_mentor_agent.md — read the question text
            there), anchored to what the manuscript already claims ("the revised
            paper"). Questions only — never propose, substitute, rank, expand, or
            select a contribution claim (Kong L2 verb test); the user answers.
         4. Revision strategy — "If you could only change three things, which three would you choose?"
         5. Counter-argument response — Guides user to think about how to respond to Devil's Advocate challenges
         6. Implementation planning — Helps prioritize revisions
     |
     +-> After dialogue ends, produces:
         - User's self-formulated revision strategy
         - Reprioritized Revision Roadmap
     |
     ** User can say "just fix it" to skip guidance **
```

### Checkpoint Rules

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

## Phase-by-phase Invocation Contract (v3.9.2)

academic-paper-reviewer runs in 3 phases internally (Phase 0 field analysis → Phase 1 panel review → Phase 2 editorial synthesis). Within the full ARS pipeline, this skill sits at the orchestrator's Phase 5 (Review), but each agent inside the reviewer skill is single-phase relative to the skill's own phase numbering.

Two invocation modes:

**Mode A — orchestrator-driven (default):** `pipeline_orchestrator_agent` (in `academic-pipeline` skill) dispatches `academic-paper-reviewer` as part of the full ARS pipeline Stage 3 (Review).

**Mode B — phase-by-phase (cross-session resume):** User invokes one reviewer agent per phase across sessions, or runs the full reviewer panel standalone via `/ars-review` equivalent.

<!--rs:IO-006-->
### ResearchSpec Current Owner

Replacement scope: `IO-006` for `academic-paper-reviewer`.

In phase-by-phase mode, the review panel and editorial synthesizer may write only
the outputs declared by the selected review route instructions. Reviewers are expected
to read the complete handoff-referenced manuscript needed for evaluation; read access
does not extend their write scope. `field_analyst` remains a panel-configuration
role and may emit only its declared configuration artifact. The Sprint Contract
paper-blind and paper-visible call discipline remains active inside these stage
boundaries; neither rule overrides the other.

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
<!--/rs:IO-006-->

---

## Operational Modes (6 Modes)

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

### Mode Selection Logic

```
"Review this paper"                      -> full
"Give me a quick look at this paper"     -> quick
"Help me check the methodology"          -> methodology-focus
"Does this paper have methodology issues"-> methodology-focus
"Guide me to improve this paper"         -> guided
"Walk me through the issues in my paper" -> guided
"Verification review" / "Check revisions"-> re-review
"How accurate is your review scoring?"   -> calibration
"Calibrate against these 10 papers"      -> calibration
```

---

## Re-Review Mode (Verification Review)

<!--rs:REVIEW-001-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-001` for `academic-paper-reviewer`.

Dedicated mode for Pipeline Stage 3'. Re-review verifies each first-round
concern against the current revised manuscript and the response to reviewers.
When the revision producer exposed an ARSU patch, annotation set, or helper
summary, resolve those files by role and safe project-relative path from the
producer subflow's `handoff.md`; do not infer them from directory names or
another authority file.

**Input:** the original Revision Roadmap, revised manuscript, response to
reviewers when present, prior review material, and any explicitly handed-off
patch or annotation evidence relevant to the concern.

**Output:** a Verification Review Report at an ordinary project path outside
`researchspec/`, recorded as an output in this subflow's `handoff.md`. The
reviewer assesses semantic fulfillment independently. Mechanical application or
annotation disposition never proves that a concern was answered. A human
records the formal re-review Gate verdict in the owning subflow `control.yaml`.

> See `references/re_review_mode_protocol.md` for the verification rules,
> output format, and Socratic guidance.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-001-->

---

## Guided Mode (Socratic Guided Review)

Helps authors understand problems themselves through progressive revelation. EIC opens with strengths, then gradually introduces deeper issues from each reviewer perspective.

> See `references/guided_mode_protocol.md` for dialogue flow, rules, and progressive revelation sequence.

---

## Calibration Mode (v3.2)

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

> See `references/calibration_mode_protocol.md` for full spec: intake rules, ensembling methodology, output format, and failure cases this mode does not fix.

---

## Review Output Format

Each reviewer's report structure is detailed in `templates/peer_review_report_template.md`.

### Devil's Advocate Report Structure (Special Format)

The Devil's Advocate uses a dedicated format, not the standard reviewer template:
- **Strongest Counter-Argument** (200-300 words)
- **Issue List** (categorized as CRITICAL / MAJOR / MINOR, with dimension and location)
- **Ignored Alternative Explanations/Paths**
- **Missing Stakeholder Perspectives**
- **Observations (Non-Defects)**

---

## Editorial Decision Format

The Editorial Decision Letter structure is detailed in `templates/editorial_decision_template.md`.

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

## Integration

### Upstream/Downstream Relationships

```
deep-research --> academic-paper --> [integrity check] --> academic-paper-reviewer --> academic-paper (revision) --> academic-paper-reviewer (re-review) --> [final integrity] --> finalize
   (research)       (writing)         (integrity audit)      (review)                    (revision)                    (verification review)                (final verification)   (finalization)
```

### Specific Integration Methods

| Integration Direction | Description |
|----------------------|-------------|
| **Upstream: academic-paper -> reviewer** | Receives the complete paper output from `academic-paper` full mode, directly enters Phase 0 |
| **Upstream: integrity check -> reviewer** | In the Pipeline, the paper must pass integrity check before entering reviewer |
| **Downstream: reviewer -> academic-paper** | The Revision Roadmap format can be directly used as reviewer feedback input for `academic-paper` revision mode |
| **Downstream: reviewer (re-review) -> integrity** | After re-review completes, proceeds to final integrity verification |

### Pipeline Usage Example

> See `references/integration_guide.md` for a complete 9-step pipeline usage example.

---

## Agent File References

| Agent | Definition File |
|-------|----------------|
| field_analyst_agent | `agents/field_analyst_agent.md` |
| eic_agent | `agents/eic_agent.md` |
| methodology_reviewer_agent | `agents/methodology_reviewer_agent.md` |
| domain_reviewer_agent | `agents/domain_reviewer_agent.md` |
| perspective_reviewer_agent | `agents/perspective_reviewer_agent.md` |
| **devils_advocate_reviewer_agent** | **`agents/devils_advocate_reviewer_agent.md`** |
| editorial_synthesizer_agent | `agents/editorial_synthesizer_agent.md` |

---

## Reference Files

| Reference | Purpose | Used By |
|-----------|---------|---------|
| `references/review_criteria_framework.md` | Structured review criteria framework (differentiated by paper type) | all reviewers |
| `references/top_journals_by_field.md` | Top journal lists for major academic fields (EIC role calibration) | field_analyst, eic |
| `references/editorial_decision_standards.md` | Accept/Minor/Major/Reject criteria and decision matrix | eic, editorial_synthesizer |
| `references/statistical_reporting_standards.md` | Statistical reporting standards + APA 7.0 format quick reference + red flag list | methodology_reviewer |
| `references/quality_rubrics.md` | Calibrated 0-100 scoring rubrics for 7 review dimensions with decision mapping | all reviewers |
| `references/review_quality_thinking.md` | Cognitive framework for review quality: three lenses (internal validity, external validity, contribution), common reviewer traps, calibration questions | all reviewers |
| `references/re_review_mode_protocol.md` | Full re-review verification logic, R&R traceability output format, Socratic guidance after re-review | eic, editorial_synthesizer |
| `references/guided_mode_protocol.md` | Guided mode dialogue flow, progressive revelation sequence, dialogue rules | all reviewers |
| `references/calibration_mode_protocol.md` | Calibration mode: FNR/FPR/balanced accuracy measurement against user-supplied gold set, 5x ensembling, session-scoped confidence disclosure (v3.2) | all reviewers |
| `references/integration_guide.md` | Complete 9-step pipeline usage example | — |
| `references/changelog.md` | Full version history | — |

---

## Templates

| Template | Purpose |
|----------|---------|
| `templates/peer_review_report_template.md` | Review report template used by each reviewer |
| `templates/editorial_decision_template.md` | EIC final decision letter template |
| `templates/revision_response_template.md` | Revision response template for authors (R->A->C format) |

---

## Examples

| Example | Demonstrates |
|---------|-------------|
| `examples/hei_paper_review_example.md` | Full review example: "Impact of Declining Birth Rates on Management Strategies of Taiwan's Private Universities" |
| `examples/interdisciplinary_review_example.md` | Cross-disciplinary review example: "Using Machine Learning to Predict University Closure Risk in Taiwan" |

---

## Anti-Patterns

Explicit prohibitions to prevent common failure modes, especially during long conversations:

| # | Anti-Pattern | Why It Fails | Correct Behavior |
|---|-------------|-------------|-----------------|
| 1 | **Fabricating review comments** | Synthesizer invents critique not in any reviewer report | Every synthesis point must trace to a specific Phase 1 reviewer report |
| 2 | **Duplicate criticisms across reviewers** | R1/R2/R3 raise identical points = fake diversity | Each reviewer has a distinct perspective; overlapping topics get different angles |
| 3 | **Ignoring Devil's Advocate CRITICAL findings** | Editorial Decision says Accept despite DA flagging critical issues | If DA finds CRITICAL → Decision cannot be Accept (Checkpoint Rule #4) |
| 4 | **Rubber-stamp re-review** | Re-review says "all addressed" without verification | Each concern must be independently verified against the revised manuscript |
| 5 | **Sycophantic score inflation** | Giving 8/10 to mediocre work to avoid conflict | Scores must be evidence-based; a paper with methodology gaps cannot score >6 on rigor |
| 6 | **Editing the manuscript** | Reviewer "helpfully" fixes the paper directly | READ-ONLY: produce reports, never modify the paper (Checkpoint Rule #6) |
| 7 | **Generic feedback** | "The methodology could be stronger" without specifics | Every criticism must include: what's wrong, where it is, and a proposed fix |

---

## Quality Standards

| Dimension | Requirement |
|-----------|-------------|
| Perspective differentiation | Each reviewer's review must come from a different angle; no duplicate criticisms |
| Evidence-based | EIC's decision must be based on specific reviewer comments; no fabrication |
| Specificity | Reviews must cite specific passages, data, or page numbers from the paper; no vague comments |
| Balance | Strengths and Weaknesses must be balanced; cannot only criticize without affirming |
| Professional tone | Review tone must be professional and constructive; avoid personal attacks or demeaning language |
| Actionability | Each weakness must include specific improvement suggestions |
| Format consistency | All reports must follow the template structure; no freestyle |
| **Devil's Advocate completeness** | **Devil's Advocate must produce the strongest counter-argument; cannot be omitted** |
| **CRITICAL threshold** | **⚠️ IRON RULE: Devil's Advocate CRITICAL issues cannot be ignored by the Editorial Decision** |

---

## Output Language

Follows the paper's language. Academic terms remain in English. User can override (e.g., "review this Chinese paper in English").

---

## Related Skills

| Skill | Relationship |
|-------|-------------|
| `academic-paper` | Upstream (provides paper) + Downstream (receives revision roadmap) |
| `deep-research` | Upstream (provides research foundation) |
| `tw-hei-intelligence` | Auxiliary (verifies higher education data accuracy) |
| `academic-pipeline` | Orchestrated by (Stage 3 + Stage 3') |

---

## v3.6.2 Sprint Contract Hard Gate

- **Reviewer hard gate.** All reviewer modes that ship with contracts (`reviewer_full`, `reviewer_methodology_focus`) now run two-call Phase 1 (paper-content-blind) + Phase 2 (paper-visible) orchestration. See `references/sprint_contract_protocol.md`.
<!--rs:REVIEW-002-->
### ResearchSpec Current Owner

Replacement scope: `REVIEW-002` for `academic-paper-reviewer`.

- **Sprint contract.** Resolve the mode-specific frozen contract JSON through
  `researchspec/subflows/<instance>/handoff.md`, then deep-copy it for permitted
  invocation fields. Preserve `panel_size`, `acceptance_dimensions`, severity
  and cross-reviewer quantifiers, measurement procedure, override ladder, and
  bounded amendments. Return the instantiated contract and each phase output to
  the producing subflow for handoff recording; send lint, panel-cardinality,
  and failure-condition results to the review Gate helper for
  `researchspec/subflows/<instance>/control.yaml`. The following synthesizer
  protocol and mode-specific panel sizes remain unchanged.

Current ResearchSpec owners:

- `researchspec/subflows/<instance>/handoff.md`
- `researchspec/subflows/<instance>/control.yaml`
<!--/rs:REVIEW-002-->
<!--rs:REVIEW-016-->
### ResearchSpec Current Owner: Deterministic Panel Check

The sprint contract and panel synthesis remain machine-checked working
artifacts. Before starting a contract-backed panel, confirm that the local host
provides Python 3.11 or newer and `jsonschema>=4.17`. These are user-managed
prerequisites: do not install, upgrade, or fetch them. If either prerequisite is
missing, pause the panel flow and report the missing prerequisite. Agent judgment
cannot replace the deterministic checks.

1. Validate the sprint contract with
   `scripts/check_sprint_contract.py <contract.json>`.
2. After all reviewer reports and the synthesis exist, run
   `scripts/check_panel_synthesis.py --contract <contract.json> --report
   <r1.md> ... --report <rN.md> --synthesis <synthesis.md>`.
3. Treat a nonzero exit as a failed candidate check and follow the bounded retry
   or abort behavior reported by the checker. Never rewrite a checker verdict or
   accept a malformed candidate by inspection.
4. Record accepted review and synthesis files as boundary outputs in
   `researchspec/subflows/<instance>/handoff.md`. A passing checker establishes
   only mechanical self-consistency. It does not confirm a formal ResearchSpec
   Gate; Verify prepares that judgment and only a human-confirmed Decide action
   records it in `researchspec/subflows/<instance>/control.yaml`.

The packaged checker closure is exactly:

- `scripts/check_sprint_contract.py`
- `scripts/check_panel_synthesis.py`
- `assets/shared/sprint_contract.schema.json`
<!--/rs:REVIEW-016-->
- **Synthesizer three-step mechanical protocol.** Build cross-reviewer matrix → evaluate each failure_condition with panel-relative quantifier + expression vocabulary → resolve precedence by severity. Forbidden operations explicit in `agents/editorial_synthesizer_agent.md`.
- **methodology_focus reduced panel.** `reviewer_methodology_focus` mode runs a 2-reviewer panel (EIC + methodology only) instead of the default 5.
- **Templates:** `../../../assets/shared/contracts/reviewer/full.json` (panel 5) and `../../../assets/shared/contracts/reviewer/methodology_focus.json` (panel 2). Reserved modes (`reviewer_re_review`, `reviewer_calibration`, `reviewer_guided`) keep pre-v3.6.2 behaviour until follow-up patch templates land.

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
| Skill Version | 1.10.0 |
| Last Updated | 2026-07-11 |
| Maintainer | Cheng-I Wu |
| Dependent Skills | academic-paper v1.0+ (upstream/downstream integration) |
| Role | Multi-perspective academic paper review simulator |

---

## Changelog

> See `references/changelog.md` for full version history.
