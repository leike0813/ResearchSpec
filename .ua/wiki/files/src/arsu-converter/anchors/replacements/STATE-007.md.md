
# src/arsu-converter/anchors/replacements/STATE-007.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/STATE-007.md -->

academic-pipeline 的 STATE-007 替换契约：重置与恢复状态只存在于当前 run 与节点实例、工件记录及人工确认的 Gate 尝试与 Decision 中；外部输入处理是单向的，重跑工作只产生新的显式工件，绝不向源外部输入追加边界或恢复条目。
源码：[src/arsu-converter/anchors/replacements/STATE-007.md](../../../../../../../src/arsu-converter/anchors/replacements/STATE-007.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [STATE-009.md](STATE-009.md.md) | src/arsu-converter/anchors/replacements/STATE-009.md | shared 的 STATE-009 替换契约：任何外部状态包都只当作普通不可变输入文件，在消费 run 的 handoff 中登记其角色、类型、路径、用途与限制，不得把它的状态字段复制进当前控制，也不得据此推断 Gate、Decision、检查点、转换或完成结果。 |
