
# src/arsu-converter/anchors/replacements/GATE-003.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/GATE-003.md -->

shared 的 GATE-003 替换契约：合规报告须符合 shared/compliance_report.schema.json 并作为独立边界文件交付，编排者先校验再在 handoff 登记角色与路径，最后把决定、分级发现、证据与实质缺口交给 Gate helper，不得直接改写任一 ResearchSpec 权威文件。
源码：[src/arsu-converter/anchors/replacements/GATE-003.md](../../../../../../../src/arsu-converter/anchors/replacements/GATE-003.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [GATE-006.md](GATE-006.md.md) | src/arsu-converter/anchors/replacements/GATE-006.md | shared 的 GATE-006 替换契约，收录 handoff 完整性与 Gate 判定的第 4 至 12 条：可追溯 handoff、缺字段即 HANDOFF_INCOMPLETE、生产者与消费者双向校验、以 Gate 尝试而非可变字段作为完整性依据、陈旧检测、新鲜度策略、可选阶段跳过条件，以及终审完整性永不跳过。 |
