
# src/arsu-converter/anchors/replacements/GATE-005.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/GATE-005.md -->

academic-pipeline 的 GATE-005 替换契约：外部 Gate 报告只是证据，不能让 ResearchSpec Gate 通过、保留、覆盖或解锁；须用当前 profile 定位归属 Gate、给出新鲜核验建议并取得显式人工确认，尝试记录只追加到 run 与节点状态。
源码：[src/arsu-converter/anchors/replacements/GATE-005.md](../../../../../../../src/arsu-converter/anchors/replacements/GATE-005.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [GATE-003.md](GATE-003.md.md) | src/arsu-converter/anchors/replacements/GATE-003.md | shared 的 GATE-003 替换契约：合规报告须符合 shared/compliance_report.schema.json 并作为独立边界文件交付，编排者先校验再在 handoff 登记角色与路径，最后把决定、分级发现、证据与实质缺口交给 Gate helper，不得直接改写任一 ResearchSpec 权威文件。 |
