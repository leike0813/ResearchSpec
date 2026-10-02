
# src/arsu-converter/anchors/replacements/STATE-003.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/STATE-003.md -->

academic-pipeline 的 STATE-003 替换契约：从 ResearchSpec 状态与 handoff 工件恢复；若用户提供了 ARS 外部输入，只能通过已确认 mid-entry Start 的单向 explicit handoff input 通道进入，否则直接沿用当前 CLI 前沿，绝不从外部记录推断 Gate 或 Decision 权威。
源码：[src/arsu-converter/anchors/replacements/STATE-003.md](../../../../../../../src/arsu-converter/anchors/replacements/STATE-003.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [STATE-005.md](STATE-005.md.md) | src/arsu-converter/anchors/replacements/STATE-005.md | academic-pipeline 的 STATE-005 替换契约：把既有项目材料当作普通 mid-entry 输入的五步流程——选安全相对路径并说明角色、请求当前路线指令并只验所需前置、呈报 Skill/模式/输入/输出/Gate/风险/成本后取得新确认、在新节点 handoff 记录实际输入角色、既往 Gate 与完成声明一律留在新控制之外。 |
| [STATE-008.md](STATE-008.md.md) | src/arsu-converter/anchors/replacements/STATE-008.md | deep-research 的 STATE-008 替换契约：用 researchspec status 与定向图指令从归属控制和 handoff 恢复既有实例；既有材料需要新 pipeline 入口时选择 academic-pipeline:mid-entry、声明真实 handoff 输入角色并单独取得启动确认，外部元数据不改变 profile、前沿、Gate 或 Decision 权威。 |
