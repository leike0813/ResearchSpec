
# src/arsu-converter/anchors/upstream-manifest.json
所属分层：[ARSU 转换与 Skill 生成层](../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors](../../../../modules/src/arsu-converter/anchors.md)
<!-- node: config:src/arsu-converter/anchors/upstream-manifest.json -->

上游 ARSU 清单：记录审计 commit、已审计的五个根目录、风险关键词集合，以及各 Skill 的文件、类型与风险分类，是转换器判定风险面的固定输入。
源码：[src/arsu-converter/anchors/upstream-manifest.json](../../../../../../src/arsu-converter/anchors/upstream-manifest.json)

## 配置

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [manifest.ts](manifest.ts.md) | src/arsu-converter/anchors/manifest.ts | 上游审计清单的生成与数据结构定义：声明受审计的根目录与契约风险关键词，扫描 vendor/ars 为每个文件记录归一化哈希、frontmatter、标题树和风险命中，并固定锚点资产路径常量。 |
| [types.ts](types.ts.md) | src/arsu-converter/anchors/types.ts | 契约锚点领域的类型与常量定义：固定 v4 替换 profile ID、锚点 ID 命名规则、可替换/诊断两类锚点的判别联合，以及覆盖决策、匹配记录与替换计划的数据结构。 |
