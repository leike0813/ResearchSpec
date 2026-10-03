<!--
工件类型: knowledge-pack
能力/包 ID: PD-KP-07 application-four-pieces
提取方式: curated — ResearchSpec 编写，非上游逐字节
来源对照（source mapping）:
    - vendor/patent-disclosure-skill/skills/patent-application/SKILL.md
    - vendor/patent-disclosure-skill/skills/patent-application/prompts/guardrails.md
    - vendor/patent-disclosure-skill/skills/patent-application/prompts/claim_strategy.md
    - vendor/patent-disclosure-skill/skills/patent-application/prompts/material_gate.md
说明: 保留材料门禁与权要策略；去掉“交付后自动衔接案卷”的调度语句。
-->

# 申请文件四件套 (Application four pieces)

必须先指定交底产出目录；仅缺文件才终止。输出四件套：权利要求书、说明书、说明书
摘要、说明书附图（含摘要附图）。

## 材料门禁

只拦缺文件。发明需交底书 `.md` 或 `.docx`；实用新型需交底 + structure_schema +
figure_plan + 入文线稿；外观设计需交底 + appearance_schema + figure_plan + 入文
线稿 + 入文实拍。缺文件终止并引导补交底；内容争议不停，记入问题清单。仓库
`examples/*/knowledge/` 不是交底产出。

## 权要策略

- 先写一句：问题 → 手段 → 效果，材料只来自交底。
- 读第五章 5.1 / 5.2：独立权项取 5.1 必要技术特征，从属树取 5.2，不重新判断必要性。
- 发明：方法主线先写方法独权（步骤一、步骤二…，与主流程图同序）；同时要求系统再写
  第二条独权，只写模块名。不自动堆介质 / 程序权要。
- 实用新型：只写产品独权，件号与 `structure_schema.parts` 同一张表。
- 从属分层：`preferred_param`、`branch`、`system_map`、`embodiment`；只引用在
  先权项，互斥分支不写成可同时成立的并列。
- 歧义选交底能支撑的一种继续写，备选记入问题清单。

## 主文件纪律

正文用申请书式：不写「草稿 / 须人改 / 待确认」、质量分、仓库脚注、检索说明或来源
URL。背景只消化交底最近对比，优先一件写透。摘要不超过 300 字、无宣传语，摘要附图
默认主流程图。附图黑白线框，图号写在说明书正文，不画进图里。

外观设计：先读 `references/design_view_cnipa.md`，只走 design_application 口径，
原样引用交底入文图，不升格、不改像素；漏视、虚线、新事项写入视图检查清单。

## 迭代

已有申请产出上改稿：另存新时间戳目录，不覆盖旧目录（用户明确要求覆盖除外）。

## 产出

`application_bundle` 索引：四件套路径、类别、缺口与证据限制。
