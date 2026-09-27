# Step 02 — 逐条意见拆分

> 每条意见给出：原文 → 涉及的稿件位置 / claim / source → 具体改写动作 → 验收信号。

---

## Major 1 — 全部证据是 local 且 synthetic，结论前需先声明

- **原文**：The manuscript should state that all evidence is local and synthetic before presenting findings.
- **涉及位置**：`partial-manuscript.md` 的 Introduction 末段或 Preliminary findings 段首。
- **涉及 claim / source**：全部（CLM-01/02/03 与 4 条 source）。
- **改写动作**：
  1. 在 Preliminary findings 之前加一段 evidence-scope notice，明示：所有证据来自单一院校、一段有限时间窗口的合成材料；结论不可外推。
  2. 与 `goal.md` 的约束一致——不补造外部数据。
- **验收信号**：读者无需等到 Methods 才能判断证据强弱；CLM-02 的旧因果表述与新警示语不冲突。

---

## Major 2 — CLM-02 太强，改为权衡或删除

- **原文**：`CLM-02` is too strong. Revise it to reflect the trade-off between faster feedback and verification work, or remove it.
- **涉及位置**：`partial-manuscript.md` 的 Preliminary findings；`claims.yaml` 的 CLM-02。
- **涉及 source**：SYN-INTERVIEW-02（其 limits 明示 "No measured workload data"）。
- **改写动作**：
  1. 稿件中保留"faster formative feedback ↔ additional verification time"的权衡表述，删除"workload"作因果结论的措辞。
  2. `claims.yaml` 中 CLM-02：wording 改为"…may shift instructor time between feedback and verification, not reduce total workload"；strength 从 `unsupported_as_written` 改为 `tentative`；limits 保留并增加"self-reported, no time logs"。
- **验收信号**：稿件与 yaml 一致；不出现"reduces workload"作为已确立的结论。

---

## Major 3 — CLM-03 未被直接检验，应作为未来研究 hypothesis

- **原文**：The relationship proposed in `CLM-03` is not directly tested. Treat it as a future research hypothesis.
- **涉及位置**：稿件当前缺失"policy variation / alternative explanations"段；`claims.yaml` 的 CLM-03。
- **涉及 source**：SYN-SURVEY-03（attitudes only、policy 期间变化）、SYN-POLICY-04（policy 不展示 implementation quality）。
- **作者立场**：`revision-context.md` 接受改写为 hypothesis 并保留"policy-clarity idea"。
- **改写动作**：
  1. 新增"Policy variation and uncertainties"小节，讨论 SYN-POLICY-04 的 disclosure 要求与 SYN-SURVEY-03 中学生不确定性的并列观察，但**不做因果关联**。
  2. 末尾以 hypothesis 形式提出：policy clarity 与学生不确定性的关系值得后续直接检验；明示"未在本证据集中检验"。
  3. `claims.yaml` CLM-03：wording 改为"Clear disclosure guidance *may* reduce student uncertainty about acceptable AI use; this hypothesis is not directly tested in the supplied evidence."；strength 保持 `hypothesis_only` 并在 limits 追加"未做政策清晰度与不确定性的对照测量"。
- **验收信号**：稿件出现该 hypothesis 表述；任何地方不再把 CLM-03 当作已观察到的关系。

---

## Major 4 — 增加 Methods 节，说明四来源如何选取、为何不能因果推断

- **原文**：Add a methods section explaining how the four supplied sources were selected and why causal inference is unavailable.
- **涉及位置**：稿件当前缺失整段 Methods。
- **涉及材料**：`sources.yaml`（4 条来源）；`goal.md`（约束清单）。
- **改写动作**：
  1. 新增 Methods 节，含三块：
     - 来源与选择理由：四条来源是合成证据集中预定义的，并非通过系统检索获得；列出每条的 kind 与 scope。
     - 证据强度评估：每条 source 的 limits（无对照组、无时间日志、志愿样本、政策文本 ≠ 实施质量等）。
     - 因果推断不可行的原因：单点观察、无对照、policy 与调查同时变化、自我报告等。
- **验收信号**：Methods 节存在并被 Preliminary findings 与 CLM-02/03 的弱化表述引用；与意见 1 的 evidence-scope notice 形成"前置警示 + 后置方法说明"的双层结构。

---

## Minor 1 — 统一"AI-assisted feedback" / "generative AI feedback" 用语

- **涉及位置**：稿件全文。
- **改写动作**：选一个术语（推荐 "AI-assisted feedback"），全文替换；abstract/intro 不出现两词混用。
- **验收信号**：rg 检索两个词，只剩选定那一个；另一词不再出现。

---

## Minor 2 — 局限性也要在 Conclusion 处可见

- **涉及位置**：当前缺失 Conclusion（属于 Missing sections）。
- **改写动作**：在新增 Conclusion 中复述至少两条关键限制：证据全为 local & synthetic；CLM-03 仍为 hypothesis；不在 Methods 之外再次堆细节。
- **验收信号**：Conclusion 不写"future work"清单来回避局限性；限制以陈述句出现而非"however"转折式辩护。

---

## 编辑决定（Editorial: Major revision）的整体影响

- 不重做研究设计；
- 不新增 source；
- 唯一允许的新增节：Methods、Policy variation / alternative explanations、Conclusion；
- 任何超出上述范围的扩展都需先回到 `goal.md` 约束确认。
