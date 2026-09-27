## 项目状态恢复报告

### 项目身份
这是 **ResearchSpec dogfooding 的合成测试夹具**，主题"生成式 AI 对高校写作教学的影响"，全部 `SYN-*` 资料是离线合成，不联网，不当作真实引用（见 `benchmark/README.md`）。

### 已完成
- 工作区已初始化（schema v2），位于 `[workspace]/researchspec`
- 一条活跃 run：`run-3b7719aea75f41b9de9cb81b`
  - profile：`academic-pipeline`（end-to-end）
  - 状态：`active`，已由 `synthetic-fixture-user` 确认启动
  - 已定义完整图谱：research → research-gate → write → write-gate → review → review-gate → revision → re-review → round-outcome → format → final-integrity → final-integrity-gate
  - 已执行节点数：**0**
- benchmark 夹具材料齐全：`goal.md`、`sources.yaml`（4 个 SYN 源）、`claims.yaml`（3 条 CLM）、`partial-manuscript.md`、`review-comments.md`、`revision-context.md`

### 阻塞
- **stable_specs 全为空**：`specs/sources.yaml`、`specs/claims.yaml` 都是 0 条；`specs/project.md` 只有空标题；`specs/manuscript.yaml` 所有字段 null（working_title/audience/venue/outline 均未填）
- 也就是说：run 已开，但上游 spec 从未被填充；下一步 `research` 子图没有可用输入
- `nodes/` 目录为空，没有任何已产出的节点产物
- `handoff.md` 只有 envelope，没有正文内容
- 文档漂移：benchmark 里是 "review-cycle" 阶段材料（已有 partial manuscript + review comments），但 run 走的是 end-to-end 整图；当前处于 run 开头，与已有 review 材料的衔接不明确

### 下一步（来自 CLI 状态）
`frontier` 为空，`pending_subgraph_starts` 唯一项：

```
node:run-3b7719aea75f41b9de9cb81b/research
```

合法做法（按 Navigate 规则）：
1. `researchspec instructions node:run-3b7719aea75f41b9de9cb81b/research --json` 取执行契约
2. 在执行前先决定：**是否先把 `benchmark/` 中的合成 sources / claims / partial-manuscript 灌入 `researchspec/specs/`**，否则 `research` 子图无可用输入
3. 若要继续，建议改走 `academic-pipeline:mid-entry` 的 `revision` 入口（已有 partial manuscript + review comments + revision-context），跳过空 spec 的 research→write 阶段
4. 任何入口变更或 spec 写入都属敏感动作，需要你点头

→ 想从哪条路继续：(a) 灌入 specs 再走 end-to-end 的 research 节点，(b) 改走 mid-entry 的 revision 节点利用已有 review-cycle 材料，(c) 其他？
