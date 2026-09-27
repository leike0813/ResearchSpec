正在恢复上次会话的状态。当前进度盘点和阻塞项：

**已知状态**（与上次笔记一致）
- `work/researchspec-notes/writing-evidence.md` 已放置，相关 run: none，无活动 graph。
- `researchspec status --json`：0 sources / 0 claims / 0 runs，没有 frontier。
- 工作流模式应为 standalone（无 Gate / Decision / 子 run）。

**阻塞项**
- 上次笔记的"下一步"是"按 `benchmark/sources.yaml` 检查 claim，再写 synthesis"。
- `benchmark/`目录中只有 `README.md`、`goal.md`、`ordinary-task-note.md`、`partial-manuscript.md`。
- **缺失**：`benchmark/sources.yaml` 和 `benchmark/claims.yaml`（`scenarios.yaml` 也不在）。
- 没有真实源数据 → 没法按原计划做证据核查；`CLM-01` / `CLM-02` 只有 ID，没有可对照的来源条目或定义。

按 AGENTS.md / Navigate 的约定，这种"输入材料缺失"会改变任务必要输入和下一步，必须先向用户确认，不能自行编造源或编造 evidence。

---

上次任务的输入材料 `benchmark/sources.yaml` 和 `benchmark/claims.yaml` 当前在 benchmark/ 目录里缺失（只有 README / goal / ordinary-task-note / partial-manuscript 四份）。你想怎么处理？
- 你来补上 sources.yaml / claims.yaml（或者告诉我正确路径），我再按原计划做证据核查并产出 synthesis。
- 不补材料。我基于现有 partial-manuscript.md 与 README/goal 写一份 synthesis，明确标注'无源数据、未做 evidence verification'，不编造任何来源或 claim 强度。
- 暂停。仅在 writing-evidence.md 末尾追加一条 'Blocked: sources.yaml 与 claims.yaml 缺失'，等材料到位再继续。

---

已发出阻塞说明与选项，等待你的回复再继续。
