
# src/arsu-converter/anchors/replacements/REVIEW-010.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/REVIEW-010.md -->

academic-paper 的 REVIEW-010 替换契约：定义 academic-paper full 的生成器/评估器分工，须按 handoff 解析冻结的 writer_full 与 evaluator_full 契约以及各阶段工件，保留四次 paper-blind / paper-visible 调用分离、模式排除、基线字段与 lint 规则。
源码：[src/arsu-converter/anchors/replacements/REVIEW-010.md](../../../../../../../src/arsu-converter/anchors/replacements/REVIEW-010.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [REVIEW-012.md](REVIEW-012.md.md) | src/arsu-converter/anchors/replacements/REVIEW-012.md | academic-paper 的 REVIEW-012 替换契约，声明为生成器/评估器拆分中权威的写手侧系统提示协议：保留 Phase 4a 盲读预承诺、Phase 4b 可见起草、逐字系统提示小节、数据分隔规则与 lint 检查，并把阶段产物按顺序登记。 |
