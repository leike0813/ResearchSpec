<!--
工件类型: knowledge-pack
能力/包 ID: PD-KP-05 disclosure-structure
提取方式: curated — ResearchSpec 编写，非上游逐字节
来源对照（source mapping）:
    - vendor/patent-disclosure-skill/skills/patent-disclosure/prompts/invention/disclosure_builder.md（章节与公式纪律）
    - vendor/patent-disclosure-skill/skills/patent-disclosure/prompts/disclosure_self_check.md（自检项）
    - vendor/patent-disclosure-skill/skills/patent-disclosure/prompts/disclosure_preview.md（预览）
说明: 压缩为固定阶段的成文骨架与自检，去掉“交付后自动进入围栏 / 申请”的调度语句。
-->

# 交底书结构与自检 (Disclosure structure and self-check)

## 章节骨架

1. 技术领域与背景：1.1 在先对比（含检索说明与可访问来源链接），1.2 现有技术不足。
2. 发明目的 / 技术问题。
3. 技术方案：3.1 对象与术语，3.2 框图，3.3 模块职责，3.4 流程与公式，3.5 关键参数。
4. 有益效果。
5. 技术关键点：5.1 必要技术特征，5.2 优选特征。
6. 实施例：与 3.1 / 3.2 同名的实例，覆盖主路径 + 一条已有分支。

实用新型以 StructureSchema 的部件 / 连接 / 布局为主线，第五章用装置或结构书式。
外观设计只写可见造型、图案、色彩与视图要点。

## 公式纪律

- 3.4.1 先定义符号表（含义、下标、量纲）；每个符号都在表中定义。
- 行内 / 块级分隔符全文统一；含 `\mathrm`、`\,`、`_{` 的式子必须写成 `\(…\)`
  或 `$…$`，不得写成普通括号。
- 同一物理量同形同义；阈值与参数全文一致；公式与流程、模块职责逐步互推。
- 生产阶段发现公式或逻辑有误时修订新版本，并联动 formula_plan、3.4 文字、3.5 参数、第六章实施例；复核阶段只记录问题与建议。

## 附图

- 发明：fenced mermaid 交由本包工具渲染 PNG，无 ASCII 框图；流程图节点可见标签含序号。
- 实用新型：figure_plan 入文线稿，件号与 structure_schema.parts 同一张表。
- 外观设计：实拍 + 线稿都入文，视图口径按 `references/design_view_cnipa.md`。

## 自检（内部执行，不写入正文）

- 逻辑闭环、模块与流程对应、实施例覆盖主路径与分支、术语贴合领域。
- 公式正确性与逻辑、符号表与 3.5 一致、量纲与不等式方向合理。
- 交付文件名 `{案件名}_{YYYYMMDDHHmmss}.md`；正文无仓库名、无 examples 路径、
  无「教学示例 / 虚构 / 不构成法律承诺」类脚注。
- 发明 / 实用新型三条硬项：技术问题**不得含方案手段词**、第五章分必要与优选、Fk 口径各章一致，
  正文不靠 F 号才能读懂。外观设计跳过该节。
- 生产阶段修订新版本后交付；复核阶段保持输入只读。缺技术事实无法推断时记为问题。

## 产出

`disclosure_bundle` 索引：交底书 md / docx、检索定位稿、按专利类型必需的 schema 与
入文图，以及证据限制。索引只登记本类型实际产出的文件——发明的索引里不出现
`structure_schema`，实用新型与外观设计的索引里不出现对方那一套。
