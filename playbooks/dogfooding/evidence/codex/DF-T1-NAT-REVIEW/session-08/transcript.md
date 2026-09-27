我已读取 `benchmark/` 下全部材料（review-comments、partial-manuscript、revision-context、claims、sources）。`revision-context.md` 已明确作者立场，我据此处理；不擅自扩大修订范围，也不补造数据、引用或伦理审批。

## 逐条审稿意见处理说明

所有 4 条 major 与 2 条 minor 均需修改；处理方式已在 `revision-context.md` 中预设。

| # | 类型 | 意见要点 | 处理方式 |
|---|------|---------|----------|
| 1 | Major | Findings 前需声明证据为本地、合成 | Introduction 开头新增 disclosure 段落 |
| 2 | Major | `CLM-02` 强度过高 | 改写为「快速反馈 vs. 验证负担」的 trade-off 表述，去掉因果词；若仍偏强，可降级或整句删除 |
| 3 | Major | `CLM-03` 未经直接检验 | 保留政策清晰度观点，但重述为未来研究假设，去除因果措辞，保留 `CLM-03` ID 以便溯源 |
| 4 | Major | 缺 Methods 与因果不可行说明 | 新增 Methods 节，说明 4 个来源（`SYN-CLASSROOM-01/-INTERVIEW-02/-SURVEY-03/-POLICY-04`）的选择与为何不可因果推断 |
| 5 | Minor | "AI-assisted feedback" 与 "generative AI feedback" 混用 | 全稿统一为 "AI-assisted feedback" |
| 6 | Minor | Limitations 应在 Conclusion 也可见 | 在 Conclusion 增加 limitations 复述，不只放在 Methods |

约束：
- 不补造参与者、效应量、引用、伦理审批；
- 保持 `CLM-01/02/03` 编号以便审稿对照；
- 不引入 `revision-context.md` 未授权的新 claim。

---

## 给审稿人的回复（Draft Response Letter）

> Manuscript 语言为英文，回复沿用英文以保持学术惯例。如需中文版请告知。

---

Dear Editor and Reviewers,

We thank the reviewers for their careful reading of our manuscript. Below we respond point-by-point. The revised manuscript preserves the original claim identifiers (CLM-01, CLM-02, CLM-03) and reflects the scope of the supplied evidence; no new data, participants, or references have been introduced.

**Major comment 1.** *All evidence should be disclosed as local and synthetic before findings are presented.*
We agree. We have added a paragraph at the opening of the Introduction stating that the evidence base is drawn from a single institution and is synthetic, and that the paper therefore aims to surface hypotheses and design constraints rather than generalisable causal claims.

**Major comment 2.** *CLM-02 is too strong.*
We agree. We have rewritten CLM-02 to describe the observed trade-off — faster formative feedback offset by additional verification work — and have removed the unsupported causal wording about workload reduction. The claim is now presented at a level the evidence can sustain; if the revised wording still reads as stronger than the evidence supports, we are open to deleting the sentence outright rather than diluting it further.

**Major comment 3.** *The relationship in CLM-03 is not directly tested by the supplied materials.*
We agree that the supplied evidence does not directly test this relationship. To preserve the underlying observation while honouring the reviewer's concern, we have reframed CLM-03 as a future research hypothesis. The revised text states the hypothesis explicitly and removes causal language. The original claim ID is retained for traceability against the public comment record.

**Major comment 4.** *Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable.*
We have added a Methods section that describes the four sources (SYN-CLASSROOM-01, SYN-INTERVIEW-02, SYN-SURVEY-03, SYN-POLICY-04), the rationale for selecting them, and the specific limitations that preclude causal inference — single-site sampling, no comparison group, self-reported workload, voluntary response bias, and a policy change that coincided with data collection.

**Minor comment — terminology consistency.**
We have unified the manuscript on the term *AI-assisted feedback*. Earlier instances of "generative AI feedback" have been replaced.

**Minor comment — limitations should be visible in the conclusion, not only in methods.*
We agree. The Conclusion now restates the principal limitations (synthetic evidence base, absence of causal inference, single institution) alongside the implications, rather than leaving them solely within Methods.

We thank the reviewers again for their constructive feedback and hope the revised manuscript meets the standard for acceptance. We would be glad to provide further clarification or additional revisions if needed.

Sincerely,
[Author name]

---

skipped: 中英文回复同时输出 — 待确认后补一份；Methods 节正文按本回复措辞展开 — 待确认后落稿。
add when: 用户指明需要中文版，或要求把 Methods 节写成完整段落。
