# 申请文件成文 (Patent application)

## 何时

已有交底产出目录，需要写出权利要求书、说明书、摘要与附图四件套。

## 输入

- `disclosure_bundle`（必需，handoff 或 node_output）。

## 步骤

1. 四件套是权利要求书、说明书、摘要、附图。独权取交底 5.1 的必要技术特征，从属树取
   5.2 的优选特征，按 `preferred_param` / `branch` / `system_map` / `embodiment`
   分层。书式细则见 `knowledge/pd-kp-07-application-four-pieces.md`。
2. 从索引解析出交底目录，然后先跑材料门禁：

```bash
python tools/material_gate.py --case-dir <交底目录>
```

   退出码 2 表示材料不齐，**就此终止**并列出缺项，引导先补交底。门禁按专利类型检查：
   实用新型要 `structure.yaml`、外观设计要 `appearance.yaml`，两者都要 `figure_plan`
   与入文图。
3. 写 `application_plan.yaml`：独权取交底 5.1 的必要技术特征，从属树取 5.2，按
   `preferred_param` / `branch` / `system_map` / `embodiment` 分层。
4. 排附图计划：

```bash
python tools/plan_figures.py --disclosure-plan <交底>/figure_plan.yaml --out <产出目录>/figure_plan.yaml --type <类型>
```

5. 出图与四件套：

```bash
python tools/render_invention_figures.py --plan <产出目录>/figure_plan.yaml --out-dir <产出目录>/figures
python tools/compose_application_figure.py --source <图路径> --fig <图号> --out-dir <产出目录>/figures
python tools/emit_application_docx.py --dir <产出目录>
```

6. 写正文：发明与实用新型按 权利要求书 → 说明书 → 摘要 → 附图 的顺序；外观设计只走
   `design_application` 口径并原样引用交底入文图，不套用发明权要写法。摘要不超过 300 字，
   摘要附图默认主流程图。
7. 写 `问题清单.md`（不入正式文件）与 `application_bundle` 索引，四件套加问题清单逐件登记：

```bash
python tools/patent_files.py create --project-root <root> --kind application \
  --out <out>/application.index.json \
  --file claims=<root>/<产出目录>/权利要求书.md \
  --file spec=<root>/<产出目录>/说明书.md \
  --file abstract=<root>/<产出目录>/摘要.md \
  --file figure_1=<root>/<产出目录>/figures/fig-1.png \
  --file figure_2=<root>/<产出目录>/figures/fig-2.png \
  --file issues=<root>/<产出目录>/问题清单.md \
  --limitation "<未决问题>" --meta patent_type=<类型>
```

`--file` 只收**普通文件**，不登记目录：每张图单独用 `figure_N=<路径>` 登记一次，
图有几张写几条。

## 硬约束

- 未指定交底目录不得开写；内容有争议就停下，缺口记问题清单。
- 不得宣称已通过附图审查或电子申请格式校验。
- 不自动堆装置 / 介质 / 系统权要；不扫描前端或工程素材目录当附图。
- 交底正文与 schema 只读，不在本阶段回改。

## 失败路径

- 门禁退出码 2：终止，说明缺哪件，回到交底补齐。
- Word 或图渲染失败：保留 Markdown 与图，把该项记进问题清单。

## 完成

输出 `application_bundle`（`application-bundle.v1`，`kind: application`）与 `问题清单.md` 的实际文件路径，附门禁结果与未决问题。
