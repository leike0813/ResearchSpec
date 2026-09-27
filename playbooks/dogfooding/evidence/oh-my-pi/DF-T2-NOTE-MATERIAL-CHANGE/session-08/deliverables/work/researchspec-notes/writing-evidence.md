# 证据核查状态（2026-09-27 续接会话）

## 任务笔记 vs 实际文件

`work/researchspec-notes/writing-evidence.md`（与 `benchmark/ordinary-task-note.md` 一致）声称：

- Inputs: `benchmark/sources.yaml` and `benchmark/partial-manuscript.md`
- Completed work: "Read the draft and identified claims needing source support. No formal review or graph action occurred."
- Next step: Check the draft claims against `benchmark/sources.yaml`, then write an ordinary synthesis file.

但工作区实况：

| 项目 | 状态 |
| --- | --- |
| `benchmark/sources.yaml` | **不存在** |
| `benchmark/partial-manuscript.md` | 存在，含 `CLM-01`、`CLM-02` 两个 claim ID |
| `researchspec/specs/sources.yaml` | schema 2 空文件 `sources: []` |
| `researchspec/specs/claims.yaml` | schema 2 空文件 `claims: []` |
| `researchspec/specs/manuscript.yaml` | 全字段 null/空 |
| runs / nodes / Gates / Decisions | 全部 0 |

`benchmark/README.md` 描述 5 个 fixture 变体，本目录实际只有 `goal-only` 所需的材料外加一份 `partial-manuscript.md` —— **缺少 `evidence-corpus` 变体承诺的 `sources.yaml`**。笔记把它当作已经存在的输入引用，这是一个**事实性错误**，不是上一次的进展。

## 由此得出的核查结论

- `CLM-01`（结构化提示与更明显的大纲修订相关）：没有源文支撑，**无法判断支持/反驳**，只能标记为“待源”。
- `CLM-02`（生成式 AI 减轻工作量；草稿自陈不被支持）：同上，**无源可核**，作者主张本身没有外部依据。
- `partial-manuscript.md` 中“interview summaries suggest faster feedback may be offset by verification work”——同样**无源可核**。
- 没有上一次的真实核查产出（无 run、无节点、无 verifier 文件、无先前 synthesis 文件）。所谓的“继续完成上次的论断核查”没有可续接的对象。

## 阻塞

无法继续按笔记原计划执行（“对照 `benchmark/sources.yaml` 检查”），原因：被声明的输入文件不存在，且 `researchspec/specs/sources.yaml` 为空。需要委托方先就以下任一路径作出选择，再恢复执行。
