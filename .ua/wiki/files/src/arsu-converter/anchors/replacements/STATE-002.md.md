
# src/arsu-converter/anchors/replacements/STATE-002.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/STATE-002.md -->

academic-pipeline 的 STATE-002 替换契约：禁止使用上游 resume token 或状态载体，从既有材料进入时须请求 academic-pipeline:mid-entry 指令、识别真实外部前置角色与路径、给出路线摘要并取得新的实例级确认，由 CLI 创建新的归属控制。
源码：[src/arsu-converter/anchors/replacements/STATE-002.md](../../../../../../../src/arsu-converter/anchors/replacements/STATE-002.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [STATE-003.md](STATE-003.md.md) | src/arsu-converter/anchors/replacements/STATE-003.md | academic-pipeline 的 STATE-003 替换契约：从 ResearchSpec 状态与 handoff 工件恢复；若用户提供了 ARS 外部输入，只能通过已确认 mid-entry Start 的单向 explicit handoff input 通道进入，否则直接沿用当前 CLI 前沿，绝不从外部记录推断 Gate 或 Decision 权威。 |
