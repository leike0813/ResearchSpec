# Review Response Package

> 与 `benchmark/review-comments.md`、`benchmark/partial-manuscript.md`、`benchmark/claims.yaml`、`benchmark/sources.yaml`、`benchmark/revision-context.md` 配套。
> 全文遵循合成证据边界，不补造数据、引用或伦理审批。

## 1. Comment-by-comment action map

### Major comments

| # | 审稿意见 | 是否需修改 | 拟办（对应稿件位置） | 证据 / 边界 |
|---|---|---|---|---|
| 1 | 在呈现发现前明确说明所有证据均为本地、合成材料 | 是 | 在 "Preliminary findings" 之前新增 1 段来源说明，标注证据来自单一机构、四份合成来源、未通过 IRB 或同行评议 | 与 `sources.yaml` 全部条目的 `scope`、`limits` 一致；不引入新事实 |
| 2 | `CLM-02` 表述过强，需改为反映"反馈加速 vs 核实工作量"的权衡，或删除 | 是（修订，不删除） | 重写 `CLM-02` 的措辞为 "Instructor self-reports describe a trade-off between faster formative feedback and additional verification work; we cannot infer a net workload reduction from the supplied evidence."；在正文 Preliminary findings 与结论中均替换原句；`claims.yaml` 中 `CLM-02.strength` 由 `unsupported_as_written` 改为 `tentative`，并补充 `limits` | 与 `SYN-INTERVIEW-02` 的 `limits`（self-reported workload；no time logs）一致 |
| 3 | `CLM-03` 的关系未被直接检验，应作为未来研究假设 | 是（保留观点、改为假设措辞） | 将 `CLM-03` 在正文与结论中的措辞由"披露清晰度与学生不确定性减少相关"改为 "The available materials do not directly compare policy clarity with student uncertainty; we treat this relationship as a hypothesis for future research."；将 `claims.yaml` 中 `strength` 保持 `hypothesis_only` 并新增 `relation_to_evidence: not_directly_tested` | 与 `SYN-SURVEY-03`（态度而非行为）与 `SYN-POLICY-04`（仅文本，不反映实施）的局限一致 |
| 4 | 增加 Methods 一节，说明四份来源的选取及为何无法做因果推断 | 是 | 在 Introduction 与 Preliminary findings 之间新增 "Methods and evidence" 一节，包含：(a) 来源类型与覆盖范围；(b) 选取标准 = 仅使用提供的合成材料，不补充外部文献；(c) 不可因果推断的理由 = 无对照组、无前测、无随机化、自报告与文本证据 | 严格使用 `sources.yaml` 四条；不引入未列出的来源 |

### Minor comments

| # | 审稿意见 | 是否需修改 | 拟办 |
|---|---|---|---|
| M1 | "AI-assisted feedback" 与 "generative AI feedback" 术语不一致 | 是 | 全文统一使用 "generative AI feedback"；"AI-assisted" 仅在直接引用 `SYN-POLICY-04` 原文时保留 |
| M2 | 局限性应在结论中可见，不仅在方法部分 | 是 | 在结论末新增 "Limitations" 段，复述：单机构、四周–六周观察窗、自报告、合成材料；与 Methods 段不重复细节，仅作可见提示 |

### Comments recorded for transparency

- 审稿人未要求、本次回复亦未改动：Discussion of policy variation（已部分并入 Methods）；Alternative explanations（已并入 Limitations）。

## 2. Draft response letter

> **Response to reviewers — manuscript "Generative AI in University Writing Instruction: Opportunities, Friction, and Evidence Limits"**
>
> 编辑与各位审稿人：
>
> 感谢细致的评审意见。我们已对稿件作出 Major revision 级别的修改，全部回应如下。修改后的稿件中，证据来源限定在四份提供的合成材料；任何超出该范围的内容均已删除或改为假设性表述。
>
> ---
>
> **Response to Major Comment 1**
>
> *Reviewer:* "The manuscript should state that all evidence is local and synthetic before presenting findings."
>
> *Action:* Accepted. We added a source-disclosure paragraph immediately before "Preliminary findings" (see new section "Sources and evidence scope"). The paragraph explicitly states that all four sources are local, synthetic, and provided as part of the manuscript package; no external literature, no participant identifiers, and no effect sizes have been introduced.
>
> ---
>
> **Response to Major Comment 2**
>
> *Reviewer:* "`CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it."
>
> *Action:* Accepted; revised rather than removed. We rephrased `CLM-02` to: "Instructor self-reports describe a trade-off between faster formative feedback and additional verification work; we cannot infer a net workload reduction from the supplied evidence." This wording now appears (a) in the claim itself, (b) in the Preliminary findings paragraph, and (c) in the Limitations paragraph of the conclusion. We correspondingly updated `claims.yaml` (`strength: tentative`, expanded `limits`).
>
> ---
>
> **Response to Major Comment 3**
>
> *Reviewer:* "The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis."
>
> *Action:* Accepted. We preserved the policy-clarity observation but removed the causal/comparative wording. `CLM-03` now reads: "The available materials do not directly compare policy clarity with student uncertainty; we treat this relationship as a hypothesis for future research." The body and conclusion have been updated to use "hypothesis" rather than "association," and we added `relation_to_evidence: not_directly_tested` to the claim record.
>
> ---
>
> **Response to Major Comment 4**
>
> *Reviewer:* "Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable."
>
> *Action:* Accepted. We inserted a new "Methods and evidence" section between Introduction and Preliminary findings. It covers: (i) source types and scope, taken verbatim from the source list; (ii) selection criterion = only the four provided synthetic sources are used; (iii) reasons causal inference is unavailable (no control group, no pre-test, no randomization, reliance on self-reports and on policy text rather than implementation data). No new sources, populations, or analyses have been added.
>
> ---
>
> **Response to Minor Comment M1**
>
> *Reviewer:* "Use consistent terms for 'AI-assisted feedback' and 'generative AI feedback'."
>
> *Action:* Accepted. We standardized on "generative AI feedback" throughout the manuscript. "AI-assisted" is retained only where it appears in the quoted text of `SYN-POLICY-04`.
>
> ---
>
> **Response to Minor Comment M2**
>
> *Reviewer:* "Make the limitations visible in the conclusion, not only in methods."
>
> *Action:* Accepted. A short Limitations paragraph has been added at the end of the conclusion, restating the four boundary conditions (single institution, four–six-week observation window, self-reports, synthetic material) without duplicating the methodological detail.
>
> ---
>
> **Summary of what changed**
>
> - Two new sections: "Sources and evidence scope" and "Methods and evidence".
> - Two revised claims: `CLM-02` (tentative, trade-off framing) and `CLM-03` (hypothesis framing, no causal wording).
> - One terminology standardization pass.
> - One added Limitations paragraph in the conclusion.
>
> **What remains limited**
>
> Even after revision, the manuscript is bounded by the supplied evidence. We have not inferred cross-institution effects, individual writing-quality gains, or workload reductions, and we have not added comparisons, effect sizes, or participant-level data. The policy-clarity hypothesis (`CLM-03`) is preserved as a research question, not as a finding.
>
> We thank the reviewers again for their constructive comments and hope the revised manuscript meets the criteria for acceptance.