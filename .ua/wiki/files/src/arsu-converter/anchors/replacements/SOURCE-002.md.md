
# src/arsu-converter/anchors/replacements/SOURCE-002.md
所属分层：[ARSU 转换与 Skill 生成层](../../../../../layers/arsu-converter.md)  
所属目录：[src/arsu-converter/anchors/replacements](../../../../../modules/src/arsu-converter/anchors/replacements.md)
<!-- node: document:src/arsu-converter/anchors/replacements/SOURCE-002.md -->

academic-pipeline 的 SOURCE-002 替换契约：是所有文献阅读消费方在拿到 sources.yaml 投影与 handoff 解析语料后共同遵循的契约；只读载荷保留引用键、标题、作者、日期、来源指针、纳入状态与信任元数据，消费方不得改写载荷、来源契约或归属 handoff。
源码：[src/arsu-converter/anchors/replacements/SOURCE-002.md](../../../../../../../src/arsu-converter/anchors/replacements/SOURCE-002.md)

## 相关

| 节点 | 路径 | 摘要 |
| --- | --- | --- |
| [contract-anchors.json](../contract-anchors.json.md) | src/arsu-converter/anchors/contract-anchors.json | ARSU 契约锚点 SSOT：按 id 记录上游 anchor 的名称、源路径、所属技能、契约类别、severity 与匹配提示（标题与代码片段），绑定到已审计 commit。 |
| [SOURCE-003.md](SOURCE-003.md.md) | src/arsu-converter/anchors/replacements/SOURCE-003.md | deep-research 的 SOURCE-003 替换契约：把只读 literature_corpus[] 投影交给 Bibliography Agent，并按已确认来源策略分派 Zotero 与外部检索（adapter-native、protocol-multi-source、external-first、library-bound），强调 ProviderRetrievalHandoff 只是工作证据、ManagedLibraryAuthorization 之外只允许候选级采集。 |
