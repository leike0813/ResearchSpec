<!--
工件类型: knowledge-pack
能力/包 ID: PD-KP-08 application-consistency
提取方式: curated — ResearchSpec 编写，非上游逐字节
来源对照（source mapping）:
    - vendor/patent-disclosure-skill/skills/patent-application/prompts/consistency.md
    - vendor/patent-disclosure-skill/skills/patent-application/prompts/numeral_register.md
    - vendor/patent-disclosure-skill/skills/patent-application/prompts/issues.md
说明: 保留对照矩阵、件号核对与问题清单口径。
-->

# 申请一致性检查 (Application consistency)

四件套写完、出 Word 之前执行。对不上的先改主文件，改不了记问题清单。

## 人工对照

对每一项权利要求，点对说明书发明内容、具体实施方式与附图。

| 权项 | 发明内容 | 具体实施方式 | 附图 |
|------|----------|--------------|------|
| 独权步骤 | 独立方案同序 | 第一种实施例同序 | 图 2 框内同义 |
| 从属优选参数 | 「进一步」可点到 | 数值例或表 N | 不强制单独图 |
| 从属分支 | 必要则一句 | 第二种或分支走查 | 不画进独权主流程 |
| 系统独权模块名 | 系统方案 | 结合图说明连接 | 框内同一套名称 |

## 机器对照

用本包工具核：独权「步骤 N」与流程图标签、框图模块名是否出现在说明书与系统权要、
附图说明是否点到每张图、图型是否已出图、件号登记表是否串号或未登记、摘要字数与
宣传语。脚本通过不等于充分公开。

## 件号登记

实用新型 `id` 与 `structure_schema.parts` 同一套；发明框图与系统权要不使用件号，
`parts` 可空，只登记 `figures`。流程图步骤不登记成 parts。

## 公式三处同义

交底有 `formula_plan.yaml` 时：说明书具体实施方式写符号表 + 式面 + `numeric_example`；
权要从属只保留文字关系，符号含义与计划一致；不另编计划里没有的主式。

## 问题清单

主文件写完写 `问题清单.md`，列出缺口：保护范围、交底歧义备选、查新未复做、发明人
未填、PNG / OMML 失败、对照对不上等。发明人 / 申请人未填记清单即可，不阻塞交付与
案卷轮次。清单不写入正式三件或附图。外观设计另列视图检查不合格项。

## 产出

`application_review` 索引：对照矩阵、机器检查结果、问题清单与视图检查清单路径。
