# 交底书成文 (Disclosure generation)

## 何时

`patent_case`、`invention_brief` 与 `prior_art_report` 齐备，需要写出交底书正文与随附的
结构化材料。

## 输入

- `patent_case`（必需，node_output）
- `invention_brief`（必需，node_output）
- `prior_art_report`（必需，handoff 或 node_output）

## 步骤

1. 交底书是给代理师看的技术文件，不是权利要求书，也不代表已通过审查。章节体例细则见
   `knowledge/pd-kp-05-disclosure-structure.md`。
2. 取 `patent_case.metadata.patent_type`，按类型走对应口径（见下节「按类型必须产出」）。
3. 按六章骨架写正文：
   - **一** 相关技术背景：按 `prior_art_report` 写最接近的现有技术及其缺点、检索说明
     与来源链接；
   - **二** 本发明所要解决的技术问题：由 Fk 的技术效果反推，写完整问题句，
     **不得写进本发明的手段**；
   - **三** 技术方案详细阐述：3.1 场景 / 示意图，3.2 框图与流程，3.3 手段展开，
     3.4 公式（有则，先过 `formula_plan`），3.5 参数；
   - **四** 与现有技术相比具有哪些优点：完整效果句，构造写进句子里；
   - **五** 技术关键点和欲保护点：**5.1 必要技术特征 / 5.2 优选特征**，按删除测试划分；
   - **六** 其它：实施例、参数示例、补充说明。

   第五章的 5.1 / 5.2 是下游申请阶段取独权与从属树的依据，划分要站得住：删掉 5.1
   任一特征方案就不成立，删掉 5.2 只影响优选。
4. 按类型产出结构化材料（见下节）。
5. 出图与 Word：

```bash
python tools/mermaid_render.py --input <定稿.md> --output <定稿.md> --docx <定稿.docx> \
  --assets-dir <案件目录>/mermaid_figures
python tools/math_render.py --input <公式.md> --output <公式图目录>
python tools/md_to_docx.py --input <定稿.md> --output <定稿.docx>
```

   `mermaid_render` 的 `--output` 是**渲染后的 md 本身**（把围栏换成图片引用），不是
   图目录；图片落在 `--assets-dir`。`--docx` 与 md **同名主文件名**，一次出齐。

6. 实用新型与外观设计还要出**入文线稿**。线稿按 `structure.yaml`（或
   `appearance.yaml`）的件号分层拼装，装配图与标注分开处理：

```bash
python tools/structure_lineart_compose.py --case-dir <交底目录>
python tools/structure_lineart_compose.py --case-dir <交底目录> --check
python tools/structure_callout_overlay.py --case-dir <交底目录> --anchors <标注锚点.yaml>
python tools/run_step_to_views.py --input <STEP 文件.md> --out-dir <交底目录>/views
python tools/cad_scan.py --root <模型目录> --json
python tools/svg_screenshot.py --dir <交底目录>/figures --png
```

   `cad_scan` / `svg_screenshot` 需要浏览器或 CAD 依赖；不可用就保留已出的线稿，
   把缺的视图记为 `not_checked`，不要用占位图冒充成图。

7. 交付文件命名 `{案件名}_{YYYYMMDDHHmmss}.md`（含同名 docx），不覆盖旧稿。
8. 写 `disclosure_bundle` 索引，**按专利类型裁剪**，只登记本类型实际产出的文件——
   没产出的那一类不要写进索引。发明没有 `structure_schema`，就不要登记它：

```bash
# 发明：正文 + docx + figure_plan +（有公式时）formula_plan
python tools/patent_files.py create --project-root <root> --kind disclosure \
  --out <out>/disclosure.index.json \
  --file disclosure=<root>/<案件>_<时间戳>.md \
  --file docx=<root>/<案件>_<时间戳>.docx \
  --file figure_plan=<root>/<案件>/figure_plan.yaml \
  --limitation "<证据限制>" --meta patent_type=<类型>
```

   实用新型再加 `--file structure_schema=…` 与 `--file lineart=…`；外观设计再加
   `--file appearance_schema=…`、`--file photo=…` 与 `--file lineart=…`。

## 按类型必须产出

下面这些不是「可选 schema」。申请阶段的材料门禁会逐项检查，缺哪项就出不了申请。

| patent_type | 必须产出 | 入文图 |
|-------------|----------|--------|
| 发明 invention | `figure_plan.yaml`；含公式时 `formula_plan.yaml` | 方法 / 系统框图与流程图（mermaid 渲染） |
| 实用新型 utility_model | `structure.yaml`（部件、连接关系、布局）+ `figure_plan.yaml` | 按 `figure_plan` 出的**入文线稿**，逐图对应结构编号 |
| 外观设计 design | `appearance.yaml`（造型、图案、色彩要点）+ `figure_plan.yaml` | **实拍与线稿都入文**，视图按国知局六面图要求 |

## 迭代修订

交底书是可以迭代的。每次修订都：

1. 读上一版的 `disclosure_bundle`，连同本轮要解决的问题一起读；
2. 改动落到**新时间戳文件**，上一版原样保留；
3. 同步更新受影响的结构化材料——改了部件就改 `structure.yaml`，改了视图就改
   `figure_plan.yaml` 和线稿，公式变了就改 `formula_plan.yaml` 与符号表；
4. 重新出 docx 与受影响的图；
5. 写一份修订说明：这一版改了什么、为什么、还剩什么缺口。

材料里没有的技术事实不靠迭代补进来——那要回到 `patent_case` 补充材料。

## 硬约束

- 交底书不是权利要求书，也不得宣称已通过审查。
- 材料未披露的部件不写入正文或 schema，缺口记问题清单。
- 正文无仓库名、无 examples 路径、无元信息脚注、无工具名。
- 不自动进入申请、案卷、地图或布局阶段。
- 保护型 1+N 布局由 `design-patent-protection-layout` 单独产出并经人工确认，不在本阶段顺手做。

## 失败路径

- Word / 图渲染依赖缺失：保留 Markdown 草稿，报告不可用项，不声称已渲染。
- 公式分隔符检查有命中：先改正再出 Word。
- 缺入文线稿或视图：明确记为缺口并停在这里——不要先出申请。

## 完成

输出 `disclosure_bundle`（`disclosure-bundle.v1`，`kind: disclosure`），含交底书 md / docx、按类型要求的 schema、`figure_plan`、入文线稿或视图、公式图，以及 `limitations` 与本版修订说明。
