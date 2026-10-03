# 申请一致性检查 (Application review)

## 何时

四件套写完、出 Word 之前，核对权要、说明书与附图的一致性。

**本阶段是只读复核。**它不改主文件；改稿由 `generation-patent-application` 或
`transform-patent-docket-revision` 在下一次有界执行里做。

## 输入

- `application_bundle`（必需，handoff 或 node_output）。

## 步骤

1. 逐个权项核：它的每个技术特征在说明书的发明内容与具体实施方式里有没有支撑，附图
   编号与件号登记表对不对得上。矩阵细则见 `knowledge/pd-kp-08-application-consistency.md`。
2. 解析索引，确认四件套与 `问题清单.md` 齐备。缺件记为 `missing`，不进入内容核对。
3. 跑确定性对照：

```bash
python tools/check_support.py --dir <产出目录>
python tools/check_numeral_register.py --register <件号登记表.yaml> --claims <权利要求书.md> --spec <说明书.md>
python tools/audit_claims.py --json <产出目录>/claim_audit.json
python tools/latex_delimiters.py --input <说明书.md>
python tools/check_design_views.py --case-dir <产出目录>
```

4. 按对照矩阵逐项核对：每一权项的技术特征在说明书的发明内容与具体实施方式里是否有
   支撑，附图编号与件号登记表是否对得上。
5. 核对 `references/promo_terms.yaml` 里的禁用表述，以及摘要字数与摘要附图指向。
6. 外观设计另按国知局视图检查清单核对。
7. 写 `application_review`（普通文件）：对照矩阵结果、机器检查逐项输出、问题清单
   路径与建议改法。

## 硬约束

- 不修改任何输入文件。
- 脚本通过不等于充分公开；语义是否写够仍按对照矩阵判断。
- 发明人 / 申请人未填记问题清单即可，不阻塞交付。
- 不写入正式三件或附图。
- 工具未执行或依赖缺失记 `not_checked`，不声称已检查。

## 失败路径

- 依赖缺失或脚本无法运行：标 `not_checked` 并说明，语义对照照常执行。
- 索引校验失败：照实报告缺什么，停下。

## 完成

输出 `application_review`（`application-review.v1`）的实际文件路径，含对照矩阵、机器检查结果、问题清单路径与建议改法。
