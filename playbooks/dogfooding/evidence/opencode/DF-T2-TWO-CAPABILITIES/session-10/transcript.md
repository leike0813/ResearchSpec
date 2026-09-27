我先加载 ResearchSpec 的导航技能了解处理流程。

---

我先确认工作区状态，再选择合适的处理路径。

---

我看到 `benchmark/` 目录下已有完整材料（goal、稿件、审稿意见等）。让我先了解项目基准情况和材料内容。

---

我先确认关键事实：material 是合成测试材料、目标 profile 是 `review-response`，用户任务对应 graph 前段（intake → analysis → atomization → comment-coverage-gate）。我拿一下这个 profile 的入口契约。

---

材料梳理清楚了，下面是我准备走的方案，请确认是否启动。

## 识别与映射

**材料性质**（来自 `benchmark/README.md`）：本目录全部为合成测试 fixture（`TEST FIXTURE — NOT REAL`），主题"生成式 AI 对高校写作教学的影响"，fixture变体对应 `review-cycle`（partial-manuscript + review-comments + revision-context）。我**不会联网猜测**这些 `SYN-*` 材料的作者或出处。

**任务 → profile 节点映射**：

| 用户动作 | 对应节点 | 边界产物 |
| --- | --- | --- |
| 整理现有稿件和审稿意见的回复材料 | `intake`（`design-review-response-intake`） | `review_response_workspace`、`intake_report` |
| （稿件结构准备，atomization 的前置） | `manuscript-analysis`（`analysis-review-response-manuscript-analysis`） | `manuscript_structure_summary` |
| 逐条拆分意见 | `comment-atomization`（`transform-review-response-comment-atomization`） | `atomic_comment_list`、`comment_coverage_report` |
| 检查有没有遗漏 | `comment-coverage-gate`（`review-response-comment-coverage`，required formal Gate） | human verdict：`pass` / `pass_with_conditions` / `fail` |

## 执行模式

- **模式**：graph（必要：包含 formal Gate，符合"保存每一步结果"的 audit trail 要求）
- **Profile**：`review-response` v0.1.0
- **Entry**：`full`（entry_node `intake`）
- **冻结图节点数**：11（完整 profile 链路）；**本轮只推进到 `comment-coverage-gate`**，随后停下等您决策（不再自动进入 strategy/round 等后续节点，除非您明确继续）
- **输入**：来自 `benchmark/` 的合成材料（goal / partial-manuscript / claims / sources / review-comments / revision-context），由 `intake` 节点读入

## 每一步保存位置

按 skill规范，boundary deliverables 写在 `researchspec/` 之外的 `work/researchspec-notes/` 与 capability 指定位置；每步推进后我会：
1. 列出 `status --json` 当前 frontier 节点；
2. 执行节点，产出对应 boundary 文件；
3. 简短汇报本步产物路径和下一步动作；
4. **不会**在未拿到您单独 Gate 确认前推进下一节点。

## 需要您的一项确认

按 `review-response` profile 的 `start_input` 协议，启动 root run 需要您对**以上 entry 摘要**一次性确认。确认后我会构造 `start_input` payload 启动 `run` 并推进到 `intake`。

---

请确认是否按以上方案启动 `review-response` profile 的 root run（仅推进到 `comment-coverage-gate` 后停下）。您也可以说明偏好（如换 standalone、扩到 strategy gate 之后、或调整输入材料），我再调整。
