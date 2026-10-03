<!--
工件类型: knowledge-pack
能力/包 ID: PD-KP-02 patent-intake-and-types
提取方式: curated — ResearchSpec 编写，非上游逐字节
来源对照（source mapping）:
    - vendor/patent-disclosure-skill/skills/patent-disclosure/prompts/intake.md（边界问答与默认类型）
    - vendor/patent-disclosure-skill/skills/patent-disclosure/prompts/project_scan.md（材料梳理）
说明: 去掉“汇总后自动进入 Step 2”等自动跳转，只保留类型判定与材料来源规则。
-->

# 交底接入与类型路由 (Intake and patent types)

## 少量问题收敛边界

- Q1 技术主题或产品模块：一句话描述。
- Q2 专利类型：发明 / 实用新型 / 外观设计 / 暂不确定。未显式指定一律默认发明，
  并在汇总中写明「专利类型：发明（默认）」。
- Q3 文头联系人：不提供就全部写「待填写」，不阻塞后续。

方法与系统属于「权利要求书式倾向」，不是专利类型。用户只答「方法 / 系统」仍默认
发明。

材料明显偏结构或外观、且当前仍是默认发明时反问一次（不反复打断）：

- 产品形状 / 构造改进（卡扣、散热布局、支架等）→ 是否改实用新型？
- 外观造型 / 图案 / 配色 → 是否改外观设计？

用户确认后切换类型与模板；未回复则维持发明。

## 类型路由

| 类型 | 主线 | 必需结构 |
|------|------|----------|
| 发明 invention | 方法 / 系统步骤与模块 | 框图与流程（mermaid）；含公式时 formula_plan |
| 实用新型 utility_model | 部件、连接关系、布局 | structure_schema + figure_plan + 入文线稿 |
| 外观设计 design | 可见造型、图案、色彩 | appearance_schema + figure_plan + 入文实拍 / 线稿 |

## 材料梳理

发明人材料、项目目录、可选 `.tex`。记录来源路径与缺口；摘录只取与本案相关的技术
要点，不做全库扫描。查新与用法类型随专利类型传递。

## 产出

`patent_case` 索引：`schema_version`、`kind`、`files`（role + path）、
`limitations`、`metadata`（patent_type、case_id、来源、假设）。文件在工作区普通
目录下，不在 `researchspec/`。
