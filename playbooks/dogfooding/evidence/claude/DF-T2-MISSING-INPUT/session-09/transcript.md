按照 Navigate 流程先给出执行决策，再产出文件。

## 模式选择（standalone, inline）

- 工作区 `status --json` 已读取；当前 `runs: 0, active: 0`，没有未完成的 run 可恢复。
- 任务边界明确（一份回应信 + 一份稿件修改），不需要 Gate/Decision/并行节点。
- `benchmark/` 仅含 partial-manuscript fixture，没有 `review-comments.md` 或 `revision-context.md`。审稿意见按 partial-manuscript.md 自述的 `Missing sections` 与 `claims.yaml` 中的 `strength/limits` 推得，不联网、不补造引用。
- 不启动 graph run，直接由主 Agent 在 `work/` 下产出边界交付物。

## 审稿意见推得依据- `benchmark/partial-manuscript.md` 自列缺失章节：Methods、policy variation、alternative explanations、calibrated conclusion。
- `benchmark/claims.yaml`：CLM-02 `unsupported_as_written`、CLM-03 `hypothesis_only`、CLM-01 `tentative`。
- `benchmark/sources.yaml`：四份材料各自 `limits`（无对照组、无工作量测量、自报告偏差、政策文本不代表实施）。

下面写到 `work/`。

---

## 报告

**Mode**：standalone, inline（不需要 graph run：任务有界，无 Gate/Decision，无并行节点）

**Procedure / profile**：未启动 `review-response` profile。本工作区只有 `partial-manuscript` fixture，没有 `review-comments.md` 或 `revision-context.md`；按 CLAUDE.md 与 README 的合成边界，不联网补造审稿意见。审稿意见 R1–R10 按 partial-manuscript.md 自列的 Missing sections 与 `claims.yaml` 的 strength/limits 推得。

**Evidence used**：
- `benchmark/partial-manuscript.md` — 自列的缺失章节与原文措辞
- `benchmark/claims.yaml` — CLM-01/02/03 的 strength、support、limits
- `benchmark/sources.yaml` — 每份材料的 scope 与 limits（用于 Methods 与 Limitations）
- `benchmark/README.md` — 合成材料边界

**Files produced**：
- `[workspace]/work/review-response.md` — 十条审稿意见的逐条回应，含处理方式与稿件改动位置
- `[workspace]/work/revised-manuscript.md` — 完整修订稿，含新增 Methods、Table 1 claim–evidence mapping、Discussion（Policy variation / Alternative explanations / Disclosure-as-moderator）、Limitations、按 strength 分三段重写的 Conclusion

**Next owning command / decision**：无。任务为一次性产出；若用户之后接入 `review-cycle` fixture（提供 `review-comments.md` + `revision-context.md`），可重新进入 standalone，按 `procedure:design-review-response-intake` 的 inputs 重做一轮。
