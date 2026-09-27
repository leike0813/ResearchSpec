已将逐条回复起草至 `benchmark/response-to-reviewers.md`。

要点：

- **4 条 major comment 逐条回应**：分别给出处置结论（Agreed / Agreed with reframing / Agreed in part）+ 具体修改动作 + 改动落点（章节、措辞、strength label）。
- **Comment 1**：证据在 *Findings* 开头显式标注为 local & synthetic，并移入 abstract。
- **Comment 2**：`CLM-02` 从单边 "reduces workload" 改写为对称 trade-off，strength 由 `unsupported_as_written` 降为 `tentative_trade_off`；保留而非删除，理由是 trade-off 本身是有用的设计约束。
- **Comment 3**：按用户在 `revision-context.md` 中已声明的偏好，保留政策清晰度思路但降级为 `hypothesis_only`（H1），移入 *Hypotheses for future work*，删除因果动词并给出可测试设计。
- **Comment 4**：新增 *Methods and evidence limits* 章节，覆盖 source set / selection rationale / causal-inference limits / 统一 strength label 四块；明确未补造任何数据、分析或伦理审批。
- **2 条 minor comment**：术语统一为 "AI-assisted feedback"（"generative AI feedback" 仅在引言等必要处保留），并在 *Conclusion* 开头复述三条最关键限制。
- 末尾附 **What has not changed**（`CLM-01` 与 claim ID 稳定、未新增素材）和 **Summary of changes** 表格，便于审稿人核对。

回复口径与 `revision-context.md`（用户已接受 1、2、4 条，对 3 条按 hypothesis 改写）以及 `claims.yaml`（strength label 同步更新）保持一致，未引入任何超出基准包范围的素材。
