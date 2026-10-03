<!--
工件类型: knowledge-pack
能力/包 ID: PD-KP-15 research-evidence-bridge
提取方式: curated — ResearchSpec 编写，非上游逐字节
来源对照（source mapping）:
    - vendor/patent-disclosure-skill/skills/patent-reader/SKILL.md（解读产出接口）
    - vendor/patent-disclosure-skill/skills/patent-chart/SKILL.md（对照产出接口）
    - src/arsu-converter/authoring/m1-sources.ts（annotated-bibliography.v1 / synthesis-report.v1 既有接口）
说明: 上游没有“专利到论文”桥接；本工件按既有学术接口编写，只做证据归类与引用保留。
-->

# 研究证据桥接 (Research evidence bridge)

把专利解读笔记与学术材料整合进既有 `annotated-bibliography.v1` 与
`synthesis-report.v1` 接口，供下游写作使用。

## 输出是正文文件

这两个角色是**普通 Markdown 正文**，不是 JSON 索引。学术侧的消费方读的是可读
文本：参考文献条目带注解，综合报告是成段论述。把它们写成 JSON 索引，下游拿到的
就只是一堆路径。

写法对齐学术侧既有接口：

- `annotated_bibliography`：每条来源一段，含引用键、标题、出处、来源类别、
  证据等级与一句注解。专利文献按公开号著录，学术文献按原格式著录。
- `synthesis_report`：成段论述，按主题整合而不是罗列，每条实质判断带引用锚点。

## 保留证据类别

- 每条专利来源保留公开号、来源位置（段号 / 图号）、技术观察、解释与证据限制。
- 专利派生陈述与经验发现必须可区分；不得把专利公开当成实证验证。
- 来源类别标签：专利文献 / 学术文献 / 技术材料。

## 合并既有学术产物

传入了 `annotated_bibliography` 或 `synthesis_report` 就在其基础上追加，保持
既有条目的引用位置、顺序与措辞不变；只新增专利来源段落和受其影响的论述。既有
文件不可读时，保留专利部分并报告缺口，不覆盖原件。

## 不做

- 不把交底或申请草稿中的主张提升为稳定承诺或稳定规格。
- 不改动学术来源的引用位置或语义。
- 不自行进入写作节点，也不修改 run、节点、Gate 或 Decision。
