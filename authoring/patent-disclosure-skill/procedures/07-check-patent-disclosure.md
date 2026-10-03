# 交底自检 (Disclosure review)

## 何时

交底书成稿后、交付前，内部核对并给出复核意见。

**本阶段是只读复核。**它对照交付物标问题、给证据、列残留项，然后交回。改稿由
`generation-patent-disclosure` 或 `transform-patent-docket-revision` 在下一次
有界执行里做——那是另一件事，不在这里顺手改掉。

## 输入

- `disclosure_bundle`（必需，handoff 或 node_output）。

## 步骤

1. 按 `patent_type` 选核对项：发明核逻辑闭环、公式与符号表一致、三态门禁与
   `prior_art_report` 一致；实用新型核 `structure.yaml` 的部件与连接关系、
   `figure_plan` 与入文线稿逐图对应；外观设计核视图齐备与 `appearance.yaml` 要点。
   细则见 `knowledge/pd-kp-05-disclosure-structure.md`。
2. 解析索引，确认正文、docx、按类型要求的 schema、`figure_plan` 与入文图是否齐备。缺件直接记为 `missing`，不进入内容核对。
3. 跑确定性检查：

```bash
python tools/check_source_parts.py --case-dir <交底目录>
python tools/check_design_views.py --case-dir <交底目录>
python tools/latex_delimiters.py --input <定稿.md>
python tools/check_formula_plan.py --input <formula_plan.yaml> --eval
python tools/structure_lineart_gate.py --case-dir <交底目录> --check
python tools/design_lineart_gate.py --case-dir <交底目录> --check
```

4. 按 `patent_type` 做语义核对：
   - 发明：问题 - 手段 - 效果是否闭环，公式与符号表是否一致，三态门禁与
     `prior_art_report` 是否一致；
   - 实用新型：`structure.yaml` 的部件与连接关系是否覆盖正文，`figure_plan` 与入文线稿
     是否逐图对应；
   - 外观设计：视图是否齐备，`appearance.yaml` 的造型 / 图案 / 色彩要点是否都在正文。
5. 逐条记录 `findings`：位置、问题、依据、建议改法。不在交付物上直接改。
6. 写 `disclosure_review`（普通文件）：`status` 取 `pass` / `issues` / `not_checked`，
   外加 `findings[]` 与 `unresolved[]`。

## 硬约束

- 不修改任何输入文件。正文、schema、图、docx 一律只读。
- 复核结论不写进交底书正文；用户索要时单独提供报告文件。
- 法定要件的「三段绑定」与「删除测试」不通过就是 `issues`，要写清哪一段断了。
- 工具未执行或依赖缺失一律记 `not_checked`，不声称已检查。

## 失败路径

- 索引校验失败或文件缺失：照实报告缺什么，停下，不猜内容。
- 缺必要技术事实、无法从正文与材料推断：保持 `unresolved` 并说明缺什么，不硬判通过。

## 完成

输出 `disclosure_review`（`disclosure-review.v1`）的实际文件路径，含 `status`、`findings[]`、`unresolved[]` 与机器检查的逐项结果。改稿建议交回对应的生产阶段。
