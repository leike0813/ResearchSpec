确认上次会话的进展。当前状态：

- **已完成**：读了 `benchmark/partial-manuscript.md`，识别出两个 claim — `CLM-01`（结构化提示与提纲修订可见度相关，单门入门课观察）与 `CLM-02`（"生成式 AI 降低工作量"，原稿已注明证据不支持）。
- **阻塞**：`benchmark/sources.yaml` 不存在。`benchmark/` 目录里只有 `README.md / goal.md / partial-manuscript.md / ordinary-task-note.md`，按 `README.md` 列出的 `partial-manuscript`变体本应同时含 `sources.yaml` 和 `claims.yaml`，但这两份文件都没有落地。同样，`../scenarios.yaml`（README 引用的变体定义）也不存在。
- **范围限制**：所有源料都是合成测试材料，不允许联网检索真实文献或编造效应量、引用、伦理审批；因此在缺少 `sources.yaml` 的情况下，无法把 CLM-01 / CLM-02 与具体来源对应起来，也无从补充原稿已声明的"Missing sections"。
- **下一步**：要么补齐 `benchmark/sources.yaml`（以及按需的 `benchmark/claims.yaml`），要么明确放弃对外部源的核查，只就原稿已有的两条 claim 强度进行内部一致性陈述。

把以上状态写回任务笔记，避免下次又被同一阻塞卡住：

---

任务笔记已更新，记录了这次会话发现的阻塞。

**现状**

- 笔记：`work/researchspec-notes/writing-evidence.md`
- 已识别 claim：`CLM-01`（结构化提示与提纲修订可见度，单课观察，非因果）/ `CLM-02`（"降低工作量"，原稿自标证据不支持）
- 阻塞：`benchmark/sources.yaml`（及 `benchmark/claims.yaml`）缺失；`researchspec status --json` 也确认 `sources: 0, claims: 0`，无相关 run
- 没有启动 graph、没有新建 run、没有写合成文件——按规则在没有源料的情况下不能编造支撑或反驳

**问1**：能否补齐 `benchmark/sources.yaml`（和可选的 `benchmark/claims.yaml`）？补上后我可以继续把每个 claim 与具体 source id 对齐，写一份普通的 synthesis 文件。

**问 2**：如果这两份文件不会补齐，请确认改走"仅做内部一致性陈述"路线——即只就原稿已声明的 CLM-01 / CLM-02 强度给出观察/推断/未知的三段划分，不引用任何外部源。
