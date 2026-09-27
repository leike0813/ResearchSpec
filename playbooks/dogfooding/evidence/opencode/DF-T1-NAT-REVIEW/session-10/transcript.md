下面逐条回应，并在最后附给审稿人的回复草稿。判断依据来自 `benchmark/review-comments.md`、`claims.yaml`、`sources.yaml`、`goal.md` 以及 `revision-context.md` 中已记录的作者预设（接受 1、2、4，对 3 保留想法但改为假设）。下文不直接改动 `partial-manuscript.md`，待你确认后再落稿。

## 一、逐条意见的处理建议

| # | 意见 | 决定 | 在稿件中的落点 | 关键改动 |
|---|---|---|---|---|
| 1 | 呈现研究结果前声明证据是本地的、合成的 |接受 | 新增小节 "Evidence scope"（置于 "Preliminary findings" 之前） | 写明四份来源均为本组合成材料，非外部抽样；不补造参与者、效应量或引用 |
| 2 | `CLM-02` 措辞过强 | 接受，保留 ID，改为反映权衡 | "Preliminary findings" 中 `CLM-02` 句 + `claims.yaml` | 删去"reduces workload"；改为"interview summaries suggest faster formative feedback alongside additional verification work, with no net workload claim supported" |
| 3 | `CLM-03` 关系未直接测试 | 部分接受：保留政策清晰度想法，移除因果措辞 | "Preliminary findings" 中 `CLM-03` 句 + `claims.yaml` | 改为"a hypothesis for future research that clearer disclosure guidance may be associated with fewer student uncertainties"; `strength: hypothesis_only` 在文中显式声明 |
| 4 | 补充方法学部分 | 接受 | 新增 "Methods and evidence selection" | 列四个 `SYN-*` 来源及其类型/范围/limit；说明因果推断不可用的具体原因（无对照组、无写作质量度量、无时间日志、自选样本） |
| 5（minor） | 统一术语 | 接受 | 全文 |选 "AI-assisted feedback" 作为主词，首次出现处注明与 "generative AI feedback" 同义 |
| 6（minor） | 在结论中也显式呈现局限 | 接受 | "Conclusion" 段落（目前缺失，需新增） | 重申本地合成性质、未解决的不确定性（替代解释、政策异质性）、未来研究方向 |

未引入任何新数据、新来源、新分析或伦理审查状态——所有改动限定在措辞、结构与范围声明。

## 二、与每条意见挂钩的修订路线图

1. `partial-manuscript.md` 新增 "Evidence scope" 小节 → 回应意见 1、6。
2. `partial-manuscript.md` 新增 "Methods and evidence selection" 小节 → 回应意见 4。
3. `partial-manuscript.md` 改写 `CLM-02` 句子 → 回应意见 2。
4. `partial-manuscript.md` 改写 `CLM-03` 句子，删除任何因果性动词（"is associated with" 改为 "warrants future testing as a hypothesis"）→ 回应意见 3。
5. `partial-manuscript.md` 新增 "Conclusion" 小节 → 回应意见 6，同时承载 "Missing sections" 中的 "Conclusion calibrated to the supplied evidence"。
6. `claims.yaml` 中 `CLM-02.wording` 与 `CLM-03.wording` 同步更新，保持 claim ID 稳定。
7. 全文统一术语为 "AI-assisted feedback"，首次出现处加括号注 → 回应意见 5。

## 三、给审稿人的回复草稿

> Dear Editor and Reviewers,
>
> Thank you for the careful reading. Below we address each comment and summarise the corresponding changes. We note at the outset that the manuscript analyses a small, **local, synthetic** evidence set provided as a fixed corpus; the revision makes this scope explicit and recasts claims that went beyond the supplied evidence.
>
> **Major comments**
>
> 1. *State that all evidence is local and synthetic before presenting findings.* — Accepted. We added an "Evidence scope" note just before the findings. It states that the four sources are local and synthetic, were not sampled from an external population, and do not support causal inference. The same caveat is restated in the new Methods section and in the Conclusion.
>
> 2. *`CLM-02` is too strong.* — Accepted. We kept the claim ID but rewrote the wording to reflect the trade-off reported in the instructor interviews: faster formative feedback alongside additional verification work, with no net workload claim supported. The revised wording appears in both the findings paragraph and `claims.yaml`; the supporting limits (self-reported workload, no time logs, small convenience sample) remain attached.
>
> 3. *The relationship in `CLM-03` is not directly tested.* — Accepted in substance, with the policy-clarity idea preserved. We rewrote `CLM-03` to remove causal language and explicitly label it as a hypothesis for future research. The claim ID is unchanged, and the manuscript now states that the supplied materials do not directly compare policy clarity with student uncertainty.
>
> 4. *Add a methods section explaining source selection and why causal inference is unavailable.* — Accepted. We added "Methods and evidence selection", which names the four sources (`SYN-CLASSROOM-01`, `SYN-INTERVIEW-02`, `SYN-SURVEY-03`, `SYN-POLICY-04`), describes their kinds and scopes, and explains why causal inference is unavailable: no comparison group, no validated writing-quality measure, no time logs, and voluntary response bias. The section also notes that no new participants, effect sizes, citations, or ethics-approval status were introduced.
>
> **Minor comments**
>
> - *Consistent terminology.* — Accepted. We standardised on "AI-assisted feedback" throughout, with a parenthetical note at first use that the term is equivalent to "generative AI feedback" in this manuscript.
> - *Limitations visible in the conclusion.* — Accepted. The new Conclusion restates the local-synthetic scope, lists unresolved questions (alternative explanations, policy heterogeneity across institutions), and points to follow-up work without overstating the current evidence.
>
> No new data, sources, analyses, or ethics-approval status have been added. The revisions are limited to wording, structure, and explicit scoping of the existing materials, consistent with the research goal of distinguishing observation, interpretation, and unknowns.
>
> Sincerely,
> [Authors]

---

下一步建议：你确认上述处理后，我再据此改写 `partial-manuscript.md` 与 `claims.yaml`，并把回复另存为 `benchmark/response-letter.md`。如对意见 2（保留 vs 删除 `CLM-02`）或意见 3 的具体假设措辞有偏好，告诉我即可调整。
