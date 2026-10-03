# 审查答复复核 (Office-action response review)

## 何时

答复草稿产出后复核：与通知书要点、本申请文件的一致性，以及驳回映射是否可核对。

**本阶段是只读复核。**它不改草稿、不改申请、不入库；改稿由
`generation-patent-oa-response` 在下一次有界执行里做。

## 输入

- `office_action`（必需，handoff 或 node_output）
- `application_bundle`（必需，handoff 或 node_output）
- `oa_response`（必需，handoff 或 node_output）

## 步骤

1. 逐条核通知书的缺陷在草稿里是否被回应，未回应的记 `unresolved` 并写清缺什么。
   复核口径细则见 `knowledge/pd-kp-13-oa-response.md`。
2. 解析 `oa_response` 索引，取草稿路径、场景、采纳状态与驳回映射 xlsx 路径。
3. 逐条核对通知书的缺陷在草稿里是否被回应；未回应项记 `unresolved`，并写清缺什么。
4. 核对草稿对本申请四件套的引用是否准确：条号、段号、附图号与实际文件对得上吗。
5. 核对修改是否超原申请记载范围。超范围就标风险，并指出超在哪一处。
6. 核对驳回映射 xlsx 与草稿一致；确认映射表没有被写进陈述正文。
7. 核对陈述结构是否符合 `assets/opinion_statement.md` 的要求。
8. 写 `oa_review`（普通文件）：`status` 取 `pass` / `issues` / `not_checked`，
   外加逐项核对结果、`unresolved[]` 与建议改法。

## 硬约束

- 不修改任何输入文件，不重写草稿。
- 不替代代理签字与正式递交；草稿须经人复核后才能递交。
- 不把相对分写成授权率或授权概率；不宣称审查已通过。
- 未脱敏材料不得写进 `cases/draft.json` 或历史库。
- 工具未执行记 `not_checked`，不声称已核对。

## 失败路径

- 通知书法条或对比文件缺失：标 `not_checked` 并说明，不编造结论。
- 草稿路径不可读：照实报告，停下。

## 完成

输出 `oa_review`（`oa-review.v1`）的实际文件路径，含 `status`、逐项核对结果、`unresolved[]` 与建议改法。
