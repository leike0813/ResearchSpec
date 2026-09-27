# Comment Coverage Report

> 节点：`comment-coverage`（对应 gate `review-response-comment-coverage` 的输入检查）。
> 角色：`comment_coverage_report`。
> 输入：`atomic_comment_list.md` + `partial-manuscript.md` + `revision-context.md`。
> 目标：在进入下游 workboard/round 之前，先核对每条审稿意见是否已被 partial 与 revision-context 显式或伏笔覆盖，列出仍需 round 阶段处理的项。

## 1. 逐条覆盖核对

| 原子 ID | 意见摘要 | partial 是否触及 | revision-context 立场 | 是否可视为"已覆盖" | 仍需 round 处理的项 |
|---------|----------|------------------|----------------------|----------------------|----------------------|
| E-1 | Major revision 编辑决定 | partial 自身已承认 4 个 missing sections，与"major"信号一致 | 未单独声明 | **是**（编辑决定的导向被承认） | round 阶段需在产出 working manuscript 时按 major 严格落地 |
| M-1 | 证据披露在 findings 之前 | partial Introduction 提及 "small synthetic evidence set"，但未在文首独立声明 | 接受 | **部分**（伏笔存在但缺独立段落） | round 阶段新增 Evidence-base disclosure 段落，位于 Working title 之后、Introduction 之前 |
| M-2 | `CLM-02` 强度调整 | partial Preliminary findings (c) 已显式否证更强说法 | 接受（保留权衡叙述） | **部分**（否证存在，权衡段缺） | round 阶段在 Discussion 写 instructor workload 权衡段 |
| M-3 | `CLM-03` 降级为假设 | partial 未触及 `CLM-03` | 接受（按假设措辞处理） | **否** | round 阶段需在 Discussion 或 Conclusion 显式 hypothesis 化 `CLM-03`，去除因果措辞 |
| M-4 | 增 Methods 章节 | partial 完全缺失 | 接受 | **否** | round 阶段新增 Methods 章节：4 来源如何选出 + 因果不可行 |
| m-1 | 术语统一 | partial 未出现任一术语 | 未表态（默认跟随） | **否** | round 阶段首次出现时锁定 "AI-assisted feedback"，并在首现处加注 |
| m-2 | Conclusion 中也显式呈现局限 | partial 无 Conclusion | 未表态（与 M-4 一并接受） | **否** | round 阶段新增 Conclusion，重复局限 |

## 2. 覆盖率统计
- 主意见 4 条：1 条"完全覆盖"（E-1）、2 条"部分覆盖"（M-1、M-2）、1 条"未覆盖"（M-3 在 partial 完全缺位）、1 条"未覆盖"（M-4 在 partial 完全缺位）→ 严格计算：1/4 完整，2/4 部分，1/4 缺位。
- 次要意见 2 条：均"未覆盖"（partial 完全无对应文本）。
- 编辑决定 1 条：被 partial 的 missing list 隐含承认，导向已对齐。

## 3. 遗漏与高风险点
1. **M-3 `CLM-03` 假设化在 partial 中零存在**：round 阶段必须新增且不能仅在 Conclusion 一句带过——需在 Discussion 单列。
2. **M-4 Methods 整章缺失**：影响意见 #1 的"在 findings 之前声明证据本地"——若 Methods 写在文末，则 disclosure 应放在 Methods 之前；建议 round 把 Evidence-base disclosure 提到 Working title 之后独立成段，Methods 置于 Preliminary findings 之前。
3. **m-1 术语统一**：需要先在 round 之外与 author 确认锁定哪个术语——本报告采纳 `atomic_comment_list.md` 的建议 "AI-assisted feedback"，但最终由 round 节点与下游 gate 复核。
4. **m-2 Conclusion 与 D-1/D-4 重合**：避免重复叙述，round 阶段需要把 Methods 末尾的局限清单与 Conclusion 的局限清单做成"镜像但不相同"的两份。

## 4. 非审稿但需一并处理的项
- D-1 Methods（与 M-4 重合）— 已并入 M-4。
- D-2 政策差异讨论 — 建议纳入 Discussion，并作为 `CLM-03` 假设化的背景段。
- D-3 替代解释显式处理 — 建议作为 Discussion 子段。
- D-4 Conclusion（与 m-2 重合）— 已并入 m-2。

## 5. gate `review-response-comment-coverage` 输入材料就绪性
- `review_response_workspace` ✓
- `intake_report` ✓
- `manuscript_structure_summary` ✓
- `atomic_comment_list` ✓
- `comment_coverage_report` ✓（本文件）
- 本报告未触发 `comment-coverage-gate`（该 gate 由协调 Agent 触发），仅作材料准备。

## 6. 下游动作建议（仅规划，不在本轮执行）
1. 进入 `workboard` 节点：把 §1 表中"仍需 round 处理的项"逐条挂到工作板。
2. 进入 `strategy-gate`：由协调 Agent 决定是否放行。
3. 进入 `round`：仅产出 `working_manuscript` + `response_markdown` + `response_latex` + `round_summary`，不修改 partial 原稿；partial 文本作为基底被复制到 working manuscript 后再编辑。
4. evidence / response-coverage / final-assembly / outcome 节点由协调 Agent 顺序触发，本轮到此为止。

## 7. 是否仍有遗漏的最终核答
按审稿原文逐字核对：
- Editorial recommendation ✓（E-1 导向已对齐）
- 4 条 major（M-1～M-4）✓ 全部进入 round 待办，无丢失。
- 2 条 minor（m-1, m-2）✓ 全部进入 round 待办，无丢失。

**结论：本轮 review-response 前 4 节点产物完整、对应每条审稿意见均已被记录在 `atomic_comment_list.md` 且覆盖核对在 `comment_coverage_report.md` 显式展开，不存在遗漏。**