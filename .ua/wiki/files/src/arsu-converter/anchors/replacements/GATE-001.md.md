
# src/arsu-converter/anchors/replacements/GATE-001.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/GATE-001.md -->

academic-pipeline 的 GATE-001 替换契约：每次审计运行输出一份不可变的主张审计工件，含六类聚合结果、透传的主张意图输入与自反思附录；HIGH-WARN 违规等阻断项交回 Gate helper，LOW/MED 只作发现项，不做静默升级。
源码：[src/arsu-converter/anchors/replacements/GATE-001.md](../../../../../../../src/arsu-converter/anchors/replacements/GATE-001.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [GATE-002.md](GATE-002.md.md) | src/arsu-converter/anchors/replacements/GATE-002.md | academic-pipeline 的 GATE-002 替换契约，规定投稿包 Gate 的六步流程：解析策略、解析并运行确定性校验器、只依据结构化校验令牌判定（而非退出码）、保留 advisory 追加路径、复用前校验新鲜度、以及每次都重新计算通过结论。 |
