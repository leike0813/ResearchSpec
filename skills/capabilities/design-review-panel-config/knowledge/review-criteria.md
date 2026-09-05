<!--
══════════════════════════════════════════════
ARS 提取工件（Extraction Artifact）— M3 完整性与评审段
══════════════════════════════════════════════
工件类型: knowledge-pack
能力/包 ID: KP-M3-02b review-criteria-framework（评审标准框架）
提取日期: 2026-09-06
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/ars/academic-paper-reviewer/references/review_criteria_framework.md（全文）
变更台账（ledger）:
    1. [保留] 全文逐字节保留。
    2. [标注] 决策清单 M3 知识包之一（评审 rubric 族）组成部分。
    3. [刷新] 已按 ARS v3.21.1（127ff85）重新提取受影响上游正文；正文保持逐字节原文。
说明: 提取阶段只做"忠实迁移 + 归属标注"。任何内容删改；本轮按 v3.21.1 刷新受影响正文
      一律推迟到 authoring 阶段，并另行记录。
══════════════════════════════════════════════
-->

# Review Criteria Framework — Structured Review Criteria Framework

This document defines shared review criteria and article-type extensions. Apply every criterion through the criterion-bound judgement form in `quality_rubrics.md`; the framework contains no numerical scoring or aggregation rule.

## 1. Universal Review Dimensions

| Dimension | Core question |
|---|---|
| Originality | What defensible contribution does the paper make relative to the relevant literature and target venue? |
| Methodological Rigor | Can the design, execution, analysis, and reporting support the inferences made? |
| Evidence Sufficiency | Does each material claim have evidence of the appropriate type, quality, relevance, and coverage? |
| Argument Coherence | Do the problem, gap, question, method, findings, and implications form a traceable argument? |
| Writing Quality | Is the reasoning communicated precisely enough to interpret and verify without conflating language polish with research quality? |
| Literature Integration | Does the paper critically integrate the literature needed for its question, alternatives, and contribution? |
| Significance & Impact | Do the claimed implications follow from the evidence and matter for the stated audience? |

For each applicable dimension, use `EXCEEDS`, `MEETS`, `PARTLY_MEETS`, `DOES_NOT_MEET`, or `NOT_ASSESSED`, together with a criterion source, evidence anchors, rationale, uncertainty, and decision-bearing explanation. These labels are local to the named criterion and must not be converted to points, totals, or rankings.

## 2. Paper Type-Specific Criteria

### 2.1 Empirical Research

| Additional criterion | Review focus |
|---|---|
| Research hypothesis clarity | Are hypotheses testable and consistent with the stated theory? |
| Variable operational definitions | Are variables or constructs defined and measured precisely? |
| Internal validity | Are plausible confounds and alternative explanations addressed? |
| External validity | Is the claimed scope of generalization supported? |
| Statistical reporting completeness | Are effect sizes, uncertainty, assumptions, and exclusions reported as required? |
| Conclusion conservatism | Do conclusions stay within what the design and data support? |

### 2.2 Theoretical/Conceptual Paper

| Additional criterion | Review focus |
|---|---|
| Conceptual definition precision | Are core concepts clearly delineated? |
| Argument logic structure | Is the premise-to-inference-to-conclusion chain complete? |
| Counterargument handling | Are material alternatives considered and answered? |
| Theoretical novelty | Does the paper advance theoretical understanding rather than merely rename it? |
| Testability | Can the theory generate discriminating propositions or implications? |

### 2.3 Literature Review / Meta-analysis

| Additional criterion | Review focus |
|---|---|
| Search strategy | Is it sufficiently comprehensive and reproducible for the stated review type? |
| Inclusion/exclusion criteria | Are criteria clear, justified, and consistently applied? |
| Risk-of-bias assessment | Is the quality or bias risk of included studies assessed appropriately? |
| Heterogeneity handling | Is statistical and conceptual heterogeneity handled appropriately? |
| Synthesis method | Does the method support the synthesis and conclusions? |
| Publication bias | Is publication bias assessed and discussed where applicable? |

### 2.4 Case Study

| Additional criterion | Review focus |
|---|---|
| Case selection justification | Why was this case chosen, and what can it illuminate? |
| Sampling logic | Is case selection theoretically or analytically grounded? |
| Triangulation | Are evidence sources sufficient for the claims made? |
| Contextual detail | Is the context described well enough to interpret the case? |
| Transferability | Are claims beyond the case bounded and justified? |
| Researcher reflexivity | Is the researcher's relationship with the case addressed where relevant? |

### 2.5 Policy Analysis / Policy Brief

| Additional criterion | Review focus |
|---|---|
| Policy problem definition | Is the problem clearly defined and evidence-supported? |
| Stakeholder analysis | Are relevant stakeholders and interests represented? |
| Policy option analysis | Are viable alternatives compared on explicit criteria? |
| Feasibility assessment | Are implementation constraints and trade-offs addressed? |
| Evidence quality | Are recommendations supported by fit-for-purpose evidence? |
| Unintended consequences | Are material adverse or distributional effects considered? |

## 3. Common Review Pitfalls

| Pitfall | Corrective discipline |
|---|---|
| Hypercriticism | Acknowledge genuine strengths, distinguish decision-bearing findings from copyediting, and avoid finding quotas. |
| Confirmation bias | Seek disconfirming evidence and plausible alternative interpretations. |
| Preference projection | Ask whether the author's method answers the question, not whether it is the reviewer's preferred method. |
| Paradigm bias | Apply criteria appropriate to the paper's research paradigm and article type. |
| Prestige bias | Evaluate the manuscript evidence, not institutional or author status. |
| Novelty bias | Judge the contribution claimed; replication and boundary tests can be valuable. |
| Length bias | Evaluate evidence and argument coverage, not page count or reference count. |
| Language discrimination | Separate problems of meaning from non-native phrasing or surface polish. |

### Principles of constructive feedback

1. Be specific: identify what is wrong and where.
2. Explain why the issue matters to a named criterion.
3. Propose a proportionate, feasible remedy when one exists.
4. Distinguish required revisions from optional suggestions.
5. State uncertainty and reviewer-scope limits.

## 4. Judgement synthesis

Do not aggregate dimension judgements numerically. The synthesis should identify which criteria are positively verified, which remain unresolved, whether each weakness is repairable, and how those particular findings support the recommendation under `editorial_decision_standards.md` or the active sprint contract. A decision-bearing failure cannot be cancelled by strengths elsewhere, and reviewer disagreement must remain visible rather than being averaged away.
