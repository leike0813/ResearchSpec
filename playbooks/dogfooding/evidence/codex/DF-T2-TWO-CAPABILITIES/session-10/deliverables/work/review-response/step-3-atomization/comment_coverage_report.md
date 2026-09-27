# Comment Coverage Report

> Capability: `transform-review-response-comment-atomization`
> Generated: 2026-09-27

## 1. Source Document Coverage

| 源文件 | 抽取线程 | 产出原子项 | 主 span 字符覆盖率 |
| --- | --- | --- | --- |
| `benchmark/review-comments.md` | 7 | 7 | 100% — 每个主 span 与源切片逐字一致。 |
| `benchmark/revision-context.md` | n/a（作者立场注记） | 在 `atomic_001`–`atomic_004`、`atomic_007` 中引用 | n/a |

硬阈值（流程默认 30%）：**通过**（100% ≥ 30%）。
软阈值（流程默认 50%）：**通过**（100% ≥ 50%）。

## 2. Thread-Atomic Bidirectional Coverage

- Threads → Atomics：7 / 7（每条 thread 都有 ≥ 1 atomic）。
- Atomics → Threads：7 / 7（每个 atomic 引用其父 thread）。
- 孤立线程：0。
- 孤立 atomic：0。

## 3. Required-Output Coverage

`revision-context.md` 声明四项必备产出：

| 必备产出 | 映射到的 atomic 项 | 状态 |
| --- | --- | --- |
| 关联每条审稿意见的修订路线图 | `atomic_001`–`atomic_007`（每条评论一条路线图项） | **已覆盖** |
| 保留稳定 claim ID 的修订稿 | `atomic_002`（CLM-02）、`atomic_003`（CLM-03）、`atomic_004`（Methods 串联全部 claim） | **已覆盖**（claim ID 保留） |
| 说明改了什么、保留什么限制的 response | `atomic_007`（response letter）、`atomic_006`（局限陈述） | **已覆盖**，待作者确认 `atomic_006` 范围 |
| 不补造数据、来源、分析或完成的伦理审批 | 工作流级不变量（记录于 `intake_report.md` § 5） | **已覆盖**，硬规则持续生效 |

## 4. Author-Stance Coverage

| 意见 | `revision-context.md` 中的作者立场 | atomic 项中记录 | 一致 |
| --- | --- | --- | --- |
| Major 1 | 接受 | `atomic_001` | ✓ |
| Major 2 | 接受 | `atomic_002` | ✓ |
| Major 3 | 条件性——保留思路、标 hypothesis、去因果 | `atomic_003` | ✓（具体措辞待落到 round artifact） |
| Major 4 | 接受 | `atomic_004` | ✓ |
| Minor 1 | 未表态 | `atomic_005` | **需作者立场** |
| Minor 2 | 未表态 | `atomic_006` | **需作者立场** |
| 编辑推荐 | 隐含（修订循环） | `atomic_007` | **需作者确认 response letter 措辞** |

## 5. Omission Check

逐项核对 `review-comments.md` 与 `revision-context.md`：

- [x] 4 条 major 编号意见全部抽出为独立原子项。
- [x] 2 条 minor 项目意见全部抽出为独立原子项。
- [x] 编辑推荐抽出为独立原子项。
- [x] 每 thread → ≥ 1 atomic；每 atomic → 1 thread。
- [x] 字符覆盖率超过软阈值 50%。
- [x] Major 1–4 的作者立场均已记录。
- [ ] Minor 与编辑信行仍需作者立场。

**源材料无遗漏。仍有 3 项待作者确认**（`atomic_005`、`atomic_006`、`atomic_007`）—— 这些是确认缺口，不是覆盖缺口。

## 6. Pending Confirmation Request

按流程第 8 步：覆盖审查在用户确认前不前推。待确认清单为 `atomic_005`、`atomic_006`、`atomic_007`。确认须显式覆盖：

1. 每个 atomic 项的父线程标注正确。
2. 100% 字符覆盖率对本 fixture 可接受。
3. 仍待作者立场的项可带当前 "needs-author-confirmation" 状态进入下一阶段。
