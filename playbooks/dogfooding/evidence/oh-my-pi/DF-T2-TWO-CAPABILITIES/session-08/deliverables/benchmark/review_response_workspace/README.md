# Review-Response Step Index

本轮 review-response profile 的前 4 节点产出均已落档。每步产物独立保存，方便后续 round / gate / outcome 节点逐项引用与回溯。

## 落档顺序与文件

| 步序 | 节点 | 角色 | 路径 |
|------|------|------|------|
| 1 | intake | `review_response_workspace` 索引 + `intake_report` | `review_response_workspace/WORKSPACE.md`、`review_response_workspace/intake/intake_report.md` |
| 2 | manuscript-analysis | `manuscript_structure_summary` | `review_response_workspace/manuscript_analysis/manuscript_structure_summary.md` |
| 3 | comment-atomization | `atomic_comment_list` | `review_response_workspace/comment_atomization/atomic_comment_list.md` |
| 4 | comment-coverage | `comment_coverage_report` | `review_response_workspace/comment_coverage/comment_coverage_report.md` |

## 与上游材料的引用关系

| 来源 | 在哪份产出里被引用 |
|------|--------------------|
| `benchmark/goal.md` | intake_report §1.1 |
| `benchmark/sources.yaml` | intake_report §1.2、comment_coverage §3 |
| `benchmark/claims.yaml` | intake_report §1.3、manuscript_structure_summary §3 |
| `benchmark/partial-manuscript.md` | manuscript_structure_summary §2、comment_coverage §1 |
| `benchmark/review-comments.md` | atomic_comment_list §1–3、comment_coverage §1 |
| `benchmark/revision-context.md` | intake_report §1.6、atomic_comment_list 各项 author 立场、comment_coverage §1 |

## 关键判定（供下游 gate 参考）
- 4 条 major、2 条 minor、1 条编辑决定，全部进入 round 待办，无遗漏。
- partial 中伏笔与缺位已分项标注，未覆盖的项均在 `comment_coverage_report.md` §3 给出风险。
- 本轮不修改 partial manuscript；round 节点复制到 working_manuscript 后再编辑。
- goal.md 边界约束（不补造、不联网、不替 author 决定范围）在本轮产物中均遵守。