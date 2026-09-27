I'll inspect the workspace to reconstruct the project state without touching previous chat.

---

The exec sandbox has no Node. Let me use shell.

---

下面是 workspace 当前状态的还原（仅依据文件、CLI 输出，不参考任何前序对话）。

## 已完成

- Workspace 已初始化为 ResearchSpec schema `"2"`：路径 `[workspace]/researchspec`，`config.yaml` 已写入 `agent_tools: codex`，无插件、无 literature adapter。
- 唯一的 Run `run-7a43d4744911b83348a7dad6` 已 `start_confirmation` 并处于 `active`，profile `academic-pipeline:end-to-end`，formal gates 列表为 `research-gate / write-gate / review-gate / final-integrity-gate`，预期产出 `submission_package` + `process_summary`。
- 启动时随 Run 冻结的 `graph.yaml` 已落盘，子图分别绑到 `research-main / academic-paper / academic-paper-reviewer / review-response / academic-paper-format`，并定义了 `revision-outcome` 的 `continue`/`complete` 分支。
- `benchmark/` 目录里备齐了一份合成 dogfooding fixture（`goal.md`、`sources.yaml`、`claims.yaml`、`partial-manuscript.md`、`review-comments.md`、`revision-context.md`、`README.md`），统一主题“生成式 AI 对高校写作教学的影响”，全部 `SYN-*` ID 均为离线测试用、非真实引用。

## 未完成 / 阻塞

CLI `status --json` 报告 `diagnostics_summary: {blocking: 0, warning: 0}`，**没有真正的运行时阻塞**。但结构性空缺有三处：

1. Stable specs 实质为空：`researchspec/specs/project.md` 没有研究问题、scope、method stance、expected contribution；`sources.yaml` `claims.yaml` 各为 0 条；`manuscript.yaml` 的 `working_title/outline/format_requirements` 都是 null。这意味着 research 子图即便激活，也没有可消费的 intent 输入。
2. 合成素材只停留在 `benchmark/`，没有被吸收到 `researchspec/specs/`，二者的边界还没有桥接。
3. `run.yaml` 中 `handoff.md` 引用了 `work/historical-submission_package.zip` 和 `work/historical-process_summary.md`，但项目里根本没有 `work/` 目录，也没有节点产出过任何文件；那是“终点形态”的占位，不是历史成果。

`runs[run-7a43d4744911b83348a7dad6].nodes` 为空、没有任何 `advance` 历史；`frontier` 为空；`pending_gates` / `pending_decisions` 也都为空。

## 下一步（按 Navigate 与状态机）

1. 把 `benchmark/` 中的 fixture 沉淀为 stable specs：补齐 `project.md`（至少钉死研究问题、scope、method stance、expected contribution），把 `benchmark/sources.yaml` → `researchspec/specs/sources.yaml`、`benchmark/claims.yaml` → `researchspec/specs/claims.yaml`、`benchmark/partial-manuscript.md` → `researchspec/specs/manuscript.yaml` 的 outline/title。这一步是直接编辑 stable specs，无需 CLI mutation。
2. 激活 research 子图：`researchspec instructions node:run-7a43d4744911b83348a7dad6/research --json` 已经返回 `eligible: true`，可直接产出 `research_report / annotated_bibliography / synthesis_report` 三份边界交付物，然后 `researchspec advance node:run-7a43d4744911b83348a7dad6/research`。
3. 之后依 graph 顺序：research-gate（人工 verdict）→ write → write-gate → review → review-gate → revision/review 循环（`revision-outcome` Decision决定 continue/complete）→ format → final-integrity → final-integrity-gate。
4. 是否启用 `curriculum-and-pedagogy` / `specialist-studies-in-education` 等领域插件，是独立于 run 确认的 plugin consent，建议在写节点之前单独征求一次意见。

要不要我现在就执行第 1 步（把 `benchmark/` 的合成素材落到 stable specs），并把第 2 步的 research 子图指令摆出来等你拍板？还是你先要我把 `benchmark/README.md` 的 fixture 边界再核一遍？
