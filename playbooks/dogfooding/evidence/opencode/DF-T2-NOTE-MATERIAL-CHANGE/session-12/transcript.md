继续核查的前提材料缺失，无法直接接着 note 中的步骤执行。

**核查结果**

- `researchspec status --json` 显示 `stable_specs.sources: 0`、`claims: 0`，无 active run。
- `benchmark/` 实际只有 `README.md`、`goal.md`、`partial-manuscript.md`、`ordinary-task-note.md`。
- `benchmark/sources.yaml`、`benchmark/claims.yaml` 均不存在；`SYN-*` 源条目、`CLM-*` claim 定义全文在仓库内都搜不到。
- `partial-manuscript.md` 内只能看到 `CLM-01`（结构化提示 → 可见大纲修订）和 `CLM-02`（"生成式 AI 减少工作量"）两个标签，正文已自行声明 `CLM-02` 不被现有证据支持——但没有 `sources.yaml` / `claims.yaml` 可对照，所谓"已识别需源支撑的论断"也只能基于这两个标签。

**与 note 的差异**

- note 的"输入"列为 `benchmark/sources.yaml`，该文件不在仓库。
- note 的"下一步"前提（对照 `benchmark/sources.yaml` 写 synthesis）无法在不存在的文件上完成。

**询问**

合成材料里 `sources.yaml`、`claims.yaml` 本应是 partial-manuscript 变体的标准部件，但当前 fixture 缺失。请确认下一步：

1. 期望我按 `benchmark/README.md` 的变体规范，补出最简的 `sources.yaml` / `claims.yaml` 占位（沿用 `SYN-*`、`CLM-*` 命名，不编造真实数据），再据其完成论断核查？
2. 还是只依据 `partial-manuscript.md` 中两个 `CLM-*` 标签的现有陈述 + `goal.md` 约束，给出一份说明"无可对照源"的核查纪要？
3. 其它意图（例如期望切换到某个 ResearchSpec 流程或找回上一会话真正落盘的材料）？
