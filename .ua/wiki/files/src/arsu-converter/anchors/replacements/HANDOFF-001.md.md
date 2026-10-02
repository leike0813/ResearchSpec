
# src/arsu-converter/anchors/replacements/HANDOFF-001.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/HANDOFF-001.md -->

academic-pipeline 的 HANDOFF-001 替换契约：所有边界输入输出都登记在 run handoff，含稿件角色需额外记录 format（QMD 源与 quarto 渲染结果都是外部边界文件，pack 不复制）；稳定意图、来源、主张与稿件结构归四份 specs，Gate 尝试与前沿归节点状态。
源码：[src/arsu-converter/anchors/replacements/HANDOFF-001.md](../../../../../../../src/arsu-converter/anchors/replacements/HANDOFF-001.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [HANDOFF-003.md](HANDOFF-003.md.md) | src/arsu-converter/anchors/replacements/HANDOFF-003.md | shared 的 HANDOFF-003 替换契约：约定 ARSU Markdown 契约只是人读载荷格式，ResearchSpec 的 specs、控制与 handoff 才是项目稳定接口；生产者须校验必填字段并把边界文件写在 researchspec/ 之外，缺字段触发 HANDOFF_INCOMPLETE。 |
