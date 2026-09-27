# Task Note · review-response-prep

> 模式: standalone（未启动 review-response graph run；用户只要求"整理 + 拆分 + 查漏"）
> 入口技能: researchspec-navigate

## 目标

用户原始请求：
"先整理现有稿件和审稿意见的回复材料，再逐条拆分意见并检查有没有遗漏；请保存每一步的结果。"

交付期望：
1. 把现有稿件与审稿回复相关材料固化成结构化清单（intake）。
2. 把审稿意见逐条拆为原子项（comment atomization）。
3. 反向检查是否有被遗漏的对象（coverage check）。
4. 每一步结果独立保存为可读产物。

## 输入

| Role | Path |
| --- | --- |
| `goal_source` | `benchmark/goal.md` |
| `partial_manuscript` | `benchmark/partial-manuscript.md` |
| `claims_source` | `benchmark/claims.yaml` |
| `sources_source` | `benchmark/sources.yaml` |
| `review_comments` | `benchmark/review-comments.md` |
| `revision_context` | `benchmark/revision-context.md` |
| `fixture_rules` | `benchmark/README.md` |

## 已完成的工作与产出

| Step | 产出 | 路径 | 关键结论 |
| --- | --- | --- | --- |
| 1 · Intake | 材料清单 + 编辑决定 + 缺失项登记 + 工作产物目录 | `work/review-response-prep/01-intake-inventory.md` | 4 major + 2 minor 已收集；作者意图 (accept 1/2/4, partial-accept 3) 已记录 |
| 2 · Manuscript analysis | 段落骨架 + claims 链路 + sources 角色 + 高风险改动区 | `work/review-response-prep/02-manuscript-structure.md` | 7 处高风险改动区；CLM-02 critical；CLM-03 未在稿件出现 |
| 3 · Comment atomization | 12 个原子项（M1, M2-DECISION, M2a, M2b, M3a, M3b, M3c, M4a, M4b, M4c, m1a, m1b, m2） + claim 映射 | `work/review-response-prep/03-atomic-comments.md` | 2 项决策依赖（CLM-02 去留、canonical 术语） |
| 4 · Coverage check | 4 张覆盖矩阵（claims / sources / 缺失段落 / 隐含问题）+ 5 项遗漏 | `work/review-response-prep/04-coverage-report.md` | 3 项 GAP-major（alternative explanations / conclusion calibration / policy-variation 一句话）+ 2 项 GAP-minor（COI + data availability） |

## 证据与限制

- 所有 `SYN-*` ID 为合成 fixture；不联网、不补造数据/引用/伦理审批（来自 `benchmark/README.md`、`benchmark/goal.md`）。
- author_intent 全部取自 `revision-context.md`；未在 revision-context 中表态的标 `uncertain`。
- 覆盖判定（covered / implicit / gap / non-issue）以 Step 3 的原子项集合为全集，不引入未登记的处置。

## 未决项（next user decisions）

1. **M2-DECISION** — CLM-02 是 revise（降级措辞 + tentative）还是 remove？revision-context 表态偏 revise。
2. **m1a** — canonical 术语选 "AI-assisted feedback" 还是 "generative AI feedback"？
3. **3 项 GAP-major 是否补救** — alternative-explanations 节、conclusion calibration 句、policy-variation 一句话是否一并补上？
4. **2 项 GAP-minor 是否补救** — COI / funding 一行、data availability 一句？
5. **是否启动 review-response graph run** — 当前已具备 standalone 准备结果；若用户要继续到 revised manuscript + response letter，则需启动 review-response profile 并依次完成 intake → manuscript-analysis → comment-atomization → comment-coverage-gate → workboard → strategy-gate → round（修订轮）→ 三 Gates → outcome 节点。

## 后续路径建议（不在本任务范围）

- 若用户接受默认假设，可由用户授权后起 review-response graph run：
  - 当前潜在入口 selector: `profile:review-response`，entry: `full`。
  - 起 run 前必须重新读 `instructions profile:review-response --json`，按当前结构确认节点合同。
  - 起 run 需用户一次性确认 profile entry summary（root-run confirmation）；节点 Gates / Decisions 仍各自需确认。

## 已保存的产物（绝对路径）

```
/tmp/researchspec-journey-KuoSGF/work/review-response-prep/01-intake-inventory.md
/tmp/researchspec-journey-KuoSGF/work/review-response-prep/02-manuscript-structure.md
/tmp/researchspec-journey-KuoSGF/work/review-response-prep/03-atomic-comments.md
/tmp/researchspec-journey-KuoSGF/work/review-response-prep/04-coverage-report.md
```

## 任务状态

- status: completed（用户所请求的"整理 + 拆分 + 查漏"已全部完成并保存）
- blocker: 无
- 等待用户决定 §"未决项"