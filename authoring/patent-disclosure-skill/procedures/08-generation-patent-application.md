# 申请文件成文 (Patent application)

## 何时

已有交底产出目录，需要写出权利要求书、说明书、摘要与附图四件套。

## 输入

- `disclosure_bundle`（必需，handoff 或 node_output）。

## 中国发明母案与分案

用户要求母案或分案时，先确认本轮案件、母案的提交状态和交付类型。提交前可从已核实的交底
材料提出主题与必要特征组合，交付案件范围表，并标明还须按实际提交文本复核。一次只处理
用户确认的案卷。重合主题、未确认的独权组合和未核实的程序资格记入问题清单。

母案已提交时，从本案交底索引所列或用户明确选定的材料核对名称、申请号、申请日、首次提交
的说明书、权利要求书与原附图（如有）。
案件范围表按案记录技术问题、独权必要特征组合、输入输出、实施例与技术效果。另写原始
披露表，逐项定位拟写入权项和说明书的特征及其组合，记录原权项、段落、页码或图号，并
区分明确记载、可直接且毫无疑义地确定、待核和缺失。能逐项定位的特征仍须核对组合关系。
母案状态未知、首次提交材料缺失或无法确立完整支持时，交付分案核对稿与补件清单，
正式申请保持待办。提交时点、资格和优先权声明由代理复核。

用户要求四件套且原始支持齐备时，沿用下列成文步骤。分案说明书在标题后、技术领域前标明
与母案的关系和已核实的母案信息。把两张表登记在申请索引的 `case_scope` 与
`original_disclosure` 文件角色。涉及模型、训练或推理的已披露实施方式，可按需读取
`references/ai_implementation.md`。需要对照拆案方式时读
`references/divisional_example_ai_security.md`，本案依据仍采用本案材料与首次提交文本。

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
   索引带 `paper_evidence` 时，读当前附件，把拟入权项的限定对到证据标识与权项号；只有
   有支持的限定才进正式权项。使用解释性依据时，逐条说明原文如何支持该限定；
   仍需外推或确认的部分留在问题清单。
   `未决` 不得进正式权项，收窄到已支持事实或退回问人。权项映射变化时写新版本附件，
   旧版保留。主论文案件缺附件时，只用获准读取的原件重建；未能核实的限定留待确认。
   普通交底和仅作背景的论文沿用常规成文步骤。
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
图有几张写几条。有证据附件时再加 `--file paper_evidence=<当前附件>`；没有就不加。

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
