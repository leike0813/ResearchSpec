
# src/arsu-converter/anchors/replacements/DECISION-002.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/DECISION-002.md -->

shared 的 DECISION-002 替换契约：合规豁免需从节点实例读取同节点同 Gate 的既往已接受覆盖，按配置的轮次摩擦规则停下等待人工确认，确认后才由 CLI 记录覆盖、理由、范围、报告角色与轮次；合规报告本身不能授权覆盖。
源码：[src/arsu-converter/anchors/replacements/DECISION-002.md](../../../../../../../src/arsu-converter/anchors/replacements/DECISION-002.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
