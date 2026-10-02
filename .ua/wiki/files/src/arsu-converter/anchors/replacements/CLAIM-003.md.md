
# src/arsu-converter/anchors/replacements/CLAIM-003.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/CLAIM-003.md -->

deep-research 的 CLAIM-003 替换契约：综合输出起草前读取已接受主张的 id、支撑限度、证据链与措辞约束，输出一份 claim_intent_manifest，保留稳定 id 并把提强诉求交给 change 流程，再由 handoff 记录供审计差分。
源码：[src/arsu-converter/anchors/replacements/CLAIM-003.md](../../../../../../../src/arsu-converter/anchors/replacements/CLAIM-003.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
